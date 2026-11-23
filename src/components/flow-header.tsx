import { Check, LockKeyhole } from "lucide-react"
import { cn } from "@/lib/utils"

export type FlowStage =
  | "statement"
  | "waiting"
  | "feedback"
  | "analysis"
  | "interaction"
  | "agreement"

const stages: { key: FlowStage; label: string }[] = [
  { key: "statement", label: "独立陈述" },
  { key: "waiting", label: "等待提交" },
  { key: "feedback", label: "调解报告" },
  { key: "analysis", label: "观点转述" },
  { key: "interaction", label: "互动环节" },
  { key: "agreement", label: "改善约定" },
]

type FlowHeaderProps = {
  current: FlowStage
  inviteCode: string
  topic: string
  relation?: string
  bothSubmitted: boolean
  className?: string
}

/**
 * 房间页共用头部：房间信息 + 六阶段进度。
 * 纯展示组件，不读客户端状态，可在 Server / Client Component 中复用。
 */
export function FlowHeader({
  current,
  inviteCode,
  topic,
  relation,
  bothSubmitted,
  className,
}: FlowHeaderProps) {
  const currentIndex = stages.findIndex((stage) => stage.key === current)

  return (
    <div className={cn("mb-7", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cocoa-500">
        <span>房间 <strong className="font-mono tracking-wide text-cocoa-800">{inviteCode}</strong></span>
        {relation && <span>{relation}</span>}
        <span className="inline-flex items-center gap-1.5">
          {bothSubmitted ? <Check size={15} aria-hidden="true" /> : <LockKeyhole size={15} aria-hidden="true" />}
          {bothSubmitted ? "双方已提交" : "陈述互不可见"}
        </span>
      </div>

      {topic ? (
        <h1 className="display-heading mt-3 text-2xl leading-snug sm:text-3xl">
          {topic}
        </h1>
      ) : null}

      <ol aria-label="调解进度" className="mt-5 grid grid-cols-3 gap-x-2 gap-y-2.5 sm:grid-cols-6">
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
              {stage.label}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
