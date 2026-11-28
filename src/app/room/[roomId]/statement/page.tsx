"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, LockKeyhole } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { RoomScene } from "@/components/room-scene"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState, submitStatement } from "@/lib/room-api"
import {
  STATEMENT_MAX_LENGTH,
  parseStatementDraft,
} from "@/lib/statement-content"
import { derivePhase, phaseAtLeast } from "@/lib/room-phase"
import type { ParticipantCredentials, RoomStateResponse } from "@/lib/room-types"

export default function StatementPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="mt-4 h-64 rounded-3xl" />
        </div>
      }
    >
      <StatementContent />
    </Suspense>
  )
}

function StatementContent() {
  const router = useRouter()
  const params = useParams<{ roomId: string }>()
  const roomId = params.roomId

  const [credentials, setCredentials] = useState<ParticipantCredentials | null>(null)
  const [state, setState] = useState<RoomStateResponse | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 读取凭证 + 房间状态（localStorage 只在浏览器可用）
  useEffect(() => {
    const timer = setTimeout(async () => {
      const creds = loadCredentials(roomId)
      if (!creds) {
        setError("没有找到这个房间的访问凭证，请重新加入房间")
        return
      }
      setCredentials(creds)

      const draftKey = `catjudge:draft:${roomId}:${creds.side}`
      try {
        const saved = localStorage.getItem(draftKey)
        if (saved) setDraft(parseStatementDraft(saved))
      } catch {
        /* 草稿损坏则忽略 */
      }

      try {
        const latest = await fetchRoomState(roomId, creds.accessToken)
        setState(latest)
        const phase = derivePhase(latest)
        if (phaseAtLeast(phase, "waiting")) {
          router.replace(`/room/${roomId}/${phase === "statement" ? "waiting" : phase}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "读取房间状态失败")
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [roomId, router])

  function updateDraft(value: string) {
    setDraft(value)
    if (credentials) {
      try {
        localStorage.setItem(`catjudge:draft:${roomId}:${credentials.side}`, JSON.stringify(value))
      } catch {
        /* 忽略存储失败 */
      }
    }
  }

  const finalContent = draft.trim()
  const contentLength = finalContent.length
  const contentTooLong = contentLength > STATEMENT_MAX_LENGTH
  const canSubmit = Boolean(credentials && contentLength && !contentTooLong && !submitting)

  async function handleSubmit() {
    if (!credentials || !canSubmit) return
    setSubmitting(true)
    setError("")

    try {
      await submitStatement(roomId, credentials.accessToken, finalContent)
      try {
        localStorage.removeItem(`catjudge:draft:${roomId}:${credentials.side}`)
      } catch {
        /* 忽略 */
      }
      router.push(`/room/${roomId}/waiting`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试")
      setSubmitting(false)
    }
  }

  if (!state && !error) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="mt-4 h-64 rounded-3xl" />
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

  if (!state) return null
  const teacher = state.room.mode === "teacher"

  return (
    <div className={teacher ? "court-layout teacher-layout" : "court-layout court-statement-layout"}>
      <FlowHeader
        current="statement"
        mode={state.room.mode}
        inviteCode={state.room.inviteCode}
        topic={state.room.topic}
        relation={state.room.disputeType}
        bothSubmitted={Boolean(state.myStatement) && state.otherSubmitted}
      />

      <RoomScene state={state} phase="statement" />

      <section className={teacher ? "teacher-statement" : "court-statement"} aria-label={teacher ? "写小纸条" : "独立陈述"}>
        {!teacher && (
          <div className="court-statement-invitation">
            <p className="text-sm font-bold text-tang-700">判判猫</p>
            <p className="mt-1 leading-relaxed text-cocoa-800">我先听你说。想从哪儿讲都可以。</p>
          </div>
        )}

        <form
          className={teacher ? "teacher-note-form" : "court-statement-reply"}
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <Label htmlFor="statement-content" className="font-bold text-cocoa-800">{teacher ? "我的小纸条" : "我的陈述"}</Label>
          <p id="statement-hint" className="text-sm leading-relaxed text-cocoa-500">
            {teacher ? "写几句就可以。你希望对方多了解你一点什么？" : "可以聊聊事情经过、你的感受，或接下来想怎么做。"}
          </p>
          <Textarea
            id="statement-content"
            value={draft}
            onChange={(event) => updateDraft(event.target.value)}
            placeholder={teacher ? "当时我真正想说的是……" : "对我来说，事情是这样的……"}
            aria-describedby="statement-hint statement-privacy statement-length"
            aria-invalid={contentTooLong || undefined}
            disabled={submitting}
            className="room-field-control min-h-28 md:text-base"
          />

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {contentTooLong ? (
            <p role="alert" className="text-xs text-destructive">
              陈述超过 {STATEMENT_MAX_LENGTH} 字，精简后就可以提交。
            </p>
          ) : null}

          <p id="statement-privacy" className="flex items-start gap-1.5 text-xs leading-relaxed text-cocoa-500">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            {teacher ? "小纸条原文只交给猫老师。老师读完两张纸条后，会为你们整理一份共同回顾。" : "对方看不到你的原文。双方提交后，判判猫会整理成和解报告。"}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs leading-relaxed text-cocoa-500">
              <p id="statement-length" className={contentTooLong ? "text-destructive" : "tabular-nums"}>
                {contentLength}/{STATEMENT_MAX_LENGTH} 字
              </p>
              <p>提交后不可修改</p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="action-primary shrink-0"
            >
              {submitting ? <Loader2 className="motion-safe:animate-spin" /> : null}
              {submitting ? "提交中…" : teacher ? "把小纸条交给老师" : "提交我的陈述"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
