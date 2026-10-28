import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Lock, Volume2, VolumeX } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, type Building } from '@/data/buildings'
import { INTERIORS, stationsFor } from '@/data/interiors'
import { playPortalSound, isSoundMuted, toggleSoundMute } from './soundEngine'
import { isLowPower } from './lowPower'
import CommandMenu from './components/CommandMenu'
import InteriorScene, { type LabelMap } from './interior/InteriorScene'
import HoloPanel from './interior/HoloPanel'

/**
 * Inside a campus building, at /campus/:buildingId: a 3D room in the building's
 * own colours with stations (see data/interiors.ts). Pick a station from the
 * menu or in the room, the camera glides to it, and its feature opens on a
 * hologram panel. Role-aware: same room, different stations; a room with none
 * for your role shows the lock. `?station=<id>` opens a station directly.
 */
export default function BuildingInterior() {
  const { buildingId } = useParams()
  const building = BUILDINGS.find((b) => b.id === buildingId)
  if (!building) return <Navigate to="/campus" replace />
  return <Room key={building.id} building={building} />
}

function Room({ building }: { building: Building }) {
  const { role, lang } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [muted, setMuted] = useState(isSoundMuted())
  const [lowPower] = useState(isLowPower)
  const config = INTERIORS[building.id]
  const stations = useMemo(() => stationsFor(building.id, role), [building.id, role])
  const canEnter = stations.length > 0

  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(() => {
    const s = params.get('station')
    return stations.some((x) => x.id === s) ? s : null
  })
  const [open, setOpen] = useState<string | null>(null)
  const labels = useRef<LabelMap>(new Map())
  const openStation = stations.find((s) => s.id === open)

  // came in from the teacher's 2D map → go back there
  const fromMap = (location.state as { from?: string } | null)?.from === '/map'
  const backTarget = fromMap ? '/map' : '/campus'
  const backText = fromMap ? (lang === 'th' ? 'กลับแผนที่ 2D' : 'Back to 2D Map') : lang === 'th' ? 'กลับแคมปัส 3D' : 'Back to 3D Campus'
  const back = useCallback(() => {
    playPortalSound()
    navigate(backTarget)
  }, [navigate, backTarget])

  /** Glide to a station; its panel opens when the camera arrives (at once if already there). */
  const pick = (id: string) => {
    if (focused === id) setOpen(id)
    else {
      setOpen(null)
      setFocused(id)
    }
  }
  const close = () => {
    setOpen(null)
    setFocused(null)
  }

  // Esc steps back out: panel → room overview → campus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (open) setOpen(null)
      if (focused) setFocused(null)
      else back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, focused, back])

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden font-campus text-white"
      style={{ background: `linear-gradient(165deg, ${building.color} 0%, #2B2D55 45%, #16182E 100%)` }}
    >
      <div className="absolute inset-0">
        <InteriorScene
          building={building}
          config={config}
          stations={stations}
          lang={lang}
          hovered={hovered}
          focused={focused}
          lowPower={lowPower}
          labels={labels}
          onHover={setHovered}
          onPick={pick}
          onArrived={setOpen}
        />
      </div>

      {/* station name tags, pinned above each station by the scene */}
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`}>
        {stations.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              if (el) labels.current.set(s.id, el)
              else labels.current.delete(s.id)
            }}
            className="absolute left-0 top-0"
            style={{ visibility: 'hidden' }}
          >
            <button
              onClick={() => pick(s.id)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className={`pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-md transition-all ${
                hovered === s.id || focused === s.id ? 'scale-110 border-white/70 bg-white/25' : 'border-white/30 bg-black/45'
              }`}
            >
              <span>{s.icon}</span>
              {s.label[lang]}
            </button>
          </div>
        ))}
      </div>

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={back}
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur transition-all hover:bg-black/55"
            aria-label={backText}
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{backText}</span>
          </button>
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-black/40 px-3 py-1.5 backdrop-blur">
            <span className="text-2xl" aria-hidden>
              {building.emoji}
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-bold leading-tight sm:text-base">{building.name[lang]}</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">SPU · {building.spuRef}</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted(toggleSoundMute())}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/85 shadow-sm backdrop-blur transition-all hover:bg-black/55"
            title={muted ? (lang === 'th' ? 'เปิดเสียงเอฟเฟกต์' : 'Unmute SFX') : lang === 'th' ? 'ปิดเสียงเอฟเฟกต์' : 'Mute SFX'}
            aria-label="Toggle SFX"
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-300" /> : <Volume2 className="h-4 w-4 text-emerald-300" />}
          </button>
          <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
            {role === 'teacher' ? (lang === 'th' ? 'โหมดอาจารย์' : 'Faculty Mode') : lang === 'th' ? 'โหมดนักศึกษา' : 'Student Mode'}
          </span>
        </div>
      </header>

      {canEnter ? (
        <CommandMenu
          className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-24 sm:w-80"
          title={lang === 'th' ? 'เลือกจุดในห้องนี้' : 'CHOOSE A STATION'}
          items={stations.map((s) => ({ id: s.id, icon: s.icon, label: s.label[lang], does: s.does[lang] }))}
          selected={hovered ?? focused}
          onSelect={setHovered}
          onConfirm={pick}
        />
      ) : (
        <Locked staffOnly={building.studentSees === null} />
      )}

      {openStation && <HoloPanel key={openStation.id} station={openStation} lang={lang} color={building.color} onClose={close} />}
    </div>
  )
}

/** Shown over the room when it has nothing for your role: you can see in, not use it. */
function Locked({ staffOnly }: { staffOnly: boolean }) {
  const { role, lang, setRole } = useApp()
  const title = staffOnly
    ? lang === 'th'
      ? 'เฉพาะอาจารย์ · Staff only'
      : 'Staff only'
    : lang === 'th'
      ? 'ห้องนี้สำหรับนักศึกษา'
      : 'A student space'
  const body = staffOnly
    ? lang === 'th'
      ? 'ห้องนี้เป็นพื้นที่ทำงานของอาจารย์ นักศึกษามองเห็นได้แต่เข้าใช้ไม่ได้'
      : 'This is where teachers work. Students can look in, but not use it.'
    : lang === 'th'
      ? 'อาจารย์ดูภาพรวมของห้องนี้ได้จากสถิติห้องเรียนใน Command Deck'
      : 'Teachers see this room’s activity in Class statistics on the Command Deck.'
  return (
    <div className="absolute inset-x-3 bottom-6 z-20 mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-amber-500/30 bg-black/60 p-6 text-center text-white shadow-2xl backdrop-blur-xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/20 text-amber-400">
        <Lock className="h-7 w-7" />
      </div>
      <p className="text-lg font-extrabold">{title}</p>
      <p className="text-sm text-white/75">{body}</p>
      <button
        onClick={() => setRole(role === 'student' ? 'teacher' : 'student')}
        className="mt-1 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/30 transition-all hover:brightness-110"
      >
        {lang === 'th' ? 'สลับบทบาทเพื่อทดสอบ (Switch Demo Role)' : 'Switch Role for Demo'}
      </button>
    </div>
  )
}
