"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ChevronDown,
  Heart,
  Lightbulb,
  Loader2,
  MessageSquareQuote,
  RotateCw,
  ScanHeart,
  ShieldAlert,
} from "lucide-react"
import { CourtScene } from "@/components/court-scene"
import { FlowHeader } from "@/components/flow-header"
import { VerdictReactions } from "@/components/verdict-reactions"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { loadCredentials } from "@/lib/credentials-storage"
import type { MediationReport } from "@/lib/mediation-report-schema"
import { RoomApiError, fetchRoomReport } from "@/lib/room-api"
import type { ParticipantCredentials, RoomReportResponse } from "@/lib/room-types"
import { cn } from "@/lib/utils"
import { TaskChecklist } from "./task-checklist"

const POLL_INTERVAL = 3000

function formatGeneratedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function SectionTitle({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className="display-heading flex items-center gap-2.5 text-xl sm:text-2xl">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-xl",
          className,
        )}
      >
        <Icon className="size-4" />
      </span>
      {children}
    </h2>
  )
}

export function ReportView({ roomId }: { roomId: string }) {
  const [credentials, setCredentials] =
    useState<ParticipantCredentials | null>(null)
  const [credentialChecked, setCredentialChecked] = useState(false)
  const [reportData, setReportData] = useState<RoomReportResponse | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setCredentials(loadCredentials(roomId))
      setCredentialChecked(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId])

  const load = useCallback(async () => {
    if (!credentials) return
    try {
      const data = await fetchRoomReport(roomId, credentials.accessToken)
      setReportData(data)
      setPending(false)
      setError("")
    } catch (err) {
      if (err instanceof RoomApiError && err.code === "report_pending") {
        setPending(true)
        setError("")
        return
      }
      setPending(false)
      setError(err instanceof Error ? err.message : "加载报告失败")
    }
  }, [credentials, roomId])

  useEffect(() => {
    if (!credentials || reportData) return
    const initial = setTimeout(load, 0)
    const timer = setInterval(load, POLL_INTERVAL)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [credentials, load, reportData])

  if (!credentialChecked || (credentials && !reportData && !pending && !error)) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-52 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    )
  }

  if (!credentials) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card className="rounded-3xl shadow-xs">
          <CardHeader>
            <CardTitle>你还没有加入这个房间</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>调解报告仅对房间的两位参与者开放。</p>
            <Link
              href="/"
              className={cn(buttonVariants({ size: "lg" }), "w-fit rounded-full")}
            >
              回到首页
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reportData && pending) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card className="rounded-3xl shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="size-5 text-primary motion-safe:animate-spin" />
              猫咪法官正在整理报告…
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>双方观点已提交，分析完成后本页会自动显示报告，通常需要 10–30 秒。</p>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={load}>
                <RotateCw />
                刷新
              </Button>
              <Link
                href={`/room/${roomId}?legacy=1`}
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                返回房间
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card className="rounded-3xl shadow-xs">
          <CardHeader>
            <CardTitle>无法加载报告</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>{error || "请返回房间确认双方是否都已提交观点。"}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={load}>
                <RotateCw />
                重试
              </Button>
              <Link
                href={`/room/${roomId}?legacy=1`}
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                返回房间
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <LoadedReport
      key={`${roomId}:${reportData.generatedAt}`}
      roomId={roomId}
      viewerSide={credentials.side}
      reportData={reportData}
    />
  )
}

const verdictSteps = [
  { key: "A", label: "A 方观点" },
  { key: "B", label: "B 方观点" },
  { key: "misunderstandings", label: "共同误会" },
] as const

function Misunderstandings({ items }: { items: MediationReport["misunderstandings"] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title}>
          <p className="font-semibold">{item.title}</p>
          <p className="mt-1 text-sm leading-7">{item.detail}</p>
        </li>
      ))}
    </ul>
  )
}

function LoadedReport({
  roomId,
  viewerSide,
  reportData,
}: {
  roomId: string
  viewerSide: ParticipantCredentials["side"]
  reportData: RoomReportResponse
}) {
  const report = reportData.report
  const openingKey = `catjudge:court-opening:${roomId}:${reportData.generatedAt}`
  const [opening, setOpening] = useState(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
    try {
      return !sessionStorage.getItem(openingKey)
    } catch {
      return true
    }
  })
  const [step, setStep] = useState(0)
  const [reconciliationOpen, setReconciliationOpen] = useState(false)
  const [taskDone, setTaskDone] = useState<boolean[]>(() => report.funTasks.map(() => false))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const openingSkipRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!opening) return
    try {
      sessionStorage.setItem(openingKey, "played")
    } catch {
      // The sequence can still play once per visit if session storage is unavailable.
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const endOpening = () => {
      const restoreFocus = document.activeElement === openingSkipRef.current
      setOpening(false)
      if (restoreFocus) {
        requestAnimationFrame(() => headingRef.current?.focus())
      }
    }
    const reduceMotion = () => {
      if (preference.matches) endOpening()
    }
    preference.addEventListener("change", reduceMotion)
    const timer = window.setTimeout(endOpening, 1350)
    return () => {
      preference.removeEventListener("change", reduceMotion)
      window.clearTimeout(timer)
    }
  }, [opening, openingKey])

  function skipOpening() {
    setOpening(false)
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  function toggleTask(index: number) {
    setTaskDone((prev) => prev.map((value, i) => (i === index ? !value : value)))
  }

  function selectStep(index: number) {
    setStep(index)
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  const activeStep = verdictSteps[step]
  const summary = report.summaries.find((item) => item.side === activeStep.key)
  const seat = (side: "A" | "B") => ({
    side,
    name: report.summaries.find((item) => item.side === side)?.name ?? `${side} 方`,
    isMe: viewerSide === side,
    submitted: true,
  })

  return (
    <div className="court-layout">
      <FlowHeader
        current={reconciliationOpen ? "agreement" : "analysis"}
        inviteCode={reportData.inviteCode}
        topic={report.topic}
        bothSubmitted
      />
      <CourtScene
        left={seat("A")}
        right={seat("B")}
        phase={opening ? "gavel" : "verdict"}
        action={opening ? (
          <button ref={openingSkipRef} type="button" className="verdict-skip" onClick={skipOpening}>
            跳过敲槌
          </button>
        ) : null}
      />

      {!opening && (
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex min-w-0 flex-col gap-3.5" aria-labelledby="court-verdict-heading">
            <SectionTitle icon={MessageSquareQuote} className="bg-tang-100 text-tang-700">
              庭审宣读
            </SectionTitle>
            <div className="court-verdict-steps" role="group" aria-label="选择宣读段落">
              {verdictSteps.map(({ key, label }, index) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={step === index}
                  onClick={() => selectStep(index)}
                >
                  {label}
                </button>
              ))}
            </div>
            <VerdictReactions
              key={activeStep.key}
              judgeBoard={(
                <>
                  <h3 id="court-verdict-heading" tabIndex={-1} ref={headingRef}>
                    {summary ? `${summary.side} 方 · ${summary.name}` : "判判猫宣读共同误会"}
                  </h3>
                  <div className="mt-3">
                    {summary ? <p className="text-sm leading-7">{summary.text}</p> : (
                      <Misunderstandings items={report.misunderstandings} />
                    )}
                  </div>
                </>
              )}
              next={step < 2 ? (
                <Button type="button" size="sm" onClick={() => selectStep(step + 1)}>
                  {step === 0 ? "宣读 B 方观点" : "宣读共同误会"}
                </Button>
              ) : undefined}
            />
          </section>

          {step === 2 || reconciliationOpen ? (
            <details
              className="verdict-reveal"
              open={reconciliationOpen}
              onToggle={(event) => setReconciliationOpen(event.currentTarget.open)}
            >
              <summary className="verdict-reveal-summary">
                {reconciliationOpen ? "收起和解总报告" : "展开和解总报告"}
                <ChevronDown className="verdict-reveal-chevron" aria-hidden="true" />
              </summary>
              <div className="verdict-reveal-body">
                <div className="border-t border-tang-100 pt-4">
                  <p className="text-xs text-cocoa-500">{formatGeneratedAt(reportData.generatedAt)}</p>
                  <blockquote className="mt-2 border-l-2 border-tang-300 pl-3 text-sm leading-7 text-cocoa-700">
                    {report.overallComment}
                  </blockquote>
                </div>

                <section className="flex min-w-0 flex-col gap-3">
                  <SectionTitle icon={MessageSquareQuote} className="bg-tang-100 text-tang-700">
                    双方观点总结
                  </SectionTitle>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {report.summaries.map((item) => (
                      <div key={item.side} className="min-w-0 rounded-xl border bg-card p-3.5">
                        <h3 className="break-all font-semibold">{item.side} 方 · {item.name}</h3>
                        <p className="mt-1 break-words text-sm leading-7">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <SectionTitle icon={AlertTriangle} className="bg-amber-100 text-amber-700">
                    沟通误会
                  </SectionTitle>
                  <Misunderstandings items={report.misunderstandings} />
                </section>

                <section className="flex flex-col gap-4">
                  <SectionTitle icon={ScanHeart} className="bg-sky-100 text-sky-600">
                    情绪与需求分析
                  </SectionTitle>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {report.emotions.map((emotion) => (
                      <Card key={emotion.side} className="rounded-3xl shadow-xs">
                        <CardHeader className="gap-3">
                          <CardTitle className="text-base">
                            {emotion.name}（用户 {emotion.side}）
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {emotion.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={cn(
                                  "rounded-full",
                                  emotion.side === "A"
                                    ? "bg-cream-200 text-cocoa-700"
                                    : "bg-sky-100 text-sky-800",
                                )}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">
                            TA 真正需要的是
                          </p>
                          <ul className="flex flex-col gap-2 text-sm leading-6">
                            {emotion.needs.map((need) => (
                              <li key={need} className="flex items-start gap-2">
                                <Heart className="mt-1 size-3.5 shrink-0 text-primary" />
                                {need}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <SectionTitle icon={Heart} className="bg-tang-100 text-tang-700">
                    共同需求
                  </SectionTitle>
                  <Card className="rounded-3xl border-tang-100 bg-tang-50 shadow-xs">
                    <CardContent className="flex flex-wrap gap-3 py-5">
                      {report.commonNeeds.map((need) => (
                        <span
                          key={need}
                          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-tang-700"
                        >
                          {need}
                        </span>
                      ))}
                    </CardContent>
                  </Card>
                </section>

                <section className="flex flex-col gap-4">
                  <SectionTitle icon={Lightbulb} className="bg-tang-100 text-tang-700">
                    改善建议
                  </SectionTitle>
                  <div className="flex flex-col gap-3">
                    {report.suggestions.map((suggestion, index) => (
                      <Card key={suggestion.title} className="rounded-3xl shadow-xs">
                        <CardContent className="flex gap-3 py-4">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tang-100 text-sm font-bold text-tang-700">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{suggestion.title}</p>
                            <p className="mt-1 text-sm leading-7 text-foreground/75">
                              {suggestion.detail}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold sm:text-xl">趣味互动任务</h2>
                  <TaskChecklist tasks={report.funTasks} completed={taskDone} onToggle={toggleTask} />
                </section>
              </div>
            </details>
          ) : null}

          <div className="flex items-start gap-2 rounded-2xl bg-muted/60 p-4 text-xs leading-6 text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              AI 分析仅用于辅助沟通，不替代专业心理、法律或危机干预服务。
              本报告由 {reportData.model || "AI 模型"} 生成，请结合实际情况理性参考。
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 pb-4 sm:flex-row">
            <Link
              href={`/room/${roomId}?legacy=1`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-full px-6",
              )}
            >
              返回房间详情
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full px-6",
              )}
            >
              回到首页
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
