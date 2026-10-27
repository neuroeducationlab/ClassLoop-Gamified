import { Suspense, useEffect, useState, type ReactNode } from 'react'
import type { ContentKey } from '@/data/interiors'
import { CONTENT } from '../interior/contentRegistry'

/** Width the page is laid out at before it is shrunk into the hologram. */
const PAGE_WIDTH = 1280

/**
 * A hologram card that projects a live, shrunken copy of a real page, so a
 * teacher sees where a command leads before choosing it. The copy is inert:
 * no clicks, no focus, no screen-reader noise. It waits a beat after hover
 * (so sweeping the mouse down the menu doesn't mount every page), then
 * flickers in.
 */
export default function HoloPreview({
  content,
  width = 400,
  height = 250,
  footer,
}: {
  content: ContentKey | null
  width?: number
  height?: number
  footer?: ReactNode
}) {
  const [shown, setShown] = useState<ContentKey | null>(null)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    setLit(false)
    if (!content) return
    const id = setTimeout(() => {
      setShown(content)
      // next frame: let the dimmed state paint first so the fade-in transitions
      requestAnimationFrame(() => setLit(true))
    }, 120)
    return () => clearTimeout(id)
  }, [content])

  if (!shown) return null
  const { Component } = CONTENT[shown]
  const scale = width / PAGE_WIDTH

  return (
    <div
      aria-hidden
      className={`pointer-events-none transition-all duration-300 ${lit && content ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-2 opacity-0 blur-[2px]'}`}
    >
      {/* projector beam from the menu */}
      <div className="absolute -left-6 top-6 h-24 w-6 bg-gradient-to-r from-transparent to-[#7FE3FF]/25 [clip-path:polygon(0_45%,100%_0,100%_100%,0_55%)]" />
      <div
        className="relative overflow-hidden rounded-2xl border border-[#7FE3FF]/60 bg-[#0D1030]/70 shadow-[0_0_40px_rgba(127,227,255,0.35)]"
        style={{ width, height }}
      >
        <div inert className="origin-top-left bg-canvas text-ink" style={{ width: PAGE_WIDTH, transform: `scale(${scale})` }}>
          <Suspense fallback={<div className="h-[800px] animate-pulse bg-white/60" />}>
            <div className="p-6">
              <Component />
            </div>
          </Suspense>
        </div>
        {/* hologram treatment: cyan wash + scanlines + bottom fade */}
        <div className="absolute inset-0 bg-[#7FE3FF]/10 mix-blend-screen" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(127,227,255,0.10)_0px,rgba(127,227,255,0.10)_1px,transparent_1px,transparent_4px)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D1030] to-transparent" />
      </div>
      {footer}
    </div>
  )
}
