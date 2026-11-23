import {
  authenticateParticipant,
  isValidRoomId,
  readAccessToken,
} from "@/lib/server/room-auth"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"
import { isMissingAnalysisColumnsError } from "@/lib/server/supabase-errors"
import type { RoomStateResponse } from "@/lib/room-types"

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
    return Response.json(
      { error: "访问凭证无效，请通过创建或加入房间进入" },
      { status: 401 },
    )
  }

  const supabase = createSupabaseAdmin()
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      "id, invite_code, topic, dispute_type, status, expires_at, analysis_error, analysis_lease_until",
    )
    .eq("id", roomId)
    .maybeSingle()

  if (roomError) {
    if (isMissingAnalysisColumnsError(roomError)) {
      return Response.json(
        {
          error: "数据库尚未执行分析迁移，请管理员执行迁移",
          code: "analysis_migration_missing",
          retryable: false,
        },
        { status: 503 },
      )
    }
    return Response.json({ error: "查询房间失败" }, { status: 500 })
  }
  if (!room || new Date(room.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
  }

  const [{ data: participants, error: participantsError }, { data: statements, error: statementsError }] =
    await Promise.all([
      supabase
        .from("participants")
        .select("side, display_name, joined_at")
        .eq("room_id", roomId)
        .order("side"),
      supabase
        .from("statements")
        .select("side, content, submitted_at")
        .eq("room_id", roomId),
    ])

  if (participantsError || statementsError) {
    return Response.json({ error: "查询房间数据失败" }, { status: 500 })
  }

  const myStatement = statements?.find((item) => item.side === me.side)
  const otherSubmitted = Boolean(
    statements?.some((item) => item.side !== me.side),
  )
  const leaseActive = Boolean(
    room.analysis_lease_until &&
      new Date(room.analysis_lease_until).getTime() > Date.now(),
  )

  const response: RoomStateResponse = {
    room: {
      id: room.id,
      inviteCode: room.invite_code,
      topic: room.topic,
      disputeType: room.dispute_type,
      status: room.status,
      expiresAt: room.expires_at,
    },
    me: {
      side: me.side,
      displayName: me.display_name,
      joinedAt: participants?.find((p) => p.side === me.side)?.joined_at ?? "",
    },
    participants: (participants ?? []).map((p) => ({
      side: p.side,
      displayName: p.display_name,
      joinedAt: p.joined_at,
    })),
    myStatement: myStatement
      ? { content: myStatement.content, submittedAt: myStatement.submitted_at }
      : null,
    otherSubmitted,
    analysis: {
      errorCode: room.analysis_error ?? null,
      leaseActive,
      canRetry: room.status === "analyzing" && !leaseActive,
      reportReady: room.status === "completed",
    },
  }

  return Response.json(response)
}
