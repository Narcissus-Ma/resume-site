export interface Env {
  CATALOG_KV: KVNamespace;
  ALLOWED_ORIGINS: string;
  TOKEN_TTL_SECONDS: string;
  LOGIN_FAILURE_LIMIT: string;
  LOGIN_COOLDOWN_SECONDS: string;
  ADMIN_PASSWORD_HASH: string;
  AUTH_SIGNING_SECRET: string;
  AUTH_RATE_LIMIT_SALT: string;
}
