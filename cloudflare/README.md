# Cloudflare Worker 后端

该目录是可独立安装、测试和部署的 Worker 工程，不依赖根目录前端运行时代码。

## 本地开发

```bash
pnpm install
cp .dev.vars.example .dev.vars
pnpm auth:hash
pnpm seed:local
pnpm dev
```

将密码哈希和两个相互独立的随机密钥写入 `.dev.vars`。前端使用：

```bash
VITE_RESUME_API_BASE_URL=http://localhost:8787 pnpm dev
```

`.dev.vars`、`.wrangler/` 和 `backups/` 均不会提交。

## 检查

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

## 数据命令

```bash
pnpm seed:local
pnpm backup:local
pnpm restore:local -- --file backups/目录备份.json
```

远端命令必须显式使用 `:remote`：

```bash
pnpm seed:remote
pnpm backup:remote
pnpm restore:remote -- --file backups/目录备份.json
```

初始化默认拒绝覆盖；只有已经完成备份且明确确认后才传 `--force`。

## 部署准备

1. 登录正确的 Cloudflare 账号，创建 production 与 preview KV Namespace。
2. 将两个真实 Namespace ID 写入 `wrangler.jsonc`，替换中文占位符。
3. 将 GitHub Pages、Cloudflare Pages 正式 Origin 和必要的本地 Origin 写入
   `ALLOWED_ORIGINS`，不要使用通配符。
4. 配置 Secrets：

```bash
pnpm exec wrangler secret put ADMIN_PASSWORD_HASH
pnpm exec wrangler secret put AUTH_SIGNING_SECRET
pnpm exec wrangler secret put AUTH_RATE_LIMIT_SALT
```

5. 运行 `pnpm build`，确认 dry-run 成功后执行 `pnpm deploy`。
6. 在 Worker 的 Routes & Domains 中绑定独立自定义 API 域名，例如
   `api.example.com`。该域名只提供 API，不托管前端。
7. 首次初始化前运行 `pnpm backup:remote` 确认目标 KV 为空，再执行
   `pnpm seed:remote`。
8. 在 GitHub Pages 和 Cloudflare Pages 的构建环境中分别设置：

```dotenv
VITE_RESUME_API_BASE_URL=https://api.example.com
VITE_PUBLIC_API_TIMEOUT_MS=3000
```

## 部署验收

- `GET /api/health` 返回 200。
- 两个前端来源均能读取 `/api/public/home` 和 `/api/public/resume`。
- 非白名单 Origin 返回 403。
- 无 Bearer Token 的管理接口返回 401。
- 管理员登录后能读取和保存主页、简历目录。
- 暂停 Worker 后，公开页面仍使用打包 JSON 渲染。
- `pnpm backup:remote` 能导出两个目录信封。

README 和 Git 配置中不得记录密码、密码哈希、签名密钥、限流盐、Token 或备份内容。

## 当前生产资源

- Worker：`resume-api`
- API 域名：`https://resume-api.narcissus2ma.dpdns.org`
- Production KV：`resume-api-catalog`
- Preview KV：`resume-api-catalog-preview`
- 允许来源：`https://narcissus-ma.github.io`、
  `https://resume.narcissus2ma.dpdns.org`
