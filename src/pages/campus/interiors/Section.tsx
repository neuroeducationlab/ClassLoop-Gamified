import type { ReactNode } from 'react'

/** Card wrapper shared by every building interior. */
export default function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-3xl border border-grey-300/60 bg-paper p-5 shadow-sm">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {sub && <p className="mt-0.5 text-xs text-grey-600">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Small "+N XP" chip shown when a student earns points. */
export function XPChip({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 animate-fadeIn">
      +{amount} XP
    </span>
  )
}
