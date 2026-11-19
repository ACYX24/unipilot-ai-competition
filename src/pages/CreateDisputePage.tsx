import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ChipOption, Field, Input, Textarea } from '../components/ui/Field'
import { disputeTypes } from '../data/mock'

export function CreateDisputePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [typeId, setTypeId] = useState('')
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const [error, setError] = useState('')

  const canSubmit = topic.trim().length >= 4 && typeId !== '' && nameA.trim() !== '' && nameB.trim() !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) {
      setError('还差一点点～请填写完整的争议描述、类型和双方昵称（描述至少 4 个字）')
      return
    }
    // 模拟创建房间：真实项目中这里会调用后端 API 并返回 roomId
    navigate('/room/demo-room')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        <CatMascot className="w-16 h-16 mx-auto" />
        <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-cocoa-800">
          创建争议事件
        </h1>
        <p className="mt-3 text-sm md:text-base text-cocoa-500">
          说说你们在争执什么？判判猫会为你们开一间专属小屋 🏠
        </p>
      </div>

      <Card className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="争议描述"
            hint="一句话说清楚事情，例如：周末该去爬山还是宅家看剧"
          >
            <Textarea
              rows={3}
              placeholder="我们今天因为……吵了一架"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </Field>

          <div>
            <span className="block mb-3 font-bold text-cocoa-600 text-sm">争议类型</span>
            <div className="flex flex-wrap gap-2.5">
              {disputeTypes.map((t) => (
                <ChipOption key={t.id} selected={typeId === t.id} onClick={() => setTypeId(t.id)}>
                  {t.emoji} {t.label}
                </ChipOption>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="甲方昵称 🐱">
              <Input
                placeholder="例如：橘座"
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
              />
            </Field>
            <Field label="乙方昵称 🐑">
              <Input
                placeholder="例如：羊咩"
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm font-bold text-blush-500 bg-blush-300/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={!canSubmit}>
              创建判判小屋 ⚖️
            </Button>
            <Badge tone="neutral">当前为演示模式 · 不保存数据</Badge>
          </div>
        </form>
      </Card>
    </div>
  )
}
