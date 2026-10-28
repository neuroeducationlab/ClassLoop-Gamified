import type { ReactNode } from 'react'
import { GameIcon } from '@/components/icons/GameIcon'

/** Card wrapper shared by every building interior with high-tech glassmorphism styling. */
export default function Section({
  title,
  sub,
  icon,
  action,
  children,
  className = '',
}: {
  title: string
  sub?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`relative mb-5 overflow-hidden rounded-3xl border border-white/15 bg-black/40 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 ${className}`}
    >
      {/* Subtle top glowing line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg shadow-sm">
              {icon}
            </span>
          )}
          <div>
            <h2 className="text-base font-extrabold tracking-wide text-white drop-shadow-sm">{title}</h2>
            {sub && <p className="mt-0.5 text-xs text-white/70">{sub}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div>{children}</div>
    </section>
  )
}

/** Glowing "+N XP" chip shown when a student earns experience. */
export function XPChip({ amount, label }: { amount: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-yellow-500/25 px-2.5 py-0.5 text-xs font-extrabold text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)] animate-in zoom-in-50 fade-in duration-300">
      <GameIcon name="sparkles" />
      <span>+{amount} XP</span>
      {label && <span className="text-[10px] text-amber-200/80 font-normal">({label})</span>}
    </span>
  )
}

/** Glowing "+N Coins" chip */
export function CoinChip({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/50 bg-gradient-to-r from-yellow-500/25 to-amber-600/25 px-2.5 py-0.5 text-xs font-extrabold text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.25)] animate-in zoom-in-50 fade-in duration-300">
      <GameIcon name="coin" />
      <span>+{amount}</span>
    </span>
  )
}
