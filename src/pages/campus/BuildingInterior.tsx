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
  const { role, lang } = useApp()
  const navigate = useNavigate()
  const building = BUILDINGS.find((b) => b.id === buildingId)
  if (!building) return <Navigate to="/campus" replace />

  const canEnter = role === 'teacher' ? building.teacherSees !== null : building.studentSees !== null
  // data/plan embed the existing Dashboard/Studio, which are designed for the light canvas
  const wide = building.id === 'data' || building.id === 'plan'
  const blurb = role === 'teacher' ? building.teacherSees : building.studentSees
  const back = () => navigate(role === 'teacher' ? '/map' : '/campus')

  const backText = role === 'teacher'
    ? (lang === 'th' ? 'กลับแผนที่ 2D' : 'Back to 2D Map')
    : (lang === 'th' ? 'กลับแคมปัส 3D' : 'Back to 3D Campus')

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
          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition-all hover:bg-white/25 cursor-pointer shadow-sm"
              aria-label={backText}
            >
              <ArrowLeft className="h-4 w-4" /> {backText}
            </button>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
                {role === 'teacher'
                  ? (lang === 'th' ? '🧑‍🏫 โหมดอาจารย์' : '🧑‍🏫 Faculty Mode')
                  : (lang === 'th' ? '🧑‍🎓 โหมดนักศึกษา' : '🧑‍🎓 Student Mode')}
              </span>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl shadow-xl backdrop-blur animate-in zoom-in-75 duration-500"
              aria-hidden
            >
              {building.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                SPU · {building.spuRef}
              </p>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{building.name[lang]}</h1>
              <p className="text-sm text-white/80">{lang === 'th' ? building.name.en : building.name.th}</p>
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
  const { role, lang, setRole } = useApp()
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-amber-500/30 bg-black/50 p-8 text-center text-white backdrop-blur-xl shadow-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
        <Lock className="h-8 w-8 animate-pulse" />
      </div>
      <div>
        <p className="text-lg font-extrabold text-white">
          {lang === 'th' ? '🔒 พื้นที่สงวนเฉพาะบทบาท' : '🔒 Restricted Access Zone'}
        </p>
        <p className="mt-1 text-sm text-white/70 max-w-md mx-auto">
          {lang === 'th'
            ? 'ห้องนี้เปิดเฉพาะผู้มีสิทธิ์เข้าถึง (อาจารย์ผู้สอน หรือนักศึกษาตามหลักสูตร)'
            : 'This facility is restricted to authorized faculty instructors or students.'}
        </p>
      </div>
      <button
        onClick={() => setRole(role === 'student' ? 'teacher' : 'student')}
        className="mt-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/30 hover:brightness-110 transition-all cursor-pointer"
      >
        {lang === 'th' ? '⚡ สลับบทบาทเพื่อทดสอบทันที (Switch Demo Role)' : '⚡ Switch Role for Demo'}
      </button>
    </div>
  )
}
