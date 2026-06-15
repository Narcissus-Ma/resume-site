import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type ResumeCatalog,
  type ResumeCatalogMutationResult,
  type ResumeData,
  type ResumeProfile,
} from './types';

export type ResumeCatalogErrorCode =
  | 'ACTIVE_RESUME_NOT_FOUND'
  | 'DUPLICATE_RESUME_NAME'
  | 'INVALID_RESUME_CATALOG'
  | 'INVALID_RESUME_NAME'
  | 'LAST_RESUME'
  | 'RESUME_IS_ACTIVE'
  | 'RESUME_NOT_FOUND';

export class ResumeCatalogError extends Error {
  constructor(
    readonly code: ResumeCatalogErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ResumeCatalogError';
  }
}

interface CreateResumeOptions {
  name: string;
  createId: () => string;
}

interface CopyResumeOptions extends CreateResumeOptions {
  sourceResumeId: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const hasStrings = (value: unknown, keys: string[]): boolean =>
  isRecord(value) && keys.every((key) => typeof value[key] === 'string');

const hasOptionalStringArray = (value: Record<string, unknown>, key: string): boolean =>
  value[key] === undefined || isStringArray(value[key]);

const isResumeData = (value: unknown): value is ResumeData => {
  if (
    !isRecord(value) ||
    !isRecord(value.basicInfo) ||
    typeof value.basicInfo.title !== 'string' ||
    !Array.isArray(value.basicInfo.skills) ||
    !isStringArray(value.basicInfo.skillDescriptions) ||
    !Array.isArray(value.experience) ||
    !Array.isArray(value.projects) ||
    !Array.isArray(value.education) ||
    !Array.isArray(value.website) ||
    (value.correctToken !== undefined && typeof value.correctToken !== 'string')
  ) {
    return false;
  }

  return (
    value.basicInfo.skills.every(
      (item) => isRecord(item) && typeof item.category === 'string' && isStringArray(item.items),
    ) &&
    value.experience.every(
      (item) =>
        hasStrings(item, ['company', 'position', 'period']) &&
        hasOptionalStringArray(item, 'achievements'),
    ) &&
    value.projects.every(
      (item) =>
        hasStrings(item, ['name', 'period', 'description']) &&
        hasOptionalStringArray(item, 'responsibilities'),
    ) &&
    value.education.every(
      (item) =>
        hasStrings(item, ['school', 'degree', 'period']) &&
        hasOptionalStringArray(item, 'achievements'),
    ) &&
    value.website.every((item) => hasStrings(item, ['name', 'url']))
  );
};

const normalizeName = (name: string): string => {
  const normalized = name.trim();
  if (!normalized) throw new ResumeCatalogError('INVALID_RESUME_NAME', '请输入岗位名称');
  return normalized;
};

const findResume = (catalog: ResumeCatalog, resumeId: string): ResumeProfile => {
  const resume = catalog.resumes.find((item) => item.id === resumeId);
  if (!resume) throw new ResumeCatalogError('RESUME_NOT_FOUND', '未找到指定岗位简历');
  return resume;
};

const assertUniqueName = (catalog: ResumeCatalog, name: string, excludedId?: string): void => {
  if (catalog.resumes.some((resume) => resume.id !== excludedId && resume.name === name)) {
    throw new ResumeCatalogError('DUPLICATE_RESUME_NAME', '岗位名称已存在');
  }
};

export const createEmptyResumeData = (): ResumeData => ({
  basicInfo: { title: '', skills: [], skillDescriptions: [] },
  experience: [],
  projects: [],
  education: [],
  website: [],
});

const createEmptyContents = (): Record<CatalogLanguage, ResumeData> => ({
  'zh-CN': createEmptyResumeData(),
  'en-US': createEmptyResumeData(),
  'ja-JP': createEmptyResumeData(),
});

export const validateResumeCatalog = (value: unknown): asserts value is ResumeCatalog => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    typeof value.activeResumeId !== 'string' ||
    !Array.isArray(value.resumes) ||
    value.resumes.length === 0
  ) {
    throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '简历目录格式无效');
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  value.resumes.forEach((resume) => {
    if (!isRecord(resume) || typeof resume.id !== 'string' || typeof resume.name !== 'string') {
      throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '岗位简历格式无效');
    }
    const contents = resume.contents;
    if (!isRecord(contents)) {
      throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '岗位简历格式无效');
    }

    const name = normalizeName(resume.name);
    if (!resume.id || ids.has(resume.id) || names.has(name)) {
      throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '简历目录包含重复岗位');
    }

    if (!CATALOG_LANGUAGES.every((language) => isResumeData(contents[language]))) {
      throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '岗位缺少有效语言内容');
    }

    ids.add(resume.id);
    names.add(name);
  });

  if (!ids.has(value.activeResumeId)) {
    throw new ResumeCatalogError('ACTIVE_RESUME_NOT_FOUND', '未找到当前启用岗位');
  }
};

export const getActiveResumeProfile = (catalog: ResumeCatalog): ResumeProfile =>
  findResume(catalog, catalog.activeResumeId);

export const createResumeProfile = (
  catalog: ResumeCatalog,
  options: CreateResumeOptions,
): ResumeCatalogMutationResult => {
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);
  const resumeId = options.createId();

  return {
    resumeId,
    catalog: {
      ...catalog,
      resumes: [...catalog.resumes, { id: resumeId, name, contents: createEmptyContents() }],
    },
  };
};

export const copyResumeProfile = (
  catalog: ResumeCatalog,
  options: CopyResumeOptions,
): ResumeCatalogMutationResult => {
  const source = findResume(catalog, options.sourceResumeId);
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);
  const resumeId = options.createId();

  return {
    resumeId,
    catalog: {
      ...catalog,
      resumes: [
        ...catalog.resumes,
        { id: resumeId, name, contents: structuredClone(source.contents) },
      ],
    },
  };
};

export const renameResumeProfile = (
  catalog: ResumeCatalog,
  resumeId: string,
  name: string,
): ResumeCatalog => {
  findResume(catalog, resumeId);
  const normalized = normalizeName(name);
  assertUniqueName(catalog, normalized, resumeId);
  return {
    ...catalog,
    resumes: catalog.resumes.map((resume) =>
      resume.id === resumeId ? { ...resume, name: normalized } : resume,
    ),
  };
};

export const deleteResumeProfile = (catalog: ResumeCatalog, resumeId: string): ResumeCatalog => {
  findResume(catalog, resumeId);
  if (catalog.activeResumeId === resumeId) {
    throw new ResumeCatalogError('RESUME_IS_ACTIVE', '不能删除当前启用岗位');
  }
  if (catalog.resumes.length === 1) {
    throw new ResumeCatalogError('LAST_RESUME', '至少保留一个岗位');
  }
  return { ...catalog, resumes: catalog.resumes.filter((resume) => resume.id !== resumeId) };
};

export const setActiveResumeProfile = (catalog: ResumeCatalog, resumeId: string): ResumeCatalog => {
  findResume(catalog, resumeId);
  return { ...catalog, activeResumeId: resumeId };
};

export const updateResumeContent = (
  catalog: ResumeCatalog,
  resumeId: string,
  language: CatalogLanguage,
  content: ResumeData,
): ResumeCatalog => {
  findResume(catalog, resumeId);
  if (!isResumeData(content)) {
    throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '简历内容格式无效');
  }
  return {
    ...catalog,
    resumes: catalog.resumes.map((resume) =>
      resume.id === resumeId
        ? { ...resume, contents: { ...resume.contents, [language]: structuredClone(content) } }
        : resume,
    ),
  };
};
