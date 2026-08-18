# Public API Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make public catalog reads tolerant of transient network latency and emit safe browser diagnostics when fallback is used.

**Architecture:** Keep `createPublicCatalogApi` as the single request boundary. It will classify failures at that boundary, emit metadata-only warnings, and preserve the existing `null` fallback contract used by public profile hooks.

**Tech Stack:** TypeScript, browser Fetch API, Node built-in test runner via `tsx`.

---

### Task 1: Cover public API client failure diagnostics

**Files:**
- Create: `tests/public-catalog-api.test.ts`
- Modify: `src/services/public-catalog-api.ts:3-35`

- [ ] **Step 1: Write the failing tests**

Create isolated tests for `createPublicCatalogApi` using injected fetch functions and a temporary `console.warn` replacement. Assert that:

```ts
test('公开目录客户端默认等待十秒', async () => {
  // 使用 node:test 的 mock.timers 启用 setTimeout。
  // fetch 保持 pending，保存传入的 signal；推进 9_999ms 后 signal 未终止，
  // 再推进 1ms 后 signal 已终止并让 fetch 拒绝 AbortError。
  // finally 中恢复 mock.timers。
});

test('超时会记录安全诊断并返回 null', async () => {
  // fetch 仅在 signal 被终止后拒绝 AbortError。
  // 断言 console.warn 包含 timeout、路径和耗时，不包含响应内容。
});
```

Also cover non-2xx `http_error`, rejected `network_error`, and malformed successful JSON `invalid_json`.
For every warning, assert the metadata object has exactly `pathname`, `elapsedMs`, and `category`; `http_error` additionally has only a numeric `status`. Assert `pathname` is the requested public path, `elapsedMs >= 0`, and no URL, caught error object, response body, or headers are present.

Add one module-level default-instance test proving the configured fallback is 10,000ms rather than only testing the factory default. Before importing, replace `globalThis.fetch` with a controllable pending fetch and replace `console.warn`; the pending fetch must listen for `signal.abort` and reject with an `AbortError`. Dynamically import `src/services/public-catalog-api.ts` with a unique query suffix to bypass the ESM cache, call `publicCatalogApi.getHome()`, advance the mock timer through 10,000ms, and assert the awaited result is `null`. In `finally`, restore `globalThis.fetch`, `console.warn`, and `mock.timers`. Keep the test environment variable absent so the module-level fallback is selected.

- [ ] **Step 2: Run the new test file and verify it fails**

Run: `pnpm exec tsx --test tests/public-catalog-api.test.ts`

Expected: FAIL because the client does not yet expose the ten-second default or failure categories.

- [ ] **Step 3: Implement the minimal request diagnostics**

In `src/services/public-catalog-api.ts`:

```ts
const DEFAULT_TIMEOUT_MS = 10_000;

const logPublicCatalogFailure = (metadata: Record<string, unknown>): void => {
  console.warn('公开目录请求失败', metadata);
};
```

Track whether this client triggered the abort. Emit only `pathname`, `elapsedMs`, `category`, and optional numeric `status`; never log content, headers, URLs containing credentials, or caught error objects. Keep every failure returning `null`.

Use `DEFAULT_TIMEOUT_MS` both as `createPublicCatalogApi`'s factory default and as the fallback in the exported `publicCatalogApi` instance:

```ts
timeoutMs: Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : DEFAULT_TIMEOUT_MS,
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `pnpm exec tsx --test tests/public-catalog-api.test.ts`

Expected: PASS.

- [ ] **Step 5: Run regression tests**

Run: `pnpm exec tsx --test tests/default-api-config.test.ts tests/public-catalog-api.test.ts`

Expected: PASS; the API base address and request paths remain unchanged.

- [ ] **Step 6: Commit the implementation**

```bash
git add src/services/public-catalog-api.ts tests/public-catalog-api.test.ts
git commit -m "fix: improve public API request resilience"
```

### Task 2: Verify production quality gates

**Files:**
- Modify: none

- [ ] **Step 1: Format changed files**

Run: `pnpm exec prettier --write src/services/public-catalog-api.ts tests/public-catalog-api.test.ts`

- [ ] **Step 2: Run static checks and production build**

Run: `pnpm lint && pnpm typecheck && pnpm build`

Expected: all commands exit with status 0.

- [ ] **Step 3: Inspect the final change set**

Run: `git diff --check HEAD^ HEAD && git status --short`

Expected: no whitespace errors and no unexpected files.
