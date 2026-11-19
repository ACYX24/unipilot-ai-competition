import { Link, Navigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { sharedAnalysis } from '../data/mock'
import { useRoom } from '../state/RoomContext'

export function SharedAnalysisPage() {
  const { roomId } = useParams()
  const { side, me, other, bothSubmitted, bothReadFeedback } = useRoom()

  if (!bothSubmitted) return <Navigate to={`/room/${roomId}/statement`} replace />
  if (!bothReadFeedback) return <Navigate to={`/room/${roomId}/feedback`} replace />

  /* 你收到的转述 = 对方的观点；你会被转述的内容 = 你的观点 */
  const toMe = sharedAnalysis.perspectives.find((p) => p.side === (side === 'A' ? 'B' : 'A'))!
  const aboutMe = sharedAnalysis.perspectives.find((p) => p.side === side)!

  return (
    <div className="max-w-2xl mx-auto">
      <FlowHeader current="analysis" />

      <Card className="!bg-blush-300/10 text-center !p-6">
        <p className="text-2xl">🗣️➡️👂</p>
        <h1 className="mt-2 text-xl md:text-2xl font-extrabold text-cocoa-800">
          共同观点转述
        </h1>
        <p className="mt-2 text-xs md:text-sm text-cocoa-500 leading-relaxed">
          以下内容由 AI 从双方的独立陈述中转述而来：不展示未经授权的原文，
          推测只作为推测，也不给责任做天平称量。请先读完 TA 的观点，再看你自己的。
        </p>
      </Card>

      {/* 转述给你的：对方的核心观点 */}
      <Card className="mt-5 !border-2 !border-tang-200">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-extrabold text-cocoa-700 text-lg">
            转述给你：{toMe.avatar} {toMe.name} 的观点
          </h2>
          <Badge tone="orange">来自 TA 的陈述 · 经 AI 整理</Badge>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">TA 的核心观点</p>
            <p className="mt-1.5 text-sm md:text-base text-cocoa-700 leading-relaxed bg-cream-200/50 rounded-2xl px-4 py-3">
              {toMe.coreView}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">
              TA 可能的真实需求 <Badge tone="blush">AI 推测 · 非事实</Badge>
            </p>
            <p className="mt-1.5 text-sm md:text-base text-cocoa-600 leading-relaxed italic px-1">
              {toMe.realNeed}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[11px] text-cocoa-400 leading-relaxed">{toMe.disclaimer}</p>
      </Card>

      {/* 你会被这样转述给对方 */}
      <Card className="mt-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-extrabold text-cocoa-700 text-lg">
            你会被这样转述：{aboutMe.avatar} 你的部分
          </h2>
          <Badge tone="neutral">TA 将看到同一段整理</Badge>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">你的核心观点</p>
            <p className="mt-1.5 text-sm md:text-base text-cocoa-700 leading-relaxed bg-cream-200/50 rounded-2xl px-4 py-3">
              {aboutMe.coreView}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">
              你可能没说出口的真实需求 <Badge tone="blush">AI 推测 · 非事实</Badge>
            </p>
            <p className="mt-1.5 text-sm md:text-base text-cocoa-600 leading-relaxed italic px-1">
              {aboutMe.realNeed}
            </p>
          </div>
        </div>
      </Card>

      {/* 误解 */}
      <Card className="mt-5">
        <h2 className="font-extrabold text-cocoa-700 text-lg">🔀 双方可能存在的误解</h2>
        <ul className="mt-4 space-y-3">
          {sharedAnalysis.misunderstandings.map((m, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-7 h-7 rounded-full bg-blush-300/30 text-blush-500 font-extrabold flex items-center justify-center text-xs">
                {i + 1}
              </span>
              <p className="text-sm text-cocoa-600 leading-relaxed pt-1">{m}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* 核心冲突 */}
      <Card className="mt-5 !bg-tang-50">
        <h2 className="font-extrabold text-cocoa-700 text-lg">⚔️ 核心冲突分析</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">表面之争</p>
            <p className="mt-1 text-sm text-cocoa-600 leading-relaxed">{sharedAnalysis.coreConflict.surface}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-cocoa-400 tracking-wide">深层之争</p>
            <p className="mt-1 text-sm md:text-base font-bold text-cocoa-700 leading-relaxed">
              {sharedAnalysis.coreConflict.deep}
            </p>
          </div>
          <p className="text-xs text-tang-600 bg-white/70 border border-tang-200 rounded-2xl px-4 py-3 leading-relaxed">
            {sharedAnalysis.coreConflict.note}
          </p>
        </div>
      </Card>

      {/* 共同期待 */}
      <Card className="mt-5">
        <h2 className="font-extrabold text-cocoa-700 text-lg">💛 你们共同的期待</h2>
        <ul className="mt-4 space-y-2.5">
          {sharedAnalysis.sharedHopes.map((h, i) => (
            <li key={i} className="flex gap-2.5 items-start text-sm text-cocoa-600 leading-relaxed">
              <span className="text-tang-400 mt-0.5">🐾</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-7 text-center">
        <Link to={`/room/${roomId}/interaction`}>
          <Button size="lg">我读完了 TA 的观点，进入互动环节 →</Button>
        </Link>
        <p className="mt-3 text-xs text-cocoa-400">
          {me.name}与 {other.name}看到的是同一份转述，但视角各自翻转——请先假设它是善意的，再判断它是否准确。
        </p>
      </div>
    </div>
  )
}
