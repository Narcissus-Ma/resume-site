import { env } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import { LoginRateLimiter } from '../src/auth/rate-limit';

const clientIp = '203.0.113.10';
const salt = '独立的测试限流盐';

describe('登录失败限流', () => {
  beforeEach(async () => {
    const keys = await env.CATALOG_KV.list({ prefix: 'auth:failure:' });
    await Promise.all(keys.keys.map(({ name }) => env.CATALOG_KV.delete(name)));
  });

  it('累计失败并在达到阈值后冷却', async () => {
    const limiter = new LoginRateLimiter(env.CATALOG_KV, {
      limit: 2,
      cooldownSeconds: 60,
      salt,
      now: () => 1_000_000,
    });

    expect(await limiter.isBlocked(clientIp)).toBe(false);
    await limiter.recordFailure(clientIp);
    expect(await limiter.isBlocked(clientIp)).toBe(false);
    await limiter.recordFailure(clientIp);
    expect(await limiter.isBlocked(clientIp)).toBe(true);
  });

  it('登录成功后清除失败记录', async () => {
    const limiter = new LoginRateLimiter(env.CATALOG_KV, {
      limit: 1,
      cooldownSeconds: 60,
      salt,
      now: () => 1_000_000,
    });

    await limiter.recordFailure(clientIp);
    expect(await limiter.isBlocked(clientIp)).toBe(true);
    await limiter.clear(clientIp);
    expect(await limiter.isBlocked(clientIp)).toBe(false);
  });
});
