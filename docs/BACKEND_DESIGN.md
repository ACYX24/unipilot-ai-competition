# 后端设计：AI 调解报告闭环

## 目标

在现有双人房间系统上完成「双方提交观点 → 服务端 LLM 生成结构化报告 → 持久化 → 参与者鉴权读取」闭环。不重写房间创建、加入、邀请码、token、陈述提交。

## 模块边界

| 模块 | 路径 | 职责 |
|---|---|---|
| 报告 schema | `src/lib/mediation-report-schema.ts` | 模型输出 Zod schema、最终报告类型、JSON 提取 |
| 环境校验 | `src/lib/server/env.ts` | 读取并校验 LLM 配置；缺失时明确失败 |
| LLM 客户端 | `src/lib/server/llm-client.ts` | OpenAI 兼容客户端、超时、错误分类、调用日志脱敏 |
| Prompt | `src/lib/server/prompts/mediation-report.ts` | 中立调解 system/user prompt |
| 生成服务 | `src/lib/server/mediation-report-service.ts` | 拼装输入、调用模型、校验、写库、完成状态 |
| 分析错误 | `src/lib/server/analysis-errors.ts` | 错误码 → HTTP 状态/可重试/用户文案 |
| 分析租约 | `src/lib/server/analysis-lock.ts` | 调用数据库 RPC 原子领取/释放分析任务 |
| 分析接口 | `src/app/api/rooms/[roomId]/analysis/route.ts` | HTTP、鉴权、状态检查、编排 |
| 报告接口 | `src/app/api/rooms/[roomId]/report/route.ts` | 鉴权并读取持久化报告 |
| 迁移 | `supabase/migrations/20261121_analysis_lease.sql` | 租约字段与 RPC（只增不删） |

Route Handler 只负责 HTTP、鉴权与响应；业务逻辑在 `src/lib/server/`。

## 数据流

```text
双方提交陈述
  └─ rooms.status = analyzing
       └─ 前端调用 POST /analysis
            ├─ 参与者 token 鉴权 + 房间/陈述检查
            ├─ claim_room_analysis() 原子领取（失败 → 202）
            ├─ 读取主题、类型、A/B 昵称与陈述
            ├─ LLM（OpenAI 兼容）→ JSON → Zod 校验（失败修复 1 次）
            ├─ 写入 mediation_reports（room_id unique）
            └─ rooms.status = completed，清空租约
                 └─ GET /report（A/B 任一参与者）读取同一份报告
```

## 状态机

```text
waiting → collecting → analyzing → completed
                          │
                          └─ 失败：保持 analyzing，写 analysis_error，释放租约，可重试
```

- 失败绝不伪装成 `completed`，也不使用 Mock 报告兜底。
- `analysis_attempts` 记录领取次数，用于观测与调试；重试频率由接口限流约束。

## 并发与幂等

1. `claim_room_analysis(p_room_id, p_lease_seconds)`：单条 `UPDATE ... WHERE status='analyzing' AND (lease IS NULL OR lease < now()) RETURNING`，PostgreSQL 行锁保证只有一个请求领取成功。
2. 未领取成功的请求返回 `202 analyzing`，前端继续轮询。
3. 生成成功写 `mediation_reports`；`room_id unique` 作为最后一道数据约束。若插入冲突，视为已有报告，读取现有报告并把房间置为 `completed`。
4. 租约默认 90 秒，覆盖两次模型请求（单次超时 30 秒）+ 写库；实例崩溃后租约自动过期，后续请求可重新领取。
5. 失败调用 `release_room_analysis` 清空租约、记录错误码，房间保持 `analyzing`。

## 环境变量

| 变量 | 作用域 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 浏览器+服务端 | Supabase 项目地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 浏览器 | 仅保留给未来直连场景 |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端 | 所有数据库读写 |
| `LLM_API_KEY` | 仅服务端 | 模型密钥，禁止 `NEXT_PUBLIC_` 前缀 |
| `LLM_BASE_URL` | 仅服务端 | OpenAI 兼容地址，可留空使用 SDK 默认 |
| `LLM_MODEL` | 仅服务端 | 模型名 |

缺少 LLM 配置时分析接口返回 `503 llm_not_configured`，不自动降级到 Mock。

## 安全

- 报告接口必须验证 token 属于该房间 A/B；跨房间 token 返回 401。
- 不在 URL、日志、错误响应中出现 access token、API Key、模型原文或完整陈述。
- Prompt 将用户陈述作为 JSON 数据处理，并明确要求忽略陈述中的指令（防 prompt injection）。
- LLM 输出只接受指定 JSON schema；拒绝缺少 A/B、超长或数量不符的输出。
- 服务端 RPC 仅授权 `service_role`，anon/authenticated 无法调用。
- `SUPABASE_SERVICE_ROLE_KEY`、`LLM_API_KEY` 只在 `src/lib/server/` 读取。

## 失败处理

| 情况 | 行为 |
|---|---|
| 模型超时 / 429 / 5xx / 网络 | 释放租约，返回 503，`retryable: true` |
| 密钥错误 | 释放租约，返回 503，`retryable: false` |
| JSON/结构不合法 | 一次修复重试；仍失败则返回 502，`retryable: true` |
| 写库失败 | 释放租约，返回 500，`retryable: true` |
| 数据库未迁移 | 返回 503 `analysis_migration_missing` |

## 部署 / 迁移

1. 在目标 Supabase 项目备份后执行 `supabase/migrations/20261121_analysis_lease.sql`。
2. 全新项目执行 `supabase/schema.sql`（已包含租约字段与函数）。
3. 配置 `.env.local`（参考 `.env.example`）。
4. `pnpm build` 与 `pnpm lint` 通过后再部署。

## 已知边界（MVP）

- 分析为同步请求（最长约 65 秒，含一次修复重试），未引入队列/异步任务；比赛单实例演示足够。
- 限流为单实例内存实现；多实例部署需替换为共享存储。
- 不做流式输出、不做报告重新生成（仅失败重试）。
