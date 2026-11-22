import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { CatAvatar } from "@/components/cat-mascot";
import { SiteNav } from "@/components/site-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CatJudge · 判判猫｜AI 双人关系沟通与冲突调解",
  description:
    "双方各自独立陈述、互相看不见原文，由 AI 判判猫给出私人反馈，再把彼此的观点与真实需求转述给对方——把争吵翻译成一次听懂。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-50 border-b border-tang-100 bg-cream-100/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 transition-transform hover:scale-105"
            >
              <span className="w-9 shrink-0">
                <CatAvatar />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-cocoa-700">
                CatJudge
              </span>
              <span className="hidden rounded-full bg-tang-100 px-2.5 py-0.5 text-xs font-bold text-tang-600 sm:inline-block">
                判判猫
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <Suspense
                  fallback={
                    <nav className="flex items-center gap-1">
                      <span className="rounded-full px-4 py-2 text-sm font-bold text-cocoa-500">
                        首页
                      </span>
                      <span className="rounded-full px-4 py-2 text-sm font-bold text-cocoa-500">
                        创建房间
                      </span>
                    </nav>
                  }
                >
                  <SiteNav />
                </Suspense>
              </div>
              <Link
                href="/create"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden h-9 rounded-full bg-tang-400 px-4 text-sm font-bold text-white shadow-soft hover:bg-tang-500 md:inline-flex",
                )}
              >
                开始调解 🐾
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-tang-100">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-cocoa-400 sm:flex-row sm:px-6">
            <span className="font-bold text-cocoa-500">CatJudge · 判判猫</span>
            <span>© 2026 CatJudge · 不急着判断谁对谁错，先让彼此听懂对方 🐾</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
