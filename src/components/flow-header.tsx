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
  { key: "feedback", label: "私人反馈" },
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
    <div className={cn("mb-6", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-tang-100 px-3 py-1 text-xs font-bold text-tang-600">
          房间 {inviteCode}
        </span>
        {relation ? (
          <span className="inline-flex items-center rounded-full bg-blush-300/30 px-3 py-1 text-xs font-bold text-blush-500">
            {relation}
          </span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold",
            bothSubmitted
              ? "bg-matcha-300/30 text-matcha-500"
              : "bg-cream-200 text-cocoa-500",
          )}
        >
          {bothSubmitted ? "双方陈述已完成 ✓" : "陈述互不可见 🔒"}
        </span>
      </div>

      {topic ? (
        <h1 className="mt-3 text-lg font-extrabold leading-snug text-cocoa-800 md:text-2xl">
          ⚖️ {topic}
        </h1>
      ) : null}

      <ol className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
        {stages.map((stage, index) => {
          const done = index < currentIndex
          const active = index === currentIndex
          return (
            <li key={stage.key} className="flex shrink-0 items-center gap-1">
              {index > 0 ? (
                <span
                  className={cn(
                    "h-0.5 w-4 rounded md:w-8",
                    done || active ? "bg-tang-300" : "bg-cream-300",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold",
                  active && "bg-tang-400 text-white shadow-soft",
                  done && "bg-tang-100 text-tang-600",
                  !active && !done && "bg-cream-200 text-cocoa-400",
                )}
              >
                {done ? "✓ " : ""}
                {stage.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
