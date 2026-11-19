import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CatMascot, SheepMascot } from '../components/brand/Mascot'

const steps = [
  {
    emoji: '📝',
    title: '创建争议事件',
    desc: '一句话描述你们的小争执，选个类型，30 秒即可开一间判判小屋。',
  },
  {
    emoji: '🐾',
    title: '双人轮流陈述',
    desc: '两人进入房间，按轮次平静地表达各自观点，判判猫全程安静旁听。',
  },
  {
    emoji: '💛',
    title: '获得温柔判决',
    desc: 'AI 分析双方立场与情绪，给出双赢建议和行动清单，让矛盾软着陆。',
  },
]

const features = [
  {
    emoji: '⚖️',
    title: '不偏不倚',
    desc: '判判猫不站队，只看事实和心意，双方都能被认真听见。',
  },
  {
    emoji: '🌡️',
    title: '情绪降温',
    desc: '轮流发言机制天然避免吵架升级，说着说着就想笑了。',
  },
  {
    emoji: '🎁',
    title: '带走方案',
    desc: '判决不只是评理，还给出具体的、可执行的和好行动清单。',
  },
]

export function HomePage() {
  return (
    <div className="space-y-20 md:space-y-28">
      {/* Hero */}
      <section className="text-center pt-6 md:pt-14">
        <Badge tone="orange">
          <span className="mr-1">✨</span> AI 双人沟通辅助
        </Badge>
        <h1 className="mt-5 text-4xl md:text-6xl font-extrabold text-cocoa-800 leading-tight">
          小争执，交给
          <span className="text-tang-500"> 猫来判判 </span>
          <span className="inline-block animate-bounce">🐱</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-base md:text-lg text-cocoa-500 leading-relaxed">
          谁洗碗、吃什么、周末怎么过——情侣、室友、好友之间的小矛盾，
          让温暖可爱的 AI 判判猫帮你们评评理，把争吵变成一次甜甜的沟通。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              开始使用 · 免费创建判判小屋
            </Button>
          </Link>
          <Link to="/room/demo-room" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              围观示例房间
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 md:gap-10">
          <CatMascot className="w-20 h-20 md:w-28 md:h-28 drop-shadow-lg" />
          <div className="text-left">
            <p className="text-sm font-bold text-tang-500">已有 12,800+ 对小冤家</p>
            <p className="text-xs text-cocoa-400">在这里握手言和（模拟数据）</p>
          </div>
          <SheepMascot className="w-20 h-20 md:w-28 md:h-28 drop-shadow-lg" />
        </div>
      </section>

      {/* 三步流程 */}
      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-cocoa-800">
          三步完成一次判判 <span className="text-tang-400">⚖️</span>
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <Card key={s.title} className="relative hover:shadow-lift hover:-translate-y-1 transition-all">
              <span className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-tang-400 text-white font-extrabold flex items-center justify-center shadow-soft">
                {i + 1}
              </span>
              <div className="text-4xl mt-2">{s.emoji}</div>
              <h3 className="mt-4 text-lg font-extrabold text-cocoa-700">{s.title}</h3>
              <p className="mt-2 text-sm text-cocoa-500 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 特色 */}
      <section className="bg-cream-50 rounded-[2.5rem] border border-tang-100 p-8 md:p-14 shadow-soft">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-cocoa-800">
          为什么大家都爱判判猫？
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="text-center px-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-tang-100 flex items-center justify-center text-3xl">
                {f.emoji}
              </div>
              <h3 className="mt-4 font-extrabold text-cocoa-700">{f.title}</h3>
              <p className="mt-2 text-sm text-cocoa-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/create">
            <Button size="lg">立即创建你们的第一个争议事件 🐾</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
