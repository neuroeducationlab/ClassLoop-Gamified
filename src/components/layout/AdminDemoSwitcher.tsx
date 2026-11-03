import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { restartDemo } from '@/pages/wardrobe/store'
import {
  GraduationCap,
  Presentation,
  Gamepad2,
  Map as MapIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Pin,
  PinOff,
  Check,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BrandMark } from '@/components/brand/BrandMark'
import { playClickSound, playCoinSound, isSoundMuted, toggleSoundMute } from '@/pages/campus/soundEngine'
import { cn } from '@/lib/utils'

export default function AdminDemoSwitcher() {
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const { role, setRole, lang, setLang, activeCourseId, setActiveCourseId, coursePacks, resetDemo } = useApp()
  const [isMuted, setIsMuted] = useState(isSoundMuted())

  const isOpen = isHovered || isPinned

  // Mouse hover handlers with gentle 300ms delay to prevent jitter
  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 300)
  }

  // Keyboard shortcut: Alt+D or Ctrl+Shift+D to toggle switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.code === 'KeyD') || (e.ctrlKey && e.shiftKey && e.code === 'KeyD')) {
        e.preventDefault()
        setIsPinned((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsPinned(false)
        setIsHovered(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSwitch = (to: string, targetRole?: 'student' | 'teacher') => {
    playCoinSound()
    if (targetRole) {
      setRole(targetRole)
    }
    setIsPinned(false)
    setIsHovered(false)
    navigate(to)
  }

  const handleResetDemo = () => {
    playCoinSound()
    resetDemo()
    restartDemo() // quests, badges and the avatar look, so the next visitor starts clean
    setResetSuccess(true)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setResetSuccess(false)
    }, 2200)
  }

  const currentPath = location.pathname

  const MODES = [
    {
      id: 'student',
      titleTh: 'นักเรียน (Student)',
      titleEn: 'Student 2D',
      icon: GraduationCap,
      path: '/student',
      targetRole: 'student' as const,
      gradient: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400',
      active: currentPath.startsWith('/student') && role === 'student',
    },
    {
      id: 'teacher',
      titleTh: 'อาจารย์ (Teacher)',
      titleEn: 'Teacher Studio',
      icon: Presentation,
      path: '/teacher',
      targetRole: 'teacher' as const,
      gradient: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
      active: currentPath.startsWith('/teacher') && role === 'teacher',
    },
    {
      id: 'campus3d',
      titleTh: 'แคมปัส 3D (3D World)',
      titleEn: '3D Campus',
      icon: Gamepad2,
      path: '/campus',
      gradient: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
      active: currentPath.startsWith('/campus'),
    },
    {
      id: 'map2d',
      titleTh: 'แผนที่ 2D (2D Map)',
      titleEn: '2D Campus Map',
      icon: MapIcon,
      path: '/map',
      gradient: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
      active: currentPath === '/map',
    },
  ]

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-campus"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── EXPANDABLE QUICK SWITCHER DOCK (Unfolds smoothly on hover / pin) ── */}
      <div
        className={cn(
          'absolute bottom-16 right-0 w-[330px] sm:w-[360px] rounded-3xl border border-white/20 bg-[#121422]/95 p-4 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out origin-bottom-right space-y-3',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-3 pointer-events-none',
        )}
      >
        {/* Dock Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-600/30 border border-pink-500/40">
              <Sparkles className="h-4 w-4 text-pink-400" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>ClassLoop Quick Demo</span>
                <span className="rounded bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-mono text-pink-300">
                  LIVE
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound()
                setIsPinned((prev) => !prev)
              }}
              className={cn(
                'rounded-lg p-1.5 text-xs transition-colors cursor-pointer',
                isPinned
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
              title={isPinned ? 'Unpin menu' : 'Pin menu open while filming'}
            >
              {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* 4 Mode Switch Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2">
          {MODES.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSwitch(m.path, m.targetRole)}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all cursor-pointer',
                  m.active
                    ? 'border-pink-500 bg-pink-500/20 ring-1 ring-pink-500/50 shadow-md'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:scale-95',
                )}
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 shrink-0', m.gradient)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white group-hover:text-pink-300 truncate">
                    {lang === 'th' ? m.titleTh : m.titleEn}
                  </p>
                  <span className="text-[10px] text-white/50 block font-mono">
                    {m.path}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Active Course Syllabus Pills */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/60">
            <span>{lang === 'th' ? 'สลับวิชาเรียน (Course)' : 'Active Syllabus'}</span>
            <span className="text-[9px] font-mono text-white/40">3 Packs</span>
          </div>
          <div className="flex gap-1.5">
            {coursePacks.map((pack) => {
              const isCur = pack.course.id === activeCourseId
              return (
                <button
                  key={pack.course.id}
                  type="button"
                  onClick={() => {
                    playCoinSound()
                    setActiveCourseId(pack.course.id)
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1 px-1.5 text-[11px] font-bold transition-all cursor-pointer border',
                    isCur
                      ? 'border-pink-500 bg-pink-500/25 text-white shadow-xs'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
                  )}
                  title={pack.course.name}
                >
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: pack.accent }} />
                  <span className="font-mono">{pack.course.code}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── RESET DEMO BUTTON (Hidden here to keep video presentation clean) ── */}
        <button
          type="button"
          onClick={handleResetDemo}
          className={cn(
            'w-full flex items-center justify-between rounded-2xl border p-2.5 text-xs font-bold transition-all cursor-pointer active:scale-[0.98]',
            resetSuccess
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50',
          )}
          title="Reset demo data to clean slate"
        >
          <div className="flex items-center gap-2">
            {resetSuccess ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <RotateCcw className="h-4 w-4 text-amber-400" />
            )}
            <span className="font-extrabold">
              {resetSuccess
                ? (lang === 'th' ? '✓ รีเซ็ตข้อมูลเรียบร้อย!' : '✓ Reset Complete!')
                : (lang === 'th' ? 'รีเซ็ตข้อมูลเดโม่ (Reset Demo)' : 'Reset Demo Data')}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/60 font-mono">Clean Slate</span>
        </button>

        {/* Utility Controls (Language & Audio) */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/50">{lang === 'th' ? 'ภาษา:' : 'Lang:'}</span>
            <div className="inline-flex rounded-xl bg-white/10 p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setLang('th')}
                className={cn(
                  'rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer',
                  lang === 'th' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
                )}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={cn(
                  'rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer',
                  lang === 'en' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
                )}
              >
                EN
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = toggleSoundMute()
              setIsMuted(next)
              if (!next) playCoinSound()
            }}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/70 hover:bg-white/10 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
            <span>{isMuted ? (lang === 'th' ? 'เปิดเสียง' : 'Unmute') : (lang === 'th' ? 'ปิดเสียง' : 'Mute')}</span>
          </button>
        </div>
      </div>

      {/* ── CIRCULAR TRIGGER BUTTON (Infinity ClassLoop Badge) ── */}
      <button
        type="button"
        onClick={() => {
          playClickSound()
          setIsPinned((prev) => !prev)
        }}
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer select-none',
          isOpen
            ? 'border-pink-500 bg-[#121422] ring-4 ring-pink-500/30 shadow-[0_0_30px_rgba(209,46,128,0.5)] scale-105'
            : 'border-pink-500/40 bg-[#121422]/90 hover:border-pink-500 hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(209,46,128,0.35)]',
        )}
        title={lang === 'th' ? 'ปุ่มลัดสลับเดโม่ (ลากเมาส์ผ่าน หรือกด Alt+D)' : 'Demo Switcher (Hover or Alt+D)'}
      >
        <BrandMark className="h-6 w-11 shrink-0 drop-shadow-sm" animated />
        
        {/* Subtle Ping Indicator if collapsed */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border border-[#121422]" />
          </span>
        )}
      </button>
    </div>
  )
}
