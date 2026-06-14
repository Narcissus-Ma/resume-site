import { randomUUID } from 'node:crypto';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { format, resolveConfig } from 'prettier';

import { validateResumeCatalog } from '../domain/resume/rules/resume-catalog';
import type { ResumeCatalog } from '../types/resume';

export interface ResumeCatalogRepository {
  read(): Promise<ResumeCatalog>;
  write(catalog: ResumeCatalog): Promise<void>;
}

export class FileResumeCatalogRepository implements ResumeCatalogRepository {
  constructor(private readonly filePath: string) {}

  async read(): Promise<ResumeCatalog> {
    const catalog = JSON.parse(await readFile(this.filePath, 'utf8')) as ResumeCatalog;
    validateResumeCatalog(catalog);
    return catalog;
  }

  async write(catalog: ResumeCatalog): Promise<void> {
    validateResumeCatalog(catalog);
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    const prettierConfig = await resolveConfig(path.join(process.cwd(), 'package.json'));
    const serializedCatalog = await format(JSON.stringify(catalog), {
      ...prettierConfig,
      parser: 'json',
    });

    try {
      await writeFile(temporaryPath, serializedCatalog, 'utf8');
      await rename(temporaryPath, this.filePath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }
  }
}
