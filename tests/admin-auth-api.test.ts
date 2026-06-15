import assert from 'node:assert/strict';
import test from 'node:test';

import { createAdminAuthApi } from '../src/services/admin-auth-api.ts';

test('管理员登录发送密码并返回会话', async () => {
  let pathname = '';
  let body = '';
  const api = createAdminAuthApi({
    baseUrl: 'https://api.example.com/',
    fetcher: async (input, init) => {
      pathname = String(input);
      body = String(init?.body);
      return Response.json({
        token: 'token',
        expiresAt: '2026-06-15T12:00:00.000Z',
      });
    },
  });

  const session = await api.login('管理员密码');
  assert.equal(pathname, 'https://api.example.com/api/auth/login');
  assert.deepEqual(JSON.parse(body), { password: '管理员密码' });
  assert.equal(session.token, 'token');
});
