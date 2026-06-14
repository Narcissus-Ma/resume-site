import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { translateHomeCatalog } from '../scripts/translate-data.js';
import {
  copyHomeProfile,
  createHomeProfile,
  deleteHomeProfile,
  getActiveHomeContent,
  setActiveHomeProfile,
  updateHomeContent,
} from '../src/domain/home/rules/home-catalog.ts';
import type { HomeCatalog, HomeData } from '../src/types/index.ts';

const createHomeData = (occupation: string): HomeData => ({
  occupation,
  description: `${occupation}简介`,
  skills: [],
  experiences: [],
  projects: [],
});

const createCatalog = (): HomeCatalog => ({
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

test('按主页启用岗位和语言读取内容', () => {
  assert.equal(getActiveHomeContent(createCatalog(), 'en-US').occupation, 'Frontend Engineer');
});

test('缺少主页目标语言时回退中文', () => {
  const catalog = createCatalog();
  const contents = catalog.homes[0].contents as Partial<(typeof catalog.homes)[0]['contents']>;
  delete contents['ja-JP'];

  assert.equal(getActiveHomeContent(catalog, 'ja-JP').occupation, '前端工程师');
});

test('创建空白主页岗位时包含三语言完整字段', () => {
  const result = createHomeProfile(createCatalog(), {
    name: '后端开发',
    createId: () => 'backend',
  });
  const created = result.catalog.homes[1];

  assert.equal(result.homeId, 'backend');
  assert.deepEqual(Object.keys(created.contents).sort(), ['en-US', 'ja-JP', 'zh-CN']);
  assert.equal(created.contents['zh-CN'].occupation, '');
  assert.deepEqual(created.contents['zh-CN'].projects, []);
});

test('复制主页岗位时深拷贝三语言内容', () => {
  const result = copyHomeProfile(createCatalog(), {
    sourceHomeId: 'frontend',
    name: '全栈开发',
    createId: () => 'fullstack',
  });

  result.catalog.homes[1].contents['zh-CN'].occupation = '全栈工程师';

  assert.equal(result.catalog.homes[0].contents['zh-CN'].occupation, '前端工程师');
});

test('禁止创建重名主页岗位', () => {
  assert.throws(
    () => createHomeProfile(createCatalog(), { name: ' 前端开发 ', createId: () => 'backend' }),
    /主页岗位名称已存在/,
  );
});

test('禁止删除主页启用岗位', () => {
  assert.throws(() => deleteHomeProfile(createCatalog(), 'frontend'), /不能删除当前启用主页岗位/);
});

test('禁止将不存在的主页岗位设为启用状态', () => {
  assert.throws(() => setActiveHomeProfile(createCatalog(), 'backend'), /未找到指定主页岗位/);
});

test('更新主页内容不影响其他语言', () => {
  const updated = updateHomeContent(
    createCatalog(),
    'frontend',
    'zh-CN',
    createHomeData('高级前端工程师'),
  );

  assert.equal(updated.homes[0].contents['zh-CN'].occupation, '高级前端工程师');
  assert.equal(updated.homes[0].contents['en-US'].occupation, 'Frontend Engineer');
});

test('迁移后的主页目录保留现有三语言内容', async () => {
  const fileUrl = new URL('../src/data/home-catalog.json', import.meta.url);
  const catalog = JSON.parse(await readFile(fileUrl, 'utf8')) as HomeCatalog;
  const frontendHome = catalog.homes.find((home) => home.id === 'frontend');

  assert.equal(catalog.activeHomeId, 'frontend');
  assert.ok(frontendHome);
  assert.equal(frontendHome.contents['zh-CN'].occupation, '前端工程师');
  assert.equal(frontendHome.contents['en-US'].occupation, 'Frontend Engineer');
  assert.equal(frontendHome.contents['zh-CN'].skills[0].name, '前端开发啊');
});

test('翻译主页目录会更新全部岗位且保留启用状态', async () => {
  const copied = copyHomeProfile(createCatalog(), {
    sourceHomeId: 'frontend',
    name: '后端开发',
    createId: () => 'backend',
  }).catalog;
  const translated = (await translateHomeCatalog(copied, async (content, language) => ({
    ...content,
    occupation: `${content.occupation}-${language}`,
  }))) as HomeCatalog;

  assert.equal(translated.activeHomeId, 'frontend');
  assert.equal(translated.homes[1].contents['en-US'].occupation, '前端工程师-en-US');
});
