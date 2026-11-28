"use client"

import { useRef, useState } from "react"
import type { RoomMode } from "@/lib/room-types"
import { modeDescriptions, ScenePicture } from "./scene-artwork"

const modes: RoomMode[] = ["court", "teacher"]

export function ModePicker({ mode, onChange, disabled }: {
  mode: RoomMode
  onChange: (mode: RoomMode) => void
  disabled?: boolean
}) {
  const [previous, setPrevious] = useState<RoomMode | null>(null)
  const fieldset = useRef<HTMLFieldSetElement>(null)
  const skipButton = useRef<HTMLButtonElement>(null)

  function choose(next: RoomMode) {
    if (next === mode) return
    setPrevious(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? null : mode)
    onChange(next)
  }

  function skip() {
    setPrevious(null)
    fieldset.current?.querySelector<HTMLInputElement>("input:checked")?.focus()
  }

  return (
    <fieldset ref={fieldset} disabled={disabled} className="mode-picker">
      <legend>选择调解方式</legend>
      <div className="mode-choices">
        {modes.map(value => (
          <label key={value}>
            <ScenePicture frame={modeDescriptions[value].frame} eager />
            <span className="mode-choice-copy">
              <input type="radio" name="mode" value={value} checked={mode === value} onChange={() => choose(value)} />
              <span><strong>{modeDescriptions[value].name}</strong><small>{modeDescriptions[value].detail}</small></span>
            </span>
          </label>
        ))}
      </div>
      <div className="mode-preview" aria-hidden="true" data-mode-preview={mode} data-changing={previous !== null}>
        {previous && <ScenePicture frame={modeDescriptions[previous].frame} eager />}
        <div className="mode-preview-next" key={mode}><ScenePicture frame={modeDescriptions[mode].frame} eager /></div>
        {previous && (
          <div
            key={`curtain-${mode}`}
            className="mode-curtain"
            onAnimationEnd={event => {
              if (event.animationName !== "mode-curtain-run") return
              if (document.activeElement === skipButton.current) skip()
              else setPrevious(null)
            }}
          />
        )}
      </div>
      <div className="mode-preview-controls">
        {previous && <button ref={skipButton} type="button" onClick={skip}>跳过换景</button>}
      </div>
    </fieldset>
  )
}
