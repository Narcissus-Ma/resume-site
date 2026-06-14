import {
  RESUME_LANGUAGES,
  type ResumeCatalog,
  type ResumeCatalogMutationResult,
  type ResumeData,
  type ResumeLanguage,
  type ResumeProfile,
} from '../../../types/resume';

export type ResumeCatalogErrorCode =
  | 'ACTIVE_RESUME_NOT_FOUND'
  | 'DUPLICATE_RESUME_NAME'
  | 'INVALID_RESUME_CATALOG'
  | 'INVALID_RESUME_NAME'
  | 'LAST_RESUME'
  | 'RESUME_NOT_FOUND'
  | 'RESUME_IS_ACTIVE';

export class ResumeCatalogError extends Error {
  code: ResumeCatalogErrorCode;

  constructor(code: ResumeCatalogErrorCode, message: string) {
    super(message);
    this.name = 'ResumeCatalogError';
    this.code = code;
  }
}

interface CreateResumeProfileOptions {
  name: string;
  createId: () => string;
}

interface CopyResumeProfileOptions extends CreateResumeProfileOptions {
  sourceResumeId: string;
}

const clone = <T>(value: T): T => structuredClone(value);

const normalizeName = (name: string): string => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new ResumeCatalogError('INVALID_RESUME_NAME', '请输入岗位名称');
  }

  return normalizedName;
};

const assertUniqueName = (
  catalog: ResumeCatalog,
  name: string,
  excludedResumeId?: string,
): void => {
  const duplicate = catalog.resumes.some(
    (resume) => resume.id !== excludedResumeId && resume.name === name,
  );

  if (duplicate) {
    throw new ResumeCatalogError('DUPLICATE_RESUME_NAME', '岗位名称已存在');
  }
};

const findResume = (catalog: ResumeCatalog, resumeId: string): ResumeProfile => {
  const resume = catalog.resumes.find((item) => item.id === resumeId);

  if (!resume) {
    throw new ResumeCatalogError('RESUME_NOT_FOUND', '未找到指定岗位简历');
  }

  return resume;
};

export const createEmptyResumeData = (): ResumeData => ({
  basicInfo: {
    title: '',
    skillDescriptions: [],
    skills: [],
  },
  experience: [],
  projects: [],
  education: [],
  website: [],
});

const createEmptyContents = (): Record<ResumeLanguage, ResumeData> => ({
  'zh-CN': createEmptyResumeData(),
  'en-US': createEmptyResumeData(),
  'ja-JP': createEmptyResumeData(),
});

export const validateResumeCatalog = (catalog: ResumeCatalog): void => {
  if (catalog.schemaVersion !== 1 || catalog.resumes.length === 0) {
    throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '简历目录格式无效');
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  catalog.resumes.forEach((resume) => {
    const name = normalizeName(resume.name);

    if (!resume.id || ids.has(resume.id) || names.has(name)) {
      throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '简历目录包含重复岗位');
    }

    RESUME_LANGUAGES.forEach((language) => {
      if (!resume.contents[language]) {
        throw new ResumeCatalogError('INVALID_RESUME_CATALOG', '岗位缺少语言内容');
      }
    });

    ids.add(resume.id);
    names.add(name);
  });

  if (!ids.has(catalog.activeResumeId)) {
    throw new ResumeCatalogError('ACTIVE_RESUME_NOT_FOUND', '未找到当前启用岗位');
  }
};

export const getActiveResumeContent = (
  catalog: ResumeCatalog,
  language: ResumeLanguage,
): ResumeData => {
  const activeResume = findResume(catalog, catalog.activeResumeId);

  return activeResume.contents[language] ?? activeResume.contents['zh-CN'];
};

export const createResumeProfile = (
  catalog: ResumeCatalog,
  options: CreateResumeProfileOptions,
): ResumeCatalogMutationResult => {
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);

  const resumeId = options.createId();
  const resume: ResumeProfile = {
    id: resumeId,
    name,
    contents: createEmptyContents(),
  };

  return {
    resumeId,
    catalog: {
      ...catalog,
      resumes: [...catalog.resumes, resume],
    },
  };
};

export const copyResumeProfile = (
  catalog: ResumeCatalog,
  options: CopyResumeProfileOptions,
): ResumeCatalogMutationResult => {
  const sourceResume = findResume(catalog, options.sourceResumeId);
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);

  const resumeId = options.createId();
  const resume: ResumeProfile = {
    id: resumeId,
    name,
    contents: clone(sourceResume.contents),
  };

  return {
    resumeId,
    catalog: {
      ...catalog,
      resumes: [...catalog.resumes, resume],
    },
  };
};

export const renameResumeProfile = (
  catalog: ResumeCatalog,
  resumeId: string,
  name: string,
): ResumeCatalog => {
  findResume(catalog, resumeId);
  const normalizedName = normalizeName(name);
  assertUniqueName(catalog, normalizedName, resumeId);

  return {
    ...catalog,
    resumes: catalog.resumes.map((resume) =>
      resume.id === resumeId ? { ...resume, name: normalizedName } : resume,
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

  return {
    ...catalog,
    resumes: catalog.resumes.filter((resume) => resume.id !== resumeId),
  };
};

export const setActiveResumeProfile = (catalog: ResumeCatalog, resumeId: string): ResumeCatalog => {
  findResume(catalog, resumeId);

  return {
    ...catalog,
    activeResumeId: resumeId,
  };
};

export const updateResumeContent = (
  catalog: ResumeCatalog,
  resumeId: string,
  language: ResumeLanguage,
  content: ResumeData,
): ResumeCatalog => {
  findResume(catalog, resumeId);

  return {
    ...catalog,
    resumes: catalog.resumes.map((resume) =>
      resume.id === resumeId
        ? {
            ...resume,
            contents: {
              ...resume.contents,
              [language]: clone(content),
            },
          }
        : resume,
    ),
  };
};
