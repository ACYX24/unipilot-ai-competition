"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { CatMascot } from "@/components/cat-mascot"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveCredentials } from "@/lib/credentials-storage"
import { createRoom } from "@/lib/room-api"
import { DISPUTE_TYPES } from "@/lib/room-types"
import { cn } from "@/lib/utils"

export default function CreateRoomPage() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [disputeType, setDisputeType] = useState<string>(DISPUTE_TYPES[6])
  const [displayName, setDisplayName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = topic.trim() && displayName.trim() && !submitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError("")
    try {
      const result = await createRoom({ topic, disputeType, displayName })
      saveCredentials(result)
      router.push(`/room/${result.roomId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请稍后重试")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-24">
          <CatMascot />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-cocoa-800 sm:text-3xl">
          创建你们的调解房间
        </h1>
        <p className="text-sm text-cocoa-500">
          说说你们的小矛盾，创建后把邀请码发给对方
        </p>
      </div>

      <Card className="gap-0 rounded-3xl border-tang-100 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg text-cocoa-700">房间信息</CardTitle>
          <CardDescription>
            创建后你将成为用户 A，拥有独立的访问凭证
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">你们想调解什么？</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="例如：周末到底该去爬山还是宅家看剧？"
                maxLength={200}
                className="min-h-24 rounded-2xl"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>矛盾类型</Label>
              <div className="flex flex-wrap gap-2">
                {DISPUTE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDisputeType(type)}
                    aria-pressed={disputeType === type}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      disputeType === type
                        ? "border-tang-200 bg-tang-100 font-bold text-tang-600"
                        : "border-border bg-white text-cocoa-500 hover:bg-tang-50",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="display-name">你的昵称</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="例如：橘座"
                maxLength={30}
                className="h-11 rounded-xl"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="h-12 rounded-full bg-tang-400 text-base font-bold text-white shadow-soft hover:bg-tang-500"
            >
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? "创建中…" : "创建调解房间"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
