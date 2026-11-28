"use client"

import { useId, useState } from "react"
import { Button } from "@/components/ui/button"

export function VerdictReactions({
  judgeBoard,
  next,
}: {
  judgeBoard: React.ReactNode
  next?: React.ReactNode
}) {
  const [round, setRound] = useState(0)
  const tomatoPaint = useId()

  return (
    <>
      <div className="court-verdict-board">
        {judgeBoard}
        {round > 0 && (
          <svg key={round} className="court-tomato" viewBox="0 0 38 38" aria-hidden="true">
            <defs>
              <radialGradient id={tomatoPaint} cx="31%" cy="26%" r="71%">
                <stop stopColor="#ea986a" /><stop offset=".48" stopColor="#c95c48" /><stop offset="1" stopColor="#a14338" />
              </radialGradient>
            </defs>
            <g className="court-tomato-splat" fill="#b85143">
              <path d="M8 15q-4-5 1-6 5-1 6 4 5-3 9 2 4-5 6-3 2 3-3 7 6 1 5 5-2 4-7 0 2 8-3 8-4 0-4-7-7 5-9 1-3-4 4-7-10 2-9-2 0-3 4-2Z" />
              <circle cx="27" cy="6" r="2.3" />
              <circle cx="6" cy="28" r="1.8" />
              <circle cx="34" cy="12" r="1.5" />
            </g>
            <g className="court-tomato-fruit">
              <path d="M19 11c8-4 15 1 15 9 0 7-6 12-15 13C10 32 4 27 4 20c0-8 7-13 15-9Z" fill={`url(#${tomatoPaint})`} stroke="#8d4138" strokeWidth="1" />
              <path d="m19 12-7-4 6 1 3-5 1 6 6-1-6 5-2 4Z" fill="#4d704e" />
              <path d="M10 19q0-4 5-5" fill="none" stroke="#f0ab83" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          </svg>
        )}
      </div>
      <div className="court-verdict-actions">
        <Button type="button" variant="outline" size="sm" onClick={() => setRound((value) => value + 1)}>
          <span aria-hidden="true">🍅</span> 番茄异议
        </Button>
        {next}
      </div>
      <p className={round ? "text-xs text-cocoa-500" : "sr-only"} role="status">
        {round > 0 ? "番茄落在判词牌上，仅在本机展示。" : ""}
      </p>
    </>
  )
}
