import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

const SHOW_MS = 3200
const PIECES = 90
/** ClassLoop palette first, SPU pink as one accent among them. */
const COLOURS = ['#F2C879', '#7FE3FF', '#7C9BE8', '#4FB0A5', '#F2994A', '#E89BC4', '#FFFFFF']

/** Same formula as the campus HUD and the Arena tile. */
const levelOf = (xp: number) => Math.max(1, Math.floor(xp / 100))

/**
 * ClassLoop-branded "LEVEL UP" banner with a confetti burst whenever a
 * student's XP crosses into a new level on a campus page. Mounted once in
 * App so it works in the 3D campus and in every building interior.
 */
export default function LevelUpCelebration() {
  const { studentXP, role } = useApp()
  const { pathname } = useLocation()
  const level = levelOf(studentXP)
  const prev = useRef(level)
  const layer = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState<number | null>(null)

  useEffect(() => {
    const before = prev.current
    prev.current = level
    if (level <= before || role !== 'student' || !pathname.startsWith('/campus')) return
    setShown(level)
    const hide = setTimeout(() => setShown(null), SHOW_MS)
    return () => clearTimeout(hide)
  }, [level, role, pathname])

  useEffect(() => {
    const el = layer.current
    if (shown === null || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const pieces: HTMLElement[] = []
    for (let i = 0; i < PIECES; i++) {
      const p = document.createElement('span')
      const size = 6 + ((i * 7) % 7)
      p.style.cssText = `position:absolute;left:50%;top:38%;width:${size}px;height:${size * 0.45}px;border-radius:2px;background:${COLOURS[i % COLOURS.length]}`
      el.appendChild(p)
      pieces.push(p)
      // deterministic fan-out, gravity-ish fall
      const angle = (i / PIECES) * Math.PI * 2
      const dist = 140 + ((i * 53) % 220)
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist * 0.6
      p.animate(
        [
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${i * 47}deg)`, opacity: 1, offset: 0.45 },
          { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 380}px)) rotate(${i * 97}deg)`, opacity: 0 },
        ],
        { duration: 2200 + ((i * 31) % 600), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
      )
    }
    return () => pieces.forEach((p) => p.remove())
  }, [shown])

  if (shown === null) return null

  return (
    <div ref={layer} className="pointer-events-none fixed inset-0 z-[60] overflow-hidden font-campus" aria-live="polite">
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 fade-in duration-500">
        <div className="rounded-3xl border border-white/30 bg-[#16182E]/85 px-8 py-5 text-center text-white shadow-[0_0_60px_rgba(127,227,255,0.45)] backdrop-blur-md">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#7FE3FF]">CLASSLOOP</p>
          <p className="mt-1 text-3xl font-bold">LEVEL UP!</p>
          <p className="mt-1 text-sm text-white/85">ขึ้นเลเวล {shown} แล้ว · You reached level {shown}</p>
        </div>
      </div>
    </div>
  )
}
