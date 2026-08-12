# Personal Resume UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变任何现有前端数据来源、数据映射、路由、链接语义或 API 契约的前提下，重构主页与简历详情页的品牌化视觉、响应式布局和 A4 打印呈现。

**Architecture:** 保持 `useHome`、`useResume`、服务层、数据类型和管理页面完全不变。通过 `src/index.css` 的语义设计 token、主页展示组件各自的 CSS Modules，以及简历展示组件共享的文档样式模块替换散落的固定色值与模板化排版；组件仍接收原有 props 并按原有条件渲染。打印规则只作用于现有简历展示 DOM 和操作控件的可见性。

**Tech Stack:** React 18、TypeScript、Vite、Ant Design 5、Tailwind CSS（仅保留必要布局工具）、CSS Modules、i18next、Node 内置测试运行器、Playwright CLI（人工视觉验证）。

**硬边界：** 不修改 `cloudflare/`、`src/services/`、`src/hooks/use-home.ts`、`src/hooks/use-resume.ts`、`src/hooks/use-translated-data.ts`、`src/types/`、`src/data/`、路由定义、管理页逻辑、任何请求路径/方法/载荷，且不修改既有头像、链接、空数据或回退行为。

**执行起点：** 开始实施前运行并记录 `BASE_SHA=$(git rev-parse HEAD)`；Task 6 将以此提交为比较基线。

---

## 文件结构与职责

| 文件 | 改动 | 职责 |
| --- | --- | --- |
| `src/index.css` | 修改 | 全局设计 token、Ant Design 主题覆盖、焦点/动效规则、打印基线。 |
| `src/components/header.tsx` / `header.module.css` | 修改/新建 | 主页导航视觉与移动端工具栏布局；不改导航项和链接。 |
| `src/components/home-section.tsx` / `home-section.module.css` | 修改/新建 | 首页品牌首屏与既有头像位的视觉层级。 |
| `src/components/skills-section.tsx` / `skills-section.module.css` | 修改/新建 | 能力摘要的非模板化排版与 token 化进度条。 |
| `src/components/about-section.tsx` / `about-section.module.css` | 修改/新建 | 关于/经历区的图文节奏与时间线视觉。 |
| `src/components/projects-section.tsx` / `projects-section.module.css` | 修改 | 项目案例区的版式与既有卡片视觉。 |
| `src/components/contact-section.tsx` / `contact-section.module.css` | 修改/新建 | 联系区的信息分组与动作区视觉。 |
| `src/components/footer.tsx` / `footer.module.css` | 修改/新建 | 主页收束区的品牌化但克制的页脚。 |
| `src/pages/home/home.tsx` / `home.module.css` | 修改/新建 | 主页容器与区块间节奏；不动 hook 返回值。 |
| `src/components/resume-header.tsx` / `resume-header.module.css` | 修改/新建 | 屏幕端简历操作栏与打印隐藏标记。 |
| `src/pages/resume/resume.tsx` / `resume.module.css` | 修改/新建 | 简历 A4 文档容器与操作区；不动 `useResume`。 |
| `src/components/about.tsx`、`skill-description.tsx`、`skills.tsx`、`experience.tsx` / `resume-document.module.css` | 修改/新建 | 共用的专业简历段落、条目与分页样式；不改变 props/字段。 |
| `src/components/pdf-modal.tsx` | 修改 | 仅增加稳定的语义 className，供视觉和打印选择器定位；表单状态和 Token 验证完全不动。 |
| `tests/print-styles.test.ts` | 新建 | 断言打印样式的 A4、控件隐藏、分页规则和溢出防护存在。 |
| `tests/resume-visual-contract.test.ts` | 新建 | SSR 断言简历仍渲染原 props 数据、保留项目描述纯文本换行及文档语义 class。 |
| `tests/home-visual-contract.test.ts` | 新建 | SSR/源码契约断言主页展示组件仍使用原 props，并为响应式视觉选择器提供稳定钩子。 |

## Task 1: 锁定纯 UI 范围与视觉回归契约

**Files:**
- Create: `tests/print-styles.test.ts`
- Create: `tests/resume-visual-contract.test.ts`
- Create: `tests/home-visual-contract.test.ts`
- Test: `tests/project-card-link.test.ts`, `tests/experience.test.ts`

- [ ] **Step 1: 写失败的打印样式契约测试**

  读取 `src/index.css` 与 `src/components/pdf-modal.tsx`，断言 `@page` 显式声明 `size: A4` 与固定边距，`@media print` 仅以 `.resume-page .print-hidden` 和该简历实例专用的 `.resume-pdf-modal-portal` 隐藏操作/portal，不使用全局 `.print-hidden`、`.modal-overlay` 或 `header` 选择器；断言 `html`/`body` 使用 `overflow-x: clip`，简历段落类包含 `break-inside: avoid`。

- [ ] **Step 2: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/print-styles.test.ts`

  Expected: FAIL，提示缺少 A4、`.print-hidden`、`overflow-x: clip` 或分页规则。

- [ ] **Step 3: 写失败的展示数据契约测试**

  使用 `renderToStaticMarkup` 渲染 `About`、`SkillDescription`、`Skills`、`Experience`，传入包含中英文长文本和换行描述的既有 props；断言原内容仍出现在标记中、项目描述仍被 HTML 转义且含 `whitespace-pre-line`，并断言新文档 class 存在。同时固定既有行为：`About` 的 `userInfo` 空值回退、`Experience` 网站的 `target`/`rel`/`href`、空数组不新增空态。为 `HomeSection` 建立同样的 props 使用契约（在 router/i18n provider 中渲染），仅检查职业与简介仍出现，不检查或更改其来源。

- [ ] **Step 4: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/resume-visual-contract.test.ts tests/home-visual-contract.test.ts`

  Expected: FAIL，提示尚未提供稳定的视觉 class 或测试 fixture。

- [ ] **Step 5: 执行既有非 UI 契约测试**

  Run: `pnpm test -- tests/project-card-link.test.ts tests/experience.test.ts`

  Expected: PASS；记录其输出，后续任何展示层改动均不得改变这两份已有行为契约。

- [ ] **Step 6: 提交测试骨架**

  ```bash
  git add tests/print-styles.test.ts tests/resume-visual-contract.test.ts tests/home-visual-contract.test.ts
  git commit -m "test: add UI refactor contracts"
  ```

## Task 2: 建立语义 token、全局交互基线与 A4 打印规则

**Files:**
- Modify: `src/index.css:1-310`
- Test: `tests/print-styles.test.ts`

- [ ] **Step 1: 保持 Task 1 的打印测试为失败状态并补充 token 断言**

  在 `tests/print-styles.test.ts` 增加断言：亮暗主题均定义相同的品牌、文本、表面、边框、焦点与间距 token；禁止新增 `transition: all`。

- [ ] **Step 2: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/print-styles.test.ts`

  Expected: FAIL，旧样式没有完整 token、A4 或选择器。

- [ ] **Step 3: 在全局样式实施最小 token 层**

  在 `:root` 与 `:root[data-theme='dark']` 添加语义变量（品牌强调色、强调色文字、弱强调色、纸张、文档文字、规则、阴影、4px 间距刻度、页边距），保留既有变量名作为兼容别名。将本次会触及的蓝/绿/紫/橙色和透明背景迁入变量；组件只引用 `var(--...)`。

- [ ] **Step 4: 实施交互与响应式基线**

  将 `html, body` 的横向裁切统一为 `overflow-x: clip`；定义即时可见的 `:focus-visible` 轮廓、明确属性的过渡（仅 `color`、`background-color`、`border-color`、`box-shadow` 或 `transform`）、禁用态三通道反馈和 `prefers-reduced-motion` 降级。移除全局 `transition: all`，不改变任何点击/表单逻辑或现有 DOM 交互语义。

- [ ] **Step 5: 实施打印基线**

  在 `@media print` 中声明 A4 和页边距；仅以 `.resume-page .print-hidden` 隐藏其内部操作控件，并以 `.resume-pdf-modal-portal` 隐藏 React Modal 挂在 `body` 下的该实例 portal；清空 `.resume-page` 内的页面色彩、阴影和不必要边框；为 `.resume-document__section`、`.resume-document__entry`、标题建立分页避免与长文本自然分页规则。不得对 `header`、`main`、`button`、`.print-hidden` 或 `.modal-overlay` 使用会影响管理页或 404 的泛化选择器。

- [ ] **Step 6: 运行测试确认通过**

  Run: `pnpm exec tsx --test tests/print-styles.test.ts`

  Expected: PASS。

- [ ] **Step 7: 提交 token 与打印基线**

  ```bash
  git add src/index.css tests/print-styles.test.ts
  git commit -m "feat: add resume visual tokens and print baseline"
  ```

## Task 3: 重构主页整体节奏、导航与品牌首屏

**Files:**
- Modify: `src/pages/home/home.tsx:19-63`
- Create: `src/pages/home/home.module.css`
- Modify: `src/components/header.tsx:13-89`
- Create: `src/components/header.module.css`
- Modify: `src/components/home-section.tsx:26-99`
- Create: `src/components/home-section.module.css`
- Test: `tests/home-visual-contract.test.ts`

- [ ] **Step 1: 扩充失败的主页展示契约**

  断言首页容器、首屏、导航工具栏具备稳定的 CSS Module class；断言 `occupation`、`description`、既有猫形头像资源的 `src`/`alt`、既有社交锚点的 `href`、既有导航 hash 和 `/resume` 目标均仍被传递/渲染。为 `ProjectsSection` 追加既有行为 fixture：`projects` 为 `undefined` 时仍出现原三条 fallback；`#`、空字符串和危险链接仍由 `getProjectCardHref` 生成静态卡。不要断言具体硬编码职业文案或新增数据字段。

- [ ] **Step 2: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/home-visual-contract.test.ts`

  Expected: FAIL，旧组件缺少约定 class。

- [ ] **Step 3: 实施主页容器与导航视觉**

  为 `Home`、`Header` 添加 CSS Module class，改成紧凑的品牌工具栏：桌面端导航在左、语言与主题/管理控件在右；移动端保持当前 Dropdown、导航数据和触发方式不变。仅重排和着色，不能改 navigationItems、`getCurrentAnchor`、路由或 AdminEntryLink。

- [ ] **Step 4: 实施非居中模板化首屏**

  为 `HomeSection` 创建“文案左、头像位右、社交轨道作为辅助”的网格布局；保留 `occupation`、`description`、猫图、社交锚点和 `/resume` 链接的当前来源/语义。使用 token 绘制克制的单色背景层和头像框，首屏在 1280×800 可同时看见标题、简介与简历入口；窄屏按文案优先单列堆叠，头像仍遵循既有 `md` 可见规则。

- [ ] **Step 5: 运行主页契约测试确认通过**

  Run: `pnpm exec tsx --test tests/home-visual-contract.test.ts`

  Expected: PASS。

- [ ] **Step 6: 提交主页壳层**

  ```bash
  git add src/pages/home/home.tsx src/pages/home/home.module.css src/components/header.tsx src/components/header.module.css src/components/home-section.tsx src/components/home-section.module.css tests/home-visual-contract.test.ts
  git commit -m "feat: redesign personal resume home shell"
  ```

## Task 4: 重构主页信息区的阅读节奏

**Files:**
- Modify: `src/components/skills-section.tsx:25-103`
- Create: `src/components/skills-section.module.css`
- Modify: `src/components/about-section.tsx:17-123`
- Create: `src/components/about-section.module.css`
- Modify: `src/components/projects-section.tsx:17-99`
- Modify: `src/components/projects-section.module.css:1-122`
- Modify: `src/components/contact-section.tsx:21-123`
- Create: `src/components/contact-section.module.css`
- Modify: `src/components/footer.tsx:15-48`
- Create: `src/components/footer.module.css`
- Test: `tests/home-visual-contract.test.ts`

- [ ] **Step 1: 添加失败的内容保留测试 fixture**

  向主页视觉契约传入技能、亮点、经历与项目样本，断言每个样本的名称/描述仍在 SSR 标记中；确保卡片链接仍通过现有 `getProjectCardHref`，不改变 `#` 与危险 URL 的既有处理。

- [ ] **Step 2: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/home-visual-contract.test.ts tests/project-card-link.test.ts`

  Expected: 视觉契约 FAIL；既有链接测试 PASS。

- [ ] **Step 3: 实施技能摘要视觉**

  保留 `skills`、`highlights`、`sectionDescription`、Ant `Progress` 和图标映射。将固定图标色和渐变 stroke 替换为语义 token；把“两个卡片阵列 + 三张图标卡”改为有主次的能力清单和轻量亮点栅格。移除 `min-h-screen`、`transition-all` 与多重 hover 效果；标题容器在移动端自然换行。

- [ ] **Step 4: 实施关于与经历视觉**

  保留 about 图片、i18n 内容、现有 timeline 数据与硬编码教育内容。把装饰圆形改为 token 化低对比背景层，图片采用稳定比例容器；经历卡改为带清晰日期/职位层级的时间线表面。不要更改图片 alt、教育数据或 Timeline items 来源。

- [ ] **Step 5: 实施项目、联系与页脚视觉**

  保持项目 fallback、链接判定、联系文本与社交锚点完全不变。项目卡在桌面使用不等权的阅读密度而不做嵌套卡片；联系区从大面积满屏卡片收束为信息/操作两区；页脚改为一段品牌收束和既有社交入口。所有颜色、边框和 hover 只用 token，响应式网格使用 `minmax(0, 1fr)`。

- [ ] **Step 6: 运行主页和既有链接测试确认通过**

  Run: `pnpm exec tsx --test tests/home-visual-contract.test.ts tests/project-card-link.test.ts`

  Expected: PASS。

- [ ] **Step 7: 提交主页信息区**

  ```bash
  git add src/components/skills-section.tsx src/components/skills-section.module.css src/components/about-section.tsx src/components/about-section.module.css src/components/projects-section.tsx src/components/projects-section.module.css src/components/contact-section.tsx src/components/contact-section.module.css src/components/footer.tsx src/components/footer.module.css tests/home-visual-contract.test.ts
  git commit -m "feat: refine homepage information hierarchy"
  ```

## Task 5: 构建专业简历文档屏幕版与共享段落样式

**Files:**
- Modify: `src/pages/resume/resume.tsx:15-60`
- Create: `src/pages/resume/resume.module.css`
- Modify: `src/components/resume-header.tsx:15-69`
- Create: `src/components/resume-header.module.css`
- Modify: `src/components/about.tsx:19-36`
- Modify: `src/components/skill-description.tsx:12-27`
- Modify: `src/components/skills.tsx:13-35`
- Modify: `src/components/experience.tsx:17-90`
- Create: `src/components/resume-document.module.css`
- Modify: `src/components/pdf-modal.tsx:69-181`
- Test: `tests/resume-visual-contract.test.ts`, `tests/experience.test.ts`

- [ ] **Step 1: 扩充失败的简历视觉契约**

  断言现有 `ResumeData` 的 title、skills、projects、experience、education、website 仍被对应组件渲染；断言所有段落使用共享的 `resume-document` class，`Resume` 操作区和 `PDFModal` 有 `.print-hidden` 标记。不得修改测试输入结构。

- [ ] **Step 2: 运行测试确认失败**

  Run: `pnpm exec tsx --test tests/resume-visual-contract.test.ts tests/experience.test.ts`

  Expected: 视觉契约 FAIL；`experience.test.ts` 保持 PASS。

- [ ] **Step 3: 实施简历屏幕容器与操作栏**

  使用 `resume.module.css` 将现有 `#resume-content` 设为文档纸张式单栏容器，屏幕端保持适度表面和边框。在 Resume 根容器添加 `.resume-page`，并给编辑入口、主题开关、返回导航、导出/打印按钮与 PDF 模态框添加仅用于样式的 `.print-hidden`；不修改其 click handler、modal state、AdminEntryLink、DOM 交互语义或 `useResume`。

- [ ] **Step 4: 实施共享文档段落系统**

  在 `resume-document.module.css` 定义文档段、段标题、元信息行、职责列表、技能标签、网站入口与条目分隔。`About`、`SkillDescription`、`Skills`、`Experience` 只替换 class 和结构性容器，必须保留原 props、数组遍历、文本、`whitespace-pre-line`、`target`、`rel` 与 URL 值。

- [ ] **Step 5: 调整简历头部和 PDF 模态框外观**

  将简历 header 改为专业的紧凑工具栏，使用 token 和明确的 hover/focus/active 样式；PDFModal 仅增加局部 className、`portalClassName="resume-pdf-modal-portal"` 和表单视觉选择器，保持状态、Token 验证、默认值和提交回调逐字行为一致。输入在 default/hover/focus/error/disabled 之间保持 1px 边框，焦点使用 outline，按钮/输入高度统一不低于 44px。

- [ ] **Step 6: 运行简历契约测试确认通过**

  Run: `pnpm exec tsx --test tests/resume-visual-contract.test.ts tests/experience.test.ts`

  Expected: PASS。

- [ ] **Step 7: 提交简历屏幕版**

  ```bash
  git add src/pages/resume/resume.tsx src/pages/resume/resume.module.css src/components/resume-header.tsx src/components/resume-header.module.css src/components/about.tsx src/components/skill-description.tsx src/components/skills.tsx src/components/experience.tsx src/components/resume-document.module.css src/components/pdf-modal.tsx tests/resume-visual-contract.test.ts
  git commit -m "feat: create professional resume document layout"
  ```

## Task 6: 验证跨视口、主题、打印与数据边界

**Files:**
- Modify: 仅修复 Tasks 2–5 中的前端展示层文件。
- Test: `tests/print-styles.test.ts`, `tests/home-visual-contract.test.ts`, `tests/resume-visual-contract.test.ts`, `tests/*.test.ts`, `tests/*.test.mjs`

- [ ] **Step 1: 运行完整自动验证**

  Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm format:check && pnpm build`

  Expected: 每条命令退出码为 0；若失败，先修复相应的展示层代码或测试，不触碰 hooks/services/data/cloudflare。

- [ ] **Step 2: 运行本地站点并完成公开路由视觉矩阵**

  Run: `pnpm dev`

  Expected: Vite 输出一个本地 URL。使用 Playwright CLI 按 `/`、`/resume` × zh-CN/en-US/ja-JP × light/dark 逐项检查：当前语言文本、主题切换和原有页面内容均正确显示。在主页额外于 320×720、375×812、414×896、768×900、1280×800 逐一检查无横向滚动、标题不溢出、主 CTA 可见、导航与语言/主题控件可用、原职业/项目/经历内容仍显示。

- [ ] **Step 3: 人工检查简历与打印预览**

  使用同一开发服务器打开 `/resume`，确认已有内容、编辑入口、PDF 模态框和打印按钮仍可操作。打开浏览器打印预览并检查 A4：导航/操作/模态框消失；无深色背景或阴影；中英文长标题、长项目描述自然换行；条目不被不必要地拆分，长条目可跨页。

- [ ] **Step 4: 核对保护路由与 404 未回归**

  使用 Playwright CLI 分别打开 `/home-manage`、`/resume-editor` 与一个不存在路径。Expected: 前两个路由仍保持当前未认证时的登录/守卫结果；不存在路径仍显示既有 404 页或既有回退结果。该步骤只验证路由表现，不能修改 guard、router 或认证状态。

- [ ] **Step 5: 核对数据与后端边界**

  Run: `git diff --name-only "$BASE_SHA"...HEAD && git diff --name-only "$BASE_SHA"`

  Expected: 合并两段输出后仅包含 `src/pages/`、`src/components/`、`src/index.css`、`tests/` 与本计划文档；不包含 `cloudflare/`、`src/services/`、`src/hooks/`、`src/types/`、`src/data/`、`src/router/`。同时运行 `pnpm test -- tests/api-client.test.ts tests/home-api.test.ts tests/resume-api.test.ts tests/default-api-config.test.ts tests/home-catalog.test.ts tests/resume-catalog.test.ts tests/admin-management-state.test.ts`，以确认 API、catalog 与管理状态既有行为未回归。

- [ ] **Step 6: 条件式提交最终视觉修复**

  ```bash
  git status --short
  # 仅在仍有 Task 6 产生的前端展示层改动时执行：
  git add src/index.css src/pages src/components tests
  git commit -m "fix: verify responsive printable resume UI"
  ```
