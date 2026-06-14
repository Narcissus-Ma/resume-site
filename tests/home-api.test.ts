import assert from 'node:assert/strict';
import test from 'node:test';

import { createHomeApi, HomeApiError } from '../src/services/home-api.ts';
import type { HomeCatalog } from '../src/types/index.ts';

const catalog: HomeCatalog = { schemaVersion: 1, activeHomeId: 'frontend', homes: [] };

test('主页 API 客户端发送正确内容更新请求', async () => {
  let url = '';
  let init: RequestInit | undefined;
  const api = createHomeApi({
    baseUrl: 'https://example.com/',
    fetcher: async (input, requestInit) => {
      url = String(input);
      init = requestInit;
      return Response.json(catalog);
    },
  });

  await api.updateContent({
    homeId: 'frontend',
    language: 'zh-CN',
    content: {
      occupation: '',
      description: '',
      skillSectionDescription: '',
      skillHighlights: [],
      skills: [],
      experiences: [],
      projects: [],
    },
  });

  assert.equal(url, 'https://example.com/api/home-catalog/content');
  assert.equal(init?.method, 'PUT');
});

test('主页 API 将失败响应转换为统一错误', async () => {
  const api = createHomeApi({
    baseUrl: '',
    fetcher: async () =>
      Response.json(
        { error: { code: 'HOME_IS_ACTIVE', message: '不能删除当前启用主页岗位' } },
        { status: 409 },
      ),
  });

  await assert.rejects(
    () => api.deleteHome('frontend'),
    (error: unknown) =>
      error instanceof HomeApiError && error.status === 409 && error.code === 'HOME_IS_ACTIVE',
  );
});
