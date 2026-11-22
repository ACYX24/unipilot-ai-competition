import Link from "next/link";
import { CatMascot } from "@/components/cat-mascot";
import { JoinRoomDialog } from "@/components/join-room-dialog";
import { SheepMascot } from "@/components/sheep-mascot";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    emoji: "🏠",
    title: "创建房间 · 邀请同伴",
    description:
      "一方描述争议事件、选择矛盾类型，生成邀请码；另一方凭码加入，全程看不到对方的原始文字。",
  },
  {
    emoji: "📝",
    title: "独立陈述 · 互不可见",
    description:
      "双方分别填写事情经过、感受、在意的点与期待，草稿只属于自己，提交后才进入下一阶段。",
  },
  {
    emoji: "💌",
    title: "AI 调解报告 · 双方共享",
    description:
      "判判猫分别整理双方的事实、感受与需求，生成观点总结、沟通误区与改善建议，两位参与者看到同一份报告。",
  },
  {
    emoji: "🔄",
    title: "共同观点转述",
    description:
      "你的观点由 AI 转述给对方，对方的需求也讲给你听——不公开原文，也不把推测当成事实。",
  },
  {
    emoji: "🤝",
    title: "互动与改善约定",
    description:
      "猫咪开庭、掷石子、和解行动卡，三个小仪式帮你们把「听懂」变成「下一步一起做」。",
  },
];

const features = [
  {
    emoji: "🙈",
    title: "隐私优先",
    description: "双方永远看不到对方的原始陈述，只接收 AI 整理后的共享调解报告。",
  },
  {
    emoji: "⚖️",
    title: "温柔但客观",
    description: "判判猫不站队、不和稀泥，它敢于分别指出双方各自的问题。",
  },
  {
    emoji: "🐾",
    title: "带走行动",
    description: "流程终点不是一份判决书，而是双方共同选定的和解行动卡。",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
      <section className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-tang-100 px-3 py-1 text-xs font-bold text-tang-600">
          ✨ AI 双人关系沟通与冲突调解
        </span>

        <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-cocoa-800 sm:text-4xl lg:text-5xl">
          不急着判断谁对谁错
          <br />
          <span className="text-tang-500">先让彼此听懂对方</span>
          <span className="inline-block align-middle"> 🐱</span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-cocoa-500 sm:text-lg">
          CatJudge 让双方分别陈述、互相看不见原文，由温柔的 AI
          判判猫整理双方的事实、感受与需求，生成一份双方共享的调解报告——把争吵，翻译成一次听懂。
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/create"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 w-full rounded-full bg-tang-400 px-7 text-base font-bold text-white shadow-soft hover:bg-tang-500 sm:w-auto",
            )}
          >
            创建调解房间
          </Link>
          <JoinRoomDialog />
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10">
          <div className="w-20 shrink-0 sm:w-24">
            <CatMascot />
          </div>
          <div className="max-w-[14rem] text-center">
            <p className="text-sm font-bold text-tang-500">两人各自陈述，互不可见</p>
            <p className="mt-1 text-xs leading-5 text-cocoa-400">
              观点与需求由判判猫转述，原文不上桌
            </p>
          </div>
          <div className="w-20 shrink-0 sm:w-24">
            <SheepMascot />
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20">
        <h2 className="text-center text-2xl font-extrabold text-cocoa-800 sm:text-3xl">
          一次完整的调解，分五步走 <span className="text-tang-400">🐾</span>
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="relative gap-0 rounded-3xl border-tang-100 bg-white/90 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-full bg-tang-400 text-sm font-extrabold text-white shadow-soft">
                {index + 1}
              </span>
              <CardHeader className="pt-7">
                <div className="text-3xl">{step.emoji}</div>
                <CardTitle className="mt-2 text-lg font-extrabold text-cocoa-700">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-cocoa-500">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-[2.5rem] border border-tang-100 bg-cream-50 p-8 shadow-soft sm:mt-20 sm:p-12">
        <h2 className="text-center text-2xl font-extrabold text-cocoa-800 sm:text-3xl">
          为什么是 CatJudge？
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="px-2 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-tang-100 text-3xl">
                {feature.emoji}
              </div>
              <h3 className="mt-4 font-extrabold text-cocoa-700">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa-500">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/create"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full bg-tang-400 px-7 text-base font-bold text-white shadow-soft hover:bg-tang-500",
            )}
          >
            创建你们的第一个调解房间 🐾
          </Link>
        </div>
      </section>

      <p className="mt-8 text-center text-xs leading-5 text-cocoa-400">
        判判猫不替任何一方下判决，也不把推测当成事实 · 房间数据仅用于本次调解
      </p>
    </div>
  );
}
