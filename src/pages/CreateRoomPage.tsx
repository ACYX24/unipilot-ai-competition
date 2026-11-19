import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ChipOption, Field, Textarea } from '../components/ui/Field'
import { relationTypes } from '../data/mock'
import { useRoom } from '../state/RoomContext'

export function CreateRoomPage() {
  const navigate = useNavigate()
  const { createRoom, room } = useRoom()
  const [topic, setTopic] = useState('')
  const [relationId, setRelationId] = useState('')
  const [created, setCreated] = useState<{ roomId: string; inviteCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const relation = relationTypes.find((r) => r.id === relationId)
  const canSubmit = topic.trim().length >= 4 && relation !== undefined

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      setError('再补充一点～请填写至少 4 个字的争议描述，并选择关系类型。')
      return
    }
    const roomId = createRoom(topic.trim(), relation!.label)
    setCreated({ roomId, inviteCode: roomId.replace('cat-', 'CAT-') })
  }

  async function copyCode() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('复制失败，请手动记录邀请码。')
    }
  }

  /* 创建成功 → 展示邀请码，等待 B 加入 */
  if (created) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="text-center !p-8 md:!p-10">
          <CatMascot className="w-16 h-16 mx-auto" />
          <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-cocoa-800">
            房间创建成功！
          </h1>
          <p className="mt-3 text-sm text-cocoa-500 leading-relaxed">
            房间主题：{room.topic}
            <br />
            关系类型：{room.relation}
          </p>

          <div className="mt-7">
            <p className="text-xs font-bold text-cocoa-400 tracking-widest">把邀请码发给对方</p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="text-3xl md:text-4xl font-extrabold tracking-[0.3em] text-tang-500 select-all">
                {created.inviteCode}
              </span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="secondary" onClick={copyCode}>
                {copied ? '已复制 ✓' : '复制邀请码 📋'}
              </Button>
              <Button onClick={() => navigate(`/room/${created.roomId}/statement`)}>
                不等了，我先写陈述 ✍️
              </Button>
            </div>
          </div>

          <p className="mt-6 text-xs text-cocoa-400 bg-cream-200/60 rounded-2xl px-4 py-3 leading-relaxed">
            对方在「加入房间」页输入邀请码即可进入。在对方加入之前，你可以先完成独立陈述——
            你们互相看不到彼此的文字。
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        <CatMascot className="w-16 h-16 mx-auto" />
        <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-cocoa-800">
          创建调解房间
        </h1>
        <p className="mt-3 text-sm md:text-base text-cocoa-500">
          说说你们之间发生了什么？CatJudge 会为你们开一间温柔的调解小屋 🏠
        </p>
      </div>

      <Card className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="争议事件描述"
            hint="一句话说清楚事情，例如：纪念日他迟到了 40 分钟，还怪我没提前订好餐厅"
          >
            <Textarea
              rows={3}
              placeholder="我们之间发生了……"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </Field>

          <div>
            <span className="block mb-3 font-bold text-cocoa-600 text-sm">你们的关系类型</span>
            <div className="flex flex-wrap gap-2.5">
              {relationTypes.map((t) => (
                <ChipOption key={t.id} selected={relationId === t.id} onClick={() => setRelationId(t.id)}>
                  {t.emoji} {t.label}
                </ChipOption>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm font-bold text-blush-500 bg-blush-300/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={!canSubmit}>
              创建房间并生成邀请码 ⚖️
            </Button>
            <Badge tone="neutral">演示模式 · 数据仅存于本机</Badge>
          </div>

          <p className="text-xs text-cocoa-400 leading-relaxed">
            创建后你将获得 6 位邀请码，对方凭码加入。双方将分别进行
            <span className="font-bold text-cocoa-500">互不可见的独立陈述</span>
            ，之后由 AI 提供私人反馈与观点转述。
          </p>
        </form>
      </Card>
    </div>
  )
}
