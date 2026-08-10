# API 基础地址集中配置设计

## 背景

当前 `admin-auth-api.ts`、`home-api.ts`、`public-catalog-api.ts` 和 `resume-api.ts` 分别读取 `VITE_RESUME_API_BASE_URL`，并各自声明相同的 `http://localhost:8787` 默认值。修改默认开发服务器地址时需要同步修改多个文件，容易遗漏或产生不一致。

## 目标

- 将 API 基础地址的环境变量读取和默认值集中到一个模块。
- 保持现有 `VITE_RESUME_API_BASE_URL`、`.env.local` 和 `.env.production` 的使用方式不变。
- 保持各 API 工厂函数的 `baseUrl` 注入能力不变，避免影响现有单元测试和调用方。

## 方案

在 `src/config/app-config.ts` 中导出应用配置：

- `apiBaseUrl` 读取 `import.meta.env.VITE_RESUME_API_BASE_URL`。
- 环境变量未配置时，继续使用 `http://localhost:8787`。
- 对配置对象使用明确的 TypeScript 接口，集中描述可供应用使用的运行时配置。

4 个 API 服务文件仅在创建默认实例时引用集中配置。`createAdminAuthApi`、`createHomeApi`、`createPublicCatalogApi` 和 `createResumeApi` 仍由调用方显式传入 `baseUrl`，因此服务本身不依赖 Vite 环境变量，测试也可继续注入任意地址。

开发者需要临时切换服务器时，在项目根目录创建或修改 `.env.local`：

```env
VITE_RESUME_API_BASE_URL=http://localhost:9000
```

修改后重启 Vite 开发服务器即可生效。团队默认值只在确有需要时修改集中配置模块。

## 数据流

```text
.env.local / .env.production
            ↓
import.meta.env.VITE_RESUME_API_BASE_URL
            ↓
src/config/app-config.ts
            ↓
各 API 默认实例
```

## 错误与兼容性

- 不改变 URL 尾部斜杠处理；现有 API 客户端继续负责规范化地址。
- 不新增运行时校验或额外配置项，避免扩大本次重构范围。
- 不提交开发者个人的 `.env.local`。
- `.env.example` 保持为环境变量配置示例。

## 测试与验收

- 先增加配置模块测试，验证环境变量缺失时返回当前默认地址，并验证配置值可被服务默认实例统一引用。
- 执行现有 API 单元测试，确认工厂函数的依赖注入行为未改变。
- 执行完整测试、TypeScript 类型检查、ESLint、Prettier 检查和生产构建。
- 使用全文搜索确认 `VITE_RESUME_API_BASE_URL` 的运行时代码读取只保留在集中配置模块中。

