import type { RoomStateResponse } from "./room-types"

/** 房间阶段：与数据库 status 解耦，由服务端返回的 state 在前端推导 */
export type RoomPhase =
  | "statement"
  | "waiting"
  | "feedback"
  | "analysis"
  | "interaction"
  | "agreement"

/**
 * 由现有 `/api/rooms/[roomId]/state` 的字段推导当前阶段。
 *
 * 现阶段（PR3）只覆盖到 feedback：
 * - 我方未提交 → statement
 * - 我方已提交、对方未提交 → waiting
 * - 双方均已提交 → feedback（AI 反馈由 PR5 接入报告接口后继续往后推进）
 *
 * TODO(PR5)：报告接口可用后，根据 report 状态补齐 analysis / interaction / agreement。
 */
export function derivePhase(state: RoomStateResponse): RoomPhase {
  if (!state.myStatement) return "statement"
  if (!state.otherSubmitted) return "waiting"
  return "feedback"
}

/** 阶段顺序，用于页面守卫（阶段未到则回退） */
const PHASE_ORDER: RoomPhase[] = [
  "statement",
  "waiting",
  "feedback",
  "analysis",
  "interaction",
  "agreement",
]

export function phaseAtLeast(current: RoomPhase, required: RoomPhase): boolean {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(required)
}
