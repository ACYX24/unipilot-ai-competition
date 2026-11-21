# unipilot-ai-competition
UniPilot AI | 2026 Qoder高校创意大赛，PDF溯源问答、笔记&amp;测验生成

---

# Cat Mediator · 猫咪调解室

AI 双人沟通调解网页应用：两人通过邀请码进入房间，各自提交观点，AI 猫咪法官分析双方立场并生成结构化调解报告，附带开庭、趣味互动与和解任务。

## 技术栈

- Next.js 16（App Router）+ React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase PostgreSQL
- OpenAI 兼容 LLM 接口（仅服务端调用）

## 运行方式

```bash
npm install
cp .env.example .env.local   # 填入 Supabase 与 LLM 配置
npm run dev                  # http://localhost:3000
```

数据库建表：将 `supabase/schema.sql` 在 Supabase 控制台 SQL Editor 中执行。

## 目录结构

```
src/
  app/
    (pages)/        # 页面路由：首页、创建、加入、房间、报告
    api/            # Route Handlers：房间、陈述、AI 分析（LLM Key 仅此使用）
    layout.tsx
  components/
    ui/             # shadcn/ui 基础组件
  lib/
    supabase/       # Supabase 客户端（browser / server 分离）
    llm/            # LLM 调用封装（OpenAI 兼容）
supabase/
  schema.sql        # 建表 SQL
```

## 环境变量

见 `.env.example`。带 `NEXT_PUBLIC_` 前缀的变量会暴露给浏览器，只放 anon key；
`SUPABASE_SERVICE_ROLE_KEY` 与 `LLM_API_KEY` 仅限服务端使用。

## 安全约定

- API Key 只存服务端环境变量，不进 git、不进浏览器。
- 数据库启用 RLS 且不提供 anon 策略，所有读写走服务端 Route Handlers。
- 所有关键接口做输入验证（zod）与房间权限校验。
