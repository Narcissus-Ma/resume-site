# 多岗位简历管理设计

## 目标

在现有简历管理页面中增加多岗位简历管理能力。管理员可以新增、复制、重命名、删除岗位简历，并设置访客默认看到的启用版本；每个岗位同时维护中文、英文、日文三份内容。公开简历页只展示当前启用岗位，不向访客提供岗位切换入口。

本次继续使用开发环境 Express 服务和仓库内 JSON 文件，不实现 Cloudflare Workers 或 KV 存储，但通过稳定的数据契约、API 服务层和存储仓库边界降低后续迁移成本。

## 范围

### 本次包含

- 将现有三份独立语言简历迁移为单一简历目录文件。
- 将现有简历初始化为“前端开发”岗位，并保持现有公开内容不变。
- 管理页面增加岗位选择和语言选择。
- 支持新增、复制、重命名、删除岗位。
- 支持将岗位设置为当前启用版本。
- 支持编辑并保存当前岗位、当前语言的简历内容。
- 切换岗位或语言、执行岗位操作前保护未保存内容。
- 抽离前端 API 服务和服务端存储仓库。
- 更新翻译脚本，使其按岗位把中文内容翻译为英文和日文。
- 增加领域规则、存储和接口测试。

### 本次不包含

- 线上管理后台、身份认证和权限控制。
- Cloudflare Workers、KV、D1 或其他云存储实现。
- 访客切换岗位版本。
- 自动保存、版本历史、草稿发布流程。
- 不同语言使用不同岗位列表或不同启用岗位。

## 现状

- 公开简历页通过静态导入 `resumeData_zh-CN.json`、`resumeData_en-US.json`、`resumeData_ja-JP.json` 展示数据。
- 管理页根据当前 i18n 语言调用本地 `http://localhost:3001/api/resume`，直接覆盖对应 JSON 文件。
- 管理页没有明确的语言选择器，默认通常只能编辑中文。
- 服务端文件路径、HTTP 请求和页面状态耦合较紧，不适合直接迁移到 Workers 和 KV。

## 数据模型

新增单一文件 `src/data/resume-catalog.json`：

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

完整 TypeScript 模型：

```typescript
export type ResumeLanguage = 'zh-CN' | 'en-US' | 'ja-JP';

export interface ResumeProfile {
  id: string;
  name: string;
  contents: Record<ResumeLanguage, ResumeData>;
}

export interface ResumeCatalog {
  schemaVersion: 1;
  activeResumeId: string;
  resumes: ResumeProfile[];
}
```

约束：

- `activeResumeId` 必须对应现有岗位。
- `resumes` 至少包含一个岗位。
- 岗位 `id` 全局唯一、创建后不可变，使用小写 UUID，避免名称变化影响引用。
- 岗位 `name` 必填、去除首尾空格，同一目录内不可重名。
- 每个岗位必须同时包含三种语言内容。
- `correctToken` 仍属于每份语言内容，保持现有行为。
- `schemaVersion` 为未来数据迁移预留。

## 架构

### 公开简历读取

`use-translated-data.ts` 静态导入 `resume-catalog.json`，先根据 `activeResumeId` 找到启用岗位，再根据当前 i18n 语言读取对应内容。若语言不存在则回退中文；若目录异常则抛出可定位的错误，不静默展示错误岗位。

公开站点仍为纯静态构建，不依赖开发环境 Express 服务，因此当前部署方式不变。

### 管理端领域边界

新增以下职责：

- `src/types/resume.ts`：目录、岗位、语言及 API 请求响应接口。
- `src/domain/resume/rules/resume-catalog.ts`：目录校验、创建、复制、重命名、删除、设置启用岗位等纯函数。
- `src/services/resume-api.ts`：统一封装管理端 HTTP 调用、响应解析和错误处理。
- `src/hooks/use-resume-editor.ts`：协调目录加载、表单状态、未保存保护及管理操作。
- `src/components/resume-profile-toolbar.tsx`：只负责岗位与语言选择、操作按钮和启用状态展示。

现有大型编辑表单继续留在 `resume-editor.tsx`，本次不做无关重构。

### 服务端存储边界

将 Express 应用创建和文件存储拆分：

- `src/server/resume-catalog-repository.ts` 定义仓库接口及本地 JSON 实现。
- `src/server/create-server.ts` 创建 Express 应用并通过依赖注入使用仓库。
- `server.ts` 只负责组装本地文件仓库并监听端口。

仓库接口以完整目录为读写单位：

```typescript
export interface ResumeCatalogRepository {
  read(): Promise<ResumeCatalog>;
  write(catalog: ResumeCatalog): Promise<void>;
}
```

本地实现写入临时文件后重命名，减少写入中断导致 JSON 损坏的风险。业务规则不放在文件仓库中，确保未来 KV 实现可复用相同校验。

## API 设计

管理端使用以下接口：

### `GET /api/resume-catalog`

返回完整目录，用于初始化管理页。

### `PUT /api/resume-catalog/content`

请求：

```json
{
  "resumeId": "frontend",
  "language": "zh-CN",
  "content": {}
}
```

只更新指定岗位和语言内容，返回更新后的完整目录。

### `POST /api/resume-catalog/resumes`

请求支持两种模式：

```json
{
  "name": "后端开发",
  "mode": "empty"
}
```

```json
{
  "name": "全栈开发",
  "mode": "copy",
  "sourceResumeId": "frontend"
}
```

空白模式使用合法的空简历模板创建三种语言内容；复制模式深拷贝来源岗位的三种语言内容。返回更新后的完整目录和新岗位 ID。

### `PATCH /api/resume-catalog/resumes/:resumeId`

请求：

```json
{
  "name": "Agent 开发"
}
```

重命名岗位并返回更新后的完整目录。

### `DELETE /api/resume-catalog/resumes/:resumeId`

删除非启用岗位。仅剩一个岗位或目标为启用岗位时返回 `409`。

### `PUT /api/resume-catalog/active`

请求：

```json
{
  "resumeId": "frontend"
}
```

设置全局启用岗位并返回更新后的完整目录。

所有失败响应统一为：

```json
{
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "未找到指定岗位简历"
  }
}
```

前端服务层将非成功响应转换为 `ResumeApiError`，页面只消费统一错误对象。

## 管理页面交互

页面顶部新增工具栏：

- 岗位选择器：展示全部岗位，当前启用岗位带“已启用”标识。
- 语言选择器：中文、英文、日文。
- “设为启用”按钮：当前岗位已启用时禁用。
- “新增”“复制”“重命名”“删除”按钮。
- 当前表单存在修改时显示“未保存”状态。

交互规则：

- 新增岗位要求输入唯一名称，创建后自动切换到新岗位的中文内容。
- 复制岗位要求输入唯一名称，一次深拷贝当前岗位的三种语言内容，创建后切换到副本。
- 重命名只修改岗位元数据，不影响内容和 ID。
- 删除当前启用岗位时直接禁止；至少保留一个岗位。
- 岗位或语言切换前若表单已修改，弹窗提供“保存并切换”“放弃并切换”“取消”。
- 新增、复制、重命名、删除、设置启用前若表单已修改，先使用同一未保存保护流程。
- 保存只更新当前岗位和当前语言；成功后用服务端返回目录刷新本地状态并重置表单脏状态。
- 语言切换仅影响编辑内容，不调用全局 `i18n.changeLanguage`，避免管理页 UI 语言随编辑目标变化。

## 国际化

管理页新增文案写入现有三份 locale 文件。岗位名称是管理员维护的统一元数据，不随内容语言变化；简历正文仍按三种语言分别维护。

`pnpm translate` 调整为遍历目录中的全部岗位，以中文内容为源覆盖生成每个岗位的英文和日文内容。岗位名称不自动翻译。

## 数据迁移

一次性将现有三份文件内容组合为：

- 岗位 ID：`frontend`
- 岗位名称：`前端开发`
- 启用岗位：`frontend`
- 三种语言内容：分别来自现有对应文件

迁移后删除旧的 `resumeData*.json`，所有引用切换到 `resume-catalog.json`。迁移属于仓库代码变更，不在应用启动时重复执行。

## 错误处理

- 服务端启动或读取时校验目录结构，数据损坏时返回明确错误并记录日志。
- API 对参数缺失、名称冲突、岗位不存在、禁止删除分别返回 `400`、`404` 或 `409`。
- 前端加载失败展示错误结果和重试入口，不展示空白表单。
- 保存或岗位操作失败保留当前表单内容和脏状态。
- 未保存确认弹窗取消后不改变岗位、语言或目录状态。

## 测试策略

### 领域规则测试

使用 Node test runner 验证：

- 创建空白岗位时生成三种语言内容和唯一 ID。
- 复制岗位时深拷贝三种语言，修改副本不影响来源。
- 名称为空或重复时失败。
- 启用岗位不存在时失败。
- 禁止删除启用岗位和最后一个岗位。
- 重命名、删除、设置启用后目录约束仍成立。
- 公开读取按启用岗位和语言返回内容，并支持中文回退。

### 服务端测试

使用注入的内存仓库启动 Express 应用，验证各接口状态码、响应结构和仓库写入结果，不直接修改真实数据文件。

### 前端验证

- TypeScript 类型检查。
- ESLint 和 Prettier 检查。
- 生产构建。
- 浏览器验证岗位和语言切换、未保存保护、增删改复制、设置启用，以及公开页只展示启用岗位。

## Cloudflare Workers + KV 后续迁移影响

### 正向影响

- API 请求集中在 `resume-api.ts`，将来只需把基础地址改为 Worker 地址，页面和 Hook 不需要理解 KV。
- `ResumeCatalogRepository` 把存储实现与 Express 路由分离，未来可以新增 `KvResumeCatalogRepository`，复用目录规则和 API 数据契约。
- 单一目录对象可以使用一个 KV key 保存，例如 `resume-catalog:v1`，岗位操作不会产生跨 key 的部分成功问题。
- `schemaVersion` 支持 Worker 读取旧数据后执行显式迁移。
- 公开读取与管理读取使用相同目录结构，未来切换为运行时 API 时无需重建业务模型。

### 需要注意

- Cloudflare KV 是最终一致存储，不适合强事务和高频并发编辑。当前单管理员、低频写入场景可以接受。
- KV 对同一个 key 的并发写入可能发生最后写入覆盖。迁移时应增加目录 `revision` 或 ETag 条件校验；本次暂不加入，避免为未落地的线上管理系统过度设计。
- 线上管理接口必须补充认证、授权、CORS 白名单、速率限制和审计，本次本地服务没有这些安全能力，不能原样暴露到公网。
- 当前公开页面静态导入 JSON，管理员设置启用岗位后仍需要重新构建部署才会在线上生效。迁移 Worker 后若希望即时发布，公开页面需要改为运行时请求 Worker，并设计缓存和失败回退。
- KV 单 key 方案读取简单且更新原子性边界清晰，但目录随岗位数量增加会整体读写。当前简历规模很小，明显低于 KV value 限制；若未来包含大量附件或历史版本，再拆分元数据与内容 key。

### 后续迁移建议

后续迁移分两步进行：

1. 先保持本次 API 契约不变，将 Express 路由移植到 Worker，并用单个 KV key 实现仓库。
2. 再将公开页面由静态目录切换为 Worker 只读接口，增加缓存、构建时兜底数据和管理端认证。

这种顺序可以把“存储迁移”和“公开站点动态化”拆开，降低一次性改造风险。

## 验收标准

- 现有前端简历迁移后，公开页面三种语言内容与改造前一致。
- 管理员可以管理任意数量的岗位简历，并明确编辑当前岗位和语言。
- 每个岗位始终拥有中、英、日三份内容。
- 访客只看到管理端设置的启用岗位。
- 未保存内容不会因切换或岗位操作被静默丢弃。
- 所有新规则和 API 有自动化测试。
- TypeScript、ESLint、Prettier、测试和生产构建全部通过。
- 本次实现不依赖 Cloudflare，但服务和存储边界允许后续替换为 Workers + KV。
