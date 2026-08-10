import assert from 'node:assert/strict';
import test from 'node:test';

import { createAppConfig } from '../src/config/app-config.ts';

test('未配置 API 地址时使用本地 Worker 默认地址', () => {
  assert.equal(createAppConfig(undefined).apiBaseUrl, 'http://localhost:8787');
});

test('环境变量可以覆盖 API 默认地址', () => {
  const config = createAppConfig({
    VITE_RESUME_API_BASE_URL: 'http://localhost:9000',
  });

  assert.equal(config.apiBaseUrl, 'http://localhost:9000');
});
