"use client"

import { useState } from "react"
import { Check, Dices } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { MockReport } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function TaskChecklist({ tasks }: { tasks: MockReport["funTasks"] }) {
  const [done, setDone] = useState<boolean[]>(tasks.map(() => false))

  function toggle(index: number) {
    setDone((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tasks.map((task, index) => (
        <Card
          key={task.title}
          className={cn(
            "rounded-3xl shadow-xs transition-colors",
            done[index] ? "border-emerald-200 bg-emerald-50/60" : "bg-white",
          )}
        >
          <CardContent className="flex h-full flex-col gap-3 py-5">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Dices className="size-4" />
            </span>
            <p className="font-semibold">{task.title}</p>
            <p className="flex-1 text-sm leading-6 text-foreground/75">
              {task.detail}
            </p>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={done[index]}
              className={cn(
                "mt-1 flex h-9 items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition-colors",
                done[index]
                  ? "border-emerald-200 bg-emerald-100 text-emerald-600"
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              {done[index] && <Check className="size-4" />}
              {done[index] ? "已完成" : "标记完成"}
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
