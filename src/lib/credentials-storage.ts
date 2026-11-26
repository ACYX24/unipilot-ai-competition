import type { ParticipantCredentials } from "./room-types"

const STORAGE_PREFIX = "cat-mediator:credentials:"

export function saveCredentials(credentials: ParticipantCredentials) {
  localStorage.setItem(
    STORAGE_PREFIX + credentials.roomId,
    JSON.stringify(credentials),
  )
}

export function saveSessionCredentials(credentials: ParticipantCredentials) {
  sessionStorage.setItem(STORAGE_PREFIX + credentials.roomId, JSON.stringify(credentials))
}

export function loadCredentials(
  roomId: string,
): ParticipantCredentials | null {
  try {
    const key = STORAGE_PREFIX + roomId
    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ParticipantCredentials
    if (parsed.roomId !== roomId || !parsed.accessToken) return null
    return parsed
  } catch {
    return null
  }
}
