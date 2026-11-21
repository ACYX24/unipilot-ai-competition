# UniPilot / Cat Mediator 开发协作规范

## 1. 产品定位

- 项目名称：Cat Mediator
- 核心产品：AI 辅助的双人关系沟通与调解平台
- PDF 处理与问答：辅助功能，不作为当前比赛核心方向。

## 2. 技术栈统一

- Next.js 16（保留现有版本）
- TypeScript
- pnpm（唯一包管理器）
- Tailwind CSS
- shadcn/ui
- Supabase

禁止未经团队确认擅自升级、降级核心依赖或替换技术栈。

## 3. 项目目录规范

- 保留现有 src/app/ 目录结构。
- UI 组件放在 src/components/。
- 公共工具函数放在 src/lib/。
- API 路由放在 src/app/api/。
- 不得擅自迁移目录或重构项目整体架构。

## 4. Git 分支管理

- main：稳定主分支，禁止直接 push。
- feature/xxx：功能开发分支。
- fix/xxx：问题修复分支。

开发流程：

1. 从最新 main 创建功能分支。
2. 独立开发并提交代码。
3. 创建 Pull Request。
4. 至少一名其他成员审核。
5. 通过审核后合并到 main。

统一采用 Merge Commit。

## 5. Commit 规范

采用以下格式：

- feat：新增功能
- fix：修复问题
- docs：修改文档
- style：格式调整
- refactor：代码重构
- test：测试相关
- chore：项目配置与依赖管理

示例：feat: add room invitation API

## 6. 代码协作规则

- Agent 和开发者必须遵守统一技术基线。
- 不得擅自修改其他成员负责的模块。
- 修改公共接口前必须通知相关负责人。
- 修改数据库 Schema 前必须说明影响。
- 不得覆盖或删除其他成员尚未合并的工作。
- 跨模块依赖必须提前约定接口。

## 7. 环境变量与安全

- 使用 .env.local 保存本地环境变量。
- .env.example 只提供变量名和空值或示例占位符。
- 禁止提交真实 API Key、数据库密码和访问令牌。
- 禁止将敏感信息硬编码进源码。

## 8. 提交前检查

- pnpm install 正常。
- pnpm build 通过。
- pnpm lint 通过（以项目实际脚本为准）。
- 没有提交真实密钥。
- 没有未经授权修改其他模块。

## 9. 变更管理

任何涉及以下内容的调整，都必须先提交技术方案并获得团队确认：

- 核心技术栈
- 数据库结构
- API 接口
- 项目目录架构
- 跨模块公共组件
- 产品核心业务逻辑
