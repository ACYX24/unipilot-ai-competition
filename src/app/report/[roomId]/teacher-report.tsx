"use client"

import { useState } from "react"
import { ChevronDown, MessageCircle, NotebookPen } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { TeacherScene } from "@/components/teacher-scene"
import type { RoomReportResponse, Side } from "@/lib/room-types"
import { TaskChecklist } from "./task-checklist"

export function TeacherReport({ reportData, viewerSide }: {
  reportData: RoomReportResponse
  viewerSide: Side
}) {
  const { report, inviteCode } = reportData
  const [action, setAction] = useState<number | null>(null)
  const [completedTasks, setCompletedTasks] = useState(() => report.funTasks.map(() => false))

  function toggleTask(index: number) {
    setCompletedTasks(prev => prev.map((done, i) => i === index ? !done : done))
  }

  return (
    <div className="court-layout teacher-layout teacher-report">
      <FlowHeader
        mode="teacher"
        current={action === null ? "analysis" : "agreement"}
        inviteCode={inviteCode}
        topic={report.topic}
        bothSubmitted
      />
      <TeacherScene
        phase="report"
        seats={report.summaries.map(({ side, name }) => ({ side, name, submitted: true, isMe: side === viewerSide }))}
      />
      <section className="teacher-report-page teacher-report-overview" aria-labelledby="teacher-perspectives">
        <div className="teacher-observation">
          <h2 id="teacher-perspectives"><MessageCircle aria-hidden="true" size={23} /> 各自怎么想</h2>
          <p>{report.overallComment}</p>
        </div>
        <div className="teacher-perspectives">
          {report.summaries.map(person => {
            const emotions = report.emotions.find(item => item.side === person.side)
            return (
              <article key={person.side} data-side={person.side}>
                <h3>{person.name}</h3>
                <p>{person.text}</p>
                {emotions && (
                  <>
                    <p className="teacher-context"><strong>可能的感受</strong> {emotions.tags.join("、")}</p>
                    <p className="teacher-context"><strong>在意的事</strong> {emotions.needs.join("、")}</p>
                  </>
                )}
              </article>
            )
          })}
        </div>
        <details className="teacher-details">
          <summary>哪里可能听岔了 <ChevronDown size={18} aria-hidden="true" /></summary>
          <ul>
            {report.misunderstandings.map((item, index) => (
              <li key={index}><h3>{item.title}</h3><p>{item.detail}</p></li>
            ))}
          </ul>
          <p className="teacher-context"><strong>可能的共同点</strong> {report.commonNeeds.join("、")}</p>
        </details>
      </section>
      <section className="teacher-report-page" aria-labelledby="teacher-practice">
        <h2 id="teacher-practice"><NotebookPen aria-hidden="true" size={23} /> 下次试试怎么说</h2>
        <fieldset className="teacher-practice">
          <legend>挑一个你愿意试的小行动</legend>
          {report.suggestions.map((suggestion, index) => (
            <label key={index}>
              <input
                type="radio"
                name="teacher-action"
                checked={index === action}
                onChange={() => setAction(index)}
              />
              <span><strong>{suggestion.title}</strong><small>{suggestion.detail}</small></span>
            </label>
          ))}
        </fieldset>
        <p role="status" className="teacher-practice-feedback">
          {action === null ? "选择只记在当前页面，你们可以按自己的节奏来。" : "已选好。可以先问对方愿不愿意试一下。"}
        </p>
        <details className="teacher-details">
          <summary>一起做个小练习 <ChevronDown size={18} aria-hidden="true" /></summary>
          <TaskChecklist tasks={report.funTasks} completed={completedTasks} onToggle={toggleTask} />
        </details>
      </section>
      <p className="teacher-report-footer">这份回顾由 AI 辅助整理，双方看到的内容相同。你们可以补充或修正各自的理解。</p>
    </div>
  )
}
