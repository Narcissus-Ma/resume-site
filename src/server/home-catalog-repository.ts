import { randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { format, resolveConfig } from 'prettier';

import { validateHomeCatalog } from '../domain/home/rules/home-catalog';
import type { HomeCatalog } from '../types';

export interface HomeCatalogRepository {
  read(): Promise<HomeCatalog>;
  write(catalog: HomeCatalog): Promise<void>;
}

export class FileHomeCatalogRepository implements HomeCatalogRepository {
  constructor(private readonly filePath: string) {}

  async read(): Promise<HomeCatalog> {
    const catalog = JSON.parse(await readFile(this.filePath, 'utf8')) as HomeCatalog;
    validateHomeCatalog(catalog);
    return catalog;
  }

  async write(catalog: HomeCatalog): Promise<void> {
    validateHomeCatalog(catalog);
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    const config = await resolveConfig(path.join(process.cwd(), 'package.json'));
    const content = await format(JSON.stringify(catalog), { ...config, parser: 'json' });

    try {
      await writeFile(temporaryPath, content, 'utf8');
      await rename(temporaryPath, this.filePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }
}
