# Cloudflare Worker KV 后端迁移设计

## 目标

将当前仅在开发环境运行的 Express 文件后端迁移为可独立部署的 Cloudflare Worker，并使用 Workers KV 保存主页目录和简历目录。

迁移完成后：

- Worker 代码全部位于 `cloudflare/`，可独立安装、测试、本地调试和部署。
- GitHub Pages 与 Cloudflare Pages 上的前端通过自定义 API 域名访问 Worker。
- 公开页面优先读取 Worker 中当前启用的数据，远程不可用时回退到前端打包的 JSON。
- 管理入口可在线使用，通过密码弹窗完成管理员认证。
- 完成联调后删除原 Express 后端，避免维护两套服务端实现。

## 已确认决策

- 使用原生 Cloudflare Worker `fetch` 处理器，不引入 Hono 或 Express 兼容层。
- 使用 Workers KV 保存数据。
- Worker 与前端独立部署，Worker 使用单独的自定义 API 域名。
- GitHub Pages、Cloudflare Pages 和本地 Vite 均作为允许访问 API 的前端来源。
- 公开页面使用“Worker 优先、打包 JSON 兜底”的读取策略。
- 管理员密码登录后换取短期 HMAC 签名令牌。
- 令牌保存在 `sessionStorage`，关闭标签页后失效，默认服务端有效期为 2 小时。
- 完整目录和所有管理写接口都需要鉴权，公开读取接口不需要鉴权。
- 使用 `revision` 做常见旧版本覆盖检测，但不承诺严格的原子并发控制。

## 范围

### 本次包含

- 在 `cloudflare/` 中建立独立 TypeScript Worker 工程。
- 使用两个 KV 主键保存主页目录与简历目录。
- 迁移现有主页、简历目录 API 和领域约束。
- 增加公开内容 API、管理员登录、令牌校验、CORS 和登录限流。
- 增加 KV 数据初始化、导出备份和恢复脚本。
- 前端公开数据远程加载与本地 JSON 降级。
- 前端管理入口、密码弹窗、路由守卫和会话管理。
- 管理 API 自动附加令牌并处理 `401`、`409`。
- Worker 与前端的自动化测试、本地联调和部署文档。
- 联调完成后移除 Express 服务端及其文件仓库实现。

### 本次不包含

- 多管理员账号、角色权限和用户管理。
- 第三方 OAuth、Cloudflare Access 或邮箱验证码。
- 严格事务、强一致发布或多人实时协作编辑。
- 将图片等静态资源迁移到 KV、R2 或 Worker。
- 在 Worker 中托管前端静态页面。

## 工程边界

`cloudflare/` 必须是自包含工程，至少包括：

```text
cloudflare/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── wrangler.jsonc
├── .dev.vars.example
├── src/
│   ├── index.ts
│   ├── env.ts
│   ├── router.ts
│   ├── http/
│   ├── auth/
│   ├── catalogs/
│   └── storage/
├── seeds/
│   ├── home-catalog.json
│   └── resume-catalog.json
├── scripts/
└── tests/
```

Worker 不得从仓库根目录的 `src/` 导入类型、领域规则或运行时代码。前后端通过 HTTP API 契约协作，各自维护自己的运行时校验。种子 JSON 来自迁移时的前端目录快照，后续线上数据以 KV 为准。

根项目保留前端依赖和命令，`cloudflare/package.json` 只包含 Worker 开发、测试和部署依赖。

## 数据模型与 KV

### KV 绑定

Worker 使用一个 KV Namespace，绑定名为 `CATALOG_KV`。生产和预览环境使用不同 Namespace，避免本地或预览部署修改生产数据。

### 主键

- `catalog:home`
- `catalog:resume`
- `auth:failure:<client-hash>`

目录主键保存带版本的存储信封：

```typescript
interface CatalogEnvelope<TCatalog> {
  revision: number;
  updatedAt: string;
  catalog: TCatalog;
}
```

首次初始化时 `revision` 为 `1`。每次成功写入后加一，并更新 ISO 8601 格式的 `updatedAt`。

主页与简历目录继续使用现有 `schemaVersion: 1`、岗位列表、三语言内容和启用岗位结构。Worker 在读取和写入时都执行完整结构校验与现有业务约束校验。

### KV 一致性边界

Workers KV 是最终一致存储，适合当前单管理员、低频发布场景，但不提供严格事务和原子 CAS：

- 管理写接口在成功响应中直接返回本次写入后的目录与新 `revision`。
- 前端保存期间禁用重复提交。
- 写请求携带客户端最后读取到的 `revision`。
- Worker 在写入前比较当前读到的版本，不一致时返回 `409 CATALOG_VERSION_CONFLICT`。
- 该检查可阻止常见的旧标签页覆盖，但极短时间内的并发写仍可能竞争。
- 保存成功后提示边缘节点可能短暂显示旧内容。

参考：

- [Workers KV 工作原理](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Workers KV 限制](https://developers.cloudflare.com/kv/platform/limits/)

## API 设计

所有响应使用 JSON。错误保持统一结构：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "可展示的中文错误信息"
  }
}
```

### 健康检查

#### `GET /api/health`

不读取完整目录，用于确认 Worker 可访问。返回版本和当前时间，不暴露 Secret 或 KV 内容。

### 公开接口

#### `GET /api/public/home`

返回主页当前启用岗位的三语言内容：

```json
{
  "revision": 3,
  "profile": {
    "id": "frontend",
    "name": "前端开发",
    "contents": {}
  }
}
```

#### `GET /api/public/resume`

返回简历当前启用岗位，结构与主页公开接口平行。

公开接口只暴露当前启用岗位，不返回其他草稿岗位。

### 登录接口

#### `POST /api/auth/login`

请求：

```json
{
  "password": "管理员输入的密码"
}
```

成功响应：

```json
{
  "token": "签名令牌",
  "expiresAt": "2026-06-15T12:00:00.000Z"
}
```

登录失败统一返回 `401 INVALID_CREDENTIALS`，不区分密码错误、配置错误等内部原因。

### 管理目录接口

以下接口都要求：

```http
Authorization: Bearer <token>
```

保留现有路径，降低页面和业务 Hook 的迁移成本：

- `GET /api/home-catalog`
- `PUT /api/home-catalog/content`
- `POST /api/home-catalog/homes`
- `PATCH /api/home-catalog/homes/:homeId`
- `DELETE /api/home-catalog/homes/:homeId`
- `PUT /api/home-catalog/active`
- `GET /api/resume-catalog`
- `PUT /api/resume-catalog/content`
- `POST /api/resume-catalog/resumes`
- `PATCH /api/resume-catalog/resumes/:resumeId`
- `DELETE /api/resume-catalog/resumes/:resumeId`
- `PUT /api/resume-catalog/active`

管理读取和变更统一返回：

```json
{
  "revision": 4,
  "catalog": {}
}
```

所有写请求在原业务字段之外增加 `revision`。若版本不一致，返回：

```json
{
  "error": {
    "code": "CATALOG_VERSION_CONFLICT",
    "message": "数据已在其他页面更新，请刷新后重试"
  }
}
```

## 管理员鉴权

### Secret

生产环境通过 `wrangler secret put` 配置：

- `ADMIN_PASSWORD_HASH`
- `AUTH_SIGNING_SECRET`
- `AUTH_RATE_LIMIT_SALT`

`ADMIN_PASSWORD_HASH` 使用包含算法参数、盐和派生结果的 PBKDF2 字符串格式。仓库提供只在本地执行的密码哈希生成命令，不保存明文密码。

`AUTH_SIGNING_SECRET` 使用足够长度的随机值，通过 Web Crypto HMAC-SHA256 签发令牌。

`AUTH_RATE_LIMIT_SALT` 独立用于生成登录限流客户端摘要，不与密码哈希盐或令牌签名密钥复用。

### 令牌

令牌载荷至少包括：

```typescript
interface AdminTokenPayload {
  subject: 'admin';
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}
```

令牌由 URL-safe Base64 编码的载荷和签名组成。Worker 每次管理请求都验证格式、签名、用途和过期时间。

前端只将令牌和过期时间保存在 `sessionStorage`：

- 不写入 `localStorage`。
- 不写入 URL。
- 不记录到控制台或错误上报。
- `401` 时立即清除。
- 用户可以主动退出管理会话。

### 登录限流

登录限流是基于 KV 的尽力保护：

- 使用来源 IP 与固定服务端盐的摘要生成客户端键，不直接保存 IP。
- 记录失败次数和冷却截止时间，并设置 TTL。
- 达到阈值后返回 `429 TOO_MANY_ATTEMPTS`。
- 登录成功后删除失败记录。
- 对 KV 写入限制和最终一致性有明确容忍，不将其描述为强安全边界。

## CORS 与 HTTP 安全

Worker 环境变量 `ALLOWED_ORIGINS` 保存逗号分隔白名单，包括：

- GitHub Pages 正式地址。
- Cloudflare Pages 正式地址。
- 本地 Vite 地址，例如 `http://localhost:3000`。

处理规则：

- 浏览器跨域请求的 `Origin` 必须精确匹配白名单。
- 预检请求支持 `GET, POST, PUT, PATCH, DELETE, OPTIONS`。
- 允许请求头包括 `Authorization`、`Content-Type`。
- 不使用 `Access-Control-Allow-Origin: *`。
- 不启用跨域 Cookie。
- 不受信任来源返回 `403 ORIGIN_NOT_ALLOWED`。
- 无 `Origin` 的公开 GET 可访问；无 `Origin` 的登录和管理请求仍需有效鉴权或本地测试上下文。

所有响应增加合理的安全头。公开内容可使用短时间缓存和 `ETag`；登录与管理响应使用 `Cache-Control: no-store`。

## 前端公开数据流

当前 `use-translated-data.ts` 直接读取打包 JSON。迁移后建立独立远程目录状态：

1. 应用立即使用打包的 `home-catalog.json`、`resume-catalog.json` 生成可展示数据。
2. 首页和简历分别请求对应公开 API。
3. 请求设置短超时，且两类数据互不阻塞。
4. 响应通过前端现有目录规则或新增公开响应校验后，替换内存中的远程目录。
5. 请求失败、超时、非 2xx、JSON 非法或结构校验失败时保持本地数据。
6. 切换语言时从当前数据源的三语言内容中选择，缺失语言继续回退中文。

首屏不会等待 Worker，因此 Worker 故障不会导致公开页面空白。远程数据成功后允许页面内容更新一次。

## 前端管理入口与会话

### 入口

- 移除 `process.env.NODE_ENV === 'development'` 和本地后端探测对管理按钮的限制。
- 首页管理按钮与简历编辑按钮在线上可见。
- 点击入口时先由统一管理员鉴权组件检查会话。
- 无有效会话时显示密码弹窗；成功后导航到目标管理路由。

### 直接访问

`/home-manage` 与 `/resume-editor` 使用统一路由守卫：

- 有有效会话时渲染管理页面。
- 无会话时显示密码弹窗，不先加载完整目录。
- 登录成功后留在当前目标页面。
- 取消登录时返回对应公开页面。

### API 客户端

新增统一基础请求层，负责：

- 使用 `VITE_RESUME_API_BASE_URL` 拼接 API 地址。
- 自动添加 Bearer Token。
- 统一 JSON 序列化、网络错误和错误响应解析。
- 收到 `401` 时清除会话并通知鉴权上下文。
- 写请求传递当前 `revision`。

主页和简历服务继续按功能模块暴露具体方法，不在组件中直接调用 `fetch`。

## 本地开发

`cloudflare/.dev.vars.example` 只包含占位说明，真实 `cloudflare/.dev.vars` 被 Git 忽略。

本地流程：

1. 在 `cloudflare/` 安装依赖。
2. 创建本地密码哈希和签名密钥。
3. 运行本地 KV 初始化。
4. 使用 `wrangler dev --persist-to .wrangler/state` 启动 Worker。
5. 前端通过本地环境变量连接 Worker。
6. 验证公开读取、登录、管理编辑、发布和回退。

Wrangler 本地状态目录、日志、`.dev.vars` 和导出的生产备份不得提交。

参考：

- [Wrangler 本地开发](https://developers.cloudflare.com/workers/wrangler/commands/#dev)
- [Worker Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

## 数据迁移

### 初始化

`cloudflare/seeds/` 保存迁移时的两份目录快照。初始化脚本：

- 校验种子结构。
- 检查目标 KV 主键是否已存在。
- 默认拒绝覆盖。
- 仅在显式 `--force` 时允许覆盖。
- 写入 `revision: 1` 和初始化时间。

本地与远端初始化使用明确分开的命令，防止误操作生产 KV。

### 备份与恢复

提供导出脚本，将两个目录信封保存为带时间戳的本地 JSON。恢复脚本要求显式指定文件和环境，并在写入前再次确认目标。

首次生产发布顺序：

1. 创建生产与预览 KV Namespace。
2. 配置 `wrangler.jsonc` 绑定和环境变量。
3. 配置生产 Secrets。
4. 部署 Worker 到预览地址并验证。
5. 将独立自定义 API 域名绑定到 Worker，不在该域名托管前端。
6. 初始化生产 KV。
7. 验证自定义 API 域名、公开接口和管理登录。
8. 发布配置新 API 地址的两个前端。
9. 完成线上管理写入和公开读取验收。
10. 移除旧 Express 后端代码和命令。

## 测试策略

### Worker

使用 Cloudflare 官方 Vitest 集成测试能力覆盖：

- 健康检查。
- KV 无数据、非法数据和初始化数据。
- 主页与简历公开读取只返回启用岗位。
- 所有现有目录业务规则。
- 登录成功、错误密码、令牌过期、签名伪造和格式非法。
- 管理接口缺少令牌与有效令牌。
- CORS 白名单、拒绝来源和 `OPTIONS`。
- `revision` 成功递增与冲突响应。
- 登录失败限流和冷却。
- KV 读取、写入异常的统一 `500` 响应。

### 前端

使用现有 Node 测试体系测试纯逻辑和服务层：

- 远程公开数据成功覆盖本地目录。
- 超时、网络错误、非法 JSON 和结构错误时回退本地目录。
- 登录请求与会话保存、恢复、过期和清除。
- 管理请求自动附加 Token。
- `401` 清除会话。
- 变更请求携带 `revision`，`409` 显示刷新提示。
- 管理入口和路由守卫的关键状态转换。

### 完整检查

提交前运行：

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

## 验收标准

- `cloudflare/` 可在不依赖根项目运行时代码的情况下安装、测试和启动。
- 本地 Worker 使用持久化 KV 完成两套目录的读写。
- GitHub Pages 与 Cloudflare Pages 正式来源均可读取公开数据和完成管理员登录。
- 非白名单浏览器来源无法调用 API。
- 未认证用户无法读取完整目录或执行任何管理操作。
- 管理保存后当前页面立即使用新数据，公开页面最终读取到新启用内容。
- Worker 不可用时公开页面仍展示打包 JSON。
- Worker 不可用时管理页面明确显示服务不可用，不会误报保存成功。
- 密码、密码哈希原材料、签名密钥、令牌和生产备份均未进入 Git。
- 原 Express 服务端在迁移验收后删除。

## 风险与缓解

### KV 最终一致

保存后不同节点可能短暂读到旧内容。通过返回本次写入结果、保存提示和低频单管理员使用约束缓解。

### KV 并发写

`revision` 不是原子 CAS。通过单管理员定位、禁用重复提交和冲突检测降低风险。若未来出现多人协作需求，应迁移到 Durable Objects 或 D1。

### 自定义令牌实现

自定义令牌增加安全实现责任。通过仅使用 Web Crypto、固定算法、严格过期校验、恒定时间签名验证、测试伪造场景和短生命周期降低风险。

### 公开数据切换造成页面闪动

本地 JSON 首屏与 KV 数据不一致时可能发生一次内容更新。通过只在远程校验成功且内容确有变化时替换，并保持布局结构稳定来降低影响。

### 两个前端部署来源变化

Cloudflare Pages 预览域名可能动态变化。本次默认只允许明确配置的正式来源；需要预览联调时显式增加指定来源，不使用通配符放宽生产 CORS。
