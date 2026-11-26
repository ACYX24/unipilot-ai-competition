import type { ComponentProps } from "react"

export default function Link({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) {
  const anchor = href.startsWith("#")
  const internal = href.startsWith("/") && !href.startsWith("//")
  return (
    <a
      {...props}
      href={internal ? `#${href}` : href}
      onClick={(event) => {
        onClick?.(event)
        if (!anchor || event.defaultPrevented) return
        const target = document.getElementById(href.slice(1))
        if (target) {
          event.preventDefault()
          target.focus()
          target.scrollIntoView()
        }
      }}
    />
  )
}
