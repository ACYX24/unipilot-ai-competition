import type {
  AnalysisResponse,
  ApiError,
  CreateRoomResponse,
  JoinRoomResponse,
  RoomMode,
  RoomReportResponse,
  RoomStateResponse,
} from "./room-types"

interface ErrorBody extends ApiError {
  code?: string
  retryable?: boolean
}

let roomApiOrigin = ""

export function configureRoomApiOrigin(origin: string) {
  roomApiOrigin = origin
}

export class RoomApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly retryable = false,
  ) {
    super(message)
    this.name = "RoomApiError"
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  let data: (T & ErrorBody) | null = null
  try {
    data = (await response.json()) as T & ErrorBody
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new RoomApiError(
      data?.error ?? "请求失败，请稍后重试",
      response.status,
      data?.code,
      data?.retryable ?? false,
    )
  }

  if (!data) {
    throw new RoomApiError("服务器响应格式错误", response.status)
  }

  return data
}

export async function createRoom(input: {
  topic: string
  disputeType: string
  displayName: string
  mode?: RoomMode
}) {
  const response = await fetch(`${roomApiOrigin}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const room = await readResponse<CreateRoomResponse>(response)
  if (input.mode === "teacher" && room.mode !== "teacher") {
    throw new RoomApiError("猫老师房间暂不可用，请稍后再试。", 503, "room_mode_unavailable")
  }
  return room
}

export async function joinRoom(input: {
  inviteCode: string
  displayName: string
}) {
  const response = await fetch(`${roomApiOrigin}/api/rooms/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  return readResponse<JoinRoomResponse>(response)
}

export async function fetchRoomState(roomId: string, accessToken: string) {
  const response = await fetch(`${roomApiOrigin}/api/rooms/${roomId}/state`, {
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
  const response = await fetch(`${roomApiOrigin}/api/rooms/${roomId}/statements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-participant-token": accessToken,
    },
    body: JSON.stringify({ content }),
  })
  return readResponse<{ ok: true; status: string }>(response)
}

export async function generateRoomAnalysis(
  roomId: string,
  accessToken: string,
) {
  const response = await fetch(`${roomApiOrigin}/api/rooms/${roomId}/analysis`, {
    method: "POST",
    headers: { "x-participant-token": accessToken },
    cache: "no-store",
  })
  return readResponse<AnalysisResponse>(response)
}

export async function fetchRoomReport(roomId: string, accessToken: string) {
  const response = await fetch(`${roomApiOrigin}/api/rooms/${roomId}/report`, {
    headers: { "x-participant-token": accessToken },
    cache: "no-store",
  })
  return readResponse<RoomReportResponse>(response)
}
