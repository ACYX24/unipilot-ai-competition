import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-tang-400 text-white shadow-soft hover:bg-tang-500 hover:shadow-lift active:scale-[0.98]',
  secondary:
    'bg-white text-tang-600 border-2 border-tang-200 hover:border-tang-400 hover:text-tang-500 active:scale-[0.98]',
  ghost: 'text-cocoa-500 hover:bg-tang-50 hover:text-tang-600',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-xl',
  md: 'px-6 py-2.5 text-base rounded-2xl',
  lg: 'px-8 py-3.5 text-lg rounded-2xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
