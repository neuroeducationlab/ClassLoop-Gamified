import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { restartDemo } from '@/pages/wardrobe/store'
import {
  GraduationCap,
  Presentation,
  Gamepad2,
  LayoutGrid,
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
  const { role, setRole, lang, setLang, resetDemo, signOut } = useApp()
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
    signOut()
    setResetSuccess(true)
    // close the dock so the Landing orbit → dive plays unobstructed
    setIsPinned(false)
    setIsHovered(false)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    // give the toast a beat, then land back on the orbiting Landing so the next
    // visitor sees the full ENTER → sign-in → 4DX dive again
    resetTimerRef.current = setTimeout(() => {
      setResetSuccess(false)
      navigate('/')
    }, 900)
  }

  const currentPath = location.pathname

  // Labels say what you get, not who you are: a demo visitor reads "Learning
  // Studio" and knows a click opens the AI lesson-plan tool, where "Teacher"
  // alone would not tell them anything new.
  const MODES = [
    {
      id: 'student',
      titleTh: 'มุมมองนักศึกษา',
      titleEn: 'Student View',
      subTh: 'ควิซ แผนที่ รีวิว',
      subEn: 'Quizzes · Map · Review',
      icon: GraduationCap,
      path: '/student',
      targetRole: 'student' as const,
      gradient: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-400',
      active: currentPath.startsWith('/student') && role === 'student',
    },
    {
      id: 'studio',
      titleTh: 'สตูดิโอวางแผน',
      titleEn: 'Learning Studio',
      subTh: 'AI ช่วยสร้างแผนการสอน',
      subEn: 'AI lesson planner',
      icon: Presentation,
      path: '/teacher/studio',
      targetRole: 'teacher' as const,
      gradient: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400',
      active: currentPath.startsWith('/teacher/studio') && role === 'teacher',
    },
    {
      id: 'campus3d',
      titleTh: 'แคมปัส 3D',
      titleEn: '3D Campus',
      subTh: 'เดินสำรวจโลกจำลอง',
      subEn: 'Walk the virtual campus',
      icon: Gamepad2,
      path: '/campus',
      gradient: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
      active: currentPath.startsWith('/campus'),
    },
    {
      id: 'hub',
      titleTh: 'ศูนย์รวมเครื่องมือ',
      titleEn: 'Teacher Hub',
      subTh: 'ทางลัดสู่ทุกฟีเจอร์',
      subEn: 'Shortcut to every tool',
      icon: LayoutGrid,
      path: '/map',
      targetRole: 'teacher' as const,
      gradient: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
      active: currentPath === '/map',
    },
  ]

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end select-none font-campus"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── EXPANDABLE QUICK SWITCHER DOCK (Unfolds smoothly on hover / pin) ── */}
      <div
        className={cn(
          'absolute bottom-14 right-0 w-[260px] rounded-2xl border border-white/20 bg-[#121422]/95 p-3 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out origin-bottom-right space-y-2.5',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-y-3 pointer-events-none',
        )}
      >
        {/* Dock Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-600/30 border border-pink-500/40">
              <Sparkles className="h-3 w-3 text-pink-400" />
            </div>
            <h3 className="text-[11px] font-black tracking-tight text-white flex items-center gap-1">
              <span>{lang === 'th' ? 'เมนูเดโม่' : 'Demo Menu'}</span>
              <span className="rounded bg-pink-500/20 px-1 py-0.5 text-[8px] font-mono text-pink-300">
                LIVE
              </span>
            </h3>
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
                'rounded-md p-1 text-xs transition-colors cursor-pointer',
                isPinned
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
              title={isPinned ? 'Unpin menu' : 'Pin menu open while filming'}
            >
              {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* 4 action cards — labels say what you get, not just the route */}
        <div className="grid grid-cols-2 gap-1.5">
          {MODES.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSwitch(m.path, m.targetRole)}
                className={cn(
                  'group relative flex items-center gap-2 rounded-xl border p-2 text-left transition-all cursor-pointer',
                  m.active
                    ? 'border-pink-500 bg-pink-500/20 ring-1 ring-pink-500/50 shadow-md'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:scale-95',
                )}
              >
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 shrink-0', m.gradient)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-white group-hover:text-pink-300 leading-tight truncate">
                    {lang === 'th' ? m.titleTh : m.titleEn}
                  </p>
                  <span className="text-[9px] text-white/50 block leading-tight truncate">
                    {lang === 'th' ? m.subTh : m.subEn}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Reset: sends the visitor back to the orbiting Landing so the next one
            sees the full ENTER → sign-in → dive, not a stale half-played state */}
        <button
          type="button"
          onClick={handleResetDemo}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 rounded-xl border p-2 text-[11px] font-bold transition-all cursor-pointer active:scale-[0.98]',
            resetSuccess
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/50',
          )}
          title={lang === 'th' ? 'เริ่มใหม่ตั้งแต่หน้าแรก' : 'Restart from Landing'}
        >
          {resetSuccess ? <Check className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
          <span>
            {resetSuccess
              ? (lang === 'th' ? 'กลับหน้าแรก…' : 'Back to Landing…')
              : (lang === 'th' ? 'เริ่มเดโม่ใหม่' : 'Restart Demo')}
          </span>
        </button>

        {/* Utility: lang + sound */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
          <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setLang('th')}
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer',
                lang === 'th' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
              )}
            >
              TH
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-all cursor-pointer',
                lang === 'en' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
              )}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = toggleSoundMute()
              setIsMuted(next)
              if (!next) playCoinSound()
            }}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-white/70 hover:bg-white/10 transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
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
          'relative flex h-11 w-11 items-center justify-center rounded-full border shadow-xl backdrop-blur-xl transition-all duration-300 cursor-pointer select-none',
          isOpen
            ? 'border-pink-500 bg-[#121422] ring-2 ring-pink-500/30 shadow-[0_0_20px_rgba(209,46,128,0.4)] scale-105'
            : 'border-pink-500/40 bg-[#121422]/90 hover:border-pink-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_14px_rgba(209,46,128,0.3)]',
        )}
        title={lang === 'th' ? 'เมนูเดโม่ (ลากเมาส์ผ่าน)' : 'Demo Menu (Hover or Alt+D)'}
        aria-label={lang === 'th' ? 'เมนูเดโม่' : 'Demo menu'}
      >
        <BrandMark className="h-4 w-8 shrink-0 drop-shadow-sm" animated />

        {/* soft ping when closed, so first-time visitors notice it exists */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500 border border-[#121422]" />
          </span>
        )}
      </button>
    </div>
  )
}
