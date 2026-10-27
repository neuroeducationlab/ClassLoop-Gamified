import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import {
  BUILDINGS,
  CAMPUS_PALETTE,
  CAR_PARKS,
  MRT_LINE,
  PLAZA_CENTER,
  POND,
  type Building,
  type BuildingShape,
} from '@/data/buildings'
import { doorPoint } from './geometry'

/** Footprint (width, depth) of each shape on the top-down map, in world units. */
const FOOTPRINT: Record<Exclude<BuildingShape, 'arena'>, [number, number]> = {
  gate: [4.4, 1],
  hall: [4.6, 3.6],
  house: [3.6, 3],
  hub: [4, 3.4],
  office: [3.8, 3.2],
}

const isTeacherRoom = (b: Building) => b.teacherSees !== null

const MRT_ANGLE = (Math.atan2(MRT_LINE.to[1] - MRT_LINE.from[1], MRT_LINE.to[0] - MRT_LINE.from[0]) * 180) / Math.PI
const MRT_LABEL: [number, number] = [MRT_LINE.from[0] + 2.5, MRT_LINE.from[1] + 4.2]

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
          <svg viewBox="-21 -16 39 32" className="block h-auto w-full" role="img" aria-label="แผนที่แคมปัส SPU">
            <rect x={-19} y={-15} width={35} height={30} rx={3} fill={CAMPUS_PALETTE.grass} />
            {/* MRT viaduct */}
            <line
              x1={MRT_LINE.from[0]}
              y1={MRT_LINE.from[1]}
              x2={MRT_LINE.to[0]}
              y2={MRT_LINE.to[1]}
              stroke="#D9DCE3"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <text
              x={MRT_LABEL[0]}
              y={MRT_LABEL[1]}
              fontSize={0.9}
              fill="#FFFFFF"
              fontWeight={600}
              transform={`rotate(${MRT_ANGLE} ${MRT_LABEL[0]} ${MRT_LABEL[1]})`}
            >
              MRT · Exit 2
            </text>
            {/* car parks + pond */}
            {CAR_PARKS.map(({ at, size }) => (
              <rect key={at.join()} x={at[0] - size[0] / 2} y={at[1] - size[1] / 2} width={size[0]} height={size[1]} rx={0.3} fill="#4A4C55" />
            ))}
            <circle cx={POND.at[0]} cy={POND.at[1]} r={POND.r} fill="#7CC6F2" stroke="#E8E2CF" strokeWidth={0.25} />
            {/* paths */}
            {BUILDINGS.map((b) => {
              const [dx, dz] = doorPoint(b)
              return (
                <line key={b.id} x1={PLAZA_CENTER[0]} y1={PLAZA_CENTER[1]} x2={dx} y2={dz} stroke={CAMPUS_PALETTE.path} strokeWidth={1.2} />
              )
            })}
            <circle cx={PLAZA_CENTER[0]} cy={PLAZA_CENTER[1]} r={2.2} fill={CAMPUS_PALETTE.path} />

            {BUILDINGS.map((b) => (
              <MapBuilding key={b.id} b={b} onOpen={isTeacherRoom(b) ? () => open(b) : undefined} />
            ))}
          </svg>
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

function MapBuilding({ b, onOpen }: { b: Building; onOpen?: () => void }) {
  const [x, z] = b.position
  const active = Boolean(onOpen)
  const body =
    b.shape === 'arena' ? (
      <circle cx={x} cy={z} r={2.8} fill={b.color} />
    ) : (
      <rect
        x={x - FOOTPRINT[b.shape][0] / 2}
        y={z - FOOTPRINT[b.shape][1] / 2}
        width={FOOTPRINT[b.shape][0]}
        height={FOOTPRINT[b.shape][1]}
        rx={0.4}
        fill={b.color}
      />
    )

  return (
    <g
      opacity={active ? 1 : 0.45}
      onClick={onOpen}
      className={active ? 'cursor-pointer' : undefined}
      role={active ? 'button' : undefined}
      aria-label={active ? b.name.th : undefined}
    >
      {active && (
        <circle cx={x} cy={z} r={2.9} fill="none" stroke="#FFFFFF" strokeWidth={0.18} className="animate-pulse" />
      )}
      {body}
      <text x={x} y={z + 0.35} fontSize={1.4} textAnchor="middle">
        {b.emoji}
      </text>
      {/* dark outline drawn under the fill keeps labels legible over paths and grass */}
      <text
        x={x}
        y={z + (b.shape === 'gate' ? 1.9 : b.shape === 'arena' ? 3.9 : FOOTPRINT[b.shape][1] / 2 + 1.2)}
        fontSize={0.95}
        fontWeight={700}
        textAnchor="middle"
        fill="#FFFFFF"
        stroke="#2B2D55"
        strokeWidth={0.28}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {b.name.th}
      </text>
    </g>
  )
}
