import { appConfig } from '@/config/app-config';

const DEFAULT_TIMEOUT_MS = 10_000;

interface PublicCatalogApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

interface PublicCatalogFailure {
  category: 'timeout' | 'http_error' | 'network_error' | 'invalid_json';
  elapsedMs: number;
  pathname: string;
  status?: number;
}

const logPublicCatalogFailure = (failure: PublicCatalogFailure): void => {
  console.warn('公开目录请求失败', failure);
};

export const createPublicCatalogApi = ({
  baseUrl,
  fetcher = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: PublicCatalogApiOptions) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const request = async (pathname: string): Promise<unknown> => {
    const controller = new AbortController();
    const startedAt = performance.now();
    let timedOut = false;
    const logFailure = (category: PublicCatalogFailure['category'], status?: number): void => {
      const failure: PublicCatalogFailure = {
        category,
        elapsedMs: Math.max(0, Math.round(performance.now() - startedAt)),
        pathname,
      };
      if (status !== undefined) failure.status = status;
      logPublicCatalogFailure(failure);
    };
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      const response = await fetcher(`${normalizedBaseUrl}${pathname}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        logFailure('http_error', response.status);
        return null;
      }
      try {
        return await response.json();
      } catch {
        logFailure(timedOut ? 'timeout' : 'invalid_json');
        return null;
      }
    } catch {
      logFailure(timedOut ? 'timeout' : 'network_error');
      return null;
    } finally {
      clearTimeout(timeout);
    }
  };

  return {
    getHome: () => request('/api/public/home'),
    getResume: () => request('/api/public/resume'),
  };
};

const configuredTimeout = Number(import.meta.env?.VITE_PUBLIC_API_TIMEOUT_MS);

export const publicCatalogApi = createPublicCatalogApi({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs:
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : DEFAULT_TIMEOUT_MS,
});
