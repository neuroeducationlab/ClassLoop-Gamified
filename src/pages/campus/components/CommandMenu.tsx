import { useRef, type KeyboardEvent } from 'react'
import { playDialogBlip, playPortalSound } from '../soundEngine'
import { GameIcon, type IconName } from '@/components/icons/GameIcon'

export type MenuItem = {
  id: string
  icon: IconName
  label: string
  /** What you do there, in plain words. */
  does: string
  actionBadge?: string
  urgent?: boolean
}

/**
 * An RPG command box: stacked, readable text boxes with a ▶ cursor. Hover or
 * ↑/↓ moves the cursor (the selected box lights up like a hologram), click or
 * Enter confirms.
 */
export default function CommandMenu({
  title,
  subtitle,
  items,
  selected,
  onSelect,
  onConfirm,
  className = '',
}: {
  title: string
  subtitle?: string
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
      className={`overflow-hidden rounded-2xl border-2 border-[#7FE3FF]/50 bg-[#0D1030]/90 text-white shadow-[0_0_35px_rgba(127,227,255,0.22)] backdrop-blur-xl ${className}`}
      onMouseLeave={() => onSelect(null)}
    >
      {/* Header bar */}
      <div className="border-b border-[#7FE3FF]/25 bg-gradient-to-r from-[#7FE3FF]/15 via-purple-500/10 to-transparent px-4 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black tracking-[0.2em] text-[#7FE3FF] uppercase">{title}</p>
          {subtitle && <p className="text-[10px] text-white/50">{subtitle}</p>}
        </div>
        <span className="rounded bg-teal-400/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-teal-300 border border-teal-400/30">
          RPG CONSOLE
        </span>
      </div>

      {/* Vertical scrollable command list */}
      <div
        role="menu"
        className="max-h-[min(64vh,500px)] space-y-2 overflow-y-auto p-2.5"
        onKeyDown={onKeyDown}
      >
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
              className={`group relative flex w-full items-start gap-2.5 overflow-hidden rounded-xl border p-2.5 text-left outline-none transition-all duration-200 cursor-pointer ${
                on
                  ? 'translate-x-1 border-[#7FE3FF]/80 bg-[#7FE3FF]/18 shadow-[0_0_20px_rgba(127,227,255,0.4)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]'
              }`}
            >
              {/* Hologram sweep animation on selection */}
              <span
                className={`pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#7FE3FF]/30 to-transparent transition-all duration-700 ${
                  on ? 'left-[110%] opacity-100' : '-left-1/2 opacity-0'
                }`}
              />

              {/* Cursor indicator */}
              <span className={`w-3.5 shrink-0 text-xs font-black text-[#F2C879] transition-opacity mt-0.5 ${on ? 'opacity-100 translate-x-0.5' : 'opacity-0'}`}>
                <GameIcon name="play" className="fill-current" />
              </span>

              {/* Icon */}
              <GameIcon name={it.icon} className="text-xl leading-none mt-0.5" />

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className={`text-sm font-black leading-tight ${on ? 'text-white' : 'text-white/90'}`}>
                    {it.label}
                  </span>
                  {it.actionBadge && (
                    <span
                      className={`rounded-md px-1.5 py-0.2 text-[9px] font-black shrink-0 ${
                        it.urgent
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-400/50 animate-pulse'
                          : on
                          ? 'bg-amber-400/30 text-amber-100 border border-amber-300/50'
                          : 'bg-white/10 text-white/70 border border-white/15'
                      }`}
                    >
                      {it.actionBadge}
                    </span>
                  )}
                </div>
                <span className={`block text-xs leading-snug mt-0.5 ${on ? 'text-[#BFF3FF]' : 'text-white/60'}`}>
                  {it.does}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
