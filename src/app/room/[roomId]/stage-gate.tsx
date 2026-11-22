"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { loadCredentials } from "@/lib/credentials-storage"
import { fetchRoomState } from "@/lib/room-api"
import { derivePhase } from "@/lib/room-phase"
import { RoomView } from "./room-view"

/**
 * 房间入口的“阶段路由”：
 * 读取凭证 → 拉取 state → 推导阶段 → 跳转到对应阶段页。
 *
 * 兜底：`?legacy=1`、无凭证或请求失败时，退回原有单页 RoomView，
 * 保证 A 已合并的实现仍然可用。
 */
export function RoomStageGate({ roomId }: { roomId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const legacy = searchParams.get("legacy") === "1"
  const [useLegacy, setUseLegacy] = useState(legacy)

  useEffect(() => {
    if (legacy) return

    let cancelled = false

    async function resolve() {
      const credentials = loadCredentials(roomId)
      if (!credentials) {
        if (!cancelled) setUseLegacy(true)
        return
      }

      try {
        const state = await fetchRoomState(roomId, credentials.accessToken)
        if (cancelled) return
        router.replace(`/room/${roomId}/${derivePhase(state)}`)
      } catch {
        if (!cancelled) setUseLegacy(true)
      }
    }

    void resolve()
    return () => {
      cancelled = true
    }
  }, [roomId, legacy, router])

  if (useLegacy) return <RoomView roomId={roomId} />

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  )
}
