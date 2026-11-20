"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
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
            className="h-12 rounded-full px-7 text-base"
          />
        }
      >
        加入调解房间
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>加入调解房间</DialogTitle>
          <DialogDescription>
            输入对方分享给你的房间邀请码，你将成为用户 B。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-code">房间邀请码</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="8 位字母与数字"
              autoComplete="off"
              maxLength={12}
              className="h-11 rounded-xl uppercase"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="join-display-name">你的昵称</Label>
            <Input
              id="join-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如：奶盖"
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
            className="h-11 rounded-full"
          >
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? "加入中…" : "进入房间"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
