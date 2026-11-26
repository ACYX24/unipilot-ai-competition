import type { ComponentProps } from "react"

export default function Image(input: Omit<ComponentProps<"img">, "src"> & { src: string; unoptimized?: boolean }) {
  const props = { ...input }
  delete props.unoptimized
  const src = props.src.startsWith("/") ? `.${props.src}` : props.src
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt ?? ""} src={src} />
}
