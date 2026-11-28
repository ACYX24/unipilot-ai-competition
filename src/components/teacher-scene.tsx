import { BookOpen, Check, NotepadText, StickyNote } from "lucide-react"
import type { RoomSeat } from "@/lib/room-types"
import { TeacherOffice, type OfficeAction } from "./teacher-office-art"

const guidance = {
  statement: { title: "写一张小纸条给猫老师", text: "可以从一个具体的片段说起。那时你在意的是什么？" },
  waiting: { title: "猫老师收到了你的小纸条", text: "给对方一点时间，两张纸条都递到桌上后，老师会一起读。" },
  ready: { title: "猫老师收到了两张小纸条", text: "整理开始后，我们会从各自的感受和期待里找线索。" },
  sorting: { title: "猫老师正在读两张小纸条", text: "先听清双方在意的事，再找可能听岔的地方。" },
  report: { title: "来一起回看这段对话", text: "先读两边的想法，再选一个下次愿意试的小行动。" },
}

export function TeacherScene({ phase, seats }: {
  phase: keyof typeof guidance
  seats: RoomSeat[]
}) {
  const { title, text } = guidance[phase]
  const action: OfficeAction = phase === "report" ? "sharing" : phase === "sorting" ? "organizing" : "listening"

  return (
    <section className="teacher-scene" data-teacher-phase={phase} aria-label="猫老师的办公室">
      <div className="teacher-scene-heading"><BookOpen size={17} aria-hidden="true" /> 猫老师的办公室</div>
      <TeacherOffice seats={seats} action={action} />
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
      </div>
    </section>
  )
}
