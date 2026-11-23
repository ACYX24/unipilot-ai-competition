import {
  mediationReportSchema,
  type ReportSide,
} from "@/lib/mediation-report-schema"
import { findStatementLeak } from "@/lib/server/report-privacy"
import {
  authenticateParticipant,
  isValidRoomId,
  readAccessToken,
} from "@/lib/server/room-auth"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params
  if (!isValidRoomId(roomId)) {
    return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
  }

  const me = await authenticateParticipant(roomId, readAccessToken(request))
  if (!me) {
    return Response.json({ error: "访问凭证无效" }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("invite_code, status, expires_at")
    .eq("id", roomId)
    .maybeSingle()

  if (roomError) {
    return Response.json({ error: "查询房间失败" }, { status: 500 })
  }
  if (!room || new Date(room.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
  }

  const { data: saved, error: reportError } = await supabase
    .from("mediation_reports")
    .select("report, model, created_at")
    .eq("room_id", roomId)
    .maybeSingle()

  if (reportError) {
    return Response.json({ error: "查询报告失败" }, { status: 500 })
  }

  if (!saved) {
    const reportMissing = room.status === "completed"
    return Response.json(
      {
        error: reportMissing ? "报告数据异常，请联系管理员" : "报告尚未生成",
        code: reportMissing ? "report_missing" : "report_pending",
        status: room.status,
      },
      { status: 409 },
    )
  }

  const parsed = mediationReportSchema.safeParse(saved.report)
  if (!parsed.success) {
    console.error("[report] stored report failed validation")
    return Response.json({ error: "报告数据异常，请联系管理员" }, { status: 500 })
  }

  // 历史报告同样拦截：读取时再次比对双方陈述，避免旧数据泄露原文
  const { data: statements, error: statementsError } = await supabase
    .from("statements")
    .select("side, content")
    .eq("room_id", roomId)

  if (statementsError) {
    return Response.json({ error: "查询报告隐私校验数据失败" }, { status: 500 })
  }

  const statementMap: Partial<Record<ReportSide, string>> = {}
  for (const statement of statements ?? []) {
    statementMap[statement.side as ReportSide] = statement.content
  }

  if (findStatementLeak(parsed.data, statementMap)) {
    console.warn("[report] stored report blocked by privacy check")
    return Response.json(
      {
        error: "报告包含可能泄露原文的内容，已被拦截",
        code: "report_privacy_violation",
        retryable: false,
      },
      { status: 409 },
    )
  }

  return Response.json(
    {
      status: "completed",
      inviteCode: room.invite_code,
      model: saved.model,
      generatedAt: saved.created_at,
      report: parsed.data,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
