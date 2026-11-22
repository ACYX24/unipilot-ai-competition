"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Check,
  CheckCircle2,
  Copy,
  FileHeart,
  Loader2,
  RotateCw,
  Scale,
} from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState, generateRoomAnalysis, submitStatement } from "@/lib/room-api"
import type {
  ParticipantCredentials,
  RoomStateResponse,
  RoomStatus,
  Side,
} from "@/lib/room-types"
import { cn } from "@/lib/utils"

const POLL_INTERVAL = 3000
const ANALYSIS_RETRY_INTERVAL = 8000

const statusLabels: Record<RoomStatus, string> = {
  waiting: "等待对方加入",
  collecting: "观点收集中",
  analyzing: "AI 分析中",
  completed: "调解已完成",
}

const analysisErrorMessages: Record<string, string> = {
  llm_not_configured: "服务端尚未配置 AI 模型，请联系管理员",
  llm_timeout: "AI 响应超时，请重试",
  llm_rate_limited: "AI 服务繁忙，请稍后重试",
  llm_auth_failed: "AI 服务鉴权失败，请联系管理员",
  llm_upstream_error: "AI 服务暂时不可用，请稍后重试",
  llm_invalid_output: "AI 报告格式异常，请重试",
  report_persist_failed: "报告保存失败，请重试",
  analysis_migration_missing: "数据库迁移未执行，请联系管理员",
  rate_limited: "操作过于频繁，请稍后再试",
}

const nonRetryableCodes = new Set([
  "llm_not_configured",
  "llm_auth_failed",
  "analysis_migration_missing",
])

function formatAnalysisError(code: string | null | undefined) {
  if (!code) return ""
  return analysisErrorMessages[code] ?? "分析失败，请重试"
}

const sideStyles: Record<Side, { card: string; badge: string; bubble: string }> = {
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

export function RoomView({ roomId }: { roomId: string }) {
  const [credentials, setCredentials] =
    useState<ParticipantCredentials | null>(null)
  const [credentialChecked, setCredentialChecked] = useState(false)
  const [state, setState] = useState<RoomStateResponse | null>(null)
  const [error, setError] = useState("")
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [analysisError, setAnalysisError] = useState("")
  const [analysisPending, setAnalysisPending] = useState(false)
  const lastAnalysisAttemptRef = useRef(0)

  useEffect(() => {
    // localStorage 仅在浏览器可用，放到异步回调中读取以避免 SSR 不一致
    const timer = setTimeout(() => {
      setCredentials(loadCredentials(roomId))
      setCredentialChecked(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId])

  const refresh = useCallback(async () => {
    if (!credentials) return
    try {
      const next = await fetchRoomState(roomId, credentials.accessToken)
      setState(next)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    }
  }, [credentials, roomId])

  useEffect(() => {
    if (!credentials) return
    const initial = setTimeout(refresh, 0)
    const timer = setInterval(refresh, POLL_INTERVAL)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [credentials, refresh])

  const triggerAnalysis = useCallback(async () => {
    if (!credentials) return
    lastAnalysisAttemptRef.current = Date.now()
    setAnalysisPending(true)
    setAnalysisError("")
    try {
      await generateRoomAnalysis(roomId, credentials.accessToken)
      await refresh()
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "分析失败，请稍后重试")
    } finally {
      setAnalysisPending(false)
    }
  }, [credentials, roomId, refresh])

  useEffect(() => {
    if (!credentials || !state) return
    if (state.room.status !== "analyzing") return
    if (state.analysis.leaseActive || state.analysis.errorCode) return
    if (analysisError || analysisPending) return
    if (Date.now() - lastAnalysisAttemptRef.current < ANALYSIS_RETRY_INTERVAL) return
    void triggerAnalysis()
  }, [analysisError, analysisPending, credentials, state, triggerAnalysis])

  async function retryAnalysis() {
    lastAnalysisAttemptRef.current = 0
    setAnalysisError("")
    await triggerAnalysis()
  }

  async function handleSubmit() {
    if (!credentials || !draft.trim() || submitting) return
    setSubmitting(true)
    setError("")
    try {
      await submitStatement(roomId, credentials.accessToken, draft.trim())
      setDraft("")
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败")
    } finally {
      setSubmitting(false)
    }
  }

  async function copyInviteCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时忽略，邀请码已展示在页面上
    }
  }

  if (!credentialChecked) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    )
  }

  if (!credentials) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card className="rounded-3xl shadow-xs">
          <CardHeader>
            <CardTitle>你还没有加入这个房间</CardTitle>
            <CardDescription>
              房间内容仅对两名参与者开放。请通过首页创建新房间，或使用对方分享的邀请码加入。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
            >
              回到首页
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
        <Card className="rounded-3xl shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? "无法打开房间" : (
                <>
                  <Loader2 className="size-5 animate-spin text-primary" />
                  正在进入调解室…
                </>
              )}
            </CardTitle>
            {error && <CardDescription>{error}</CardDescription>}
          </CardHeader>
          {error && (
            <CardContent className="flex gap-3">
              <Button variant="outline" className="rounded-full" onClick={refresh}>
                重试
              </Button>
              <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
                回到首页
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    )
  }

  const mySide = state.me.side
  const otherSide: Side = mySide === "A" ? "B" : "A"
  const otherParticipant = state.participants.find((p) => p.side === otherSide)
  const analysisErrorText =
    analysisError || formatAnalysisError(state.analysis.errorCode)
  const canRetryAnalysis =
    !state.analysis.errorCode || !nonRetryableCodes.has(state.analysis.errorCode)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <Card className="rounded-3xl border-border/70 shadow-xs">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {state.room.disputeType}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-violet-100 text-violet-600"
            >
              {statusLabels[state.room.status]}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-8 sm:text-2xl">
            {state.room.topic}
          </CardTitle>
          <CardDescription>
            双方各自填写想法，提交前内容互相保密；双方都提交后，猫咪法官开始分析。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
            <span className="text-sm text-violet-500">房间邀请码</span>
            <span className="font-mono text-xl font-bold tracking-[0.2em] text-violet-700">
              {state.room.inviteCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyInviteCode(state.room.inviteCode)}
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
        <ParticipantCard
          side={mySide}
          name={state.me.displayName}
          isMine
          submitted={Boolean(state.myStatement)}
          statement={state.myStatement}
        >
          {!state.myStatement && (
            <div className="flex flex-col gap-3">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="从你的角度说说这件事：发生了什么？你有什么感受和需要？"
                maxLength={2000}
                className="min-h-40 rounded-2xl bg-white text-sm leading-7"
                aria-label="我的观点"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {draft.length} / 2000
                </span>
                <Button
                  className="rounded-full px-6"
                  disabled={!draft.trim() || submitting}
                  onClick={handleSubmit}
                >
                  {submitting && <Loader2 className="animate-spin" />}
                  {submitting ? "提交中…" : "提交我的观点"}
                </Button>
              </div>
            </div>
          )}
        </ParticipantCard>

        {otherParticipant ? (
          <ParticipantCard
            side={otherSide}
            name={otherParticipant.displayName}
            submitted={state.otherSubmitted}
            statement={state.otherStatement}
          >
            {!state.otherStatement && (
              <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 p-4 text-center text-sm text-muted-foreground">
                {state.otherSubmitted
                  ? "对方已提交，待你也提交后即可互相查看"
                  : "对方还没有提交，内容在双方提交前互相保密"}
              </div>
            )}
          </ParticipantCard>
        ) : (
          <Card className="rounded-3xl border-dashed shadow-xs">
            <CardContent className="flex h-full min-h-64 flex-col items-center justify-center gap-3 py-8 text-center">
              <span className="w-14 opacity-40">
                <CatAvatar tone="blue" />
              </span>
              <p className="font-medium text-muted-foreground">
                等待用户 {otherSide} 加入
              </p>
              <p className="text-sm text-muted-foreground">
                把邀请码 {state.room.inviteCode} 发给对方吧
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="rounded-3xl border-violet-100 bg-violet-50/60 shadow-xs">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <Scale className="size-4" />
            双方提交状态：{state.myStatement ? "我已提交" : "我未提交"} ·{" "}
            {state.otherSubmitted ? "对方已提交" : "对方未提交"}
          </div>
          {state.room.status === "waiting" && (
            <p className="text-sm text-muted-foreground">
              等待对方加入房间。你可以先提交自己的观点。
            </p>
          )}
          {state.room.status === "collecting" && (
            <p className="text-sm text-muted-foreground">
              等待双方都提交观点后，猫咪法官就会开始分析。
            </p>
          )}
          {state.room.status === "analyzing" &&
            (analysisErrorText ? (
              <div className="flex flex-col items-center gap-3">
                <p role="alert" className="text-sm text-destructive">
                  {analysisErrorText}
                </p>
                {canRetryAnalysis && (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={analysisPending}
                    onClick={retryAnalysis}
                  >
                    {analysisPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <RotateCw />
                    )}
                    {analysisPending ? "重试中…" : "重试分析"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-violet-600">
                <Loader2 className="size-4 animate-spin" />
                {state.analysis.leaseActive || analysisPending
                  ? "猫咪法官正在阅读双方陈述、生成报告…通常需要 10–30 秒"
                  : "双方观点已齐全，正在准备分析…"}
              </div>
            ))}
          {state.room.status === "completed" && (
            <>
              <p className="text-sm text-violet-600">
                调解报告已生成，两位参与者看到的是同一份报告。
              </p>
              <Link
                href={`/report/${roomId}`}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6",
                )}
              >
                <FileHeart className="size-4" />
                查看调解报告
              </Link>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            页面每 3 秒自动同步房间状态，刷新也不会丢失进度。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function ParticipantCard({
  side,
  name,
  isMine = false,
  submitted,
  statement,
  children,
}: {
  side: Side
  name: string
  isMine?: boolean
  submitted: boolean
  statement: { content: string; submittedAt: string } | null
  children?: React.ReactNode
}) {
  const styles = sideStyles[side]

  return (
    <Card className={cn("rounded-3xl shadow-xs", styles.card)}>
      <CardHeader className="flex-row items-center gap-3">
        <span className="w-14 shrink-0">
          <CatAvatar tone={side === "A" ? "orange" : "blue"} />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <CardTitle className="text-lg">
            {name}
            {isMine && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                （我）
              </span>
            )}
          </CardTitle>
          <CardDescription>用户 {side}</CardDescription>
        </div>
        {submitted ? (
          <Badge className="rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            已提交
          </Badge>
        ) : (
          <Badge className={cn("rounded-full", styles.badge)}>未提交</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {statement && (
          <div
            className={cn(
              "min-h-40 rounded-2xl border p-4 text-sm leading-7 whitespace-pre-wrap",
              styles.bubble,
            )}
          >
            {statement.content}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
