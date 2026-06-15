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

describe('Worker 健康检查', () => {
  beforeEach(async () => {
    await env.CATALOG_KV.delete('catalog:home');
    await env.CATALOG_KV.delete('catalog:resume');
  });

  it('返回服务状态、版本和当前时间', async () => {
    const response = await SELF.fetch('https://api.example.com/api/health');
    const payload = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.service).toBe('resume-api');
    expect(typeof payload.version).toBe('string');
    expect(typeof payload.currentTime).toBe('string');
  });
});

describe('Worker 公开目录', () => {
  beforeEach(async () => {
    await env.CATALOG_KV.put('catalog:home', JSON.stringify(envelope(homeCatalog)));
    await env.CATALOG_KV.put('catalog:resume', JSON.stringify(envelope(resumeCatalog)));
  });

  it('只返回当前启用主页岗位', async () => {
    const response = await SELF.fetch('https://api.example.com/api/public/home');
    const payload = (await response.json()) as { revision: number; profile: { id: string } };

    expect(response.status).toBe(200);
    expect(payload).toEqual({ revision: 1, profile: homeCatalog.homes[0] });
    expect(response.headers.get('Cache-Control')).toContain('public');
    expect(response.headers.get('ETag')).toBeTruthy();
  });

  it('只返回当前启用简历岗位', async () => {
    const response = await SELF.fetch('https://api.example.com/api/public/resume');
    const payload = (await response.json()) as { revision: number; profile: { id: string } };

    expect(response.status).toBe(200);
    expect(payload).toEqual({ revision: 1, profile: resumeCatalog.resumes[0] });
  });
});
