import { z } from "zod"

export const reportSideSchema = z.enum(["A", "B"])
export const reportToneSchema = z.enum(["orange", "blue"])

export type ReportSide = z.infer<typeof reportSideSchema>
export type ReportTone = z.infer<typeof reportToneSchema>

const shortText = (max: number) => z.string().trim().min(1).max(max)

const listItemSchema = z.object({
  title: shortText(40),
  detail: shortText(200),
})

const summaryDraftSchema = z.object({
  side: reportSideSchema,
  text: shortText(300),
})

const emotionDraftSchema = z.object({
  side: reportSideSchema,
  tags: z.array(shortText(12)).min(2).max(4),
  needs: z.array(shortText(40)).min(2).max(4),
})

function hasBothSides(items: { side: ReportSide }[]) {
  const sides = new Set(items.map((item) => item.side))
  return sides.size === 2 && sides.has("A") && sides.has("B")
}

/** 模型必须输出的结构；昵称、语气色、时间戳由服务端补齐，防止模型编造身份信息。 */
export const aiReportDraftSchema = z
  .object({
    overallComment: shortText(400),
    summaries: z.array(summaryDraftSchema).length(2),
    emotions: z.array(emotionDraftSchema).length(2),
    misunderstandings: z.array(listItemSchema).min(2).max(4),
    commonNeeds: z.array(shortText(40)).min(2).max(5),
    suggestions: z.array(listItemSchema).min(2).max(4),
    funTasks: z.array(listItemSchema).min(2).max(4),
  })
  .superRefine((value, ctx) => {
    if (!hasBothSides(value.summaries)) {
      ctx.addIssue({
        code: "custom",
        path: ["summaries"],
        message: "summaries 必须包含 A、B 各一项",
      })
    }
    if (!hasBothSides(value.emotions)) {
      ctx.addIssue({
        code: "custom",
        path: ["emotions"],
        message: "emotions 必须包含 A、B 各一项",
      })
    }
  })

export type AiReportDraft = z.infer<typeof aiReportDraftSchema>

const summarySchema = summaryDraftSchema.extend({
  name: shortText(30),
  tone: reportToneSchema,
})

const emotionSchema = emotionDraftSchema.extend({
  name: shortText(30),
  tone: reportToneSchema,
})

/** 持久化到 mediation_reports.report 的最终结构，前后端共用。 */
export const mediationReportSchema = z.object({
  topic: shortText(200),
  generatedAt: z.string().trim().min(1).max(40),
  overallComment: shortText(400),
  summaries: z.array(summarySchema).length(2),
  emotions: z.array(emotionSchema).length(2),
  misunderstandings: z.array(listItemSchema).min(2).max(4),
  commonNeeds: z.array(shortText(40)).min(2).max(5),
  suggestions: z.array(listItemSchema).min(2).max(4),
  funTasks: z.array(listItemSchema).min(2).max(4),
})

export type MediationReport = z.infer<typeof mediationReportSchema>

const toneBySide: Record<ReportSide, ReportTone> = {
  A: "orange",
  B: "blue",
}

export function buildMediationReport(
  draft: AiReportDraft,
  input: {
    topic: string
    generatedAt: string
    participantNames: Record<ReportSide, string>
  },
): MediationReport {
  const withIdentity = <T extends { side: ReportSide }>(item: T) => ({
    ...item,
    name: input.participantNames[item.side],
    tone: toneBySide[item.side],
  })

  return mediationReportSchema.parse({
    topic: input.topic,
    generatedAt: input.generatedAt,
    overallComment: draft.overallComment,
    summaries: draft.summaries.map(withIdentity),
    emotions: draft.emotions.map(withIdentity),
    misunderstandings: draft.misunderstandings,
    commonNeeds: draft.commonNeeds,
    suggestions: draft.suggestions,
    funTasks: draft.funTasks,
  })
}

/** 从模型输出中截取 JSON 对象，容忍 Markdown 围栏或前后说明文字。 */
export function extractJsonObject(raw: string): unknown {
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  if (start === -1 || end <= start) {
    throw new Error("模型输出中未找到 JSON 对象")
  }
  return JSON.parse(raw.slice(start, end + 1))
}

export function parseAiReportDraft(raw: string): AiReportDraft {
  return aiReportDraftSchema.parse(extractJsonObject(raw))
}
