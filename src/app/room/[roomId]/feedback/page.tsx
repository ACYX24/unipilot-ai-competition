"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, RotateCw, ShieldAlert } from "lucide-react"
import { RoomScene } from "@/components/room-scene"
import { FlowHeader } from "@/components/flow-header"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatAnalysisError,
  isAnalysisErrorRetryable,
} from "@/lib/analysis-status"
import { loadCredentials } from "@/lib/credentials-storage"
import {
  RoomApiError,
  fetchRoomState,
  generateRoomAnalysis,
} from "@/lib/room-api"
import type { ParticipantCredentials, RoomStateResponse } from "@/lib/room-types"
import { cn } from "@/lib/utils"

const POLL_INTERVAL = 3000
const ANALYSIS_RETRY_INTERVAL = 8000

interface AnalysisFailure {
  message: string
  code?: string
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="mt-4 h-64 rounded-3xl" />
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  )
}

function FeedbackContent() {
  const router = useRouter()
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const [credentials, setCredentials] =
    useState<ParticipantCredentials | null>(null)
  const [state, setState] = useState<RoomStateResponse | null>(null)
  const [loadError, setLoadError] = useState("")
  const [analysisFailure, setAnalysisFailure] =
    useState<AnalysisFailure | null>(null)
  const [pending, setPending] = useState(false)
  const lastAttemptRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const creds = loadCredentials(roomId)
      if (!creds) {
        setLoadError("没有找到这个房间的访问凭证，请重新加入房间")
        return
      }
      setCredentials(creds)
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId])

  const triggerAnalysis = useCallback(async () => {
    if (!credentials) return
    lastAttemptRef.current = Date.now()
    setPending(true)
    setAnalysisFailure(null)
    try {
      await generateRoomAnalysis(roomId, credentials.accessToken)
    } catch (err) {
      setAnalysisFailure({
        message: err instanceof Error ? err.message : "分析失败，请稍后重试",
        code: err instanceof RoomApiError ? err.code : undefined,
      })
    } finally {
      setPending(false)
    }
  }, [credentials, roomId])

  const refresh = useCallback(async () => {
    if (!credentials) return
    try {
      const latest = await fetchRoomState(roomId, credentials.accessToken)
      setState(latest)
      setLoadError("")

      if (!latest.myStatement) {
        router.replace(`/room/${roomId}/statement`)
        return
      }
      if (!latest.otherSubmitted) {
        router.replace(`/room/${roomId}/waiting`)
        return
      }
      if (latest.room.status === "completed") {
        router.replace(`/report/${roomId}`)
        return
      }

      if (
        latest.room.status === "analyzing" &&
        !latest.analysis.leaseActive &&
        !latest.analysis.errorCode &&
        !analysisFailure &&
        !pending &&
        Date.now() - lastAttemptRef.current >= ANALYSIS_RETRY_INTERVAL
      ) {
        void triggerAnalysis()
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "读取房间状态失败")
    }
  }, [analysisFailure, credentials, pending, roomId, router, triggerAnalysis])

  useEffect(() => {
    if (!credentials) return
    const initial = setTimeout(refresh, 0)
    const interval = setInterval(refresh, POLL_INTERVAL)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [credentials, refresh])

  async function retryAnalysis() {
    lastAttemptRef.current = 0
    setAnalysisFailure(null)
    await triggerAnalysis()
  }

  if (!state && !loadError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="mt-4 h-64 rounded-3xl" />
      </div>
    )
  }

  if (!state && loadError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <Card className="rounded-3xl border-tang-100 text-center shadow-soft">
          <CardHeader>
            <CardTitle className="text-cocoa-700">进不去这个房间</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="rounded-full bg-tang-400 font-bold text-white hover:bg-tang-500"
              onClick={() => router.push("/")}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!state) return null

  const bothSubmitted = Boolean(state.myStatement) && state.otherSubmitted
  const completed = state.room.status === "completed"
  const analysisErrorText = pending
    ? ""
    : analysisFailure?.message ??
      formatAnalysisError(state.analysis.errorCode)
  const canRetry = analysisFailure
    ? isAnalysisErrorRetryable(analysisFailure.code)
    : isAnalysisErrorRetryable(state.analysis.errorCode)
  const reading = bothSubmitted && state.room.status === "analyzing" &&
    (pending || state.analysis.leaseActive) && !analysisErrorText
  const teacher = state.room.mode === "teacher"
  const copy = teacher
    ? { failure: "这次梳理没有完成", reading: "正在归纳重点和差异", ready: "准备梳理两边的想法", waiting: "等另一位写完", detail: "正在整理各自在意的事、可能的理解差异和共同点。", idle: "收到两张小纸条后，老师就会开始梳理。", action: "打开沟通记录" }
    : { failure: "这次阅卷没有完成", reading: "判判猫正在阅卷", ready: "准备阅卷", waiting: "等双方交卷", detail: "正在整理双方观点与误会。", idle: "双方交卷后开始阅卷。", action: "查看调解报告" }

  return (
    <div className="court-layout">
      <FlowHeader
        current="feedback"
        mode={state.room.mode}
        inviteCode={state.room.inviteCode}
        topic={state.room.topic}
        relation={state.room.disputeType}
        bothSubmitted={bothSubmitted}
      />

      <RoomScene
        state={state}
        phase={reading ? "reading" : bothSubmitted ? "ready" : "waiting"}
      />

      <Card className="mx-auto max-w-2xl rounded-3xl border-tang-100 text-center shadow-soft">
        <CardHeader>
          <CardTitle className="display-heading text-xl">
            {completed
              ? "调解报告已生成"
              : analysisErrorText
                ? copy.failure
                : reading
                  ? copy.reading
                  : bothSubmitted ? copy.ready : copy.waiting}
          </CardTitle>
          <CardDescription>
            {completed
              ? "正在打开调解报告…"
              : analysisErrorText
                ? analysisErrorText
                : reading ? copy.detail : copy.idle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {completed ? (
            <Link
              href={`/report/${roomId}`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full bg-tang-400 px-7 font-bold text-white shadow-soft hover:bg-tang-500",
              )}
            >
              {copy.action}
            </Link>
          ) : analysisErrorText ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {canRetry ? (
                <Button
                  size="lg"
                  disabled={pending}
                  onClick={retryAnalysis}
                  className="rounded-full bg-tang-400 px-7 font-bold text-white shadow-soft hover:bg-tang-500"
                >
                  {pending ? (
                    <Loader2 className="motion-safe:animate-spin" />
                  ) : (
                    <RotateCw />
                  )}
                  {pending ? "重试中…" : "重试分析"}
                </Button>
              ) : null}
              <Link
                href={`/room/${roomId}?legacy=1`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full border-2 border-tang-200 text-tang-600 hover:border-tang-400",
                )}
              >
                查看房间详情
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-cocoa-400">
                <Loader2 className="size-4 motion-safe:animate-spin" />
                {reading
                  ? "分析通常需要 10–30 秒，请保持页面打开"
                  : copy.idle}
              </div>
              <p className="text-xs leading-5 text-cocoa-400">
                两位参与者看到的是同一份调解报告。
              </p>
              <Link
                href={`/room/${roomId}?legacy=1`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full text-cocoa-500",
                )}
              >
                查看房间详情
              </Link>
            </>
          )}

          <p className="flex items-start gap-1.5 text-left text-[11px] leading-5 text-cocoa-400">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
            AI 分析仅辅助沟通，不替代专业心理、法律或危机干预服务。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
