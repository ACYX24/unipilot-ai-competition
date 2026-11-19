import type { ReactNode } from 'react'

type Tone = 'orange' | 'matcha' | 'blush' | 'neutral'

const toneStyles: Record<Tone, string> = {
  orange: 'bg-tang-100 text-tang-600',
  matcha: 'bg-matcha-300/30 text-matcha-500',
  blush: 'bg-blush-300/30 text-blush-500',
  neutral: 'bg-cream-200 text-cocoa-500',
}

export function Badge({
  tone = 'orange',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${toneStyles[tone]}`}
    >
      {children}
    </span>
  )
}
