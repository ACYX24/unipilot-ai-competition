# 部署与运维手册

本文档覆盖 Cat Mediator 的上线流程、环境变量、数据库迁移顺序、冒烟验收、AI 分析失败时的降级演练与回滚策略。面向首次部署与后续维护者。

- 适用代码版本：`main` 已合并 PR #8；PR #10 引入原子提交迁移
- 部署目标：Vercel（首选）或任意 Node.js 24 运行环境

## 1. 前置条件

| 依赖 | 版本要求 | 说明 |
|---|---|---|
| Node.js | 24.x | CI 与生产保持一致；本地最低 22.x（22.18+ 支持直接运行 `.mts` 测试） |
| pnpm | 12.21.0 | 唯一包管理器，必须使用 `pnpm-lock.yaml`，禁止混用 npm/yarn 生成第二份锁文件 |
| Supabase | 任意付费/免费项目 | 需要拿到 Project URL、anon key、service_role key |
| LLM 服务 | OpenAI 兼容接口 | 需支持 `response_format: { type: "json_object" }`，例如 DashScope、Moonshot、智谱 |

## 2. 环境变量

全部变量来自 `.env.example`，生产环境在部署平台的环境变量面板配置，**不要提交到仓库**。

| 变量 | 可见范围 | 必填 | 说明 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 浏览器 | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 浏览器 | 是 | anon key，配合 RLS 使用（当前无 anon 策略，仅用于客户端初始化） |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端 | 是 | 所有 API 读写走它，泄露等于数据库失守 |
| `LLM_API_KEY` | 仅服务端 | 是 | LLM 平台密钥 |
| `LLM_BASE_URL` | 仅服务端 | 是 | OpenAI 兼容入口，例如 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `LLM_MODEL` | 仅服务端 | 是 | 例如 `qwen-plus`、`deepseek-chat` |

规则：

- 只有 `NEXT_PUBLIC_` 前缀的变量会进入浏览器 bundle，除此之外任何一个加了这个前缀都视为事故。
- CI 使用占位值运行，不需要真实密钥；上线必须替换为真实值。
- 缺少 `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` 时，分析接口返回 `llm_not_configured`（503，不可重试），页面提示"服务端尚未配置 AI 模型，请联系管理员"。

## 3. 数据库初始化与迁移

全新环境与已有环境的路径不同，不要混用。

### 3.1 全新环境

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`
2. 确认 4 张表已建立：`rooms`、`participants`、`statements`、`mediation_reports`
3. 确认分析租约函数（`acquire_analysis_lease` / `release_analysis_lease`）已创建
4. 确认 4 张表均已开启 RLS，且**没有** anon 策略（所有读写只经服务端 service_role）

### 3.2 已有环境（增量）

按文件名顺序执行 `supabase/migrations/` 下的 SQL：

| 顺序 | 文件 | 作用 |
|---|---|---|
| 1 | `20261121_analysis_lease.sql` | 新增分析租约字段、错误状态字段与相关数据库函数 |
| 2 | `20261122_atomic_statement_submit.sql` | 新增 `submit_room_statement`，把保存陈述与推进状态放进同一事务 |

执行后核验：

```sql
-- 字段存在
select column_name from information_schema.columns
where table_name = 'rooms' and column_name like 'analysis_%';
-- 函数存在
select proname from pg_proc
where proname in ('claim_room_analysis','release_room_analysis','submit_room_statement');
```

> 缺少分析字段/租约函数时，分析/状态接口返回 `analysis_migration_missing`；缺少提交函数时，提交接口返回 `statement_migration_missing`。两者都是 503、`retryable: false`，页面提示管理员执行迁移，不要重试。

### 3.3 合并与生产迁移顺序

根据生产库是否独立、`main` 是否自动部署，选择以下顺序：

| 场景 | 合并前 | 合并后 |
|---|---|---|
| 继续使用已迁移的测试库 | 无额外操作 | 审核通过后直接合并 |
| 有独立生产库，`main` 不自动部署 | 备份生产库 → 执行 `20261122_atomic_statement_submit.sql` → 验证函数存在 | 部署新代码 |
| 有独立生产库，且合并 `main` 会立即自动部署 | **先备份并执行 `20261122_atomic_statement_submit.sql`**，确认函数存在 | 再合并 PR，触发部署 |

> 自动部署场景不要把迁移留到合并之后：否则新代码会在迁移前上线，陈述提交会返回 503 `statement_migration_missing`。该错误不会写入半份陈述，补齐迁移后可安全重试。

### 3.4 迁移纪律

- 迁移文件一旦合并进 `main` 就不再改写；修正通过新增迁移完成。
- 生产执行迁移前先做 schema 备份（Supabase Dashboard → Database → Backups）。
- 迁移与应用**都可独立回退**：先回退应用，保留新增字段与函数，再评估是否回退数据库。

## 4. 部署到 Vercel

1. 在 Vercel 导入仓库 `ACYX24/unipilot-ai-competition`，Production Branch 选 `main`
2. Framework Preset 选 Next.js；Node 版本设为 24.x
3. Install Command：`pnpm install --frozen-lockfile`
4. Build Command：`pnpm build`
5. 按第 2 节配置全部环境变量（Production 与 Preview 各配一份）
6. 首次部署后执行第 5 节冒烟清单

自托管（`pnpm build` + `pnpm start`）同样适用，但需要自行保证 Node 24 与反向代理层传递 `x-participant-token` 请求头不被剥离。

## 5. 上线冒烟清单

两人真实走一遍（可用两个浏览器无痕窗口）：

1. A 创建房间 → 拿到邀请码与访问凭证
2. B 用邀请码加入 → 拿到自己的凭证
3. A/B 分别提交观点（各 5 题）→ 无需刷新即可进入等待/反馈
4. 双方提交完成 → 反馈页自动触发分析 → 10–30 秒内进入 `/report/[roomId]`
5. A/B 打开的报告中 `generatedAt`、`model` 与正文一致
6. 鉴权负测试：无 token、错误 token、A 的 token 读 B 的房间 → 均返回 401
7. 隐私负测试：`GET /api/rooms/[roomId]/state` 响应中不含对方陈述原文，只有 `otherSubmitted`
8. 输入边界：提交 2,001 字的陈述 → 服务端返回 400 而不是静默截断

## 6. AI 分析失败的降级演练

AI 失败是常态而不是异常路径，上线前建议在 Preview 环境各演练一次。方法：临时把 `LLM_API_KEY` 改错或把 `LLM_BASE_URL` 指向不可达地址，照常触发分析。

| 演练方式 | 期望错误码 | 页面表现 | 正确处置 |
|---|---|---|---|
| API Key 错误 | `llm_auth_failed` | "AI 服务鉴权失败，请联系管理员"，**无重试按钮** | 换正确密钥后重新触发 |
| Base URL 错误/不可达 | `llm_upstream_error` | "AI 服务暂时不可用，请稍后重试"，有重试按钮 | 修配置或等上游恢复 |
| 上游限流 | `llm_rate_limited` | "AI 服务繁忙，请稍后重试"，有重试按钮 | 等待后重试 |
| 上游超时（30s 无响应） | `llm_timeout` | "AI 响应超时，请重试"，有重试按钮 | 直接重试 |
| 模型返回非 JSON / 结构不合规 | `llm_invalid_output` | "AI 报告格式异常，请重试"，有重试按钮 | **先观察**：服务端已自动重试一次（带修复提示重发），两次都失败才报此错 |
| 报告写库失败 | `report_persist_failed` | "报告保存失败，请重试" | 重试；连续失败查 Supabase 状态与唯一约束 |
| 未配置模型 | `llm_not_configured` | "服务端尚未配置 AI 模型，请联系管理员"，无重试按钮 | 补环境变量 |
| 报告照抄原文 | `llm_privacy_violation` | "AI 报告可能照抄了原文，请重试"，有重试按钮 | 重试；连续出现检查模型输出 |
| 历史报告照抄原文 | `report_privacy_violation` | "报告包含可能泄露原文的内容，已被拦截" | 不重试，管理员检查并重新生成报告 |
| 分析迁移未执行 | `analysis_migration_missing` | "数据库尚未执行分析迁移，请管理员执行迁移"，无重试按钮 | 执行 `20261121_analysis_lease.sql` |
| 提交迁移未执行 | `statement_migration_missing` | "数据库尚未执行陈述提交迁移，请管理员执行迁移"，无重试按钮 | 执行 `20261122_atomic_statement_submit.sql` |

降级行为的设计约束（改动时不要破坏）：

- 分析失败后**房间状态保持 `analyzing` + 错误码**，不伪造报告、不把房间标记为 `completed`。
- 反馈页每 8 秒最多自动重试一次，且仅在无有效租约、无历史错误时自动触发，避免重试风暴。
- 两位参与者读取同一份已持久化报告；重复触发由数据库唯一约束与租约函数兜底，不产生第二份报告。
- "不可重试"的错误码只出现在配置/迁移类问题，页面不给重试按钮，避免用户无意义点击。

自动化覆盖：`src/lib/analysis-status.test.mts` 固定了错误码 → 文案与可重试性的映射；`src/lib/room-phase.test.mts` 固定了阶段推导与页面守卫顺序。调整 UI 文案时同步更新这两个测试。

## 7. 回滚

| 场景 | 动作 |
|---|---|
| 应用层故障 | Vercel 回滚到上一个 Production Deployment（或 `git revert` 后重新合并，保持 `main` 线性可读） |
| 分析相关故障 | 关闭/修正 LLM 环境变量，**不要**删除 `mediation_reports` 中已有报告 |
| 数据库迁移引发问题 | 先回退应用；新增字段与函数可保留（旧代码不读它们）；确认数据保留方案后再决定是否回退 schema |
| 需要回滚提交 RPC | 先回退代码，再执行 `drop function if exists submit_room_statement(uuid, text, text);` |
| 房间数据异常 | 房间 7 天过期由 `expires_at` 控制，不做手工删表操作 |

## 8. CI 与合并纪律

- PR 触发 `.github/workflows/ci.yml`：`pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm test` → `pnpm build`
- 合并进 `main` 需要至少一名其他成员 review 通过（见 `CONTRIBUTING.md`）
- `main` 禁止直接 push；使用 `feature/xxx` 分支 + PR + Merge Commit（不 squash，保留提交历史）
- CI 会检查是否误提交 `.env*` 文件（仅豁免根目录 `.env.example`）
