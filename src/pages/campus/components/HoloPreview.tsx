import { Suspense, useEffect, useState, type ReactNode } from 'react'
import type { ContentKey } from '@/data/interiors'
import { CONTENT } from '../interior/contentRegistry'
import { Radio, ArrowRight } from 'lucide-react'

/** Width the page is laid out at before it is shrunk into the hologram. */
const PAGE_WIDTH = 1280

/**
 * A futuristic hologram card that projects a live, shrunken copy of a real page, so a
 * teacher sees where a command leads before choosing it.
 * - Sci-Fi unfold animation on reveal
 * - Portal suction warp animation on confirm
 * - Interactive: clickable to launch directly
 */
export default function HoloPreview({
  content,
  width = 680,
  height = 420,
  isWarping = false,
  onConfirm,
  footer,
}: {
  content: ContentKey | null
  width?: number
  height?: number
  isWarping?: boolean
  onConfirm?: () => void
  footer?: ReactNode
}) {
  const [shown, setShown] = useState<ContentKey | null>(null)
  const [lit, setLit] = useState(false)

  useEffect(() => {
    setLit(false)
    if (!content) return
    const id = setTimeout(() => {
      setShown(content)
      requestAnimationFrame(() => setLit(true))
    }, 80)
    return () => clearTimeout(id)
  }, [content])

  if (!shown) return null
  const { Component } = CONTENT[shown]
  const scale = width / PAGE_WIDTH

  return (
    <div
      aria-hidden
      onClick={onConfirm}
      className={`relative select-none transition-all duration-300 ${
        isWarping
          ? 'scale-[0.98] opacity-80 filter brightness-110 pointer-events-none'
          : lit && content
          ? 'animate-holo-unfold opacity-100'
          : 'opacity-0 scale-95'
      }`}
    >
      {/* Hologram Card Frame */}
      <div
        className="group relative overflow-hidden rounded-2xl border-2 border-[#7FE3FF]/70 bg-[#0D1030]/95 shadow-[0_0_60px_rgba(127,227,255,0.4)] backdrop-blur-2xl pointer-events-auto cursor-pointer transition-all duration-200 hover:border-[#7FE3FF] hover:shadow-[0_0_75px_rgba(127,227,255,0.55)]"
        style={{ width, height }}
      >
        {/* Top HUD status bar */}
        <div className="flex items-center justify-between border-b border-[#7FE3FF]/30 bg-[#0D1030]/90 px-3.5 py-2 text-[10px] font-mono tracking-wider text-[#7FE3FF]">
          <span className="flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-[#7FE3FF] animate-ping" />
            [HOLO-PREVIEW // LIVE TRANSMISSION]
          </span>
          <div className="flex items-center gap-3">
            <span className="text-white/60 flex items-center gap-1">
              <Radio className="h-2.5 w-2.5 text-emerald-400" />
              60 FPS SYNC
            </span>
            <span className="rounded bg-teal-400/20 px-2 py-0.5 text-[9px] font-bold text-teal-200 border border-teal-400/30 flex items-center gap-1 group-hover:bg-teal-400/35 transition-colors">
              <span>Enter to Launch</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
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
        <div className="pointer-events-none absolute left-1 top-8 h-3.5 w-3.5 border-l-2 border-t-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute right-1 top-8 h-3.5 w-3.5 border-r-2 border-t-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute left-1 bottom-1 h-3.5 w-3.5 border-l-2 border-b-2 border-[#7FE3FF]" />
        <div className="pointer-events-none absolute right-1 bottom-1 h-3.5 w-3.5 border-r-2 border-b-2 border-[#7FE3FF]" />
      </div>

      {footer}
    </div>
  )
}
