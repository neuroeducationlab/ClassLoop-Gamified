import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, CAMPUS_PALETTE, type Building } from '@/data/buildings'
import CampusMapSVG from './components/CampusMapSVG'

const isTeacherRoom = (b: Building) => b.teacherSees !== null

/**
 * Teacher view of the campus: the same layout as the student 3D campus, as a
 * calm top-down map. Teachers are caretakers, not players — no walking, just
 * the three rooms they use, each with a live number and one big click target.
 */
export default function CampusMap2D() {
  const { setRole, teacherName, posts, topics, gapAnalysis, students } = useApp()
  const navigate = useNavigate()

  // mirror TeacherShell so direct URLs agree on who is looking
  useEffect(() => setRole('teacher'), [setRole])

  const anonCount = posts.filter((p) => p.isAnonymous).length
  const stats: Partial<Record<Building['id'], string>> = {
    // static analysis, not live responses: those stay empty until a Live session runs
    data: `${students.length} นักศึกษา · คณะต่างกันสูงสุด ${gapAnalysis.maxGap}%`,
    plan: `${topics.length} สัปดาห์ในแผนการสอน`,
    dorm: `${anonCount} ข้อความไม่ระบุชื่อ`,
  }
  const rooms = BUILDINGS.filter(isTeacherRoom)
  const open = (b: Building) => navigate(`/campus/${b.id}`)

  return (
    <div className="min-h-screen bg-canvas font-campus">
      <header className="border-b border-grey-300/60 bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs text-grey-600">แผนที่แคมปัส · Campus map</p>
            <h1 className="text-xl font-bold text-ink">สวัสดี {teacherName}</h1>
          </div>
          <Link
            to="/teacher"
            className="flex items-center gap-1.5 rounded-xl border border-grey-300/80 px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            <LayoutGrid className="h-4 w-4" /> สตูดิโอ (หน้าเดิม)
          </Link>
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
          <p className="px-1 text-sm font-semibold text-grey-600">ห้องของอาจารย์ · Your rooms</p>
          {rooms.map((b) => (
            <button
              key={b.id}
              onClick={() => open(b)}
              className="flex w-full items-center gap-3 rounded-2xl border border-grey-300/60 bg-paper p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: b.color }}>
                {b.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{b.name.th}</span>
                <span className="block text-xs text-grey-600">{b.teacherSees}</span>
                {stats[b.id] && <span className="mt-1 block text-xs font-semibold text-pink-600">{stats[b.id]}</span>}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-grey-400" />
            </button>
          ))}
          <p className="px-1 text-xs text-grey-500">อาคารสีจาง = พื้นที่ของนักศึกษา (อาจารย์ดูผลได้ในศูนย์ข้อมูล)</p>
        </aside>
      </main>
    </div>
  )
}
