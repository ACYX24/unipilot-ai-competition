"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "首页" },
  { href: "/create", label: "创建房间" },
]

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-colors",
              active
                ? "bg-tang-100 text-tang-600"
                : "text-cocoa-500 hover:bg-tang-50 hover:text-tang-500",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
