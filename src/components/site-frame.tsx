import type { ReactNode } from "react"
import Link from "next/link"
import { CatAvatar } from "@/components/cat-mascot"

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <Link href="#main-content" className="skip-content">跳到正文</Link>
      <header className="site-header">
        <div className="site-container site-header-inner">
          <Link href="/" className="site-brand" aria-label="CatJudge 判判猫首页">
            <CatAvatar className="site-mark" />
            <span>CatJudge</span>
            <span className="site-brand-cn">判判猫</span>
          </Link>
          <nav className="site-navigation" aria-label="主导航">
            <Link href="/#how-it-works" className="site-nav-process">调解流程</Link>
            <Link href="/create" className="site-nav-create">创建房间</Link>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">{children}</main>
      <footer className="site-footer">
        <div className="site-container site-footer-inner">
          <span>CatJudge 判判猫</span>
          <p>AI 分析仅辅助沟通，不替代专业心理、法律或危机干预服务</p>
        </div>
      </footer>
    </>
  )
}
