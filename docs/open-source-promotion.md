# 开源推广手册

本手册用于在项目公开前完成脱敏、首发和两周内的持续传播。请根据实际项目状态调整内容；其中的占位符必须在发布前替换。

## 发布前检查

逐项完成并记录结果，不能以“应该已经处理”代替人工复核：

- 工作区检查：运行 `git status --short`，确认没有待提交的构建产物、日志、备份或本地配置；它只检查工作区，不能证明当前受跟踪文件或 Git 历史安全。运行 `git diff --check` 检查补丁中的空白错误。
- 检查 `.gitignore` 是否覆盖 `.env`、`cloudflare/.dev.vars`、Worker 本地状态、备份和日志。
- 检查当前树中是否意外跟踪了敏感或构建文件：`git ls-files | rg '(^|/)(\.env(\..*)?|cloudflare/\.dev\.vars|cloudflare/\.wrangler/|cloudflare/backups/|dist/|.*\.log)$'`。命中后先判断文件用途，必要时从受跟踪文件中移除并确保 `.gitignore` 覆盖。
- 扫描当前受跟踪文件：`git grep -n -i -e 'api[_-]?key' -e 'secret' -e 'token' -e 'password' -e 'private[_-]?key'`。另以相同方式扫描个人生产标识，例如 `git grep -n -i -e '<当前生产域名或KV ID>'`。
- 扫描 Git 历史：`git log --all -S '<当前生产域名或KV ID>' --oneline`。将命令中的目标替换为自己的个人域名、KV ID、邮箱等标识；命中时先判断是否敏感，必要时在公开前移除或替换受跟踪文件、重写 Git 历史，并轮换任何真正泄露过的凭据。
- 将根目录 `README.md` 的 `DEMO_URL` 替换为真实、已公开的演示地址；若不提供演示，删除该链接并保留“暂未提供公开演示”说明。
- 将 `LICENSE` 中的 `YOUR_NAME` 替换为希望公开显示的主体。
- 将 `SECURITY.md` 中的 `OWNER/REPOSITORY` 替换为真实仓库路径；按需配置 `SECURITY_CONTACT` 作为补充的私下安全联系渠道。
- 设置仓库简介、Topics 和社交预览图；预览图应使用已脱敏的真实界面截图或项目图形。
- 逐项检查 `src/config/app-config.ts` 与 `cloudflare/wrangler.jsonc`。`cloudflare/wrangler.jsonc` 是当前受 Git 跟踪的公开配置：发布前必须替换或移除其中真实路由、KV ID、Origin，或将本地生产配置迁出并提交安全的示例；不能将真实配置保留在该文件中。同样审查 seeds、静态 JSON 中的个人主页链接、README、其他文档和 Git 历史。本手册不代表这些配置已经完成脱敏。
- 运行全部质量命令：`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check`、`pnpm build`；如启用 Worker，还应在 `cloudflare/` 中运行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm format:check` 和 `pnpm build`。

## GitHub 首发设置

1. 使用清晰的仓库简介，例如“可定制、可自行部署的 React 个人主页与简历站点”。
2. 添加与项目匹配的 Topics：`react`、`typescript`、`vite`、`portfolio`、`resume`、`cloudflare-workers`。
3. 创建首个 Release，使用语义化标签（例如 `v1.0.0`），并在说明中写明静态模式可直接使用、Worker 后端为可选能力。
4. 固定一条 Issue 或 Discussion，集中收集部署问题、功能建议和使用案例，避免重复沟通。
5. 检查 README 中的安装、演示、许可证、贡献与安全链接均可访问，再公开仓库。

## 首发文案

### GitHub Release 模板（中文）

````md
## v1.0.0：个人主页与简历站点首发

这是一个基于 React、TypeScript 和 Vite 的个人主页与简历模板，支持多语言、明暗主题和响应式展示。

### 亮点

- 静态 JSON 内容，可直接部署为个人主页
- 可选 Cloudflare Worker + KV 内容管理后端
- 后端不可用时仍可使用打包内容展示
- 提供中文、English、日本語界面

### 快速开始

```bash
pnpm install
pnpm dev
```

欢迎通过 Issue 反馈部署体验、问题和改进建议；请勿在公开讨论中提交任何密钥或生产配置。
````

### 掘金 / 知乎文章大纲

1. 为什么做这个项目：个人主页与简历展示中常见的维护、部署和可定制性问题。
2. 项目能力概览：多语言、主题、响应式、静态内容回退与可选管理后端。
3. 技术实现拆解：React + TypeScript + Vite，及可选的 Cloudflare Worker + KV。
4. 从零部署：静态站点部署步骤、可选后端的边界和安全注意事项。
5. 可定制入口：内容 JSON、翻译文件、主题与环境变量。
6. 后续计划：邀请读者体验、反馈部署问题和贡献使用案例。

### English introduction

> A customizable React portfolio and resume site built with TypeScript and Vite. It supports responsive layouts, multilingual content, light and dark themes, bundled JSON fallback, and an optional Cloudflare Worker + KV backend for content management.

## 渠道与内容角度

- GitHub：突出可复用模板、清晰的快速开始和可运行的质量检查。
- 掘金：以“从静态简历到可管理个人主页”为主线，讲清技术取舍和部署边界。
- 知乎：从个人品牌展示、求职作品集维护和长期内容沉淀的角度介绍使用场景。
- 即刻、微博或朋友圈：使用一张脱敏截图和一句核心卖点，引导读者访问 Release 或 README。
- 技术社群：重点分享部署踩坑、性能优化或国际化实践，避免只发送仓库链接。

## 发布后两周节奏

| 时间节点 | 内容 | 目标 |
| --- | --- | --- |
| 首发日 | 发布 GitHub Release、README 演示和首篇介绍内容。 | 获得首批访问、Star 与部署反馈。 |
| 第 3—5 天：工程拆解 | 发布项目结构、内容管理和静态回退的技术拆解。 | 回应“如何实现”和“能否二次开发”的问题。 |
| 第 7—10 天：功能演示 | 录制或截图展示多语言、主题切换、移动端与可选管理流程。 | 降低试用门槛，收集真实使用场景。 |
| 第 14 天：复盘迭代 | 汇总反馈、关闭或分类 Issue，发布小版本和变更说明。 | 将反馈转化为可验证的改进计划。 |

## 指标与复盘

每周记录一次，并结合来源渠道和内容形式解释变化，而非只比较总量：

- GitHub Views / Clones：判断仓库曝光与实际获取代码的比例。
- Stars：判断项目定位和首屏介绍是否有吸引力。
- 文章收藏：判断内容是否具有长期参考价值。
- 有效 Issue：统计可复现、信息完整的问题和功能建议。
- 部署反馈：记录成功率、常见托管平台和阻塞步骤。
- 演示访问：观察演示链接是否真正带来试用与后续互动。若接入第三方分析，先披露数据收集并遵守适用的隐私与同意要求；也可仅使用托管平台的聚合统计。

两周后形成一页复盘：列出表现最好的渠道与内容角度、前三个用户阻塞点、已完成改进、暂不处理的事项及原因，并据此安排下一个迭代周期。
