# UniPilot · Cat Mediator 猫咪调解室

AI 双人沟通调解网页应用：两人通过邀请码进入房间，各自提交观点；双方都提交后，服务端调用 LLM 生成结构化调解报告并持久化，参与者可凭访问凭证读取同一份报告，附带趣味和解任务。

## 技术栈

- Next.js 16.4.6（App Router）+ React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase PostgreSQL（仅服务端 service-role 访问，RLS 无匿名策略）
- OpenAI 兼容 LLM 接口（仅服务端调用）

## 运行方式

```bash
pnpm install
cp .env.example .env.local   # 填入 Supabase 与 LLM 配置
pnpm dev                     # http://localhost:3000
```

数据库：

- 全新环境：在 Supabase SQL Editor 执行 `supabase/schema.sql`
- 已有环境：按顺序执行 `supabase/migrations/` 下的增量 SQL（不要执行 `schema.sql` 中的 `DROP TABLE` 示例）

## 目录结构

```
src/
  app/
    api/rooms/...        # 房间、陈述、分析、报告 Route Handlers
    create/              # 创建房间
    room/[roomId]/       # 房间页：提交观点、分析状态
    report/[roomId]/     # 报告页：读取真实报告
  components/            # UI 组件（ui/ 为 shadcn 基础组件）
  lib/
    mediation-report-schema.ts   # 报告 Zod schema 与共享类型
    room-api.ts                  # 浏览器端 API 封装
    server/                      # 仅服务端：鉴权、Supabase、LLM、分析锁
supabase/
  schema.sql             # 建表 + 分析租约函数
  migrations/            # 增量迁移
docs/                    # API 契约、后端设计、AI 报告 schema
```

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/rooms` | 创建房间（用户 A） |
| POST | `/api/rooms/join` | 邀请码加入（用户 B） |
| GET | `/api/rooms/[roomId]/state` | 房间状态（双方原文始终互不可见） |
| POST | `/api/rooms/[roomId]/statements` | 提交观点，每侧一次 |
| POST | `/api/rooms/[roomId]/analysis` | 触发 AI 分析（幂等、防重复、失败可重试） |
| GET | `/api/rooms/[roomId]/report` | 读取已持久化报告（参与者鉴权） |

鉴权：除创建/加入外，均通过 `x-participant-token` 请求头传递访问凭证。

详细契约见 [docs/API.md](docs/API.md)。

## 环境变量

见 `.env.example`。带 `NEXT_PUBLIC_` 前缀的变量会暴露给浏览器，只放 Supabase URL 与 anon key；`SUPABASE_SERVICE_ROLE_KEY` 与 `LLM_API_KEY` 仅限服务端。

Qoder Sites 比赛版的前后端构建、迁移和匿名访问验收见 [比赛部署手册](docs/CONTEST_SITES.md)。

## 安全约定

- API Key 只存服务端环境变量，不进 git、不进浏览器 bundle。
- 数据库启用 RLS 且不提供 anon 策略，所有读写走服务端 Route Handlers。
- 所有关键接口做输入验证（zod）与房间权限校验。
- 访问 token 数据库只存 SHA-256 hash，原始 token 仅在创建/加入时返回一次。
- 报告生成失败返回可重试状态，不使用 Mock 报告冒充 AI 结果。
- 报告发布前检测是否照抄原文，历史报告读取时再次拦截。
- 双方原始陈述始终不通过接口返回给对方。
- AI 分析仅用于辅助沟通，不替代专业心理、法律或危机干预服务。
