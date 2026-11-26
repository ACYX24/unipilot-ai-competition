import Image from "next/image"
import Link from "next/link"
import { ArrowRight, DoorOpen, FileText, LockKeyhole, MessagesSquare } from "lucide-react"
import { JoinRoomDialog } from "@/components/join-room-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: DoorOpen,
    title: "邀请对方入座",
    description: "创建一个房间，把邀请码发给想一起聊的人。",
  },
  {
    icon: MessagesSquare,
    title: "各自把话说完",
    description: "各自用自己的话说说这件事。对方看不到你的原文。",
  },
  {
    icon: FileText,
    title: "一起看调解报告",
    description: "打开同一份调解报告，看看彼此在意什么，挑一个能一起尝试的行动。",
  },
]

export function HomeContent({ contest = false }: { contest?: boolean }) {
  return (
    <div className="site-container">
      <section className="home-hero" aria-labelledby="hero-heading" data-enter>
        <div className="hero-copy">
          <h1 id="hero-heading" className="display-heading hero-heading">
            <span>把话说开，</span>
            <span>听懂彼此。</span>
          </h1>
          <p className="hero-description">
            为一件说不清的小事，约对方来这里坐坐。你们各自写下想说的话，判判猫用 AI 整理成一份共享调解报告。
          </p>
          <div className="hero-actions">
            {contest && (
              <Link href="/demo" className={cn(buttonVariants({ size: "lg" }), "action-primary")}>
                单人体验 · 真实 AI 调解 <ArrowRight aria-hidden="true" />
              </Link>
            )}
            <Link
              href="/create"
              className={cn(buttonVariants({ size: "lg", variant: contest ? "outline" : "default" }), !contest && "action-primary")}
            >
              {contest ? "双人体验 · 创建房间" : "创建房间"}
              {!contest && <ArrowRight aria-hidden="true" />}
            </Link>
            <JoinRoomDialog />
          </div>
          <p className="hero-privacy">
            <LockKeyhole size={15} aria-hidden="true" />
            双方原始陈述互不可见
          </p>
        </div>

        <figure className="hero-figure" data-visual>
          <Image
            src="/mascots/listening-table.webp"
            alt="系绿围巾的橘猫与小羊坐在矮桌两边，面前各有一杯茶"
            width={1200}
            height={900}
            unoptimized
            loading="eager"
            fetchPriority="high"
            className="hero-art"
          />
        </figure>
      </section>

      <section id="how-it-works" className="home-process" aria-labelledby="process-heading">
        <div className="process-heading">
          <h2 id="process-heading" className="display-heading">从各自开口，<br />到一起商量。</h2>
        </div>
        <ol className="process-grid">
          {steps.map(({ icon: Icon, title, description }) => (
            <li key={title} className="process-card">
              <span className="process-icon"><Icon size={21} strokeWidth={1.65} aria-hidden="true" /></span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
