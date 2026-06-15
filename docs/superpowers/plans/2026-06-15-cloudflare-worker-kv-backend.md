# Cloudflare Worker KV Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将开发环境 Express 文件后端迁移为 `cloudflare/` 内可独立部署的原生 Worker + KV 后端，并让两个线上前端安全读取公开数据和使用密码鉴权管理数据。

**Architecture:** Worker 使用自包含的 TypeScript 领域规则、Web Crypto 鉴权、KV Repository 和原生 `fetch` 路由；公开 API 匿名返回当前启用岗位，管理 API 使用短期 Bearer Token。前端首屏读取打包 JSON，异步使用 Worker 数据覆盖，管理页面通过统一会话上下文、登录弹窗和路由守卫访问完整目录。

**Tech Stack:** Cloudflare Workers、Workers KV、Wrangler、TypeScript、Web Crypto、Vitest、`@cloudflare/vitest-pool-workers`、React 18、React Router 7、Ant Design 5、Node test runner、Vite、pnpm

---

## 参考规格

- `docs/superpowers/specs/2026-06-15-cloudflare-worker-kv-backend-design.md`
- [Workers KV 工作原理](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Workers KV 限制](https://developers.cloudflare.com/kv/platform/limits/)
- [Workers Vitest 集成](https://developers.cloudflare.com/workers/testing/vitest-integration/)
- [Wrangler 配置](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Worker Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

## 实施约束

- 使用 `superpowers:test-driven-development`：每个行为先写失败测试，再写最小实现。
- 完成每个任务后运行该任务的定向测试；阶段完成后运行完整检查。
- `cloudflare/` 不得导入根目录 `src/` 的类型、规则或运行时代码。
- 代码注释和占位文本使用中文。
- TypeScript 数据结构优先使用 `interface`，禁止无必要的 `any`。
- React 只使用函数组件与 Hooks。
- 不提交 `cloudflare/.dev.vars`、Wrangler 本地状态、线上备份或任何 Secret。
- 不在生产 CORS 中使用通配符来源。
- 不在 Worker 迁移完成前删除旧 Express 实现。

## 文件结构

### Worker 新增

- `cloudflare/package.json`
- `cloudflare/pnpm-lock.yaml`
- `cloudflare/tsconfig.json`
- `cloudflare/.eslintrc.cjs`
- `cloudflare/prettier.config.mjs`
- `cloudflare/vitest.config.ts`
- `cloudflare/wrangler.jsonc`
- `cloudflare/.dev.vars.example`
- `cloudflare/README.md`
- `cloudflare/src/index.ts`
- `cloudflare/src/env.ts`
- `cloudflare/src/router.ts`
- `cloudflare/src/http/cors.ts`
- `cloudflare/src/http/errors.ts`
- `cloudflare/src/http/json.ts`
- `cloudflare/src/auth/password.ts`
- `cloudflare/src/auth/token.ts`
- `cloudflare/src/auth/rate-limit.ts`
- `cloudflare/src/catalogs/types.ts`
- `cloudflare/src/catalogs/home-catalog.ts`
- `cloudflare/src/catalogs/resume-catalog.ts`
- `cloudflare/src/catalogs/service.ts`
- `cloudflare/src/storage/catalog-repository.ts`
- `cloudflare/src/storage/kv-catalog-repository.ts`
- `cloudflare/seeds/home-catalog.json`
- `cloudflare/seeds/resume-catalog.json`
- `cloudflare/scripts/generate-password-hash.mjs`
- `cloudflare/scripts/initialize-catalogs.mjs`
- `cloudflare/scripts/export-catalogs.mjs`
- `cloudflare/scripts/restore-catalogs.mjs`
- `cloudflare/tests/catalog-rules.test.ts`
- `cloudflare/tests/password.test.ts`
- `cloudflare/tests/token.test.ts`
- `cloudflare/tests/rate-limit.test.ts`
- `cloudflare/tests/repository.test.ts`
- `cloudflare/tests/worker-public.test.ts`
- `cloudflare/tests/worker-auth.test.ts`
- `cloudflare/tests/worker-management.test.ts`
- `cloudflare/tests/worker-cors.test.ts`
- `cloudflare/tests/scripts.test.mjs`

### 前端新增

- `src/services/api-client.ts`
- `src/services/admin-auth-api.ts`
- `src/services/public-catalog-api.ts`
- `src/auth/admin-session.ts`
- `src/auth/admin-auth-context.tsx`
- `src/components/admin-login-modal.tsx`
- `src/components/admin-route-guard.tsx`
- `src/components/admin-entry-link.tsx`
- `src/domain/catalog/public-catalog.ts`
- `src/domain/admin/management-state.ts`
- `src/hooks/use-public-catalog.ts`
- `tests/api-client.test.ts`
- `tests/admin-session.test.ts`
- `tests/admin-auth-api.test.ts`
- `tests/public-catalog.test.ts`
- `tests/admin-management-state.test.ts`

### 前端修改

- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `src/main.tsx`
- `src/router/index.tsx`
- `src/components/header.tsx`
- `src/pages/resume/resume.tsx`
- `src/hooks/use-translated-data.ts`
- `src/hooks/use-home-profile-management.ts`
- `src/hooks/use-resume-profile-management.ts`
- `src/services/home-api.ts`
- `src/services/resume-api.ts`
- `src/types/index.ts`
- `src/types/resume.ts`
- `src/types/env.d.ts`
- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en-US.json`
- `src/i18n/locales/ja-JP.json`
- `tests/home-api.test.ts`
- `tests/resume-api.test.ts`

### 最终删除

- `server.ts`
- `tsconfig.server.json`
- `src/server/create-server.ts`
- `src/server/home-catalog-repository.ts`
- `src/server/resume-catalog-repository.ts`
- `src/hooks/use-backend-status.ts`
- `tests/home-server.test.ts`
- `tests/resume-server.test.ts`

## Task 1：搭建独立 Worker 工程

**Files:**

- Create: `cloudflare/package.json`
- Create: `cloudflare/pnpm-lock.yaml`
- Create: `cloudflare/tsconfig.json`
- Create: `cloudflare/.eslintrc.cjs`
- Create: `cloudflare/prettier.config.mjs`
- Create: `cloudflare/vitest.config.ts`
- Create: `cloudflare/wrangler.jsonc`
- Create: `cloudflare/.dev.vars.example`
- Create: `cloudflare/src/env.ts`
- Create: `cloudflare/src/index.ts`
- Create: `cloudflare/tests/worker-public.test.ts`
- Modify: `.gitignore`

- [ ] **Step 1：写最小 Worker 失败测试**

在 `cloudflare/tests/worker-public.test.ts` 中先断言：

```typescript
const response = await SELF.fetch('https://api.example.com/api/health');
assert.equal(response.status, 200);
const payload = await response.json();
assert.equal(payload.ok, true);
assert.equal(payload.service, 'resume-api');
assert.equal(typeof payload.version, 'string');
assert.equal(typeof payload.currentTime, 'string');
```

- [ ] **Step 2：创建独立包配置**

`cloudflare/package.json` 至少提供：

```json
{
  "name": "resume-cloudflare-worker",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --persist-to .wrangler/state",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,mjs --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "build": "wrangler deploy --dry-run --outdir dist",
    "deploy": "wrangler deploy"
  }
}
```

安装 Worker 开发依赖：`wrangler`、`vitest`、`@cloudflare/vitest-pool-workers`、`typescript`、`@cloudflare/workers-types`、ESLint 和 Prettier。

独立 ESLint 配置启用 TypeScript parser、未使用变量检查和 Prettier 冲突关闭；独立 Prettier 配置与根项目风格保持一致。

- [ ] **Step 3：配置 Wrangler 与测试池**

`wrangler.jsonc` 定义：

- `main: "src/index.ts"`
- `compatibility_date`
- `CATALOG_KV` 的生产与预览绑定占位符
- `ALLOWED_ORIGINS`
- `TOKEN_TTL_SECONDS: "7200"`
- `LOGIN_FAILURE_LIMIT`
- `LOGIN_COOLDOWN_SECONDS`

真实 Namespace ID 使用清晰占位符，部署前必须替换。

- [ ] **Step 4：忽略本地和敏感文件**

在根 `.gitignore` 增加：

```gitignore
cloudflare/.dev.vars
cloudflare/.wrangler/
cloudflare/dist/
cloudflare/backups/
```

- [ ] **Step 5：实现最小入口**

`cloudflare/src/env.ts` 使用 `interface Env` 定义 KV、变量和 Secrets；`index.ts` 暂时只响应 `/api/health`。

- [ ] **Step 6：运行定向检查**

Run:

```bash
cd cloudflare
pnpm install
pnpm test -- worker-public.test.ts
pnpm typecheck
pnpm build
```

Expected: 健康检查测试通过，Worker dry-run 构建成功。

- [ ] **Step 7：提交**

```bash
git add .gitignore cloudflare
git commit -m "build: scaffold cloudflare worker"
```

## Task 2：移植目录类型、校验与纯领域规则

**Files:**

- Create: `cloudflare/src/catalogs/types.ts`
- Create: `cloudflare/src/catalogs/home-catalog.ts`
- Create: `cloudflare/src/catalogs/resume-catalog.ts`
- Create: `cloudflare/tests/catalog-rules.test.ts`

- [ ] **Step 1：写失败测试**

覆盖：

- 两种目录的完整结构校验。
- 当前启用岗位读取。
- 中文语言回退。
- 空白创建和深复制。
- 重名与空名称。
- 删除当前启用岗位和最后岗位。
- 设置启用岗位。
- 更新指定岗位与语言。

- [ ] **Step 2：确认测试失败**

Run:

```bash
cd cloudflare
pnpm test -- catalog-rules.test.ts
```

Expected: 因目录模块不存在而失败。

- [ ] **Step 3：定义自包含类型**

`types.ts` 定义主页、简历、语言、目录、公开响应、`CatalogEnvelope<T>` 和管理响应接口。不得使用 `any`。

- [ ] **Step 4：移植纯规则**

从根项目现有领域规则移植行为，但不建立跨目录 import。补充嵌套字段运行时校验，防止 KV 中的部分非法对象通过。

- [ ] **Step 5：运行测试**

```bash
cd cloudflare
pnpm test -- catalog-rules.test.ts
pnpm typecheck
```

Expected: 全部通过。

- [ ] **Step 6：提交**

```bash
git add cloudflare/src/catalogs cloudflare/tests/catalog-rules.test.ts
git commit -m "feat: add worker catalog domain rules"
```

## Task 3：实现 PBKDF2 密码和 HMAC 令牌

**Files:**

- Create: `cloudflare/src/auth/password.ts`
- Create: `cloudflare/src/auth/token.ts`
- Create: `cloudflare/scripts/generate-password-hash.mjs`
- Create: `cloudflare/tests/password.test.ts`
- Create: `cloudflare/tests/token.test.ts`
- Modify: `cloudflare/package.json`
- Modify: `cloudflare/.dev.vars.example`

- [ ] **Step 1：写密码测试**

覆盖：

- 固定盐和参数生成稳定 PBKDF2 格式。
- 正确密码验证成功。
- 错误密码验证失败。
- 非法哈希配置安全失败。

- [ ] **Step 2：写令牌测试**

覆盖：

- 签发后可验证。
- 载荷包含 `subject`、签发时间、过期时间和 nonce。
- 篡改载荷或签名失败。
- 过期令牌失败。
- 使用不同 Secret 验证失败。

- [ ] **Step 3：运行并确认失败**

```bash
cd cloudflare
pnpm test -- password.test.ts token.test.ts
```

- [ ] **Step 4：实现 Web Crypto 逻辑**

密码使用 PBKDF2-SHA256；令牌使用 HMAC-SHA256 和 URL-safe Base64。比较派生字节和签名字节时使用固定长度逐字节比较，不直接比较字符串。

- [ ] **Step 5：实现密码哈希命令**

`generate-password-hash.mjs` 从交互输入或明确参数读取密码，只输出可写入 Secret 的哈希，不将密码写入文件或命令日志。`package.json` 增加 `auth:hash`。

- [ ] **Step 6：补充本地变量模板**

`.dev.vars.example` 仅放中文占位值：

```dotenv
ADMIN_PASSWORD_HASH=请输入生成后的密码哈希
AUTH_SIGNING_SECRET=请输入随机签名密钥
AUTH_RATE_LIMIT_SALT=请输入独立的限流盐
```

- [ ] **Step 7：运行检查并提交**

```bash
cd cloudflare
pnpm test -- password.test.ts token.test.ts
pnpm typecheck
git add cloudflare
git commit -m "feat: add worker admin authentication"
```

## Task 4：实现 KV Repository 和 revision 信封

**Files:**

- Create: `cloudflare/src/storage/catalog-repository.ts`
- Create: `cloudflare/src/storage/kv-catalog-repository.ts`
- Create: `cloudflare/src/catalogs/service.ts`
- Create: `cloudflare/tests/repository.test.ts`

- [ ] **Step 1：写失败测试**

使用测试 KV 覆盖：

- 不存在的主键返回明确 `CATALOG_NOT_INITIALIZED`。
- JSON 非法或目录非法返回存储错误。
- 初始化写入 `revision: 1` 和 `updatedAt`。
- 正常更新增加 revision。
- 传入旧 revision 返回 `CATALOG_VERSION_CONFLICT`。
- 写入前和写入后都校验目录。

- [ ] **Step 2：确认失败**

```bash
cd cloudflare
pnpm test -- repository.test.ts
```

- [ ] **Step 3：实现 Repository 接口**

```typescript
interface CatalogRepository<TCatalog> {
  read(): Promise<CatalogEnvelope<TCatalog>>;
  initialize(catalog: TCatalog, force?: boolean): Promise<CatalogEnvelope<TCatalog>>;
  write(expectedRevision: number, catalog: TCatalog): Promise<CatalogEnvelope<TCatalog>>;
}
```

主页与简历使用不同 KV key 和校验器实例化同一实现。

- [ ] **Step 4：实现服务层**

服务层负责读取信封、调用纯领域规则、用请求 revision 写回，并返回 `{ revision, catalog }` 或创建结果。

- [ ] **Step 5：运行检查并提交**

```bash
cd cloudflare
pnpm test -- repository.test.ts
pnpm typecheck
git add cloudflare/src/storage cloudflare/src/catalogs/service.ts cloudflare/tests/repository.test.ts
git commit -m "feat: add kv catalog repository"
```

## Task 5：实现 JSON、错误、CORS 与登录限流基础设施

**Files:**

- Create: `cloudflare/src/http/errors.ts`
- Create: `cloudflare/src/http/json.ts`
- Create: `cloudflare/src/http/cors.ts`
- Create: `cloudflare/src/auth/rate-limit.ts`
- Create: `cloudflare/tests/worker-cors.test.ts`
- Create: `cloudflare/tests/rate-limit.test.ts`

- [ ] **Step 1：写 CORS 失败测试**

在 `worker-cors.test.ts` 覆盖：

- GitHub Pages、Cloudflare Pages、本地来源精确匹配成功。
- 非白名单来源返回 `403 ORIGIN_NOT_ALLOWED`。
- `OPTIONS` 返回允许的方法和请求头。
- 不返回 `Access-Control-Allow-Origin: *`。
- 响应包含 `Vary: Origin`。

- [ ] **Step 2：写限流失败测试**

覆盖：

- 失败次数递增并带 TTL。
- 达到阈值返回冷却状态。
- 成功登录清除失败记录。
- KV 限流异常不会泄露 IP 或 Secret。

- [ ] **Step 3：实现 HTTP 基础设施**

统一：

- JSON 成功响应。
- `{ error: { code, message } }` 错误。
- 安全响应头。
- 公开缓存和管理 `no-store`。
- CORS 白名单解析与预检。

- [ ] **Step 4：实现尽力限流**

客户端键使用 `CF-Connecting-IP` 与 `AUTH_RATE_LIMIT_SALT` 的 SHA-256 摘要；KV 中只保存摘要后的 key、失败次数和冷却时间。

- [ ] **Step 5：运行检查并提交**

```bash
cd cloudflare
pnpm exec vitest run tests/worker-cors.test.ts tests/rate-limit.test.ts
pnpm typecheck
git add cloudflare/src/http cloudflare/src/auth/rate-limit.ts cloudflare/tests/worker-cors.test.ts cloudflare/tests/rate-limit.test.ts
git commit -m "feat: add worker http security middleware"
```

## Task 6：实现公开 API 和管理员登录

**Files:**

- Create: `cloudflare/src/router.ts`
- Modify: `cloudflare/src/index.ts`
- Modify: `cloudflare/tests/worker-public.test.ts`
- Create: `cloudflare/tests/worker-auth.test.ts`

- [ ] **Step 1：扩展公开 API 失败测试**

覆盖：

- `GET /api/public/home` 只返回当前启用主页岗位。
- `GET /api/public/resume` 只返回当前启用简历岗位。
- 不返回其他草稿岗位。
- KV 未初始化和非法时返回统一错误。
- `ETag` 与短时间缓存头存在。

- [ ] **Step 2：扩展登录失败测试**

覆盖：

- 正确密码返回 Token 和 `expiresAt`。
- 错误密码返回 `401 INVALID_CREDENTIALS`。
- 达到阈值返回 `429 TOO_MANY_ATTEMPTS`。
- 登录响应使用 `Cache-Control: no-store`。

- [ ] **Step 3：实现原生路由**

使用 URL、method 和 pathname 显式分派，不引入框架。未知 API 返回 `404 NOT_FOUND`，异常统一转换，服务端日志不得输出密码、Token 或 Secret。

- [ ] **Step 4：运行检查并提交**

```bash
cd cloudflare
pnpm test -- worker-public.test.ts worker-auth.test.ts worker-cors.test.ts
pnpm typecheck
git add cloudflare/src cloudflare/tests
git commit -m "feat: add worker public and login api"
```

## Task 7：实现主页与简历管理 API

**Files:**

- Modify: `cloudflare/src/router.ts`
- Create: `cloudflare/tests/worker-management.test.ts`

- [ ] **Step 1：写鉴权失败测试**

对所有管理路由覆盖：

- 缺少 Bearer Token 返回 `401 AUTH_REQUIRED`。
- 过期、篡改和非法 Token 返回 `401 INVALID_TOKEN`。
- 有效 Token 可以读取完整目录。

- [ ] **Step 2：写主页管理失败测试**

覆盖现有六个主页接口的成功、参数错误、领域错误、revision 冲突和 revision 递增。

- [ ] **Step 3：写简历管理失败测试**

覆盖现有六个简历接口的成功、参数错误、领域错误、revision 冲突和 revision 递增。

- [ ] **Step 4：实现认证包装与请求解析**

所有管理路由先完成 CORS、Token 验证、JSON 大小和字段校验，再调用目录服务。创建接口返回：

```json
{
  "revision": 2,
  "catalog": {},
  "homeId": "generated-id"
}
```

简历创建对应返回 `resumeId`。

- [ ] **Step 5：运行 Worker 全套测试**

```bash
cd cloudflare
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Expected: 全部通过。

- [ ] **Step 6：提交**

```bash
git add cloudflare
git commit -m "feat: add worker catalog management api"
```

## Task 8：增加种子、初始化、备份和恢复工具

**Files:**

- Create: `cloudflare/seeds/home-catalog.json`
- Create: `cloudflare/seeds/resume-catalog.json`
- Create: `cloudflare/scripts/initialize-catalogs.mjs`
- Create: `cloudflare/scripts/export-catalogs.mjs`
- Create: `cloudflare/scripts/restore-catalogs.mjs`
- Create: `cloudflare/tests/scripts.test.mjs`
- Modify: `cloudflare/package.json`

- [ ] **Step 1：复制并校验种子快照**

从：

- `src/data/home-catalog.json`
- `src/data/resume-catalog.json`

复制到 `cloudflare/seeds/`，测试断言内容相等且通过 Worker 校验器。

- [ ] **Step 2：写脚本失败测试**

覆盖：

- 初始化默认拒绝覆盖。
- `--force` 才允许覆盖。
- 本地与远端必须使用不同命令。
- 导出包含两个完整信封。
- 恢复要求明确文件和环境参数。
- 参数错误不调用 Wrangler 写命令。

- [ ] **Step 3：实现 Wrangler 命令包装**

脚本使用 `spawn` 参数数组调用 Wrangler，不拼接可执行 shell 字符串。增加：

```json
{
  "seed:local": "node scripts/initialize-catalogs.mjs --local",
  "seed:remote": "node scripts/initialize-catalogs.mjs --remote",
  "backup:remote": "node scripts/export-catalogs.mjs --remote",
  "restore:remote": "node scripts/restore-catalogs.mjs --remote"
}
```

- [ ] **Step 4：运行本地初始化验收**

```bash
cd cloudflare
pnpm seed:local
pnpm dev
```

另一个终端请求两个公开接口并确认返回种子中的启用岗位。结束本地 Worker 会话后继续。

- [ ] **Step 5：运行脚本测试并提交**

```bash
cd cloudflare
pnpm test -- scripts.test.mjs
git add cloudflare/seeds cloudflare/scripts cloudflare/tests/scripts.test.mjs cloudflare/package.json
git commit -m "feat: add worker data migration tools"
```

## Task 9：建立前端管理员会话与统一 API 客户端

**Files:**

- Create: `src/auth/admin-session.ts`
- Create: `src/services/api-client.ts`
- Create: `src/services/admin-auth-api.ts`
- Create: `tests/admin-session.test.ts`
- Create: `tests/api-client.test.ts`
- Create: `tests/admin-auth-api.test.ts`
- Modify: `src/types/env.d.ts`

- [ ] **Step 1：写会话失败测试**

覆盖：

- 保存、读取和清除 Token。
- 过期会话自动清除。
- 非法 JSON 自动清除。
- 只访问注入的 `Storage`，便于测试。

- [ ] **Step 2：写 API 客户端失败测试**

覆盖：

- 规范化基础地址。
- JSON 请求头。
- 管理请求附加 Bearer Token。
- `401` 调用会话失效回调。
- 网络错误和统一错误结构。
- 不在错误信息中包含 Token。

- [ ] **Step 3：写登录客户端失败测试**

覆盖登录路径、请求体、成功响应和 `401`/`429`。

- [ ] **Step 4：实现最小代码**

`api-client.ts` 统一处理 HTTP；主页、简历和登录服务都依赖它。`ImportMetaEnv` 增加：

```typescript
readonly VITE_RESUME_API_BASE_URL?: string;
readonly VITE_PUBLIC_API_TIMEOUT_MS?: string;
```

- [ ] **Step 5：运行检查并提交**

```bash
pnpm exec tsx --test tests/admin-session.test.ts tests/api-client.test.ts tests/admin-auth-api.test.ts
pnpm typecheck
git add src/auth src/services/api-client.ts src/services/admin-auth-api.ts src/types/env.d.ts tests
git commit -m "feat: add frontend admin api session"
```

## Task 10：迁移主页与简历管理客户端到 revision 契约

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/types/resume.ts`
- Modify: `src/services/home-api.ts`
- Modify: `src/services/resume-api.ts`
- Modify: `src/hooks/use-home-profile-management.ts`
- Modify: `src/hooks/use-resume-profile-management.ts`
- Modify: `tests/home-api.test.ts`
- Modify: `tests/resume-api.test.ts`

- [ ] **Step 1：更新失败测试**

断言：

- `getCatalog()` 返回 `{ revision, catalog }`。
- 所有写请求带 `revision`。
- 创建响应保留新 ID。
- 请求自动携带 Token。
- `409 CATALOG_VERSION_CONFLICT` 保留 code 和中文信息。

- [ ] **Step 2：增加前端契约类型**

定义通用或模块内明确接口：

```typescript
interface CatalogResponse<TCatalog> {
  revision: number;
  catalog: TCatalog;
}
```

- [ ] **Step 3：改造服务**

主页、简历服务复用 `api-client.ts`，移除重复 fetch、错误解析和基础地址逻辑。

- [ ] **Step 4：改造管理 Hooks**

Hooks 保存当前 revision；每次成功响应同步目录和 revision；所有写操作传当前 revision；冲突时保留未保存表单并提示刷新，不自动覆盖。

- [ ] **Step 5：运行测试并提交**

```bash
pnpm exec tsx --test tests/home-api.test.ts tests/resume-api.test.ts
pnpm typecheck
git add src/types src/services/home-api.ts src/services/resume-api.ts src/hooks tests/home-api.test.ts tests/resume-api.test.ts
git commit -m "feat: migrate management api contract"
```

## Task 11：实现公开 Worker 数据覆盖与本地 JSON 降级

**Files:**

- Create: `src/domain/catalog/public-catalog.ts`
- Create: `src/services/public-catalog-api.ts`
- Create: `src/hooks/use-public-catalog.ts`
- Create: `tests/public-catalog.test.ts`
- Modify: `src/hooks/use-translated-data.ts`

- [ ] **Step 1：写纯逻辑失败测试**

覆盖：

- 有效远程主页/简历岗位替换本地当前启用岗位。
- 请求失败、超时、非法 JSON、缺语言或字段非法时保留本地目录。
- 远程内容相同时不产生不必要替换。
- 语言缺失回退中文。

- [ ] **Step 2：实现公开 API 客户端**

分别请求：

- `/api/public/home`
- `/api/public/resume`

使用 `AbortController` 和 `VITE_PUBLIC_API_TIMEOUT_MS`，默认短超时。

- [ ] **Step 3：实现共享远程状态 Hook**

应用首屏直接返回本地目录内容；effect 异步加载远程公开岗位，校验成功后更新。主页与简历请求、错误和状态互不影响。

- [ ] **Step 4：接入翻译数据 Hook**

`useHomeData()` 与 `useResumeData()` 从远程优先的当前岗位读取语言内容，保留现有中文回退。

- [ ] **Step 5：运行测试与构建**

```bash
pnpm exec tsx --test tests/public-catalog.test.ts
pnpm typecheck
pnpm build
```

- [ ] **Step 6：提交**

```bash
git add src/domain/catalog src/services/public-catalog-api.ts src/hooks/use-public-catalog.ts src/hooks/use-translated-data.ts tests/public-catalog.test.ts
git commit -m "feat: load public catalogs from worker"
```

## Task 12：实现登录弹窗、会话上下文和管理路由守卫

**Files:**

- Create: `src/auth/admin-auth-context.tsx`
- Create: `src/components/admin-login-modal.tsx`
- Create: `src/components/admin-route-guard.tsx`
- Create: `src/components/admin-entry-link.tsx`
- Modify: `src/main.tsx`
- Modify: `src/router/index.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/pages/resume/resume.tsx`
- Modify: `src/i18n/locales/zh-CN.json`
- Modify: `src/i18n/locales/en-US.json`
- Modify: `src/i18n/locales/ja-JP.json`
- Delete: `src/hooks/use-backend-status.ts`

- [ ] **Step 1：先定义可测试状态转换**

在会话模块测试中补充：

- 点击管理入口时，有会话直接导航。
- 无会话打开密码弹窗并保存目标路径。
- 登录成功关闭弹窗并导航。
- 取消直接访问管理页时回到对应公开页面。
- `401` 清会话后重新要求登录。

- [ ] **Step 2：实现 Auth Provider**

Provider 管理：

- 当前会话。
- 登录 loading/error。
- 待导航目标。
- 打开和关闭登录弹窗。
- 登录、退出和失效。

- [ ] **Step 3：实现密码弹窗**

使用 Ant Design `Modal`、`Form`、`Input.Password`。密码不写入 React 全局状态，不回显服务端内部错误；支持错误密码、限流和服务不可用提示。

- [ ] **Step 4：实现路由守卫**

将 `/home-manage` 和 `/resume-editor` 元素包在 `AdminRouteGuard` 中。未认证时不挂载管理页面，避免提前请求完整目录。

- [ ] **Step 5：替换管理入口**

首页和简历管理按钮使用 `AdminEntryLink`；移除开发环境判断和 `useBackendStatus`。线上始终显示入口。

- [ ] **Step 6：补齐三语言文案**

增加管理员登录、密码、登录中、错误、退出、会话过期、服务不可用和同步提示文案。

- [ ] **Step 7：运行检查并提交**

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
git add src tests
git commit -m "feat: add online admin authentication ui"
```

## Task 13：补充管理体验与 KV 同步提示

**Files:**

- Modify: `src/pages/home/home-manage.tsx`
- Modify: `src/pages/resume/resume-editor.tsx`
- Modify: `src/hooks/use-home-profile-management.ts`
- Modify: `src/hooks/use-resume-profile-management.ts`
- Create: `src/domain/admin/management-state.ts`
- Create: `tests/admin-management-state.test.ts`
- Modify: `src/i18n/locales/zh-CN.json`
- Modify: `src/i18n/locales/en-US.json`
- Modify: `src/i18n/locales/ja-JP.json`

- [ ] **Step 1：增加冲突与退出验收测试**

在 `tests/admin-management-state.test.ts` 中先为 `src/domain/admin/management-state.ts` 写纯逻辑测试，覆盖：

- revision 冲突不清空表单。
- 认证失效不误报保存成功。
- 保存中禁用重复提交。

- [ ] **Step 2：增加管理页会话操作**

管理页展示退出按钮；退出前若有未保存内容，复用现有未保存保护流程。

- [ ] **Step 3：增加同步提示**

保存成功使用 i18n 文案提示“已保存，边缘节点可能短暂显示旧内容”。预览按钮仍打开公开页面，由公开 API 获取发布内容。

- [ ] **Step 4：运行前端完整检查并提交**

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
git add src tests
git commit -m "feat: refine worker management experience"
```

## Task 14：本地 Worker 与前端端到端联调

**Files:**

- Modify: `cloudflare/README.md`
- Modify: `cloudflare/.dev.vars.example`
- Modify: `docs/todo.md`（仅增加迁移验收记录，如该文件仍用于项目任务追踪）

- [ ] **Step 1：准备本地 Secret**

复制 `.dev.vars.example` 为 `.dev.vars`，使用生成命令创建密码哈希，生成两个相互独立的随机 Secret。确认 `.dev.vars` 未出现在 `git status`。

- [ ] **Step 2：初始化并启动 Worker**

```bash
cd cloudflare
pnpm seed:local
pnpm dev
```

- [ ] **Step 3：启动连接本地 Worker 的前端**

```bash
pnpm exec cross-env VITE_RESUME_API_BASE_URL=http://localhost:8787 vite
```

- [ ] **Step 4：使用 Browser 做真实 UI 验收**

调用 `browser:control-in-app-browser`：

- 打开首页并确认远程主页数据加载。
- 进入主页管理，确认弹窗拦截、错误密码和正确密码。
- 修改非关键测试字段并保存。
- 打开公开主页确认发布内容。
- 重复验证简历编辑与公开简历。
- 关闭 Worker 或改为不可达地址，确认公开页回退打包 JSON、管理页显示服务不可用。
- 恢复测试数据，避免本地种子被验收修改污染。

- [ ] **Step 5：完善 README**

记录安装、配置、本地种子、开发、测试、Secret、Namespace、自定义域名、部署、备份和恢复命令。

- [ ] **Step 6：运行双工程检查并提交**

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build

cd cloudflare
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

```bash
git add cloudflare/README.md cloudflare/.dev.vars.example docs/todo.md
git commit -m "docs: add worker local development guide"
```

## Task 15：移除旧 Express 后端

**Files:**

- Delete: `server.ts`
- Delete: `tsconfig.server.json`
- Delete: `src/server/create-server.ts`
- Delete: `src/server/home-catalog-repository.ts`
- Delete: `src/server/resume-catalog-repository.ts`
- Delete: `tests/home-server.test.ts`
- Delete: `tests/resume-server.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1：确认替代路径全部通过**

在删除前再次运行 Task 14 的本地联调与双工程测试。若任一管理能力尚未被 Worker 覆盖，停止删除。

- [ ] **Step 2：删除 Express 代码和测试**

只删除上方列出的旧后端文件，不删除仍被前端使用的领域规则或打包 JSON。

- [ ] **Step 3：清理根依赖和命令**

从根 `package.json` 删除：

- `server` script。
- `express`、`cors`。
- `@types/express`、`@types/cors`。

更新 lockfile，并确认无 `src/server`、`server.ts` 或旧服务端测试引用。

- [ ] **Step 4：运行完整检查**

```bash
rg -n "src/server|createServer|FileHomeCatalogRepository|FileResumeCatalogRepository|localhost:3001" . -g '!node_modules' -g '!docs/superpowers/**'
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build

cd cloudflare
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Expected: `rg` 不再发现运行时代码引用，全部检查通过。

- [ ] **Step 5：提交**

```bash
git add package.json pnpm-lock.yaml server.ts tsconfig.server.json src/server tests/home-server.test.ts tests/resume-server.test.ts
git commit -m "refactor: remove legacy express backend"
```

## Task 16：生产部署与线上验收

**Files:**

- Modify: `cloudflare/wrangler.jsonc`
- Modify: `cloudflare/README.md`
- Modify: deployment environment configuration outside Git as required

- [ ] **Step 1：创建 KV Namespace**

分别创建 production 和 preview Namespace，将真实 ID 写入 `wrangler.jsonc`。

- [ ] **Step 2：配置白名单与 Secrets**

`ALLOWED_ORIGINS` 只包含：

- GitHub Pages 正式 origin。
- Cloudflare Pages 正式 origin。
- 明确需要的本地 origin。

执行：

```bash
cd cloudflare
pnpm exec wrangler secret put ADMIN_PASSWORD_HASH
pnpm exec wrangler secret put AUTH_SIGNING_SECRET
pnpm exec wrangler secret put AUTH_RATE_LIMIT_SALT
```

- [ ] **Step 3：部署预览并初始化数据**

先 dry-run，再部署预览环境；导出目标 KV 确认空数据后执行远端初始化。禁止默认覆盖。

- [ ] **Step 4：绑定自定义 API 域名**

将独立 API 域名绑定到 Worker，验证 HTTPS、健康检查、公开接口、CORS 和登录。API 域名不托管前端。

- [ ] **Step 5：发布两个前端**

分别设置：

```dotenv
VITE_RESUME_API_BASE_URL=https://api.example.com
```

部署 GitHub Pages 与 Cloudflare Pages。

- [ ] **Step 6：线上验收**

- 两个正式前端都能加载 Worker 公开数据。
- 两个正式前端都能登录管理页面并保存。
- 非白名单 Origin 被拒绝。
- 无 Token 无法读取完整目录。
- 保存后管理页面立即显示新数据，公开页面最终同步。
- 临时不可达 Worker 时公开页使用打包 JSON。
- 备份命令能导出两个目录信封。

- [ ] **Step 7：记录部署参数但不记录 Secret**

README 只记录 Namespace 名称、域名和命令，不记录密码哈希、签名密钥、限流盐、Token 或备份内容。

- [ ] **Step 8：最终提交**

```bash
git add cloudflare/wrangler.jsonc cloudflare/README.md
git commit -m "chore: configure worker production deployment"
```

## 最终验证清单

- [ ] 根项目 `pnpm test` 通过。
- [ ] 根项目 `pnpm typecheck` 通过。
- [ ] 根项目 `pnpm lint` 通过。
- [ ] 根项目 `pnpm format:check` 通过。
- [ ] 根项目 `pnpm build` 通过。
- [ ] Worker `pnpm test` 通过。
- [ ] Worker `pnpm typecheck` 通过。
- [ ] Worker `pnpm lint` 通过。
- [ ] Worker `pnpm format:check` 通过。
- [ ] Worker `pnpm build` 通过。
- [ ] Browser 本地联调通过。
- [ ] GitHub Pages 线上验收通过。
- [ ] Cloudflare Pages 线上验收通过。
- [ ] 非白名单 Origin 验证通过。
- [ ] Worker 故障时公开 JSON 降级验证通过。
- [ ] `.dev.vars`、`.wrangler/`、备份与 Secret 未进入 Git。
- [ ] 旧 Express 后端已在 Worker 验收后移除。
