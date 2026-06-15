import type { AdminSession } from '@/auth/admin-session';

import { ApiClientError, createApiClient } from './api-client';

interface AdminAuthApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

export class AdminAuthApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = 'AdminAuthApiError';
  }
}

export const createAdminAuthApi = ({ baseUrl, fetcher }: AdminAuthApiOptions) => {
  const client = createApiClient({ baseUrl, fetcher });
  return {
    async login(password: string): Promise<AdminSession> {
      try {
        return await client.request<AdminSession>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ password }),
        });
      } catch (error) {
        if (error instanceof ApiClientError) {
          throw new AdminAuthApiError(error.code, error.message, error.status);
        }
        throw error;
      }
    },
  };
};

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:8787';
export const adminAuthApi = createAdminAuthApi({ baseUrl: apiBaseUrl });
