import Link from "next/link";
import { Dices, FileHeart, MessagesSquare, Scale } from "lucide-react";
import { CatMascot } from "@/components/cat-mascot";
import { JoinRoomDialog } from "@/components/join-room-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: MessagesSquare,
    title: "异步说出心里话",
    description: "两人各自独立填写观点，不用面对面争执，也不用等对方同时在线。",
    className: "bg-rose-50 text-rose-400",
  },
  {
    icon: Scale,
    title: "AI 中立分析",
    description: "猫咪法官不站队，识别双方的情绪、真实需求和沟通中的误区。",
    className: "bg-sky-50 text-sky-500",
  },
  {
    icon: FileHeart,
    title: "结构化调解报告",
    description: "观点总结、共同需求与具体改善建议，一份报告说清楚。",
    className: "bg-violet-50 text-violet-500",
  },
  {
    icon: Dices,
    title: "趣味和解任务",
    description: "用轻松的小互动收尾，把「讲道理」变成「更亲近」。",
    className: "bg-amber-50 text-amber-500",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
      <section className="flex flex-col items-center gap-10 py-12 sm:py-16 md:flex-row md:gap-6">
        <div className="flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            AI 双人沟通调解 · 演示版
          </Badge>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            有矛盾，
            <br />
            找<span className="text-primary">猫咪法官</span>评评理
          </h1>
          <p className="max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            和 TA 各自写下心里话，AI
            猫咪法官中立分析双方的情绪与需求，生成一份温柔又实用的调解报告。
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full px-7 text-base",
              )}
            >
              创建调解房间
            </Link>
            <JoinRoomDialog />
          </div>
          <p className="text-xs text-muted-foreground">
            无需注册 · 邀请码进入 · 双方提交后自动生成报告
          </p>
        </div>
        <div className="relative flex w-full max-w-xs flex-1 items-center justify-center md:max-w-sm">
          <div className="absolute inset-4 rounded-full bg-rose-100/70" />
          <div className="absolute inset-10 rounded-full bg-violet-100/60" />
          <CatMascot className="relative drop-shadow-sm" />
        </div>
      </section>

      <section className="pb-14 sm:pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            一间调解室，四种化解方式
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            从「各说各话」到「互相听懂」，猫咪法官全程陪伴
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-3xl border-border/70 shadow-xs transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div
                  className={cn(
                    "mb-2 flex size-11 items-center justify-center rounded-2xl",
                    feature.className,
                  )}
                >
                  <feature.icon className="size-5" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-6">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
