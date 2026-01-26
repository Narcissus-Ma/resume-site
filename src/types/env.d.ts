/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCAN_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}