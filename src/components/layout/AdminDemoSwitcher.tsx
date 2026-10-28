import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  Presentation,
  Gamepad2,
  Map as MapIcon,
  Zap,
  X,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playClickSound, playCoinSound, isSoundMuted, toggleSoundMute } from '@/pages/campus/soundEngine'
import { cn } from '@/lib/utils'

export default function AdminDemoSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { role, setRole, lang, setLang, activeCourseId, setActiveCourseId, coursePacks } = useApp()
  const [isMuted, setIsMuted] = useState(isSoundMuted())

  // Keyboard shortcut: Alt+D or Ctrl+Shift+D to open switcher quickly while filming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.code === 'KeyD') || (e.ctrlKey && e.shiftKey && e.code === 'KeyD')) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
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
    setOpen(false)
    navigate(to)
  }

  const currentPath = location.pathname

  const MODES = [
    {
      id: 'student',
      titleTh: 'มุมมองนักเรียน (Student)',
      titleEn: 'Student 2D Hub',
      descTh: 'หน้าแดชบอร์ดนักเรียน, เควสต์, กราฟพัฒนาการ, ควิซดวล',
      descEn: 'Student dashboard, quests, growth chart & quiz duel',
      icon: GraduationCap,
      path: '/student',
      targetRole: 'student' as const,
      gradient: 'from-pink-500/20 via-pink-500/10 to-transparent border-pink-500/40 text-pink-400',
      badge: 'Student 2D',
      active: currentPath.startsWith('/student') && role === 'student',
    },
    {
      id: 'teacher',
      titleTh: 'มุมมองอาจารย์ (Teacher)',
      titleEn: 'Teacher Studio & Ops',
      descTh: 'สตูดิโอแผนการสอน, สร้างสื่อ AI, เช็คชื่อ, แดชบอร์ด',
      descEn: 'Lesson studio, AI media generator, attendance, analytics',
      icon: Presentation,
      path: '/teacher',
      targetRole: 'teacher' as const,
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/40 text-purple-400',
      badge: 'Faculty',
      active: currentPath.startsWith('/teacher') && role === 'teacher',
    },
    {
      id: 'campus3d',
      titleTh: 'แคมปัส 3D (3D Campus)',
      titleEn: '3D SPU Campus',
      descTh: 'เดินสำรวจมหาวิทยาลัยเสมือนจริง 3 มิติ แบบ First-Person',
      descEn: 'Walk the immersive 3D university campus in 1st/3rd person',
      icon: Gamepad2,
      path: '/campus',
      gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent border-cyan-500/40 text-cyan-400',
      badge: '3D World',
      active: currentPath.startsWith('/campus'),
    },
    {
      id: 'map2d',
      titleTh: 'แผนที่ 2D (2D Map)',
      titleEn: '2D Campus Map',
      descTh: 'แผนที่มุมมองด้านบน Top-Down แคมปัส SPU สำหรับอาจารย์',
      descEn: 'Tactical top-down campus overview for faculty inspection',
      icon: MapIcon,
      path: '/map',
      gradient: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/40 text-amber-400',
      badge: 'Tactical 2D',
      active: currentPath === '/map',
    },
  ]

  return (
    <>
      {/* Floating Shortcut Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            playClickSound()
            setOpen(true)
          }}
          className="group relative flex items-center gap-2 rounded-2xl border border-pink-500/40 bg-grey-900/90 px-4 py-2.5 text-xs font-black text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-grey-900 active:scale-95 cursor-pointer ring-2 ring-pink-500/20"
          title="Demo Quick Switcher (Alt + D)"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-sm">
            <Zap className="h-3 w-3 fill-white" />
          </span>
          <span className="font-extrabold tracking-wide">
            {lang === 'th' ? 'สลับเดโม่' : 'Demo Switcher'}
          </span>
          <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white/50 sm:inline">
            Alt+D
          </span>
        </button>
      </div>

      {/* Modal Overlay & Quick Menu */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-[#121422]/95 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30">
                  <Zap className="h-6 w-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span>{lang === 'th' ? 'ปุ่มลัดสลับเดโม่ (Admin Demo Switcher)' : 'Admin Demo Quick Switcher'}</span>
                    <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                      LIVE
                    </span>
                  </h2>
                  <p className="text-xs text-white/60">
                    {lang === 'th'
                      ? 'คลิกเพื่อสลับระหว่าง นักเรียน, ครู, 3D Campus, และ 2D Map ได้ทันทีเพื่อความสะดวกในการอัดคลิป'
                      : 'Switch instantly between Student, Teacher, 3D Campus, and 2D Map for smooth filming'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 4 Core Switch Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSwitch(m.path, m.targetRole)}
                    className={cn(
                      'group relative flex flex-col text-left rounded-2xl border p-4 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
                      m.active
                        ? 'border-pink-500 bg-pink-500/20 ring-2 ring-pink-500/30 shadow-lg'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-white/10', m.gradient)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-black text-white/70 font-mono">
                        {m.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-white group-hover:text-pink-300 transition-colors">
                      {lang === 'th' ? m.titleTh : m.titleEn}
                    </h3>
                    <p className="text-xs text-white/60 line-clamp-2 mt-1">
                      {lang === 'th' ? m.descTh : m.descEn}
                    </p>

                    {m.active && (
                      <span className="mt-2 text-[10px] font-bold text-pink-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {lang === 'th' ? 'กำลังเปิดหน้านี้อยู่' : 'Currently Viewing'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Demo Controls Bar */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white/70">
                <span>{lang === 'th' ? 'สลับวิชาเรียนประจำคลาส (Course)' : 'Active Course Pack'}</span>
                <span className="text-[10px] text-white/40">3 Course Syllabus Packs</span>
              </div>

              {/* Course Pack Quick Pills */}
              <div className="flex flex-wrap gap-2">
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
                        'flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border',
                        isCur
                          ? 'border-pink-500 bg-pink-500/20 text-white shadow-sm ring-1 ring-pink-500/40'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10',
                      )}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pack.accent }} />
                      <span className="font-mono">{pack.course.code}</span>
                      <span className="text-[11px] opacity-75 truncate max-w-[140px] hidden sm:inline">
                        {pack.course.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Utility Toggles (Lang, Sound, Reset) */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                {/* Language Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-white/60">{lang === 'th' ? 'ภาษา:' : 'Language:'}</span>
                  <div className="inline-flex rounded-xl bg-white/10 p-0.5 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setLang('th')}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                        lang === 'th' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
                      )}
                    >
                      TH
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                        lang === 'en' ? 'bg-pink-600 text-white' : 'text-white/60 hover:text-white',
                      )}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* SFX Sound Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = toggleSoundMute()
                    setIsMuted(next)
                    if (!next) playCoinSound()
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                  <span>{isMuted ? (lang === 'th' ? 'เปิดเสียง' : 'Unmute') : (lang === 'th' ? 'ปิดเสียง' : 'Mute')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
