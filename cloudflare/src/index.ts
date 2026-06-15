import type { Env } from './env';
import { appendCorsHeaders, handleCors } from './http/cors';
import { HomeCatalogError } from './catalogs/home-catalog';
import { ResumeCatalogError } from './catalogs/resume-catalog';
import { HttpError } from './http/errors';
import { errorResponse } from './http/json';
import { routeRequest } from './router';
import { CatalogRepositoryError } from './storage/kv-catalog-repository';

const getDomainStatus = (code: string): number => {
  if (code.endsWith('_NOT_FOUND')) return 404;
  if (code.includes('DUPLICATE') || code.includes('IS_ACTIVE') || code.startsWith('LAST_')) {
    return 409;
  }
  return 400;
};

const worker: ExportedHandler<Env> = {
  async fetch(request, env) {
    const cors = handleCors(request, env.ALLOWED_ORIGINS);
    if (cors.response) return cors.response;

    let response: Response;
    try {
      response = await routeRequest(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        response = errorResponse(error.status, error.code, error.message);
      } else if (error instanceof HomeCatalogError || error instanceof ResumeCatalogError) {
        response = errorResponse(getDomainStatus(error.code), error.code, error.message);
      } else if (error instanceof CatalogRepositoryError) {
        const status =
          error.code === 'CATALOG_VERSION_CONFLICT'
            ? 409
            : error.code === 'CATALOG_NOT_INITIALIZED'
              ? 503
              : 500;
        response = errorResponse(status, error.code, error.message);
      } else {
        console.error('Worker 请求处理失败', error instanceof Error ? error.message : error);
        response = errorResponse(500, 'INTERNAL_SERVER_ERROR', '服务端处理请求失败');
      }
    }

    return appendCorsHeaders(response, cors.headers);
  },
};

export default worker;
