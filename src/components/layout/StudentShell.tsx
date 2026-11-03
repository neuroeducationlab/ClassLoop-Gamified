import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Brain, FileCheck, MessagesSquare, User, Map } from 'lucide-react'
import RoleSwitcher from '@/components/layout/RoleSwitcher'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import DarkModeToggle from '@/components/layout/DarkModeToggle'
import { BrandLockup } from '@/components/brand/BrandMark'
import { useApp, type TranslationKey } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { GameIcon } from '@/components/icons/GameIcon'
import { playCoinSound } from '@/pages/campus/soundEngine'

type TabItem = { to: string; labelKey: TranslationKey; icon: typeof BookOpen; end?: boolean }

const TABS: TabItem[] = [
  { to: '/student', labelKey: 'learn', icon: BookOpen, end: true },
  { to: '/student/review', labelKey: 'review', icon: Brain },
  { to: '/student/assignments', labelKey: 'assignments', icon: FileCheck },
  { to: '/student/community', labelKey: 'community', icon: MessagesSquare },
  { to: '/student/profile', labelKey: 'profile', icon: User },
]

export default function StudentShell() {
  const { setRole, t, activeCourseId, setActiveCourseId, coursePacks } = useApp()
  const location = useLocation()
  // keep the role switcher honest when this shell is reached by direct URL
  useEffect(() => setRole('student'), [setRole])

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink font-campus selection:bg-pink-500 selection:text-white">
      {/* Laptop / Desktop Full-width Header */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-grey-300/60 bg-paper/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Lockup & Desktop Nav */}
          <div className="flex items-center gap-6">
            <Link to="/student" className="cursor-pointer transition-transform hover:scale-102">
              <BrandLockup markClassName="h-6 w-12" />
            </Link>

            {/* Desktop Navigation Tabs (Hidden on mobile, visible on tablet/laptop) */}
            <nav className="hidden md:flex items-center gap-1.5">
              {TABS.map(({ to, labelKey, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                      isActive
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/25 ring-1 ring-pink-600'
                        : 'text-grey-600 hover:text-ink hover:bg-grey-200/50',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(labelKey)}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right: Quick Gateways & System Controls */}
          <div className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
            {/* Quick Course Selector Pills on Laptop */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-2xl bg-canvas p-1 border border-grey-300/40">
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
                      'flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                      isSelected
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-grey-600 hover:text-ink hover:bg-paper',
                    )}
                    title={pack.course.name}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pack.accent }} />
                    <span className="font-mono">{pack.course.code}</span>
                  </button>
                )
              })}
            </div>

            {/* 3D Campus Quick Gateway */}
            <Link
              to="/campus"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-pink-600/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              title="Enter 3D SPU Campus"
            >
              <GameIcon name="gamepad" />
              <span className="hidden sm:inline">3D Campus</span>
            </Link>

            {/* 2D Map Quick Gateway */}
            <Link
              to="/map"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl border border-grey-300/60 bg-paper px-3 py-2 text-xs font-bold text-grey-700 hover:text-pink-600 hover:border-pink-300 transition-all cursor-pointer shadow-xs"
              title="2D Campus Map"
            >
              <Map className="h-3.5 w-3.5 text-grey-500" />
              <span>2D Map</span>
            </Link>

            <DarkModeToggle />
            <LanguageSwitcher />
            <RoleSwitcher />
          </div>
        </div>

        {/* Course switcher: the student picks which class they're attending (Mobile / Tablet view) */}
        <div className="lg:hidden mx-auto w-full max-w-lg border-t border-grey-300/40 px-3 py-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {coursePacks.map((pack) => {
              const isActive = pack.course.id === activeCourseId
              return (
                <button
                  key={pack.course.id}
                  type="button"
                  onClick={() => {
                    if (pack.course.id !== activeCourseId) {
                      playCoinSound()
                      setActiveCourseId(pack.course.id)
                    }
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer',
                    isActive
                      ? 'text-white shadow-xs'
                      : 'border-grey-300/70 bg-paper text-grey-600 hover:border-grey-400 hover:text-ink',
                  )}
                  style={isActive ? { backgroundColor: pack.accent, borderColor: pack.accent } : undefined}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-white/90' : '')} style={!isActive ? { backgroundColor: pack.accent } : undefined} />
                  <span className="font-mono tracking-tight">{pack.course.code}</span>
                  <span className="font-sans font-semibold max-w-[9rem] truncate">{pack.course.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area: Responsive Laptop Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <div key={location.pathname} className="animate-page-fade">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation: Shown only on Mobile Screens (< md) */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-grey-300/60 bg-paper/95 backdrop-blur-md z-30 md:hidden shadow-lg">
        <div className="mx-auto flex w-full max-w-lg">
          {TABS.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  // min-w-0: without it a long English label (Assignments, Community)
                  // refuses to shrink and widens the whole page on a phone
                  'flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-pink-600 font-bold' : 'text-grey-600',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate px-0.5">{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
