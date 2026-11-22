# UniPilot / Cat Mediator 开发协作规范

## 1. 产品定位

- 项目名称：Cat Mediator（判判猫）
- 核心产品：AI 辅助的双人关系沟通与调解平台
- PDF 处理与问答：辅助功能，不作为当前比赛核心方向。

## 2. 技术栈统一

- Next.js **16.4.6**（保留现有版本），App Router
- TypeScript
- **pnpm**（唯一包管理器，提交 `pnpm-lock.yaml`）
- Node.js **24.x**
- Tailwind CSS 4
- shadcn/ui
- Supabase
- OpenAI 兼容 LLM 接口（仅服务端调用）

禁止未经团队确认擅自升级、降级核心依赖或替换技术栈。
不得同时保留 `package-lock.json` / `yarn.lock`。

## 3. 项目目录规范

- 保留现有 `src/app/` 目录结构。
- UI 组件放在 `src/components/`，shadcn 基础组件放在 `src/components/ui/`。
- 公共工具函数放在 `src/lib/`。
- 仅服务端模块放在 `src/lib/server/`。
- API 路由放在 `src/app/api/`。
- 数据库建表与增量迁移放在 `supabase/`。
- 接口契约与设计说明放在 `docs/`。

不得擅自迁移目录或重构项目整体架构。

## 4. Git 分支管理

- `main`：稳定主分支，禁止直接 push。
- `feature/xxx`：功能开发分支。
- `fix/xxx`：问题修复分支。
- 历史遗留的 `feat/analysis-report` 可继续使用至合并；新分支统一使用 `feature/xxx` / `fix/xxx`。

开发流程：

1. 从最新 `main` 创建功能分支。
2. 独立开发并提交代码。
3. 创建 Pull Request。
4. 至少一名独立人工审核者 Approve。
5. 通过审核后合并到 `main`。

统一采用 Merge Commit。禁止强推已有分支；已推送分支的修正使用新提交。
任何进入 `main` 的 PR，都必须在最新可审查推送后获得至少一名独立人工审核者的 Approve。

## 5. Commit 规范

采用以下格式：

- `feat`：新增功能
- `fix`：修复问题
- `docs`：修改文档
- `style`：格式调整
- `refactor`：代码重构
- `test`：测试相关
- `chore`：项目配置与依赖管理

示例：`feat: add room invitation API`

## 6. 双人协作规范

### 6.1 团队分工

**成员 A：技术负责人（Backend + AI）**

- 系统架构与技术选型
- 后端 API 与业务逻辑
- Supabase 数据库设计
- AI 模型调用、Prompt 与调解逻辑
- 身份认证、安全及部署

主要负责：

- `src/app/api/`
- `src/lib/server/`
- `src/lib/mediation-report-schema.ts`
- `supabase/`

**成员 B：产品与前端负责人（Frontend + UX）**

- 产品交互与用户体验
- 页面及组件开发
- 前端路由与交互逻辑
- 前端测试与演示材料

主要负责：

- `src/app/page.tsx`
- `src/app/create/`
- `src/app/room/`、`src/app/report/` 的界面层
- `src/components/`
- 前端页面及样式相关文件

### 6.2 分支管理

- `main`：稳定主分支。
- `feature/ai-backend`：后端与 AI 开发。
- `feature/ui-frontend`：前端与产品交互开发。
- `fix/xxx`：问题修复。

### 6.3 协作边界

- 双方优先在各自负责的模块独立开发。
- 修改对方负责的核心模块前，必须提前沟通。
- `src/app/room/`、`src/lib/room-types.ts`、`src/lib/room-api.ts` 等公共模块需要双方协商。
- 数据库 Schema、API 接口及数据类型必须提前约定。
- 禁止未经沟通修改公共接口。
- 禁止覆盖对方尚未合并的代码。

### 6.4 开发流程

1. 确定功能需求和负责人。
2. 双方约定接口、数据结构及文件范围。
3. 各自在独立分支开发。
4. 完成本地测试。
5. 提交 Pull Request。
6. 由另一位成员审核。
7. 合并到 `main`。

### 6.5 冲突处理

如果双方修改同一个文件：

- 优先沟通修改方案。
- 不得直接覆盖对方代码。
- 涉及公共架构或接口的修改必须双方确认。
- 合并冲突必须逐处解决，保留双方有效提交历史，不使用强推覆盖。

## 7. 环境变量与安全

- 使用 `.env.local` 保存本地环境变量。
- `.env.example` 只提供变量名和空值或示例占位符。
- 禁止提交真实 API Key、数据库密码和访问令牌。
- 禁止将敏感信息硬编码进源码。
- `SUPABASE_SERVICE_ROLE_KEY`、`LLM_API_KEY` 仅限服务端读取，禁止使用 `NEXT_PUBLIC_` 前缀。
- 参与者凭证只通过 `x-participant-token` 请求头传递，禁止放 URL query。
- 双方原始陈述不得通过接口返回给对方；敏感接口必须校验参与者属于该房间。
- 日志不得记录访问 token、API Key 或完整用户陈述。
- 数据库写操作只经由服务端 service-role 客户端。

## 8. 提交前检查

- 首次安装使用 `pnpm install`；已有锁文件时使用 `pnpm install --frozen-lockfile`。
- `pnpm build` 通过。
- `pnpm lint` 通过。
- `pnpm test` 通过。
- 没有提交真实密钥、`.env` 或 `.env.local`。
- 没有提交 `package-lock.json` / `yarn.lock`，`pnpm-lock.yaml` 未被意外改写。
- API、数据库或环境变量变更已同步更新 `docs/`，数据库变更按增量迁移执行。
- 项目启用 `cacheComponents`，Route Handler 不得导出 `runtime` segment config。
- 没有未经授权修改其他模块。

## 9. 变更管理

任何涉及以下内容的调整，都必须先提交技术方案并获得团队确认：

- 核心技术栈
- 数据库结构
- API 接口
- 项目目录架构
- 跨模块公共组件
- 产品核心业务逻辑