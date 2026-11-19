import { Link, Navigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { CatMascot, SheepMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { actionCards, pebbleOptions, sharedAnalysis } from '../data/mock'
import { useRoom } from '../state/RoomContext'

const dateText = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

export function AgreementPage() {
  const { roomId } = useParams()
  const { room, me, other, bothSubmitted, bothReadFeedback, agreed, acceptAgreement } = useRoom()

  if (!bothSubmitted) return <Navigate to={`/room/${roomId}/statement`} replace />
  if (!bothReadFeedback) return <Navigate to={`/room/${roomId}/feedback`} replace />
  const readyForAgreement = !!room.pebble.A && !!room.pebble.B && !!room.action.A && !!room.action.B
  if (!readyForAgreement) return <Navigate to={`/room/${roomId}/interaction`} replace />

  const pebbleA = pebbleOptions.find((p) => p.id === room.pebble.A)!
  const pebbleB = pebbleOptions.find((p) => p.id === room.pebble.B)!
  const actionA = actionCards.find((c) => c.id === room.action.A)!
  const actionB = actionCards.find((c) => c.id === room.action.B)!

  return (
    <div className="max-w-2xl mx-auto">
      <FlowHeader current="agreement" />

      {/* 约定书 */}
      <Card className="!p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-tang-100 to-cream-200 px-6 md:px-10 py-8 text-center border-b-2 border-dashed border-tang-300">
          <p className="text-xs font-bold tracking-[0.35em] text-tang-600">CATJUDGE PEACE DEED</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-cocoa-800">
            🕊️ 和解与改善约定书
          </h1>
          <p className="mt-2 text-xs text-cocoa-500">
            房间 {room.inviteCode} · {room.relation} · {dateText}
          </p>
        </div>

        <div className="px-6 md:px-10 py-7 space-y-7">
          {/* 争议事项 */}
          <section>
            <p className="text-xs font-bold text-cocoa-400 tracking-widest">第一条 · 我们曾为谁对谁错争执</p>
            <p className="mt-2 text-sm font-bold text-cocoa-700 leading-relaxed">「{room.topic}」</p>
            <p className="mt-1.5 text-xs text-cocoa-500 leading-relaxed">{sharedAnalysis.coreConflict.deep}</p>
          </section>

          {/* 各自在意的问题 */}
          <section>
            <p className="text-xs font-bold text-cocoa-400 tracking-widest">第二条 · 我们各自最在意的问题</p>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {[
                { who: room.A, pebble: pebbleA },
                { who: room.B, pebble: pebbleB },
              ].map(({ who, pebble }) => (
                <div key={who.name} className="rounded-2xl bg-cream-200/60 border border-cream-300 px-4 py-3">
                  <p className="text-xs font-bold text-cocoa-400">{who.avatar} {who.name}</p>
                  <p className="mt-1 text-sm font-extrabold text-cocoa-700">🪨 {pebble.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-cocoa-400 leading-relaxed">
              两颗石子可能不同，但它们同样重要。被听见，就是改善的一半。
            </p>
          </section>

          {/* 行动承诺 */}
          <section>
            <p className="text-xs font-bold text-cocoa-400 tracking-widest">第三条 · 我们各自承诺的行动</p>
            <div className="mt-3 space-y-3">
              {[
                { who: room.A, sideKey: 'A' as const, card: actionA },
                { who: room.B, sideKey: 'B' as const, card: actionB },
              ].map(({ who, sideKey, card }) => (
                <div
                  key={sideKey}
                  className={`rounded-2xl border-2 px-4 py-4 ${
                    sideKey === 'A' ? 'border-tang-200 bg-tang-50' : 'border-matcha-300/50 bg-matcha-300/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-extrabold text-sm text-cocoa-700">
                      {who.avatar} {who.name}：{card.emoji} {card.title}
                    </p>
                    <Badge tone={card.owner === 'both' ? 'orange' : card.owner === sideKey ? 'blush' : 'matcha'}>
                      {card.owner === 'both' ? '双方共同' : `${who.name}主导`}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-cocoa-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 结语 */}
          <section className="text-center border-t border-dashed border-cream-300 pt-6">
            <p className="text-sm text-cocoa-600 leading-relaxed max-w-md mx-auto">
              我们不承诺从此不再争吵，
              <br />
              但承诺下次争吵时，先想起对方信里那句话。
            </p>
            <div className="mt-5 flex items-center justify-center gap-8 text-sm font-extrabold text-cocoa-700">
              <span>
                🐾 {room.A.name}
                {agreed ? <span className="text-blush-500"> ✔</span> : ''}
              </span>
              <span className="text-cocoa-300">×</span>
              <span>
                🐾 {room.B.name}
                {agreed ? <span className="text-blush-500"> ✔</span> : ''}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-cocoa-400">见证人：判判猫 ⚖️ · {dateText}</p>
          </section>
        </div>

        {/* 签署区 */}
        <div className="px-6 md:px-10 py-6 bg-cream-200/50 border-t border-cream-300">
          {agreed ? (
            <div className="text-center">
              <p className="text-3xl">🎉</p>
              <p className="mt-2 font-extrabold text-matcha-500">
                约定生效！{me.name}与 {other.name}已各执一份
              </p>
              <p className="mt-1 text-xs text-cocoa-500">
                不急着判断谁对谁错，先让彼此听懂对方——你们做到了 🐱💛
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/">
                  <Button variant="secondary" className="w-full sm:w-auto">回首页</Button>
                </Link>
                <Link to={`/room/${roomId}/analysis`}>
                  <Button variant="ghost" className="w-full sm:w-auto">回看观点转述</Button>
                </Link>
                <Link to="/create">
                  <Button className="w-full sm:w-auto">开启新的调解 🐾</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-cocoa-500 text-center leading-relaxed">
                以「{me.avatar} {me.name}」的身份签署。对方签署后约定同样生效（演示中单方签署即达成）。
              </p>
              <div className="mt-4 flex items-center justify-center gap-4">
                <CatMascot className="w-10 h-10" />
                <Button size="lg" onClick={acceptAgreement}>
                  我同意，落爪为定 🐾
                </Button>
                <SheepMascot className="w-10 h-10" />
              </div>
            </>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-cocoa-400">
        约定文本仅保存在本机演示状态中；正式版将存于服务端并只对房间两位成员开放。
      </p>
    </div>
  )
}
