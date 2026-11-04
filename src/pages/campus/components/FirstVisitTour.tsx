import { useEffect, useState } from 'react'
import { ChevronRight, Compass, Gamepad2, X } from 'lucide-react'
import { GameIcon } from '@/components/icons/GameIcon'

/**
 * First-visit tour for the 3D campus. One 3-step card deck for a visitor who
 * just walked up to the demo booth and scanned the QR — explains the three
 * things they can do (walk, enter a building, switch demo modes) without
 * leaning on desktop-only cues like WASD.
 *
 * sessionStorage, not localStorage: a new tab (= a new visitor at the booth)
 * sees it again, but a mid-play reload doesn't nag the same person twice.
 */

const KEY = 'classloop_tour_v1'

type Step = {
  icon: typeof Compass
  title: { th: string; en: string }
  body: { th: string; en: string }
  /** Optional lower caption for the mobile-specific tip. */
  tip?: { th: string; en: string }
}

const STEPS: Step[] = [
  {
    icon: Compass,
    title: { th: 'เดินสำรวจแคมปัส', en: 'Walk the campus' },
    body: {
      th: 'แตะพื้นที่ที่อยากเดินไป หรือใช้จอยสติ๊กด้านซ้ายล่างควบคุมอวตาร',
      en: 'Tap anywhere on the ground to walk, or use the joystick in the bottom-left.',
    },
    tip: {
      th: 'ลากหน้าจอเพื่อหมุนมุมมอง · เดินเข้าใกล้อาคารจะมีป้ายขึ้นมา',
      en: 'Drag the screen to look around · get close to a building and a hint appears.',
    },
  },
  {
    icon: GameIcon as never, // placeholder; we render the door icon below
    title: { th: 'เข้าอาคารเพื่อใช้ฟีเจอร์', en: 'Step inside a building' },
    body: {
      th: 'แต่ละอาคาร = ฟีเจอร์หนึ่งของระบบ เช่น ห้องเรียน AI, ลานฝึกสมอง, ร้านแต่งตัว',
      en: 'Each building is one feature — AI lesson studio, brain gym, boutique, and more.',
    },
    tip: {
      th: 'แตะอาคารเพื่อเข้าเลย ไม่ต้องรอจะเดินไปถึง',
      en: 'Tap the building — you don’t have to walk all the way there.',
    },
  },
  {
    icon: Gamepad2,
    title: { th: 'ปุ่มลัดมุมล่างขวา', en: 'Shortcut at the bottom-right' },
    body: {
      th: 'ปุ่มรูปห่วงที่มุมล่างขวาเปิดเมนูสลับมุมมอง (นักศึกษา / อาจารย์ / แคมปัส 3D)',
      en: 'The loop button at the bottom-right opens the demo menu — switch between Student, Teacher Studio, and the 3D campus.',
    },
    tip: {
      th: 'ในเมนูมีปุ่ม "เริ่มเดโม่ใหม่" สำหรับคนถัดไปด้วย',
      en: 'The menu also has a “Restart Demo” button for the next visitor.',
    },
  },
]

export default function FirstVisitTour({ lang }: { lang: 'th' | 'en' }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setOpen(true)
    } catch {
      /* private mode: show it once in memory and move on */
      setOpen(true)
    }
  }, [])

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  if (!open) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = step === 1 ? null : s.icon
  const t = (th: string, en: string) => (lang === 'th' ? th : en)

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-[#121422]/95 p-6 text-white shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200"
      >
        {/* Close */}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('ปิด', 'Close')}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-md">
            {step === 1 ? (
              <GameIcon name="door" className="text-2xl text-white" />
            ) : Icon ? (
              <Icon className="h-6 w-6 text-white" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
              {t('แนะนำการใช้งาน', 'Quick tour')} · {step + 1}/{STEPS.length}
            </p>
            <h2 className="text-lg font-black leading-tight text-white">{s.title[lang]}</h2>
          </div>
        </div>

        {/* Body */}
        <p className="mb-2 text-sm leading-relaxed text-white/90">{s.body[lang]}</p>
        {s.tip && (
          <p className="mb-5 text-xs leading-relaxed text-white/60">{s.tip[lang]}</p>
        )}

        {/* Step dots */}
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-5 bg-pink-500' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-semibold text-white/50 hover:text-white/80 transition-colors cursor-pointer"
          >
            {t('ข้าม', 'Skip')}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-[0.97] transition-all cursor-pointer"
          >
            {isLast ? t('เริ่มเล่น', 'Let’s go') : t('ถัดไป', 'Next')}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
