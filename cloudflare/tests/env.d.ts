import type { Env } from '../src/env';

declare module 'cloudflare:test' {
  // Cloudflare 测试运行时通过空接口合并注入绑定类型。
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends Env {}
}
