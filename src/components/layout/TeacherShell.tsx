import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessagesSquare,
  Radio,
  Settings,
  User,
  Users,
  Wand2,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react'
import RoleSwitcher from '@/components/layout/RoleSwitcher'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import DarkModeToggle from '@/components/layout/DarkModeToggle'
import { BrandLockup } from '@/components/brand/BrandMark'
import { isSoundMuted, toggleSoundMute, playCoinSound } from '@/pages/campus/soundEngine'
import { useApp, type TranslationKey } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { GameIcon } from '@/components/icons/GameIcon'

type NavItem = { to: string; labelKey: TranslationKey; icon: typeof LayoutDashboard; end?: boolean }

const NAV: NavItem[] = [
  { to: '/teacher', labelKey: 'studio', icon: Wand2, end: true },
  { to: '/teacher/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { to: '/teacher/exams', labelKey: 'exams', icon: FileText },
  { to: '/teacher/live', labelKey: 'liveSession', icon: Radio },
  { to: '/teacher/class', labelKey: 'roster', icon: Users },
  { to: '/teacher/attendance', labelKey: 'attendance', icon: ClipboardCheck },
  { to: '/teacher/community', labelKey: 'community', icon: MessagesSquare },
]

const NOTIFICATIONS = [
  'นักศึกษา 3 คนยังไม่ส่ง Pre-test สัปดาห์ที่ 5',
  'มีคำถามใหม่ 5 ข้อในคอมมูนิตี้',
  'ถึงเวลาสร้างกิจกรรมสำหรับสัปดาห์ที่ 6',
]

/** Avatar initial for the demo teacher (อ.ดร.ธนพร). */
const TEACHER_INITIAL = 'ธ'

function Brand() {
  return <BrandLockup />
}

export default function TeacherShell() {
  const { teacherName, setRole, signOut, t, activeCourseId, setActiveCourseId, coursePacks } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // keep the role switcher honest when this shell is reached by direct URL
  useEffect(() => setRole('teacher'), [setRole])

  const [openMenu, setOpenMenu] = useState<'bell' | 'account' | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [soundMuted, setSoundMuted] = useState(isSoundMuted())
  const bellRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (bellRef.current?.contains(target) || accountRef.current?.contains(target)) return
      setOpenMenu(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu])

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-grey-300/60 bg-paper md:flex">
        <div className="flex h-16 items-center px-6">
          <Brand />
        </div>

        {/* courses */}
        <div className="px-3 pt-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-grey-600">
            {t('courses')}
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {coursePacks.map((pack) => {
              const isSelected = pack.course.id === activeCourseId
              return (
                <button
                  key={pack.course.id}
                  type="button"
                  onClick={() => {
                    playCoinSound()
                    setActiveCourseId(pack.course.id)
                  }}
                  className={cn(
                    'w-full text-left rounded-xl px-3 py-2 transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-pink-50 border-pink-300 ring-1 ring-pink-300/40 shadow-xs'
                      : 'border-grey-200/50 hover:bg-grey-100/70 text-grey-600',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: pack.accent }}
                      />
                      <span className="font-mono text-xs font-bold text-ink">{pack.course.code}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-pink-600" />
                    )}
                  </div>
                  <p className={cn('mt-0.5 truncate text-[11px] font-medium pl-4', isSelected ? 'text-pink-700 font-semibold' : 'text-grey-500')}>
                    {pack.course.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* nav */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 border-t border-grey-300/40 px-3 pt-4">
          {NAV.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-pink-50 text-pink-600 font-semibold'
                    : 'text-grey-600 hover:bg-pink-50/60 hover:text-pink-600',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* e-learning card */}
        <div className="mx-3 mb-4 rounded-xl border border-grey-300/50 bg-canvas px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-grey-600">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-pink-600" />
            เชื่อมต่อกับ SPU e-Learning
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-grey-300/60 bg-paper px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-grey-600 hover:bg-pink-50 hover:text-pink-600 focus:outline-none cursor-pointer"
              aria-label="เปิดเมนู"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Brand />
          </div>

          {/* min-w-0 + scroll: on a phone these controls are wider than the screen and
              would otherwise push the whole page sideways */}
          <div className="ml-auto flex min-w-0 items-center gap-2 overflow-x-auto no-scrollbar sm:gap-3">

            <Link
              to="/campus"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all"
              title="Return to 3D Campus"
            >
              <GameIcon name="gamepad" />
              <span className="hidden sm:inline">3D Campus</span>
            </Link>

            <DarkModeToggle />
            <RoleSwitcher />
            <LanguageSwitcher />

            {/* sound toggle */}
            <button
              type="button"
              onClick={() => {
                const next = toggleSoundMute()
                setSoundMuted(next)
                if (!next) playCoinSound()
              }}
              title={soundMuted ? 'Unmute Sound / เปิดเสียง' : 'Mute Sound / ปิดเสียง'}
              aria-label={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-grey-300/60 bg-paper text-grey-600 transition-colors hover:bg-pink-50 hover:text-pink-600 cursor-pointer shadow-xs"
            >
              {soundMuted ? <VolumeX className="h-4 w-4 text-rose-500" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
            </button>

            {/* notifications */}
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                aria-label={t('notifications')}
                aria-expanded={openMenu === 'bell'}
                onClick={() => setOpenMenu(openMenu === 'bell' ? null : 'bell')}
                className="relative rounded-full p-2 text-grey-600 transition-colors hover:bg-pink-50 hover:text-pink-600"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-paper">
                  3
                </span>
              </button>
              {openMenu === 'bell' && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-grey-300/60 bg-paper p-2 shadow-lg">
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold text-grey-600">{t('notifications')}</p>
                  {NOTIFICATIONS.map((text) => (
                    <div
                      key={text}
                      className="flex gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink transition-colors hover:bg-pink-50/60"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* account */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-expanded={openMenu === 'account'}
                onClick={() => setOpenMenu(openMenu === 'account' ? null : 'account')}
                className="flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-pink-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-sm font-semibold text-paper">
                  {TEACHER_INITIAL}
                </span>
                <span className="hidden text-sm font-medium text-ink lg:inline">{teacherName}</span>
                <ChevronDown className="h-4 w-4 text-grey-600" />
              </button>
              {openMenu === 'account' && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-grey-300/60 bg-paper p-2 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      setProfileModalOpen(true)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-pink-50/60 cursor-pointer"
                  >
                    <User className="h-4 w-4 text-pink-600" />
                    <span className="min-w-0 flex-1">{t('myProfile')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      setSettingsModalOpen(true)
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-pink-50/60 cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-pink-600" />
                    <span className="min-w-0 flex-1">{t('settings')}</span>
                  </button>
                  <div className="my-1.5 border-t border-grey-300/40" />
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null)
                      signOut()
                      navigate('/login')
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-pink-50/60"
                  >
                    <LogOut className="h-4 w-4 text-grey-600" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto p-4 md:p-6">
          <div key={location.pathname} className="animate-page-fade">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex w-64 max-w-xs flex-col bg-paper h-full shadow-2xl p-4 animate-slide-in-left">
            <div className="flex items-center justify-between pb-4 border-b border-grey-300/40">
              <Brand />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-full bg-canvas p-1.5 text-grey-600 hover:text-ink cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* courses */}
            <div className="px-1 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-grey-600">
                {t('courses')}
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {coursePacks.map((pack) => {
                  const isSelected = pack.course.id === activeCourseId
                  return (
                    <button
                      key={pack.course.id}
                      type="button"
                      onClick={() => {
                        playCoinSound()
                        setActiveCourseId(pack.course.id)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2 transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-pink-50 border-pink-300 ring-1 ring-pink-300/40 shadow-xs'
                          : 'border-grey-200/50 hover:bg-grey-100/70 text-grey-600',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: pack.accent }}
                          />
                          <span className="font-mono text-xs font-bold text-ink">{pack.course.code}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-pink-600" />
                        )}
                      </div>
                      <p className={cn('mt-0.5 truncate text-[11px] font-medium pl-4', isSelected ? 'text-pink-700 font-semibold' : 'text-grey-500')}>
                        {pack.course.name}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* navigation */}
            <nav className="mt-4 flex flex-1 flex-col gap-1 border-t border-grey-300/40 pt-4">
              {NAV.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-pink-50 text-pink-600 font-semibold'
                        : 'text-grey-600 hover:bg-pink-50/60 hover:text-pink-600',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {t(labelKey)}
                </NavLink>
              ))}
            </nav>

            {/* SPU E-learning info */}
            <div className="mt-auto pt-4 border-t border-grey-300/40">
              <div className="rounded-xl border border-grey-300/50 bg-canvas px-3 py-2.5">
                <div className="flex items-center gap-2 text-xs text-grey-600">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-pink-600" />
                  <span>เชื่อมต่อกับ SPU e-Learning</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Teacher Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-pink-200/60 bg-paper p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-grey-300/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <User className="h-4 w-4" />
                </span>
                <h3 className="text-base font-extrabold text-ink">โปรไฟล์อาจารย์ผู้สอน</h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-grey-100 text-grey-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center py-2 space-y-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-2xl font-black text-white shadow-md ring-4 ring-pink-100">
                {TEACHER_INITIAL}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-ink">{teacherName}</h4>
                <p className="text-xs text-pink-600 font-semibold">อาจารย์ประจำหลักสูตรบริหารธุรกิจบัณฑิต</p>
                <p className="text-[11px] text-grey-500 font-mono mt-0.5">รหัสอาจารย์: SPU-FAC-8891</p>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl bg-canvas p-3 text-xs border border-grey-200">
              <div className="flex items-center justify-between text-grey-600">
                <span>อีเมล</span>
                <span className="font-mono font-medium text-ink">teacher@spu.ac.th</span>
              </div>
              <div className="flex items-center justify-between text-grey-600">
                <span>คณะ</span>
                <span className="font-medium text-ink">บริหารธุรกิจ (SPU)</span>
              </div>
              <div className="flex items-center justify-between text-grey-600">
                <span>สถานะระบบ</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  e-Learning Verified
                </span>
              </div>
            </div>

            <button
              onClick={() => setProfileModalOpen(false)}
              className="w-full rounded-xl bg-pink-600 py-2.5 text-xs font-bold text-white hover:bg-pink-700 transition-colors shadow-sm cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Teacher Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-grey-300/60 bg-paper p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between border-b border-grey-300/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-grey-100 text-grey-700">
                  <Settings className="h-4 w-4" />
                </span>
                <h3 className="text-base font-extrabold text-ink">ตั้งค่าระบบผู้สอน</h3>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-grey-100 text-grey-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 py-1 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-grey-200">
                <div>
                  <p className="font-bold text-ink">ภาษาของระบบ (Language)</p>
                  <p className="text-[11px] text-grey-500">สลับระหว่างภาษาไทยและภาษาอังกฤษ</p>
                </div>
                <LanguageSwitcher />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-grey-200">
                <div>
                  <p className="font-bold text-ink">ธีมแสดงผล (Dark / Light)</p>
                  <p className="text-[11px] text-grey-500">โหมดมืดหรือสว่างสำหรับสอนหน้าห้อง</p>
                </div>
                <DarkModeToggle />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-grey-200">
                <div>
                  <p className="font-bold text-ink">สลับบทบาท (Role Switcher)</p>
                  <p className="text-[11px] text-grey-500">ทดสอบมุมมองในฐานะนักศึกษา</p>
                </div>
                <RoleSwitcher />
              </div>
            </div>

            <button
              onClick={() => setSettingsModalOpen(false)}
              className="w-full rounded-xl bg-grey-900 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors shadow-sm cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
