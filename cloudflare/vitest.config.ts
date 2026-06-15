import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: {
          configPath: './wrangler.jsonc',
        },
        miniflare: {
          bindings: {
            ADMIN_PASSWORD_HASH:
              'pbkdf2-sha256$10000$CAcGBQQDAgE$97lqqQlsIfxgOBhkKegY0ecz3c4NLSB3EZkpVYBNr8g',
            AUTH_SIGNING_SECRET: '测试签名密钥，长度足够且不会用于生产',
            AUTH_RATE_LIMIT_SALT: '测试限流盐，长度足够且不会用于生产',
          },
        },
      },
    },
  },
});
