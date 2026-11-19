import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CatMascot, SheepMascot } from '../components/brand/Mascot'

const steps = [
  {
    emoji: '🏠',
    title: '创建房间 · 邀请同伴',
    desc: 'A 描述争议事件、选择关系类型，生成邀请码；B 凭码加入，全程匿名于彼此的原始文字。',
  },
  {
    emoji: '📝',
    title: '独立陈述 · 互不可见',
    desc: '双方分别填写事情经过、感受、在意的点与期待，草稿只属于自己，提交后才进入下一阶段。',
  },
  {
    emoji: '💌',
    title: 'AI 私人反馈 · 各自可见',
    desc: '判判猫分别给两个人写一封私人信：你做得好的、你的误区、推荐的表达方式，还有一句温柔鼓励。',
  },
  {
    emoji: '🔄',
    title: '共同观点转述',
    desc: '你的观点由 AI 转述给对方，对方的需求也由 AI 讲给你听——不公开原文，不把推测当事实。',
  },
  {
    emoji: '🤝',
    title: '互动与改善约定',
    desc: '猫咪开庭、扔石子、和解行动卡，三个小仪式帮你们把「听懂」变成「下一步一起做」。',
  },
]

const features = [
  {
    emoji: '🙈',
    title: '隐私优先',
    desc: '双方永远看不到对方的原始陈述，只接收经过 AI 整理、经授权公开的观点转述。',
  },
  {
    emoji: '⚖️',
    title: '温柔但客观',
    desc: '判判猫不站队、不和稀泥、不各打五十大板——它敢于分别指出双方的问题。',
  },
  {
    emoji: '🐾',
    title: '带走行动',
    desc: '流程终点不是一份判决书，而是两张双方共同选定的和解行动卡。',
  },
]

export function HomePage() {
  return (
    <div className="space-y-20 md:space-y-28">
      {/* Hero */}
      <section className="text-center pt-6 md:pt-14">
        <Badge tone="orange">
          <span className="mr-1">✨</span> AI 双人关系沟通与冲突调解
        </Badge>
        <h1 className="mt-5 text-3xl md:text-6xl font-extrabold text-cocoa-800 leading-tight">
          不急着判断谁对谁错
          <br />
          <span className="text-tang-500">先让彼此听懂对方</span>
          <span className="inline-block animate-bounce"> 🐱</span>
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-base md:text-lg text-cocoa-500 leading-relaxed">
          CatJudge 让双方分别陈述、互相看不见原文，由温柔的 AI 判判猫提供私人反馈，
          再把彼此的观点与真实需求转述给对方——把争吵，翻译成一次听懂。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              创建调解房间 · 生成邀请码
            </Button>
          </Link>
          <Link to="/join" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              我有邀请码，加入房间
            </Button>
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 md:gap-10">
          <CatMascot className="w-20 h-20 md:w-28 md:h-28 drop-shadow-lg" />
          <div className="text-left">
            <p className="text-sm font-bold text-tang-500">想先看一遍完整流程？</p>
            <Link to="/room/demo" className="text-xs text-cocoa-400 underline decoration-dotted">
              进入演示房间（模拟数据）→
            </Link>
          </div>
          <SheepMascot className="w-20 h-20 md:w-28 md:h-28 drop-shadow-lg" />
        </div>
      </section>

      {/* 五阶段流程 */}
      <section>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-cocoa-800">
          一次完整的调解，分五步走 <span className="text-tang-400">🐾</span>
        </h2>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          为什么是 CatJudge？
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
            <Button size="lg">创建你们的第一个调解房间 🐾</Button>
          </Link>
        </div>
      </section>

      <p className="text-center text-xs text-cocoa-400 -mt-8">
        当前为高保真前端原型：身份、隐私隔离与 AI 报告均为模拟，正式版将在服务端实施权限控制。
      </p>
    </div>
  )
}
