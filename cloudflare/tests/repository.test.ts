import { env } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { validateHomeCatalog } from '../src/catalogs/home-catalog';
import type { HomeCatalog, HomeData } from '../src/catalogs/types';
import { CatalogRepositoryError, KvCatalogRepository } from '../src/storage/kv-catalog-repository';

const key = 'test:catalog:home';

const createHomeData = (occupation: string): HomeData => ({
  occupation,
  description: `${occupation}简介`,
  skillSectionDescription: `${occupation}技能简介`,
  skillHighlights: [],
  skills: [],
  experiences: [],
  projects: [],
});

const createCatalog = (): HomeCatalog => ({
  schemaVersion: 1,
  activeHomeId: 'frontend',
  homes: [
    {
      id: 'frontend',
      name: '前端开发',
      contents: {
        'zh-CN': createHomeData('前端工程师'),
        'en-US': createHomeData('Frontend Engineer'),
        'ja-JP': createHomeData('フロントエンドエンジニア'),
      },
    },
  ],
});

const createRepository = () =>
  new KvCatalogRepository<HomeCatalog>({
    namespace: env.CATALOG_KV,
    key,
    validate: validateHomeCatalog,
    now: () => new Date('2026-06-15T10:00:00.000Z'),
  });

describe('KV 目录仓库', () => {
  beforeEach(async () => {
    await env.CATALOG_KV.delete(key);
  });

  it('目录未初始化时返回明确错误', async () => {
    await expect(createRepository().read()).rejects.toEqual(
      expect.objectContaining({ code: 'CATALOG_NOT_INITIALIZED' }),
    );
  });

  it('初始化写入 revision 和更新时间并默认拒绝覆盖', async () => {
    const repository = createRepository();
    const initialized = await repository.initialize(createCatalog());

    expect(initialized.revision).toBe(1);
    expect(initialized.updatedAt).toBe('2026-06-15T10:00:00.000Z');
    await expect(repository.initialize(createCatalog())).rejects.toEqual(
      expect.objectContaining({ code: 'CATALOG_ALREADY_INITIALIZED' }),
    );
  });

  it('显式 force 时允许重新初始化', async () => {
    const repository = createRepository();
    await repository.initialize(createCatalog());
    const replacement = createCatalog();
    replacement.homes[0].name = '新的前端岗位';

    const initialized = await repository.initialize(replacement, true);

    expect(initialized.revision).toBe(1);
    expect(initialized.catalog.homes[0].name).toBe('新的前端岗位');
  });

  it('成功更新时 revision 递增', async () => {
    const repository = createRepository();
    await repository.initialize(createCatalog());
    const nextCatalog = createCatalog();
    nextCatalog.homes[0].name = '高级前端开发';

    const updated = await repository.write(1, nextCatalog);

    expect(updated.revision).toBe(2);
    expect((await repository.read()).catalog.homes[0].name).toBe('高级前端开发');
  });

  it('旧 revision 写入返回冲突且不覆盖数据', async () => {
    const repository = createRepository();
    await repository.initialize(createCatalog());
    await repository.write(1, createCatalog());

    await expect(repository.write(1, createCatalog())).rejects.toEqual(
      expect.objectContaining({ code: 'CATALOG_VERSION_CONFLICT' }),
    );
    expect((await repository.read()).revision).toBe(2);
  });

  it('拒绝非法目录和非法 KV JSON', async () => {
    const repository = createRepository();
    const invalidCatalog = createCatalog() as unknown as Record<string, unknown>;
    invalidCatalog.homes = [];

    await expect(
      repository.initialize(invalidCatalog as unknown as HomeCatalog),
    ).rejects.toBeInstanceOf(Error);

    await env.CATALOG_KV.put(key, '{');
    await expect(repository.read()).rejects.toBeInstanceOf(CatalogRepositoryError);
  });
});
