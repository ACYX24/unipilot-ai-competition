import Image from "next/image"
import { cn } from "@/lib/utils"

type PortraitName = "cat" | "sheep" | "judge" | "sheep-letter"

function Portrait({ name, className }: { name: PortraitName; className?: string }) {
  return (
    <Image
      src={`/mascots/${name}.webp`}
      alt=""
      width={288}
      height={288}
      unoptimized
      className={cn("block h-auto max-w-full rounded-[28%]", className)}
    />
  )
}

export function CatMascot({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "judge"
  className?: string
}) {
  return <Portrait name={variant === "judge" ? "judge" : "cat"} className={className} />
}

export function CatAvatar({
  tone = "orange",
  className,
}: {
  tone?: "orange" | "blue"
  className?: string
}) {
  return <Portrait name={tone === "blue" ? "sheep" : "cat"} className={className} />
}

export function SheepWithLetter({ className }: { className?: string }) {
  return <Portrait name="sheep-letter" className={className} />
}
