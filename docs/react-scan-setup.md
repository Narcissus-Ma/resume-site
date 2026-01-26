# React Scan 配置说明

## 什么是 React Scan？

React Scan 是一个用于检测 React 应用中不必要的重新渲染的工具。它可以：
- 高亮显示需要优化的组件
- 检测不必要的重渲染
- 提供性能优化建议

## 安装

```bash
pnpm add -D react-scan cross-env
```

## 配置

React Scan 已经配置为可选启用，位于 `src/main.tsx` 文件中：

```typescript
// Only import and enable react-scan when SCAN_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_SCAN_ENABLED === 'true') {
  import('react-scan').then(({ scan }) => {
    scan();
  });
}
```

## 使用方法

1. 启动带扫描功能的开发服务器：`npm run dev:scan`
2. 打开浏览器开发者工具
3. 访问应用页面
4. 查看控制台中的 React Scan 输出
5. React Scan 会高亮显示可能存在性能问题的组件

## 普通开发模式

如果您不需要性能扫描功能，请使用普通命令启动：
```bash
npm run dev
```

## 注意事项

- React Scan 只在开发环境中启用
- React Scan 只在设置了 VITE_SCAN_ENABLED=true 环境变量时启用
- 不会影响生产环境的构建大小或性能
- 在浏览器控制台中查看性能分析结果
- 遵循控制台中的优化建议来改进组件性能

## 性能优化技巧

当 React Scan 检测到不必要的重渲染时，可以考虑以下优化策略：
- 使用 React.memo() 包装组件
- 使用 useMemo() 和 useCallback() 优化计算和回调
- 检查组件的 props 是否发生了不必要的变化
- 合理拆分大型组件