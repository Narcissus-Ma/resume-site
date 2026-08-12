# Resume Site / 个人主页与简历展示

> 一套可展示、可定制、可自行部署的 React 个人主页与简历站点。
>
> A customizable React portfolio and resume site for personal showcases.

**暂未提供公开演示。** [在线演示 / Live Demo](DEMO_URL) 为发布前占位链接，发布前必须替换为实际演示地址；若不提供演示，请删除该链接并保留本说明。

## 项目定位 / About

本项目适合作为个人作品集、职业简历或个人主页的起点。内容可存放在项目内静态 JSON 中；如需在线管理内容，可选配 Cloudflare Worker 后端。

This project is a starting point for a personal portfolio, resume, or profile site. It works with bundled JSON content and can optionally connect to a Cloudflare Worker backend for content management.

## 功能亮点 / Highlights

- 个人主页与简历双页面展示
- 中文、English、日本語界面与内容
- 明暗主题与响应式布局
- 可选的 Cloudflare Worker 内容管理后端
- 静态内容回退：后端不可用时，公开页面仍可使用打包内容渲染

## 截图 / Screenshots

暂未提供截图。欢迎在发布前补充真实、已脱敏的页面截图；请勿引用不存在的图片资源。

## 技术栈 / Tech Stack

- React 18、TypeScript、Vite
- Ant Design、Tailwind CSS、CSS Modules
- i18next / react-i18next
- pnpm、ESLint、Prettier
- 可选：Cloudflare Workers 与 KV

## 目录结构 / Project Structure

```text
.
├── src/                 # React 应用、组件、领域逻辑和静态内容
├── cloudflare/          # 可选的 Cloudflare Worker 后端
├── docs/                # 使用、设计与推广文档
├── tests/               # 前端测试
└── public/              # 静态资源
```

## 快速开始 / Quick Start

要求：Node.js 18+ 与 pnpm 8+。

```bash
pnpm install
pnpm dev
```

默认开发服务器运行后，按终端输出的本地地址访问。若项目部署在子路径下，请按你的托管平台配置相应基础路径。

## 环境变量 / Environment Variables

公开页面内置静态 JSON，作为后端不可用或未返回有效数据时的内容回退。开源使用者应部署自己的后端，并在本地 `.env` 文件或部署平台的构建环境中设置：

```dotenv
VITE_RESUME_API_BASE_URL=https://api.example.com
```

该变量应指向你自己部署的 API 基地址。发布仓库前，请人工复核 `src/config/app-config.ts` 与 `cloudflare/wrangler.jsonc`，确保个人生产资源不会随仓库公开。不要把 Token、密码、密钥、真实生产资源或备份内容写入仓库。

## 自定义内容、语言与主题 / Customize

- 主页与简历内容：`src/data/home-catalog.json`、`src/data/resume-catalog.json`
- 界面国际化：`src/i18n/locales/` 与 `src/i18n/config.ts`
- 明暗主题：`src/theme/`、`src/hooks/use-theme.ts` 与 `src/index.css`
- 可选后端：见 [`cloudflare/README.md`](cloudflare/README.md)

更新内容后，请分别检查三种语言的展示效果和窄屏布局。

## 常用命令 / Common Commands

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

## 部署 / Deployment

### GitHub Pages（静态站点）

1. 在仓库的 Pages 设置中选择 GitHub Actions 或静态文件发布方式。
2. 运行 `pnpm build` 生成 `dist/`。
3. 使用现有脚本发布：`pnpm deploy`。
4. 若需要访问可选后端，在 Pages 构建环境设置 `VITE_RESUME_API_BASE_URL`。
5. 发布前将在线演示链接中的 `DEMO_URL` 替换为实际地址；若不提供演示，请删除该链接并保留“暂未提供公开演示”说明。

### Cloudflare Worker（可选后端）

Worker 可为主页与简历内容提供管理接口。安装、配置、检查与部署说明见 [`cloudflare/README.md`](cloudflare/README.md)。请使用自己的 Worker、KV 与域名配置，并将敏感值保存在平台 Secret 中。

## 参与与安全 / Contributing and Security

- [贡献指南 / Contributing](CONTRIBUTING.md)
- [安全政策 / Security](SECURITY.md)
- [MIT 许可证 / License](LICENSE)
- [开源推广手册 / Open-source promotion](docs/open-source-promotion.md)

## 发布前检查 / Before Publishing

- 将在线演示链接中的 `DEMO_URL` 替换为实际地址；若不提供演示，请删除该链接并保留“暂未提供公开演示”说明。
- 将 [LICENSE](LICENSE) 中的 `YOUR_NAME` 替换为希望公开显示的主体。
- 将 [SECURITY.md](SECURITY.md) 中的 `SECURITY_CONTACT` 替换为私下安全联系渠道。
- 检查示例内容、截图和日志是否已脱敏。
