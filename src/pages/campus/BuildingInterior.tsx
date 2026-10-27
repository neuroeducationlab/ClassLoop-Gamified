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
  const wide = building.id === 'data' || building.id === 'plan'

  return (
    <div className="min-h-screen bg-canvas">
      <header className="font-campus text-white" style={{ backgroundColor: building.color }}>
        <div className={`mx-auto flex items-center gap-3 px-4 py-4 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <button
            onClick={() => navigate(role === 'teacher' ? '/map' : '/campus')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15 transition-colors hover:bg-black/25"
            aria-label="กลับแคมปัส · Back to campus"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-4xl" aria-hidden>
            {building.emoji}
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{building.name.th}</h1>
            <p className="text-sm opacity-85">{building.name.en}</p>
          </div>
        </div>
      </header>

      <main className={`mx-auto animate-page-fade p-4 pb-16 ${wide ? 'max-w-5xl' : 'max-w-2xl font-campus'}`}>
        {canEnter ? (
          <Room id={building.id} />
        ) : (
          <Locked />
        )}
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
