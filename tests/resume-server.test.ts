import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { afterEach } from 'node:test';

import { format, resolveConfig } from 'prettier';

import { createServer } from '../src/server/create-server.ts';
import {
  FileResumeCatalogRepository,
  type ResumeCatalogRepository,
} from '../src/server/resume-catalog-repository.ts';
import type { ResumeCatalog, ResumeData } from '../src/types/resume.ts';

const createResumeData = (title: string): ResumeData => ({
  basicInfo: { title, skills: [], skillDescriptions: [] },
  experience: [],
  projects: [],
  education: [],
  website: [],
});

const createCatalog = (): ResumeCatalog => ({
  schemaVersion: 1,
  activeResumeId: 'frontend',
  resumes: [
    {
      id: 'frontend',
      name: '前端开发',
      contents: {
        'zh-CN': createResumeData('前端开发工程师'),
        'en-US': createResumeData('Frontend Developer'),
        'ja-JP': createResumeData('フロントエンドエンジニア'),
      },
    },
  ],
});

class MemoryResumeCatalogRepository implements ResumeCatalogRepository {
  catalog = createCatalog();

  async read(): Promise<ResumeCatalog> {
    return structuredClone(this.catalog);
  }

  async write(catalog: ResumeCatalog): Promise<void> {
    this.catalog = structuredClone(catalog);
  }
}

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

const startServer = async () => {
  const repository = new MemoryResumeCatalogRepository();
  const app = createServer({
    repository,
    createId: () => 'backend',
  });
  const server = app.listen(0);
  servers.push(server);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('测试服务器地址无效');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    repository,
  };
};

test('GET 返回完整简历目录', async () => {
  const { baseUrl } = await startServer();
  const response = await fetch(`${baseUrl}/api/resume-catalog`);
  const catalog = (await response.json()) as ResumeCatalog;

  assert.equal(response.status, 200);
  assert.equal(catalog.activeResumeId, 'frontend');
});

test('PUT content 更新指定岗位和语言', async () => {
  const { baseUrl, repository } = await startServer();
  const content = createResumeData('高级前端开发工程师');
  const response = await fetch(`${baseUrl}/api/resume-catalog/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: 'frontend', language: 'zh-CN', content }),
  });

  assert.equal(response.status, 200);
  assert.equal(
    repository.catalog.resumes[0].contents['zh-CN'].basicInfo.title,
    '高级前端开发工程师',
  );
});

test('POST resumes 支持复制三种语言', async () => {
  const { baseUrl, repository } = await startServer();
  const response = await fetch(`${baseUrl}/api/resume-catalog/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '后端开发',
      mode: 'copy',
      sourceResumeId: 'frontend',
    }),
  });
  const result = (await response.json()) as { resumeId: string };

  assert.equal(response.status, 201);
  assert.equal(result.resumeId, 'backend');
  assert.equal(
    repository.catalog.resumes[1].contents['en-US'].basicInfo.title,
    'Frontend Developer',
  );
});

test('PATCH 重命名岗位并允许设置为启用岗位', async () => {
  const { baseUrl, repository } = await startServer();
  repository.catalog.resumes.push({
    id: 'backend',
    name: '后端开发',
    contents: structuredClone(repository.catalog.resumes[0].contents),
  });

  const renameResponse = await fetch(`${baseUrl}/api/resume-catalog/resumes/backend`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Node.js 后端开发' }),
  });
  const activeResponse = await fetch(`${baseUrl}/api/resume-catalog/active`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: 'backend' }),
  });

  assert.equal(renameResponse.status, 200);
  assert.equal(activeResponse.status, 200);
  assert.equal(repository.catalog.resumes[1].name, 'Node.js 后端开发');
  assert.equal(repository.catalog.activeResumeId, 'backend');
});

test('DELETE 拒绝删除启用岗位并返回统一错误', async () => {
  const { baseUrl } = await startServer();
  const response = await fetch(`${baseUrl}/api/resume-catalog/resumes/frontend`, {
    method: 'DELETE',
  });
  const payload = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, 'RESUME_IS_ACTIVE');
  assert.equal(payload.error.message, '不能删除当前启用岗位');
});

test('文件仓库写入结果符合项目 Prettier 格式', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'resume-catalog-'));
  const filePath = path.join(directory, 'resume-catalog.json');
  const repository = new FileResumeCatalogRepository(filePath);
  const catalog = createCatalog();

  try {
    await repository.write(catalog);
    const actual = await readFile(filePath, 'utf8');
    const prettierConfig = await resolveConfig(
      path.join(process.cwd(), 'src/data/resume-catalog.json'),
    );
    const expected = await format(JSON.stringify(catalog), {
      ...prettierConfig,
      parser: 'json',
    });

    assert.equal(actual, expected);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
