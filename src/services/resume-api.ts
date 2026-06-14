import type {
  ResumeApiErrorPayload,
  ResumeCatalog,
  ResumeData,
  ResumeLanguage,
} from '../types/resume';

interface ResumeApiOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
}

interface UpdateResumeContentRequest {
  resumeId: string;
  language: ResumeLanguage;
  content: ResumeData;
}

interface CreateResumeRequest {
  name: string;
  mode: 'empty' | 'copy';
  sourceResumeId?: string;
}

interface CreateResumeResponse {
  catalog: ResumeCatalog;
  resumeId: string;
}

export class ResumeApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 0) {
    super(message);
    this.name = 'ResumeApiError';
    this.code = code;
    this.status = status;
  }
}

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

export const createResumeApi = ({ baseUrl, fetcher = fetch }: ResumeApiOptions) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  const request = async <T>(pathname: string, init?: RequestInit): Promise<T> => {
    let response: Response;

    try {
      response = await fetcher(`${normalizedBaseUrl}${pathname}`, init);
    } catch {
      throw new ResumeApiError('NETWORK_ERROR', '无法连接简历管理服务');
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ResumeApiErrorPayload | null;
      throw new ResumeApiError(
        payload?.error.code ?? 'REQUEST_FAILED',
        payload?.error.message ?? '简历管理请求失败',
        response.status,
      );
    }

    return (await response.json()) as T;
  };

  return {
    getCatalog: () => request<ResumeCatalog>('/api/resume-catalog'),
    updateContent: (payload: UpdateResumeContentRequest) =>
      request<ResumeCatalog>('/api/resume-catalog/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    createResume: (payload: CreateResumeRequest) =>
      request<CreateResumeResponse>('/api/resume-catalog/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    renameResume: (resumeId: string, name: string) =>
      request<ResumeCatalog>(`/api/resume-catalog/resumes/${encodeURIComponent(resumeId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }),
    deleteResume: (resumeId: string) =>
      request<ResumeCatalog>(`/api/resume-catalog/resumes/${encodeURIComponent(resumeId)}`, {
        method: 'DELETE',
      }),
    setActiveResume: (resumeId: string) =>
      request<ResumeCatalog>('/api/resume-catalog/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      }),
  };
};

const apiBaseUrl = import.meta.env?.VITE_RESUME_API_BASE_URL ?? 'http://localhost:3001';

export const resumeApi = createResumeApi({ baseUrl: apiBaseUrl });
