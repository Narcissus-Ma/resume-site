import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiClientError, createApiClient } from '../src/services/api-client.ts';

test('管理请求自动附加令牌并规范化地址', async () => {
  let url = '';
  let authorization = '';
  const client = createApiClient({
    baseUrl: 'https://api.example.com/',
    getToken: () => 'token',
    fetcher: async (input, init) => {
      url = String(input);
      authorization = new Headers(init?.headers).get('Authorization') ?? '';
      return Response.json({ ok: true });
    },
  });
  await client.request('/api/test', { authenticated: true });
  assert.equal(url, 'https://api.example.com/api/test');
  assert.equal(authorization, 'Bearer token');
});

test('401 触发会话失效且转换统一错误', async () => {
  let invalidated = false;
  const client = createApiClient({
    baseUrl: '',
    getToken: () => 'secret-token',
    onUnauthorized: () => {
      invalidated = true;
    },
    fetcher: async () =>
      Response.json({ error: { code: 'INVALID_TOKEN', message: '会话失效' } }, { status: 401 }),
  });
  await assert.rejects(() => client.request('/api/test', { authenticated: true }), ApiClientError);
  assert.equal(invalidated, true);
});
