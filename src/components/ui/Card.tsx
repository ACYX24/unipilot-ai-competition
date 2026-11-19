import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`bg-cream-50 rounded-3xl shadow-soft border border-tang-100 p-6 md:p-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
