import type { Metadata } from "next"
import { SiteFrame } from "@/components/site-frame"
import "./globals.css"

export const metadata: Metadata = {
  title: "CatJudge · 判判猫",
  description: "一个让两个人分别陈述、共同看调解报告的小房间。双方原始陈述互不可见。",
  other: { "page-type": "software", "site-kind": "software" },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" data-type="software" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  )
}
