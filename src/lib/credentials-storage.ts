import type { ParticipantCredentials } from "./room-types"

const STORAGE_PREFIX = "cat-mediator:credentials:"

export function saveCredentials(credentials: ParticipantCredentials) {
  localStorage.setItem(
    STORAGE_PREFIX + credentials.roomId,
    JSON.stringify(credentials),
  )
}

export function loadCredentials(
  roomId: string,
): ParticipantCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + roomId)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ParticipantCredentials
    if (parsed.roomId !== roomId || !parsed.accessToken) return null
    return parsed
  } catch {
    return null
  }
}
