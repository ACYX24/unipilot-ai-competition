# UniPilot 贡献规范 Contributing Guide

## ✅ 技术基线（方案 B，已冻结）

- Next.js **16.4.6** App Router，TypeScript，**pnpm**
- UI：shadcn/ui + Tailwind CSS 4
- 所有密钥、模型地址统一放在 `.env.local`（模板为 `.env.example`），禁止硬编码在代码里
- 服务端密钥不得带 `NEXT_PUBLIC_` 前缀

### 目录约定（固定骨架）

```
src/
├── app/                  # 页面与路由
│   ├── api/              # Route Handlers（rooms、analysis、report）
│   ├── create/
│   ├── room/[roomId]/
│   └── report/[roomId]/
├── components/           # UI 组件（shadcn 基础组件放 ui/）
└── lib/                  # 前后端共享类型与工具
    └── server/           # 仅服务端：Supabase admin、鉴权、LLM、限流
supabase/
├── schema.sql            # 全新环境建表
└── migrations/           # 已有环境的增量迁移（只增不删）
docs/                     # API 契约、后端设计、AI 报告 schema
public/                   # 静态资源
```

### 包管理器

- 只使用 **pnpm**，提交 `pnpm-lock.yaml`
- 不得同时保留 `package-lock.json` / `yarn.lock`
- 新增依赖前先在 PR 中说明用途和体积影响，经负责人确认

## 📝 Git 提交规范

格式：`类型: 简短描述`

类型可选：

- `feat:` 新功能（分析接口、报告页、趣味任务）
- `fix:` 修复 bug
- `style:` 格式调整，不改动逻辑
- `docs:` 修改文档
- `refactor:` 重构代码

示例：

- `feat: add idempotent analysis endpoint`
- `feat: add authenticated report api`
- `fix: handle failed report generation retry`
- `docs: define mediation report api contract`

## 🔀 分支与 PR 规则

- `main`：稳定主分支，**禁止直接 push**
- 从最新 `main` 切出 `feat/xxx` 或 `fix/xxx`，完成后提 PR
- PR 必须：跑通 `pnpm build` / `pnpm lint`，说明 API 与数据库变更、migration 执行方式、风险与回滚方式
- 至少一名负责人 review 后合并

## ✅ 提交前检查清单

1. `pnpm install` 依赖正常
2. `pnpm build` 构建无报错
3. `pnpm lint` 无报错
4. 有测试时 `pnpm test` 通过
5. 没有把 `.env` / `.env.local`、API Key、访问 token 提交上去
6. 数据库变更只通过 `supabase/migrations/` 增量执行，不执行 `schema.sql` 里的 `DROP TABLE` 示例
7. 未在浏览器 bundle 中引入 `SUPABASE_SERVICE_ROLE_KEY` 或 `LLM_API_KEY`

## 🔐 后端与安全约定

- 参与者身份只通过 `x-participant-token` 请求头传递，禁止放 URL query
- 报告与分析接口必须先校验参与者属于该房间
- 服务端只使用 service-role 客户端访问 Supabase，浏览器不直连数据库
- LLM 调用只在服务端，失败时返回可重试状态，**不得用 Mock 报告兜底**
- 日志不得记录访问 token、API Key、完整用户陈述
- AI 报告仅辅助沟通，不替代专业心理、法律或危机干预服务
