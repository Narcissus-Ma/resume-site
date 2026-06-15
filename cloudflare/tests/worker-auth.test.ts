import { env, SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Worker 管理员登录', () => {
  beforeEach(async () => {
    const keys = await env.CATALOG_KV.list({ prefix: 'auth:failure:' });
    await Promise.all(keys.keys.map(({ name }) => env.CATALOG_KV.delete(name)));
  });

  it('正确密码返回短期令牌', async () => {
    const response = await SELF.fetch('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.20',
      },
      body: JSON.stringify({ password: '正确密码' }),
    });
    const payload = (await response.json()) as { token: string; expiresAt: string };

    expect(response.status).toBe(200);
    expect(payload.token.split('.')).toHaveLength(2);
    expect(Date.parse(payload.expiresAt)).toBeGreaterThan(Date.now());
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('错误密码返回统一错误', async () => {
    const response = await SELF.fetch('https://api.example.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '203.0.113.21',
      },
      body: JSON.stringify({ password: '错误密码' }),
    });
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe('INVALID_CREDENTIALS');
  });
});
