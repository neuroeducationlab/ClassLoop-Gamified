import { Suspense, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Station } from '@/data/interiors'
import { CONTENT } from './contentRegistry'

/**
 * A station's feature, projected as a hologram panel over the room. Campus
 * rooms render straight onto the dark glass; the original app pages sit on a
 * light "screen" inside it so they stay as readable as on the web app.
 */
export default function HoloPanel({ station, lang, color, onClose }: { station: Station; lang: 'th' | 'en'; color: string; onClose: () => void }) {
  const { Component, surface } = CONTENT[station.content]
  const [lit, setLit] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setLit(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="absolute inset-0 z-40 flex items-stretch justify-center p-2 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={station.label[lang]}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex max-h-full w-full flex-col overflow-hidden rounded-3xl border border-[#7FE3FF]/50 bg-[#0D1030]/85 text-white shadow-[0_0_60px_rgba(127,227,255,0.3)] backdrop-blur-xl transition-all duration-300 sm:max-h-[90vh] ${
          surface === 'light' ? 'max-w-5xl' : 'max-w-6xl xl:max-w-7xl w-full'
        } ${lit ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-[0.98] opacity-0'}`}
      >
        {/* top edge glows in the building's colour */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
          <span className="text-2xl">{station.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold leading-tight sm:text-lg">{station.label[lang]}</p>
            <p className="truncate text-xs text-white/65">{station.does[lang]}</p>
          </div>
          <button
            onClick={onClose}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
            aria-label={lang === 'th' ? 'กลับไปที่ห้อง' : 'Back to the room'}
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{lang === 'th' ? 'กลับไปที่ห้อง (Esc)' : 'Back to room (Esc)'}</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/10" />}>
            {surface === 'light' ? (
              <div className="rounded-2xl bg-canvas p-3 text-ink sm:p-6">
                <Component />
              </div>
            ) : (
              <div className="font-campus">
                <Component />
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
