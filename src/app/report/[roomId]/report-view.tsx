"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Heart,
  Lightbulb,
  Loader2,
  MessageSquareQuote,
  RotateCw,
  ScanHeart,
  ShieldAlert,
} from "lucide-react"
import { CatAvatar, CatMascot } from "@/components/cat-mascot"
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
    <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
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

  if (!credentialChecked) {
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
              <Loader2 className="size-5 animate-spin text-primary" />
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
                href={`/room/${roomId}`}
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
                href={`/room/${roomId}`}
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

  const report: MediationReport = reportData.report

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Card className="overflow-hidden rounded-3xl border-violet-100 bg-gradient-to-br from-rose-50 via-white to-violet-50 shadow-xs">
        <CardContent className="flex flex-col items-center gap-5 py-8 text-center sm:flex-row sm:text-left">
          <div className="w-28 shrink-0 sm:w-32">
            <CatMascot variant="judge" />
          </div>
          <div className="flex flex-col gap-3">
            <Badge
              variant="secondary"
              className="mx-auto w-fit rounded-full sm:mx-0"
            >
              房间 {reportData.inviteCode} ·{" "}
              {formatGeneratedAt(reportData.generatedAt)}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              猫咪法官的调解报告
            </h1>
            <p className="text-sm text-muted-foreground">{report.topic}</p>
            <blockquote className="rounded-2xl bg-white/70 p-4 text-sm leading-7 text-foreground/80">
              「{report.overallComment}」
            </blockquote>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <SectionTitle
          icon={MessageSquareQuote}
          className="bg-rose-100 text-rose-500"
        >
          双方观点总结
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {report.summaries.map((summary) => (
            <Card
              key={summary.side}
              className={cn(
                "rounded-3xl shadow-xs",
                summary.side === "A"
                  ? "border-rose-100 bg-rose-50/50"
                  : "border-sky-100 bg-sky-50/50",
              )}
            >
              <CardHeader className="flex-row items-center gap-3">
                <span className="w-11 shrink-0">
                  <CatAvatar tone={summary.tone} />
                </span>
                <CardTitle className="text-base">
                  {summary.name}（用户 {summary.side}）
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-foreground/80">
                {summary.text}
              </CardContent>
            </Card>
          ))}
        </div>
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
                          ? "bg-rose-100 text-rose-500"
                          : "bg-sky-100 text-sky-600",
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
        <SectionTitle
          icon={AlertTriangle}
          className="bg-amber-100 text-amber-600"
        >
          沟通误区
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {report.misunderstandings.map((item, index) => (
            <Card key={item.title} className="rounded-3xl shadow-xs">
              <CardContent className="flex gap-3 py-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-7 text-foreground/75">
                    {item.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon={Heart} className="bg-rose-100 text-rose-500">
          共同需求
        </SectionTitle>
        <Card className="rounded-3xl border-rose-100 bg-rose-50/60 shadow-xs">
          <CardContent className="flex flex-wrap gap-3 py-5">
            {report.commonNeeds.map((need) => (
              <span
                key={need}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-rose-500 shadow-xs"
              >
                {need}
              </span>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon={Lightbulb} className="bg-violet-100 text-violet-600">
          改善建议
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {report.suggestions.map((suggestion, index) => (
            <Card key={suggestion.title} className="rounded-3xl shadow-xs">
              <CardContent className="flex gap-3 py-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
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
        <TaskChecklist tasks={report.funTasks} />
      </section>

      <div className="flex items-start gap-2 rounded-2xl bg-muted/60 p-4 text-xs leading-6 text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          AI 分析仅用于辅助沟通，不替代专业心理、法律或危机干预服务。
          本报告由 {reportData.model || "AI 模型"} 生成，请结合实际情况理性参考。
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 pb-4 sm:flex-row">
        <Link
          href={`/room/${roomId}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 rounded-full px-6",
          )}
        >
          返回房间
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
  )
}
