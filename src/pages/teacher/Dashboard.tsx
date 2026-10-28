import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileDown,
  FileText,
  Lightbulb,
  Plus,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { initials } from '@/components/AutoTranslate'
import { useReveal } from '@/hooks/useReveal'
import {
  ASSIGNMENTS,
  WEEKLY_SCORES,
  getStudentAssignments,
} from '@/data/seed-data'
import { cn } from '@/lib/utils'
import { GameIcon } from '@/components/icons/GameIcon'

/* ------------------------------------------------------------- constants -- */

const INK = '#17161A'

const FACULTY_TH: Record<string, string> = {
  Accounting: 'การบัญชี',
  'Communication Arts': 'นิเทศศาสตร์',
  Engineering: 'วิศวกรรมศาสตร์',
  'Business Admin': 'บริหารธุรกิจ',
  'Digital Media': 'ดิจิทัลมีเดีย',
}

const FACULTY_SHORT: Record<string, string> = {
  Accounting: 'บัญชี',
  'Communication Arts': 'นิเทศ',
  Engineering: 'วิศวะ',
  'Business Admin': 'บริหาร',
  'Digital Media': 'ดิจิทัล',
}

const TOPIC_SHORT: Record<string, string> = {
  t1: 'Globalisation',
  t2: 'Hofstede',
  t3: 'Entry Modes',
  t4: 'Supply Chain',
  t5: "Int'l HRM",
  t6: 'Ethics & CSR',
}

const SERIES = [
  { key: 'class', th: 'ทั้งชั้น', color: INK, width: 3.5 },
  { key: 'Accounting', th: 'การบัญชี', color: '#D12E80', width: 2.5 },
  { key: 'Business Admin', th: 'บริหารธุรกิจ', color: '#8B5CF6', width: 2.5 },
  { key: 'Engineering', th: 'วิศวกรรมศาสตร์', color: '#2563EB', width: 2.5 },
  { key: 'Digital Media', th: 'ดิจิทัลมีเดีย', color: '#F59E0B', width: 2.5 },
  { key: 'Communication Arts', th: 'นิเทศศาสตร์', color: '#0D9488', width: 2.5 },
] as const

const FACULTY_INSIGHTS = [
  {
    faculty: 'Accounting',
    name: 'คณะการบัญชี',
    badgeColor: 'border-pink-300 bg-pink-50 text-pink-700',
    strongTopic: 'Global Supply Chain & Costing (88%)',
    improveTopic: 'Cross-Cultural Communication',
    recommendation: 'เน้นเชื่อมโยงตัวเลขการเงินเข้ากับบริบทวัฒนธรรม',
  },
  {
    faculty: 'Communication Arts',
    name: 'คณะนิเทศศาสตร์',
    badgeColor: 'border-teal-300 bg-teal-50 text-teal-700',
    strongTopic: 'Cross-Cultural & Hofstede (85%)',
    improveTopic: 'Market Entry Modes & Financial Analysis',
    recommendation: 'ประกบคู่ทำกิจกรรมร่วมกับเด็กบัญชีเพื่อแลกเปลี่ยนความถนัด',
  },
  {
    faculty: 'Engineering',
    name: 'คณะวิศวกรรมศาสตร์',
    badgeColor: 'border-blue-300 bg-blue-50 text-blue-700',
    strongTopic: 'Global Strategy & Logistics (82%)',
    improveTopic: 'CSR & Soft Skills Negotiations',
    recommendation: 'ยกเคสการเจรจาข้ามวัฒนธรรมในโรงงานจริง',
  },
  {
    faculty: 'Business Admin',
    name: 'คณะบริหารธุรกิจ',
    badgeColor: 'border-purple-300 bg-purple-50 text-purple-700',
    strongTopic: 'Market Entry Modes (84%)',
    improveTopic: 'Supply Chain Data Analytics',
    recommendation: 'เสริมโจทย์จำลองการตัดสินใจทางธุรกิจข้ามชาติ',
  },
  {
    faculty: 'Digital Media',
    name: 'คณะดิจิทัลมีเดีย',
    badgeColor: 'border-amber-300 bg-amber-50 text-amber-700',
    strongTopic: 'Visual Presentation & Creative Case (90%)',
    improveTopic: 'Business Strategy & Frameworks',
    recommendation: 'กระตุ้นให้ใช้ภาพและ Storytelling สรุปโมเดลธุรกิจ',
  },
]

/* -------------------------------------------------- MiniCalendar Component -- */

function MiniCalendar({
  onSelectDate,
}: {
  onSelectDate?: (date: number) => void
}) {
  const { lang } = useApp()
  const [selectedDay, setSelectedDay] = useState(12)
  const daysInMonth = 31
  // single Thai letters can't go in the dictionary: they'd also hit avatar initials
  const weekdays =
    lang === 'th' ? ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const startDayOffset = 5 // Saturday start for Aug 2026

  type CalendarEvent = {
    teaching?: { title: string; time: string; room: string }
    homework?: { title: string; deadline: string; badge: string; color: string }
  }

  const calendarEvents: Record<number, CalendarEvent> = {
    11: {
      teaching: { title: 'สอน Sec 1 (การตลาดดิจิทัล)', time: '09:00 - 12:00 น.', room: 'ห้อง 11-402' },
      homework: { title: 'HW-1: Pre-test Globalisation', deadline: '23:59 น.', badge: 'ส่งแล้ว', color: 'bg-emerald-500' },
    },
    12: {
      teaching: { title: 'สอน Sec 2 (การตลาดดิจิทัล)', time: '13:00 - 16:00 น.', room: 'ห้อง 11-405' },
      homework: { title: 'HW-2: 3D Flashcards Hofstede', deadline: '23:59 น.', badge: 'ปานกลาง', color: 'bg-emerald-500' },
    },
    13: {
      teaching: { title: 'สอน Sec 3 (การตลาดดิจิทัล)', time: '13:00 - 16:00 น.', room: 'ห้อง 11-402' },
    },
    15: {
      homework: { title: 'HW-3: Post-test Hofstede', deadline: '23:59 น.', badge: 'สำคัญ', color: 'bg-amber-500' },
    },
    18: {
      teaching: { title: 'สอน Sec 1 & Sec 2 (คาบรวม)', time: '09:00 - 16:00 น.', room: 'หอประชุมใหญ่' },
      homework: { title: 'HW-4: รายงานกลุ่ม ธุรกิจข้ามชาติ', deadline: '23:59 น.', badge: 'ด่วนที่สุด', color: 'bg-rose-500' },
    },
    20: {
      teaching: { title: 'สอน Sec 3 (Live Quiz สด)', time: '13:00 - 16:00 น.', room: 'ห้อง 11-402' },
      homework: { title: 'Live Quiz สัปดาห์ที่ 3', deadline: 'ในคลาส', badge: 'คาบสด', color: 'bg-purple-500' },
    },
  }

  const grid = []
  for (let i = 0; i < startDayOffset; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(d)

  const activeEvent = calendarEvents[selectedDay]

  return (
    <div className="rounded-3xl border border-grey-300/60 bg-paper p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-pink-600" />
          <div>
            <h3 className="text-base font-extrabold text-ink">ตารางสอน & การบ้าน</h3>
            <p className="text-[10px] text-grey-500 font-medium">รวมตารางสอนคลาสสด และกำหนดส่งงาน</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="p-1 text-grey-400 hover:text-ink transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-extrabold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200">
            สิงหาคม 2026
          </span>
          <button type="button" className="p-1 text-grey-400 hover:text-ink transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-grey-400">
        {weekdays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {grid.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8 w-8" />
          }
          const isToday = day === 16
          const isSelected = day === selectedDay
          const evt = calendarEvents[day]

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                setSelectedDay(day)
                if (onSelectDate) onSelectDate(day)
              }}
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all mx-auto cursor-pointer',
                isSelected
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 font-extrabold scale-105'
                  : isToday
                  ? 'bg-pink-100 text-pink-700 font-extrabold border border-pink-300'
                  : 'text-ink hover:bg-canvas'
              )}
            >
              <span>{day}</span>
              {evt && !isSelected && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    evt.homework ? evt.homework.color : 'bg-purple-500'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Dual Details Box (Teaching + Homework) */}
      <div className="space-y-2 pt-1 border-t border-grey-300/40">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-ink flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-pink-600" />
            <span>กำหนดการวันที่ {selectedDay} สิงหาคม 2569</span>
          </span>
        </div>

        {activeEvent ? (
          <div className="space-y-2 animate-fadeIn">
            {/* Teaching Schedule */}
            {activeEvent.teaching && (
              <div className="rounded-2xl bg-purple-50/80 p-3 border border-purple-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-extrabold text-purple-800">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                    <span>ตารางสอนคลาสสด</span>
                  </span>
                  <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                    {activeEvent.teaching.time}
                  </span>
                </div>
                <p className="font-bold text-ink pl-5">{activeEvent.teaching.title}</p>
                <p className="text-[11px] text-purple-600 pl-5">{activeEvent.teaching.room}</p>
              </div>
            )}

            {/* Homework Deadline */}
            {activeEvent.homework && (
              <div className="rounded-2xl bg-pink-50/80 p-3 border border-pink-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-extrabold text-pink-800">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-pink-600" />
                    <span>กำหนดส่งการบ้าน</span>
                  </span>
                  <span className="text-[10px] bg-pink-200 text-pink-800 px-2 py-0.5 rounded-md font-bold">
                    ส่งภายใน {activeEvent.homework.deadline}
                  </span>
                </div>
                <p className="font-bold text-ink pl-5">{activeEvent.homework.title}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-canvas p-3 border border-grey-300/40 text-center text-xs text-grey-500 font-medium">
            ไม่มีตารางสอนหรือการบ้านในวันนี้
          </div>
        )}
      </div>
    </div>
  )
}



/* ---------------------------------------------------------------- page ---- */

export default function Dashboard() {
  const navigate = useNavigate()
  const revealRef = useReveal(true)
  const {
    course,
    students,
    responses,
    topics,
    lang,
  } = useApp()

  const [selectedSecTab, setSelectedSecTab] = useState<'all' | 'sec1' | 'sec2' | 'sec3'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set())
  const [taskCategory, setTaskCategory] = useState<string>('all')

  // Show ALL 6 faculty lines by default so no detailed lines are hidden!
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
    class: true,
    Accounting: true,
    'Business Admin': true,
    Engineering: true,
    'Digital Media': true,
    'Communication Arts': true,
  })

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    },
    [],
  )

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  // Filter students based on selected Sec tab
  const secStudents = useMemo(() => {
    if (selectedSecTab === 'all') return students
    return students.filter((s) => s.sec === selectedSecTab)
  }, [students, selectedSecTab])

  const secResponses = useMemo(() => {
    const studentIds = new Set(secStudents.map((s) => s.id))
    return responses.filter((r) => studentIds.has(r.studentId))
  }, [responses, secStudents])

  const facultyData = useMemo(() => {
    const facultyOf = new Map(secStudents.map((s) => [s.id, s.faculty]))
    const agg = new Map<string, { correct: number; total: number }>()
    for (const s of secStudents) if (!agg.has(s.faculty)) agg.set(s.faculty, { correct: 0, total: 0 })
    for (const r of secResponses) {
      const faculty = facultyOf.get(r.studentId)
      if (!faculty) continue
      const cell = agg.get(faculty)!
      cell.total += 1
      if (r.isCorrect) cell.correct += 1
    }
    return [...agg.entries()]
      .map(([faculty, { correct, total }]) => ({
        faculty,
        name: FACULTY_TH[faculty] ?? faculty,
        shortName: FACULTY_SHORT[faculty] ?? faculty,
        percent: total ? Math.round((correct / total) * 100) : 0,
      }))
      .sort((a, b) => b.percent - a.percent)
  }, [secStudents, secResponses])

  const hasData = secResponses.length > 0
  const liveAverage = useMemo(() => {
    if (secResponses.length === 0) return 63
    const correct = secResponses.filter((r) => r.isCorrect).length
    return Math.round((correct / secResponses.length) * 100)
  }, [secResponses])

  const weeklyData = useMemo(() => {
    const liveByFac = Object.fromEntries(facultyData.map((f) => [f.faculty, f.percent]))
    const topicByWeek = new Map(topics.map((t) => [t.week, TOPIC_SHORT[t.id] ?? t.title]))
    return [1, 2, 3, 4, 5, 6].map((week) => {
      const rec = WEEKLY_SCORES.find((w) => w.week === week)
      const row: Record<string, number | string> = {
        week,
        label: lang === 'th' ? `ส.${week}` : `W${week}`,
        fullLabel: lang === 'th' ? `สัปดาห์ที่ ${week}` : `Week ${week}`,
        topic: topicByWeek.get(week) ?? (rec ? TOPIC_SHORT[rec.topicId] : `สัปดาห์ ${week}`),
      }
      if (rec) {
        row.class = rec.classPost
        for (const s of SERIES.slice(1)) {
          row[s.key] = rec.byFaculty[s.key] ?? 70
        }
      } else {
        row.class = 65
        for (const s of SERIES.slice(1)) {
          row[s.key] = 70
        }
      }
      // If we have live responses and this is week 2, update with live data
      if (week === 2 && hasData) {
        row.class = liveAverage
        for (const s of SERIES.slice(1)) {
          if (liveByFac[s.key] !== undefined && liveByFac[s.key] > 0) {
            row[s.key] = liveByFac[s.key]
          }
        }
      }
      return row
    })
  }, [facultyData, topics, hasData, liveAverage, lang])

  const studentAssignmentData = useMemo(() => {
    return secStudents.map((s) => {
      const hw = getStudentAssignments(s.id, s.avatarSeed)
      return {
        student: s,
        hw,
      }
    })
  }, [secStudents])

  const missingStudents = useMemo(() => {
    return studentAssignmentData
      .filter(({ hw }) => !hw.isComplete)
      .sort((a, b) => b.hw.missingPoints - a.hw.missingPoints)
  }, [studentAssignmentData])

  const completedStudentsCount = secStudents.length - missingStudents.length
  const submissionPct = Math.round((completedStudentsCount / secStudents.length) * 100)

  const remindOne = (id: string, nickname: string) => {
    setRemindedIds((prev) => new Set(prev).add(id))
    showToast(`ส่งข้อความเตือนถึงคุณ${nickname} ผ่านระบบเรียบร้อยแล้ว`)
  }

  return (
    <div ref={revealRef} className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Top Greeting Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2">
            <span>ยินดีต้อนรับกลับครับ, อาจารย์!</span>
            <GameIcon name="wave" className="text-amber-500" />
          </h1>
          <p className="text-sm font-medium text-grey-600 mt-0.5">
            {course.code} · {course.name} (รวมนักศึกษา {students.length} คน จาก 3 กลุ่มเรียน)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('ส่งออกรายงาน PDF เรียบร้อยแล้ว!')}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-grey-300/80 bg-paper px-4 py-2.5 text-xs font-extrabold text-ink shadow-xs hover:border-pink-300 hover:text-pink-600 transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>ส่งออก PDF</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/studio')}
            className="inline-flex items-center gap-2 rounded-2xl bg-pink-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-pink-600/30 hover:bg-pink-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ สร้างสื่อการเรียน</span>
          </button>
        </div>
      </div>

      {/* SECTION FILTER TABS (รวมทุก Sec vs Sec 1, 2, 3) */}
      <div className="flex items-center gap-2 rounded-2xl bg-canvas p-1.5 border border-grey-300/60 w-fit">
        <span className="text-xs font-extrabold text-grey-500 px-3 flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-pink-600" />
          <span>กลุ่มเรียน:</span>
        </span>
        {[
          { id: 'all', label: `รวมทุก Sec (${students.length} คน)` },
          { id: 'sec1', label: 'Sec 1 (24 คน)' },
          { id: 'sec2', label: 'Sec 2 (25 คน)' },
          { id: 'sec3', label: 'Sec 3 (25 คน)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedSecTab(tab.id as any)}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer',
              selectedSecTab === tab.id
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'bg-paper text-grey-600 hover:text-ink border border-grey-300/40'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TOP 4 PASTEL STAT CARDS ROW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Purple */}
        <div className="rounded-3xl border border-purple-200/80 bg-purple-50/50 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">
              นักศึกษาใน Sec นี้
            </span>
            <p className="text-3xl font-black text-ink">{secStudents.length} คน</p>
            <span className="text-[11px] font-bold text-emerald-600">
              {selectedSecTab === 'all' ? 'รวม 3 กลุ่มเรียน' : `กลุ่มเรียน ${selectedSecTab.toUpperCase()}`}
            </span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-2xs">
            <Users className="h-7 w-7" />
          </div>
        </div>

        {/* Card 2: Green/Emerald */}
        <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
              ส่งงานเรียบร้อย
            </span>
            <p className="text-3xl font-black text-ink">{completedStudentsCount} คน</p>
            <span className="text-[11px] font-bold text-emerald-600">↑ {submissionPct}% ส่งตรงเวลา</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-2xs">
            <CheckCircle2 className="h-7 w-7" />
          </div>
        </div>

        {/* Card 3: Amber/Yellow */}
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
              ค้างส่งงาน
            </span>
            <p className="text-3xl font-black text-ink">{missingStudents.length} คน</p>
            <span className="text-[11px] font-bold text-rose-600">
              ↓ ขาดคะแนนสะสม
            </span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-2xs">
            <Clock className="h-7 w-7" />
          </div>
        </div>

        {/* Card 4: Pink */}
        <div className="rounded-3xl border border-pink-200/80 bg-pink-50/50 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-pink-700 uppercase tracking-wider">
              คะแนนเฉลี่ยคลาส
            </span>
            <p className="text-3xl font-black text-pink-600">{liveAverage}%</p>
            <span className="text-[11px] font-bold text-emerald-600">↑ 5% สัปดาห์นี้</span>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 shadow-2xs">
            <Trophy className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID: Left (8 Cols) vs Right Sidebar (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card A: My Class Tasks & Assignment Table */}
          <div className="rounded-3xl border border-grey-300/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-grey-300/40 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-ink">
                  ภาระงาน & ติดตามรายชื่อนักศึกษาค้างส่ง
                </h2>
                <p className="text-xs text-grey-600 mt-0.5 font-medium">
                  แสดงรายชื่อนักศึกษาใน {selectedSecTab === 'all' ? 'ทุก Sec' : selectedSecTab.toUpperCase()} ที่ต้องสะกิดเตือน
                </p>
              </div>

              {/* Task Category Tabs */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTaskCategory('all')}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer',
                    taskCategory === 'all'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-canvas text-grey-600 hover:text-ink'
                  )}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setTaskCategory('missing')}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer',
                    taskCategory === 'missing'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-canvas text-grey-600 hover:text-ink'
                  )}
                >
                  ค้างส่ง ({missingStudents.length})
                </button>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-hidden rounded-2xl border border-grey-300/60 bg-paper shadow-2xs">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs min-w-[580px]">
                  <thead className="bg-canvas border-b border-grey-300/40 text-grey-600 uppercase tracking-wider font-extrabold sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">นักศึกษา</th>
                      <th className="py-2.5 px-3">คณะ / Sec</th>
                      <th className="py-2.5 px-3">งานที่ค้างส่ง</th>
                      <th className="py-2.5 px-3">ขาดคะแนน</th>
                      <th className="py-2.5 px-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-300/30 font-medium">
                    {missingStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-grey-500 font-bold">
                          <GameIcon name="party" className="mr-1.5 text-pink-500" />
                          นักศึกษาในกลุ่มนี้ส่งงานครบทุกคนแล้ว!
                        </td>
                      </tr>
                    ) : (
                      missingStudents.map(({ student: s, hw }) => {
                        const isReminded = remindedIds.has(s.id)
                        return (
                          <tr key={s.id} className="hover:bg-pink-50/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 font-extrabold text-pink-700 text-[11px] shrink-0">
                                  {initials(s.nickname, lang)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-ink truncate text-xs">
                                    {s.name} <span className="text-pink-600">"{s.nickname}"</span>
                                  </p>
                                  <p className="text-[10px] text-grey-500 font-mono">ID: {s.id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-ink text-[11px] leading-tight">
                                  {s.faculty}
                                </span>
                                <span className="inline-flex items-center w-fit rounded bg-purple-50 px-1.5 py-0.5 font-extrabold text-purple-700 border border-purple-200 text-[10px]">
                                  Sec {s.sec.replace('sec', '')}
                                </span>
                              </div>
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="flex flex-col gap-1 max-w-[200px]">
                                {hw.missingList.map((m) => (
                                  <span
                                    key={m.id}
                                    title={`${m.code}: ${m.title}`}
                                    className="truncate rounded bg-rose-50 text-rose-800 text-[10.5px] font-bold px-2 py-0.5 border border-rose-200 block"
                                  >
                                    {m.code}: {m.title.split('(')[0].trim()}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-black text-rose-600 whitespace-nowrap text-xs">
                              -{hw.missingPoints} {lang === 'th' ? 'คะแนน' : 'pts'}
                            </td>

                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => remindOne(s.id, s.nickname)}
                                disabled={isReminded}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap',
                                  isReminded
                                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                    : 'bg-pink-600 text-white shadow-xs hover:bg-pink-700 active:scale-95'
                                )}
                              >
                                {isReminded ? (
                                  '✓ เตือนแล้ว'
                                ) : (
                                  <>
                                    <GameIcon name="phone" className="mr-0.5 text-xs" />
                                    สะกิดเตือน
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Full-Width Detailed Weekly Line Graph */}
          <div className="rounded-3xl border border-grey-300/60 bg-paper p-6 shadow-sm space-y-5">
            <div className="space-y-3 border-b border-grey-300/40 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-ink flex items-center gap-2 tracking-tight">
                    <Sparkles className="h-5 w-5 text-pink-600 shrink-0" />
                    <span>ความเข้าใจรายสัปดาห์ (พัฒนาการย้อนหลัง 6 สัปดาห์ แยกทุกคณะ)</span>
                  </h3>
                  <p className="text-xs text-grey-600 font-medium mt-0.5">
                    แสดงเปรียบเทียบพัฒนาการสัปดาห์ที่ 1 - 6 ของทั้ง 5 คณะวิชาอย่างชัดเจน
                  </p>
                </div>
                {/* Fast select actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const allOn = Object.fromEntries(SERIES.map((s) => [s.key, true]))
                      setVisibleSeries(allOn)
                    }}
                    className="text-[11px] font-bold text-pink-600 hover:underline cursor-pointer"
                  >
                    แสดงทั้งหมด
                  </button>
                  <span className="text-grey-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      const onlyClass = Object.fromEntries(SERIES.map((s) => [s.key, s.key === 'class']))
                      setVisibleSeries(onlyClass)
                    }}
                    className="text-[11px] font-bold text-grey-500 hover:text-ink cursor-pointer"
                  >
                    เฉพาะทั้งชั้น
                  </button>
                </div>
              </div>

              {/* Faculty Legend Toggles Row */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-grey-500 mr-1">
                  เลือกแสดงคณะ:
                </span>
                {SERIES.map((s) => {
                  const active = visibleSeries[s.key]
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setVisibleSeries((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border cursor-pointer transition-all shadow-2xs',
                        active
                          ? 'bg-paper opacity-100 ring-1 scale-102 font-black'
                          : 'opacity-40 bg-canvas/80 text-grey-400 border-grey-300 hover:opacity-75'
                      )}
                      style={{
                        color: active ? s.color : undefined,
                        borderColor: active ? s.color : undefined,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>{s.th}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* High-Resolution Full-Width Graph */}
            <div className="w-full pt-2" style={{ width: '100%', height: 360, minHeight: 350 }}>
              <ResponsiveContainer width="100%" height={350} minHeight={320}>
                <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#4B5563"
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tick={{ fontSize: 13, fontWeight: 800, fill: '#374151' }}
                    dy={6}
                  />
                  <YAxis
                    domain={[50, 100]}
                    ticks={[50, 60, 70, 80, 90, 100]}
                    stroke="#4B5563"
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#6B7280' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0]?.payload
                      if (!d) return null
                      const sorted = [...payload].sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
                      return (
                        <div className="rounded-2xl border border-grey-300/80 bg-paper/95 backdrop-blur-md p-4 shadow-xl text-xs space-y-2.5 font-bold min-w-[220px]">
                          <div className="border-b border-grey-200/80 pb-2">
                            <span className="text-[10px] font-black uppercase text-pink-600 tracking-wider">
                              {d.fullLabel}
                            </span>
                            <p className="font-extrabold text-ink text-sm">
                              {d.topic}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            {sorted.map((p) => {
                              const isClass = p.dataKey === 'class'
                              return (
                                <div
                                  key={p.name}
                                  className={cn(
                                    'flex items-center justify-between gap-4 text-xs py-0.5 px-1.5 rounded-lg',
                                    isClass ? 'bg-grey-100 font-black' : 'font-bold'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="h-2.5 w-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: p.color }}
                                    />
                                    <span style={{ color: isClass ? '#111827' : p.color }}>
                                      {p.name}
                                    </span>
                                  </div>
                                  <span className="font-black text-ink font-mono text-[13px]">
                                    {p.value}%
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: lang === 'th' ? '🎯 เป้าหมายความเข้าใจ (80%)' : '🎯 Target Goal (80%)',
                      position: 'insideTopRight',
                      fill: '#059669',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  {SERIES.map((s) => {
                    if (visibleSeries[s.key] === false) return null
                    const isClass = s.key === 'class'
                    return (
                      <Line
                        key={s.key}
                        name={s.th}
                        type="monotone"
                        dataKey={s.key}
                        stroke={s.color}
                        strokeWidth={isClass ? 4 : 2.5}
                        dot={{
                          r: isClass ? 5 : 4,
                          fill: '#FFFFFF',
                          stroke: s.color,
                          strokeWidth: isClass ? 3 : 2.5,
                        }}
                        activeDot={{
                          r: isClass ? 7 : 6.5,
                          fill: s.color,
                          stroke: '#FFFFFF',
                          strokeWidth: 2,
                        }}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CARD C: Faculty Strengths & Improvement Analysis (สรุปจุดแข็ง & จุดที่ควรพัฒนาของแต่ละคณะ) */}
          <div className="rounded-3xl border border-grey-300/60 bg-paper p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-grey-300/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    วิเคราะห์สรุปจุดแข็ง & จุดที่ควรพัฒนา (รายคณะ)
                  </h3>
                  <p className="text-xs text-grey-600 font-medium">
                    ข้อเสนอแนะเชิงลึกเพื่อปรับรูปแบบการสอนให้ตรงจุดกับแต่ละกลุ่มผู้เรียน
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {FACULTY_INSIGHTS.map((item) => (
                <div
                  key={item.faculty}
                  className="rounded-2xl border border-grey-300/60 bg-canvas p-4 space-y-2.5 hover:border-pink-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('rounded-lg px-2.5 py-1 text-xs font-extrabold border', item.badgeColor)}>
                      {item.name}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-emerald-600 font-bold">
                      <span className="shrink-0">✓</span>
                      <span>ทำได้ดี: <strong className="text-ink">{item.strongTopic}</strong></span>
                    </div>
                    <div className="flex items-start gap-1.5 text-rose-600 font-bold">
                      <GameIcon name="alert" className="mt-0.5" />
                      <span>ควรพัฒนา: <strong className="text-ink">{item.improveTopic}</strong></span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-paper p-2.5 border border-grey-300/40 text-[11px] font-medium text-grey-600 flex items-start gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-pink-600 shrink-0 mt-0.5" />
                    <span>{item.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: Interactive Mini Calendar (ตารางสอน + ตารางการบ้าน) */}
          <MiniCalendar />

          {/* Widget 2: Overall Participation Progress */}
          <div className="rounded-3xl border border-grey-300/60 bg-paper p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">การมีส่วนร่วมในคลาส</h3>
              <span className="text-sm font-black text-purple-600">83%</span>
            </div>

            {/* Soft Green/Purple Progress Bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-grey-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-1000"
                style={{ width: '83%' }}
              />
            </div>

            <p className="text-xs text-grey-600 font-medium leading-relaxed">
              <strong>61 จาก 74 คน</strong> ร่วมตอบคำถามสดผ่านระบบ (Spoke Rate)
            </p>
          </div>

          {/* Widget 3: Upcoming Tasks / Deadlines List */}
          <div className="rounded-3xl border border-grey-300/60 bg-paper p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-ink">กำหนดการส่งงานถัดไป</h3>
              <span className="text-xs font-bold text-pink-600 cursor-pointer hover:underline">
                ดูทั้งหมด →
              </span>
            </div>

            <div className="space-y-3">
              {ASSIGNMENTS.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl bg-canvas p-3 border border-grey-300/40 hover:border-pink-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600 font-extrabold text-xs shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-ink line-clamp-1">{a.title}</p>
                      <p className="text-[10px] text-grey-500 font-medium">กำหนด {a.dueDate} 2026</p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-pink-50 px-2 py-0.5 text-[10px] font-extrabold text-pink-700 border border-pink-200 shrink-0">
                    {a.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-center gap-2.5 rounded-2xl bg-ink px-5 py-3.5 text-xs font-bold text-paper shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-pink-400" />
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-2 text-grey-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
