import type { CatalogEnvelope, CatalogResponse, HomeCatalog, ResumeCatalog } from './types';
import type { CatalogRepository } from '../storage/catalog-repository';

export class CatalogService<TCatalog extends HomeCatalog | ResumeCatalog> {
  constructor(private readonly repository: CatalogRepository<TCatalog>) {}

  read(): Promise<CatalogEnvelope<TCatalog>> {
    return this.repository.read();
  }

  async update(
    revision: number,
    mutate: (catalog: TCatalog) => TCatalog,
  ): Promise<CatalogResponse<TCatalog>> {
    const current = await this.repository.read();
    const updated = await this.repository.write(revision, mutate(current.catalog));
    return {
      revision: updated.revision,
      catalog: updated.catalog,
    };
  }
}
