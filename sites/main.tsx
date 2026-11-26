import { useEffect } from "react"
import { createRoot } from "react-dom/client"
import CreateRoomPage from "@/app/create/page"
import { ReportView } from "@/app/report/[roomId]/report-view"
import FeedbackPage from "@/app/room/[roomId]/feedback/page"
import { RoomStageGate } from "@/app/room/[roomId]/stage-gate"
import StatementPage from "@/app/room/[roomId]/statement/page"
import WaitingPage from "@/app/room/[roomId]/waiting/page"
import { HomeContent } from "@/components/home-content"
import { SiteFrame } from "@/components/site-frame"
import { configureRoomApiOrigin } from "@/lib/room-api"
import { DemoPage } from "./demo-page"
import Link from "./link"
import { useSiteLocation } from "./navigation"
import "./styles.css"

configureRoomApiOrigin(import.meta.env.VITE_CATJUDGE_API_ORIGIN)

function RouteContent({ pathname }: { pathname: string }) {
  if (pathname === "/") return <HomeContent contest />
  if (pathname === "/create") return <CreateRoomPage />
  if (pathname === "/demo") return <DemoPage />

  const match = /^\/(room|report)\/([\w-]+)(?:\/(statement|waiting|feedback))?$/.exec(pathname)
  if (match) {
    const [, page, roomId, phase] = match
    if (page === "report" && !phase) return <ReportView roomId={roomId} />
    if (page === "room") {
      if (phase === "statement") return <StatementPage />
      if (phase === "waiting") return <WaitingPage />
      if (phase === "feedback") return <FeedbackPage />
      return <RoomStageGate roomId={roomId} />
    }
  }

  return (
    <div className="site-container py-16">
      <h1 className="display-heading text-3xl">找不到这个页面</h1>
      <Link className="mt-4 inline-block underline" href="/">返回首页</Link>
    </div>
  )
}

function App() {
  const { pathname, search, hash } = useSiteLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <SiteFrame>
      <RouteContent key={pathname + search} pathname={pathname} />
    </SiteFrame>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
