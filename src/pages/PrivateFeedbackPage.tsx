import { Link, Navigate, useParams } from 'react-router-dom'
import { FlowHeader } from '../components/layout/FlowHeader'
import { CatMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { privateFeedback } from '../data/mock'
import { useRoom } from '../state/RoomContext'

export function PrivateFeedbackPage() {
  const { roomId } = useParams()
  const { side, peer, me, other, bothSubmitted, bothReadFeedback, markFeedbackRead } = useRoom()

  /* 守卫：双方陈述未完成前没有反馈可看 */
  if (!bothSubmitted) {
    return <Navigate to={me.submitted ? `/room/${roomId}/waiting` : `/room/${roomId}/statement`} replace />
  }

  const report = privateFeedback[side]

  return (
    <div className="max-w-2xl mx-auto">
      <FlowHeader current="feedback" />

      {/* 私密信头 */}
      <Card className="!bg-gradient-to-br from-cream-50 to-tang-50">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <CatMascot className="w-12 h-12" />
            <div>
              <p className="text-xs font-bold text-cocoa-400 tracking-widest">判判猫的私信 · 第 1 封</p>
              <h1 className="text-xl md:text-2xl font-extrabold text-cocoa-800">
                致 {report.avatar} {report.nickname}
              </h1>
            </div>
          </div>
          <Badge tone={me.feedbackRead ? 'matcha' : 'blush'}>
            {me.feedbackRead ? '你已读完 ✓' : '🔒 仅你可见'}
          </Badge>
        </div>
        <p className="mt-4 text-sm md:text-base font-bold text-tang-600 leading-relaxed">
          「{report.headline}」
        </p>
        <p className="mt-2 text-xs text-cocoa-400 leading-relaxed">
          这封信基于你的独立陈述生成，{other.name}看不到它；TA 会收到属于 TA 的另一封。
          它不评判对错，只帮你看清自己在沟通中的样子。
        </p>
      </Card>

      {/* 六个反馈板块 */}
      <div className="mt-5 space-y-4">
        {report.sections.map((sec, i) => (
          <Card key={sec.key} className="!p-5 md:!p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-tang-100 flex items-center justify-center text-lg shrink-0">
                {sec.emoji}
              </span>
              <h2 className="font-extrabold text-cocoa-700">
                {i + 1}. {sec.title}
              </h2>
            </div>
            <div className="mt-3 space-y-2.5">
              {sec.paragraphs.map((p, j) => (
                <p key={j} className="text-sm text-cocoa-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 已读确认 */}
      <Card className="mt-6 !bg-tang-50 text-center">
        {!me.feedbackRead ? (
          <>
            <p className="text-sm text-cocoa-600 leading-relaxed">
              看完之后，轻轻确认一下。你们俩都读完，判判猫才会开始互相转述观点。
            </p>
            <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={() => markFeedbackRead(side)}>
              我已认真读完这封信 💌
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-matcha-500">你已确认读完 ✓</p>
            <p className="mt-1 text-xs text-cocoa-500">
              {bothReadFeedback
                ? '双方都读完了，可以进入共同环节了！'
                : `等待 ${other.name} 读完 TA 的信…`}
            </p>
            {bothReadFeedback ? (
              <Link to={`/room/${roomId}/analysis`} className="block mt-4">
                <Button size="lg" className="w-full sm:w-auto">
                  进入共同观点转述 →
                </Button>
              </Link>
            ) : (
              <div className="mt-4 rounded-2xl bg-cream-200/60 border border-dashed border-cocoa-400/30 p-4">
                <Badge tone="neutral">🧪 演示模式</Badge>
                <p className="mt-2 text-xs text-cocoa-500">
                  可切换到 {other.name} 视角读 TA 的信，或直接模拟 TA 已读完。
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => markFeedbackRead(peer)}
                >
                  模拟「{other.name}」已读完
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-cocoa-400 leading-relaxed px-4">
        隐私说明：原型通过「视角切换」模拟两人各看各的信。
        正式版本将由服务端按房间成员身份下发报告，前端隐藏不作为隐私边界。
      </p>
    </div>
  )
}
