/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCAN_ENABLED?: string;
  readonly VITE_RESUME_API_BASE_URL?: string;
  readonly VITE_PUBLIC_API_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
