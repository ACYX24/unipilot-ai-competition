import { z } from "zod"
import {
  generateAccessToken,
  hashAccessToken,
} from "@/lib/server/credentials"
import { getClientIp, isRateLimited } from "@/lib/server/rate-limit"
import { createSupabaseAdmin } from "@/lib/server/supabase-admin"

const joinRoomSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,12}$/, "邀请码格式不正确"),
  displayName: z.string().trim().min(1, "请填写昵称").max(30, "昵称最多 30 字"),
})

export async function POST(request: Request) {
  // 邀请码加入接口限流：每 IP 5 分钟最多 10 次，防止爆破邀请码
  if (
    isRateLimited({
      key: `join:${getClientIp(request)}`,
      limit: 10,
      windowMs: 5 * 60 * 1000,
    })
  ) {
    return Response.json(
      { error: "尝试过于频繁，请 5 分钟后再试" },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 })
  }

  const parsed = joinRoomSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    )
  }

  const inviteCode = parsed.data.inviteCode.toUpperCase()
  const { displayName } = parsed.data
  const supabase = createSupabaseAdmin()

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, invite_code, status, expires_at, mode")
    .eq("invite_code", inviteCode)
    .maybeSingle()

  if (roomError) {
    return Response.json({ error: "查询房间失败" }, { status: 500 })
  }

  // 不存在与已过期返回同样的信息，避免泄露房间是否存在
  if (!room || new Date(room.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "房间不存在或已过期" }, { status: 404 })
  }

  const { count, error: countError } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("room_id", room.id)

  if (countError) {
    return Response.json({ error: "查询参与者失败" }, { status: 500 })
  }

  if ((count ?? 0) >= 2) {
    return Response.json(
      { error: "该房间已有两名参与者，无法加入" },
      { status: 409 },
    )
  }

  const accessToken = generateAccessToken()
  const { error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      side: "B",
      display_name: displayName,
      access_token_hash: hashAccessToken(accessToken),
    })

  if (participantError) {
    // unique(room_id, side) 冲突说明并发加入时 B 位已被占用
    if (participantError.code === "23505") {
      return Response.json(
        { error: "该房间已有两名参与者，无法加入" },
        { status: 409 },
      )
    }
    return Response.json({ error: "加入房间失败" }, { status: 500 })
  }

  const { error: statusError } = await supabase
    .from("rooms")
    .update({ status: "collecting" })
    .eq("id", room.id)
    .eq("status", "waiting")

  if (statusError) {
    return Response.json({ error: "更新房间状态失败" }, { status: 500 })
  }

  return Response.json(
    { roomId: room.id, inviteCode: room.invite_code, mode: room.mode, side: "B", accessToken },
    { status: 201 },
  )
}
