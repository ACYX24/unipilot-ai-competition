"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, RotateCw, ShieldAlert } from "lucide-react"
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

  const completed = state?.room.status === "completed"
  const analysisErrorText = pending
    ? ""
    : analysisFailure?.message ??
      formatAnalysisError(state?.analysis.errorCode)
  const canRetry = analysisFailure
    ? isAnalysisErrorRetryable(analysisFailure.code)
    : isAnalysisErrorRetryable(state?.analysis.errorCode)
  const generating = pending || Boolean(state?.analysis.leaseActive)

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      {state ? (
        <FlowHeader
          current="feedback"
          inviteCode={state.room.inviteCode}
          topic={state.room.topic}
          relation={state.room.disputeType}
          bothSubmitted
        />
      ) : null}

      <Card className="rounded-3xl border-tang-100 text-center shadow-soft">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-tang-100 text-2xl">
            {completed ? "💌" : analysisErrorText ? "🐾" : "🔍"}
          </div>
          <CardTitle className="mt-2 text-lg text-cocoa-700">
            {completed
              ? "调解报告已生成"
              : analysisErrorText
                ? "这次分析没有完成"
                : generating
                  ? "判判猫正在整理你们的观点"
                  : "准备开始分析"}
          </CardTitle>
          <CardDescription>
            {completed
              ? "正在打开调解报告…"
              : analysisErrorText
                ? analysisErrorText
                : "双方陈述已收到。AI 会生成观点总结、情绪与需求、沟通误区与改善建议，完成后自动打开调解报告。"}
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
              查看调解报告
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
                    <Loader2 className="animate-spin" />
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
                <Loader2 className="size-4 animate-spin" />
                {generating
                  ? "正在分析，通常需要 10–30 秒，请保持页面打开"
                  : "即将开始分析…"}
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