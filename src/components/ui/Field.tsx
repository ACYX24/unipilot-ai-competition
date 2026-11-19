import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

const controlStyles =
  'w-full bg-white border-2 border-cream-300 rounded-2xl px-4 py-3 text-cocoa-700 placeholder:text-cocoa-400/60 outline-none transition-colors focus:border-tang-400'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="block mb-2 font-bold text-cocoa-600 text-sm">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-xs text-cocoa-400">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlStyles} ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlStyles} resize-none ${props.className ?? ''}`} />
}

export function ChipOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all cursor-pointer ${
        selected
          ? 'bg-tang-400 border-tang-400 text-white shadow-soft'
          : 'bg-white border-cream-300 text-cocoa-500 hover:border-tang-300'
      }`}
    >
      {children}
    </button>
  )
}

export { useId }
