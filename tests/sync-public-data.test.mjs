import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { syncPublicData } from '../scripts/sync-public-data.mjs';

const createHomeProfile = (occupation = '远程前端工程师') => ({
  id: 'frontend',
  name: '前端开发',
  contents: {
    'zh-CN': {
      occupation,
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
});

const createResumeProfile = (title = '远程前端开发工程师') => ({
  id: 'frontend',
  name: '前端开发',
  contents: {
    'zh-CN': {
      basicInfo: { title, skillDescriptions: [], skills: [] },
      experience: [],
      projects: [],
      education: [],
      website: [],
    },
    'en-US': {
      basicInfo: { title: 'Frontend Developer', skillDescriptions: [], skills: [] },
      experience: [],
      projects: [],
      education: [],
      website: [],
    },
    'ja-JP': {
      basicInfo: { title: 'フロントエンドエンジニア', skillDescriptions: [], skills: [] },
      experience: [],
      projects: [],
      education: [],
      website: [],
    },
  },
});

const createLocalData = () => ({
  home: {
    schemaVersion: 1,
    activeHomeId: 'agent',
    homes: [
      createHomeProfile('本地前端工程师'),
      { ...createHomeProfile('本地 Agent 工程师'), id: 'agent', name: 'Agent 开发' },
    ],
  },
  resume: {
    schemaVersion: 1,
    activeResumeId: 'agent',
    resumes: [
      createResumeProfile('本地前端开发工程师'),
      { ...createResumeProfile('本地 Agent 开发工程师'), id: 'agent', name: 'Agent 开发' },
    ],
  },
});

const createTempDataDirectory = async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-public-sync-'));
  const data = createLocalData();
  const homePath = path.join(directory, 'home-catalog.json');
  const resumePath = path.join(directory, 'resume-catalog.json');
  await fs.writeFile(homePath, `${JSON.stringify(data.home, null, 2)}\n`, 'utf8');
  await fs.writeFile(resumePath, `${JSON.stringify(data.resume, null, 2)}\n`, 'utf8');
  return { directory, homePath, resumePath };
};

test('同步公开接口数据并保留本地其他岗位', async () => {
  const { directory, homePath, resumePath } = await createTempDataDirectory();
  try {
    const result = await syncPublicData({
      baseUrl: 'https://api.example.com',
      homePath,
      resumePath,
      fetcher: async (input) => {
        if (String(input).endsWith('/api/public/home')) {
          return Response.json({ revision: 11, profile: createHomeProfile() });
        }
        return Response.json({ revision: 9, profile: createResumeProfile() });
      },
    });

    const homeCatalog = JSON.parse(await fs.readFile(homePath, 'utf8'));
    const resumeCatalog = JSON.parse(await fs.readFile(resumePath, 'utf8'));
    assert.deepEqual(result, {
      homeChanged: true,
      homeRevision: 11,
      resumeChanged: true,
      resumeRevision: 9,
    });
    assert.equal(homeCatalog.activeHomeId, 'frontend');
    assert.equal(homeCatalog.homes.length, 2);
    assert.equal(
      homeCatalog.homes.find((item) => item.id === 'frontend').contents['zh-CN'].occupation,
      '远程前端工程师',
    );
    assert.equal(homeCatalog.homes.find((item) => item.id === 'agent').name, 'Agent 开发');
    assert.equal(resumeCatalog.activeResumeId, 'frontend');
    assert.equal(resumeCatalog.resumes.length, 2);
    assert.equal(
      resumeCatalog.resumes.find((item) => item.id === 'frontend').contents['zh-CN'].basicInfo
        .title,
      '远程前端开发工程师',
    );
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('任一接口失败时不写入部分本地快照', async () => {
  const { directory, homePath, resumePath } = await createTempDataDirectory();
  try {
    const beforeHome = await fs.readFile(homePath, 'utf8');
    const beforeResume = await fs.readFile(resumePath, 'utf8');
    await assert.rejects(
      () =>
        syncPublicData({
          baseUrl: 'https://api.example.com',
          homePath,
          resumePath,
          fetcher: async (input) => {
            if (String(input).endsWith('/api/public/home')) {
              return Response.json({ revision: 11, profile: createHomeProfile() });
            }
            return new Response(null, { status: 503 });
          },
        }),
      (error) => error?.category === 'http_error' && error?.pathname === '/api/public/resume',
    );
    assert.equal(await fs.readFile(homePath, 'utf8'), beforeHome);
    assert.equal(await fs.readFile(resumePath, 'utf8'), beforeResume);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('非法接口数据不会覆盖本地快照', async () => {
  const { directory, homePath, resumePath } = await createTempDataDirectory();
  try {
    const beforeHome = await fs.readFile(homePath, 'utf8');
    const beforeResume = await fs.readFile(resumePath, 'utf8');
    await assert.rejects(
      () =>
        syncPublicData({
          baseUrl: 'https://api.example.com',
          homePath,
          resumePath,
          fetcher: async (input) => {
            if (String(input).endsWith('/api/public/home')) {
              return Response.json({ revision: 11, profile: { id: 'frontend' } });
            }
            return Response.json({ revision: 9, profile: createResumeProfile() });
          },
        }),
      (error) => error?.category === 'invalid_payload' && error?.pathname === '/api/public/home',
    );
    assert.equal(await fs.readFile(homePath, 'utf8'), beforeHome);
    assert.equal(await fs.readFile(resumePath, 'utf8'), beforeResume);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
