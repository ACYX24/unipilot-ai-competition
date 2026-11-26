import { useMemo, useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

function readPath() {
  const path = window.location.hash.slice(1)
  return path.startsWith("/") && !path.startsWith("//") ? path : "/"
}

export function useSiteLocation() {
  const path = useSyncExternalStore(subscribe, readPath)
  return useMemo(() => new URL(path, window.location.origin), [path])
}

function navigate(path: string, replace = false) {
  if (path === readPath()) return
  if (replace) window.location.replace(`#${path}`)
  else window.location.hash = path
}

const router = {
  push: (path: string) => navigate(path),
  replace: (path: string) => navigate(path, true),
}

export function useRouter() {
  return router
}

export function useParams<T extends { roomId: string }>(): T {
  const { pathname } = useSiteLocation()
  const roomId = pathname.split("/")[2] ?? ""
  return { roomId } as T
}

export function useSearchParams() {
  return useSiteLocation().searchParams
}
