import { env, SELF } from 'cloudflare:test';
import { beforeEach, describe, expect, it } from 'vitest';

import type { CatalogEnvelope, HomeCatalog, ResumeCatalog } from '../src/catalogs/types';

const homeCatalog: HomeCatalog = {
  schemaVersion: 1,
  activeHomeId: 'frontend',
  homes: [
    {
      id: 'frontend',
      name: '前端开发',
      contents: {
        'zh-CN': {
          occupation: '前端工程师',
          description: '',
          skillSectionDescription: '',
          skillHighlights: [],
          skills: [],
          experiences: [],
          projects: [],
        },
        'en-US': {
          occupation: 'Frontend Engineer',
          description: '',
          skillSectionDescription: '',
          skillHighlights: [],
          skills: [],
          experiences: [],
          projects: [],
        },
        'ja-JP': {
          occupation: 'フロントエンドエンジニア',
          description: '',
          skillSectionDescription: '',
          skillHighlights: [],
          skills: [],
          experiences: [],
          projects: [],
        },
      },
    },
  ],
};

const resumeCatalog: ResumeCatalog = {
  schemaVersion: 1,
  activeResumeId: 'frontend',
  resumes: [
    {
      id: 'frontend',
      name: '前端开发',
      contents: {
        'zh-CN': {
          basicInfo: { title: '前端工程师', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
        'en-US': {
          basicInfo: { title: 'Frontend Engineer', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
        'ja-JP': {
          basicInfo: { title: 'フロントエンドエンジニア', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
      },
    },
  ],
};

const envelope = <T>(catalog: T): CatalogEnvelope<T> => ({
  revision: 1,
  updatedAt: '2026-06-15T10:00:00.000Z',
  catalog,
});

const login = async (): Promise<string> => {
  const response = await SELF.fetch('https://api.example.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': crypto.randomUUID(),
    },
    body: JSON.stringify({ password: '正确密码' }),
  });
  return ((await response.json()) as { token: string }).token;
};

describe('Worker 管理 API', () => {
  beforeEach(async () => {
    await env.CATALOG_KV.put('catalog:home', JSON.stringify(envelope(homeCatalog)));
    await env.CATALOG_KV.put('catalog:resume', JSON.stringify(envelope(resumeCatalog)));
  });

  it('拒绝未认证的完整目录请求', async () => {
    const response = await SELF.fetch('https://api.example.com/api/home-catalog');
    expect(response.status).toBe(401);
  });

  it('有效令牌读取完整目录', async () => {
    const token = await login();
    const response = await SELF.fetch('https://api.example.com/api/home-catalog', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = (await response.json()) as { revision: number; catalog: HomeCatalog };

    expect(response.status).toBe(200);
    expect(payload.revision).toBe(1);
    expect(payload.catalog.homes).toHaveLength(1);
  });

  it('更新主页内容后 revision 递增并拒绝旧版本', async () => {
    const token = await login();
    const request = () =>
      SELF.fetch('https://api.example.com/api/home-catalog/content', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revision: 1,
          homeId: 'frontend',
          language: 'zh-CN',
          content: {
            ...homeCatalog.homes[0].contents['zh-CN'],
            occupation: '高级前端工程师',
          },
        }),
      });

    const success = await request();
    expect(success.status).toBe(200);
    expect(((await success.json()) as { revision: number }).revision).toBe(2);

    const conflict = await request();
    const payload = (await conflict.json()) as { error: { code: string } };
    expect(conflict.status).toBe(409);
    expect(payload.error.code).toBe('CATALOG_VERSION_CONFLICT');
  });
});
