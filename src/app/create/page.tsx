"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react"
import { CatMascot } from "@/components/cat-mascot"
import { TeacherPortrait } from "@/components/teacher-office-art"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveCredentials } from "@/lib/credentials-storage"
import { createRoom } from "@/lib/room-api"
import { DISPUTE_TYPES, type RoomMode } from "@/lib/room-types"

export default function CreateRoomPage() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [mode, setMode] = useState<RoomMode>("court")
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
      const result = await createRoom({ topic, disputeType, displayName, mode })
      saveCredentials(result)
      router.push(`/room/${result.roomId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请稍后重试")
      setSubmitting(false)
    }
  }

  return (
    <div className="site-container create-shell">
      <section className="create-intro" aria-labelledby="create-heading">
        <Link href="/" className="create-back">
          <ArrowLeft size={16} aria-hidden="true" /> 返回首页
        </Link>
        <h1 id="create-heading" className="display-heading">创建调解房间</h1>
        <p>写下你们想聊的事。房间创建后，把邀请码发给对方，就可以分别开始陈述。</p>
        {mode === "teacher" ? (
          <div className="teacher-create-portrait"><TeacherPortrait /></div>
        ) : <CatMascot className="create-portrait" />}
        <p className="create-privacy">
          <LockKeyhole size={16} aria-hidden="true" /> 双方原始陈述互不可见
        </p>
      </section>

      <div className="create-panel">
        <form onSubmit={handleSubmit} className="room-form" aria-label="创建房间表单">
          <fieldset>
            <legend>选择调解方式</legend>
            <div className="mode-choices">
              <label>
                <input type="radio" name="mode" value="court" checked={mode === "court"} onChange={() => setMode("court")} />
                <span><strong>猫法官</strong><small>各自陈述，听判判猫宣读调解意见。</small></span>
              </label>
              <label>
                <input type="radio" name="mode" value="teacher" checked={mode === "teacher"} onChange={() => setMode("teacher")} />
                <span><strong>猫老师</strong><small>在办公室交小纸条，再一起练习怎么开口。</small></span>
              </label>
            </div>
          </fieldset>
          <div className="room-field">
            <div className="room-field-caption">
              <Label htmlFor="topic">你们想聊什么？</Label>
              <span aria-hidden="true">{topic.length} / 200</span>
            </div>
            <Textarea
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="例如：周末该去爬山，还是在家看剧？"
              maxLength={200}
              required
              className="room-field-control"
            />
          </div>

          <fieldset>
            <legend>矛盾类型</legend>
            <div className="room-options">
              {DISPUTE_TYPES.map((type) => (
                <label key={type} className="room-option">
                  <input
                    type="radio"
                    name="dispute-type"
                    value={type}
                    checked={disputeType === type}
                    onChange={() => setDisputeType(type)}
                    className="sr-only"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="room-field">
            <Label htmlFor="display-name">你的昵称</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如：橘座"
              maxLength={30}
              required
              className="room-field-control"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={!canSubmit} className="action-primary">
            {submitting && <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />}
            {submitting ? "创建中…" : "创建房间"}
          </Button>
        </form>
      </div>
    </div>
  )
}
