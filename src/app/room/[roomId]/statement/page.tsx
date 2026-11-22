"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { FlowHeader } from "@/components/flow-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState, submitStatement } from "@/lib/room-api"
import {
  STATEMENT_MAX_LENGTH,
  buildStatementContent,
} from "@/lib/statement-content"
import { derivePhase, phaseAtLeast } from "@/lib/room-phase"
import type { ParticipantCredentials, RoomStateResponse } from "@/lib/room-types"

const QUESTIONS = [
  {
    id: "events",
    emoji: "📖",
    title: "事情经过",
    hint: "尽量只描述你看到的「事实」，先不评价对方。",
    placeholder: "那天发生了什么？按时间顺序说说你的版本……",
  },
  {
    id: "feelings",
    emoji: "💭",
    title: "你当时的感受",
    hint: "用「我感到……」开头，会比「你总是……」更容易被听进去。",
    placeholder: "那一刻你的心情是什么样的？",
  },
  {
    id: "concern",
    emoji: "🎯",
    title: "你最在意的问题",
    hint: "如果只能挑一件事说清楚，你想挑哪件？",
    placeholder: "这件事里，真正戳到你的是什么？",
  },
  {
    id: "understand",
    emoji: "👂",
    title: "你希望对方理解的内容",
    hint: "换成一句话，你最想让 TA 明白什么？",
    placeholder: "我希望 TA 知道……",
  },
  {
    id: "change",
    emoji: "🌱",
    title: "你希望对方做出的改变",
    hint: "具体、小步、可执行的改变，比「你必须变一个人」更有效。",
    placeholder: "下次遇到类似情况，你希望 TA 怎么做？",
  },
] as const

type QuestionId = (typeof QUESTIONS)[number]["id"]
type Draft = Record<QuestionId, string>

const EMPTY_DRAFT: Draft = {
  events: "",
  feelings: "",
  concern: "",
  understand: "",
  change: "",
}

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
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
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
        if (saved) setDraft({ ...EMPTY_DRAFT, ...(JSON.parse(saved) as Partial<Draft>) })
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

  function updateDraft(id: QuestionId, value: string) {
    setDraft((prev) => {
      const next = { ...prev, [id]: value }
      if (credentials) {
        try {
          localStorage.setItem(`catjudge:draft:${roomId}:${credentials.side}`, JSON.stringify(next))
        } catch {
          /* 忽略存储失败 */
        }
      }
      return next
    })
  }

  const answeredCount = QUESTIONS.filter((q) => draft[q.id].trim()).length
  const finalContent = buildStatementContent(
    QUESTIONS.map((question) => ({
      title: question.title,
      value: draft[question.id],
    })),
  )
  const contentLength = finalContent.length
  const contentTooLong = contentLength > STATEMENT_MAX_LENGTH
  const canSubmit =
    answeredCount === QUESTIONS.length && !contentTooLong && !submitting

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

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <FlowHeader
        current="statement"
        inviteCode={state!.room.inviteCode}
        topic={state!.room.topic}
        relation={state!.room.disputeType}
        bothSubmitted={state!.otherSubmitted}
      />

      <Card className="rounded-3xl border-tang-100 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg text-cocoa-700">写下你的版本</CardTitle>
          <CardDescription>
            TA 看不到你的原文：这些内容只有你和判判猫能看到，提交后才会进入下一阶段。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {QUESTIONS.map((question) => (
            <div key={question.id} className="flex flex-col gap-2">
              <Label htmlFor={question.id} className="text-cocoa-700">
                <span className="mr-1">{question.emoji}</span>
                {question.title}
              </Label>
              <p className="text-xs leading-5 text-cocoa-400">{question.hint}</p>
              <Textarea
                id={question.id}
                value={draft[question.id]}
                onChange={(event) => updateDraft(question.id, event.target.value)}
                placeholder={question.placeholder}
                maxLength={2000}
                className="min-h-24 rounded-2xl border-tang-100 bg-white"
              />
            </div>
          ))}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {contentTooLong ? (
            <p role="alert" className="text-xs text-destructive">
              最终陈述超过 {STATEMENT_MAX_LENGTH}{" "}
              字（含标题与换行），请精简后再提交。
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={
                contentTooLong
                  ? "text-xs text-destructive"
                  : "text-xs text-cocoa-400"
              }
            >
              已填写 {answeredCount}/{QUESTIONS.length} 个问题 · 最终陈述{" "}
              {contentLength}/{STATEMENT_MAX_LENGTH} 字 · 提交后不可修改
            </p>
            <Button
              size="lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="h-11 rounded-full bg-tang-400 px-7 font-bold text-white shadow-soft hover:bg-tang-500"
            >
              {submitting ? <Loader2 className="animate-spin" /> : null}
              {submitting ? "提交中…" : "提交我的陈述"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
