import { LoginRateLimiter } from './auth/rate-limit';
import { verifyPassword } from './auth/password';
import { issueAdminToken, verifyAdminToken } from './auth/token';
import {
  copyHomeProfile,
  createHomeProfile,
  deleteHomeProfile,
  getActiveHomeProfile,
  renameHomeProfile,
  setActiveHomeProfile,
  updateHomeContent,
  validateHomeCatalog,
} from './catalogs/home-catalog';
import {
  copyResumeProfile,
  createResumeProfile,
  deleteResumeProfile,
  getActiveResumeProfile,
  renameResumeProfile,
  setActiveResumeProfile,
  updateResumeContent,
  validateResumeCatalog,
} from './catalogs/resume-catalog';
import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type HomeCatalog,
  type HomeData,
  type ResumeCatalog,
  type ResumeData,
} from './catalogs/types';
import type { Env } from './env';
import { HttpError } from './http/errors';
import { errorResponse, jsonResponse } from './http/json';
import { KvCatalogRepository } from './storage/kv-catalog-repository';

const createRepositories = (env: Env) => ({
  home: new KvCatalogRepository<HomeCatalog>({
    namespace: env.CATALOG_KV,
    key: 'catalog:home',
    validate: validateHomeCatalog,
  }),
  resume: new KvCatalogRepository<ResumeCatalog>({
    namespace: env.CATALOG_KV,
    key: 'catalog:resume',
    validate: validateResumeCatalog,
  }),
});

const publicResponse = (revision: number, profile: unknown, resource: string): Response =>
  jsonResponse(
    { revision, profile },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        ETag: `"${resource}-r${revision}"`,
      },
    },
  );

const parsePositiveInteger = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const readJsonObject = async (request: Request): Promise<Record<string, unknown>> => {
  try {
    const body = (await request.json()) as unknown;
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
  } catch {
    // 统一在下方返回参数错误。
  }
  throw new HttpError(400, 'INVALID_REQUEST', '请求参数无效');
};

const requireRevision = (body: Record<string, unknown>): number => {
  if (!Number.isSafeInteger(body.revision) || (body.revision as number) < 1) {
    throw new HttpError(400, 'INVALID_REQUEST', '请求版本无效');
  }
  return body.revision as number;
};

const isLanguage = (value: unknown): value is CatalogLanguage =>
  typeof value === 'string' && CATALOG_LANGUAGES.some((language) => language === value);

const requireAdmin = async (request: Request, env: Env): Promise<void> => {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'AUTH_REQUIRED', '请先完成管理员登录');
  }
  const payload = await verifyAdminToken(
    authorization.slice('Bearer '.length),
    env.AUTH_SIGNING_SECRET,
  );
  if (!payload) throw new HttpError(401, 'INVALID_TOKEN', '管理员会话已失效');
};

const handleLogin = async (request: Request, env: Env): Promise<Response> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', '登录请求参数无效');
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body) ||
    typeof (body as Record<string, unknown>).password !== 'string'
  ) {
    return errorResponse(400, 'INVALID_REQUEST', '登录请求参数无效');
  }

  const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const limiter = new LoginRateLimiter(env.CATALOG_KV, {
    limit: parsePositiveInteger(env.LOGIN_FAILURE_LIMIT, 5),
    cooldownSeconds: parsePositiveInteger(env.LOGIN_COOLDOWN_SECONDS, 900),
    salt: env.AUTH_RATE_LIMIT_SALT,
  });

  if (await limiter.isBlocked(clientIp)) {
    return errorResponse(429, 'TOO_MANY_ATTEMPTS', '登录尝试过多，请稍后重试');
  }

  const password = (body as { password: string }).password;
  if (!(await verifyPassword(password, env.ADMIN_PASSWORD_HASH))) {
    await limiter.recordFailure(clientIp);
    return errorResponse(401, 'INVALID_CREDENTIALS', '管理员密码错误');
  }

  await limiter.clear(clientIp);
  const result = await issueAdminToken(env.AUTH_SIGNING_SECRET, {
    ttlSeconds: parsePositiveInteger(env.TOKEN_TTL_SECONDS, 7200),
  });
  return jsonResponse(result, { headers: { 'Cache-Control': 'no-store' } });
};

export const routeRequest = async (request: Request, env: Env): Promise<Response> => {
  const { pathname } = new URL(request.url);

  if (request.method === 'GET' && pathname === '/api/health') {
    return jsonResponse({
      ok: true,
      service: 'resume-api',
      version: '0.1.0',
      currentTime: new Date().toISOString(),
    });
  }

  const repositories = createRepositories(env);
  if (request.method === 'GET' && pathname === '/api/public/home') {
    const envelope = await repositories.home.read();
    return publicResponse(envelope.revision, getActiveHomeProfile(envelope.catalog), 'home');
  }
  if (request.method === 'GET' && pathname === '/api/public/resume') {
    const envelope = await repositories.resume.read();
    return publicResponse(envelope.revision, getActiveResumeProfile(envelope.catalog), 'resume');
  }
  if (request.method === 'POST' && pathname === '/api/auth/login') {
    return handleLogin(request, env);
  }

  if (pathname.startsWith('/api/home-catalog') || pathname.startsWith('/api/resume-catalog')) {
    await requireAdmin(request, env);
  }

  if (request.method === 'GET' && pathname === '/api/home-catalog') {
    const { revision, catalog } = await repositories.home.read();
    return jsonResponse({ revision, catalog }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (request.method === 'GET' && pathname === '/api/resume-catalog') {
    const { revision, catalog } = await repositories.resume.read();
    return jsonResponse({ revision, catalog }, { headers: { 'Cache-Control': 'no-store' } });
  }

  if (request.method === 'PUT' && pathname === '/api/home-catalog/content') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (
      typeof body.homeId !== 'string' ||
      !isLanguage(body.language) ||
      typeof body.content !== 'object' ||
      body.content === null
    ) {
      throw new HttpError(400, 'INVALID_REQUEST', '主页内容请求参数无效');
    }
    const current = await repositories.home.read();
    const updated = await repositories.home.write(
      revision,
      updateHomeContent(current.catalog, body.homeId, body.language, body.content as HomeData),
    );
    return jsonResponse(
      { revision: updated.revision, catalog: updated.catalog },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (request.method === 'PUT' && pathname === '/api/resume-catalog/content') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (
      typeof body.resumeId !== 'string' ||
      !isLanguage(body.language) ||
      typeof body.content !== 'object' ||
      body.content === null
    ) {
      throw new HttpError(400, 'INVALID_REQUEST', '简历内容请求参数无效');
    }
    const current = await repositories.resume.read();
    const updated = await repositories.resume.write(
      revision,
      updateResumeContent(
        current.catalog,
        body.resumeId,
        body.language,
        body.content as ResumeData,
      ),
    );
    return jsonResponse(
      { revision: updated.revision, catalog: updated.catalog },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (request.method === 'POST' && pathname === '/api/home-catalog/homes') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (
      typeof body.name !== 'string' ||
      (body.mode !== 'empty' && body.mode !== 'copy') ||
      (body.mode === 'copy' && typeof body.sourceHomeId !== 'string')
    ) {
      throw new HttpError(400, 'INVALID_REQUEST', '创建主页岗位请求参数无效');
    }
    const current = await repositories.home.read();
    const result =
      body.mode === 'copy'
        ? copyHomeProfile(current.catalog, {
            name: body.name,
            sourceHomeId: body.sourceHomeId as string,
            createId: crypto.randomUUID,
          })
        : createHomeProfile(current.catalog, { name: body.name, createId: crypto.randomUUID });
    const updated = await repositories.home.write(revision, result.catalog);
    return jsonResponse(
      { revision: updated.revision, catalog: updated.catalog, homeId: result.homeId },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (request.method === 'POST' && pathname === '/api/resume-catalog/resumes') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (
      typeof body.name !== 'string' ||
      (body.mode !== 'empty' && body.mode !== 'copy') ||
      (body.mode === 'copy' && typeof body.sourceResumeId !== 'string')
    ) {
      throw new HttpError(400, 'INVALID_REQUEST', '创建岗位请求参数无效');
    }
    const current = await repositories.resume.read();
    const result =
      body.mode === 'copy'
        ? copyResumeProfile(current.catalog, {
            name: body.name,
            sourceResumeId: body.sourceResumeId as string,
            createId: crypto.randomUUID,
          })
        : createResumeProfile(current.catalog, { name: body.name, createId: crypto.randomUUID });
    const updated = await repositories.resume.write(revision, result.catalog);
    return jsonResponse(
      { revision: updated.revision, catalog: updated.catalog, resumeId: result.resumeId },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const homeMatch = pathname.match(/^\/api\/home-catalog\/homes\/([^/]+)$/);
  if (homeMatch && (request.method === 'PATCH' || request.method === 'DELETE')) {
    const homeId = decodeURIComponent(homeMatch[1]);
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    const current = await repositories.home.read();
    let catalog: HomeCatalog;
    if (request.method === 'PATCH') {
      if (typeof body.name !== 'string') {
        throw new HttpError(400, 'INVALID_REQUEST', '重命名请求参数无效');
      }
      catalog = renameHomeProfile(current.catalog, homeId, body.name);
    } else {
      catalog = deleteHomeProfile(current.catalog, homeId);
    }
    const updated = await repositories.home.write(revision, catalog);
    return jsonResponse({ revision: updated.revision, catalog: updated.catalog });
  }

  const resumeMatch = pathname.match(/^\/api\/resume-catalog\/resumes\/([^/]+)$/);
  if (resumeMatch && (request.method === 'PATCH' || request.method === 'DELETE')) {
    const resumeId = decodeURIComponent(resumeMatch[1]);
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    const current = await repositories.resume.read();
    let catalog: ResumeCatalog;
    if (request.method === 'PATCH') {
      if (typeof body.name !== 'string') {
        throw new HttpError(400, 'INVALID_REQUEST', '重命名请求参数无效');
      }
      catalog = renameResumeProfile(current.catalog, resumeId, body.name);
    } else {
      catalog = deleteResumeProfile(current.catalog, resumeId);
    }
    const updated = await repositories.resume.write(revision, catalog);
    return jsonResponse({ revision: updated.revision, catalog: updated.catalog });
  }

  if (request.method === 'PUT' && pathname === '/api/home-catalog/active') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (typeof body.homeId !== 'string') {
      throw new HttpError(400, 'INVALID_REQUEST', '启用主页岗位请求参数无效');
    }
    const current = await repositories.home.read();
    const updated = await repositories.home.write(
      revision,
      setActiveHomeProfile(current.catalog, body.homeId),
    );
    return jsonResponse({ revision: updated.revision, catalog: updated.catalog });
  }

  if (request.method === 'PUT' && pathname === '/api/resume-catalog/active') {
    const body = await readJsonObject(request);
    const revision = requireRevision(body);
    if (typeof body.resumeId !== 'string') {
      throw new HttpError(400, 'INVALID_REQUEST', '启用岗位请求参数无效');
    }
    const current = await repositories.resume.read();
    const updated = await repositories.resume.write(
      revision,
      setActiveResumeProfile(current.catalog, body.resumeId),
    );
    return jsonResponse({ revision: updated.revision, catalog: updated.catalog });
  }

  return errorResponse(404, 'NOT_FOUND', '接口不存在');
};
