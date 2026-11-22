import { z } from "zod"
import {
  authenticateParticipant,
  isValidRoomId,
  readAccessToken,
} from "@/lib/server/room-auth"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"

const statementSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "观点内容不能为空")
    .max(5000, "观点最多 5000 字"),
})

export async function POST(
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 })
  }

  const parsed = statementSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdmin()
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, status, expires_at")
    .eq("id", roomId)
    .maybeSingle()

  if (roomError) {
    return Response.json({ error: "查询房间失败" }, { status: 500 })
  }
  if (!room || new Date(room.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
  }
  if (room.status !== "waiting" && room.status !== "collecting") {
    return Response.json(
      { error: "双方观点已提交完成，不能再修改" },
      { status: 409 },
    )
  }

  // 本阶段不支持修改：每侧只能提交一次，数据库 unique(room_id, side) 兜底
  const { error: insertError } = await supabase.from("statements").insert({
    room_id: roomId,
    side: me.side,
    content: parsed.data.content,
  })

  if (insertError) {
    if (insertError.code === "23505") {
      return Response.json(
        { error: "你已经提交过观点，暂不支持修改" },
        { status: 409 },
      )
    }
    return Response.json({ error: "提交失败，请稍后重试" }, { status: 500 })
  }

  const { count, error: countError } = await supabase
    .from("statements")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId)

  if (countError) {
    return Response.json({ error: "查询提交状态失败" }, { status: 500 })
  }

  let status = room.status
  if (count === 2) {
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ status: "analyzing" })
      .eq("id", roomId)
      .eq("status", "collecting")

    if (updateError) {
      return Response.json({ error: "更新房间状态失败" }, { status: 500 })
    }
    status = "analyzing"
  }

  return Response.json({ ok: true, status }, { status: 201 })
}
