import type { CatalogEnvelope } from '../catalogs/types';

import type { CatalogRepository } from './catalog-repository';

export type CatalogRepositoryErrorCode =
  | 'CATALOG_ALREADY_INITIALIZED'
  | 'CATALOG_NOT_INITIALIZED'
  | 'CATALOG_STORAGE_INVALID'
  | 'CATALOG_VERSION_CONFLICT';

export class CatalogRepositoryError extends Error {
  constructor(
    readonly code: CatalogRepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CatalogRepositoryError';
  }
}

type CatalogValidator<TCatalog> = (value: unknown) => asserts value is TCatalog;

interface KvCatalogRepositoryOptions<TCatalog> {
  namespace: KVNamespace;
  key: string;
  validate: CatalogValidator<TCatalog>;
  now?: () => Date;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export class KvCatalogRepository<TCatalog> implements CatalogRepository<TCatalog> {
  private readonly namespace: KVNamespace;
  private readonly key: string;
  private readonly validateCatalog: CatalogValidator<TCatalog>;
  private readonly now: () => Date;

  constructor(options: KvCatalogRepositoryOptions<TCatalog>) {
    this.namespace = options.namespace;
    this.key = options.key;
    this.validateCatalog = options.validate;
    this.now = options.now ?? (() => new Date());
  }

  async read(): Promise<CatalogEnvelope<TCatalog>> {
    const serialized = await this.namespace.get(this.key);
    if (serialized === null) {
      throw new CatalogRepositoryError('CATALOG_NOT_INITIALIZED', '目录数据尚未初始化');
    }

    let value: unknown;
    try {
      value = JSON.parse(serialized);
    } catch {
      throw new CatalogRepositoryError('CATALOG_STORAGE_INVALID', '目录存储数据无法解析');
    }

    if (
      !isRecord(value) ||
      !Number.isSafeInteger(value.revision) ||
      (value.revision as number) < 1 ||
      typeof value.updatedAt !== 'string' ||
      Number.isNaN(Date.parse(value.updatedAt))
    ) {
      throw new CatalogRepositoryError('CATALOG_STORAGE_INVALID', '目录存储信封格式无效');
    }

    try {
      this.validateCatalog(value.catalog);
    } catch {
      throw new CatalogRepositoryError('CATALOG_STORAGE_INVALID', '目录存储内容格式无效');
    }

    return {
      revision: value.revision as number,
      updatedAt: value.updatedAt,
      catalog: value.catalog,
    };
  }

  async initialize(catalog: TCatalog, force = false): Promise<CatalogEnvelope<TCatalog>> {
    this.validateCatalog(catalog);

    if (!force && (await this.namespace.get(this.key)) !== null) {
      throw new CatalogRepositoryError('CATALOG_ALREADY_INITIALIZED', '目录数据已经初始化');
    }

    const envelope = this.createEnvelope(1, catalog);
    await this.namespace.put(this.key, JSON.stringify(envelope));
    return envelope;
  }

  async write(expectedRevision: number, catalog: TCatalog): Promise<CatalogEnvelope<TCatalog>> {
    this.validateCatalog(catalog);
    const current = await this.read();

    if (current.revision !== expectedRevision) {
      throw new CatalogRepositoryError(
        'CATALOG_VERSION_CONFLICT',
        '数据已在其他页面更新，请刷新后重试',
      );
    }

    const envelope = this.createEnvelope(current.revision + 1, catalog);
    await this.namespace.put(this.key, JSON.stringify(envelope));
    return envelope;
  }

  private createEnvelope(revision: number, catalog: TCatalog): CatalogEnvelope<TCatalog> {
    return {
      revision,
      updatedAt: this.now().toISOString(),
      catalog: structuredClone(catalog),
    };
  }
}
