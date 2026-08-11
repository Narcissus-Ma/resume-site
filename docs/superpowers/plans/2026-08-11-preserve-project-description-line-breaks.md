# 项目描述保留换行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让简历页按管理页输入内容保留项目描述中的换行，同时继续按纯文本安全渲染。

**Architecture:** 保持 `TextArea → 表单 → JSON API → 存储 → React` 数据链路不变，只在 `Experience` 展示组件的项目描述元素上应用 `white-space: pre-line`。测试通过服务端渲染真实组件，验证多行文本节点及对应 Tailwind 类，避免引入 DOM 测试依赖。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、Node.js test runner、React DOM Server、pnpm

---

## 文件结构

- 新建 `tests/experience.test.ts`：服务端渲染 `Experience`，覆盖多行项目描述的渲染契约。
- 修改 `src/components/experience.tsx:25`：给项目描述元素增加 `whitespace-pre-line`。

### Task 1: 保留项目描述换行

**Files:**
- Create: `tests/experience.test.ts`
- Modify: `src/components/experience.tsx:25`
- Test: `tests/experience.test.ts`

- [ ] **Step 1: 编写失败测试**

创建 `tests/experience.test.ts`：

```typescript
import assert from 'node:assert/strict';
import test from 'node:test';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Experience from '../src/components/experience.tsx';
import '../src/i18n/config.ts';

test('项目描述使用保留换行的纯文本样式', () => {
  const markup = renderToStaticMarkup(
    React.createElement(Experience, {
      experience: [],
      projects: [
        {
          name: '项目名称',
          period: '2024.01 - 2024.12',
          description: '第一行\n<strong>第二行</strong>',
        },
      ],
      education: [],
      website: [],
    }),
  );

  assert.match(
    markup,
    /<p class="[^"]*whitespace-pre-line[^"]*">第一行\n&lt;strong&gt;第二行&lt;\/strong&gt;<\/p>/,
  );
  assert.doesNotMatch(markup, /<br\s*\/?\s*>/);
});
```

- [ ] **Step 2: 运行测试并确认按预期失败**

Run: `pnpm exec tsx --test tests/experience.test.ts`

Expected: FAIL；输出表明渲染得到的项目描述 `<p>` 不包含 `whitespace-pre-line`。

- [ ] **Step 3: 实现最小修复**

修改 `src/components/experience.tsx` 的项目描述元素：

```tsx
<p className="theme-text-secondary mt-2 whitespace-pre-line">{project.description}</p>
```

不要使用 `dangerouslySetInnerHTML`，不要拆分字符串或更改 API/类型定义。

- [ ] **Step 4: 运行定向测试并确认通过**

Run: `pnpm exec tsx --test tests/experience.test.ts`

Expected: PASS；1 个测试通过，无错误或警告。

- [ ] **Step 5: 运行完整质量检查**

依次运行：

```bash
pnpm test
pnpm lint
pnpm format:check
pnpm build
git diff --check
```

Expected: 所有命令退出码为 0；测试全部通过；ESLint 无警告；Prettier 无格式问题；TypeScript 与 Vite 构建成功；Git 未报告空白错误。

- [ ] **Step 6: 检查变更范围**

Run: `git status --short && git diff -- tests/experience.test.ts src/components/experience.tsx`

Expected: 本任务只新增测试并修改项目描述样式；用户已有的 `src/config/app-config.ts` 暂存改动保持原状且不包含在本任务差异中。

- [ ] **Step 7: 提交实现**

```bash
git add tests/experience.test.ts src/components/experience.tsx
git commit --only tests/experience.test.ts src/components/experience.tsx -m "fix: 保留项目描述换行"
git show --name-only --format= HEAD
```

Expected: 新提交只列出上述两个实现文件；`src/config/app-config.ts` 仍保持暂存，但不在新提交中。
