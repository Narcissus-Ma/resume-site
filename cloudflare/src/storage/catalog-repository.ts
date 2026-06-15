import type { CatalogEnvelope } from '../catalogs/types';

export interface CatalogRepository<TCatalog> {
  read(): Promise<CatalogEnvelope<TCatalog>>;
  initialize(catalog: TCatalog, force?: boolean): Promise<CatalogEnvelope<TCatalog>>;
  write(expectedRevision: number, catalog: TCatalog): Promise<CatalogEnvelope<TCatalog>>;
}
