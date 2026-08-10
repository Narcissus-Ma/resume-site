interface AppRuntimeEnv {
  readonly VITE_RESUME_API_BASE_URL?: string;
}

export interface AppConfig {
  readonly apiBaseUrl: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8787';

export const createAppConfig = (env: AppRuntimeEnv | undefined): AppConfig => ({
  apiBaseUrl: env?.VITE_RESUME_API_BASE_URL ?? DEFAULT_API_BASE_URL,
});

export const appConfig = createAppConfig(import.meta.env);
