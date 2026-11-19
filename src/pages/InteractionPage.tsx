import { Link, Navigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { actionCards, courtSession, pebbleOptions } from '../data/mock'
import { useRoom, type Side } from '../state/RoomContext'

function ModuleTitle({ no, emoji, title, desc }: { no: number; emoji: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-10 h-10 shrink-0 rounded-2xl bg-tang-400 text-white font-extrabold flex items-center justify-center text-lg shadow-soft">
        {no}
      </span>
      <div>
        <h2 className="font-extrabold text-cocoa-800 text-lg">
          {emoji} {title}
        </h2>
        <p className="mt-1 text-xs md:text-sm text-cocoa-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

/* 演示辅助：给对方一个默认选择 */
function peerPebbleDemo(peer: Side): string {
  return pebbleOptions[peer === 'A' ? 1 : 2].id
}
function peerActionDemo(peer: Side): string {
  return actionCards[peer === 'A' ? 3 : 1].id
}

export function InteractionPage() {
  const { roomId } = useParams()
  const { side, peer, other, room, bothSubmitted, bothReadFeedback, setPebble, setAction, toggleCourt } = useRoom()

  if (!bothSubmitted) return <Navigate to={`/room/${roomId}/statement`} replace />
  if (!bothReadFeedback) return <Navigate to={`/room/${roomId}/feedback`} replace />

  const myPebble = room.pebble[side]
  const peerPebble = room.pebble[peer]
  const myAction = room.action[side]
  const peerAction = room.action[peer]
  const courtCount = courtSession.rounds.length
  const courtState = room.court ?? {}
  const courtDoneCount = courtSession.rounds.filter((_, i) => courtState[i]).length
  const allDone = courtDoneCount === courtCount && !!myPebble && !!peerPebble && !!myAction && !!peerAction

  return (
    <div className="max-w-2xl mx-auto">
      <FlowHeader current="interaction" />

      {/* 模块一：猫咪开庭 */}
      <Card>
        <ModuleTitle no={1} emoji="⚖️" title="猫咪开庭" desc={courtSession.intro} />
        <div className="mt-5 space-y-3">
          {courtSession.rounds.map((r, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 px-4 py-3.5 transition-colors ${
                room.court?.[i] ? 'border-matcha-300/60 bg-matcha-300/10' : 'border-cream-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone={r.forSide === 'A' ? 'orange' : 'matcha'}>
                  {room[r.forSide].avatar} 请{r.forSide === 'A' ? '甲方' : '乙方'}「{room[r.forSide].name}」回答
                </Badge>
                {r.forSide === side ? (
                  <Badge tone="blush">轮到你了</Badge>
                ) : (
                  <Badge tone="neutral">TA 的回合 · 你只需倾听</Badge>
                )}
              </div>
              <p className="mt-2 text-sm font-bold text-cocoa-700 leading-relaxed">{r.question}</p>
              <p className="mt-1 text-xs text-cocoa-400">{r.tip}</p>
              <button
                onClick={() => toggleCourt(i)}
                className={`mt-3 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-colors cursor-pointer ${
                  courtState[i]
                    ? 'bg-matcha-300/30 border-matcha-500 text-matcha-500'
                    : 'bg-white border-cream-300 text-cocoa-500 hover:border-tang-300'
                }`}
              >
                {courtState[i]
                  ? '✓ 已作答'
                  : r.forSide === side
                    ? '标记我已作答'
                    : `代 ${room[r.forSide].name} 确认已作答`}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-cocoa-400">
          开庭进度：{courtDoneCount}/{courtCount}
          {courtDoneCount < courtCount && ' · 每个回合都必须有人作答（可切视角或代为确认）'}
        </p>
      </Card>

      {/* 模块二：扔石子 */}
      <Card className="mt-6">
        <ModuleTitle
          no={2}
          emoji="🪨"
          title="扔石子"
          desc="把最刺挠你的那块石头扔出来：各自选出「我最在意的问题」。双方都选好后，两颗石子会一起公开。"
        />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {pebbleOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => setPebble(side, p.id)}
              className={`rounded-2xl border-2 px-3 py-3 text-left transition-all cursor-pointer ${
                myPebble === p.id
                  ? 'bg-tang-400 border-tang-400 text-white shadow-lift scale-[1.02]'
                  : 'bg-white border-cream-300 text-cocoa-600 hover:border-tang-300'
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <p className="mt-1 text-xs font-bold leading-snug">{p.label}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-cream-200 px-3 py-1.5 font-bold text-cocoa-500">
            你掷出的石子：
            {myPebble ? `🪨 ${pebbleOptions.find((p) => p.id === myPebble)?.label}` : '还没选呢～'}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1.5 font-bold text-cocoa-500">
            {other.name}的石子：
            {peerPebble ? `🪨 ${pebbleOptions.find((p) => p.id === peerPebble)?.label}` : '❓ 待公开'}
          </span>
          {!peerPebble && (
            <button
              onClick={() => setPebble(peer, peerPebbleDemo(peer))}
              className="rounded-full border border-dashed border-cocoa-400/40 px-3 py-1.5 font-bold text-cocoa-400 hover:text-tang-500 cursor-pointer"
            >
              🧪 演示：模拟{other.name}掷出石子
            </button>
          )}
        </div>
      </Card>

      {/* 模块三：和解行动卡 */}
      <Card className="mt-6">
        <ModuleTitle
          no={3}
          emoji="🎴"
          title="和解行动卡"
          desc="选一张你愿意先去做的小行动。注意：选「你能做到的」，而不是「最大声的」。"
        />
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {actionCards.map((c) => (
            <button
              key={c.id}
              onClick={() => setAction(side, c.id)}
              className={`text-left rounded-2xl border-2 px-4 py-4 transition-all cursor-pointer ${
                myAction === c.id
                  ? 'bg-tang-100 border-tang-400 shadow-lift scale-[1.01]'
                  : 'bg-white border-cream-300 hover:border-tang-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-cocoa-700 text-sm">
                  {c.emoji} {c.title}
                </span>
                <Badge tone={c.owner === 'both' ? 'orange' : c.owner === 'A' ? 'blush' : 'matcha'}>
                  {c.owner === 'both' ? '双方' : room[c.owner].name + '优先'}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-cocoa-500 leading-relaxed">{c.desc}</p>
              {myAction === c.id && <p className="mt-2 text-xs font-extrabold text-tang-600">✓ 我选这张</p>}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-cream-200 px-3 py-1.5 font-bold text-cocoa-500">
            你的行动卡：{myAction ? `🎴 ${actionCards.find((c) => c.id === myAction)?.title}` : '未选择'}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1.5 font-bold text-cocoa-500">
            {other.name}的行动卡：
            {peerAction ? `🎴 ${actionCards.find((c) => c.id === peerAction)?.title}` : '❓ 待公开'}
          </span>
          {!peerAction && (
            <button
              onClick={() => setAction(peer, peerActionDemo(peer))}
              className="rounded-full border border-dashed border-cocoa-400/40 px-3 py-1.5 font-bold text-cocoa-400 hover:text-tang-500 cursor-pointer"
            >
              🧪 演示：模拟{other.name}选卡
            </button>
          )}
        </div>
      </Card>

      {/* 完成引导 */}
      <div className="mt-8 text-center">
        {allDone ? (
          <>
            <CatMascot className="w-14 h-14 mx-auto" />
            <p className="mt-3 text-sm font-bold text-matcha-500">三个互动模块都完成啦！</p>
            <Link to={`/room/${roomId}/agreement`} className="inline-block mt-3">
              <Button size="lg">签署我们的改善约定 →</Button>
            </Link>
          </>
        ) : (
          <p className="text-xs text-cocoa-400 leading-relaxed px-6">
            完成「猫咪开庭作答 · 扔石子 · 选行动卡」（双方）后，
            <br />
            即可解锁最后的改善约定 🐾
          </p>
        )}
      </div>
    </div>
  )
}
