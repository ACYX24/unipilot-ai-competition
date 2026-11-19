import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Textarea } from '../components/ui/Field'
import { mockRoom, type RoomMessage } from '../data/mock'

const sideStyles = {
  A: { align: 'justify-start', bubble: 'bg-white border-tang-200', name: 'text-tang-600' },
  B: { align: 'justify-end', bubble: 'bg-white border-matcha-300/60', name: 'text-matcha-500' },
} as const

function MessageCard({ msg }: { msg: RoomMessage }) {
  if (msg.side === 'judge') {
    return (
      <div className="flex justify-center">
        <div className="max-w-lg bg-tang-100/70 border border-tang-200 rounded-3xl px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 font-extrabold text-tang-600 text-sm">
            <CatMascot className="w-7 h-7" /> 判判猫 · 主持中
          </div>
          <p className="mt-2 text-sm text-cocoa-600 leading-relaxed">{msg.text}</p>
        </div>
      </div>
    )
  }

  const s = sideStyles[msg.side]
  return (
    <div className={`flex ${s.align}`}>
      <div className={`max-w-[85%] md:max-w-md ${s.bubble} border-2 rounded-3xl px-5 py-4 shadow-soft`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`font-extrabold text-sm ${s.name}`}>
            {msg.side === 'A' ? '🐱' : '🐑'} {msg.author}
          </span>
          <span className="text-xs text-cocoa-400">{msg.time}</span>
        </div>
        <p className="mt-2 text-sm text-cocoa-600 leading-relaxed">{msg.text}</p>
      </div>
    </div>
  )
}

export function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<RoomMessage[]>(mockRoom.messages)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // 演示：新发言默认以「橘座(甲方)」身份加入
  function handleSpeak() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        side: 'A' as const,
        author: '橘座',
        text,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setDraft('')
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 房间头部 */}
      <Card className="!p-5 md:!p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="orange">判判小屋 · {roomId}</Badge>
              <Badge tone="matcha">{mockRoom.status}</Badge>
              <Badge tone="neutral">
                第 {mockRoom.round}/{mockRoom.maxRounds} 轮
              </Badge>
            </div>
            <h1 className="mt-3 text-lg md:text-xl font-extrabold text-cocoa-800 leading-snug">
              ⚖️ {mockRoom.topic}
            </h1>
          </div>
          <Link to="/create">
            <Button variant="ghost" size="sm">
              换个话题
            </Button>
          </Link>
        </div>

        {/* 双方成员状态 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {mockRoom.members.map((m) => (
            <div
              key={m.side}
              className={`rounded-2xl border-2 px-4 py-3 flex items-center gap-3 ${
                m.side === 'A' ? 'border-tang-200 bg-tang-50' : 'border-matcha-300/50 bg-matcha-300/10'
              }`}
            >
              <span className="text-2xl">{m.avatar}</span>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-cocoa-700 truncate">
                  {m.side === 'A' ? '甲方' : '乙方'} · {m.name}
                </p>
                <p className="text-xs text-cocoa-400">
                  {m.joined ? (m.ready ? '已准备 ✓' : '已加入 · 思考中') : '等待加入…'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 陈述时间线 */}
      <Card className="!p-5 md:!p-6">
        <h2 className="font-extrabold text-cocoa-700">陈述记录 📜</h2>
        <p className="text-xs text-cocoa-400 mt-1">
          这不是聊天，是正式陈述——每一句都会被判判猫记进小本本 🐾
        </p>
        <div className="mt-5 space-y-4">
          {messages.map((m) => (
            <MessageCard key={m.id} msg={m} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 发言输入 */}
        <div className="mt-6 border-t border-cream-300 pt-5">
          <Textarea
            rows={2}
            placeholder="轮到你陈述了…平静地表达你的观点吧（演示中默认以甲方身份发言）"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSpeak()
              }
            }}
          />
          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button onClick={handleSpeak} disabled={!draft.trim()} className="sm:flex-1">
              提交本轮陈述 ✍️
            </Button>
            <Button
              variant="secondary"
              className="sm:flex-1"
              onClick={() => navigate(`/result/${roomId}`)}
            >
              双方说完了，请判判猫宣判 💛
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
