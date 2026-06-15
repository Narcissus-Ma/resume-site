import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('Worker CORS', () => {
  it('允许白名单来源并返回 Vary Origin', async () => {
    const response = await SELF.fetch('https://api.example.com/api/health', {
      headers: { Origin: 'http://localhost:3000' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    expect(response.headers.get('Vary')).toContain('Origin');
  });

  it('拒绝非白名单来源', async () => {
    const response = await SELF.fetch('https://api.example.com/api/health', {
      headers: { Origin: 'https://attacker.example.com' },
    });
    const payload = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(403);
    expect(payload.error.code).toBe('ORIGIN_NOT_ALLOWED');
  });

  it('处理预检请求且不使用通配符来源', async () => {
    const response = await SELF.fetch('https://api.example.com/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });
});
