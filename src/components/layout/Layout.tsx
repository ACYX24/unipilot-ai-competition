import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Logo } from '../brand/Mascot'
import { Button } from '../ui/Button'
import { useRoom } from '../../state/RoomContext'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/create', label: '创建房间' },
  { to: '/join', label: '加入房间' },
]

/** 演示专用：模拟“以 A / 以 B 的身份浏览”，真实产品由登录态决定 */
function PerspectiveSwitcher() {
  const { pathname } = useLocation()
  const { side, setPerspective, room, resetRoom } = useRoom()
  if (!pathname.startsWith('/room/')) return null
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="flex flex-wrap items-center gap-2 bg-tang-50/80 border border-tang-200 rounded-2xl px-3 py-2 text-xs">
        <span className="font-bold text-cocoa-500">演示视角</span>
        {(['A', 'B'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setPerspective(s)}
            className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
              side === s ? 'bg-tang-400 text-white shadow-soft' : 'bg-white text-cocoa-500 hover:text-tang-500'
            }`}
          >
            {room[s].avatar} 以{s === 'A' ? '甲方' : '乙方'}「{room[s].name}」浏览
          </button>
        ))}
        <button
          onClick={resetRoom}
          className="ml-auto px-3 py-1 rounded-full font-bold text-cocoa-400 hover:text-blush-500 transition-colors cursor-pointer"
        >
          重置演示数据
        </button>
      </div>
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-cream-100/85 backdrop-blur-md border-b border-tang-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0 hover:scale-105 transition-transform">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-tang-100 text-tang-600'
                    : 'text-cocoa-500 hover:text-tang-500 hover:bg-tang-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/create" className="hidden md:block shrink-0">
          <Button size="sm">开始调解 🐾</Button>
        </Link>
      </div>
    </header>
  )
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-cream-50/95 backdrop-blur-md border-t border-tang-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
                isActive ? 'text-tang-500' : 'text-cocoa-400'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="border-t border-tang-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-cocoa-400">
        <Logo className="h-7" />
        <p>© 2026 CatJudge · 不急着判断谁对谁错，先让彼此听懂对方 🐾</p>
      </div>
    </footer>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-4">
        <PerspectiveSwitcher />
      </div>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
