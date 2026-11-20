import type {
  ApiError,
  CreateRoomResponse,
  JoinRoomResponse,
  RoomStateResponse,
} from "./room-types"

async function readResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & ApiError
  if (!response.ok) {
    throw new Error(data.error ?? "请求失败，请稍后重试")
  }
  return data
}

export async function createRoom(input: {
  topic: string
  disputeType: string
  displayName: string
}) {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return readResponse<CreateRoomResponse>(response)
}

export async function joinRoom(input: {
  inviteCode: string
  displayName: string
}) {
  const response = await fetch("/api/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return readResponse<JoinRoomResponse>(response)
}

export async function fetchRoomState(roomId: string, accessToken: string) {
  const response = await fetch(`/api/rooms/${roomId}/state`, {
    headers: { "x-participant-token": accessToken },
    cache: "no-store",
  })
  return readResponse<RoomStateResponse>(response)
}

export async function submitStatement(
  roomId: string,
  accessToken: string,
  content: string,
) {
  const response = await fetch(`/api/rooms/${roomId}/statements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-participant-token": accessToken,
    },
    body: JSON.stringify({ content }),
  })
  return readResponse<{ ok: true; status: string }>(response)
}
