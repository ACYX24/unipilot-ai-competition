"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, CheckCircle2, Copy, Loader2, Scale } from "lucide-react"
import { CatAvatar } from "@/components/cat-mascot"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { MockRoom, PartySide } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type StatementState = Record<PartySide, { text: string; submitted: boolean }>

const sideStyles: Record<
  PartySide,
  { card: string; badge: string; bubble: string }
> = {
  A: {
    card: "border-rose-100 bg-rose-50/50",
    badge: "bg-rose-100 text-rose-500",
    bubble: "bg-rose-50 border-rose-100",
  },
  B: {
    card: "border-sky-100 bg-sky-50/50",
    badge: "bg-sky-100 text-sky-600",
    bubble: "bg-sky-50 border-sky-100",
  },
}

export function RoomView({ room }: { room: MockRoom }) {
  const [statements, setStatements] = useState<StatementState>({
    A: { text: "", submitted: false },
    B: { text: "", submitted: false },
  })
  const [copied, setCopied] = useState(false)
  const [analysisReady, setAnalysisReady] = useState(false)
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allSubmitted = statements.A.submitted && statements.B.submitted
  const analyzing = allSubmitted && !analysisReady

  useEffect(
    () => () => {
      if (analysisTimer.current) clearTimeout(analysisTimer.current)
    },
    [],
  )

  function updateStatement(side: PartySide, text: string) {
    setStatements((prev) => ({ ...prev, [side]: { ...prev[side], text } }))
  }

  function submitStatement(side: PartySide) {
    const text = statements[side].text.trim()
    if (!text) return
    const next = { ...statements, [side]: { text, submitted: true } }
    setStatements(next)
    if (next.A.submitted && next.B.submitted) {
      setAnalysisReady(false)
      analysisTimer.current = setTimeout(() => setAnalysisReady(true), 1500)
    }
  }

  function editStatement(side: PartySide) {
    setAnalysisReady(false)
    setStatements((prev) => ({
      ...prev,
      [side]: { ...prev[side], submitted: false },
    }))
  }

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(room.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时忽略，邀请码本身已在页面上展示
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <Card className="rounded-3xl border-border/70 shadow-xs">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {room.disputeType}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-violet-100 text-violet-600"
            >
              陈述阶段
            </Badge>
          </div>
          <CardTitle className="text-xl leading-8 sm:text-2xl">
            {room.topic}
          </CardTitle>
          <CardDescription>
            双方各自填写自己的想法，提交后对方才会看到状态；双方都提交后，猫咪法官开始分析。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
            <span className="text-sm text-violet-500">房间邀请码</span>
            <span className="font-mono text-xl font-bold tracking-[0.2em] text-violet-700">
              {room.inviteCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyInviteCode}
              className="ml-auto text-violet-600 hover:bg-violet-100"
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            把邀请码发给另一半，TA 在首页选择「加入调解房间」即可进入。
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {room.participants.map((participant) => {
          const statement = statements[participant.side]
          const styles = sideStyles[participant.side]
          return (
            <Card
              key={participant.side}
              className={cn("rounded-3xl shadow-xs", styles.card)}
            >
              <CardHeader className="flex-row items-center gap-3">
                <span className="w-14 shrink-0">
                  <CatAvatar tone={participant.tone} />
                </span>
                <div className="flex flex-1 flex-col gap-1">
                  <CardTitle className="text-lg">{participant.name}</CardTitle>
                  <CardDescription>{participant.roleLabel}</CardDescription>
                </div>
                {statement.submitted ? (
                  <Badge className="rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-3.5" />
                    已提交
                  </Badge>
                ) : (
                  <Badge className={cn("rounded-full", styles.badge)}>
                    填写中
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {statement.submitted ? (
                  <>
                    <div
                      className={cn(
                        "min-h-40 rounded-2xl border p-4 text-sm leading-7 whitespace-pre-wrap",
                        styles.bubble,
                      )}
                    >
                      {statement.text}
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => editStatement(participant.side)}
                    >
                      修改陈述
                    </Button>
                  </>
                ) : (
                  <>
                    <Textarea
                      value={statement.text}
                      onChange={(event) =>
                        updateStatement(participant.side, event.target.value)
                      }
                      placeholder="从你的角度说说这件事：发生了什么？你有什么感受和需要？"
                      maxLength={2000}
                      className="min-h-40 rounded-2xl bg-white text-sm leading-7"
                      aria-label={`${participant.name}的观点`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {statement.text.length} / 2000
                      </span>
                      <Button
                        className="rounded-full px-6"
                        disabled={!statement.text.trim()}
                        onClick={() => submitStatement(participant.side)}
                      >
                        提交我的观点
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="rounded-3xl border-violet-100 bg-violet-50/60 shadow-xs">
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Scale className="size-4" />
            双方提交状态：{statements.A.submitted ? "A 已提交" : "A 未提交"} ·{" "}
            {statements.B.submitted ? "B 已提交" : "B 未提交"}
          </div>
          {!allSubmitted && (
            <p className="text-sm text-muted-foreground">
              等待双方都提交观点后，猫咪法官就会开始分析。
            </p>
          )}
          {allSubmitted && analyzing && (
            <p className="flex items-center gap-2 text-sm text-violet-600">
              <Loader2 className="size-4 animate-spin" />
              猫咪法官正在认真阅读双方的陈述…
            </p>
          )}
          {allSubmitted && !analyzing && (
            <>
              <p className="text-sm text-violet-600">
                分析完成！猫咪法官写好了你们的调解报告。
              </p>
              <Link
                href={`/report/${room.inviteCode}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 rounded-full px-7",
                )}
              >
                查看调解报告
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
