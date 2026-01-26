# React 开发工具配置说明

## 可用的开发命令

本项目提供了多个开发命令来启用不同的开发工具：

### 基础开发模式
```bash
npm run dev
```
启动基础开发服务器，不启用任何特殊开发工具。

### React Scan
```bash
npm run dev:scan
```
启动带性能扫描功能的开发服务器，用于检测不必要的重渲染。

### React Grab
```bash
npm run dev:grab
```
启动带元素抓取功能的开发服务器，用于定位和检查页面元素。

### 同时启用两个工具
```bash
npm run dev:both
```
同时启用 React Scan 和 React Grab 功能。

## React Scan 配置说明

### 什么是 React Scan？

React Scan 是一个用于检测 React 应用中不必要的重新渲染的工具。它可以：
- 高亮显示需要优化的组件
- 检测不必要的重渲染
- 提供性能优化建议

### 配置

React Scan 已经配置为可选启用，位于 `src/main.tsx` 文件中：

```typescript
// Only import and enable react-scan when SCAN_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_SCAN_ENABLED === 'true') {
  import('react-scan').then(({ scan }) => {
    scan();
  });
}
```

### 使用方法

1. 启动带扫描功能的开发服务器：`npm run dev:scan`
2. 打开浏览器开发者工具
3. 访问应用页面
4. 查看控制台中的 React Scan 输出
5. React Scan 会高亮显示可能存在性能问题的组件

### 注意事项

- React Scan 只在开发环境中启用
- React Scan 只在设置了 VITE_SCAN_ENABLED=true 环境变量时启用
- 不会影响生产环境的构建大小或性能
- 在浏览器控制台中查看性能分析结果
- 遵循控制台中的优化建议来改进组件性能

### 性能优化技巧

当 React Scan 检测到不必要的重渲染时，可以考虑以下优化策略：
- 使用 React.memo() 包装组件
- 使用 useMemo() 和 useCallback() 优化计算和回调
- 检查组件的 props 是否发生了不必要的变化
- 合理拆分大型组件

## React Grab 配置说明

### 什么是 React Grab？

React Grab 是一个开发工具，它允许您：
- 通过环境变量动态加载脚本以增强页面元素的可选择性
- 在开发过程中更容易地定位和检查页面元素
- 提供额外的页面元素抓取功能

### 配置

React Grab 已经配置为仅在开发环境中通过环境变量启用，位于 `src/main.tsx` 文件中：

```typescript
// Conditionally load react-grab when in development and GRAB_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_GRAB_ENABLED === 'true') {
  const script = document.createElement('script');
  script.src = '//unpkg.com/react-grab/dist/index.global.js';
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-enabled', 'true');
  document.head.appendChild(script);
}
```

### 使用方法

1. 启动带grab功能的开发服务器：`npm run dev:grab`
2. 在浏览器中打开应用
3. 页面将加载react-grab脚本，提供额外的元素选择功能
4. 您可以使用react-grab提供的功能来定位和检查页面元素

### 同时使用两个工具

如果需要同时使用 React Scan 和 React Grab，可以运行：
```bash
npm run dev:both
```

### 注意事项

- React Grab 只在开发环境中启用
- 仅当设置了 VITE_GRAB_ENABLED=true 环境变量时才会加载脚本
- 不会影响生产环境的构建大小或性能
- 通过全局脚本方式加载