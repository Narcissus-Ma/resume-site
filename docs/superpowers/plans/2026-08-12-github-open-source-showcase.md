# GitHub 开源作品展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目整理为中文优先、英文可用且适合个人作品展示的 GitHub 开源仓库，并提供可执行的发布推广资料。

**Architecture:** 根级 README 承担项目介绍和入门导航；协作文档与 GitHub 表单处理外部反馈；推广文档独立维护发布节奏。仅改写对外文档中的真实生产基础设施信息，不修改应用代码、Worker 配置或历史设计记录。

**Tech Stack:** Markdown、GitHub Issue Forms、YAML、Prettier、pnpm、Vite、Cloudflare Workers。

---

## 文件结构

- Create: `README.md` — 中文优先的双语项目首页与运行/部署导航。
- Create: `CONTRIBUTING.md` — 贡献流程、质量检查与敏感信息规则。
- Create: `SECURITY.md` — 漏洞私下反馈路径与安全边界。
- Create: `LICENSE` — MIT 许可证文本，版权年份和持有人使用清晰占位符。
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml` — 缺陷反馈表单。
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml` — 功能建议表单。
- Create: `.github/pull_request_template.md` — 拉取请求自检模板。
- Create: `docs/open-source-promotion.md` — 发布前检查和两周推广执行手册。
- Modify: `cloudflare/README.md` — 用通用示例替换当前生产资源段落。

### Task 1: 写入仓库首屏与协作基础文档

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `LICENSE`

- [ ] **Step 1: 创建中文优先的双语 README**

写入以下完整章节，所有链接使用相对路径；将 `DEMO_URL` 和仓库所有者联系信息保留为发布前必须替换的显式占位符：

```markdown
# Resume Site / 个人主页与简历展示

> 一套可展示、可定制、可自行部署的 React 个人主页与简历站点。
> A customizable React portfolio and resume site for personal showcases.

## 功能亮点 / Highlights

- 个人主页与简历双页面展示
- 中文、English、日本語界面与内容
- 明暗主题与响应式布局
- 可选的 Cloudflare Worker 内容管理后端

## 快速开始 / Quick Start

pnpm install
pnpm dev
```

补齐项目截图位置（不引用不存在的图片）、技术栈、目录结构、环境变量、常用命令、GitHub Pages 静态部署与 Worker 后端文档入口，以及贡献/安全/许可证/推广文档链接。明确上线前替换 `DEMO_URL`；没有演示时显示“暂未提供公开演示”。

- [ ] **Step 2: 创建贡献指南**

以中文说明 Issue 搜索、最小复现、分支和提交建议、前后端检查命令、PR 内容要求，以及禁止提交 `.env`、`.dev.vars`、Token、密码、备份文件和真实生产资源。文末附 3–5 句英文摘要，指向相同规则。

- [ ] **Step 3: 创建安全政策**

明确不要在公开 Issue 中提交凭据或漏洞利用细节；使用 `SECURITY_CONTACT` 占位符定义私下报告地址；说明支持范围为当前 `main`，并以“收到确认、修复、披露”的流程描述处理预期，避免承诺固定响应时限。

- [ ] **Step 4: 创建 MIT 许可证**

使用标准 MIT 文本，版权行写为：

```text
Copyright (c) 2026 YOUR_NAME
```

README 发布前检查项中提醒所有者将 `YOUR_NAME` 替换为其希望公开显示的主体。

- [ ] **Step 5: 校验新增 Markdown 与许可证**

Run: `pnpm exec prettier --check README.md CONTRIBUTING.md SECURITY.md LICENSE`

Expected: 退出码为 0；新增文本符合仓库 Prettier 规则。

- [ ] **Step 6: 提交首屏与协作基础文档**

```bash
git add README.md CONTRIBUTING.md SECURITY.md LICENSE
git commit -m "docs: add open-source repository basics"
```

### Task 2: 建立 GitHub 反馈模板

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: 创建缺陷反馈 Issue Form**

使用 GitHub Issue Form schema，表单包含必填的“问题描述”“复现步骤”“预期结果”“实际结果”和“运行环境”；可选字段包含截图/日志。每项标签提供中英双语，日志提示中明确移除 Token、Cookie、域名和个人信息。默认标签使用 `bug`。

- [ ] **Step 2: 创建功能建议 Issue Form**

使用 schema，包含必填的“需求背景”“希望的方案”“替代方案”，并加入确认复选框：已搜索现有 Issue，且不含密码、密钥、Token 或生产配置。默认标签使用 `enhancement`。

- [ ] **Step 3: 创建 PR 模板**

模板包含“改动说明”“关联 Issue”“验证命令与结果”“截图（如适用）”和“自检”复选项；自检覆盖 lint、格式化、测试、未提交敏感信息及已更新相关文档。

- [ ] **Step 4: 校验 GitHub 模板格式**

Run: `pnpm exec prettier --check .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/pull_request_template.md`

Expected: 退出码为 0；YAML 和 Markdown 格式化检查通过。

- [ ] **Step 5: 提交反馈模板**

```bash
git add .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/pull_request_template.md
git commit -m "docs: add GitHub contribution templates"
```

### Task 3: 脱敏 Worker 文档并补充推广手册

**Files:**
- Modify: `cloudflare/README.md`
- Create: `docs/open-source-promotion.md`

- [ ] **Step 1: 将 Worker 生产资源段落改为通用示例**

删除 `## 当前生产资源` 下真实 Worker、API 域名、KV 名称和允许来源。替换为 `## 生产配置示例（请自行替换）`，内容使用 `your-worker-name`、`https://api.example.com`、`production-kv-namespace`、`preview-kv-namespace` 与 `https://your-account.github.io`。保留前文的部署步骤与安全提醒。

- [ ] **Step 2: 编写推广执行手册**

以中文创建以下章节：

```markdown
# GitHub 开源推广手册

## 发布前检查
## GitHub 首发设置
## 首发文案
## 渠道与内容角度
## 发布后两周节奏
## 指标与复盘
```

发布前检查需包含：运行 `git status`、检查 `.gitignore`、搜索密钥模式、搜索当前生产域名/KV ID、替换 `DEMO_URL`、替换 `YOUR_NAME` 与 `SECURITY_CONTACT`、设置仓库简介/Topics/社交预览图，并运行所有质量命令。

首发文案提供可复制的中文 GitHub Release 模板、掘金/知乎文章大纲和英文简介。两周节奏至少覆盖首发日、工程拆解、功能演示、复盘迭代四个节点；指标包括 GitHub Views/Clones、Stars、收藏、有效 Issue、部署反馈和演示访问。

- [ ] **Step 3: 执行脱敏全文搜索**

Run:

```bash
rg -n -i 'resume-api\.narcissus2ma\.dpdns\.org|narcissus-ma\.github\.io|a191a42adb394b0397894f62ad59040d|2569f1ad76564b359f830a07ee6963f6' \
  README.md CONTRIBUTING.md SECURITY.md cloudflare/README.md .github \
  $(rg --files docs -g '*.md' | rg -v '^docs/superpowers/(specs|plans)/')
```

Expected: 退出码为 1，且没有匹配结果。该命令覆盖规格定义的全部对外文档范围，同时排除既有历史设计和计划记录；不要用不加范围限制的全仓搜索结果作为失败条件，因为既有运行时配置不属于本计划修改范围。

- [ ] **Step 4: 校验改动文档格式**

Run: `pnpm exec prettier --check README.md CONTRIBUTING.md SECURITY.md LICENSE cloudflare/README.md docs/open-source-promotion.md .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml .github/pull_request_template.md`

Expected: 退出码为 0。

- [ ] **Step 5: 提交推广与脱敏文档**

```bash
git add cloudflare/README.md docs/open-source-promotion.md
git commit -m "docs: add open-source promotion guide"
```

### Task 4: 执行发布前质量验证

**Files:**
- Verify: 所有本计划新增或修改的文档文件

- [ ] **Step 1: 检查工作区与变更范围**

Run: `git status --short && git diff --check HEAD~3..HEAD`

Expected: 文档变更无空白错误；没有无关的应用或配置文件变更。

- [ ] **Step 2: 执行前端质量检查**

Run:

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Expected: 每条命令退出码为 0。文档改动不应改变前端构建产物行为。

- [ ] **Step 3: 执行 Worker 质量检查**

Run:

```bash
pnpm --dir cloudflare format:check
pnpm --dir cloudflare lint
pnpm --dir cloudflare test
pnpm --dir cloudflare typecheck
```

Expected: 每条命令退出码为 0。若环境限制导致 Worker dry-run 需要网络认证，不将 `pnpm --dir cloudflare build` 作为本次文档变更的阻塞项，并在交付说明中记录。

- [ ] **Step 4: 提交验证记录（仅在项目已有对应实践时）**

不创建仅记录“检查通过”的空提交。保留 Task 1–3 的功能性文档提交，并在交付中报告命令和实际输出。
