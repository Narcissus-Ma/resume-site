import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolvePublicHomeProfile,
  resolvePublicResumeProfile,
} from '../src/domain/catalog/public-catalog.ts';
import type { HomeCatalog } from '../src/types/index.ts';
import type { ResumeCatalog } from '../src/types/resume.ts';

const homeCatalog: HomeCatalog = {
  schemaVersion: 1,
  activeHomeId: 'local',
  homes: [
    {
      id: 'local',
      name: '本地主页',
      contents: {
        'zh-CN': {
          occupation: '本地前端工程师',
          description: '',
          skillSectionDescription: '',
          skillHighlights: [],
          skills: [],
          experiences: [],
          projects: [],
        },
        'en-US': {
          occupation: 'Local Frontend Engineer',
          description: '',
          skillSectionDescription: '',
          skillHighlights: [],
          skills: [],
          experiences: [],
          projects: [],
        },
        'ja-JP': {
          occupation: 'ローカルエンジニア',
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
  activeResumeId: 'local',
  resumes: [
    {
      id: 'local',
      name: '本地简历',
      contents: {
        'zh-CN': {
          basicInfo: { title: '本地前端工程师', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
        'en-US': {
          basicInfo: { title: 'Local Frontend Engineer', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
        'ja-JP': {
          basicInfo: { title: 'ローカルエンジニア', skills: [], skillDescriptions: [] },
          experience: [],
          projects: [],
          education: [],
          website: [],
        },
      },
    },
  ],
};

test('有效 Worker 主页岗位覆盖本地启用岗位', () => {
  const remote = structuredClone(homeCatalog.homes[0]);
  remote.id = 'remote';
  remote.contents['zh-CN'].occupation = '远程前端工程师';
  assert.equal(
    resolvePublicHomeProfile(homeCatalog, { revision: 2, profile: remote }).id,
    'remote',
  );
});

test('非法 Worker 主页岗位回退本地岗位', () => {
  const invalid = { revision: 2, profile: { id: 'remote' } };
  assert.equal(resolvePublicHomeProfile(homeCatalog, invalid).id, 'local');
});

test('有效 Worker 简历岗位覆盖本地启用岗位，非法数据回退', () => {
  const remote = structuredClone(resumeCatalog.resumes[0]);
  remote.id = 'remote';
  assert.equal(
    resolvePublicResumeProfile(resumeCatalog, { revision: 2, profile: remote }).id,
    'remote',
  );
  assert.equal(resolvePublicResumeProfile(resumeCatalog, null).id, 'local');
});
