import type { HomeCatalog, HomeData, HomeLanguage } from '../types';

interface HomeApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

interface UpdateHomeContentRequest {
  homeId: string;
  language: HomeLanguage;
  content: HomeData;
}

interface CreateHomeRequest {
  name: string;
  mode: 'empty' | 'copy';
  sourceHomeId?: string;
}

export class HomeApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = 'HomeApiError';
    this.code = code;
    this.status = status;
  }
}

export const createHomeApi = ({ baseUrl, fetcher = fetch }: HomeApiOptions) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const request = async <T>(pathname: string, init?: RequestInit): Promise<T> => {
    let response: Response;
    try {
      response = await fetcher(`${normalizedBaseUrl}${pathname}`, init);
    } catch {
      throw new HomeApiError('NETWORK_ERROR', '无法连接主页管理服务');
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: { code?: string; message?: string };
      } | null;
      throw new HomeApiError(
        payload?.error?.code ?? 'REQUEST_FAILED',
        payload?.error?.message ?? '主页管理请求失败',
        response.status,
      );
    }
    return (await response.json()) as T;
  };

  return {
    getCatalog: () => request<HomeCatalog>('/api/home-catalog'),
    updateContent: (payload: UpdateHomeContentRequest) =>
      request<HomeCatalog>('/api/home-catalog/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    createHome: (payload: CreateHomeRequest) =>
      request<{ catalog: HomeCatalog; homeId: string }>('/api/home-catalog/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    renameHome: (homeId: string, name: string) =>
      request<HomeCatalog>(`/api/home-catalog/homes/${encodeURIComponent(homeId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    deleteHome: (homeId: string) =>
      request<HomeCatalog>(`/api/home-catalog/homes/${encodeURIComponent(homeId)}`, {
        method: 'DELETE',
      }),
    setActiveHome: (homeId: string) =>
      request<HomeCatalog>('/api/home-catalog/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeId }),
      }),
  };
};

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:3001';
export const homeApi = createHomeApi({ baseUrl: apiBaseUrl });
