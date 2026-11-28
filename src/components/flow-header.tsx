import { Check, LockKeyhole } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RoomMode } from "@/lib/room-types"

export type FlowStage =
  | "statement"
  | "waiting"
  | "feedback"
  | "analysis"
  | "agreement"

const stages: { key: FlowStage; label: string }[] = [
  { key: "statement", label: "独立陈述" },
  { key: "waiting", label: "等待交卷" },
  { key: "feedback", label: "阅卷" },
  { key: "analysis", label: "宣读" },
  { key: "agreement", label: "和解报告" },
]

const teacherLabels: Record<FlowStage, string> = {
  statement: "分别表达",
  waiting: "等待对方",
  feedback: "梳理想法",
  analysis: "一起回顾",
  agreement: "下一步",
}

type FlowHeaderProps = {
  current: FlowStage
  inviteCode: string
  topic: string
  relation?: string
  bothSubmitted: boolean
  className?: string
  mode?: RoomMode
}

/**
 * 庭审各页共用的房间信息和进度。
 * 纯展示组件，不读客户端状态，可在 Server / Client Component 中复用。
 */
export function FlowHeader({
  current,
  inviteCode,
  topic,
  relation,
  bothSubmitted,
  className,
  mode = "court",
}: FlowHeaderProps) {
  const currentIndex = stages.findIndex((stage) => stage.key === current)

  return (
    <div className={cn("mb-7", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cocoa-500">
        <span>房间 <strong className="font-mono tracking-wide text-cocoa-800">{inviteCode}</strong></span>
        {relation && <span>{relation}</span>}
        <span className="inline-flex items-center gap-1.5">
          {bothSubmitted ? <Check size={15} aria-hidden="true" /> : <LockKeyhole size={15} aria-hidden="true" />}
          {mode === "teacher"
            ? (bothSubmitted ? "已收到两张纸条" : "纸条原文互不可见")
            : (bothSubmitted ? "双方已提交" : "陈述互不可见")}
        </span>
      </div>

      {topic ? (
        <h1 className="display-heading mt-3 text-2xl leading-snug sm:text-3xl">
          {topic}
        </h1>
      ) : null}

      <ol aria-label="调解进度" className="mt-4 grid grid-cols-5 gap-x-1.5 sm:gap-x-2">
        {stages.map((stage, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          return (
            <li
              key={stage.key}
              aria-current={active ? "step" : undefined}
              className={cn(
                "border-t-2 px-0.5 pt-2 text-xs text-cocoa-500",
                active && "border-tang-500 font-bold text-tang-700",
                done && "border-tang-300",
              )}
            >
              {mode === "teacher" ? teacherLabels[stage.key] : stage.label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
