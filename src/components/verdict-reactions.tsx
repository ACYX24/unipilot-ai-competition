"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Reaction = "tomato" | "dissent" | null

/**
 * 判词牌上的本端反馈：不发请求、不落库、不通知对方。
 * 动画只影响当前屏幕，刷新后自然重置。
 */
export function VerdictReactions({ className }: { className?: string }) {
  const [reaction, setReaction] = useState<Reaction>(null)
  const [round, setRound] = useState(0)

  function play(next: Exclude<Reaction, null>) {
    setReaction(next)
    setRound((value) => value + 1)
  }

  const message =
    reaction === "tomato"
      ? "番茄落在判词牌上，只在你的屏幕上出现。"
      : reaction === "dissent"
        ? "异议已记下，只在你的屏幕上出现。"
        : ""

  return (
    <div className={cn("verdict-reactions", className)}>
      <div className="verdict-reactions-actions">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="verdict-reaction-button"
          onClick={() => play("tomato")}
        >
          <span aria-hidden="true">🍅</span>
          扔个番茄
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="verdict-reaction-button"
          onClick={() => play("dissent")}
        >
          <span aria-hidden="true">✋</span>
          提出异议
        </Button>
      </div>

      {reaction ? (
        <span
          key={`${reaction}-${round}`}
          className={cn("reaction-prop", `is-${reaction}`)}
          aria-hidden="true"
        >
          {reaction === "tomato" ? "🍅" : "✋"}
        </span>
      ) : null}

      <p className="reaction-note" aria-live="polite">
        {message}
      </p>
    </div>
  )
}