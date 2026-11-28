import { BookOpen, Check, NotepadText, StickyNote } from "lucide-react"
import type { RoomSeat } from "@/lib/room-types"
import { TeacherOffice, type OfficeAction, type OfficeSupplement } from "./teacher-office-art"

const guidance = {
  statement: { title: "先写下你这一边的想法", text: "从一个具体的片段说起就好。那时你最在意什么？" },
  waiting: { title: "给另一位一点时间", text: "你的纸条已经收到。等另一位也写完，我们再把两边的想法放在一起看。" },
  ready: { title: "两边的想法都收到了", text: "接下来会整理各自在意的地方，以及可能需要再确认的细节。" },
  sorting: { title: "猫老师正在梳理两边的想法", text: "先理清各自在意的事，再找可能听岔的地方。" },
  report: { title: "一起回顾这次沟通", text: "看看两边有没有被准确理解，再决定下次愿意试什么。" },
  closing: { title: "给下一次谈话留个起点", text: "你可以把选中的做法带到下次谈话，先问问另一位的想法。" },
}

export function TeacherScene({ phase, seats, supplement, actions }: {
  phase: keyof typeof guidance
  seats: RoomSeat[]
  supplement?: OfficeSupplement | null
  actions?: React.ReactNode
}) {
  const { title, text } = guidance[phase]
  const action: OfficeAction = phase === "report" ? "sharing"
    : phase === "closing" ? "closing"
    : phase === "sorting" ? "organizing"
    : phase === "statement" ? "listening" : "waiting"

  return (
    <section className="teacher-scene" data-teacher-phase={phase} aria-label="猫老师的办公室">
      <div className="teacher-scene-heading"><BookOpen size={17} aria-hidden="true" /> 猫老师的办公室</div>
      <TeacherOffice seats={seats} action={action} supplement={supplement} />
      <div className="teacher-scene-body">
        <div className="teacher-scene-guide" role="status">
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <ul className="teacher-note-status" aria-label="双方到场与小纸条">
          {seats.map(seat => {
            const status = seat.joined === false ? "还没进门" : seat.submitted ? "老师已收到" : "还没交纸条"
            const Icon = seat.submitted ? Check : seat.isMe ? NotepadText : StickyNote
            return (
              <li key={seat.side} data-submitted={seat.submitted}>
                <Icon size={17} aria-hidden="true" />
                <span><strong>{seat.joined === false ? "对方" : seat.name}</strong>{seat.isMe ? "（我）" : ""}</span>
                <small>{status}</small>
              </li>
            )
          })}
        </ul>
        {actions}
      </div>
    </section>
  )
}
