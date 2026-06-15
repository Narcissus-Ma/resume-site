import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { translateResumeCatalog } from '../scripts/translate-data.js';
import {
  copyResumeProfile,
  createResumeProfile,
  deleteResumeProfile,
  getActiveResumeContent,
  setActiveResumeProfile,
} from '../src/domain/resume/rules/resume-catalog.ts';
import type { ResumeCatalog, ResumeData } from '../src/types/resume.ts';

const createResumeData = (title: string): ResumeData => ({
  basicInfo: {
    title,
    skillDescriptions: [],
    skills: [],
  },
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

test('按启用岗位和语言读取公开简历', () => {
  const content = getActiveResumeContent(createCatalog(), 'en-US');

  assert.equal(content.basicInfo.title, 'Frontend Developer');
});

test('缺少目标语言内容时回退中文', () => {
  const catalog = createCatalog();
  const profile = catalog.resumes[0];
  const invalidContents = profile.contents as Partial<typeof profile.contents>;
  delete invalidContents['ja-JP'];

  const content = getActiveResumeContent(catalog, 'ja-JP');

  assert.equal(content.basicInfo.title, '前端开发工程师');
});

test('复制岗位会深拷贝三种语言内容', () => {
  const result = copyResumeProfile(createCatalog(), {
    sourceResumeId: 'frontend',
    name: '全栈开发',
    createId: () => 'fullstack',
  });

  result.catalog.resumes[1].contents['zh-CN'].basicInfo.title = '全栈开发工程师';

  assert.equal(result.resumeId, 'fullstack');
  assert.equal(result.catalog.resumes[0].contents['zh-CN'].basicInfo.title, '前端开发工程师');
});

test('禁止创建重名岗位', () => {
  assert.throws(
    () =>
      createResumeProfile(createCatalog(), {
        name: ' 前端开发 ',
        createId: () => 'backend',
      }),
    /岗位名称已存在/,
  );
});

test('禁止删除启用岗位', () => {
  assert.throws(() => deleteResumeProfile(createCatalog(), 'frontend'), /不能删除当前启用岗位/);
});

test('禁止删除最后一个岗位', () => {
  const catalog = createCatalog();
  catalog.activeResumeId = 'missing';

  assert.throws(() => deleteResumeProfile(catalog, 'frontend'), /至少保留一个岗位/);
});

test('禁止将不存在的岗位设为启用状态', () => {
  assert.throws(() => setActiveResumeProfile(createCatalog(), 'backend'), /未找到指定岗位简历/);
});

test('迁移后的单一目录保留现有三语言前端简历', async () => {
  const fileUrl = new URL('../src/data/resume-catalog.json', import.meta.url);
  const catalog = JSON.parse(await readFile(fileUrl, 'utf8')) as ResumeCatalog;
  const frontendResume = catalog.resumes.find((resume) => resume.id === 'frontend');

  assert.equal(catalog.schemaVersion, 1);
  assert.ok(catalog.resumes.some((resume) => resume.id === catalog.activeResumeId));
  assert.ok(frontendResume);
  assert.deepEqual(Object.keys(frontendResume.contents).sort(), ['en-US', 'ja-JP', 'zh-CN']);
  assert.equal(frontendResume.contents['zh-CN'].basicInfo.title, '前端开发工程师');
});

test('翻译目录会更新所有岗位目标语言且保留元数据', async () => {
  const catalog = createCatalog();
  const copied = copyResumeProfile(catalog, {
    sourceResumeId: 'frontend',
    name: '后端开发',
    createId: () => 'backend',
  }).catalog;
  const translated = (await translateResumeCatalog(copied, async (content, language) => ({
    ...content,
    basicInfo: {
      ...content.basicInfo,
      title: `${content.basicInfo.title}-${language}`,
    },
  }))) as ResumeCatalog;

  assert.equal(translated.activeResumeId, 'frontend');
  assert.deepEqual(
    translated.resumes.map(({ id, name }) => ({ id, name })),
    [
      { id: 'frontend', name: '前端开发' },
      { id: 'backend', name: '后端开发' },
    ],
  );
  assert.equal(translated.resumes[1].contents['en-US'].basicInfo.title, '前端开发工程师-en-US');
  assert.equal(translated.resumes[1].contents['ja-JP'].basicInfo.title, '前端开发工程师-ja-JP');
});
