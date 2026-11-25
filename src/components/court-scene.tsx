import { CatAvatar, CatMascot } from "@/components/cat-mascot"
import { cn } from "@/lib/utils"

export interface CourtPlayer {
  side: "A" | "B"
  name: string
  isMe?: boolean
  joined?: boolean
  submitted: boolean
}

function CourtSeat({
  player,
  align,
}: {
  player: CourtPlayer
  align: "left" | "right"
}) {
  const status = player.joined === false
    ? "等待入座"
    : player.submitted
      ? "已提交"
      : "未提交"

  return (
    <div className={cn("court-seat", `court-seat-${align}`)}>
      <span className="court-avatar">
        <CatAvatar tone={player.side === "A" ? "orange" : "blue"} />
      </span>
      <p className="court-name">
        {player.name}
        {player.isMe ? <span className="court-me">我</span> : null}
      </p>
      <span
        className={cn(
          "court-chip",
          status === "已提交" && "is-submitted",
          status === "等待入座" && "is-waiting",
        )}
      >
        {status}
      </span>
    </div>
  )
}

/**
 * 纯展示的猫猫小法庭席位：A 在左、B 在右、判判猫主审居中。
 * 只接收已经决定好的展示状态，不读取陈述正文，也不发起请求。
 */
export function CourtScene({
  left,
  right,
  reading = false,
  label,
  className,
}: {
  left: CourtPlayer
  right: CourtPlayer
  reading?: boolean
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn("court-scene", reading && "is-reading", className)}
      role="group"
      aria-label={reading ? "判判猫正在阅卷" : "猫猫小法庭席位"}
    >
      <CourtSeat player={left} align="left" />

      <div className="court-judge">
        <div className="court-papers" aria-hidden="true">
          <span className="court-paper court-paper-back" />
          <span className="court-paper court-paper-middle" />
          <span className="court-paper court-paper-front" />
        </div>
        <div className="court-judge-avatar">
          <CatMascot variant="judge" />
        </div>
        <p className="court-role">判判猫 · 主审</p>
        {reading ? <p className="court-reading">正在阅卷</p> : null}
      </div>

      <CourtSeat player={right} align="right" />

      {label ? <p className="court-caption">{label}</p> : null}
    </div>
  )
}