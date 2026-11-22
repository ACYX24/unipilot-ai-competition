import { cn } from "@/lib/utils"

type SheepMascotProps = {
  className?: string
}

/** 小羊吉祥物：对应房间里的另一侧视角 */
export function SheepMascot({ className }: SheepMascotProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="小羊吉祥物"
      className={cn("h-auto w-full", className)}
    >
      <circle cx="20" cy="24" r="9" fill="#FFFDF8" />
      <circle cx="32" cy="18" r="10" fill="#FFFDF8" />
      <circle cx="44" cy="24" r="9" fill="#FFFDF8" />
      <ellipse cx="32" cy="36" rx="19" ry="15" fill="#FFFDF8" />
      <ellipse cx="32" cy="33" rx="12" ry="10" fill="#FFE8D6" />
      <circle cx="27" cy="31" r="2.2" fill="#453630" />
      <circle cx="37" cy="31" r="2.2" fill="#453630" />
      <path
        d="M30 36 Q32 38.5 34 36"
        stroke="#453630"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="22" cy="36" r="2.6" fill="#FFC2C2" opacity="0.7" />
      <circle cx="42" cy="36" r="2.6" fill="#FFC2C2" opacity="0.7" />
      <path d="M20 48 L20 54" stroke="#A3897A" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 48 L44 54" stroke="#A3897A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
