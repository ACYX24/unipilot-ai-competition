import { useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { ModePicker } from "@/components/mode-picker"
import { Button } from "@/components/ui/button"
import { saveSessionCredentials } from "@/lib/credentials-storage"
import { RoomApiError, createRoom, joinRoom, submitStatement } from "@/lib/room-api"
import type { CreateRoomResponse, JoinRoomResponse, RoomMode } from "@/lib/room-types"
import Link from "./link"
import { useRouter } from "./navigation"

const DEMO_KEY = "catjudge:contest-demo"
const CASE_TOPIC = "周六是一起出门，还是各自休息？"
const statements = {
  A: "这几周我们的空闲时间一直没碰上。我想周六一起出去走走，不一定要跑得很远。如果只是临时说不去了，我会觉得自己的期待没被听见。我希望我们把想做的事提前约好。",
  B: "这一周事情太多，我想给自己留半天休息。听到一早就要出门，我有点紧张，不是因为不想相处。我们可以晚一点约，或者先一起吃个晚饭。",
}

type DemoRoom = { a: CreateRoomResponse; b?: JoinRoomResponse }

function readDemoRoom(): DemoRoom | null {
  const raw = sessionStorage.getItem(DEMO_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoRoom
  } catch {
    return null
  }
}

export function DemoPage() {
  const router = useRouter()
  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [needsNewRoom, setNeedsNewRoom] = useState(false)
  const [mode, setMode] = useState<RoomMode>("court")

  async function begin(reset = false) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setError("")
    setNeedsNewRoom(false)
    try {
      if (reset) sessionStorage.removeItem(DEMO_KEY)
      let room = readDemoRoom()
      if (!room || (room.a.mode ?? "court") !== mode) {
        room = {
          a: await createRoom({ topic: CASE_TOPIC, disputeType: "周末安排", displayName: "小橘", mode }),
        }
        sessionStorage.setItem(DEMO_KEY, JSON.stringify(room))
      }
      const { a } = room
      if (!room.b) {
        room.b = await joinRoom({ inviteCode: a.inviteCode, displayName: "小羊" })
        sessionStorage.setItem(DEMO_KEY, JSON.stringify(room))
      }
      await submitStatement(a.roomId, a.accessToken, statements.A)
      await submitStatement(room.b.roomId, room.b.accessToken, statements.B)
      saveSessionCredentials(a)
      sessionStorage.removeItem(DEMO_KEY)
      router.push(`/room/${a.roomId}/feedback`)
    } catch (cause) {
      setNeedsNewRoom(cause instanceof RoomApiError && [401, 404, 409, 410].includes(cause.status))
      setError(cause instanceof RoomApiError ? cause.message : "连接暂时中断，请稍后重试。")
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  return (
    <div className="site-container max-w-4xl py-10 sm:py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium underline">
        <ArrowLeft size={16} aria-hidden="true" /> 返回首页
      </Link>
      <section aria-labelledby="demo-heading" className="rounded-[2rem] border border-border bg-card p-6 sm:p-10">
        <h1 id="demo-heading" className="display-heading text-3xl sm:text-5xl">{CASE_TOPIC}</h1>
        <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
          小橘和小羊遇到了一件虚构的小事。选一种方式，看看系统如何把两边的想法整理成同一份报告。
        </p>
        <div className="mt-6">
          <ModePicker mode={mode} onChange={setMode} disabled={pending} />
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-border p-5">
            <h2 className="font-semibold">小橘</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{statements.A}</p>
          </article>
          <article className="rounded-2xl border border-border p-5">
            <h2 className="font-semibold">小羊</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{statements.B}</p>
          </article>
        </div>
        {error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
        <Button size="lg" className="action-primary mt-7" disabled={pending} onClick={() => void begin(needsNewRoom)}>
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          {pending ? "正在提交双方表达…" : needsNewRoom ? "重开体验房间" : error ? "重试提交" : "提交两份表达并开始调解"}
        </Button>
      </section>
    </div>
  )
}
