"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SheepWithLetter } from "@/components/cat-mascot"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCredentials } from "@/lib/credentials-storage"
import { joinRoom } from "@/lib/room-api"

export function JoinRoomDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const normalizedCode = code.trim().toUpperCase()
  const canSubmit = normalizedCode && displayName.trim() && !submitting

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    setError("")
    try {
      const result = await joinRoom({
        inviteCode: normalizedCode,
        displayName: displayName.trim(),
      })
      saveCredentials(result)
      setOpen(false)
      router.push(`/room/${result.roomId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失败，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="action-secondary"
          />
        }
      >
        加入房间
      </DialogTrigger>
      <DialogContent className="join-panel rounded-2xl p-6 sm:max-w-md sm:p-7">
        <DialogHeader>
          <SheepWithLetter className="size-16" />
          <DialogTitle className="display-heading text-2xl">加入调解房间</DialogTitle>
          <DialogDescription>
            输入对方发给你的邀请码，就能进入同一个房间。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="room-form">
          <div className="room-field">
            <Label htmlFor="invite-code">房间邀请码</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="8 位字母与数字"
              autoComplete="off"
              maxLength={12}
              autoCapitalize="characters"
              spellCheck={false}
              required
              className="room-field-control uppercase"
            />
          </div>
          <div className="room-field">
            <Label htmlFor="join-display-name">你的昵称</Label>
            <Input
              id="join-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如：奶盖"
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
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit}
            className="action-primary"
          >
            {submitting && <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />}
            {submitting ? "加入中…" : "进入房间"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
