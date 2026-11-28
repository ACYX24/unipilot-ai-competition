"use client"

import { useId } from "react"
import type { Side } from "@/lib/room-types"
import { Button } from "@/components/ui/button"

const opposite = { A: "B", B: "A" } as const
const routes = {
  A: { launch: [247, 354], middle: [474, 146], landing: [702, 399], tilt: 7 },
  B: { launch: [760, 350], middle: [528, 144], landing: [296, 399], tilt: -7 },
} as const

export function CourtTomato({ from }: { from: Side }) {
  const paint = useId()
  const { launch, middle, landing, tilt } = routes[from]
  const arc = `M${launch.join(" ")} Q${middle.join(" ")} ${landing.join(" ")}`
  const flight = `M0 0 Q${middle[0] - launch[0]} ${middle[1] - launch[1]} ${landing[0] - launch[0]} ${landing[1] - launch[1]}`

  return (
    <svg
      className="scene-props court-tomato"
      viewBox="0 0 1000 500"
      data-from={from}
      data-to={opposite[from]}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={paint} cx="31%" cy="26%" r="71%">
          <stop stopColor="#ea986a" /><stop offset=".48" stopColor="#c95c48" /><stop offset="1" stopColor="#a14338" />
        </radialGradient>
      </defs>
      <path className="court-tomato-trace" d={arc} pathLength="1" fill="none" stroke="#ffe8bf" strokeWidth="3" strokeDasharray=".021 .033" strokeLinecap="round" />
      <g transform={`translate(${launch.join(" ")})`}>
        <g className="court-tomato-flight">
          <animateMotion path={flight} begin="0.16s" dur="0.7s" rotate="auto" fill="freeze" />
          <g transform="translate(-19 -19)">
            <g className="court-tomato-fruit">
              <path d="M19 11c8-4 15 1 15 9 0 7-6 12-15 13C10 32 4 27 4 20c0-8 7-13 15-9Z" fill={`url(#${paint})`} stroke="#8d4138" strokeWidth="1" />
              <path d="m19 12-7-4 6 1 3-5 1 6 6-1-6 5-2 4Z" fill="#4d704e" />
              <path d="M10 19q0-4 5-5" fill="none" stroke="#f0ab83" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>
      <g transform={`translate(${landing.join(" ")}) rotate(${tilt})`}>
        <g className="court-tomato-splat">
          <ellipse rx="32" ry="8" fill="#5f381e" opacity=".27" />
          <path d="M-30-3q-11-6 4-6l12 2-3-6q3-4 11 0l6 5 8-6q10-5 13 0l-5 5 13-1q14 2 7 7l-13 2 5 6q0 3-8 1L7 2 0 8q-10 4-14 0l5-5-14 3q-11-1-7-5l5-2Z" fill="#b94b3b" />
          <path d="M-17-5q19-4 36 2" fill="none" stroke="#eb956c" strokeWidth="2" strokeLinecap="round" opacity=".8" />
          <ellipse cx="35" cy="1" rx="5" ry="2" fill="#bd5643" />
          <ellipse cx="-36" cy="-7" rx="4" ry="2" fill="#bd5643" />
          <ellipse cx="18" cy="-16" rx="4" ry="2.2" fill="#d57456" />
        </g>
      </g>
    </svg>
  )
}

export function VerdictReactions({ from, thrown, onThrow }: {
  from: Side
  thrown: boolean
  onThrow: () => void
}) {
  return (
    <div className="court-scene-reaction">
      <Button type="button" variant="outline" size="sm" onClick={onThrow}>丢番茄</Button>
      <p role="status">
        {thrown ? `${from} 方丢向 ${opposite[from]} 方桌前。仅本机可见。` : "抛向对方桌前，仅本机可见。"}
      </p>
    </div>
  )
}
