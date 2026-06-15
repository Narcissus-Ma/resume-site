# Projects Card Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将公开主页的个人项目集从轮播改为可点击的响应式等高卡片网格，并在新标签页安全打开有效项目链接。

**Architecture:** 保留 `ProjectsSection` 的数据输入和区块职责，新增一个纯函数集中判断项目链接是否可交互，组件据此选择锚点卡片或静态卡片。卡片专属布局与交互放入 CSS Module，继续复用全局主题变量和减少动画规则。

**Tech Stack:** React 18、TypeScript、Tailwind CSS、CSS Modules、Ant Design Typography、Node.js test runner

---

### Task 1: 定义项目链接交互规则

**Files:**

- Create: `src/components/project-card-link.ts`
- Create: `tests/project-card-link.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import assert from 'node:assert/strict';
import test from 'node:test';

import { getProjectCardHref } from '../src/components/project-card-link.ts';

test('返回去除首尾空格后的有效项目链接', () => {
  assert.equal(getProjectCardHref(' https://example.com/project '), 'https://example.com/project');
});

test('空链接和占位链接不生成可交互地址', () => {
  assert.equal(getProjectCardHref(''), null);
  assert.equal(getProjectCardHref('   '), null);
  assert.equal(getProjectCardHref('#'), null);
  assert.equal(getProjectCardHref(' # '), null);
});

test('危险协议不生成可交互地址', () => {
  assert.equal(getProjectCardHref('javascript:alert(1)'), null);
  assert.equal(getProjectCardHref('data:text/html,<h1>项目</h1>'), null);
});
```

- [ ] **Step 2: 运行专项测试并确认失败**

Run: `pnpm exec tsx --test tests/project-card-link.test.ts`

Expected: FAIL，提示无法找到 `project-card-link.ts` 或导出函数。

- [ ] **Step 3: 实现最小链接规则**

```typescript
const PROJECT_LINK_BASE_URL = 'https://resume-site.local';
const ALLOWED_PROJECT_PROTOCOLS = new Set(['http:', 'https:']);

export const getProjectCardHref = (link: string): string | null => {
  const normalizedLink = link.trim();

  if (!normalizedLink || normalizedLink === '#') {
    return null;
  }

  try {
    const url = new URL(normalizedLink, PROJECT_LINK_BASE_URL);

    return ALLOWED_PROJECT_PROTOCOLS.has(url.protocol) ? normalizedLink : null;
  } catch {
    return null;
  }
};
```

- [ ] **Step 4: 重跑专项测试并确认通过**

Run: `pnpm exec tsx --test tests/project-card-link.test.ts`

Expected: 3 tests PASS。

### Task 2: 将轮播替换为语义化卡片网格

**Files:**

- Modify: `src/components/projects-section.tsx`
- Create: `src/components/projects-section.module.css`
- Modify: `src/index.css`
- Delete: `src/assets/styles/carousel.css`（仅在确认没有其他 `Carousel` 使用后）

- [ ] **Step 1: 更新组件导入与卡片渲染**

移除 `Button`、`Carousel`、`RightOutlined`，保留 Ant Design `Typography`。导入 `getProjectCardHref` 与 CSS Module。

对每个项目计算 `href`：

```typescript
const href = getProjectCardHref(project.link);
const cardContent = (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.imageWrapper}>
        <img alt={project.title} className={styles.image} src={project.image} />
      </div>
      <Title className={`${styles.title} theme-text-primary`} level={4}>
        {project.title}
      </Title>
    </div>
    <Paragraph className={`${styles.description} theme-text-secondary`}>
      {project.description}
    </Paragraph>
  </article>
);
```

有效链接使用完整锚点包装：

```typescript
return href ? (
  <a
    key={`${project.title}-${href}`}
    className={styles.cardLink}
    href={href}
    rel="noopener noreferrer"
    target="_blank"
  >
    {cardContent}
  </a>
) : (
  <div key={`${project.title}-${project.image}`} className={styles.staticCard}>
    {cardContent}
  </div>
);
```

- [ ] **Step 2: 实现响应式等高网格**

在 `projects-section.module.css` 中建立：

```css
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

卡片使用 `height: 100%` 和纵向 Flex；上栏使用横向 Flex，图片固定尺寸，描述占据下栏。所有颜色来自 `var(--color-*)`。

- [ ] **Step 3: 实现 Hover、Focus 与 Active 状态**

为 `.cardLink` 增加带 `-webkit-` 前缀的 transform 和 transition：

```css
.cardLink:hover {
  -webkit-transform: translateY(-4px);
  transform: translateY(-4px);
}

.cardLink:hover .card,
.cardLink:focus-visible .card {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-surface);
}

.cardLink:hover .image {
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}
```

焦点环放在完整锚点上。静态卡片保留纯视觉 Hover 浮动与图片缩放，但不增加指针光标、焦点或点击行为。

- [ ] **Step 4: 清理轮播全局样式**

运行 `rg -n "Carousel|ant-carousel|carousel.css" src`。确认没有其他组件使用后，移除 `src/index.css` 中的轮播样式导入和残留规则，删除 `src/assets/styles/carousel.css`。

- [ ] **Step 5: 格式化本次文件**

Run:

```bash
pnpm exec prettier --write src/components/project-card-link.ts src/components/projects-section.tsx src/components/projects-section.module.css src/index.css tests/project-card-link.test.ts
```

Expected: 命令成功，文件符合项目格式。

### Task 3: 自动检查与浏览器验收

**Files:**

- Verify: `src/components/projects-section.tsx`
- Verify: `src/components/projects-section.module.css`
- Verify: `src/components/project-card-link.ts`
- Verify: `tests/project-card-link.test.ts`

- [ ] **Step 1: 运行全部测试**

Run: `pnpm test`

Expected: 全部测试通过，无失败。

- [ ] **Step 2: 运行类型、Lint、格式与构建检查**

Run:

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
```

Expected: 每条命令退出码均为 0。

- [ ] **Step 3: 验证桌面端**

打开 `http://localhost:3000/resume-site/`：

- 项目区在默认桌面视口显示三列。
- 卡片上栏左图右标题，下栏为描述。
- 有效链接卡片 Hover 上浮，图片轻微缩放。
- Tab 可聚焦有效链接卡片，锚点包含 `_blank` 和安全 `rel`。
- 暗色主题下文字、边框和阴影清晰。

- [ ] **Step 4: 验证响应式**

使用 768px 视口确认两列；使用 390x844 视口确认单列、无横向滚动、长文本正常换行。

- [ ] **Step 5: 检查控制台与最终差异**

检查浏览器控制台无新增错误。运行：

```bash
git diff --check
git status --short
git diff -- src/components src/index.css tests/project-card-link.test.ts docs/superpowers
```

确认只包含本次项目集卡片改造与文档，不覆盖用户已有改动。
