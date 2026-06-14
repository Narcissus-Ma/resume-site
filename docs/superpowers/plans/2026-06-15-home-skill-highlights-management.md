# Home Skill Highlights Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让主页管理后台按主页岗位和语言编辑技能区简介及动态技能描述卡片，并在公开主页展示对应内容。

**Architecture:** 扩展现有 `HomeData`，将技能区简介和动态卡片作为主页内容的一部分，通过既有目录 API 整体保存。卡片编辑行为放入主页领域规则，管理组件仅负责表单交互；公开页根据受限图标枚举渲染卡片。

**Tech Stack:** React、TypeScript、Ant Design、i18next、Node.js test runner、Express

---

### Task 1: 扩展主页领域数据

**Files:**

- Modify: `src/types/index.ts`
- Modify: `src/domain/home/rules/home-catalog.ts`
- Modify: `src/domain/home/rules/home-editor.ts`
- Test: `tests/home-catalog.test.ts`
- Test: `tests/home-editor.test.ts`

- [ ] 写失败测试，要求空白主页包含 `skillSectionDescription` 和 `skillHighlights`。
- [ ] 写失败测试，要求新增、删除、移动卡片时保留其他未保存表单字段。
- [ ] 运行 `pnpm exec tsx --test tests/home-catalog.test.ts tests/home-editor.test.ts`，确认因字段和规则缺失失败。
- [ ] 新增 `SkillHighlight`、`SkillHighlightIcon` 类型及领域编辑规则。
- [ ] 重跑专项测试并确认通过。

### Task 2: 迁移目录数据与翻译保护

**Files:**

- Modify: `src/data/home-catalog.json`
- Modify: `scripts/translate-data.js`
- Test: `tests/home-catalog.test.ts`

- [ ] 写失败测试，要求现有三语言内容包含技能区简介和三张默认卡片。
- [ ] 写失败测试，要求自动翻译保留卡片 `id`、`icon`，仅翻译文案字段。
- [ ] 运行目录测试并确认按预期失败。
- [ ] 将现有 locale 技能文案迁移到每个主页的三语言内容。
- [ ] 为翻译脚本增加结构字段保护。
- [ ] 重跑目录测试并确认通过。

### Task 3: 实现管理页面编辑

**Files:**

- Create: `src/components/home-skill-highlights-editor.tsx`
- Modify: `src/hooks/use-home-manage.ts`
- Modify: `src/pages/home/home-manage.tsx`
- Modify: `src/i18n/locales/zh-CN.json`
- Modify: `src/i18n/locales/en-US.json`
- Modify: `src/i18n/locales/ja-JP.json`

- [ ] 在 Hook 中接入新增、删除、上移、下移规则，并使用 `crypto.randomUUID()` 创建卡片 ID。
- [ ] 实现技能区简介、图标、标题、描述编辑组件。
- [ ] 在主页管理表单中接入组件并补齐三语言界面文案。
- [ ] 确认切换主页岗位或语言时仍复用既有未保存提示。

### Task 4: 实现公开主页展示

**Files:**

- Modify: `src/hooks/use-home.ts`
- Modify: `src/pages/home/home.tsx`
- Modify: `src/components/skills-section.tsx`

- [ ] 将技能区简介和卡片从启用主页内容传递到 `SkillsSection`。
- [ ] 用图标枚举映射渲染动态卡片，并使用卡片 ID 作为 React key。
- [ ] 简介为空时隐藏简介，卡片为空时隐藏卡片栏。

### Task 5: 验证与审查

**Files:**

- Verify all modified files

- [ ] 运行主页专项测试。
- [ ] 运行 Prettier、TypeScript、ESLint 和生产构建。
- [ ] 启动本地前后端，用浏览器验证新增、排序、保存以及公开页展示。
- [ ] 审查最终差异，确保未覆盖工作区原有改动且不提交。
