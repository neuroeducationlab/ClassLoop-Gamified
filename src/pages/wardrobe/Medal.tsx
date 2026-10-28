import { BADGE_BY_ID, type BadgeId } from './badges'

/** A round medal with a ribbon tail. Earned medals glow; locked ones are greyed out. */
export function Medal({ id, size = 40, locked = false }: { id: BadgeId; size?: number; locked?: boolean }) {
  const b = BADGE_BY_ID[id]
  const Icon = b.icon
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }} title={b.name.en}>
      <span
        className="absolute inset-0 rounded-full border-2 border-[#5B3A2E] shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]"
        style={{ background: locked ? 'linear-gradient(160deg,#D8D2CC,#A9A29C)' : `linear-gradient(160deg, ${b.from}, ${b.to})` }}
      />
      <span className="absolute inset-[18%] rounded-full bg-white/25" />
      <Icon className="relative text-white drop-shadow" style={{ width: size * 0.5, height: size * 0.5, opacity: locked ? 0.7 : 1 }} strokeWidth={2.6} />
    </span>
  )
}
