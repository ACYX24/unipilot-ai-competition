"use client"

import { useState } from "react"
import { ChevronDown, MessageCircle, NotebookPen } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { TeacherScene } from "@/components/teacher-scene"
import type { OfficeSupplement } from "@/components/teacher-office-art"
import { Button } from "@/components/ui/button"
import type { RoomReportResponse, Side } from "@/lib/room-types"
import { TaskChecklist } from "./task-checklist"

const supplementNotes: OfficeSupplement[] = [
  ["这点我真不同意！", "先听我把话说完。"],
  ["这件事我很委屈。", "我也想把话说清。"],
  ["我不是这个意思！", "那个细节很重要。"],
  ["这句话让我不舒服。", "我想先说说原因。"],
]

export function TeacherReport({ reportData, viewerSide }: {
  reportData: RoomReportResponse
  viewerSide: Side
}) {
  const { report, inviteCode } = reportData
  const [action, setAction] = useState<number | null>(null)
  const [supplement, setSupplement] = useState<OfficeSupplement | null>(null)
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
        phase={action === null ? "report" : "closing"}
        supplement={supplement}
        seats={report.summaries.map(({ side, name }) => ({ side, name, submitted: true, isMe: side === viewerSide }))}
        actions={(
          <div className="teacher-supplement">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSupplement(supplement ? null : supplementNotes[Math.floor(Math.random() * supplementNotes.length)])}
            >
              {supplement ? "收起这张便签" : "我还想补两句"}
            </Button>
            <div role="status">
              {supplement ? (
                <blockquote className="teacher-supplement-quote">
                  <span>{supplement[0]}</span>
                  <span>{supplement[1]}</span>
                  <small>示例便签 · 仅本机可见</small>
                </blockquote>
              ) : <p>抽一张示例便签，只在本机展示。</p>}
            </div>
          </div>
        )}
      />
      <section className="teacher-report-page teacher-report-overview" aria-labelledby="teacher-perspectives">
        <div className="teacher-observation">
          <h2 id="teacher-perspectives"><MessageCircle aria-hidden="true" size={23} /> 沟通记录</h2>
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
          <summary>可能的理解差异 <ChevronDown size={18} aria-hidden="true" /></summary>
          <ul>
            {report.misunderstandings.map((item, index) => (
              <li key={index}><h3>{item.title}</h3><p>{item.detail}</p></li>
            ))}
          </ul>
          <p className="teacher-context"><strong>可以一起确认的地方</strong> {report.commonNeeds.join("、")}</p>
        </details>
      </section>
      <section className="teacher-report-page" aria-labelledby="teacher-practice">
        <h2 id="teacher-practice"><NotebookPen aria-hidden="true" size={23} /> 下一步可以试试</h2>
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
