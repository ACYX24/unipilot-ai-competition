import { hashAccessToken } from "./credentials"
import { createSupabaseAdmin } from "./supabase-admin"

export async function authenticateParticipant(
  roomId: string,
  token: string | null,
) {
  if (!token) return null

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from("participants")
    .select("id, room_id, side, display_name")
    .eq("room_id", roomId)
    .eq("access_token_hash", hashAccessToken(token))
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export function readAccessToken(request: Request) {
  return request.headers.get("x-participant-token")
}

export function isValidRoomId(roomId: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    roomId,
  )
}
