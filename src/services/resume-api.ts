import { getBrowserAdminToken, invalidateBrowserAdminSession } from '@/auth/admin-session';

import { ApiClientError, createApiClient } from './api-client';
import type {
  CreateResumeResponse,
  ResumeCatalogResponse,
  ResumeData,
  ResumeLanguage,
} from '../types/resume';

interface ResumeApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

interface UpdateResumeContentRequest {
  revision: number;
  resumeId: string;
  language: ResumeLanguage;
  content: ResumeData;
}

interface CreateResumeRequest {
  revision: number;
  name: string;
  mode: 'empty' | 'copy';
  sourceResumeId?: string;
}

export class ResumeApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = 'ResumeApiError';
  }
}

export const createResumeApi = ({
  baseUrl,
  fetcher,
  getToken,
  onUnauthorized,
}: ResumeApiOptions) => {
  const client = createApiClient({ baseUrl, fetcher, getToken, onUnauthorized });
  const request = async <T>(pathname: string, init?: RequestInit): Promise<T> => {
    try {
      return await client.request<T>(pathname, { ...init, authenticated: true });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw new ResumeApiError(
          error.code,
          error.code === 'NETWORK_ERROR' ? '无法连接简历管理服务' : error.message,
          error.status,
        );
      }
      throw error;
    }
  };

  return {
    getCatalog: () => request<ResumeCatalogResponse>('/api/resume-catalog'),
    updateContent: (payload: UpdateResumeContentRequest) =>
      request<ResumeCatalogResponse>('/api/resume-catalog/content', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    createResume: (payload: CreateResumeRequest) =>
      request<CreateResumeResponse>('/api/resume-catalog/resumes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    renameResume: (resumeId: string, name: string, revision: number) =>
      request<ResumeCatalogResponse>(
        `/api/resume-catalog/resumes/${encodeURIComponent(resumeId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ name, revision }),
        },
      ),
    deleteResume: (resumeId: string, revision: number) =>
      request<ResumeCatalogResponse>(
        `/api/resume-catalog/resumes/${encodeURIComponent(resumeId)}`,
        {
          method: 'DELETE',
          body: JSON.stringify({ revision }),
        },
      ),
    setActiveResume: (resumeId: string, revision: number) =>
      request<ResumeCatalogResponse>('/api/resume-catalog/active', {
        method: 'PUT',
        body: JSON.stringify({ resumeId, revision }),
      }),
  };
};

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:8787';
export const resumeApi = createResumeApi({
  baseUrl: apiBaseUrl,
  getToken: getBrowserAdminToken,
  onUnauthorized: invalidateBrowserAdminSession,
});
