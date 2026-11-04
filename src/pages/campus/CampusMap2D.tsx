import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Brain,
  CalendarCheck,
  ClipboardList,
  FileCheck,
  MessageCircle,
  Radio,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { GameIcon } from '@/components/icons/GameIcon'

/**
 * Teacher Hub — the lab-visitor demo's one-page shortcut sheet. Each card is a
 * single feature labelled with what it DOES (not where it lives), so a first-time
 * guest reads the grid and knows what every click will show them.
 *
 * Replaces the earlier top-down SVG "2D map" that looked like a game mini-map and
 * said nothing about the features it hid. The grid is still the destination for
 * users who click a non-walkable building on the 3D campus — "/map" stays the
 * route — but the content is now action-first.
 */

type HubAction = {
  id: string
  title: { th: string; en: string }
  sub: { th: string; en: string }
  icon: LucideIcon
  to: string
  /** HSL triple for the card accent, so the look stays in brand without an image. */
  accent: string
}

const ACTIONS: HubAction[] = [
  {
    id: 'studio',
    title: { th: 'วางแผนการสอน', en: 'Lesson Studio' },
    sub: { th: 'AI ช่วยออกแบบคาบเรียน & กิจกรรม', en: 'AI builds activities for this week' },
    icon: Brain,
    to: '/teacher/studio',
    accent: '#D12E80',
  },
  {
    id: 'live',
    title: { th: 'เปิดควิซสด', en: 'Run a Live Quiz' },
    sub: { th: 'ควบคุมคาบเรียนจากมือถือ', en: 'Control a live session on your phone' },
    icon: Radio,
    to: '/teacher/live',
    accent: '#F2994A',
  },
  {
    id: 'dashboard',
    title: { th: 'วิเคราะห์นักศึกษา', en: 'Class Analytics' },
    sub: { th: 'ความเข้าใจรายหัวข้อ · Gap Analysis', en: 'Understanding per topic · Gap view' },
    icon: BarChart3,
    to: '/teacher/dashboard',
    accent: '#0F9D8F',
  },
  {
    id: 'attendance',
    title: { th: 'เช็คชื่อเข้าเรียน', en: 'Check Attendance' },
    sub: { th: 'QR + รหัสห้อง ยิงขึ้นจอได้เลย', en: 'QR + room PIN, projector-ready' },
    icon: CalendarCheck,
    to: '/teacher/attendance',
    accent: '#7C3AED',
  },
  {
    id: 'exams',
    title: { th: 'สร้างข้อสอบ', en: 'Build an Exam' },
    sub: { th: 'คลังข้อสอบ + AI เขียนข้อ', en: 'Question bank + AI draft' },
    icon: FileCheck,
    to: '/teacher/exams',
    accent: '#2563EB',
  },
  {
    id: 'roster',
    title: { th: 'ดูรายชื่อนักศึกษา', en: 'Class Roster' },
    sub: { th: 'คณะ ชั้นปี Section', en: 'Faculty, year, section' },
    icon: Users,
    to: '/teacher/class',
    accent: '#059669',
  },
  {
    id: 'community',
    title: { th: 'ชุมชนในห้อง', en: 'Classroom Feed' },
    sub: { th: 'ประกาศ กิจกรรม ถาม-ตอบ', en: 'Announcements · Q&A' },
    icon: MessageCircle,
    to: '/teacher/community',
    accent: '#DB2777',
  },
  {
    id: 'syllabus',
    title: { th: 'แผนการสอน 15 สัปดาห์', en: 'Weekly Syllabus' },
    sub: { th: 'หัวข้อ · วัตถุประสงค์การเรียนรู้', en: 'Topics · Learning objectives' },
    icon: ClipboardList,
    to: '/teacher/studio',
    accent: '#0891B2',
  },
]

export default function CampusMap2D() {
  const { setRole, teacherName, lang, students, topics, posts } = useApp()
  const navigate = useNavigate()

  useEffect(() => setRole('teacher'), [setRole])

  const anonCount = useMemo(() => posts.filter((p) => p.isAnonymous).length, [posts])

  const t = (th: string, en: string) => (lang === 'th' ? th : en)

  return (
    <div className="min-h-screen bg-canvas font-campus">
      {/* Header: back + welcome + 3D entry */}
      <header className="border-b border-grey-300/60 bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-grey-300/80 bg-canvas text-grey-600 hover:text-pink-600 hover:border-pink-200 transition-colors cursor-pointer"
              aria-label={t('ย้อนกลับ', 'Back')}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-600">
                {t('ศูนย์รวมเครื่องมืออาจารย์', 'Teacher Hub')}
              </p>
              <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
                {t(`สวัสดี ${teacherName}`, `Welcome, ${teacherName}`)}
              </h1>
            </div>
          </div>
          <Link
            to="/campus"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-3.5 py-2 text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
          >
            <GameIcon name="gamepad" /> {t('เข้าแคมปัส 3D', 'Enter 3D Campus')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* At-a-glance strip: three live numbers so the hub never feels empty */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatPill
            value={students.length}
            label={t('นักศึกษา', 'Students')}
            accent="#D12E80"
          />
          <StatPill
            value={topics.length}
            label={t('สัปดาห์ในแผน', 'Weeks planned')}
            accent="#F2994A"
          />
          <StatPill
            value={anonCount}
            label={t('ข้อความนิรนาม', 'Anon. messages')}
            accent="#0F9D8F"
          />
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-extrabold text-ink">
                {t('เลือกฟีเจอร์ที่อยากใช้', 'Pick a feature')}
              </h2>
              <p className="text-xs text-grey-600">
                {t('กดที่การ์ด = เข้าใช้งานฟีเจอร์นั้นทันที', 'Tap a card to open that feature')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIONS.map((a) => (
              <HubCard key={a.id} action={a} lang={lang} onOpen={() => navigate(a.to)} />
            ))}
          </div>
        </section>

        <p className="text-center text-[11px] text-grey-500">
          {t(
            'เคล็ดลับ: กดปุ่มรูปห่วงที่มุมล่างขวาเพื่อสลับเดโม่ หรือเริ่มต้นใหม่จากหน้าแรก',
            'Tip: the loop button at the bottom-right switches demo modes and restarts from the Landing',
          )}
        </p>
      </main>
    </div>
  )
}

function StatPill({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl border border-grey-300/60 bg-paper p-3 shadow-sm"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
        style={{ backgroundColor: accent }}
      >
        {value}
      </span>
      <span className="min-w-0 text-xs font-semibold text-grey-600 leading-tight">{label}</span>
    </div>
  )
}

function HubCard({
  action,
  lang,
  onOpen,
}: {
  action: HubAction
  lang: 'th' | 'en'
  onOpen: () => void
}) {
  const Icon = action.icon
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-grey-300/60 bg-paper p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md active:scale-[0.99] cursor-pointer"
    >
      {/* soft accent splash, so the grid reads as a coloured map without a top-down SVG */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: action.accent }}
      />
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
        style={{ backgroundColor: action.accent }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-extrabold text-ink group-hover:text-pink-700 transition-colors">
          {action.title[lang]}
        </p>
        <p className="text-[11px] text-grey-600 leading-snug">{action.sub[lang]}</p>
      </div>
    </button>
  )
}
