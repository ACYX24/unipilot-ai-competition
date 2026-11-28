# CatJudge 比赛版部署

Qoder Sites 托管静态页面。现有 Next.js 后端提供建房、陈述、分析与报告接口，并连接独立的比赛 Supabase 项目和 DeepSeek 服务。发布后评委通过同一个 Qoder Sites 地址操作。

## 1. 准备数据库和后端

- 新比赛库先执行 `supabase/schema.sql`，再执行 `supabase/migrations/20261126_contest_model_quota.sql`。
- 已有比赛库先确认只有测试数据并备份。按先后顺序补齐缺失的 `20261121_analysis_lease.sql`、`20261122_atomic_statement_submit.sql` 和 `20261126_contest_model_quota.sql`。核对 RLS，以及 `claim_room_analysis`、`release_room_analysis`、`submit_room_statement`、`consume_contest_model_quota` 的执行权限。应用函数只授权给 `service_role`。
- 更新已有比赛库时，应用 `20261128_room_mode.sql` 后再部署更新的 Next.js 后端。旧房间默认使用庭审。确认后端支持猫老师模式后，再发布静态站点。
- 仓库所有者授权 Vercel 导入仓库。Next.js 运行环境选择 Node.js 24，启用支持 90 秒分析时限的运行配置，使用可匿名访问的生产 HTTPS 域名。主干自动部署时，数据库迁移先于合并执行。
- 在后端平台填写 `.env.example` 中的 Supabase 和模型变量。比赛环境设 `CATJUDGE_CONTEST_MODE=1`。默认全站每分钟 8 次、每个北京时间自然日 100 次模型调用，使用 `CATJUDGE_MODEL_MINUTE_LIMIT` 和 `CATJUDGE_MODEL_DAILY_LIMIT` 调整。模型的自动修复调用也计入额度。
- `CATJUDGE_SITE_ORIGINS` 填实际 Sites 公网来源，包含协议和主机、无尾斜杠。需要并行预览时可填写逗号分隔的来源列表。更新后重新部署后端，再从该来源验证接口的预检和响应。

## 2. 构建并发布 Sites

在仓库根目录运行以下命令，将域名替换为已验证的生产后端地址。

```powershell
$env:VITE_CATJUDGE_API_ORIGIN = 'https://your-api.example'
pnpm install --frozen-lockfile
pnpm build:sites
```

产物位于 `sites/dist`。在 Qoder CN 的站点任务中让 Qoder 打包并发布这个目录，先保持「仅自己可访问」，从发布详情取得正式站点地址。将该来源加入后端白名单并重新部署后端，用正式地址验证接口，再选择「分享 → 更改访问范围 → 任何人都可访问」。只把公开的 API 地址写入静态产物。

本地跨域联调时，可以设 `CATJUDGE_SITE_ORIGINS=http://localhost:5173` 运行原有 `pnpm dev` 后端，再运行 `pnpm dev:sites`。默认请求 `http://127.0.0.1:3000`。如果在浏览器用不同的前端主机或端口打开，后端允许的来源也要一致。

## 3. 验收和回滚

- 关闭本地开发服务，用未登录的浏览器和手机流量打开正式链接。点击「单人体验 · 真实 AI 调解」，提交虚构案例，核对生成记录和页面报告，再走完庭审。
- 对两种模式分别用两个独立浏览器会话体验双人房间。确认邀请码可加入、刷新和直达报告仍沿用建房时的模式、双方原文隔离、双方看到同一份模型报告。检查单方等待、模型失败后的手动重试和额度用尽提示。
- 先运行 `pnpm lint`、`pnpm test`、`pnpm build` 和 `pnpm build:sites`。保存通过验收的前后端版本，以便按配套版本回滚。回滚应用可以保留数据库新增的表和函数。
