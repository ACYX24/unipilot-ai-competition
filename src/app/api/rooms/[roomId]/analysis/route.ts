import type { Side } from "@/lib/room-types"
import { toAnalysisError } from "@/lib/server/analysis-errors"
import { claimRoomAnalysis, releaseRoomAnalysis } from "@/lib/server/analysis-lock"
import {
  generateAndSaveReport,
  type ReportSource,
} from "@/lib/server/mediation-report-service"
import { isRateLimited } from "@/lib/server/rate-limit"
import {
  authenticateParticipant,
  isValidRoomId,
  readAccessToken,
} from "@/lib/server/room-auth"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"

export const maxDuration = 90

function noStore(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params
  if (!isValidRoomId(roomId)) {
    return noStore({ error: "房间不存在或已过期" }, 404)
  }

  const me = await authenticateParticipant(roomId, readAccessToken(request))
  if (!me) {
    return noStore({ error: "访问凭证无效" }, 401)
  }

  if (
    isRateLimited({
      key: `analysis:${roomId}:${me.id}`,
      limit: 10,
      windowMs: 5 * 60 * 1000,
    })
  ) {
    return noStore(
      { error: "分析请求过于频繁，请稍后再试", code: "rate_limited" },
      429,
    )
  }

  const supabase = createSupabaseAdmin()
  const [roomResult, participantsResult, statementsResult, reportResult] =
    await Promise.all([
      supabase
        .from("rooms")
        .select("id, topic, dispute_type, status, expires_at")
        .eq("id", roomId)
        .maybeSingle(),
      supabase
        .from("participants")
        .select("side, display_name")
        .eq("room_id", roomId),
      supabase
        .from("statements")
        .select("side, content")
        .eq("room_id", roomId),
      supabase
        .from("mediation_reports")
        .select("id")
        .eq("room_id", roomId)
        .maybeSingle(),
    ])

  if (
    roomResult.error ||
    participantsResult.error ||
    statementsResult.error ||
    reportResult.error
  ) {
    return noStore({ error: "读取房间数据失败，请稍后重试" }, 500)
  }

  const room = roomResult.data
  if (!room || new Date(room.expires_at).getTime() < Date.now()) {
    return noStore({ error: "房间不存在或已过期" }, 404)
  }

  if (room.status === "completed") {
    if (reportResult.data) {
      return noStore({ status: "completed", reportId: reportResult.data.id })
    }
    return noStore(
      { error: "报告状态异常，请联系管理员", code: "report_missing" },
      409,
    )
  }

  const names: Partial<Record<Side, string>> = {}
  for (const participant of participantsResult.data ?? []) {
    names[participant.side as Side] = participant.display_name
  }

  const statements: Partial<Record<Side, string>> = {}
  for (const statement of statementsResult.data ?? []) {
    statements[statement.side as Side] = statement.content
  }

  const nameA = names.A
  const nameB = names.B
  const statementA = statements.A
  const statementB = statements.B

  if (!nameA || !nameB || !statementA || !statementB) {
    return noStore(
      { error: "双方观点尚未提交完成", code: "analysis_not_ready" },
      409,
    )
  }

  // 报告已存在但状态未更新（例如上次写库后进程中断）：直接修复状态
  if (reportResult.data) {
    await supabase
      .from("rooms")
      .update({
        status: "completed",
        analysis_lease_until: null,
        analysis_error: null,
        analysis_error_at: null,
        analysis_completed_at: new Date().toISOString(),
      })
      .eq("id", roomId)
    return noStore({ status: "completed", reportId: reportResult.data.id })
  }

  if (room.status !== "analyzing") {
    // 旧房间可能已有两份陈述但仍停留在 collecting/waiting，分析请求时一并修复
    if (room.status === "waiting" || room.status === "collecting") {
      const { error: repairError } = await supabase
        .from("rooms")
        .update({ status: "analyzing" })
        .eq("id", roomId)
        .in("status", ["waiting", "collecting"])

      if (repairError) {
        return noStore({ error: "更新房间状态失败，请稍后重试" }, 500)
      }
    } else {
      return noStore(
        { error: "双方都提交观点后才能开始分析", code: "analysis_not_ready" },
        409,
      )
    }
  }

  const source: ReportSource = {
    roomId,
    topic: room.topic,
    disputeType: room.dispute_type,
    names: { A: nameA, B: nameB },
    statements: { A: statementA, B: statementB },
  }

  let claimed = false

  try {
    claimed = await claimRoomAnalysis(roomId)
    if (!claimed) {
      return noStore({ status: "analyzing" }, 202)
    }

    const saved = await generateAndSaveReport(source)
    return noStore({ status: "completed", reportId: saved.reportId })
  } catch (error) {
    const analysisError = toAnalysisError(error)
    // 只有成功领取租约的请求才允许释放自己的租约
    if (claimed) {
      await releaseRoomAnalysis(roomId, analysisError.code)
    }
    return noStore(
      {
        error: analysisError.message,
        code: analysisError.code,
        retryable: analysisError.retryable,
      },
      analysisError.status,
    )
  }
}
