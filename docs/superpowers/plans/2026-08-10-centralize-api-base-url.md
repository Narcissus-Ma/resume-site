# API 基础地址集中配置实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Vite API 基础地址的读取和默认值集中到单一配置模块，同时保留各 API 工厂函数的显式地址注入能力。

**Architecture:** 新建 `src/config/app-config.ts`，用纯函数把 Vite 环境变量解析成只读应用配置，并导出当前运行环境的 `appConfig`。4 个 API 文件仅在构造默认实例时依赖 `appConfig.apiBaseUrl`；工厂函数仍接收 `baseUrl` 参数，因此业务 API 和既有测试不直接耦合 Vite。

**Tech Stack:** TypeScript 5、Vite 5、Node.js Test Runner、tsx、ESLint、Prettier

---

## 文件职责

- Create: `src/config/app-config.ts` — 唯一负责读取运行时环境变量、提供默认 API 地址并暴露类型化应用配置。
- Create: `tests/app-config.test.ts` — 验证默认地址和环境变量覆盖行为，不修改全局环境或依赖模块缓存。
- Create: `tests/default-api-config.test.ts` — 通过可观察的请求 URL 验证 4 个 API 默认实例均使用应用配置。
- Modify: `src/services/admin-auth-api.ts` — 默认管理员认证实例改用集中配置。
- Modify: `src/services/home-api.ts` — 默认主页管理实例改用集中配置。
- Modify: `src/services/public-catalog-api.ts` — 默认公开目录实例改用集中配置；公开 API 超时配置保持原逻辑。
- Modify: `src/services/resume-api.ts` — 默认简历管理实例改用集中配置。

### Task 1: 建立可测试的应用配置模块

**Files:**

- Create: `tests/app-config.test.ts`
- Create: `src/config/app-config.ts`

- [ ] **Step 1: 编写失败测试**

创建 `tests/app-config.test.ts`，通过纯函数输入模拟环境变量，避免直接修改 `import.meta.env`：

```typescript
import assert from 'node:assert/strict';
import test from 'node:test';

import { createAppConfig } from '../src/config/app-config.ts';

test('未配置 API 地址时使用本地 Worker 默认地址', () => {
  assert.equal(createAppConfig(undefined).apiBaseUrl, 'http://localhost:8787');
});

test('环境变量可以覆盖 API 默认地址', () => {
  const config = createAppConfig({
    VITE_RESUME_API_BASE_URL: 'http://localhost:9000',
  });

  assert.equal(config.apiBaseUrl, 'http://localhost:9000');
});
```

- [ ] **Step 2: 运行测试并确认失败原因**

Run: `pnpm exec tsx --test tests/app-config.test.ts`

Expected: FAIL，提示找不到 `src/config/app-config.ts`，失败原因是集中配置模块尚未实现。

- [ ] **Step 3: 编写最小实现**

创建 `src/config/app-config.ts`：

```typescript
interface AppRuntimeEnv {
  readonly VITE_RESUME_API_BASE_URL?: string;
}

export interface AppConfig {
  readonly apiBaseUrl: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8787';

export const createAppConfig = (env: AppRuntimeEnv | undefined): AppConfig => ({
  apiBaseUrl: env?.VITE_RESUME_API_BASE_URL ?? DEFAULT_API_BASE_URL,
});

export const appConfig = createAppConfig(import.meta.env);
```

- [ ] **Step 4: 运行配置测试并确认通过**

Run: `pnpm exec tsx --test tests/app-config.test.ts`

Expected: 2 tests PASS，无警告或错误。

- [ ] **Step 5: 运行类型检查**

Run: `pnpm typecheck`

Expected: PASS。

- [ ] **Step 6: 提交配置模块**

```bash
git add src/config/app-config.ts tests/app-config.test.ts
git commit -m "refactor: 集中管理 API 基础地址"
```

### Task 2: 让所有 API 默认实例使用集中配置

**Files:**

- Create: `tests/default-api-config.test.ts`
- Modify: `src/services/admin-auth-api.ts`
- Modify: `src/services/home-api.ts`
- Modify: `src/services/public-catalog-api.ts`
- Modify: `src/services/resume-api.ts`

- [ ] **Step 1: 为默认 API 实例编写行为基线测试**

创建 `tests/default-api-config.test.ts`。在导入服务模块之前临时替换全局 `fetch`，让各默认实例捕获测试 fetcher；随后调用 4 个默认实例，并使用 `appConfig.apiBaseUrl` 验证实际请求地址：

```typescript
import assert from 'node:assert/strict';
import test from 'node:test';

import { appConfig } from '../src/config/app-config.ts';

test('所有 API 默认实例统一使用应用配置的基础地址', async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls: string[] = [];
  globalThis.fetch = async (input) => {
    requestedUrls.push(String(input));
    return Response.json({});
  };

  try {
    const [{ adminAuthApi }, { homeApi }, { publicCatalogApi }, { resumeApi }] = await Promise.all([
      import('../src/services/admin-auth-api.ts'),
      import('../src/services/home-api.ts'),
      import('../src/services/public-catalog-api.ts'),
      import('../src/services/resume-api.ts'),
    ]);

    await adminAuthApi.login('管理员密码');
    await homeApi.getCatalog();
    await publicCatalogApi.getHome();
    await resumeApi.getCatalog();

    assert.deepEqual(requestedUrls, [
      `${appConfig.apiBaseUrl}/api/auth/login`,
      `${appConfig.apiBaseUrl}/api/home-catalog`,
      `${appConfig.apiBaseUrl}/api/public/home`,
      `${appConfig.apiBaseUrl}/api/resume-catalog`,
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: 运行默认实例与既有 API 测试建立重构基线**

Run: `pnpm exec tsx --test tests/default-api-config.test.ts tests/api-client.test.ts tests/admin-auth-api.test.ts tests/home-api.test.ts tests/public-catalog.test.ts tests/resume-api.test.ts`

Expected: 全部 PASS；默认实例行为测试证明 4 个服务当前请求相同的应用配置地址，既有测试证明 API 工厂函数的显式 `baseUrl` 注入与请求地址拼接工作正常。

- [ ] **Step 3: 替换管理员认证 API 的重复配置**

在 `src/services/admin-auth-api.ts` 引入集中配置：

```typescript
import { appConfig } from '@/config/app-config';
```

删除局部 `apiBaseUrl`，默认实例改为：

```typescript
export const adminAuthApi = createAdminAuthApi({ baseUrl: appConfig.apiBaseUrl });
```

- [ ] **Step 4: 替换主页管理 API 的重复配置**

在 `src/services/home-api.ts` 引入 `appConfig`，删除局部 `apiBaseUrl`，并将默认实例的配置改为：

```typescript
export const homeApi = createHomeApi({
  baseUrl: appConfig.apiBaseUrl,
  getToken: getBrowserAdminToken,
  onUnauthorized: invalidateBrowserAdminSession,
});
```

- [ ] **Step 5: 替换公开目录 API 的重复配置**

在 `src/services/public-catalog-api.ts` 引入 `appConfig`，删除局部 `apiBaseUrl`，并将默认实例的配置改为：

```typescript
export const publicCatalogApi = createPublicCatalogApi({
  baseUrl: appConfig.apiBaseUrl,
  timeoutMs: Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 1500,
});
```

保留该文件对 `VITE_PUBLIC_API_TIMEOUT_MS` 的读取，因为它不属于本次 API 基础地址重构。

- [ ] **Step 6: 替换简历管理 API 的重复配置**

在 `src/services/resume-api.ts` 引入 `appConfig`，删除局部 `apiBaseUrl`，并将默认实例的配置改为：

```typescript
export const resumeApi = createResumeApi({
  baseUrl: appConfig.apiBaseUrl,
  getToken: getBrowserAdminToken,
  onUnauthorized: invalidateBrowserAdminSession,
});
```

- [ ] **Step 7: 确认环境变量运行时代码读取已集中**

Run: `rg -n "VITE_RESUME_API_BASE_URL|const apiBaseUrl" src`

Expected: `VITE_RESUME_API_BASE_URL` 只出现在 `src/config/app-config.ts` 和 `src/types/env.d.ts`；4 个服务文件中不再存在 `const apiBaseUrl`。

- [ ] **Step 8: 运行配置与 API 测试**

Run: `pnpm exec tsx --test tests/app-config.test.ts tests/default-api-config.test.ts tests/api-client.test.ts tests/admin-auth-api.test.ts tests/home-api.test.ts tests/public-catalog.test.ts tests/resume-api.test.ts`

Expected: 全部 PASS，证明集中配置解析正常，4 个默认实例统一使用应用配置，且 API 工厂函数行为未改变。

- [ ] **Step 9: 提交服务重构**

```bash
git add tests/default-api-config.test.ts src/services/admin-auth-api.ts src/services/home-api.ts src/services/public-catalog-api.ts src/services/resume-api.ts
git commit -m "refactor: 统一 API 服务基础地址配置"
```

### Task 3: 完整质量验证

**Files:**

- Verify only

- [ ] **Step 1: 执行完整测试**

Run: `pnpm test`

Expected: 全部测试 PASS。

- [ ] **Step 2: 执行 TypeScript 类型检查**

Run: `pnpm typecheck`

Expected: PASS。

- [ ] **Step 3: 执行 ESLint 检查**

Run: `pnpm lint`

Expected: PASS，0 warnings。

- [ ] **Step 4: 执行 Prettier 检查**

Run: `pnpm format:check`

Expected: PASS。

- [ ] **Step 5: 执行生产构建**

Run: `pnpm build`

Expected: TypeScript 编译和 Vite 生产构建均成功。

- [ ] **Step 6: 检查补丁与工作区状态**

Run: `git diff --check && git status --short`

Expected: `git diff --check` 无输出；工作区仅包含计划内变更，或在分步提交后保持干净。
