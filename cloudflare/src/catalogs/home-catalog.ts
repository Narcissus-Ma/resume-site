import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type HomeCatalog,
  type HomeCatalogMutationResult,
  type HomeData,
  type HomeProfile,
} from './types';

export type HomeCatalogErrorCode =
  | 'ACTIVE_HOME_NOT_FOUND'
  | 'DUPLICATE_HOME_NAME'
  | 'HOME_IS_ACTIVE'
  | 'HOME_NOT_FOUND'
  | 'INVALID_HOME_CATALOG'
  | 'INVALID_HOME_NAME'
  | 'LAST_HOME';

export class HomeCatalogError extends Error {
  constructor(
    readonly code: HomeCatalogErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'HomeCatalogError';
  }
}

interface CreateHomeOptions {
  name: string;
  createId: () => string;
}

interface CopyHomeOptions extends CreateHomeOptions {
  sourceHomeId: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasStrings = (value: unknown, keys: string[]): boolean =>
  isRecord(value) && keys.every((key) => typeof value[key] === 'string');

const isHomeData = (value: unknown): value is HomeData => {
  if (
    !isRecord(value) ||
    !hasStrings(value, ['occupation', 'description', 'skillSectionDescription']) ||
    !Array.isArray(value.skillHighlights) ||
    !Array.isArray(value.skills) ||
    !Array.isArray(value.experiences) ||
    !Array.isArray(value.projects)
  ) {
    return false;
  }

  return (
    value.skillHighlights.every(
      (item) =>
        hasStrings(item, ['id', 'icon', 'title', 'description']) &&
        ['code', 'database', 'design', 'agent', 'tool'].includes(item.icon),
    ) &&
    value.skills.every(
      (item) => isRecord(item) && typeof item.name === 'string' && typeof item.value === 'number',
    ) &&
    value.experiences.every((item) =>
      hasStrings(item, ['year', 'title', 'company', 'description']),
    ) &&
    value.projects.every((item) => hasStrings(item, ['title', 'description', 'image', 'link']))
  );
};

const normalizeName = (name: string): string => {
  const normalized = name.trim();
  if (!normalized) throw new HomeCatalogError('INVALID_HOME_NAME', '请输入主页岗位名称');
  return normalized;
};

const findHome = (catalog: HomeCatalog, homeId: string): HomeProfile => {
  const home = catalog.homes.find((item) => item.id === homeId);
  if (!home) throw new HomeCatalogError('HOME_NOT_FOUND', '未找到指定主页岗位');
  return home;
};

const assertUniqueName = (catalog: HomeCatalog, name: string, excludedId?: string): void => {
  if (catalog.homes.some((home) => home.id !== excludedId && home.name === name)) {
    throw new HomeCatalogError('DUPLICATE_HOME_NAME', '主页岗位名称已存在');
  }
};

export const createEmptyHomeData = (): HomeData => ({
  occupation: '',
  description: '',
  skillSectionDescription: '',
  skillHighlights: [],
  skills: [],
  experiences: [],
  projects: [],
});

const createEmptyContents = (): Record<CatalogLanguage, HomeData> => ({
  'zh-CN': createEmptyHomeData(),
  'en-US': createEmptyHomeData(),
  'ja-JP': createEmptyHomeData(),
});

export const validateHomeCatalog = (value: unknown): asserts value is HomeCatalog => {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    typeof value.activeHomeId !== 'string' ||
    !Array.isArray(value.homes) ||
    value.homes.length === 0
  ) {
    throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页目录格式无效');
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  value.homes.forEach((home) => {
    if (!isRecord(home) || typeof home.id !== 'string' || typeof home.name !== 'string') {
      throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页岗位格式无效');
    }
    const contents = home.contents;
    if (!isRecord(contents)) {
      throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页岗位格式无效');
    }

    const name = normalizeName(home.name);
    if (!home.id || ids.has(home.id) || names.has(name)) {
      throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页目录包含重复岗位');
    }

    if (!CATALOG_LANGUAGES.every((language) => isHomeData(contents[language]))) {
      throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页岗位缺少有效语言内容');
    }

    ids.add(home.id);
    names.add(name);
  });

  if (!ids.has(value.activeHomeId)) {
    throw new HomeCatalogError('ACTIVE_HOME_NOT_FOUND', '未找到当前启用主页岗位');
  }
};

export const getActiveHomeProfile = (catalog: HomeCatalog): HomeProfile =>
  findHome(catalog, catalog.activeHomeId);

export const createHomeProfile = (
  catalog: HomeCatalog,
  options: CreateHomeOptions,
): HomeCatalogMutationResult => {
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);
  const homeId = options.createId();

  return {
    homeId,
    catalog: {
      ...catalog,
      homes: [...catalog.homes, { id: homeId, name, contents: createEmptyContents() }],
    },
  };
};

export const copyHomeProfile = (
  catalog: HomeCatalog,
  options: CopyHomeOptions,
): HomeCatalogMutationResult => {
  const source = findHome(catalog, options.sourceHomeId);
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);
  const homeId = options.createId();

  return {
    homeId,
    catalog: {
      ...catalog,
      homes: [...catalog.homes, { id: homeId, name, contents: structuredClone(source.contents) }],
    },
  };
};

export const renameHomeProfile = (
  catalog: HomeCatalog,
  homeId: string,
  name: string,
): HomeCatalog => {
  findHome(catalog, homeId);
  const normalized = normalizeName(name);
  assertUniqueName(catalog, normalized, homeId);
  return {
    ...catalog,
    homes: catalog.homes.map((home) => (home.id === homeId ? { ...home, name: normalized } : home)),
  };
};

export const deleteHomeProfile = (catalog: HomeCatalog, homeId: string): HomeCatalog => {
  findHome(catalog, homeId);
  if (catalog.activeHomeId === homeId) {
    throw new HomeCatalogError('HOME_IS_ACTIVE', '不能删除当前启用主页岗位');
  }
  if (catalog.homes.length === 1) {
    throw new HomeCatalogError('LAST_HOME', '至少保留一个主页岗位');
  }
  return { ...catalog, homes: catalog.homes.filter((home) => home.id !== homeId) };
};

export const setActiveHomeProfile = (catalog: HomeCatalog, homeId: string): HomeCatalog => {
  findHome(catalog, homeId);
  return { ...catalog, activeHomeId: homeId };
};

export const updateHomeContent = (
  catalog: HomeCatalog,
  homeId: string,
  language: CatalogLanguage,
  content: HomeData,
): HomeCatalog => {
  findHome(catalog, homeId);
  if (!isHomeData(content)) {
    throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页内容格式无效');
  }
  return {
    ...catalog,
    homes: catalog.homes.map((home) =>
      home.id === homeId
        ? { ...home, contents: { ...home.contents, [language]: structuredClone(content) } }
        : home,
    ),
  };
};
