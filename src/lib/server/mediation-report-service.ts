import { ZodError } from "zod"
import {
  buildMediationReport,
  parseAiReportDraft,
  type AiReportDraft,
  type MediationReport,
  type ReportSide,
} from "@/lib/mediation-report-schema"
import { AnalysisError } from "./analysis-errors"
import { getLlmConfig } from "./env"
import { requestJsonCompletion } from "./llm-client"
import {
  MEDIATION_SYSTEM_PROMPT,
  buildMediationUserPrompt,
} from "./prompts/mediation-report"
import { createSupabaseAdmin } from "./supabase-admin"

const MAX_REPORT_TOKENS = 2600

export interface ReportSource {
  roomId: string
  topic: string
  disputeType: string
  names: Record<ReportSide, string>
  statements: Record<ReportSide, string>
}

function describeValidationError(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ")
      .slice(0, 300)
  }
  return "输出不是合法 JSON 或结构不符合要求"
}

async function generateDraft(source: ReportSource): Promise<AiReportDraft> {
  const userPrompt = buildMediationUserPrompt({
    topic: source.topic,
    disputeType: source.disputeType,
    participants: source.names,
    statements: source.statements,
  })

  const first = await requestJsonCompletion({
    system: MEDIATION_SYSTEM_PROMPT,
    user: userPrompt,
    maxTokens: MAX_REPORT_TOKENS,
  })

  try {
    return parseAiReportDraft(first)
  } catch (error) {
    const reason = describeValidationError(error)
    console.warn("[analysis] invalid model output, retrying once")

    const repairPrompt = `${userPrompt}

你上一次的输出不符合要求，问题：${reason}
上一次输出（已截断）：
${first.slice(0, 3000)}

请只输出修正后的 JSON 对象，严格遵守结构与数量限制，不要输出任何其他文字。`

    const repaired = await requestJsonCompletion({
      system: MEDIATION_SYSTEM_PROMPT,
      user: repairPrompt,
      temperature: 0,
      maxTokens: MAX_REPORT_TOKENS,
    })

    try {
      return parseAiReportDraft(repaired)
    } catch {
      throw new AnalysisError(
        "llm_invalid_output",
        "AI 返回的报告格式不正确，请重试",
        502,
        true,
      )
    }
  }
}

async function markRoomCompleted(roomId: string) {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase
    .from("rooms")
    .update({
      status: "completed",
      analysis_lease_until: null,
      analysis_error: null,
      analysis_error_at: null,
      analysis_completed_at: new Date().toISOString(),
    })
    .eq("id", roomId)

  if (error) {
    // 报告已写入；状态修复会在下一次 analysis 调用时完成
    console.error("[analysis] mark completed failed", { code: error.code })
  }
}

async function persistReport(
  source: ReportSource,
  report: MediationReport,
  model: string,
) {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from("mediation_reports")
    .insert({ room_id: source.roomId, report, model })
    .select("id, model")
    .single()

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("mediation_reports")
        .select("id, model")
        .eq("room_id", source.roomId)
        .maybeSingle()

      if (existing) {
        await markRoomCompleted(source.roomId)
        return { reportId: existing.id as string, model: existing.model as string }
      }
    }

    console.error("[analysis] persist failed", { code: error.code })
    throw new AnalysisError("report_persist_failed", "报告保存失败，请重试", 500, true)
  }

  await markRoomCompleted(source.roomId)
  return { reportId: data.id as string, model: data.model as string }
}

export async function generateAndSaveReport(source: ReportSource) {
  const config = getLlmConfig()
  const draft = await generateDraft(source)
  const report = buildMediationReport(draft, {
    topic: source.topic,
    generatedAt: new Date().toISOString(),
    participantNames: source.names,
  })

  const saved = await persistReport(source, report, config.model)
  return { ...saved, report }
}
