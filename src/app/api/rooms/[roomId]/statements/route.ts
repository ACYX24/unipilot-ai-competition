import { z } from "zod"
import {
  authenticateParticipant,
  isValidRoomId,
  readAccessToken,
} from "@/lib/server/room-auth"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"
import { isMissingFunctionError } from "@/lib/server/supabase-errors"

const statementSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "观点内容不能为空")
    .max(2000, "观点最多 2000 字"),
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

  // 保存陈述与推进房间状态在同一数据库事务内完成
  const { data, error } = await supabase.rpc("submit_room_statement", {
    p_room_id: roomId,
    p_side: me.side,
    p_content: parsed.data.content,
  })

  if (error) {
    if (isMissingFunctionError(error, ["submit_room_statement"])) {
      return Response.json(
        {
          error: "数据库尚未执行陈述提交迁移，请管理员执行迁移",
          code: "statement_migration_missing",
          retryable: false,
        },
        { status: 503 },
      )
    }

    const message = error.message ?? ""
    if (message.includes("room_not_accepting_statements")) {
      return Response.json(
        { error: "双方观点已提交完成，不能再修改", code: "statements_closed" },
        { status: 409 },
      )
    }
    if (message.includes("room_not_found")) {
      return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
    }
    if (message.includes("invalid_side") || message.includes("empty_content")) {
      return Response.json({ error: "输入不合法" }, { status: 400 })
    }

    return Response.json({ error: "提交失败，请稍后重试" }, { status: 500 })
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row.status !== "string") {
    return Response.json({ error: "提交失败，请稍后重试" }, { status: 500 })
  }

  return Response.json(
    {
      ok: true,
      status: row.status,
      alreadySubmitted: !row.inserted,
    },
    { status: row.inserted ? 201 : 200 },
  )
}
