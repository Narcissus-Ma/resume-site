# 多岗位主页管理设计

## 目标

为 `/home-manage` 增加独立的多岗位主页管理能力。主页后台可以新增、复制、重命名、删除岗位主页，并独立设置访客当前看到的主页岗位；每个岗位维护中文、英文、日文三份内容。

主页目录与用于打印和下载的简历目录完全独立，不共享岗位列表、岗位 ID、启用状态或正文数据。

## 范围

### 本次包含

- 将三份主页语言文件迁移为单一 `home-catalog.json`。
- 将当前主页迁移为“前端开发”岗位并保持现有访客内容。
- 每个岗位保存三语言主页内容。
- 主页内容增加可管理的职业名称和个人简介。
- 管理页支持岗位新增、复制、重命名、删除和设置启用。
- 管理页支持中文、英文、日文内容切换。
- 切换岗位、语言或执行岗位操作前保护未保存内容。
- 公开主页只显示主页目录的启用岗位。
- 增加独立主页领域规则、API 服务、文件仓库及测试。
- 翻译脚本遍历所有主页岗位。

### 本次不包含

- 与 `resume-catalog.json` 同步岗位或内容。
- 自动从打印简历生成主页数据。
- 访客切换主页岗位。
- Cloudflare Workers 或 KV 实现。
- 线上后台认证和权限管理。

## 数据模型

新增 `src/data/home-catalog.json`：

```json
{
  "schemaVersion": 1,
  "activeHomeId": "frontend",
  "homes": [
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

主页内容结构：

```typescript
export interface HomeData {
  occupation: string;
  description: string;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
}

export interface HomeProfile {
  id: string;
  name: string;
  contents: Record<ResumeLanguage, HomeData>;
}

export interface HomeCatalog {
  schemaVersion: 1;
  activeHomeId: string;
  homes: HomeProfile[];
}
```

主页与简历可以复用三种语言的字面量类型，但不能复用目录实体、岗位 ID 或启用状态。

约束：

- `homes` 至少包含一个岗位。
- `activeHomeId` 必须对应现有主页岗位。
- 岗位 ID 唯一且创建后不变。
- 岗位名称必填且不可重复。
- 每个岗位必须包含中、英、日三份内容。
- 职业名称和个人简介属于岗位语言内容。

## 数据迁移

现有三份主页文件组合为 `frontend` 岗位：

- `homeData_zh-CN.json`
- `homeData_en-US.json`
- `homeData_ja-JP.json`

每种语言的 `occupation` 和 `description` 从对应 locale 的 `home.occupation`、`home.description` 迁入。迁移后删除旧主页文件。

以下文案继续由 i18n 管理：

- 问候语 `home.hi`
- 姓名 Narcissus
- “查看简历”和“往下滑”
- 各栏目标题及公共说明

## 架构

### 公开主页

`useHomeData()` 静态读取 `home-catalog.json`：

1. 根据 `activeHomeId` 找到启用主页岗位。
2. 根据当前 i18n 语言读取内容。
3. 目标语言缺失时回退中文。

`HomeSection` 从 `useHome()` 获取 `occupation` 和 `description`，不再使用 `home.occupation`、`home.description`。

### 主页领域规则

新增 `src/domain/home/rules/home-catalog.ts`，提供：

- 目录校验。
- 获取启用主页内容。
- 创建空白主页岗位。
- 深复制三语言主页岗位。
- 重命名。
- 删除保护。
- 设置启用岗位。
- 更新指定岗位和语言内容。

规则全部为纯函数，不依赖 React、Ant Design、Express、文件系统或浏览器 API。

### 前端服务与 Hook

新增：

- `src/services/home-api.ts`
- `src/hooks/use-home-profile-management.ts`
- `src/components/home-profile-toolbar.tsx`

`use-home-manage.ts` 保留技能、经历、项目条目的增删逻辑，并组合主页岗位管理 Hook。所有 API 请求经 `home-api.ts` 统一处理错误和基础地址。

### 服务端

新增独立 `HomeCatalogRepository` 和 `FileHomeCatalogRepository`，读取和写入 `home-catalog.json`。本地文件写入继续采用临时文件重命名，并使用项目 Prettier 配置序列化。

`createServer()` 同时注入：

- `ResumeCatalogRepository`
- `HomeCatalogRepository`

主页 API 与简历 API 路径和业务规则互不调用。

## API

### `GET /api/home-catalog`

获取完整主页目录。

### `PUT /api/home-catalog/content`

```json
{
  "homeId": "frontend",
  "language": "zh-CN",
  "content": {}
}
```

更新当前岗位、当前语言的主页内容。

### `POST /api/home-catalog/homes`

空白创建：

```json
{
  "name": "后端开发",
  "mode": "empty"
}
```

复制创建：

```json
{
  "name": "全栈开发",
  "mode": "copy",
  "sourceHomeId": "frontend"
}
```

### `PATCH /api/home-catalog/homes/:homeId`

重命名主页岗位。

### `DELETE /api/home-catalog/homes/:homeId`

删除非启用主页岗位。禁止删除启用岗位或最后一个岗位。

### `PUT /api/home-catalog/active`

独立设置公开主页启用岗位。

错误响应继续使用统一结构：

```json
{
  "error": {
    "code": "HOME_NOT_FOUND",
    "message": "未找到指定主页岗位"
  }
}
```

## 管理页面交互

`/home-manage` 顶部增加：

- 主页岗位选择器。
- 内容语言选择器。
- 已启用和未保存状态。
- 设为启用、新增、复制、重命名、删除按钮。

编辑表单增加：

- 职业名称。
- 个人简介。
- 原有技能、工作经历和项目。

交互规则：

- 初始选择主页启用岗位的中文内容。
- 新增岗位创建三份合法空白内容，并切换到新岗位中文。
- 复制岗位深复制当前岗位的全部三语言内容。
- 保存只更新当前主页岗位和语言。
- 设置启用只影响公开主页，不影响打印简历。
- 启用岗位不可删除，且至少保留一个主页岗位。
- 切换岗位、语言或执行岗位操作前，若表单已修改，显示“保存并继续 / 放弃修改 / 取消”。
- 添加技能、经历或项目时，必须保留表单中尚未保存的其他字段。

## 国际化

管理界面的岗位操作文案增加在 `homeManage.profile.*` 和 `homeManage.language.*`。

主页内容的职业名称和简介迁入 `home-catalog.json` 后，locale 中原键可以保留一轮以避免无关引用风险，但公开主页不再读取它们。

翻译脚本：

- 遍历每个主页岗位。
- 以 `contents['zh-CN']` 为源更新英文和日文内容。
- 不翻译岗位名称。
- 不改变岗位 ID 和 `activeHomeId`。

## 错误处理

- 目录读取时校验结构和启用岗位。
- API 参数缺失返回 `400`。
- 岗位不存在返回 `404`。
- 名称冲突、删除启用岗位或最后岗位返回 `409`。
- 管理页加载失败显示重试入口。
- 保存或岗位操作失败保留当前表单和未保存状态。
- 取消未保存确认后不改变选择。

## 测试

### 主页领域测试

- 按主页启用岗位和语言读取内容。
- 缺少语言时回退中文。
- 创建空白岗位包含三语言和完整字段。
- 复制岗位为深拷贝。
- 名称为空或重复时失败。
- 禁止删除启用岗位和最后岗位。
- 设置不存在岗位失败。
- 更新内容不影响其他岗位或语言。
- 真实迁移目录保留当前主页数据和职业信息。

### 服务端测试

使用内存主页仓库验证所有主页 API，不写真实目录文件。文件仓库单独验证项目 Prettier 格式。

### 前端和浏览器验证

- TypeScript、服务端类型、ESLint、Prettier、生产构建。
- 管理页岗位和语言切换。
- 新增、复制、重命名、删除、设置启用。
- 职业名称和个人简介编辑。
- 未保存保护。
- 公开主页只显示主页启用岗位。
- 打印简历启用岗位不受影响。

## Cloudflare Workers + KV

未来迁移可使用独立 key：

- `resume-catalog:v1`
- `home-catalog:v1`

主页 API 客户端与仓库边界独立，因此可以单独迁移，不要求打印简历后台同步上线。与简历目录相同，Worker 上线前需要增加认证、CORS 白名单、限流、审计和 revision/ETag 并发校验。

## 验收标准

- 现有主页中英日内容迁移后保持一致。
- 主页后台可以独立管理任意数量岗位和三语言内容。
- 主页启用岗位与打印简历启用岗位互不影响。
- 公开主页只展示主页目录中启用岗位。
- 职业名称和个人简介可按岗位、语言编辑。
- 未保存内容不会静默丢失。
- 新增规则和 API 有自动化测试。
- 测试、类型检查、ESLint、Prettier 和生产构建通过。
