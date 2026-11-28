import type { RoomSeat, RoomStateResponse, Side } from "@/lib/room-types"
import { CourtScene, type CourtPhase } from "./court-scene"
import { TeacherScene } from "./teacher-scene"

export function RoomScene({ state, phase }: {
  state: RoomStateResponse
  phase: Exclude<CourtPhase, "gavel" | "verdict">
}) {
  function seat(side: Side): RoomSeat {
    const isMe = state.me.side === side
    const participant = isMe ? state.me : state.participants.find((item) => item.side === side)

    return {
      side,
      name: participant?.displayName ?? "空席",
      isMe,
      joined: Boolean(participant),
      submitted: isMe ? Boolean(state.myStatement) : state.otherSubmitted,
    }
  }

  const left = seat("A")
  const right = seat("B")
  return state.room.mode === "teacher"
    ? <TeacherScene seats={[left, right]} phase={phase === "reading" ? "sorting" : phase} />
    : <CourtScene left={left} right={right} phase={phase} />
}
