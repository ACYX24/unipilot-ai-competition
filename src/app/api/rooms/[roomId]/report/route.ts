import { mediationReportSchema } from "@/lib/mediation-report-schema"
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
