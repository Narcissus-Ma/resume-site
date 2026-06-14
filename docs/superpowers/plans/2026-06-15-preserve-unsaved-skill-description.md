# Preserve Unsaved Skill Description Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 点击“添加技能描述”时保留表单中尚未保存的技能描述内容。

**Architecture:** 在 resume domain rules 中新增纯函数，以 Form 实时值为数据源追加技能描述。`use-resume-editor` 读取完整表单值并调用规则函数，然后沿用现有 `updateData` 同步状态和表单。

**Tech Stack:** React 18、TypeScript、Ant Design Form、Node.js test runner

---

### Task 1: 添加回归规则与接入 Hook

**Files:**

- Create: `src/domain/resume/rules/resume-editor.ts`
- Modify: `src/hooks/use-resume-editor.ts`
- Test: `tests/resume-editor.test.ts`

- [ ] **Step 1: 编写失败测试**

验证表单实时值覆盖旧数据，并在其后追加“新的技能描述”。

- [ ] **Step 2: 运行测试并确认失败**

Run: `pnpm exec tsx --test tests/resume-editor.test.ts`

Expected: FAIL，因为规则函数尚不存在。

- [ ] **Step 3: 实现最小规则并接入 Hook**

规则函数返回新对象，不修改输入；Hook 使用 `form.getFieldsValue(true)` 取得实时数据。

- [ ] **Step 4: 运行测试和质量检查**

Run: `pnpm exec tsx --test tests/resume-editor.test.ts`

Run: `pnpm test`

Run: `pnpm typecheck`

Run: `pnpm lint`

Run: `pnpm format:check`
