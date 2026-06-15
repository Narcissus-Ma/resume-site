interface ApiClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export class ApiClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const createApiClient = ({
  baseUrl,
  fetcher = fetch,
  getToken = () => null,
  onUnauthorized,
}: ApiClientOptions) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  return {
    async request<T>(pathname: string, options: ApiRequestOptions = {}): Promise<T> {
      const { authenticated, ...init } = options;
      const headers = new Headers(init.headers);
      if (init.body && !headers.has('Content-Type'))
        headers.set('Content-Type', 'application/json');
      if (authenticated) {
        const token = getToken();
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }

      let response: Response;
      try {
        response = await fetcher(`${normalizedBaseUrl}${pathname}`, { ...init, headers });
      } catch {
        throw new ApiClientError('NETWORK_ERROR', '无法连接管理服务');
      }

      if (!response.ok) {
        if (response.status === 401) onUnauthorized?.();
        const payload = (await response.json().catch(() => null)) as {
          error?: { code?: string; message?: string };
        } | null;
        throw new ApiClientError(
          payload?.error?.code ?? 'REQUEST_FAILED',
          payload?.error?.message ?? '请求失败',
          response.status,
        );
      }
      return (await response.json()) as T;
    },
  };
};
