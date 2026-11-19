"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

export function JoinRoomDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")

  const normalizedCode = code.trim().toUpperCase()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!normalizedCode) return
    setOpen(false)
    router.push(`/room/${normalizedCode}`)
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
            输入对方分享给你的房间邀请码，即可进入同一间调解室。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-code">房间邀请码</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="例如 CAT888"
              autoComplete="off"
              maxLength={12}
              className="h-11 rounded-xl uppercase"
            />
            <p className="text-xs text-muted-foreground">
              演示阶段输入任意邀请码即可进入示例房间（如 CAT888）。
            </p>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!normalizedCode}
            className="h-11 rounded-full"
          >
            进入房间
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
