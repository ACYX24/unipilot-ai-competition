import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SheepMascot } from '../components/brand/Mascot'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, Input } from '../components/ui/Field'
import { useRoom } from '../state/RoomContext'

export function JoinRoomPage() {
  const navigate = useNavigate()
  const { joinRoom } = useRoom()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const norm = code.trim().toUpperCase()
    if (!/^CAT-[A-Z0-9]{4,8}$/.test(norm)) {
      setError('邀请码格式像是不对哦～应为 CAT- 开头的 6 位码，例如 CAT-DEMO。')
      return
    }
    const roomId = joinRoom(norm)
    navigate(`/room/${roomId}/statement`)
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center">
        <SheepMascot className="w-16 h-16 mx-auto" />
        <h1 className="mt-4 text-2xl md:text-4xl font-extrabold text-cocoa-800">
          加入调解房间
        </h1>
        <p className="mt-3 text-sm md:text-base text-cocoa-500">
          输入对方发给你的邀请码，开始你的独立陈述 🐾
        </p>
      </div>

      <Card className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="邀请码" hint="不区分大小写；演示环境可直接使用 CAT-DEMO">
            <Input
              placeholder="CAT-XXXXXX"
              maxLength={12}
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError('')
              }}
              className="tracking-[0.2em] font-bold"
            />
          </Field>

          {error && (
            <p className="text-sm font-bold text-blush-500 bg-blush-300/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" size="lg" className="w-full sm:flex-1" disabled={code.trim() === ''}>
              加入房间 →
            </Button>
            <Link to="/create" className="w-full sm:w-auto">
              <Button type="button" size="lg" variant="secondary" className="w-full">
                没有邀请码？创建一个
              </Button>
            </Link>
          </div>

          <p className="text-xs text-cocoa-400 leading-relaxed">
            加入后你只能看到自己的陈述与自己的私人反馈；对方的原始文字永远不会出现在你的界面上。
          </p>
        </form>
      </Card>
    </div>
  )
}
