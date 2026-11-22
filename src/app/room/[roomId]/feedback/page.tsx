"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState } from "@/lib/room-api"
import type { RoomStateResponse } from "@/lib/room-types"
import { cn } from "@/lib/utils"

/**
 * 私人反馈页（占位版）。
 * PR3 只负责把流程走到这里，真正的六段私人反馈在 PR5 接入报告接口后实现。
 * TODO(PR5)：读取 report.personalFeedback，渲染六段结构。
 */
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
  const [state, setState] = useState<RoomStateResponse | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const timer = setTimeout(async () => {
      const creds = loadCredentials(roomId)
      if (!creds) {
        setError("没有找到这个房间的访问凭证，请重新加入房间")
        return
      }
      try {
        const latest = await fetchRoomState(roomId, creds.accessToken)
        if (!latest.myStatement) {
          router.replace(`/room/${roomId}/statement`)
          return
        }
        if (!latest.otherSubmitted) {
          router.replace(`/room/${roomId}/waiting`)
          return
        }
        setState(latest)
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取房间状态失败")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId, router])

  if (!state && !error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="mt-4 h-64 rounded-3xl" />
      </div>
    )
  }

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
            💌
          </div>
          <CardTitle className="mt-2 text-lg text-cocoa-700">判判猫正在写你的私人反馈</CardTitle>
          <CardDescription>
            正在整理双方陈述：做得好的地方、沟通误区、推荐的表达方式，还有一句温柔鼓励。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-cocoa-400">
            <Loader2 className="size-4 animate-spin" />
            AI 反馈接入中（PR5）
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Link
            href={`/room/${roomId}?legacy=1`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full border-2 border-tang-200 text-tang-600 hover:border-tang-400",
            )}
          >
            先看原来的房间视图
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
