import { z } from "zod"
import { DISPUTE_TYPES } from "@/lib/room-types"
import {
  generateAccessToken,
  generateInviteCode,
  hashAccessToken,
} from "@/lib/server/credentials"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"

const createRoomSchema = z.object({
  topic: z.string().trim().min(1, "请填写争议话题").max(200, "话题最多 200 字"),
  disputeType: z.enum(DISPUTE_TYPES),
  displayName: z.string().trim().min(1, "请填写昵称").max(30, "昵称最多 30 字"),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 })
  }

  const parsed = createRoomSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    )
  }

  const { topic, disputeType, displayName } = parsed.data
  const supabase = createSupabaseAdmin()

  // 邀请码唯一冲突时重试，最多 5 次
  let room: { id: string; invite_code: string } | null = null
  for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
    const { data, error } = await supabase
      .from("rooms")
      .insert({ topic, dispute_type: disputeType, invite_code: generateInviteCode() })
      .select("id, invite_code")
      .single()

    if (!error) {
      room = data
    } else if (error.code !== "23505") {
      return Response.json({ error: "创建房间失败" }, { status: 500 })
    }
  }

  if (!room) {
    return Response.json({ error: "邀请码生成冲突，请重试" }, { status: 500 })
  }

  const accessToken = generateAccessToken()
  const { error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      side: "A",
      display_name: displayName,
      access_token_hash: hashAccessToken(accessToken),
    })

  if (participantError) {
    await supabase.from("rooms").delete().eq("id", room.id)
    return Response.json({ error: "创建参与者失败" }, { status: 500 })
  }

  return Response.json(
    {
      roomId: room.id,
      inviteCode: room.invite_code,
      side: "A",
      accessToken,
    },
    { status: 201 },
  )
}
