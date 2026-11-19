import { Link, useParams } from 'react-router-dom'
import { CatMascot, SheepMascot } from '../components/brand/Mascot'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { mockVerdict } from '../data/mock'

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function ResultPage() {
  const { roomId } = useParams()
  const v = mockVerdict

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 判决头部 */}
      <Card className="text-center !p-8 md:!p-12">
        <div className="flex items-center justify-center gap-4">
          <CatMascot className="w-14 h-14 md:w-20 md:h-20" />
          <div>
            <Badge tone="orange">小屋 {roomId} · 判决已出炉</Badge>
            <h1 className="mt-2 text-2xl md:text-4xl font-extrabold text-cocoa-800">
              {v.title} 🎉
            </h1>
          </div>
          <SheepMascot className="w-14 h-14 md:w-20 md:h-20" />
        </div>
        <p className="mt-4 text-xs text-cocoa-400">争议话题：{v.topic}</p>
        <p className="mt-5 max-w-xl mx-auto text-sm md:text-base text-cocoa-600 leading-relaxed">
          {v.summary}
        </p>
        <p className="mt-5 inline-block bg-tang-50 border border-tang-200 rounded-2xl px-5 py-3 text-sm font-bold text-tang-600">
          {v.sweetTalk}
        </p>
      </Card>

      {/* 双方表现 */}
      <div className="grid md:grid-cols-2 gap-5">
        {v.scores.map((s) => (
          <Card key={s.side} className="!p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.avatar}</span>
              <div>
                <p className="font-extrabold text-cocoa-700">
                  {s.side === 'A' ? '甲方' : '乙方'} · {s.name}
                </p>
                <p className="text-xs text-cocoa-400">沟通表现分（模拟）</p>
              </div>
              <span className="ml-auto text-3xl font-extrabold text-tang-500">{s.score}</span>
            </div>
            <div className="mt-4">
              <ScoreBar value={s.score} color={s.side === 'A' ? 'bg-tang-400' : 'bg-matcha-500'} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <Badge key={t} tone={s.side === 'A' ? 'orange' : 'matcha'}>
                  {t}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 情绪三维 */}
      <Card className="!p-6 md:!p-8">
        <h2 className="font-extrabold text-cocoa-700">本次沟通体检 🌡️</h2>
        <div className="mt-5 space-y-5">
          {v.moodBreakdown.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-sm font-bold text-cocoa-600 mb-2">
                <span>{m.label}</span>
                <span className="text-tang-500">{m.value}</span>
              </div>
              <ScoreBar value={m.value} color="bg-tang-300" />
            </div>
          ))}
        </div>
      </Card>

      {/* 和好行动清单 */}
      <Card className="!p-6 md:!p-8">
        <h2 className="font-extrabold text-cocoa-700">判判猫的和好行动清单 🎁</h2>
        <ol className="mt-5 space-y-4">
          {v.suggestions.map((sug, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="shrink-0 w-8 h-8 rounded-full bg-tang-100 text-tang-600 font-extrabold flex items-center justify-center text-sm">
                {i + 1}
              </span>
              <p className="text-sm md:text-base text-cocoa-600 leading-relaxed pt-1">{sug}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/create" className="flex-1">
            <Button className="w-full">再判一件小事 🐾</Button>
          </Link>
          <Link to={`/room/${roomId}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              回到小屋补充陈述
            </Button>
          </Link>
        </div>
      </Card>

      <p className="text-center text-xs text-cocoa-400 pb-4">
        当前展示为模拟判决结果，正式版本将由 AI 根据真实陈述生成。
      </p>
    </div>
  )
}
