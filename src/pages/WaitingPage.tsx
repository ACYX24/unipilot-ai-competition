import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { CatMascot, SheepMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useRoom } from '../state/RoomContext'

function SideStatus({
  avatar,
  name,
  role,
  joined,
  submitted,
  isMe,
}: {
  avatar: string
  name: string
  role: string
  joined: boolean
  submitted: boolean
  isMe: boolean
}) {
  return (
    <div
      className={`rounded-2xl border-2 px-4 py-4 flex items-center gap-3 ${
        isMe ? 'border-tang-300 bg-tang-50' : 'border-cream-300 bg-white'
      }`}
    >
      <span className="text-3xl">{avatar}</span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-sm text-cocoa-700 truncate">
          {role} · {name} {isMe && <span className="text-tang-500">（你）</span>}
        </p>
        <p className="text-xs text-cocoa-400 mt-0.5">
          {!joined ? '尚未加入房间…' : submitted ? '已完成独立陈述 ✓' : '正在书写陈述…'}
        </p>
      </div>
      <span
        className={`w-3 h-3 rounded-full shrink-0 ${
          submitted ? 'bg-matcha-500' : joined ? 'bg-tang-300 animate-pulse' : 'bg-cream-300'
        }`}
      />
    </div>
  )
}

export function WaitingPage() {
  const { roomId } = useParams()
  const { room, side, me, other, bothSubmitted, simulatePeerSubmit } = useRoom()
  const [aiSeconds, setAiSeconds] = useState(0)

  /* 双方提交后由 AI 分别生成私人报告（模拟生成进度） */
  useEffect(() => {
    if (!bothSubmitted) return
    const t = setInterval(() => setAiSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [bothSubmitted])

  if (!me.submitted) return <Navigate to={`/room/${roomId}/statement`} replace />
  if (me.feedbackRead) return <Navigate to={`/room/${roomId}/feedback`} replace />

  /* 双方提交完成 → AI 模拟阅读生成私人报告的过渡页 */
  if (bothSubmitted) {
    const ready = aiSeconds >= 3
    const pct = Math.min(100, (aiSeconds / 3) * 100)
    return (
      <div className="max-w-xl mx-auto">
        <FlowHeader current="waiting" />
        <Card className="text-center !p-10">
          <CatMascot className="w-20 h-20 mx-auto animate-pulse" />
          <h1 className="mt-5 text-2xl font-extrabold text-cocoa-800">
            {ready ? '私人反馈已就绪 💌' : '判判猫正在认真阅读…🐾'}
          </h1>
          <p className="mt-3 text-sm text-cocoa-500 leading-relaxed">
            双方陈述已完成。AI 正在分别为你们撰写私人报告——
            每封报告只有收件人自己能拆开。
          </p>
          <div className="mt-6 h-2.5 rounded-full bg-cream-200 overflow-hidden">
            <div className="h-full rounded-full bg-tang-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-cocoa-400">已分析 {aiSeconds} 秒（模拟）</p>
          {ready ? (
            <Link to={`/room/${roomId}/feedback`} className="block mt-6">
              <Button size="lg" className="w-full">
                拆开我的那封信 →
              </Button>
            </Link>
          ) : (
            <Link to={`/room/${roomId}/feedback`} className="inline-block mt-6">
              <Button size="sm" variant="ghost">
                等不及了，直接查看
              </Button>
            </Link>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <FlowHeader current="waiting" />

      <Card className="text-center !p-8">
        <div className="flex items-center justify-center gap-5">
          <CatMascot className="w-14 h-14" />
          <span className="text-2xl animate-bounce">💤</span>
          <SheepMascot className="w-14 h-14" />
        </div>
        <h1 className="mt-5 text-2xl md:text-3xl font-extrabold text-cocoa-800">
          你已提交，等待对方完成
        </h1>
        <p className="mt-3 text-sm text-cocoa-500 leading-relaxed max-w-md mx-auto">
          {other.name}还在写 TA 的独立陈述。放心，你们互相看不到彼此的文字——
          双方都提交后，判判猫会分别给你们写一封只有自己能拆开的信 💌
        </p>

        <div className="mt-7 grid gap-3 text-left">
          <SideStatus
            avatar={room.A.avatar}
            name={room.A.name}
            role="甲方"
            joined={room.A.joined}
            submitted={room.A.submitted}
            isMe={side === 'A'}
          />
          <SideStatus
            avatar={room.B.avatar}
            name={room.B.name}
            role="乙方"
            joined={room.B.joined}
            submitted={room.B.submitted}
            isMe={side === 'B'}
          />
        </div>

        {/* 演示辅助 */}
        <div className="mt-7 rounded-2xl bg-cream-200/60 border border-dashed border-cocoa-400/30 p-4">
          <Badge tone="neutral">🧪 演示模式</Badge>
          <p className="mt-2 text-xs text-cocoa-500 leading-relaxed">
            单人演示时，可模拟对方完成提交（真实产品将等待对方在 TA 的设备上提交）。
          </p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={simulatePeerSubmit}>
            模拟「{other.name}」完成提交
          </Button>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-cocoa-400">
        提示：可以随时用顶部「演示视角」切换到 {other.name} 的身份体验对方流程。
      </p>
    </div>
  )
}
