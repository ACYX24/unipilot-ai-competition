import { useId } from "react"
import type { RoomStateResponse } from "@/lib/room-types"
import { cn } from "@/lib/utils"

interface CourtPlayer {
  side: "A" | "B"
  name: string
  isMe?: boolean
  joined?: boolean
  submitted: boolean
}

type CourtPhase = "statement" | "waiting" | "ready" | "reading" | "gavel" | "verdict"

const phaseLabel: Record<CourtPhase, string> = {
  statement: "独立陈述",
  waiting: "等待交卷",
  ready: "双方已交卷",
  reading: "判判猫正在阅卷",
  gavel: "敲槌开读",
  verdict: "宣读调解意见",
}

export function courtPlayers(state: RoomStateResponse) {
  function player(side: CourtPlayer["side"]): CourtPlayer {
    const isMe = state.me.side === side
    const participant = isMe ? state.me : state.participants.find((item) => item.side === side)

    return {
      side,
      name: participant?.displayName ?? "空席",
      isMe,
      joined: Boolean(participant),
      submitted: isMe ? Boolean(state.myStatement) : state.otherSubmitted,
    }
  }

  return { left: player("A"), right: player("B") }
}

function Judge({ phase, portraitClip }: { phase: CourtPhase; portraitClip: string }) {
  return (
    <>
      <image
        href="/mascots/court-judge.webp"
        x="376"
        y={phase === "reading" ? 102 : 100}
        width="148"
        height="143"
        preserveAspectRatio="xMidYMax meet"
        clipPath={portraitClip}
      />

      <path d="M403 230q23-6 46-3 22-3 47 3l-3 2q-24-2-44 3-21-5-45-3Z" fill="#79462f" opacity=".45" />
      <path d="M404 226q7-14 21-13l12 8-3 10h-23Z" fill="#e3ac74" stroke="#b27a50" strokeWidth="1.3" />
      <path className="court-reading-paw" d="M491 226q-7-14-21-13l-12 8 3 10h23Z" fill="#e3ac74" stroke="#b27a50" strokeWidth="1.3" />
      <path d="M449 219q-22-9-38-2l-6 12q24-3 44 3 20-6 44-3l-6-12q-16-7-38 2Z" fill="#f9e8be" stroke="#b78b59" strokeWidth="1.2" />
      <path d="M449 220v10m-34-8q8-1 18 2m-19 1q9-1 17 1m35-2q9-3 16-2m-15 4 13-1" fill="none" stroke="#c7a477" strokeWidth="1" strokeLinecap="round" />
      <g className="court-turn-page">
        <path d="M450 229q-9-26-35-27l-4 10q22 2 39 17Z" fill="#fff1cd" stroke="#bd9568" strokeWidth="1.2" />
        <path d="M416 207q14 1 24 9" fill="none" stroke="#c7a477" strokeWidth="1" />
      </g>

      <rect x="520" y="230" width="55" height="4" rx="2" fill="#855338" />
      <path className="court-gavel-arm" d="M486 209q20-7 41 0l32 3-4 13-38 2q-17-1-31-6Z" fill="#45563e" stroke="#354431" strokeWidth="1.6" />
      <g transform="translate(544 221)">
        <g className="court-gavel">
          <path d="m-3 1 27-11q4-1 5 2 1 2-2 4L0 6Z" fill="#835237" stroke="#603b29" strokeWidth="1.3" />
          <rect x="-13" y="-7" width="15" height="16" rx="3.5" transform="rotate(-23)" fill="#a96a43" stroke="#603b29" strokeWidth="1.4" />
          <path d="m-12-2 10-4m-7 13 10-4" stroke="#d19a63" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse className="court-gavel-paw" cx="20" cy="-6" rx="9" ry="6" fill="#e3ac74" stroke="#b27a50" strokeWidth="1.3" />
        </g>
        <path className="court-gavel-impact" d="M-15 4l-7-4m8 9-8 2m15 0-2 5" fill="none" stroke="#f9dd8f" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </>
  )
}

function WitnessDesk({ player, portraitClip }: { player: CourtPlayer; portraitClip: string }) {
  const isRight = player.side === "B"

  return (
    <g transform={isRight ? "translate(900 0) scale(-1 1)" : undefined}>
      {player.joined !== false && (
        <image
          href={isRight ? "/mascots/court-lamb.webp" : "/mascots/court-tabby.webp"}
          x={isRight ? 152 : 138}
          y={isRight ? 207 : 206}
          width={isRight ? 106 : 132}
          height="141"
          preserveAspectRatio="xMidYMax meet"
          clipPath={portraitClip}
        />
      )}

      <path d="m264 324 39-2 15 13-43 2Z" fill="#885333" opacity=".38" />
      <path d="m265 322 37-2 14 13-41 2Z" fill={player.submitted ? "#eac68a" : "#f8e8c0"} stroke="#ba8f59" strokeWidth="1" />
      <path d="m277 326 21-1m-17 5 20-1" stroke="#bf9a6b" strokeWidth="1" strokeLinecap="round" />
      {!player.submitted && player.joined !== false && (
        <path d="m270 332 20-11" stroke="#7f553b" strokeWidth="2.3" strokeLinecap="round" />
      )}
    </g>
  )
}

function CourtIllustration({
  left,
  right,
  phase,
}: {
  left: CourtPlayer
  right: CourtPlayer
  phase: CourtPhase
}) {
  const id = useId()
  const benchEdge = `${id}-bench-edge`
  const deskEdge = `${id}-desk-edge`

  return (
    <svg className="court-illustration" viewBox="0 0 900 474" aria-hidden="true">
      <defs>
        {/* The portraits stop at the tabletop edges in the painted backdrop. */}
        <clipPath id={benchEdge}><rect width="900" height="219" /></clipPath>
        <clipPath id={deskEdge}><rect width="900" height="314" /></clipPath>
      </defs>
      <image href="/mascots/court-backdrop.webp" width="900" height="474" preserveAspectRatio="none" />
      <Judge phase={phase} portraitClip={`url(#${benchEdge})`} />
      <WitnessDesk player={left} portraitClip={`url(#${deskEdge})`} />
      <WitnessDesk player={right} portraitClip={`url(#${deskEdge})`} />
    </svg>
  )
}

function SeatLabel({ player }: { player: CourtPlayer }) {
  const status = player.joined === false ? "等待入座" : player.submitted ? "已交卷" : "未交卷"

  return (
    <div className="court-seat-label">
      <span className="court-side">{player.side} 方</span>
      <span className="court-seat-name">{player.name}{player.isMe && <span className="court-me"> 我</span>}</span>
      <span className={cn("court-seat-status", player.submitted && "is-submitted")}>{status}</span>
    </div>
  )
}

export function CourtScene({
  left,
  right,
  phase,
  action,
}: {
  left: CourtPlayer
  right: CourtPlayer
  phase: CourtPhase
  action?: React.ReactNode
}) {
  return (
    <section className="court-scene" data-court-phase={phase} aria-label="猫猫小法庭">
      <div className="court-stage-heading">
        <span className="court-stage-name">猫猫小法庭</span>
        <span className="court-stage-phase">{phaseLabel[phase]}</span>
      </div>
      <CourtIllustration left={left} right={right} phase={phase} />
      <div className="court-seat-labels">
        <SeatLabel player={left} />
        <SeatLabel player={right} />
      </div>
      {action}
    </section>
  )
}
