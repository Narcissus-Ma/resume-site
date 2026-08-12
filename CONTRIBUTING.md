# 贡献指南

感谢你考虑为本项目作出贡献。请先阅读本指南，并始终避免提交任何敏感信息或真实生产资源标识。

## 开始之前

1. 提交 Issue 前，先搜索已有 Issue 和讨论，避免重复反馈。
2. 报告缺陷时，请提供可在干净环境中运行的最小复现步骤、预期结果、实际结果及必要的脱敏日志。
3. 提议功能时，请说明使用场景、问题背景和可接受的替代方案。
4. 不要在公开 Issue 中粘贴 Token、Cookie、密码、密钥、备份或漏洞利用细节；安全问题请遵循 [SECURITY.md](SECURITY.md)。

## 分支与提交

- 从当前 `main` 分支创建聚焦的分支，例如 `feat/theme-toggle` 或 `fix/mobile-layout`。
- 一个 Pull Request 尽量只解决一个问题；避免顺带进行无关的格式化或重构。
- 建议采用 Conventional Commits，例如：

```text
feat: 添加主题切换快捷入口
fix: 修复窄屏导航溢出
docs: 补充本地运行说明
```

## 本地检查

前端改动请在仓库根目录执行：

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

如改动涉及可选 Worker 后端，请额外执行：

```bash
pnpm --dir cloudflare format:check
pnpm --dir cloudflare lint
pnpm --dir cloudflare test
pnpm --dir cloudflare typecheck
```

若某项检查因环境或依赖限制无法完成，请在 PR 中说明实际命令、输出和原因。

## Pull Request 内容

请在 PR 描述中包含：

- 改动目的与实现摘要；
- 关联的 Issue（如有）；
- 已运行的验证命令及结果；
- 界面改动的截图或录屏（如适用，且已脱敏）；
- 配置、文档、国际化或测试更新说明。

## 敏感信息与生产资源

禁止提交 `.env`、`.dev.vars`、Token、密码、密码哈希、签名密钥、限流盐、备份文件或真实生产资源（例如域名、KV 标识、账号配置）。请使用示例值、环境变量和托管平台 Secret；提交前检查 `git diff` 与 `git status`。

## English summary

Search existing issues before opening a new one, and provide a minimal reproducible case for bugs. Create focused branches from `main` and use clear Conventional Commit-style messages when practical. Run the relevant root and Worker checks before opening a pull request, and include the results in the PR description. Never commit `.env`, `.dev.vars`, tokens, passwords, backups, or real production resource identifiers. Report security concerns privately as described in [SECURITY.md](SECURITY.md).
