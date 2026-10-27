import type { ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, type BuildingId } from '@/data/buildings'
import GateRoom from './interiors/GateRoom'
import FacultyHall from './interiors/FacultyHall'
import Arena from './interiors/Arena'
import HeartDorm from './interiors/HeartDorm'
// Teacher rooms reuse the existing Studio/Dashboard pages untouched.
import Dashboard from '@/pages/teacher/Dashboard'
import Studio from '@/pages/teacher/Studio'

/** 2D inside of a campus building, at /campus/:buildingId. Role-aware: same room, different view. */
export default function BuildingInterior() {
  const { buildingId } = useParams()
  const { role } = useApp()
  const navigate = useNavigate()
  const building = BUILDINGS.find((b) => b.id === buildingId)
  if (!building) return <Navigate to="/campus" replace />

  const canEnter = role === 'teacher' ? building.teacherSees !== null : building.studentSees !== null
  // data/plan embed the existing Dashboard/Studio, which are designed for the light canvas
  const wide = building.id === 'data' || building.id === 'plan'
  const blurb = role === 'teacher' ? building.teacherSees : building.studentSees
  const back = () => navigate(role === 'teacher' ? '/map' : '/campus')

  return (
    <div
      className="min-h-screen bg-canvas"
      style={
        wide
          ? undefined
          : { background: `linear-gradient(165deg, ${building.color} 0%, #2B2D55 42%, #16182E 100%)` }
      }
    >
      {/* hero band: accent gradient + dot grid, like a modern campus wayfinding sign */}
      <header
        className="relative overflow-hidden font-campus text-white"
        style={wide ? { background: `linear-gradient(120deg, ${building.color}, #2B2D55)` } : undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className={`relative mx-auto px-4 pb-6 pt-4 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <button
            onClick={back}
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
            aria-label="กลับแคมปัส · Back to campus"
          >
            <ArrowLeft className="h-4 w-4" /> {role === 'teacher' ? 'กลับแผนที่' : 'กลับแคมปัส'}
          </button>
          <div className="mt-5 flex items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl shadow-lg backdrop-blur animate-in zoom-in-75 duration-500"
              aria-hidden
            >
              {building.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                SPU · {building.spuRef}
              </p>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{building.name.th}</h1>
              <p className="text-sm text-white/80">{building.name.en}</p>
            </div>
          </div>
          {blurb && !wide && <p className="mt-3 text-sm text-white/75">{blurb}</p>}
        </div>
      </header>

      <main className={`mx-auto animate-page-fade p-4 pb-16 ${wide ? 'max-w-5xl' : 'max-w-2xl font-campus'}`}>
        {canEnter ? <Room id={building.id} /> : <Locked />}
      </main>
    </div>
  )
}

function Room({ id }: { id: BuildingId }): ReactNode {
  switch (id) {
    case 'entry':
      return <GateRoom />
    case 'faculty':
      return <FacultyHall />
    case 'arena':
      return <Arena />
    case 'dorm':
      return <HeartDorm />
    case 'data':
      return <Dashboard />
    case 'plan':
      return <Studio />
  }
}

function Locked() {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-grey-300/60 bg-paper p-10 text-center">
      <Lock className="h-10 w-10 text-grey-400" />
      <p className="font-bold text-ink">พื้นที่นี้ไม่ได้เปิดสำหรับบทบาทของคุณ</p>
      <p className="text-sm text-grey-600">This room isn't open for your role.</p>
    </div>
  )
}
