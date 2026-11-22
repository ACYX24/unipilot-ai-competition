import assert from "node:assert/strict"
import test from "node:test"
import type { MediationReport } from "@/lib/mediation-report-schema"
import { findStatementLeak } from "./report-privacy.ts"

const statementA =
  "我们原本约好周末去郊外露营，我提前准备了装备，但对方临时说想在家休息。"
const statementB =
  "那一周我连续加班，周末非常疲惫，所以临时提出想在家休息。"

function makeReport(overrides: Partial<MediationReport> = {}): MediationReport {
  return {
    topic: "周末安排",
    generatedAt: "2026-11-22T00:00:00.000Z",
    overallComment: "双方都需要被理解，也需要找到可以共同执行的安排。",
    summaries: [
      { side: "A", name: "青柠", tone: "orange", text: "A 期待户外活动，也担心自己的期待被忽略。" },
      { side: "B", name: "海盐", tone: "blue", text: "B 更需要休息，同时担心拒绝活动会让对方失望。" },
    ],
    emotions: [
      { side: "A", name: "青柠", tone: "orange", tags: ["期待", "失落"], needs: ["被认真回应", "共同计划"] },
      { side: "B", name: "海盐", tone: "blue", tags: ["疲惫", "内疚"], needs: ["充分休息", "不被指责"] },
    ],
    misunderstandings: [
      { title: "把拒绝活动理解成拒绝自己", detail: "拒绝的是这次安排，不是对方本人。" },
      { title: "临时改变计划缺少说明", detail: "提前说出原因可以减少被忽略的感觉。" },
    ],
    commonNeeds: ["周末真正放松", "感受被认真对待"],
    suggestions: [
      { title: "先说状态再谈安排", detail: "双方先说明精力和期待，再决定周末计划。" },
      { title: "准备折中方案", detail: "把休息和户外活动安排在不同时间段。" },
    ],
    funTasks: [
      { title: "互相说一件感谢的事", detail: "各说一件这周对方做得好的小事。" },
      { title: "一起散步十分钟", detail: "不带手机，只聊轻松的话题。" },
    ],
    ...overrides,
  }
}

test("照抄陈述中的连续片段会被拦截", () => {
  const report = makeReport({
    summaries: [
      {
        side: "A",
        name: "青柠",
        tone: "orange",
        text: "A 说“我们原本约好周末去郊外露营”，因此感到失落。",
      },
      { side: "B", name: "海盐", tone: "blue", text: "B 表示自己很疲惫，需要休息。" },
    ],
  })
  const leak = findStatementLeak(report, { A: statementA, B: statementB })
  assert.equal(leak?.side, "A")
})

test("正常概括不会误报", () => {
  const report = makeReport()
  const leak = findStatementLeak(report, { A: statementA, B: statementB })
  assert.equal(leak, null)
})

test("短于阈值或分散的常见表达不会误报", () => {
  const report = makeReport({
    overallComment: "希望我们能好好沟通，也希望能被理解。",
  })
  const leak = findStatementLeak(report, {
    A: "希望我们能好好沟通",
    B: "我有点累",
  })
  assert.equal(leak, null)
})

test("任意展示字段中的照抄都会命中", () => {
  const report = makeReport({
    misunderstandings: [
      {
        title: "突然改变安排",
        detail: "报告里出现了“我提前准备了装备但对方临时说想在家休息”这样的原句。",
      },
      { title: "没有说明原因", detail: "缺少解释会让另一方感到被忽略。" },
    ],
  })
  const leak = findStatementLeak(report, { A: statementA, B: statementB })
  assert.equal(leak?.side, "A")
})