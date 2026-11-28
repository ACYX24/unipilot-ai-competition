import { BookOpen, Check, NotebookPen, StickyNote } from "lucide-react"
import type { RoomSeat } from "@/lib/room-types"

const guidance = {
  statement: { title: "先写下你的想法", text: "可以从一个具体的片段说起。那时你在意的是什么？" },
  waiting: { title: "你的便笺已经合上", text: "我们给对方一点时间。两份便笺都写好以后，猫老师会一起整理。" },
  ready: { title: "两份便笺都到了", text: "整理开始后，我们会从各自的感受和期待里找线索。" },
  sorting: { title: "猫老师正在整理线索", text: "先听清双方在意的事，再找可能听岔的地方。" },
  report: { title: "来一起回看这段对话", text: "先读两边的想法，再选一个下次愿意试的小行动。" },
}

export function TeacherPortrait() {
  return (
    <span className="teacher-portrait" aria-hidden="true">
      <i className="teacher-ear teacher-ear-left" />
      <i className="teacher-ear teacher-ear-right" />
      <i className="teacher-face"><b /></i>
      <i className="teacher-scarf" />
    </span>
  )
}

export function TeacherScene({ phase, seats }: {
  phase: keyof typeof guidance
  seats: RoomSeat[]
}) {
  const { title, text } = guidance[phase]

  return (
    <section className="teacher-scene" data-teacher-phase={phase} aria-label="猫老师的谈话角">
      <div className="teacher-scene-heading"><BookOpen size={17} aria-hidden="true" /> 猫老师的谈话角</div>
      <div className="teacher-scene-body">
        <div className="teacher-scene-guide">
          <TeacherPortrait />
          <div role="status">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </div>
        <ul className="teacher-notebooks" aria-label="双方便笺">
            {seats.map(seat => {
              const status = seat.joined === false ? "等待加入" : seat.submitted ? "已写好" : "待填写"
              const Icon = seat.submitted ? Check : seat.isMe ? NotebookPen : StickyNote
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
