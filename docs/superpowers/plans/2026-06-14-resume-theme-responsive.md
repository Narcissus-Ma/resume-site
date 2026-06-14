# Resume Theme And Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一首页与简历详情页的亮暗主题，修复夜间文字对比度和 390px 移动端横向溢出，同时保留现有页面结构。

**Architecture:** 在应用顶层建立 Theme Provider，统一管理系统主题、用户偏好、DOM 主题属性和 Ant Design 主题算法。组件通过共享 Hook 获取主题，只使用语义化 CSS 变量表达颜色；首页 Header 单独处理移动端导航，打印样式强制回到浅色。

**Tech Stack:** React 18、TypeScript、Ant Design 5、Tailwind CSS 3、CSS Custom Properties、Vite

---

### Task 1: 建立共享主题基础设施

**Files:**
- Create: `src/theme/theme-context.tsx`
- Modify: `src/hooks/use-theme.ts`
- Modify: `src/app.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: 定义主题接口与持久化规则**

在 `theme-context.tsx` 中定义 `ThemeMode = 'light' | 'dark'`、Provider 状态、主题切换方法和 `localStorage` 键。初始化时优先读取用户保存值，否则读取 `prefers-color-scheme`。

- [ ] **Step 2: 同步 DOM 与系统主题变化**

将当前主题写入 `document.documentElement.dataset.theme` 和 `colorScheme`。仅当用户没有保存主题时监听系统变化，并在 Provider 卸载时移除监听器。

- [ ] **Step 3: 配置 Ant Design 主题**

在 Provider 内包裹 `ConfigProvider`，暗色使用 `theme.darkAlgorithm`，亮色使用 `theme.defaultAlgorithm`，映射主色、页面背景、卡片背景、文字、边框、圆角和焦点色。

- [ ] **Step 4: 保持旧 Hook 调用兼容**

让 `use-theme.ts` 转发 Theme Context，继续返回 `darkMode`、`setDarkMode`，并增加 `themeMode`、`toggleTheme`，避免一次性破坏现有调用方。

- [ ] **Step 5: 在应用顶层启用 Provider**

用 Theme Provider 包裹 `RouterProvider`，确保首页、详情页、弹窗和管理页面都能获得 Ant Design 主题。

- [ ] **Step 6: 增加全局语义颜色**

在 `index.css` 定义亮色与暗色变量、基础 body 样式、通用表面/文字/边框类、焦点样式和 `prefers-reduced-motion` 规则。

- [ ] **Step 7: 验证基础设施**

Run: `pnpm typecheck`

Expected: 命令退出码为 0，无 TypeScript 错误。

### Task 2: 修复首页导航和首屏

**Files:**
- Modify: `src/pages/home/home.tsx`
- Modify: `src/hooks/use-home.ts`
- Modify: `src/components/header.tsx`
- Modify: `src/components/home-section.tsx`
- Modify: `src/components/language-selector.tsx`

- [ ] **Step 1: 首页改用共享主题**

从 `useHome` 返回共享的 `toggleTheme`，移除重复的布尔翻转逻辑；首页根元素使用语义背景和文字类。

- [ ] **Step 2: 重构桌面与移动导航**

桌面端保留 Anchor。小于 `md` 时隐藏 Anchor，增加有可访问名称的菜单按钮和紧凑下拉导航；语言与主题按钮保持可用。

- [ ] **Step 3: 修复 Header 主题颜色**

Header 使用表面背景、边框和主文字变量，确保 Anchor、Select、图标按钮在暗色主题可见，并为主题按钮增加动态 `aria-label`。

- [ ] **Step 4: 收敛首屏高度与层级**

首屏使用适合视口的最小高度和响应式间距；移动端单列展示，桌面端保留头像。姓名、职位、简介全部使用语义文字颜色。

- [ ] **Step 5: 修复可访问性**

为社交链接增加 `aria-label`，为装饰图片保留正确替代文本，减少动画偏好下关闭滚动提示动画。

- [ ] **Step 6: 浏览器检查**

在桌面端和 390x844 视口检查：

- 导航无黑字落在暗色背景上。
- 390px 页面 `scrollWidth === clientWidth`。
- 首屏主要信息在首个视口内可见。

### Task 3: 统一首页内容区块

**Files:**
- Modify: `src/components/skills-section.tsx`
- Modify: `src/components/about-section.tsx`
- Modify: `src/components/projects-section.tsx`
- Modify: `src/components/contact-section.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/assets/styles/carousel.css`

- [ ] **Step 1: 迁移区块背景和标题**

将深浅条件类替换为页面、交替区块、主文字和次文字语义类。

- [ ] **Step 2: 迁移卡片和进度条**

Card 使用统一表面、边框和阴影；Progress 百分比、轨道、标题和描述交给 Ant Design 主题与语义类控制。

- [ ] **Step 3: 修复 Timeline 与项目轮播**

确保 Timeline 正文、年份、连接线以及 Carousel 标题、正文、箭头、圆点在暗色主题可读；项目布局在移动端改为纵向。

- [ ] **Step 4: 修复联系区与 Footer**

联系卡片、次要按钮、社交图标和页脚文字使用统一主题颜色，避免暗色模式中低对比灰字。

- [ ] **Step 5: 浏览器检查**

分别查看五个锚点区块的亮色与暗色状态，确认标题、正文、卡片、百分比和按钮均清晰可见。

### Task 4: 统一简历详情页

**Files:**
- Modify: `src/pages/resume/resume.tsx`
- Modify: `src/components/resume-header.tsx`
- Modify: `src/components/about.tsx`
- Modify: `src/components/skill-description.tsx`
- Modify: `src/components/skills.tsx`
- Modify: `src/components/experience.tsx`
- Modify: `src/components/pdf-modal.tsx`

- [ ] **Step 1: 增加详情页主题控制**

详情页读取共享主题；Header 增加主题按钮，并让标题、首页链接、导出和打印操作在小屏幕自动换行。

- [ ] **Step 2: 迁移详情页表面和文字**

页面、个人信息、技能描述、技能标签、项目、经历、教育和网站链接全部改用语义背景、文字、边框和强调色。

- [ ] **Step 3: 修复弹窗主题**

Modal 容器、标签、输入框、开关、取消与提交按钮支持两种主题，并保持明确焦点状态。

- [ ] **Step 4: 移动端检查**

在 390x844 视口检查 Header 按钮换行、联系方式换行、卡片内长文本和网站链接，确保无横向溢出。

### Task 5: 打印与质量验证

**Files:**
- Modify: `src/index.css`
- Modify as needed: 本计划涉及的组件文件

- [ ] **Step 1: 完善打印规则**

打印时强制白底深色文字，移除阴影，隐藏导航和交互按钮，保持简历内容与页边距清晰。

- [ ] **Step 2: 执行静态检查**

Run: `pnpm typecheck`

Expected: PASS。

Run: `pnpm lint`

Expected: PASS，无 warning。

Run: `pnpm format:check`

Expected: PASS。

Run: `pnpm build`

Expected: PASS，生成 `dist`。

- [ ] **Step 3: 执行最终浏览器回归**

检查桌面和 390px 下的首页、详情页亮暗主题，验证主题刷新保持、系统主题默认行为、移动端无横向滚动，以及打印预览使用浅色。

- [ ] **Step 4: 检查最终差异**

Run: `git diff --check`

Expected: 无空白错误。

