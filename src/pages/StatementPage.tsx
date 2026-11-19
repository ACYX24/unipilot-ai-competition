import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Field, Textarea } from '../components/ui/Field'
import { demoStatements, statementQuestions } from '../data/mock'
import { useRoom } from '../state/RoomContext'

export function StatementPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { room, side, me, other, bothSubmitted, updateDraft, submitStatement } = useRoom()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')

  /* 阶段守卫：已完成陈述或双方已提交时，跳转到正确页面 */
  if (bothSubmitted) return <Navigate to={`/room/${roomId}/feedback`} replace />
  if (me.submitted) return <Navigate to={`/room/${roomId}/waiting`} replace />

  const q = statementQuestions[step]
  const value = me.draft[q.id] ?? ''
  const answered = statementQuestions.filter((x) => (me.draft[x.id] ?? '').trim() !== '').length
  const isLast = step === statementQuestions.length - 1

  function fillDemo() {
    for (const item of statementQuestions) {
      updateDraft(item.id, demoStatements[side][item.id])
    }
    setError('')
  }

  function handleSubmit() {
    const missing = statementQuestions.find((x) => (me.draft[x.id] ?? '').trim().length < 4)
    if (missing) {
      const idx = statementQuestions.indexOf(missing)
      setStep(idx)
      setError(`「${missing.title}」还差几个字，写出真实感受才有用哦～`)
      return
    }
    submitStatement(side)
    navigate(`/room/${roomId}/waiting`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <FlowHeader current="statement" />

      {/* 隐私说明 */}
      <div className="flex items-start gap-3 bg-blush-300/15 border border-blush-300/50 rounded-2xl px-4 py-3 mb-5">
        <span className="text-xl leading-none mt-0.5">🙈</span>
        <p className="text-xs md:text-sm text-cocoa-600 leading-relaxed">
          <span className="font-extrabold">这里是私密空间。</span>
          你的陈述只有 AI 会阅读，{other.name}永远看不到你的原文——TA 只会收到经整理的观点转述。请放心说真话。
        </p>
      </div>

      {!other.joined && (
        <Card className="!p-4 mb-5 flex flex-wrap items-center gap-3 !bg-tang-50">
          <span className="text-2xl">✉️</span>
          <p className="text-sm text-cocoa-600 flex-1 min-w-[200px]">
            {other.name}还没加入房间。把邀请码 <span className="font-extrabold text-tang-600">{room.inviteCode}</span> 发给 TA，
            但你现在就可以先写。
          </p>
        </Card>
      )}

      <Card>
        {/* 分步指示 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {statementQuestions.map((x, i) => (
              <button
                key={x.id}
                onClick={() => setStep(i)}
                aria-label={`第 ${i + 1} 题`}
                className={`w-8 h-2 rounded-full transition-colors cursor-pointer ${
                  i === step
                    ? 'bg-tang-400'
                    : (me.draft[x.id] ?? '').trim()
                      ? 'bg-tang-200'
                      : 'bg-cream-300 hover:bg-tang-100'
                }`}
              />
            ))}
          </div>
          <Badge tone="neutral">
            已答 {answered}/{statementQuestions.length} · 草稿自动保存 💾
          </Badge>
        </div>

        <div className="mt-6">
          <p className="text-3xl">{q.emoji}</p>
          <h2 className="mt-2 text-lg md:text-xl font-extrabold text-cocoa-800">
            第 {step + 1} 问 · {q.title}
          </h2>
          <div className="mt-4">
            <Field label={`以「${me.name}」的身份回答`} hint={q.hint}>
              <Textarea
                rows={6}
                placeholder={q.placeholder}
                value={value}
                onChange={(e) => {
                  updateDraft(q.id, e.target.value)
                  setError('')
                }}
              />
            </Field>
          </div>

          {error && (
            <p className="mt-3 text-sm font-bold text-blush-500 bg-blush-300/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* 操作区 */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ← 上一问
          </Button>
          {!isLast ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              下一问 →
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleSubmit}>
              确认无误，提交我的陈述 🔒
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={fillDemo}>
            🧪 一键填入演示内容
          </Button>
          {!isLast && answered === statementQuestions.length && (
            <Button variant="secondary" size="sm" onClick={handleSubmit}>
              都写完了，直接提交 ✍️
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-cocoa-400">
        <CatMascot className="w-6 h-6" />
        <p>判判猫正在小本本上等你，慢慢写，不着急 🐾</p>
      </div>
    </div>
  )
}
