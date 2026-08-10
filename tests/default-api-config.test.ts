import assert from 'node:assert/strict';
import test from 'node:test';

import { appConfig } from '../src/config/app-config.ts';

test('所有 API 默认实例统一使用应用配置的基础地址', async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls: string[] = [];
  globalThis.fetch = async (input) => {
    requestedUrls.push(String(input));
    return Response.json({});
  };

  try {
    const [{ adminAuthApi }, { homeApi }, { publicCatalogApi }, { resumeApi }] =
      await Promise.all([
        import('../src/services/admin-auth-api.ts'),
        import('../src/services/home-api.ts'),
        import('../src/services/public-catalog-api.ts'),
        import('../src/services/resume-api.ts'),
      ]);

    await adminAuthApi.login('管理员密码');
    await homeApi.getCatalog();
    await publicCatalogApi.getHome();
    await resumeApi.getCatalog();

    assert.deepEqual(requestedUrls, [
      `${appConfig.apiBaseUrl}/api/auth/login`,
      `${appConfig.apiBaseUrl}/api/home-catalog`,
      `${appConfig.apiBaseUrl}/api/public/home`,
      `${appConfig.apiBaseUrl}/api/resume-catalog`,
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
