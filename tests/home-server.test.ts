import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { afterEach } from 'node:test';

import { format, resolveConfig } from 'prettier';

import { createServer } from '../src/server/create-server.ts';
import {
  FileHomeCatalogRepository,
  type HomeCatalogRepository,
} from '../src/server/home-catalog-repository.ts';
import type { ResumeCatalogRepository } from '../src/server/resume-catalog-repository.ts';
import type { HomeCatalog, HomeData } from '../src/types/index.ts';
import type { ResumeCatalog } from '../src/types/resume.ts';

const createHomeData = (occupation: string): HomeData => ({
  occupation,
  description: `${occupation}简介`,
  skillSectionDescription: `${occupation}技能简介`,
  skillHighlights: [],
  skills: [],
  experiences: [],
  projects: [],
});

const createHomeCatalog = (): HomeCatalog => ({
  schemaVersion: 1,
  activeHomeId: 'frontend',
  homes: [
    {
      id: 'frontend',
      name: '前端开发',
      contents: {
        'zh-CN': createHomeData('前端工程师'),
        'en-US': createHomeData('Frontend Engineer'),
        'ja-JP': createHomeData('フロントエンドエンジニア'),
      },
    },
  ],
});

class MemoryHomeRepository implements HomeCatalogRepository {
  catalog = createHomeCatalog();
  async read() {
    return structuredClone(this.catalog);
  }
  async write(catalog: HomeCatalog) {
    this.catalog = structuredClone(catalog);
  }
}

class MemoryResumeRepository implements ResumeCatalogRepository {
  async read(): Promise<ResumeCatalog> {
    return { schemaVersion: 1, activeResumeId: 'resume', resumes: [] };
  }
  async write(): Promise<void> {}
}

const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers
      .splice(0)
      .map(
        (server) =>
          new Promise<void>((resolve, reject) =>
            server.close((error) => (error ? reject(error) : resolve())),
          ),
      ),
  );
});

const startServer = async () => {
  const homeRepository = new MemoryHomeRepository();
  const app = createServer({
    repository: new MemoryResumeRepository(),
    homeRepository,
    createId: () => 'backend',
  });
  const server = app.listen(0);
  servers.push(server);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('测试服务器地址无效');
  return { baseUrl: `http://127.0.0.1:${address.port}`, homeRepository };
};

test('GET 返回完整主页目录', async () => {
  const { baseUrl } = await startServer();
  const response = await fetch(`${baseUrl}/api/home-catalog`);
  const catalog = (await response.json()) as HomeCatalog;

  assert.equal(response.status, 200);
  assert.equal(catalog.activeHomeId, 'frontend');
});

test('主页内容更新和复制岗位写入独立仓库', async () => {
  const { baseUrl, homeRepository } = await startServer();
  const content = createHomeData('高级前端工程师');
  const updateResponse = await fetch(`${baseUrl}/api/home-catalog/content`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeId: 'frontend', language: 'zh-CN', content }),
  });
  const copyResponse = await fetch(`${baseUrl}/api/home-catalog/homes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: '后端开发',
      mode: 'copy',
      sourceHomeId: 'frontend',
    }),
  });

  assert.equal(updateResponse.status, 200);
  assert.equal(copyResponse.status, 201);
  assert.equal(homeRepository.catalog.homes[1].contents['zh-CN'].occupation, '高级前端工程师');
});

test('主页岗位支持重命名和独立设置启用', async () => {
  const { baseUrl, homeRepository } = await startServer();
  homeRepository.catalog.homes.push({
    id: 'backend',
    name: '后端开发',
    contents: structuredClone(homeRepository.catalog.homes[0].contents),
  });

  await fetch(`${baseUrl}/api/home-catalog/homes/backend`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Node.js 后端开发' }),
  });
  const response = await fetch(`${baseUrl}/api/home-catalog/active`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeId: 'backend' }),
  });

  assert.equal(response.status, 200);
  assert.equal(homeRepository.catalog.activeHomeId, 'backend');
  assert.equal(homeRepository.catalog.homes[1].name, 'Node.js 后端开发');
});

test('删除主页启用岗位返回统一冲突错误', async () => {
  const { baseUrl } = await startServer();
  const response = await fetch(`${baseUrl}/api/home-catalog/homes/frontend`, {
    method: 'DELETE',
  });
  const payload = (await response.json()) as { error: { code: string; message: string } };

  assert.equal(response.status, 409);
  assert.equal(payload.error.code, 'HOME_IS_ACTIVE');
});

test('主页文件仓库写入符合项目 Prettier 格式', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'home-catalog-'));
  const filePath = path.join(directory, 'home-catalog.json');
  const repository = new FileHomeCatalogRepository(filePath);
  const catalog = createHomeCatalog();

  try {
    await repository.write(catalog);
    const actual = await readFile(filePath, 'utf8');
    const config = await resolveConfig(path.join(process.cwd(), 'package.json'));
    const expected = await format(JSON.stringify(catalog), { ...config, parser: 'json' });
    assert.equal(actual, expected);
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
});
