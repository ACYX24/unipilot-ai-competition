import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Logo } from '../brand/Mascot'
import { Button } from '../ui/Button'

const navItems = [
  { to: '/', label: '首页' },
  { to: '/create', label: '发起争议' },
  { to: '/room/demo-room', label: '互动房间' },
  { to: '/result/demo-room', label: '判判结果' },
]

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
          <Button size="sm">开始判判 🐾</Button>
        </Link>
      </div>
    </header>
  )
}

function MobileTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-cream-50/95 backdrop-blur-md border-t border-tang-100 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
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
        <p>© 2026 猫来判判 YangJudge · 让每次小争执都有温柔的解法 🐑</p>
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
