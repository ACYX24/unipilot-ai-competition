import type { RoomSeat } from "@/lib/room-types"
import { ScenePicture } from "./scene-artwork"

export type OfficeAction = "listening" | "waiting" | "organizing" | "sharing" | "closing"

const places = [
  { side: "A", desk: "translate(318 377) rotate(-9)", board: "translate(503 69) rotate(-4)", label: "在意的点" },
  { side: "B", desk: "translate(383 350) rotate(9)", board: "translate(585 68) rotate(3)", label: "理解差异" },
] as const

function BoardPaper({ label, kind }: { label: string; kind?: "next" | "supplement" }) {
  return (
    <g className={kind ? `office-board-paper office-board-${kind}` : "office-board-paper"}>
      <rect className="office-board-shadow" x="1" y="3" width="72" height="43" rx="1.5" />
      <rect className="office-board-stock" width="72" height="43" rx="1.5" />
      <circle className="office-board-pin" cx="36" cy="5" r="2.3" />
      <text x="36" y="22" textAnchor="middle">{label}</text>
      <path d="M13 30h46m-46 5h33" fill="none" className="office-board-rule" />
    </g>
  )
}

export function TeacherOffice({ seats, action, supplement }: {
  seats: readonly RoomSeat[]
  action: OfficeAction
  supplement?: boolean
}) {
  // The room creator always exists. The second chair remains empty until someone joins.
  const guestJoined = seats.some(seat => seat.side === "B" && seat.joined !== false)
  const sharing = action === "sharing" || action === "closing"
  const sorting = action === "organizing"
  const frame = !guestJoined ? "office-arrival"
    : sharing ? "office-sharing"
    : action === "waiting" || sorting ? "office-organizing"
    : "office-listening"
  const showBoard = sorting || sharing

  return (
    <div className="teacher-office scene-stage" data-office-action={action} data-office-frame={frame} aria-hidden="true">
      <div className="scene-frame">
        <ScenePicture frame={frame} eager />
        {action === "listening" && (
          <>
            <div className="office-listen-layer office-listen-head"><ScenePicture frame={frame} eager /></div>
            <div className="office-listen-layer office-listen-pen"><ScenePicture frame={frame} eager /></div>
          </>
        )}
        <svg className="scene-props" viewBox="0 0 1000 500" aria-hidden="true">
          {places.filter(place => seats.some(seat => seat.side === place.side && seat.submitted)).map(place => (
            <g key={place.side} transform={place.desk} className="office-slip" data-side={place.side}>
              <path d="M-24 3l17-11 47-3 6 4-19 13Z" className="office-slip-shadow" />
              <path d="M-25 0l17-11 47-3 6 4-19 13Z" className="office-slip-paper" />
              <path d="M-7-3l23-2m-16-2 20-2" className="office-board-rule" />
            </g>
          ))}

          {showBoard && places.map(place => (
            <g key={place.side} transform={place.board}>
              <g className="office-board-card" data-side={place.side}>
                <BoardPaper label={place.label} />
              </g>
            </g>
          ))}
          {sharing && (
            <g transform="translate(669 65) rotate(-2)">
              <g className="office-shared-card">
                <BoardPaper label={action === "closing" ? "我想试试" : "一起试试"} kind="next" />
              </g>
            </g>
          )}
          {sharing && supplement && (
            <g transform="translate(689 109) rotate(4)">
              <g className="office-supplement-card">
                <BoardPaper label="我的补充" kind="supplement" />
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
