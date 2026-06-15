import { describe, expect, it } from 'vitest';

import {
  copyHomeProfile,
  createHomeProfile,
  deleteHomeProfile,
  getActiveHomeProfile,
  setActiveHomeProfile,
  updateHomeContent,
  validateHomeCatalog,
} from '../src/catalogs/home-catalog';
import {
  copyResumeProfile,
  createResumeProfile,
  deleteResumeProfile,
  getActiveResumeProfile,
  setActiveResumeProfile,
  updateResumeContent,
  validateResumeCatalog,
} from '../src/catalogs/resume-catalog';
import type { HomeCatalog, HomeData, ResumeCatalog, ResumeData } from '../src/catalogs/types';

const createHomeData = (occupation: string): HomeData => ({
  occupation,
  description: `${occupation}简介`,
  skillSectionDescription: `${occupation}技能简介`,
  skillHighlights: [],
  skills: [],
  experiences: [],
  projects: [],
});

const createResumeData = (title: string): ResumeData => ({
  basicInfo: {
    title,
    skills: [],
    skillDescriptions: [],
  },
  experience: [],
  projects: [],
  education: [],
  website: [],
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

const createResumeCatalog = (): ResumeCatalog => ({
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

describe('主页目录规则', () => {
  it('校验目录并返回当前启用岗位', () => {
    const catalog = createHomeCatalog();

    expect(() => validateHomeCatalog(catalog)).not.toThrow();
    expect(getActiveHomeProfile(catalog).id).toBe('frontend');
  });

  it('创建空白岗位并深复制现有岗位', () => {
    const catalog = createHomeCatalog();
    const created = createHomeProfile(catalog, {
      name: '后端开发',
      createId: () => 'backend',
    });
    const copied = copyHomeProfile(created.catalog, {
      name: '全栈开发',
      sourceHomeId: 'frontend',
      createId: () => 'fullstack',
    });

    expect(created.catalog.homes[1].contents['zh-CN'].occupation).toBe('');
    expect(copied.catalog.homes[2].contents['en-US'].occupation).toBe('Frontend Engineer');

    copied.catalog.homes[2].contents['zh-CN'].occupation = '已修改';
    expect(copied.catalog.homes[0].contents['zh-CN'].occupation).toBe('前端工程师');
  });

  it('拒绝重名、删除启用岗位和设置不存在岗位', () => {
    const catalog = createHomeCatalog();

    expect(() =>
      createHomeProfile(catalog, { name: ' 前端开发 ', createId: () => 'duplicate' }),
    ).toThrowError(expect.objectContaining({ code: 'DUPLICATE_HOME_NAME' }));
    expect(() => deleteHomeProfile(catalog, 'frontend')).toThrowError(
      expect.objectContaining({ code: 'HOME_IS_ACTIVE' }),
    );
    expect(() => setActiveHomeProfile(catalog, 'missing')).toThrowError(
      expect.objectContaining({ code: 'HOME_NOT_FOUND' }),
    );
  });

  it('更新指定语言且不影响其他语言', () => {
    const catalog = createHomeCatalog();
    const updated = updateHomeContent(
      catalog,
      'frontend',
      'zh-CN',
      createHomeData('高级前端工程师'),
    );

    expect(updated.homes[0].contents['zh-CN'].occupation).toBe('高级前端工程师');
    expect(updated.homes[0].contents['en-US'].occupation).toBe('Frontend Engineer');
  });
});

describe('简历目录规则', () => {
  it('校验目录并返回当前启用岗位', () => {
    const catalog = createResumeCatalog();

    expect(() => validateResumeCatalog(catalog)).not.toThrow();
    expect(getActiveResumeProfile(catalog).id).toBe('frontend');
  });

  it('创建空白岗位并深复制现有岗位', () => {
    const catalog = createResumeCatalog();
    const created = createResumeProfile(catalog, {
      name: '后端开发',
      createId: () => 'backend',
    });
    const copied = copyResumeProfile(created.catalog, {
      name: '全栈开发',
      sourceResumeId: 'frontend',
      createId: () => 'fullstack',
    });

    expect(created.catalog.resumes[1].contents['zh-CN'].basicInfo.title).toBe('');
    expect(copied.catalog.resumes[2].contents['en-US'].basicInfo.title).toBe('Frontend Developer');

    copied.catalog.resumes[2].contents['zh-CN'].basicInfo.title = '已修改';
    expect(copied.catalog.resumes[0].contents['zh-CN'].basicInfo.title).toBe('前端开发工程师');
  });

  it('拒绝重名、删除启用岗位和设置不存在岗位', () => {
    const catalog = createResumeCatalog();

    expect(() =>
      createResumeProfile(catalog, { name: ' 前端开发 ', createId: () => 'duplicate' }),
    ).toThrowError(expect.objectContaining({ code: 'DUPLICATE_RESUME_NAME' }));
    expect(() => deleteResumeProfile(catalog, 'frontend')).toThrowError(
      expect.objectContaining({ code: 'RESUME_IS_ACTIVE' }),
    );
    expect(() => setActiveResumeProfile(catalog, 'missing')).toThrowError(
      expect.objectContaining({ code: 'RESUME_NOT_FOUND' }),
    );
  });

  it('更新指定语言且不影响其他语言', () => {
    const catalog = createResumeCatalog();
    const updated = updateResumeContent(
      catalog,
      'frontend',
      'zh-CN',
      createResumeData('高级前端开发工程师'),
    );

    expect(updated.resumes[0].contents['zh-CN'].basicInfo.title).toBe('高级前端开发工程师');
    expect(updated.resumes[0].contents['en-US'].basicInfo.title).toBe('Frontend Developer');
  });
});

describe('目录结构校验', () => {
  it('拒绝缺少嵌套字段或语言内容的数据', () => {
    const invalidHome = createHomeCatalog() as unknown as Record<string, unknown>;
    const invalidResume = createResumeCatalog() as unknown as Record<string, unknown>;

    delete (
      (invalidHome.homes as Array<Record<string, unknown>>)[0].contents as Record<string, unknown>
    )['en-US'];
    delete (
      (
        (invalidResume.resumes as Array<Record<string, unknown>>)[0].contents as Record<
          string,
          unknown
        >
      )['zh-CN'] as Record<string, unknown>
    ).basicInfo;

    expect(() => validateHomeCatalog(invalidHome)).toThrowError(
      expect.objectContaining({ code: 'INVALID_HOME_CATALOG' }),
    );
    expect(() => validateResumeCatalog(invalidResume)).toThrowError(
      expect.objectContaining({ code: 'INVALID_RESUME_CATALOG' }),
    );
  });
});
