import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { CatAvatar } from "@/components/cat-mascot";
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
  title: "Cat Mediator · 猫咪调解室",
  description: "AI 双人沟通调解：各自写下心里话，猫咪法官帮你生成温柔的调解报告。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border/60 bg-background/80">
          <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-9 shrink-0">
                <CatAvatar />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Cat Mediator
              </span>
              <span className="hidden rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-500 sm:inline-block">
                猫咪调解室
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          用理解和幽默，化解每一场小风波 · AI 分析仅辅助沟通，不替代专业心理、法律或危机干预服务
        </footer>
      </body>
    </html>
  );
}
