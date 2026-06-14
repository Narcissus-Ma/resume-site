# 多岗位简历管理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为简历管理页增加多岗位、多语言内容管理和默认岗位发布能力，同时保持公开站点静态部署，并为后续 Cloudflare Workers + KV 迁移保留稳定边界。

**Architecture:** 使用单一 `resume-catalog.json` 保存岗位元数据、启用岗位和三语言内容；共享纯函数负责目录规则，前端 API 服务负责 HTTP，Express 路由通过仓库接口读写本地 JSON。公开页面仍静态读取目录中的启用岗位，未来可在不改变页面业务模型的前提下替换 Worker/KV 存储。

**Tech Stack:** React 18、TypeScript、Ant Design 5、React Router、i18next、Express 5、Node test runner、tsx、Vite、JSON

---

## 文件结构

### 新增

- `src/data/resume-catalog.json`：单一简历目录数据。
- `src/domain/resume/rules/resume-catalog.ts`：目录校验、读取和岗位管理纯函数。
- `src/services/resume-api.ts`：管理端简历 API 客户端。
- `src/server/resume-catalog-repository.ts`：仓库接口和本地 JSON 实现。
- `src/server/create-server.ts`：可注入仓库的 Express 应用。
- `src/components/resume-profile-toolbar.tsx`：岗位、语言和岗位操作工具栏。
- `tests/resume-catalog.test.ts`：共享领域规则测试。
- `tests/resume-server.test.ts`：Express API 测试。

### 修改

- `src/types/resume.ts`：增加目录、岗位、语言和 API 类型。
- `src/hooks/use-translated-data.ts`：按启用岗位和语言读取静态目录。
- `src/hooks/use-resume-editor.ts`：管理目录、选择状态、表单脏状态及 API 操作。
- `src/pages/resume/resume-editor.tsx`：接入工具栏、加载错误和未保存确认。
- `server.ts`：仅组装仓库和启动服务。
- `src/i18n/locales/zh-CN.json`：增加管理文案。
- `src/i18n/locales/en-US.json`：增加管理文案。
- `src/i18n/locales/ja-JP.json`：增加管理文案。
- `scripts/translate-data.js`：遍历目录内全部岗位翻译。
- `package.json`：增加测试命令。
- `tsconfig.server.json`：包含服务端模块。

### 删除

- `src/data/resumeData.json`
- `src/data/resumeData_zh-CN.json`
- `src/data/resumeData_en-US.json`
- `src/data/resumeData_ja-JP.json`

## Task 1：建立目录类型与纯规则

**Files:**
- Modify: `src/types/resume.ts`
- Create: `src/domain/resume/rules/resume-catalog.ts`
- Create: `tests/resume-catalog.test.ts`
- Modify: `package.json`

- [ ] **Step 1：先写目录规则失败测试**

覆盖以下行为：

```typescript
test('按启用岗位和语言读取公开简历');
test('缺少目标语言时回退中文');
test('复制岗位会深拷贝三种语言内容');
test('禁止创建重名岗位');
test('禁止删除启用岗位');
test('禁止删除最后一个岗位');
test('设置不存在的岗位为启用状态会失败');
```

- [ ] **Step 2：运行测试并确认因模块不存在而失败**

Run: `pnpm exec tsx --test tests/resume-catalog.test.ts`

Expected: FAIL，提示无法找到 `resume-catalog` 规则模块。

- [ ] **Step 3：增加目录类型和最小规则实现**

导出：

```typescript
export const RESUME_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'] as const;
export const getActiveResumeContent = (...): ResumeData => {};
export const createResumeProfile = (...): ResumeCatalogMutationResult => {};
export const copyResumeProfile = (...): ResumeCatalogMutationResult => {};
export const renameResumeProfile = (...): ResumeCatalog => {};
export const deleteResumeProfile = (...): ResumeCatalog => {};
export const setActiveResumeProfile = (...): ResumeCatalog => {};
export const updateResumeContent = (...): ResumeCatalog => {};
export const validateResumeCatalog = (...): void => {};
```

所有变更返回新对象，不原地修改输入；ID 生成器通过参数注入，测试使用固定 ID。

- [ ] **Step 4：运行目录规则测试**

Run: `pnpm exec tsx --test tests/resume-catalog.test.ts`

Expected: PASS。

- [ ] **Step 5：增加统一测试脚本**

```json
"test": "tsx --test tests/*.test.ts tests/*.test.mjs"
```

- [ ] **Step 6：提交**

```bash
git add package.json src/types/resume.ts src/domain/resume/rules/resume-catalog.ts tests/resume-catalog.test.ts
git commit -m "feat: add resume catalog domain rules"
```

## Task 2：迁移为单一简历目录数据

**Files:**
- Create: `src/data/resume-catalog.json`
- Modify: `src/hooks/use-translated-data.ts`
- Delete: `src/data/resumeData.json`
- Delete: `src/data/resumeData_zh-CN.json`
- Delete: `src/data/resumeData_en-US.json`
- Delete: `src/data/resumeData_ja-JP.json`
- Test: `tests/resume-catalog.test.ts`

- [ ] **Step 1：增加真实迁移数据读取测试**

断言 `resume-catalog.json`：

- `schemaVersion` 为 `1`。
- `activeResumeId` 为 `frontend`。
- `frontend` 同时包含三种语言。
- 中文标题仍是“前端开发工程师”。

- [ ] **Step 2：运行测试并确认文件不存在**

Run: `pnpm exec tsx --test tests/resume-catalog.test.ts`

Expected: FAIL，提示无法找到 `resume-catalog.json`。

- [ ] **Step 3：机械合并现有三份 JSON**

生成：

```json
{
  "schemaVersion": 1,
  "activeResumeId": "frontend",
  "resumes": [
    {
      "id": "frontend",
      "name": "前端开发",
      "contents": {
        "zh-CN": {},
        "en-US": {},
        "ja-JP": {}
      }
    }
  ]
}
```

三个 `contents` 值完整复用旧文件内容，不修改正文。

- [ ] **Step 4：公开读取切换到目录规则**

`useResumeData()` 使用当前 i18n 语言调用 `getActiveResumeContent()`，不再维护三份静态导入映射。

- [ ] **Step 5：删除旧数据文件并检查引用**

Run: `rg -n "resumeData(_zh-CN|_en-US|_ja-JP)?\\.json|resumeDataMap" src scripts`

Expected: 翻译脚本之外无旧引用；Task 6 会改翻译脚本。

- [ ] **Step 6：运行测试和构建**

Run: `pnpm test && pnpm build`

Expected: PASS。

- [ ] **Step 7：提交**

```bash
git add src/data src/hooks/use-translated-data.ts tests/resume-catalog.test.ts
git commit -m "feat: migrate resumes to a single catalog"
```

## Task 3：实现可替换的服务端仓库和 API

**Files:**
- Create: `src/server/resume-catalog-repository.ts`
- Create: `src/server/create-server.ts`
- Modify: `server.ts`
- Modify: `tsconfig.server.json`
- Create: `tests/resume-server.test.ts`

- [ ] **Step 1：先写 API 失败测试**

使用内存仓库和随机本地端口验证：

```typescript
test('GET 返回完整目录');
test('PUT content 更新指定岗位和语言');
test('POST resumes 支持空白创建');
test('POST resumes 支持复制三种语言');
test('PATCH resumes 重命名岗位');
test('DELETE 拒绝删除启用岗位');
test('PUT active 设置启用岗位');
test('错误响应使用统一结构');
```

- [ ] **Step 2：运行测试并确认应用工厂不存在**

Run: `pnpm exec tsx --test tests/resume-server.test.ts`

Expected: FAIL，提示无法找到 `create-server`。

- [ ] **Step 3：实现仓库接口和本地文件仓库**

```typescript
export interface ResumeCatalogRepository {
  read(): Promise<ResumeCatalog>;
  write(catalog: ResumeCatalog): Promise<void>;
}
```

本地写入流程：校验目录 → 写同目录临时文件 → `rename` 覆盖目标文件。

- [ ] **Step 4：实现 Express 应用工厂和路由**

应用工厂接收仓库和 ID 生成器。路由调用领域规则，不直接操作文件；将领域错误转换为 `400`、`404`、`409`。

- [ ] **Step 5：精简启动文件**

`server.ts` 只创建 `FileResumeCatalogRepository`、调用 `createServer()` 并监听 `3001`。

- [ ] **Step 6：运行 API 测试与服务端类型检查**

Run: `pnpm exec tsx --test tests/resume-server.test.ts`

Run: `pnpm exec tsc -p tsconfig.server.json --noEmit`

Expected: PASS。

- [ ] **Step 7：提交**

```bash
git add server.ts tsconfig.server.json src/server tests/resume-server.test.ts
git commit -m "feat: add resume catalog management api"
```

## Task 4：实现统一前端 API 服务

**Files:**
- Create: `src/services/resume-api.ts`
- Create: `tests/resume-api.test.ts`

- [ ] **Step 1：先写 API 客户端失败测试**

注入 `fetch`，验证：

- 查询参数和 JSON 请求体正确。
- 成功响应解析为 `ResumeCatalog`。
- 非成功响应转换为包含 `code`、`message`、`status` 的 `ResumeApiError`。
- 网络错误保留可展示的中文兜底信息。

- [ ] **Step 2：运行测试并确认模块不存在**

Run: `pnpm exec tsx --test tests/resume-api.test.ts`

Expected: FAIL。

- [ ] **Step 3：实现 API 服务**

统一导出：

```typescript
export const resumeApi = {
  getCatalog,
  updateContent,
  createResume,
  renameResume,
  deleteResume,
  setActiveResume,
};
```

基础地址使用 `VITE_RESUME_API_BASE_URL`，缺省为 `http://localhost:3001`，为后续 Worker URL 留出配置入口。

- [ ] **Step 4：运行测试**

Run: `pnpm exec tsx --test tests/resume-api.test.ts`

Expected: PASS。

- [ ] **Step 5：提交**

```bash
git add src/services/resume-api.ts tests/resume-api.test.ts
git commit -m "feat: add resume catalog api client"
```

## Task 5：接入管理 Hook 和工具栏

**Files:**
- Modify: `src/hooks/use-resume-editor.ts`
- Create: `src/components/resume-profile-toolbar.tsx`
- Modify: `src/pages/resume/resume-editor.tsx`
- Modify: `src/i18n/locales/zh-CN.json`
- Modify: `src/i18n/locales/en-US.json`
- Modify: `src/i18n/locales/ja-JP.json`

- [ ] **Step 1：定义 Hook 对外契约**

Hook 返回：

```typescript
interface UseResumeEditorResult {
  catalog: ResumeCatalog | null;
  data: ResumeData | null;
  selectedResumeId: string;
  selectedLanguage: ResumeLanguage;
  isDirty: boolean;
  loading: boolean;
  error: string | null;
  selectResume(id: string): Promise<void>;
  selectLanguage(language: ResumeLanguage): Promise<void>;
  createResume(name: string): Promise<void>;
  copyResume(name: string): Promise<void>;
  renameResume(name: string): Promise<void>;
  deleteResume(): Promise<void>;
  setActiveResume(): Promise<void>;
  retry(): Promise<void>;
}
```

- [ ] **Step 2：实现目录加载和表单同步**

使用 `resumeApi.getCatalog()` 加载目录，默认选中启用岗位和中文；切换内容后同时更新 `data` 与 `form`，调用 `form.resetFields()` 清理脏状态。

- [ ] **Step 3：实现未保存保护**

集中封装 `confirmBeforeDiscard(nextAction)`：

- 无修改时直接执行。
- 有修改时弹出“保存并继续 / 放弃修改 / 取消”。
- 保存失败时不执行后续动作。

- [ ] **Step 4：实现工具栏**

使用 Ant Design `Select`、`Button`、`Tag`、`Modal`：

- 岗位选择和已启用标识。
- 中文、英文、日文选择。
- 新增、复制、重命名、删除、设为启用。
- 删除按钮在当前岗位启用或仅剩一个岗位时禁用。
- 所有 Props 使用 `interface` 明确定义。

- [ ] **Step 5：接入编辑页面**

工具栏放在标题和保存卡片之间；加载失败时使用 `Result` 展示重试；保存按钮显示当前岗位和语言语境；保留现有全部编辑字段。

- [ ] **Step 6：增加三语言 UI 文案**

增加 `resumeEditor.profile.*` 和 `resumeEditor.language.*` 命名空间，所有新增可见文案走 i18n。

- [ ] **Step 7：运行类型、Lint 和格式检查**

Run: `pnpm typecheck`

Run: `pnpm lint`

Run: `pnpm format:check`

Expected: PASS。

- [ ] **Step 8：提交**

```bash
git add src/hooks/use-resume-editor.ts src/components/resume-profile-toolbar.tsx src/pages/resume/resume-editor.tsx src/i18n/locales
git commit -m "feat: manage resume profiles and languages"
```

## Task 6：更新翻译脚本

**Files:**
- Modify: `scripts/translate-data.js`
- Test: `tests/resume-catalog.test.ts`

- [ ] **Step 1：增加目录翻译目标选择测试**

将“从中文岗位内容生成目标语言内容”的目录遍历提取为纯函数，测试多个岗位全部被更新，岗位 ID、名称和启用状态不变。

- [ ] **Step 2：运行测试并确认失败**

Run: `pnpm exec tsx --test tests/resume-catalog.test.ts`

Expected: FAIL，目标函数不存在。

- [ ] **Step 3：修改翻译脚本**

读取 `resume-catalog.json`，逐个岗位翻译 `contents['zh-CN']`，写回 `en-US` 与 `ja-JP`，最后一次性覆盖目录文件。

- [ ] **Step 4：运行测试**

Run: `pnpm test`

Expected: PASS。不实际调用外部翻译网络。

- [ ] **Step 5：提交**

```bash
git add scripts/translate-data.js tests/resume-catalog.test.ts
git commit -m "feat: translate every resume profile"
```

## Task 7：完整验证和浏览器验收

**Files:**
- Modify only if verification finds defects.

- [ ] **Step 1：运行自动化检查**

Run:

```bash
pnpm test
pnpm typecheck
pnpm exec tsc -p tsconfig.server.json --noEmit
pnpm lint
pnpm format:check
pnpm build
```

Expected: 全部通过且无 warning。

- [ ] **Step 2：启动前后端**

Run: `pnpm server`

Run: `pnpm dev`

- [ ] **Step 3：浏览器验证管理流程**

打开 `http://localhost:3000/resume-site/resume-editor`：

- 默认岗位和中文内容正确。
- 语言切换加载对应内容。
- 新增岗位创建三份空白内容。
- 复制岗位保留三份内容。
- 重命名成功。
- 编辑后切换触发未保存确认。
- 启用岗位不可删除。
- 非启用岗位可删除。
- 设置启用岗位成功。

- [ ] **Step 4：浏览器验证公开页面**

打开 `http://localhost:3000/resume-site/resume`：

- 只展示 `activeResumeId` 对应岗位。
- 切换网站语言后展示该岗位对应语言。
- 页面不出现岗位选择器。

注意：开发服务器静态导入 JSON 时，修改目录后 Vite 应热更新；生产环境仍需重新构建部署才会发布。

- [ ] **Step 5：检查工作区和差异**

Run: `git status --short`

Run: `git diff --check`

Expected: 无意外文件和空白错误。

- [ ] **Step 6：提交验证修复**

仅在验证阶段产生修复时提交：

```bash
git add <修复文件>
git commit -m "fix: stabilize resume profile management"
```

## Cloudflare Workers + KV 迁移检查点

本计划执行后，未来迁移应只替换以下边界：

1. 新增 Worker 入口，复用 `ResumeCatalog` 类型、领域规则和 API 响应契约。
2. 实现 `KvResumeCatalogRepository`，以 `resume-catalog:v1` 单 key 读写目录。
3. 将 `VITE_RESUME_API_BASE_URL` 指向 Worker。
4. 增加认证、CORS 白名单、限流和审计。
5. 增加 `revision` 或 ETag，防止 KV 最终一致和并发写入造成覆盖。
6. 若需要即时线上发布，再把公开页从静态导入改为 Worker 只读 API，并增加缓存和构建时兜底。

本次不会实现以上项目，也不会为了未来 KV 引入当前用不到的并发版本字段。
