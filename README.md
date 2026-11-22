# CatJudge · 判判猫（归档原型）

> **状态：已归档，不再迭代。**
> 本仓库是 CatJudge 的 Vite + React 高保真前端原型，其设计与流程已迁入正式产品 **Cat Mediator**（Next.js 16 + Supabase）：
> `ACYX24/unipilot-ai-competition` 仓库的 `feature/ui-frontend` 分支。
> 保留此分支仅用于设计追溯与对比，不参与正式项目构建。

## 这是什么

AI 辅助的双人关系沟通与调解产品原型。两人有矛盾时，不判谁对谁错，而是先让彼此听懂对方。

核心机制是「信息隔离」：双方各自陈述，互不可见原文，交叉信息全部由 AI「判判猫」转述。

五阶段流程：

1. **创建 / 加入房间** —— A 描述事件并选关系类型，生成邀请码；B 凭码进入
2. **独立陈述** —— 双方回答 5 个问题：事情经过 / 当时的感受 / 最在意的点 / 希望对方理解 / 希望对方改变
3. **AI 私人反馈** —— 每人一封私人信：做得好的、存在的问题、沟通误区、可改善行为、推荐表达、温柔鼓励
4. **共同观点转述** —— AI 转述对方观点与真实需求，标注「AI 推测·非事实」
5. **互动与约定** —— 猫咪开庭、掷石子、和解行动卡，最终确认双方约定

## 技术栈

- Vite 8 + React 19 + TypeScript 7
- Tailwind CSS 4（`@theme` 品牌色板：cream / tang / cocoa / matcha / blush）
- react-router-dom 7（路由与阶段守卫）
- oxlint

## 本地运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
```

首页点「进入演示房间」可直接走完整流程。

## 原型边界（重要）

- **AI 是模拟的**：反馈内容为 `src/data/mock.ts` 固定剧本，不随输入变化
- **数据不落库**：房间状态存 `localStorage`（key 前缀 `catjudge-room-`），换设备无法续接
- **身份是假的**：`setPerspective` 是前端演示开关，真实产品由登录态与访问凭证决定
- 无后端、无鉴权、无多设备同步

以上四点均由 Cat Mediator 的 Supabase + Route Handlers 解决，这也是原型被取代的原因。

## 目录

```
src/
├─ pages/        9 个页面（首页 / 建房间 / 加入 / 陈述 / 等待 / 反馈 / 转述 / 互动 / 约定）
├─ components/   layout（导航/流程头）、brand（吉祥物）、ui（Badge/Button/Card/Field）
├─ state/        RoomContext：房间状态机 + localStorage 持久化 + 阶段推导
└─ data/         mock：演示剧本（A/B 陈述、六段反馈、转述、开庭问题、行动卡）
```

## 相关

- 正式产品：`ACYX24/unipilot-ai-competition` → `feature/ui-frontend`
- 设计迁移方案：《CatJudge 前端接入 Cat Mediator 技术方案》
