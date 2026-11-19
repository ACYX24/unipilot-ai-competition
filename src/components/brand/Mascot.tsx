export function CatMascot({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="猫咪吉祥物">
      <path d="M14 22 L17 10 L27 17 Z" fill="#FF9350" />
      <path d="M50 22 L47 10 L37 17 Z" fill="#FF9350" />
      <path d="M16.5 20 L18.6 12.6 L25 17 Z" fill="#FFD0AD" />
      <path d="M47.5 20 L45.4 12.6 L39 17 Z" fill="#FFD0AD" />
      <ellipse cx="32" cy="36" rx="20" ry="18" fill="#FFF8EC" />
      <circle cx="24" cy="33" r="2.6" fill="#453630" />
      <circle cx="40" cy="33" r="2.6" fill="#453630" />
      <path d="M29 39 Q32 42 35 39" stroke="#453630" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 37.5 L30.4 39.6 L33.6 39.6 Z" fill="#F98E8E" />
      <circle cx="18" cy="39" r="3" fill="#FFC2C2" opacity="0.8" />
      <circle cx="46" cy="39" r="3" fill="#FFC2C2" opacity="0.8" />
    </svg>
  )
}

export function SheepMascot({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="小羊吉祥物">
      <circle cx="20" cy="24" r="9" fill="#FFFDF8" />
      <circle cx="32" cy="18" r="10" fill="#FFFDF8" />
      <circle cx="44" cy="24" r="9" fill="#FFFDF8" />
      <ellipse cx="32" cy="36" rx="19" ry="15" fill="#FFFDF8" />
      <ellipse cx="32" cy="33" rx="12" ry="10" fill="#FFE8D6" />
      <circle cx="27" cy="31" r="2.2" fill="#453630" />
      <circle cx="37" cy="31" r="2.2" fill="#453630" />
      <path d="M30 36 Q32 38.5 34 36" stroke="#453630" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="36" r="2.6" fill="#FFC2C2" opacity="0.7" />
      <circle cx="42" cy="36" r="2.6" fill="#FFC2C2" opacity="0.7" />
      <path d="M20 48 L20 54" stroke="#A3897A" strokeWidth="3" strokeLinecap="round" />
      <path d="M44 48 L44 54" stroke="#A3897A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = 'h-9' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <CatMascot className="h-full w-auto" />
      <span className="font-extrabold text-cocoa-700 text-lg whitespace-nowrap">
        CatJudge
        <span className="ml-1.5 text-xs font-bold text-tang-500">判判猫</span>
      </span>
    </span>
  )
}
