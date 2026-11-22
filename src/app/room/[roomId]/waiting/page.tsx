"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Check, Copy, Loader2 } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState } from "@/lib/room-api"
import { derivePhase, phaseAtLeast } from "@/lib/room-phase"
import type { ParticipantCredentials, RoomStateResponse } from "@/lib/room-types"

const POLL_INTERVAL = 3000

export default function WaitingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="mt-4 h-56 rounded-3xl" />
        </div>
      }
    >
      <WaitingContent />
    </Suspense>
  )
}

function WaitingContent() {
  const router = useRouter()
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const [credentials, setCredentials] = useState<ParticipantCredentials | null>(null)
  const [state, setState] = useState<RoomStateResponse | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const creds = loadCredentials(roomId)
      if (!creds) {
        setError("没有找到这个房间的访问凭证，请重新加入房间")
        return
      }
      setCredentials(creds)
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId])

  useEffect(() => {
    if (!credentials) return
    let stopped = false

    async function tick() {
      try {
        const latest = await fetchRoomState(roomId, credentials!.accessToken)
        if (stopped) return
        setState(latest)

        const phase = derivePhase(latest)
        if (phaseAtLeast(phase, "feedback")) {
          router.replace(`/room/${roomId}/feedback`)
        } else if (phase !== "waiting") {
          // 我方尚未提交（例如换了浏览器）：退回陈述页
          router.replace(`/room/${roomId}/${phase}`)
        }
      } catch (err) {
        if (!stopped) setError(err instanceof Error ? err.message : "同步房间状态失败")
      }
    }

    void tick()
    const interval = setInterval(tick, POLL_INTERVAL)
    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [credentials, roomId, router])

  async function copyInviteCode() {
    if (!state) return
    try {
      await navigator.clipboard.writeText(state.room.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("复制失败，请手动记录邀请码")
    }
  }

  if (!state && !error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="mt-4 h-56 rounded-3xl" />
      </div>
    )
  }

  if (error && !state) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <Card className="rounded-3xl border-tang-100 text-center shadow-soft">
          <CardHeader>
            <CardTitle className="text-cocoa-700">进不去这个房间</CardTitle>
            <CardDescription>{error}</CardDescription>
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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <FlowHeader
        current="waiting"
        inviteCode={state!.room.inviteCode}
        topic={state!.room.topic}
        relation={state!.room.disputeType}
        bothSubmitted={false}
      />

      <Card className="rounded-3xl border-tang-100 text-center shadow-soft">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-tang-100 text-2xl">
            🐾
          </div>
          <CardTitle className="mt-2 text-lg text-cocoa-700">
            {state!.otherSubmitted ? "双方都已提交" : "陈述已提交，等对方落笔"}
          </CardTitle>
          <CardDescription>
            {state!.otherSubmitted
              ? "判判猫正在整理你们的观点，马上就好。"
              : "页面会自动检查对方是否提交，你可以先把这个邀请码发给 TA。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-cream-100 px-4 py-2">
            <span className="text-xs font-bold text-cocoa-400">邀请码</span>
            <span className="font-mono text-lg font-extrabold tracking-widest text-tang-600">
              {state!.room.inviteCode}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyInviteCode}
              className="rounded-full text-cocoa-500 hover:text-tang-500"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>

          {!state!.otherSubmitted ? (
            <div className="flex items-center gap-2 text-xs text-cocoa-400">
              <Loader2 className="size-4 animate-spin" />
              每 3 秒自动刷新一次
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs leading-5 text-cocoa-400">
        你的陈述在提交后不可修改 · 对方永远看不到原文
      </p>
    </div>
  )
}
