#!/usr/bin/env node

import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { format, resolveConfig } from 'prettier';

const DEFAULT_API_BASE_URL = 'https://resume-api.narcissus2ma.dpdns.org';
const DEFAULT_TIMEOUT_MS = 10_000;
const HOME_PATHNAME = '/api/public/home';
const RESUME_PATHNAME = '/api/public/resume';
const HOME_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'];
const RESUME_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'];
const execFileAsync = promisify(execFile);
const CURL_STATUS_MARKER = '__RESUME_PUBLIC_DATA_HTTP_STATUS__';

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value) => typeof value === 'string';

const isNonEmptyString = (value) => isString(value) && value.trim().length > 0;

const assertCondition = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertStringArray = (value, message) => {
  assertCondition(Array.isArray(value) && value.every(isString), message);
};

const assertOptionalStringArray = (value, message) => {
  if (value !== undefined) assertStringArray(value, message);
};

const assertHomeData = (content) => {
  assertCondition(isRecord(content), '主页内容格式无效');
  assertCondition(
    isString(content.occupation) &&
      isString(content.description) &&
      isString(content.skillSectionDescription),
    '主页基础内容格式无效',
  );
  assertCondition(Array.isArray(content.skillHighlights), '主页技能亮点格式无效');
  content.skillHighlights.forEach((highlight) => {
    assertCondition(
      isRecord(highlight) &&
        isNonEmptyString(highlight.id) &&
        isString(highlight.icon) &&
        isString(highlight.title) &&
        isString(highlight.description),
      '主页技能亮点格式无效',
    );
  });
  assertCondition(Array.isArray(content.skills), '主页技能格式无效');
  content.skills.forEach((skill) => {
    assertCondition(
      isRecord(skill) && isString(skill.name) && typeof skill.value === 'number',
      '主页技能格式无效',
    );
  });
  assertCondition(Array.isArray(content.experiences), '主页经历格式无效');
  content.experiences.forEach((experience) => {
    assertCondition(
      isRecord(experience) &&
        isString(experience.year) &&
        isString(experience.title) &&
        isString(experience.company) &&
        isString(experience.description),
      '主页经历格式无效',
    );
  });
  assertCondition(Array.isArray(content.projects), '主页项目格式无效');
  content.projects.forEach((project) => {
    assertCondition(
      isRecord(project) &&
        isString(project.title) &&
        isString(project.description) &&
        isString(project.image) &&
        isString(project.link),
      '主页项目格式无效',
    );
  });
};

const assertResumeData = (content) => {
  assertCondition(isRecord(content), '简历内容格式无效');
  assertCondition(isRecord(content.basicInfo), '简历基础信息格式无效');
  assertCondition(
    isString(content.basicInfo.title) && Array.isArray(content.basicInfo.skills),
    '简历基础信息格式无效',
  );
  content.basicInfo.skills.forEach((skill) => {
    assertCondition(
      isRecord(skill) && isString(skill.category) && Array.isArray(skill.items),
      '简历技能格式无效',
    );
    assertStringArray(skill.items, '简历技能项格式无效');
  });
  assertStringArray(content.basicInfo.skillDescriptions, '简历技能描述格式无效');

  assertCondition(Array.isArray(content.experience), '简历经历格式无效');
  content.experience.forEach((experience) => {
    assertCondition(
      isRecord(experience) &&
        isString(experience.company) &&
        isString(experience.position) &&
        isString(experience.period),
      '简历经历格式无效',
    );
    assertOptionalStringArray(experience.achievements, '简历经历成果格式无效');
  });

  assertCondition(Array.isArray(content.projects), '简历项目格式无效');
  content.projects.forEach((project) => {
    assertCondition(
      isRecord(project) &&
        isString(project.name) &&
        isString(project.period) &&
        isString(project.description),
      '简历项目格式无效',
    );
    assertOptionalStringArray(project.responsibilities, '简历项目职责格式无效');
  });

  assertCondition(Array.isArray(content.education), '简历教育经历格式无效');
  content.education.forEach((education) => {
    assertCondition(
      isRecord(education) &&
        isString(education.school) &&
        isString(education.degree) &&
        isString(education.period),
      '简历教育经历格式无效',
    );
    assertOptionalStringArray(education.achievements, '简历教育成果格式无效');
  });

  assertCondition(Array.isArray(content.website), '简历网站格式无效');
  content.website.forEach((website) => {
    assertCondition(
      isRecord(website) && isString(website.name) && isString(website.url),
      '简历网站格式无效',
    );
  });
  if (content.correctToken !== undefined) {
    assertCondition(isString(content.correctToken), '简历校验字段格式无效');
  }
};

const assertProfile = (profile, kind) => {
  assertCondition(
    isRecord(profile) && isNonEmptyString(profile.id) && isNonEmptyString(profile.name),
    `${kind === 'home' ? '主页' : '简历'}岗位格式无效`,
  );
  assertCondition(isRecord(profile.contents), '岗位多语言内容格式无效');

  const languages = kind === 'home' ? HOME_LANGUAGES : RESUME_LANGUAGES;
  languages.forEach((language) => {
    assertCondition(profile.contents[language] !== undefined, `岗位缺少${language}内容`);
    if (kind === 'home') assertHomeData(profile.contents[language]);
    else assertResumeData(profile.contents[language]);
  });
};

const catalogSpec = {
  home: { activeKey: 'activeHomeId', profilesKey: 'homes' },
  resume: { activeKey: 'activeResumeId', profilesKey: 'resumes' },
};

const assertCatalog = (catalog, kind) => {
  const { activeKey, profilesKey } = catalogSpec[kind];
  assertCondition(
    isRecord(catalog) && catalog.schemaVersion === 1 && Array.isArray(catalog[profilesKey]),
    `${kind === 'home' ? '主页' : '简历'}本地目录格式无效`,
  );
  assertCondition(catalog[profilesKey].length > 0, '本地目录至少需要一个岗位');
  assertCondition(isNonEmptyString(catalog[activeKey]), '本地目录缺少启用岗位');

  const ids = new Set();
  const names = new Set();
  catalog[profilesKey].forEach((profile) => {
    assertProfile(profile, kind);
    assertCondition(!ids.has(profile.id) && !names.has(profile.name), '本地目录包含重复岗位');
    ids.add(profile.id);
    names.add(profile.name);
  });
  assertCondition(ids.has(catalog[activeKey]), '本地目录启用岗位不存在');
};

export class PublicDataSyncError extends Error {
  constructor(category, pathname, status) {
    super('公开数据同步失败');
    this.name = 'PublicDataSyncError';
    this.category = category;
    this.pathname = pathname;
    if (status !== undefined) this.status = status;
  }
}

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/+$/, '');

const fetchWithCurl = async (input, init = {}) => {
  const { stdout } = await execFileAsync(
    'curl',
    [
      '--silent',
      '--show-error',
      '--location',
      '--max-time',
      '15',
      '--header',
      'Accept: application/json',
      '--write-out',
      `\n${CURL_STATUS_MARKER}%{http_code}`,
      String(input),
    ],
    {
      maxBuffer: 2 * 1024 * 1024,
      signal: init.signal,
    },
  );
  const marker = `\n${CURL_STATUS_MARKER}`;
  const markerIndex = stdout.lastIndexOf(marker);
  if (markerIndex < 0) throw new Error('curl 未返回 HTTP 状态');
  const status = Number(stdout.slice(markerIndex + marker.length).trim());
  return new Response(stdout.slice(0, markerIndex), { status });
};

const defaultFetcher = async (input, init) => {
  try {
    return await globalThis.fetch(input, init);
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    return fetchWithCurl(input, init);
  }
};

const parsePublicResponse = (value, kind) => {
  assertCondition(
    isRecord(value) && Number.isSafeInteger(value.revision) && isRecord(value.profile),
    '公开接口响应格式无效',
  );
  assertProfile(value.profile, kind);
  return { revision: value.revision, profile: value.profile };
};

const fetchPublicProfile = async ({ baseUrl, pathname, kind, fetcher, timeoutMs }) => {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    let response;
    try {
      response = await fetcher(`${baseUrl}${pathname}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
    } catch {
      throw new PublicDataSyncError(timedOut ? 'timeout' : 'network_error', pathname);
    }

    if (!response.ok) {
      throw new PublicDataSyncError('http_error', pathname, response.status);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new PublicDataSyncError('invalid_json', pathname);
    }

    try {
      return parsePublicResponse(payload, kind);
    } catch {
      throw new PublicDataSyncError('invalid_payload', pathname);
    }
  } finally {
    clearTimeout(timeout);
  }
};

export const mergePublicProfile = (catalog, profile, kind) => {
  const { activeKey, profilesKey } = catalogSpec[kind];
  const profiles = catalog[profilesKey].map((item) => item);
  const profileIndex = profiles.findIndex((item) => item.id === profile.id);
  const sameNameIndex = profiles.findIndex((item) => item.name === profile.name);

  if (profileIndex >= 0) {
    assertCondition(sameNameIndex < 0 || sameNameIndex === profileIndex, '同步后的岗位名称重复');
    profiles[profileIndex] = profile;
  } else if (sameNameIndex >= 0) {
    profiles[sameNameIndex] = profile;
  } else {
    profiles.push(profile);
  }

  const nextCatalog = { ...catalog, [activeKey]: profile.id, [profilesKey]: profiles };
  assertCatalog(nextCatalog, kind);
  return nextCatalog;
};

const readCatalog = async (filePath, kind) => {
  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    throw new Error(`${kind === 'home' ? '主页' : '简历'}本地目录读取失败`);
  }

  let catalog;
  try {
    catalog = JSON.parse(content);
  } catch {
    throw new Error(`${kind === 'home' ? '主页' : '简历'}本地目录 JSON 无效`);
  }
  assertCatalog(catalog, kind);
  return catalog;
};

const writeJsonIfChanged = async (filePath, value) => {
  const prettierConfig = await resolveConfig(filePath);
  const nextContent = await format(JSON.stringify(value), {
    ...(prettierConfig ?? {}),
    parser: 'json',
  });
  let currentContent = null;
  try {
    currentContent = await fs.readFile(filePath, 'utf8');
  } catch {
    // 文件不存在时直接创建。
  }
  if (currentContent === nextContent) return false;

  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(tempPath, nextContent, 'utf8');
    await fs.rename(tempPath, filePath);
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
  }
  return true;
};

export const syncPublicData = async ({
  baseUrl = process.env.VITE_RESUME_API_BASE_URL || DEFAULT_API_BASE_URL,
  homePath = path.resolve(process.cwd(), 'src/data/home-catalog.json'),
  resumePath = path.resolve(process.cwd(), 'src/data/resume-catalog.json'),
  fetcher = defaultFetcher,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) => {
  assertCondition(typeof fetcher === 'function', '当前 Node.js 不支持 fetch');
  assertCondition(Number.isFinite(timeoutMs) && timeoutMs > 0, '同步超时时间无效');
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  assertCondition(normalizedBaseUrl.length > 0, 'API 基地址为空');

  const [homeResult, resumeResult, homeCatalog, resumeCatalog] = await Promise.all([
    fetchPublicProfile({
      baseUrl: normalizedBaseUrl,
      fetcher,
      kind: 'home',
      pathname: HOME_PATHNAME,
      timeoutMs,
    }),
    fetchPublicProfile({
      baseUrl: normalizedBaseUrl,
      fetcher,
      kind: 'resume',
      pathname: RESUME_PATHNAME,
      timeoutMs,
    }),
    readCatalog(homePath, 'home'),
    readCatalog(resumePath, 'resume'),
  ]);

  const nextHomeCatalog = mergePublicProfile(homeCatalog, homeResult.profile, 'home');
  const nextResumeCatalog = mergePublicProfile(resumeCatalog, resumeResult.profile, 'resume');
  const [homeChanged, resumeChanged] = await Promise.all([
    writeJsonIfChanged(homePath, nextHomeCatalog),
    writeJsonIfChanged(resumePath, nextResumeCatalog),
  ]);

  return {
    homeChanged,
    homeRevision: homeResult.revision,
    resumeChanged,
    resumeRevision: resumeResult.revision,
  };
};

const getConfiguredTimeout = () => {
  const configuredTimeout = Number(process.env.VITE_PUBLIC_API_TIMEOUT_MS);
  return Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;
};

const parseArguments = (args) => {
  const strict = args.includes('--strict');
  const baseUrlArgument = args.find((arg) => arg.startsWith('--base-url='));
  return {
    baseUrl: baseUrlArgument?.slice('--base-url='.length) || undefined,
    strict,
  };
};

const formatFailure = (error) => {
  if (!(error instanceof PublicDataSyncError)) return '本地公开数据读取或写入失败';
  const status = error.status === undefined ? '' : `，HTTP ${error.status}`;
  return `${error.pathname}：${error.category}${status}`;
};

const run = async () => {
  const { baseUrl, strict } = parseArguments(process.argv.slice(2));
  try {
    const result = await syncPublicData({ baseUrl, timeoutMs: getConfiguredTimeout() });
    const changedFiles = [
      result.homeChanged ? 'home-catalog.json' : '',
      result.resumeChanged ? 'resume-catalog.json' : '',
    ].filter(Boolean);
    console.log(
      `公开数据同步完成：主页 revision ${result.homeRevision}，简历 revision ${result.resumeRevision}。` +
        (changedFiles.length > 0 ? `已更新 ${changedFiles.join('、')}。` : '本地快照已是最新。'),
    );
  } catch (error) {
    console.warn(`公开数据同步未完成（${formatFailure(error)}），已保留本地快照。`);
    if (strict) process.exitCode = 1;
  }
};

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) await run();

export { parsePublicResponse };
