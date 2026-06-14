import {
  HOME_LANGUAGES,
  type HomeCatalog,
  type HomeCatalogMutationResult,
  type HomeData,
  type HomeLanguage,
  type HomeProfile,
} from '../../../types';

export type HomeCatalogErrorCode =
  | 'ACTIVE_HOME_NOT_FOUND'
  | 'DUPLICATE_HOME_NAME'
  | 'HOME_IS_ACTIVE'
  | 'HOME_NOT_FOUND'
  | 'INVALID_HOME_CATALOG'
  | 'INVALID_HOME_NAME'
  | 'LAST_HOME';

export class HomeCatalogError extends Error {
  code: HomeCatalogErrorCode;

  constructor(code: HomeCatalogErrorCode, message: string) {
    super(message);
    this.name = 'HomeCatalogError';
    this.code = code;
  }
}

interface CreateHomeProfileOptions {
  name: string;
  createId: () => string;
}

interface CopyHomeProfileOptions extends CreateHomeProfileOptions {
  sourceHomeId: string;
}

const clone = <T>(value: T): T => structuredClone(value);

const normalizeName = (name: string): string => {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new HomeCatalogError('INVALID_HOME_NAME', '请输入主页岗位名称');
  }

  return normalizedName;
};

const findHome = (catalog: HomeCatalog, homeId: string): HomeProfile => {
  const home = catalog.homes.find((item) => item.id === homeId);

  if (!home) {
    throw new HomeCatalogError('HOME_NOT_FOUND', '未找到指定主页岗位');
  }

  return home;
};

const assertUniqueName = (catalog: HomeCatalog, name: string, excludedHomeId?: string): void => {
  const duplicated = catalog.homes.some((home) => home.id !== excludedHomeId && home.name === name);

  if (duplicated) {
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

const createEmptyContents = (): Record<HomeLanguage, HomeData> => ({
  'zh-CN': createEmptyHomeData(),
  'en-US': createEmptyHomeData(),
  'ja-JP': createEmptyHomeData(),
});

export const validateHomeCatalog = (catalog: HomeCatalog): void => {
  if (catalog.schemaVersion !== 1 || catalog.homes.length === 0) {
    throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页目录格式无效');
  }

  const ids = new Set<string>();
  const names = new Set<string>();

  catalog.homes.forEach((home) => {
    const name = normalizeName(home.name);

    if (!home.id || ids.has(home.id) || names.has(name)) {
      throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页目录包含重复岗位');
    }

    HOME_LANGUAGES.forEach((language) => {
      if (!home.contents[language]) {
        throw new HomeCatalogError('INVALID_HOME_CATALOG', '主页岗位缺少语言内容');
      }
    });

    ids.add(home.id);
    names.add(name);
  });

  if (!ids.has(catalog.activeHomeId)) {
    throw new HomeCatalogError('ACTIVE_HOME_NOT_FOUND', '未找到当前启用主页岗位');
  }
};

export const getActiveHomeContent = (catalog: HomeCatalog, language: HomeLanguage): HomeData => {
  const activeHome = findHome(catalog, catalog.activeHomeId);
  return activeHome.contents[language] ?? activeHome.contents['zh-CN'];
};

export const createHomeProfile = (
  catalog: HomeCatalog,
  options: CreateHomeProfileOptions,
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
  options: CopyHomeProfileOptions,
): HomeCatalogMutationResult => {
  const sourceHome = findHome(catalog, options.sourceHomeId);
  const name = normalizeName(options.name);
  assertUniqueName(catalog, name);
  const homeId = options.createId();

  return {
    homeId,
    catalog: {
      ...catalog,
      homes: [
        ...catalog.homes,
        {
          id: homeId,
          name,
          contents: clone(sourceHome.contents),
        },
      ],
    },
  };
};

export const renameHomeProfile = (
  catalog: HomeCatalog,
  homeId: string,
  name: string,
): HomeCatalog => {
  findHome(catalog, homeId);
  const normalizedName = normalizeName(name);
  assertUniqueName(catalog, normalizedName, homeId);

  return {
    ...catalog,
    homes: catalog.homes.map((home) =>
      home.id === homeId ? { ...home, name: normalizedName } : home,
    ),
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

  return {
    ...catalog,
    homes: catalog.homes.filter((home) => home.id !== homeId),
  };
};

export const setActiveHomeProfile = (catalog: HomeCatalog, homeId: string): HomeCatalog => {
  findHome(catalog, homeId);
  return { ...catalog, activeHomeId: homeId };
};

export const updateHomeContent = (
  catalog: HomeCatalog,
  homeId: string,
  language: HomeLanguage,
  content: HomeData,
): HomeCatalog => {
  findHome(catalog, homeId);

  return {
    ...catalog,
    homes: catalog.homes.map((home) =>
      home.id === homeId
        ? { ...home, contents: { ...home.contents, [language]: clone(content) } }
        : home,
    ),
  };
};
