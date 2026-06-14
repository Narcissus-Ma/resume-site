# 多岗位主页管理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为主页管理后台增加完全独立的多岗位、多语言内容管理和主页默认岗位发布能力。

**Architecture:** 使用 `home-catalog.json` 保存独立主页岗位、启用状态和三语言内容；主页领域规则、API 客户端和文件仓库与打印简历目录平行但互不依赖。公开主页静态读取启用主页岗位，管理端通过 Express API 修改目录。

**Tech Stack:** React 18、TypeScript、Ant Design 5、i18next、Express 5、Node test runner、tsx、Vite、JSON

---

## 工作区边界

当前工作区存在另一项“简历编辑器添加条目时保留未保存表单内容”的未提交改动：

- `src/data/resume-catalog.json`
- `src/domain/resume/rules/resume-editor.ts`
- `src/hooks/use-resume-editor.ts`
- `tests/resume-editor.test.ts`
- 对应文档与 `docs/todo.md`

本计划不得回退、覆盖或提交这些改动。所有新增功能代码保持未提交。

## 文件结构

### 新增

- `src/data/home-catalog.json`
- `src/domain/home/rules/home-catalog.ts`
- `src/domain/home/rules/home-editor.ts`
- `src/services/home-api.ts`
- `src/server/home-catalog-repository.ts`
- `src/hooks/use-home-profile-management.ts`
- `src/components/home-profile-toolbar.tsx`
- `tests/home-catalog.test.ts`
- `tests/home-api.test.ts`
- `tests/home-server.test.ts`
- `tests/home-editor.test.ts`

### 修改

- `src/types/index.ts`
- `src/hooks/use-translated-data.ts`
- `src/hooks/use-home.ts`
- `src/hooks/use-home-manage.ts`
- `src/pages/home/home.tsx`
- `src/pages/home/home-manage.tsx`
- `src/components/home-section.tsx`
- `src/server/create-server.ts`
- `server.ts`
- `scripts/translate-data.js`
- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en-US.json`
- `src/i18n/locales/ja-JP.json`
- `tsconfig.server.json`

### 删除

- `src/data/homeData.json`
- `src/data/homeData_zh-CN.json`
- `src/data/homeData_en-US.json`
- `src/data/homeData_ja-JP.json`

## Task 1：主页目录类型与领域规则

**Files:**

- Modify: `src/types/index.ts`
- Create: `src/domain/home/rules/home-catalog.ts`
- Test: `tests/home-catalog.test.ts`

- [ ] 先写失败测试，覆盖启用岗位读取、语言回退、空白创建、深复制、重名、删除保护、设置启用和内容更新。
- [ ] 运行 `pnpm exec tsx --test tests/home-catalog.test.ts`，确认因模块不存在失败。
- [ ] 增加 `HomeData` 的 `occupation` 和 `description`，定义 `HomeProfile`、`HomeCatalog`、`HomeCatalogMutationResult`。
- [ ] 实现不可变纯规则和可注入 ID 生成器。
- [ ] 复跑测试并确认通过。

## Task 2：迁移单一主页目录和公开读取

**Files:**

- Create: `src/data/home-catalog.json`
- Modify: `src/hooks/use-translated-data.ts`
- Modify: `src/hooks/use-home.ts`
- Modify: `src/pages/home/home.tsx`
- Modify: `src/components/home-section.tsx`
- Delete: `src/data/homeData*.json`
- Test: `tests/home-catalog.test.ts`

- [ ] 增加真实迁移目录测试，断言 `frontend`、三语言、职业名称和现有技能数据。
- [ ] 确认测试因 `home-catalog.json` 不存在失败。
- [ ] 机械合并三份主页数据，并从 locale 迁入各语言职业名称和简介。
- [ ] `useHomeData()` 改为读取主页目录启用岗位。
- [ ] `useHome()` 返回 `occupation`、`description`。
- [ ] `HomeSection` 通过 Props 展示职业名称和简介。
- [ ] 删除旧主页数据文件并检查无旧引用。
- [ ] 运行主页目录测试和生产构建。

## Task 3：主页仓库与 API

**Files:**

- Create: `src/server/home-catalog-repository.ts`
- Modify: `src/server/create-server.ts`
- Modify: `server.ts`
- Modify: `tsconfig.server.json`
- Test: `tests/home-server.test.ts`

- [ ] 使用内存主页仓库先写主页 API 失败测试。
- [ ] 覆盖 GET、内容更新、空白创建、复制、重命名、删除保护、设置启用和统一错误。
- [ ] 实现 `HomeCatalogRepository` 与 Prettier 格式化的本地文件仓库。
- [ ] 给 `createServer()` 注入主页仓库，删除旧 `/api/home?lang=` 路由。
- [ ] 在 `server.ts` 组装 `home-catalog.json` 仓库。
- [ ] 运行主页 API 测试和服务端类型检查。

## Task 4：主页 API 客户端

**Files:**

- Create: `src/services/home-api.ts`
- Test: `tests/home-api.test.ts`

- [ ] 先写请求路径、JSON 请求体、统一错误和网络错误测试。
- [ ] 确认模块不存在导致失败。
- [ ] 实现 `getCatalog`、`updateContent`、`createHome`、`renameHome`、`deleteHome`、`setActiveHome`。
- [ ] API 基础地址使用 `VITE_RESUME_API_BASE_URL`，当前与本地服务共用域名，数据接口仍独立。
- [ ] 运行客户端测试。

## Task 5：主页编辑表单规则

**Files:**

- Create: `src/domain/home/rules/home-editor.ts`
- Test: `tests/home-editor.test.ts`
- Modify: `src/hooks/use-home-manage.ts`

- [ ] 先写“添加技能、经历、项目时保留其他未保存字段”的失败测试。
- [ ] 实现表单数据合并及 append 纯函数。
- [ ] 重构 `use-home-manage.ts` 的条目新增逻辑使用当前 `form.getFieldsValue(true)`。
- [ ] 删除逻辑同样以当前表单值为源，避免删除时丢失未保存内容。
- [ ] 运行编辑规则测试。

## Task 6：主页岗位管理 Hook 和工具栏

**Files:**

- Create: `src/hooks/use-home-profile-management.ts`
- Create: `src/components/home-profile-toolbar.tsx`
- Modify: `src/hooks/use-home-manage.ts`
- Modify: `src/pages/home/home-manage.tsx`
- Modify: `src/i18n/locales/*.json`

- [ ] 实现目录加载、当前岗位、当前语言、表单同步、脏状态和加载错误。
- [ ] 实现保存、岗位增删改复制和设置主页启用岗位。
- [ ] 实现“保存并继续 / 放弃修改 / 取消”保护。
- [ ] 增加主页岗位和语言工具栏，行为与简历工具栏一致但类型和回调独立。
- [ ] 表单顶部增加职业名称和个人简介。
- [ ] 增加三语言管理 UI 文案。
- [ ] 运行 TypeScript、ESLint 和 Prettier。

## Task 7：翻译脚本

**Files:**

- Modify: `scripts/translate-data.js`
- Test: `tests/home-catalog.test.ts`

- [ ] 增加多个主页岗位翻译测试。
- [ ] 实现 `translateHomeCatalog()`，逐岗位以中文内容更新英文和日文。
- [ ] 删除旧单文件 `translateHomeData()` 路径。
- [ ] 保持岗位 ID、名称和 `activeHomeId` 不变。
- [ ] 运行全部测试。

## Task 8：完整验证

- [ ] 运行：

```bash
pnpm test
pnpm typecheck
pnpm exec tsc -p tsconfig.server.json --noEmit
pnpm lint
pnpm format:check
pnpm build
git diff --check
```

- [ ] 启动独立端口的前后端进行浏览器验收。
- [ ] 验证主页管理的岗位、语言、职业名称、简介、保存和未保存保护。
- [ ] 创建临时主页岗位、设为启用，确认公开主页更新。
- [ ] 确认打印简历的启用岗位和内容没有变化。
- [ ] 恢复 `frontend` 为主页启用岗位并删除临时数据。
- [ ] 检查 `home-catalog.json` 仅保留预期数据。
- [ ] 保持全部功能代码未提交。
