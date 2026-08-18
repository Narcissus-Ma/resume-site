import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import { createPublicCatalogApi } from '../src/services/public-catalog-api.ts';

type FailureCategory = 'timeout' | 'http_error' | 'network_error' | 'invalid_json';

const createAbortError = (): DOMException => new DOMException('请求已中止', 'AbortError');

const captureWarnings = (): {
  warnings: unknown[][];
  restore: () => void;
} => {
  const originalWarn = console.warn;
  const warnings: unknown[][] = [];
  console.warn = (...args: unknown[]) => warnings.push(args);
  return {
    warnings,
    restore: () => {
      console.warn = originalWarn;
    },
  };
};

const assertFailureWarning = (
  warning: unknown[],
  category: FailureCategory,
  status?: number,
  pathname = '/api/public/resume',
): void => {
  assert.equal(warning[0], '公开目录请求失败');
  const metadata = warning[1] as Record<string, unknown>;
  assert.deepEqual(
    Object.keys(metadata).sort(),
    status === undefined
      ? ['category', 'elapsedMs', 'pathname']
      : ['category', 'elapsedMs', 'pathname', 'status'],
  );
  assert.equal(metadata.pathname, pathname);
  assert.equal(metadata.category, category);
  assert.equal(typeof metadata.elapsedMs, 'number');
  assert.ok((metadata.elapsedMs as number) >= 0);
  if (status !== undefined) assert.equal(metadata.status, status);
};

test('公开目录客户端默认等待十秒后记录超时诊断', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const { warnings, restore } = captureWarnings();
  try {
    let requestSignal: AbortSignal | undefined;
    const api = createPublicCatalogApi({
      baseUrl: 'https://api.example.com',
      fetcher: async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal?.addEventListener('abort', () => reject(createAbortError()), {
            once: true,
          });
        }),
    });

    const result = api.getResume();
    mock.timers.tick(9_999);
    assert.equal(requestSignal?.aborted, false);
    mock.timers.tick(1);

    assert.equal(await result, null);
    assert.equal(warnings.length, 1);
    assertFailureWarning(warnings[0], 'timeout');
  } finally {
    restore();
    mock.timers.reset();
  }
});

test('默认公开目录客户端在未配置超时时等待十秒', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const originalFetch = globalThis.fetch;
  const { warnings, restore } = captureWarnings();
  try {
    let requestSignal: AbortSignal | undefined;
    globalThis.fetch = async (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        requestSignal = init?.signal ?? undefined;
        requestSignal?.addEventListener('abort', () => reject(createAbortError()), { once: true });
      });
    const moduleUrl = new URL('../src/services/public-catalog-api.ts', import.meta.url);
    const { publicCatalogApi } = await import(`${moduleUrl.href}?test=${Date.now()}`);

    const result = publicCatalogApi.getHome();
    mock.timers.tick(9_999);
    assert.equal(requestSignal?.aborted, false);
    mock.timers.tick(1);

    assert.equal(await result, null);
    assert.equal(warnings.length, 1);
    assertFailureWarning(warnings[0], 'timeout', undefined, '/api/public/home');
  } finally {
    globalThis.fetch = originalFetch;
    restore();
    mock.timers.reset();
  }
});

test('公开目录客户端为失败响应记录 HTTP 状态', async () => {
  const { warnings, restore } = captureWarnings();
  try {
    const api = createPublicCatalogApi({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response(null, { status: 503 }),
    });

    assert.equal(await api.getResume(), null);
    assert.equal(warnings.length, 1);
    assertFailureWarning(warnings[0], 'http_error', 503);
  } finally {
    restore();
  }
});

test('公开目录客户端为网络错误记录安全诊断', async () => {
  const { warnings, restore } = captureWarnings();
  try {
    const api = createPublicCatalogApi({
      baseUrl: 'https://api.example.com',
      fetcher: async () => Promise.reject(new Error('网络不可用')),
    });

    assert.equal(await api.getResume(), null);
    assert.equal(warnings.length, 1);
    assertFailureWarning(warnings[0], 'network_error');
  } finally {
    restore();
  }
});

test('公开目录客户端为无效 JSON 记录安全诊断', async () => {
  const { warnings, restore } = captureWarnings();
  try {
    const api = createPublicCatalogApi({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response('{', { status: 200 }),
    });

    assert.equal(await api.getResume(), null);
    assert.equal(warnings.length, 1);
    assertFailureWarning(warnings[0], 'invalid_json');
  } finally {
    restore();
  }
});
