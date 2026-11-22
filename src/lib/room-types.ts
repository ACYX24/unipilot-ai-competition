import type { MediationReport } from "./mediation-report-schema"

export type RoomStatus = "waiting" | "collecting" | "analyzing" | "completed"

export type Side = "A" | "B"

export const DISPUTE_TYPES = [
  "家务分工",
  "今天吃什么",
  "消费观念",
  "时间观念",
  "聊天态度",
  "周末安排",
  "其他小事",
] as const

export interface ParticipantCredentials {
  roomId: string
  side: Side
  accessToken: string
}

export interface ParticipantView {
  side: Side
  displayName: string
  joinedAt: string
}

export interface StatementView {
  content: string
  submittedAt: string
}

export interface RoomAnalysisState {
  errorCode: string | null
  leaseActive: boolean
  canRetry: boolean
  reportReady: boolean
}

export interface RoomStateResponse {
  room: {
    id: string
    inviteCode: string
    topic: string
    disputeType: string
    status: RoomStatus
    expiresAt: string
  }
  me: ParticipantView
  participants: ParticipantView[]
  myStatement: StatementView | null
  otherStatement: StatementView | null
  otherSubmitted: boolean
  analysis: RoomAnalysisState
}

export interface AnalysisResponse {
  status: "analyzing" | "completed"
  reportId?: string
}

export interface RoomReportResponse {
  status: "completed"
  inviteCode: string
  model: string
  generatedAt: string
  report: MediationReport
}

export interface CreateRoomResponse extends ParticipantCredentials {
  inviteCode: string
}

export interface JoinRoomResponse extends ParticipantCredentials {
  inviteCode: string
}

export interface ApiError {
  error: string
}
