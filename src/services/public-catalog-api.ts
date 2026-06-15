interface PublicCatalogApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

export const createPublicCatalogApi = ({
  baseUrl,
  fetcher = fetch,
  timeoutMs = 1500,
}: PublicCatalogApiOptions) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  const request = async (pathname: string): Promise<unknown> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(`${normalizedBaseUrl}${pathname}`, {
        signal: controller.signal,
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
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

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:8787';
const configuredTimeout = Number(import.meta.env?.VITE_PUBLIC_API_TIMEOUT_MS);

export const publicCatalogApi = createPublicCatalogApi({
  baseUrl: apiBaseUrl,
  timeoutMs: Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 1500,
});
