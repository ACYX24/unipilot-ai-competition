# UniPilot 贡献规范 Contributing Guide
## ✅ 技术栈强制统一
- Next.js 15 App Router，TypeScript，pnpm
- UI：shadcn/ui + TailwindCSS
- 所有密钥、模型地址统一放在 .env，禁止硬编码写在代码里
- 组件放到 app/components，服务端逻辑放 app/lib / app/api

## 📁 目录约定（固定骨架）
app/
├── api/          # 后端接口（PDF 解析、AI 问答）
├── components/   # UI 组件（上传框、预览、引用弹窗）
├── lib/          # 工具函数、pdf 解析、LLM 调用
├── page.tsx      # 首页
public/           # 静态资源
.env.example      # 模板（只放变量名，不填真实 key）
.gitignore
README.md
## 📝 Git提交规范（commit message，方便追溯）
格式：`类型: 简短描述`
类型可选：
- feat: 新功能（上传PDF、问答、生成笔记）
- fix: 修复bug
- style: 格式调整，不改动逻辑
- docs: 修改文档
- refactor: 重构代码

示例：
`feat: add pdf upload and text extract api`
`fix: page citation index error`

## 🔀 分支合并规则（重点，防止乱合并）
- `main`：稳定主分支，**禁止直接push到main**
- 开发流程：从main切出功能分支 → 写完提PR → 检查代码、跑通构建 → 合并进main
- 分支命名：`feat/xxx` / `fix/xxx`

例：`feat/pdf-qa`

## ✅ 提交前检查清单
1. pnpm install 依赖正常
2. pnpm build 构建无报错
3. 代码格式化：pnpm lint
4. 没有把 .env、api key 提交上去
