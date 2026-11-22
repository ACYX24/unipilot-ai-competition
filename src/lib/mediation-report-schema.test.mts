import assert from "node:assert/strict"
import test from "node:test"
import {
  aiReportDraftSchema,
  buildMediationReport,
  extractJsonObject,
  parseAiReportDraft,
} from "./mediation-report-schema.ts"

function makeDraft() {
  return {
    overallComment: "双方都在为周末安排努力，只是充电方式不同。",
    summaries: [
      { side: "A" as const, text: "希望出门透气，被拒绝时感到失落。" },
      { side: "B" as const, text: "加班后很累，只想在家休息。" },
    ],
    emotions: [
      { side: "A" as const, tags: ["期待", "失落"], needs: ["陪伴感", "提议被重视"] },
      { side: "B" as const, tags: ["疲惫", "想被理解"], needs: ["充分休息", "拒绝不被指责"] },
    ],
    misunderstandings: [
      { title: "把拒绝活动听成拒绝我", detail: "拒绝的是体力消耗，不是对方本人。" },
      { title: "只提方案不说原因", detail: "先说明我为什么需要它，再讨论方案。" },
    ],
    commonNeeds: ["周末真正放松", "高质量相处时间"],
    suggestions: [
      { title: "先说感受再谈方案", detail: "用我这周很累开头，而不是直接否定。" },
      { title: "把二选一改成组合", detail: "上午宅家，傍晚散步。" },
    ],
    funTasks: [
      { title: "互相夸夸", detail: "各说三个优点。" },
      { title: "无手机散步", detail: "一起走三十分钟。" },
    ],
  }
}

test("合法 JSON 输出可通过 schema 校验", () => {
  const draft = parseAiReportDraft(JSON.stringify(makeDraft()))
  assert.equal(draft.summaries.length, 2)
  assert.equal(draft.emotions[0].side, "A")
})

test("可从句柄外文本中提取 JSON 对象", () => {
  const raw = `说明文字\n\`\`\`json\n${JSON.stringify(makeDraft())}\n\`\`\``
  const parsed = extractJsonObject(raw) as Record<string, unknown>
  assert.equal(typeof parsed.overallComment, "string")
})

test("A/B 重复或缺失会被拒绝", () => {
  const draft = makeDraft()
  draft.summaries = [
    { side: "A", text: "重复 A" },
    { side: "A", text: "还是 A" },
  ]
  const result = aiReportDraftSchema.safeParse(draft)
  assert.equal(result.success, false)
})

test("数量不足会被拒绝", () => {
  const draft = makeDraft()
  draft.funTasks = [{ title: "只有一个", detail: "任务数量不足" }]
  assert.equal(aiReportDraftSchema.safeParse(draft).success, false)
})

test("超长文本会被拒绝", () => {
  const draft = makeDraft()
  draft.summaries[0].text = "长".repeat(301)
  assert.equal(aiReportDraftSchema.safeParse(draft).success, false)
})

test("构建最终报告时补齐昵称、语气色与主题", () => {
  const draft = aiReportDraftSchema.parse(makeDraft())
  const report = buildMediationReport(draft, {
    topic: "周末安排",
    generatedAt: "2026-11-21T08:00:00.000Z",
    participantNames: { A: "橘座", B: "奶盖" },
  })

  assert.equal(report.topic, "周末安排")
  assert.equal(report.summaries[0].name, "橘座")
  assert.equal(report.summaries[0].tone, "orange")
  assert.equal(report.emotions[1].name, "奶盖")
  assert.equal(report.emotions[1].tone, "blue")
})
