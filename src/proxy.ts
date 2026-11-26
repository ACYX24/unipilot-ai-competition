import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin || origin === request.nextUrl.origin) return NextResponse.next()

  const allowed = (process.env.CATJUDGE_SITE_ORIGINS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!allowed.includes(origin)) {
    return NextResponse.json(
      { error: "此站点没有访问房间接口的权限" },
      { status: 403, headers: { Vary: "Origin", "Cache-Control": "no-store" } },
    )
  }

  const response = request.method === "OPTIONS"
    ? new NextResponse(null, { status: 204 })
    : NextResponse.next()

  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-participant-token")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  response.headers.append("Vary", "Origin")
  response.headers.set("Cache-Control", "no-store")
  return response
}

export const config = { matcher: "/api/rooms/:path*" }
