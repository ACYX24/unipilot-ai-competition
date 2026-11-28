# UniPilot · Cat Mediator API 契约

所有响应均为 JSON。参与者身份通过请求头传递：

```http
x-participant-token: <创建/加入房间时返回的 accessToken>
```

禁止把 token 放在 URL query 中。

## 1. 现有接口

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/rooms` | 无 | 创建房间，返回 `roomId`、`inviteCode`、`side: "A"`、`accessToken` |
| POST | `/api/rooms/join` | 无 | 邀请码加入，返回 `side: "B"`、`accessToken` |
| GET | `/api/rooms/[roomId]/state` | 参与者 | 房间状态；始终不返回对方陈述原文 |
| POST | `/api/rooms/[roomId]/statements` | 参与者 | 每侧提交一次；双方齐全后状态变为 `analyzing` |

创建房间可传 `mode`（`court` 或 `teacher`），省略时使用 `court`。创建和加入响应都返回房间的 `mode`。房间状态的 `room.mode` 与报告响应的顶层 `mode` 均来自同一房间记录。加入和后续请求沿用建房时的选择。

### 1.1 提交陈述的幂等与错误

`POST /api/rooms/[roomId]/statements`

保存陈述与推进房间状态在同一数据库事务内完成：

- 首次提交成功：HTTP `201`，`{ "ok": true, "status": "collecting" | "analyzing", "alreadySubmitted": false }`
- 同一参与者安全重试：HTTP `200`，保留已保存正文，`alreadySubmitted: true`；如果已有两份陈述但房间仍停留在 `collecting`，本次调用会补齐为 `analyzing`
- 房间已不接受新陈述：HTTP `409`，`{ "code": "statements_closed" }`
- 缺少提交迁移：HTTP `503`，`{ "code": "statement_migration_missing", "retryable": false }`

## 2. 触发分析

`POST /api/rooms/[roomId]/analysis`

请求体可为空，不需要 JSON。

### 前置条件

- `roomId` 为合法 UUID；
- token 属于该房间的 A 或 B；
- 房间未过期；
- A/B 两侧都已提交陈述；
- 同一房间的并发调用最多只有一个真正调用模型（数据库租约）。

### 响应

| HTTP | 场景 | Body |
|---|---|---|
| 200 | 报告已生成（本次生成或此前已存在） | `{ "status": "completed", "reportId": "..." }` |
| 202 | 其他请求正在分析 | `{ "status": "analyzing" }` |
| 400 | 请求体非法（当前无请求体，保留） | `{ "error": "..." }` |
| 401 | token 缺失/无效/不属于该房间 | `{ "error": "访问凭证无效" }` |
| 404 | 房间不存在或已过期 | `{ "error": "房间不存在或已过期" }` |
| 409 | 双方尚未提交，或状态不允许分析 | `{ "error": "...", "code": "analysis_not_ready" }` |
| 429 | 分析请求过于频繁 | `{ "error": "...", "code": "rate_limited" }` |
| 502/503 | 上游模型超时/限流/鉴权失败/输出不合法/未配置 | `{ "error": "...", "code": "<error_code>", "retryable": true }` |

### 失败错误码

| code | 含义 | 可重试 |
|---|---|---|
| `llm_not_configured` | 服务端缺少 `LLM_API_KEY`/`LLM_MODEL` | 否（需配置） |
| `llm_timeout` | 模型请求超时 | 是 |
| `llm_rate_limited` | 上游限流 | 是 |
| `llm_auth_failed` | 上游鉴权失败（密钥错误） | 否（需配置） |
| `llm_upstream_error` | 上游 5xx/网络错误 | 是 |
| `llm_invalid_output` | JSON 解析或 schema 校验失败（已做一次修复重试） | 是 |
| `llm_privacy_violation` | 报告照抄原文，已重新生成一次仍不合格 | 是 |
| `report_persist_failed` | 报告写库失败 | 是 |
| `analysis_migration_missing` | 数据库缺少分析字段或租约函数 | 否（HTTP 503，请管理员执行迁移） |

失败时服务端会释放租约并写入 `rooms.analysis_error`，房间保持 `analyzing`，允许再次调用；未成功领取租约的请求不会释放他人的租约。

## 3. 读取报告

`GET /api/rooms/[roomId]/report`

### 响应

| HTTP | 场景 | Body |
|---|---|---|
| 200 | 报告已生成 | 见下方 |
| 401 | token 缺失/无效 | `{ "error": "..." }` |
| 404 | 房间不存在或已过期 | `{ "error": "..." }` |
| 409 | 报告尚未生成 | `{ "error": "报告尚未生成", "code": "report_pending", "status": "analyzing" }` |
| 409 | 历史报告照抄原文，读取时被拦截 | `{ "error": "...", "code": "report_privacy_violation", "retryable": false }` |
| 500 | 数据库读取失败 | `{ "error": "..." }` |

```json
{
  "status": "completed",
  "inviteCode": "ABCD2345",
  "mode": "court",
  "model": "qwen-plus",
  "generatedAt": "2026-11-21T03:20:00.000Z",
  "report": {
    "topic": "周末到底该去爬山还是宅家看剧？",
    "generatedAt": "2026-11-21T03:20:00.000Z",
    "overallComment": "...",
    "summaries": [
      { "side": "A", "name": "橘座", "tone": "orange", "text": "..." },
      { "side": "B", "name": "奶盖", "tone": "blue", "text": "..." }
    ],
    "emotions": [
      { "side": "A", "name": "橘座", "tone": "orange", "tags": ["..."], "needs": ["..."] },
      { "side": "B", "name": "奶盖", "tone": "blue", "tags": ["..."], "needs": ["..."] }
    ],
    "misunderstandings": [{ "title": "...", "detail": "..." }],
    "commonNeeds": ["..."],
    "suggestions": [{ "title": "...", "detail": "..." }],
    "funTasks": [{ "title": "...", "detail": "..." }]
  }
}
```

报告只从 `mediation_reports` 读取，GET 不会触发模型调用。

## 4. 状态接口扩展

`GET /api/rooms/[roomId]/state` 在原有字段上新增：

隐私约定：该接口**始终不返回对方陈述原文**，响应中不存在 `otherStatement` 字段；`otherSubmitted` 仅表示对方是否已提交，`myStatement` 只返回当前参与者自己的原文。

迁移缺失：缺少 `analysis_*` 字段时返回 HTTP `503`、`{ "code": "analysis_migration_missing", "retryable": false }`，页面提示管理员执行分析迁移；普通数据库故障仍返回 500。

```ts
analysis: {
  errorCode: string | null   // 最近一次失败的错误码
  leaseActive: boolean       // 是否已有请求在分析
  canRetry: boolean          // 状态为 analyzing 且当前无租约
  reportReady: boolean       // 房间状态为 completed
}
```

前端轮询策略建议：

- `status === "analyzing"` 且 `!leaseActive`：调用 `POST /analysis`（客户端做节流，建议 ≥8s）；
- `leaseActive`：只等待，不重复调用；
- `errorCode` 存在：停止自动调用，展示错误与「重试分析」按钮；
- `status === "completed"`：跳转/引导到报告页。
