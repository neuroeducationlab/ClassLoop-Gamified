import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, CAMPUS_PALETTE, type Building } from '@/data/buildings'
import CampusMapSVG from './components/CampusMapSVG'
import { GameIcon } from '@/components/icons/GameIcon'

const isTeacherRoom = (b: Building) => b.teacherSees !== null

/**
 * Teacher view of the campus: the same layout as the student 3D campus, as a
 * calm top-down map. Teachers are caretakers, not players — no walking, just
 * the three rooms they use, each with a live number and one big click target.
 */
const TEACHER_ROOM_SUBS: Record<string, { th: string; en: string }> = {
  faculty: { th: 'สอนสดในห้องเรียน & ควิซสด', en: 'Live class & real-time console' },
  plan: { th: 'ออกแบบแผนการสอน & กิจกรรม AI', en: 'Lesson planning & activities' },
  data: { th: 'สถิติผู้เรียน & Gap Analysis', en: 'Student analytics & gap analysis' },
  dorm: { th: 'เสียงสะท้อนนักศึกษา (นิรนาม)', en: 'Student voice & anonymous Q&A' },
  lounge: { th: 'ศูนย์รวมเครื่องมือครูทั้งหมด', en: 'Every teaching tool & monitor wall' },
}

export default function CampusMap2D() {
  const { setRole, teacherName, posts, topics, gapAnalysis, students, lang } = useApp()
  const navigate = useNavigate()

  // mirror TeacherShell so direct URLs agree on who is looking
  useEffect(() => setRole('teacher'), [setRole])

  const anonCount = posts.filter((p) => p.isAnonymous).length
  const stats: Partial<Record<Building['id'], string>> = {
    // static analysis, not live responses: those stay empty until a Live session runs
    data:
      lang === 'th'
        ? `${students.length} นักศึกษา · คณะต่างกันสูงสุด ${gapAnalysis.maxGap}%`
        : `${students.length} students · Max faculty gap ${gapAnalysis.maxGap}%`,
    plan:
      lang === 'th'
        ? `${topics.length} สัปดาห์ในแผนการสอน`
        : `${topics.length} weeks in syllabus plan`,
    dorm:
      lang === 'th'
        ? `${anonCount} ข้อความไม่ระบุชื่อ`
        : `${anonCount} anonymous messages`,
  }
  const rooms = BUILDINGS.filter(isTeacherRoom)
  const open = (b: Building) => navigate(`/campus/${b.id}`, { state: { from: '/map' } })

  return (
    <div className="min-h-screen bg-canvas font-campus">
      <header className="border-b border-grey-300/60 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs text-grey-600">
              {lang === 'th' ? 'แผนที่แคมปัส · 2D Map' : 'Campus 2D Map'}
            </p>
            <h1 className="text-xl font-bold text-ink">
              {lang === 'th' ? `สวัสดี ${teacherName}` : `Welcome, ${teacherName}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/campus"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-3.5 py-2 text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
            >
              <GameIcon name="gamepad" /> {lang === 'th' ? 'เข้าแคมปัส 3D' : '3D Campus'}
            </Link>
            <Link
              to="/teacher"
              className="flex items-center gap-1.5 rounded-xl border border-grey-300/80 px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas transition-colors"
            >
              <LayoutGrid className="h-4 w-4" /> {lang === 'th' ? 'สตูดิโออาจารย์' : 'Teacher Studio'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-3xl border border-grey-300/60 shadow-sm" style={{ backgroundColor: CAMPUS_PALETTE.sky }}>
          <CampusMapSVG
            activeFilter={isTeacherRoom}
            onBuildingClick={(b) => isTeacherRoom(b) && open(b)}
          />
        </div>

        <aside className="space-y-3">
          <p className="px-1 text-sm font-semibold text-grey-600">
            {lang === 'th' ? 'ห้องของอาจารย์ · Your rooms' : 'Faculty Rooms · Quick Jump'}
          </p>
          {rooms.map((b) => (
            <button
              key={b.id}
              onClick={() => open(b)}
              className="flex w-full items-center gap-3 rounded-2xl border border-grey-300/60 bg-paper p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: b.color }}>
                <GameIcon name={b.icon} className="text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{b.name[lang]}</span>
                <span className="block text-xs text-grey-600">
                  {TEACHER_ROOM_SUBS[b.id]?.[lang] ?? (lang === 'th' ? b.teacherSees : 'Academic Tool')}
                </span>
                {stats[b.id] && <span className="mt-1 block text-xs font-semibold text-pink-600">{stats[b.id]}</span>}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-grey-400" />
            </button>
          ))}
          <p className="px-1 text-xs text-grey-500">
            {lang === 'th'
              ? 'อาคารสีจาง = พื้นที่ของนักศึกษา (อาจารย์ดูผลได้ในศูนย์ข้อมูล)'
              : 'Dimmed buildings = Student zones (View summary in Bldg 11 Data Center)'}
          </p>
        </aside>
      </main>
    </div>
  )
}
