import { getBrowserAdminToken, invalidateBrowserAdminSession } from '@/auth/admin-session';

import type { CreateHomeResponse, HomeCatalogResponse, HomeData, HomeLanguage } from '../types';
import { ApiClientError, createApiClient } from './api-client';

interface HomeApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

interface UpdateHomeContentRequest {
  revision: number;
  homeId: string;
  language: HomeLanguage;
  content: HomeData;
}

interface CreateHomeRequest {
  revision: number;
  name: string;
  mode: 'empty' | 'copy';
  sourceHomeId?: string;
}

export class HomeApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = 'HomeApiError';
  }
}

export const createHomeApi = ({ baseUrl, fetcher, getToken, onUnauthorized }: HomeApiOptions) => {
  const client = createApiClient({ baseUrl, fetcher, getToken, onUnauthorized });
  const request = async <T>(pathname: string, init?: RequestInit): Promise<T> => {
    try {
      return await client.request<T>(pathname, { ...init, authenticated: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new HomeApiError(
          error.code,
          error.code === 'NETWORK_ERROR' ? '无法连接主页管理服务' : error.message,
          error.status,
        );
      }
      throw error;
    }
  };

  return {
    getCatalog: () => request<HomeCatalogResponse>('/api/home-catalog'),
    updateContent: (payload: UpdateHomeContentRequest) =>
      request<HomeCatalogResponse>('/api/home-catalog/content', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    createHome: (payload: CreateHomeRequest) =>
      request<CreateHomeResponse>('/api/home-catalog/homes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    renameHome: (homeId: string, name: string, revision: number) =>
      request<HomeCatalogResponse>(`/api/home-catalog/homes/${encodeURIComponent(homeId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, revision }),
      }),
    deleteHome: (homeId: string, revision: number) =>
      request<HomeCatalogResponse>(`/api/home-catalog/homes/${encodeURIComponent(homeId)}`, {
        method: 'DELETE',
        body: JSON.stringify({ revision }),
      }),
    setActiveHome: (homeId: string, revision: number) =>
      request<HomeCatalogResponse>('/api/home-catalog/active', {
        method: 'PUT',
        body: JSON.stringify({ homeId, revision }),
      }),
  };
};

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:8787';
export const homeApi = createHomeApi({
  baseUrl: apiBaseUrl,
  getToken: getBrowserAdminToken,
  onUnauthorized: invalidateBrowserAdminSession,
});
