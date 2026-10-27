import { Suspense, useEffect, useState, type ReactNode } from 'react'
import type { ContentKey } from '@/data/interiors'
import { CONTENT } from '../interior/contentRegistry'
import { Radio } from 'lucide-react'

/** Width the page is laid out at before it is shrunk into the hologram. */
const PAGE_WIDTH = 1280

/**
 * A futuristic hologram card that projects a live, shrunken copy of a real page, so a
 * teacher sees where a command leads before choosing it. The copy is inert:
 * no clicks, no focus, no screen-reader noise.
 */
export default function HoloPreview({
  content,
  width = 460,
  height = 290,
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
      // next frame: let the dimmed state paint first so the fade-in transitions smoothly
      requestAnimationFrame(() => setLit(true))
    }, 100)
    return () => clearTimeout(id)
  }, [content])

  if (!shown) return null
  const { Component } = CONTENT[shown]
  const scale = width / PAGE_WIDTH

  return (
    <div
      aria-hidden
      className={`pointer-events-none transition-all duration-300 ${
        lit && content
          ? 'translate-y-0 scale-100 opacity-100 blur-0'
          : 'translate-y-3 scale-95 opacity-0 blur-[2px]'
      }`}
    >
      {/* Projector beam from the command menu */}
      <div className="absolute -left-6 top-8 h-28 w-6 bg-gradient-to-r from-transparent to-[#7FE3FF]/25 [clip-path:polygon(0_45%,100%_0,100%_100%,0_55%)]" />

      {/* Hologram Card Frame */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-[#7FE3FF]/70 bg-[#0D1030]/90 shadow-[0_0_50px_rgba(127,227,255,0.35)] backdrop-blur-xl"
        style={{ width, height }}
      >
        {/* Top HUD status bar */}
        <div className="flex items-center justify-between border-b border-[#7FE3FF]/30 bg-[#0D1030]/90 px-3 py-1.5 text-[10px] font-mono tracking-wider text-[#7FE3FF]">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-[#7FE3FF] animate-ping" />
            [HOLO-PREVIEW // LIVE]
          </span>
          <span className="text-white/60 flex items-center gap-1">
            <Radio className="h-2.5 w-2.5 text-emerald-400" />
            60 FPS SYNC
          </span>
        </div>

        {/* Real Live Rendered Web Page View */}
        <div
          inert
          className="origin-top-left bg-canvas text-ink pointer-events-none select-none"
          style={{ width: PAGE_WIDTH, transform: `scale(${scale})` }}
        >
          <Suspense fallback={<div className="h-[800px] animate-pulse bg-white/60" />}>
            <div className="p-6">
              <Component />
            </div>
          </Suspense>
        </div>

        {/* Cyber Hologram Overlays: cyan wash, scanlines, and vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[#7FE3FF]/8 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(127,227,255,0.12)_0px,rgba(127,227,255,0.12)_1px,transparent_1px,transparent_4px)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D1030] to-transparent" />

        {/* Sci-Fi Corner Brackets */}
        <div className="pointer-events-none absolute left-1 top-7 h-3 w-3 border-l-2 border-t-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute right-1 top-7 h-3 w-3 border-r-2 border-t-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute left-1 bottom-1 h-3 w-3 border-l-2 border-b-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute right-1 bottom-1 h-3 w-3 border-r-2 border-b-2 border-[#7FE3FF]" />
      </div>

      {footer}
    </div>
  )
}
