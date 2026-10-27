import { useRef, type KeyboardEvent } from 'react'
import { playDialogBlip, playPortalSound } from '../soundEngine'

export type MenuItem = {
  id: string
  icon: string
  label: string
  /** What you do there, in plain words. */
  does: string
}

/**
 * An RPG command box: stacked, readable text boxes with a ▶ cursor. Hover or
 * ↑/↓ moves the cursor (the selected box lights up like a hologram), click or
 * Enter confirms. Keys only act while the menu has focus, so they never fight
 * the campus walk controls.
 */
export default function CommandMenu({
  title,
  items,
  selected,
  onSelect,
  onConfirm,
  className = '',
}: {
  title: string
  items: MenuItem[]
  selected: string | null
  onSelect: (id: string | null) => void
  onConfirm: (id: string) => void
  className?: string
}) {
  const buttons = useRef(new Map<string, HTMLButtonElement>())

  const select = (id: string | null) => {
    if (id && id !== selected) playDialogBlip()
    onSelect(id)
  }
  const confirm = (id: string) => {
    playPortalSound()
    onConfirm(id)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    e.stopPropagation()
    const i = items.findIndex((it) => it.id === selected)
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]
    select(next.id)
    buttons.current.get(next.id)?.focus()
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 border-[#7FE3FF]/40 bg-[#0D1030]/85 text-white shadow-[0_0_30px_rgba(127,227,255,0.18)] backdrop-blur-xl ${className}`}
      onMouseLeave={() => onSelect(null)}
    >
      <p className="border-b border-[#7FE3FF]/25 bg-[#7FE3FF]/10 px-4 py-2 text-[11px] font-bold tracking-[0.22em] text-[#7FE3FF]">{title}</p>
      <div role="menu" className="max-h-[min(58vh,460px)] space-y-1.5 overflow-y-auto p-2" onKeyDown={onKeyDown}>
        {items.map((it) => {
          const on = it.id === selected
          return (
            <button
              key={it.id}
              ref={(el) => {
                if (el) buttons.current.set(it.id, el)
                else buttons.current.delete(it.id)
              }}
              role="menuitem"
              onMouseEnter={() => select(it.id)}
              onFocus={() => select(it.id)}
              onClick={() => confirm(it.id)}
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left outline-none transition-all duration-300 ${
                on
                  ? 'translate-x-1 border-[#7FE3FF]/70 bg-[#7FE3FF]/15 shadow-[0_0_18px_rgba(127,227,255,0.35)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/25'
              }`}
            >
              {/* hologram sweep: slides across once when the box is selected (a transition, not a keyframe) */}
              <span
                className={`pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#7FE3FF]/25 to-transparent transition-all duration-700 ${
                  on ? 'left-[110%] opacity-100' : '-left-1/2 opacity-0'
                }`}
              />
              <span className={`w-3 shrink-0 text-xs text-[#F2C879] transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`}>▶</span>
              <span className="text-xl leading-none">{it.icon}</span>
              <span className="min-w-0">
                <span className={`block text-[15px] font-bold leading-tight ${on ? 'text-white' : 'text-white/85'}`}>{it.label}</span>
                <span className={`block text-xs leading-snug ${on ? 'text-[#BFF3FF]' : 'text-white/55'}`}>{it.does}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
