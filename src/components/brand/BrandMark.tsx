import { useId } from 'react'
import { cn } from '@/lib/utils'

const LOOP =
  'M32 16C24 4 6 4 6 16C6 28 24 28 32 16C40 4 58 4 58 16C58 28 40 28 32 16Z'
// Strand that passes over the centre crossing — the exact sub-curves of LOOP around (32,16).
const BRIDGE =
  'M27.82 20.59C29.38 19.33 30.8 17.8 32 16C33.2 14.2 34.63 12.67 36.18 11.41'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function BrandMark({ className, animated = true }: { className?: string; animated?: boolean }) {
  // useId output contains characters that break url(#…) references
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const grad = `cl-grad-${uid}`
  const glow = `cl-glow-${uid}`
  const spark = `cl-spark-${uid}`
  const gap = `cl-gap-${uid}`
  const moving = animated && !prefersReducedMotion()

  return (
    <svg
      viewBox="0 0 64 32"
      className={cn('h-8 w-16 shrink-0 overflow-visible', className)}
      role="img"
      aria-label="ClassLoop"
    >
      <defs>
        <linearGradient id={grad} x1="6" y1="6" x2="58" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="0.42" stopColor="#D12E80" />
          <stop offset="0.7" stopColor="#EE4D9B" />
          <stop offset="1" stopColor="#F2C879" />
        </linearGradient>
        <filter id={glow} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <radialGradient id={spark}>
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor="#FFF1C9" />
          <stop offset="1" stopColor="#F2C879" stopOpacity="0" />
        </radialGradient>
        {/* cuts the under-strand where the bridge crosses, so the knot reads as over/under */}
        <mask id={gap} maskUnits="userSpaceOnUse" x="-4" y="-4" width="72" height="40">
          <rect x="-4" y="-4" width="72" height="40" fill="#FFFFFF" />
          <path d={BRIDGE} fill="none" stroke="#000000" strokeWidth="9.5" />
        </mask>
      </defs>

      <path d={LOOP} fill="none" stroke={`url(#${grad})`} strokeWidth="7" opacity="0.35" filter={`url(#${glow})`} />
      <g mask={`url(#${gap})`}>
        <path d={LOOP} fill="none" stroke={`url(#${grad})`} strokeWidth="6" strokeLinejoin="round" />
        <path d={LOOP} fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.32" strokeLinejoin="round" />
      </g>
      <path d={BRIDGE} fill="none" stroke={`url(#${grad})`} strokeWidth="6" />
      <path d={BRIDGE} fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.32" />

      <g transform={moving ? undefined : 'translate(51.5 7.2)'}>
        <circle r="4.2" fill={`url(#${spark})`} />
        <circle r="1.5" fill="#FFFFFF" stroke="#F2C879" strokeWidth="0.6" />
        {moving && <animateMotion dur="3.6s" repeatCount="indefinite" path={LOOP} />}
      </g>
    </svg>
  )
}

export function BrandLockup({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <BrandMark className={cn('h-7 w-14', markClassName)} />
      <span className="flex flex-col font-campus leading-tight">
        <span className="text-base sm:text-lg font-black tracking-tight text-pink-600">ClassLoop</span>
        <span className="text-[10px] sm:text-[11px] font-semibold text-grey-400 tracking-wider">for SPU</span>
      </span>
    </span>
  )
}
