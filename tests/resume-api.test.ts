import assert from 'node:assert/strict';
import test from 'node:test';

import { createResumeApi, ResumeApiError } from '../src/services/resume-api.ts';
import type { ResumeCatalog } from '../src/types/resume.ts';

const catalog: ResumeCatalog = {
  schemaVersion: 1,
  activeResumeId: 'frontend',
  resumes: [],
};

test('API 客户端发送正确的内容更新请求', async () => {
  let requestedUrl = '';
  let requestedInit: RequestInit | undefined;
  const api = createResumeApi({
    baseUrl: 'https://resume-api.example.com/',
    fetcher: async (input, init) => {
      requestedUrl = String(input);
      requestedInit = init;
      return Response.json(catalog);
    },
  });

  const result = await api.updateContent({
    resumeId: 'frontend',
    language: 'zh-CN',
    content: {
      basicInfo: { title: '前端开发工程师', skills: [], skillDescriptions: [] },
      experience: [],
      projects: [],
      education: [],
      website: [],
    },
  });

  assert.equal(requestedUrl, 'https://resume-api.example.com/api/resume-catalog/content');
  assert.equal(requestedInit?.method, 'PUT');
  assert.deepEqual(result, catalog);
});

test('非成功响应转换为统一 API 错误', async () => {
  const api = createResumeApi({
    baseUrl: 'http://localhost:3001',
    fetcher: async () =>
      Response.json(
        { error: { code: 'RESUME_IS_ACTIVE', message: '不能删除当前启用岗位' } },
        { status: 409 },
      ),
  });

  await assert.rejects(
    () => api.deleteResume('frontend'),
    (error: unknown) =>
      error instanceof ResumeApiError &&
      error.status === 409 &&
      error.code === 'RESUME_IS_ACTIVE' &&
      error.message === '不能删除当前启用岗位',
  );
});

test('网络错误转换为可展示的中文错误', async () => {
  const api = createResumeApi({
    baseUrl: 'http://localhost:3001',
    fetcher: async () => {
      throw new TypeError('fetch failed');
    },
  });

  await assert.rejects(
    () => api.getCatalog(),
    (error: unknown) =>
      error instanceof ResumeApiError &&
      error.code === 'NETWORK_ERROR' &&
      error.message === '无法连接简历管理服务',
  );
});
