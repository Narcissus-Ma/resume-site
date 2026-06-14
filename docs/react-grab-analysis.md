# React Grab 脚本接入分析文档

## 一、概述

`loadReactGrabForDev()` 是一个用于在开发环境下动态加载 **React Grab** 工具的函数。React Grab 是一款专为 AI 编程助手设计的开发工具，它能够将浏览器中选中的 UI 元素与其对应的 React 组件源代码位置关联起来，极大提升 AI 辅助编程的效率。

---

## 二、当前项目接入方式

### 2.1 代码位置

```typescript
// /Users/mapengfei/narcissus-blog-cf/cf-blog-client/src/main.tsx
function loadReactGrabForDev(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  const scriptId = 'react-grab-runtime';
  if (document.getElementById(scriptId)) {
    return;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.src = '//unpkg.com/react-grab/dist/index.global.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

loadReactGrabForDev();
```

### 2.2 实现机制解析

| 步骤 | 实现逻辑 | 技术要点 |
| --- | --- | --- |
| **环境检测** | `import.meta.env.DEV` | 仅在开发模式下加载，避免生产环境引入 |
| **全局对象检测** | `typeof window === 'undefined'` | 防止 SSR 环境下执行 DOM 操作 |
| **重复注入检测** | `document.getElementById(scriptId)` | 通过唯一 ID 避免重复加载脚本 |
| **动态脚本创建** | `document.createElement('script')` | 创建 `<script>` DOM 元素 |
| **CDN 资源加载** | `src = '//unpkg.com/react-grab/dist/index.global.js'` | 使用 unpkg CDN 加载 UMD 格式的全局脚本 |
| **跨域配置** | `crossOrigin = 'anonymous'` | 设置匿名跨域，确保资源正确加载 |

---

## 三、React Grab 工作原理

### 3.1 核心能力

React Grab 的核心价值在于**打通视觉层与代码层**，实现"所见即所得"的上下文获取：

1. **监听用户操作**：监听全局复制事件（`copy`）
2. **定位 DOM 元素**：通过鼠标位置或焦点获取目标元素
3. **解析 React 内部数据**：读取 DOM 元素上的 `__reactFiber$` 属性
4. **提取上下文信息**：从 Fiber 节点中获取组件名、文件路径、行号
5. **格式化输出**：生成结构化的上下文字符串并复制到剪贴板

### 3.2 工作流程图

```
用户悬停元素 → 按下 Cmd+C/Ctrl+C → 触发 copy 事件
                                         ↓
                          React Grab 脚本拦截事件
                                         ↓
                          获取当前 DOM 元素及其 React Fiber
                                         ↓
                          提取组件信息（名称、文件路径、行号）
                                         ↓
                          序列化 HTML 结构
                                         ↓
                          拼接格式化上下文字符串
                                         ↓
                          写入浏览器剪贴板
                                         ↓
                          用户粘贴到 AI 助手对话框
```

### 3.3 输出格式示例

当用户复制一个元素时，剪贴板内容格式如下：

```
<button className="btn-primary">Click me</button>
in SubmitButton at src/components/Button.tsx:15:3
```

---

## 四、接入方式对比

当前项目采用的是 **UMD 全局脚本注入**方式，官方还提供了其他接入方式：

| 接入方式 | 适用场景 | 代码示例 |
| --- | --- | --- |
| **当前方式** | Vite + React（无需安装依赖） | 动态创建 `<script>` 标签 |
| **动态 import** | Vite/Webpack（推荐） | `import("react-grab")` |
| **Next.js Script** | Next.js 框架 | `<Script src="..." strategy="beforeInteractive" />` |
| **CLI 初始化** | 新项目快速接入 | `npx grab@latest init` |

### 4.1 官方推荐的 Vite 接入方式

```typescript
// 推荐：使用动态 import
if (import.meta.env.DEV) {
  import('react-grab');
}
```

### 4.2 当前实现的优缺点分析

**优点：**

- ✅ 无需安装 npm 依赖，减少打包体积
- ✅ 通过 CDN 自动获取最新版本
- ✅ 简单直接，无需配置构建工具

**缺点：**

- ❌ 无法控制版本，可能引入不兼容更新
- ❌ CDN 依赖外部服务，离线开发时不可用
- ❌ 全局脚本方式不如 ESM 模块优雅

---

## 五、安全与隐私考量

根据 React Grab 官方隐私政策：

| 隐私特性     | 说明                                   |
| ------------ | -------------------------------------- |
| **数据收集** | 不收集任何个人数据                     |
| **数据传输** | 所有处理在本地完成，不发送到外部服务器 |
| **浏览历史** | 不追踪用户浏览历史                     |
| **存储权限** | 仅使用浏览器本地存储保存偏好设置       |

> **注意**：由于 React Grab 会解析 React 组件的源码位置信息，建议只在信任的开发环境中使用，避免在生产环境意外暴露源码路径。

---

## 六、使用方法

### 6.1 基本使用流程

1. **启动开发服务器**：确保项目处于开发模式运行
2. **悬停目标元素**：将鼠标移动到想要分析的 UI 元素上
3. **触发复制**：按下 `Cmd+C`（Mac）或 `Ctrl+C`（Windows/Linux）
4. **粘贴到 AI 助手**：在 Cursor、Claude Code、Copilot 等工具中粘贴
5. **AI 精准响应**：AI 将获得组件的完整上下文信息

### 6.2 快捷键说明

| 快捷键     | 功能           | 支持平台      |
| ---------- | -------------- | ------------- |
| `Cmd + C`  | 复制元素上下文 | macOS         |
| `Ctrl + C` | 复制元素上下文 | Windows/Linux |

---

## 七、总结

当前项目通过 **动态脚本注入** 的方式接入 React Grab，是一种轻量、零配置的接入方案。该工具主要面向使用 AI 编程助手的 React 开发者，通过自动关联 DOM 元素与源代码位置，显著提升 AI 辅助编程的效率和准确性。

**核心价值**：

- 减少手动查找组件的时间
- 为 AI 提供精确的上下文信息
- 支持多种 AI 编程助手（Cursor、Claude Code、Copilot 等）
- 仅在开发环境生效，不影响生产构建
