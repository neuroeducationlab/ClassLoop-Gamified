import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'
import { MathUtils, Vector3, Fog, type Group, type Mesh } from 'three'
import { LayoutGrid, Eye, EyeOff, Globe } from 'lucide-react'
import { useApp, type Avatar } from '@/context/AppContext'
import {
  BUILDINGS,
  CAMPUS_PALETTE,
  PLAZA_CENTER,
  type Building as BuildingConfig,
  type BuildingId,
} from '@/data/buildings'
import Avatar3D from './components/Avatar3D'
import Building from './components/Building'
import ContextBuildings from './components/ContextBuildings'
import Hologram from './components/Hologram'
import LightTrails from './components/LightTrails'
import { doorPoint, facingPlaza, labelHeight } from './geometry'
import Ground, { CAMPUS_RADIUS } from './components/Ground'
import { isLowPower } from './lowPower'
import Minimap from './components/Minimap'
import TouchJoystick from './components/TouchJoystick'

const WALK_SPEED = 5 // units / second
/** Third-person camera offset above + behind the avatar. */
const CAMERA_OFFSET = new Vector3(0, 16, 17)
/** First-person eye height (world units above the ground). */
const FP_EYE_HEIGHT = 1.65
const GATE = BUILDINGS.find((b) => b.id === 'entry')!
const GATE_SPAWN = doorPoint(GATE)

/** Opening shot: start high over the whole campus, swoop down to avatar. */
const INTRO_FROM = new Vector3(PLAZA_CENTER[0], 42, PLAZA_CENTER[1] + 26)
const INTRO_SECONDS = 2.4
const ENTER_DELAY_MS = 550

// ── Phase 6 Step 3 — Arrival animation ─────────────────────────────────────
const ARRIVAL_FROM = new Vector3(-24, 26, -10)
const ARRIVAL_LOOK_START = new Vector3(-16, 4, -4)
const ARRIVAL_SECONDS = 4.8
const FOG_NEAR_ARRIVAL = 4
const FOG_FAR_ARRIVAL = 24
const FOG_NEAR_CLEAR = 48
const FOG_FAR_CLEAR = 90

/** Distance threshold for "near door" prompt. */
const DOOR_PROMPT_DISTANCE = 2.8

/** The camera looks halfway between the avatar and the plaza. */
function lookTarget(x: number, z: number, out: Vector3) {
  return out.set((x + PLAZA_CENTER[0]) / 2, 0.8, (z + PLAZA_CENTER[1]) / 2)
}

let lastSpot: [number, number] | null = null
let introPlayed = false

type LabelMap = Map<string, HTMLDivElement>
const AVATAR_LABEL_HEIGHT = 2.1

// ── Language helpers ────────────────────────────────────────────────────────
type Lang = 'th' | 'en'

const UI = {
  th: {
    back: 'แดชบอร์ด',
    walkHint: 'คลิกพื้นหรือ WASD เพื่อเดิน · คลิกอาคารเพื่อเข้า',
    fpHint: 'WASD เดิน · ลากเมาส์หมุนมุมมอง · กด E หน้าประตูเพื่อเข้า',
    enterBtn: 'เข้าอาคาร →',
    pressE: 'กด',
    pressEAfter: 'เพื่อเข้า',
    teachersOnly: 'เป็นพื้นที่ของอาจารย์เท่านั้น',
    arriving: 'กำลังลงสู่แคมปัส…',
    arrivingSub: 'กำลังเดินทางสู่ลานกลาง SPU',
    skip: 'ข้ามแอนิเมชัน ↷',
    fpModeLabel: 'มุมมองบุคคลที่ 1',
    tpModeLabel: 'มุมมองบุคคลที่ 3',
    clickToEnter: 'กด E หรือคลิกเพื่อเข้า',
    facultyOnly: 'เฉพาะอาจารย์',
  },
  en: {
    back: 'Dashboard',
    walkHint: 'Click ground or WASD to walk · Click a building to enter',
    fpHint: 'WASD to walk · Mouse look / drag to rotate view · Press E near door',
    enterBtn: 'Enter Building →',
    pressE: 'Press',
    pressEAfter: 'to enter',
    teachersOnly: 'Faculty area — students are not admitted.',
    arriving: 'Arriving at SPU Campus…',
    arrivingSub: 'Descending to the campus plaza',
    skip: 'Skip arrival ↷',
    fpModeLabel: '1st Person',
    tpModeLabel: '3rd Person',
    clickToEnter: 'Press E or click to enter',
    facultyOnly: 'Faculty only',
  },
} as const

/** Student 3D campus: walk around, enter buildings, first-person immersive viewpoint. */
export default function Campus3D() {
  const { avatar, currentStudent, setRole, studentXP, role, teacherName } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const isTeacher = role === 'teacher'

  const [hovered, setHovered] = useState<BuildingId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [entering, setEntering] = useState<BuildingConfig | null>(null)
  const [teacherMenuOpen, setTeacherMenuOpen] = useState<boolean>(true)

  // ── Language & view mode toggles (default English, default First-Person) ───
  const [lang, setLang] = useState<Lang>('en')
  const [fpMode, setFpMode] = useState<boolean>(true)
  const fpModeRef = useRef<boolean>(true)
  useEffect(() => {
    fpModeRef.current = fpMode
  }, [fpMode])

  const t = UI[lang]

  // ── Phase 6 Step 3: Arrival ───────────────────────────────────────────────
  const [isArriving, setIsArriving] = useState(() => {
    const state = location.state as { arrival?: boolean } | null
    return Boolean(state?.arrival)
  })

  // ── Door prompt ───────────────────────────────────────────────────────────
  const [nearDoor, setNearDoor] = useState<BuildingConfig | null>(null)

  // ── Live avatar tracking (minimap + WASD) ─────────────────────────────────
  const avatarPosRef = useRef<[number, number]>(lastSpot ?? GATE_SPAWN)
  const avatarRotRef = useRef<number>(0)
  const [minimapAvatarPos, setMinimapAvatarPos] = useState<[number, number]>(lastSpot ?? GATE_SPAWN)
  const [minimapAvatarRot, setMinimapAvatarRot] = useState(0)

  const labels = useRef<LabelMap>(new Map())
  const labelRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) labels.current.set(key, el)
    else labels.current.delete(key)
  }

  // Phones, small screens and GPU-less machines skip postprocessing (see lowPower.ts; ?hq / ?lite override)
  const isMobile = useMemo(isLowPower, [])

  useEffect(() => {
    if (role !== 'teacher') {
      setRole('student')
    }
  }, [role, setRole])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  // Poll avatarPosRef → React state for minimap
  useEffect(() => {
    let rafId: number
    const tick = () => {
      setMinimapAvatarPos([avatarPosRef.current[0], avatarPosRef.current[1]])
      setMinimapAvatarRot(avatarRotRef.current)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const me: Avatar = avatar ?? { color: '#E89BC4', hat: 'grad', nickname: currentStudent.nickname }

  const arrive = useCallback(
    (b: BuildingConfig) => {
      lastSpot = doorPoint(b)
      if (b.studentSees === null) {
        setToast(`${b.emoji} ${b.name[lang]} — ${t.teachersOnly}`)
        return
      }
      setEntering(b)
      setTimeout(() => {
        navigate(`/campus/${b.id}`) // the interior route is /campus/:buildingId (App.tsx)
      }, ENTER_DELAY_MS)
    },
    [navigate, lang, t.teachersOnly],
  )

  const level = Math.max(1, Math.floor(studentXP / 100))
  const progress = (studentXP % 100) / 100 * 100

  const joystickRef = useRef<[number, number] | null>(null)
  const walkGroundRef = useRef<(x: number, z: number) => void>(() => {})

  return (
    <div className="fixed inset-0 select-none font-campus" style={{ backgroundColor: '#D4B896' }}>
      <Canvas
        shadows="percentage"
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: fpMode ? 75 : 45, position: [0, 20, 22] }}
      >
        <Sky
          distance={450000}
          sunPosition={[18, 8, 22]}
          inclination={0.2}
          azimuth={0.25}
          turbidity={8}
          rayleigh={2.4}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <fog
          attach="fog"
          args={[
            '#ECCDA5',
            isArriving ? FOG_NEAR_ARRIVAL : FOG_NEAR_CLEAR,
            isArriving ? FOG_FAR_ARRIVAL : FOG_FAR_CLEAR,
          ]}
        />

        <hemisphereLight args={['#FFF2DF', '#4C586B', 1.2]} />
        <directionalLight
          position={[18, 22, 14]}
          intensity={2.2}
          color="#FFD6A4"
          castShadow
          shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={28}
          shadow-camera-bottom={-28}
        />

        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3.5} color="#FFA84D" position={[25, 12, 22]} scale={[28, 14, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.2} color="#6B95D1" position={[-25, 18, -22]} scale={[32, 16, 1]} />
          <Lightformer form="ring" intensity={0.9} color="#FFF4D6" position={[0, 26, 0]} scale={[30, 30, 1]} />
        </Environment>

        <CampusScene
          me={me}
          hovered={hovered}
          onHover={setHovered}
          onArrive={arrive}
          labels={labels}
          isArriving={isArriving}
          onArrivalDone={() => setIsArriving(false)}
          joystickRef={joystickRef}
          avatarPosRef={avatarPosRef}
          avatarRotRef={avatarRotRef}
          walkGroundRef={walkGroundRef}
          onNearDoor={setNearDoor}
          fpModeRef={fpModeRef}
        />

        {!isMobile && (
          <EffectComposer multisampling={4}>
            <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.3} intensity={0.85} mipmapBlur />
            <N8AO aoRadius={1.5} distanceFalloff={0.2} intensity={1.8} />
            <Vignette offset={0.28} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>

      {/* ── Building floating labels with authentic names & clear descriptions ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUILDINGS.map((b) => {
          const isHovered = hovered === b.id
          const isNear = nearDoor?.id === b.id
          const locked = b.studentSees === null
          return (
            <div key={b.id} ref={labelRef(b.id)} className="absolute left-0 top-0" style={{ visibility: 'hidden' }}>
              <div
                className="rounded-xl px-3 py-2 text-center text-xs text-white shadow-xl backdrop-blur-md transition-all duration-200 border border-white/25"
                style={{
                  backgroundColor: b.color + 'E6',
                  transform: isHovered || isNear ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                  maxWidth: '220px',
                }}
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-sm">{b.emoji}</span>
                  <span className="font-bold tracking-tight text-white">{b.name[lang]}</span>
                  {locked && <span className="text-[10px] opacity-75">🔒</span>}
                </div>
                <p className="mt-1 text-[10px] font-normal leading-snug text-white/90 whitespace-normal text-center">
                  {b.description}
                </p>
                {!locked && (isHovered || isNear) && (
                  <p className="mt-1 text-[10px] font-semibold text-white/95 border-t border-white/20 pt-1">
                    {t.clickToEnter}
                  </p>
                )}
                {locked && (isHovered || isNear) && (
                  <p className="mt-1 text-[10px] font-semibold text-white/80 border-t border-white/20 pt-1">
                    {t.facultyOnly}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Avatar name label — hidden in first-person (you ARE the avatar) */}
        {!fpMode && (
          <div ref={labelRef('me')} className="absolute left-0 top-0" style={{ visibility: 'hidden' }}>
            <span className="whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink shadow">
              {me.nickname}
            </span>
          </div>
        )}
      </div>

      {/* ── Top HUD ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 z-20">
        {/* Player / Teacher card */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-black/55 px-4 py-3 text-white backdrop-blur-md border border-white/15 shadow-xl">
          {isTeacher ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-600 text-white shadow-md text-lg shrink-0">
              🎓
            </div>
          ) : (
            <span className="h-9 w-9 rounded-full border-2 border-white shadow shrink-0" style={{ backgroundColor: me.color }} />
          )}
          <div className="min-w-[9rem]">
            <p className="text-sm font-bold leading-tight">{isTeacher ? (teacherName || 'อ.ดร.ธนพร') : me.nickname}</p>
            {isTeacher ? (
              <p className="text-[11px] text-pink-300 font-medium">อาจารย์ผู้สอน · Faculty</p>
            ) : (
              <>
                <p className="text-[11px] text-white/80">Lv.{level} · {studentXP} XP</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: CAMPUS_PALETTE.path }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          {/* Language toggle: EN / TH */}
          <button
            onClick={() => setLang((l) => (l === 'en' ? 'th' : 'en'))}
            className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/55 transition-colors shadow cursor-pointer"
            title="Switch Language / สลับภาษา"
          >
            <Globe className="h-3.5 w-3.5 text-blue-300" />
            <span className={lang === 'en' ? 'text-white font-bold' : 'text-white/60'}>EN</span>
            <span className="text-white/40">/</span>
            <span className={lang === 'th' ? 'text-white font-bold' : 'text-white/60'}>TH</span>
          </button>

          {/* Perspective toggle: 1st Person / 3rd Person */}
          <button
            onClick={() => setFpMode((m) => !m)}
            className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/55 transition-colors shadow cursor-pointer"
            title={fpMode ? t.tpModeLabel : t.fpModeLabel}
          >
            {fpMode ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-white/70" />}
            <span className="hidden sm:inline">{fpMode ? t.fpModeLabel : t.tpModeLabel}</span>
          </button>

          {isTeacher ? (
            <>
              <Link
                to="/map"
                aria-label="แผนที่ 2D · 2D Map"
                className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors shadow"
              >
                <span>🗺️</span>
                <span className="hidden sm:inline">แผนที่ 2D</span>
              </Link>
              <Link
                to="/teacher"
                aria-label="ห้องสตูดิโออาจารย์ · Teacher Studio"
                className="flex items-center gap-1.5 rounded-xl bg-pink-600/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-pink-400/30 hover:bg-pink-600 transition-colors shadow"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">สตูดิโอ</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/student"
                aria-label="หน้าเดิม · Classic view"
                className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors shadow"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">{t.back}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Teacher Quick-Access Navigation Bar (Easy for instructors, 0 confusion) ── */}
      {isTeacher && !isArriving && (
        <div className="pointer-events-auto absolute top-20 left-4 z-20 w-72 rounded-2xl border border-white/20 bg-black/70 p-3.5 text-white backdrop-blur-xl shadow-2xl transition-all">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <p className="text-xs font-bold">เมนูลัดอาจารย์ (ไม่ต้องเดิน)</p>
            </div>
            <button
              onClick={() => setTeacherMenuOpen(!teacherMenuOpen)}
              className="text-[11px] text-white/60 hover:text-white transition-colors"
            >
              {teacherMenuOpen ? 'ย่อ' : 'ขยาย'}
            </button>
          </div>

          {teacherMenuOpen && (
            <div className="space-y-1.5">
              <button
                onClick={() => navigate('/campus/data')}
                className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20 transition-all text-left group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">📊</span>
                  <div>
                    <p className="font-bold text-white group-hover:text-pink-300 transition-colors">สถิติ & Gap Analysis</p>
                    <p className="text-[10px] text-white/60">อาคาร 11 · วิเคราะห์ผู้เรียน</p>
                  </div>
                </span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs">→</span>
              </button>

              <button
                onClick={() => navigate('/campus/plan')}
                className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20 transition-all text-left group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">📝</span>
                  <div>
                    <p className="font-bold text-white group-hover:text-pink-300 transition-colors">สตูดิโอแผนการสอน</p>
                    <p className="text-[10px] text-white/60">อาคาร 5 · สื่อและกิจกรรม</p>
                  </div>
                </span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs">→</span>
              </button>

              <button
                onClick={() => navigate('/campus/dorm')}
                className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs font-medium hover:bg-white/20 transition-all text-left group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <div>
                    <p className="font-bold text-white group-hover:text-pink-300 transition-colors">กระทู้ & คำถามนิสิต</p>
                    <p className="text-[10px] text-white/60">อาคาร 9 · คอมมูนิตี้</p>
                  </div>
                </span>
                <span className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs">→</span>
              </button>
            </div>
          )}
        </div>
      )}


      {/* ── Bottom HUD ── */}
      {/* on phones the joystick + minimap fill the bottom corners, so the prompt sits above them */}
      <div className="pointer-events-none absolute inset-x-0 bottom-56 flex flex-col items-center gap-2 px-4 sm:bottom-5">
        {toast && (
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg animate-fadeIn max-w-xs text-center">
            {toast}
          </p>
        )}

        {/* Door prompt with authentic name & clear description */}
        {nearDoor && !isArriving && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/75 px-5 py-2.5 text-white backdrop-blur-md border border-white/20 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-xl">{nearDoor.emoji}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">{nearDoor.name[lang]}</span>
              <span className="text-[11px] text-white/75 hidden sm:block max-w-sm">{nearDoor.description}</span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-xs text-white/70 mx-1 border-l border-white/20 pl-2">
              {t.pressE} <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-white font-mono text-[10px] mx-0.5">E</kbd> {t.pressEAfter}
            </span>
            <button
              onClick={() => arrive(nearDoor)}
              className="ml-1 rounded-full bg-white/20 hover:bg-white/35 px-3.5 py-1.5 text-xs font-bold transition-colors border border-white/30 cursor-pointer whitespace-nowrap"
            >
              {t.enterBtn}
            </button>
          </div>
        )}

        {/* Walk hint */}
        {!nearDoor && !isArriving && (
          <p className="rounded-full bg-black/45 px-4 py-1.5 text-xs text-white/95 backdrop-blur-md border border-white/10 shadow">
            {fpMode ? t.fpHint : t.walkHint}
          </p>
        )}
      </div>

      {/* ── Arrival overlay (Phase 6 Step 3) ── */}
      {isArriving && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-end pb-24 gap-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-1">
            <p className="text-white text-lg font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide">
              {t.arriving}
            </p>
            <p className="text-white/70 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {t.arrivingSub}
            </p>
          </div>
          <button
            className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 border border-white/25 px-5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
            onClick={() => setIsArriving(false)}
          >
            {t.skip}
          </button>
        </div>
      )}

      {/* ── Minimap (Phase 6 Step 4) — with lang support and collapsible ── */}
      {!isArriving && (
        <Minimap
          avatarPosition={minimapAvatarPos}
          avatarColor={me.color}
          avatarRotation={minimapAvatarRot}
          onWalk={(x, z) => walkGroundRef.current(x, z)}
          onSelectBuilding={(b) => {
            const dp = doorPoint(b)
            walkGroundRef.current(dp[0], dp[1])
          }}
          lang={lang}
        />
      )}

      {/* ── Touch Joystick (Phase 6 Step 5) ── */}
      {!isArriving && (
        <TouchJoystick
          onMove={(vec) => {
            joystickRef.current = vec
          }}
          onEnd={() => {
            joystickRef.current = null
          }}
        />
      )}

      {/* ── Building enter transition with description ── */}
      {entering && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 text-white animate-in fade-in duration-500"
          style={{ backgroundColor: entering.color }}
        >
          <span className="text-7xl animate-in zoom-in-50 duration-500">{entering.emoji}</span>
          <p className="text-2xl font-bold animate-in slide-in-from-bottom-4 duration-500">{entering.name[lang]}</p>
          <p className="text-sm text-white/85 max-w-sm text-center animate-in slide-in-from-bottom-4 duration-700 px-4">
            {entering.description}
          </p>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- scene -- */

type SceneProps = {
  me: Avatar
  hovered: BuildingId | null
  onHover: (id: BuildingId | null) => void
  onArrive: (b: BuildingConfig) => void
  labels: RefObject<LabelMap>
  isArriving: boolean
  onArrivalDone: () => void
  joystickRef: RefObject<[number, number] | null>
  avatarPosRef: RefObject<[number, number]>
  avatarRotRef: RefObject<number>
  walkGroundRef: RefObject<(x: number, z: number) => void>
  onNearDoor: (b: BuildingConfig | null) => void
  fpModeRef: RefObject<boolean>
}

function passesNear(a: [number, number], b: [number, number], p: [number, number], r: number) {
  const [dx, dz] = [b[0] - a[0], b[1] - a[1]]
  const len2 = dx * dx + dz * dz || 1
  const t = MathUtils.clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / len2, 0, 1)
  return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]) < r
}

function CampusScene({
  me,
  hovered,
  onHover,
  onArrive,
  labels,
  isArriving,
  onArrivalDone,
  joystickRef,
  avatarPosRef,
  avatarRotRef,
  walkGroundRef,
  onNearDoor,
  fpModeRef,
}: SceneProps) {
  const { camera, size, scene } = useThree()
  const avatarRef = useRef<Group>(null)
  const markerRef = useRef<Mesh>(null)
  const waypoints = useRef<[number, number][]>([])
  const destination = useRef<BuildingConfig | null>(null)
  const spawn = lastSpot ?? GATE_SPAWN
  const intro = useRef(introPlayed ? 1 : 0)

  // Arrival animation
  const arrivalT = useRef(0)
  const fogT = useRef(isArriving ? 0 : 1)
  const isArrivingRef = useRef(isArriving)
  useEffect(() => {
    isArrivingRef.current = isArriving
    if (!isArriving) {
      fogT.current = 1
      arrivalT.current = 1
    }
  }, [isArriving])

  // Keyboard state
  const keys = useRef<Set<string>>(new Set())

  // Heading convention: 0 = North (-Z), +PI/2 = East (+X), PI = South (+Z), -PI/2 = West (-X)
  // Initially look from entrance toward the campus plaza
  const initialHeading = Math.atan2(PLAZA_CENTER[0] - spawn[0], -(PLAZA_CENTER[1] - spawn[1]))
  const mouseYaw = useRef(initialHeading)
  const mousePitch = useRef(0) // Level gaze
  const isPointerLocked = useRef(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code)
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  // Mouse look supporting both pointer lock (click) AND drag-to-look
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    let isMouseDown = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (e: MouseEvent) => {
      if (!fpModeRef.current) return
      isMouseDown = true
      lastX = e.clientX
      lastY = e.clientY
      // Request pointer lock on canvas click if supported
      if (!isPointerLocked.current && canvas.requestPointerLock) {
        canvas.requestPointerLock()
      }
    }

    const onPointerUp = () => {
      isMouseDown = false
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!fpModeRef.current) return
      let dx = 0
      let dy = 0

      if (isPointerLocked.current) {
        dx = e.movementX
        dy = e.movementY
      } else if (isMouseDown) {
        dx = e.clientX - lastX
        dy = e.clientY - lastY
        lastX = e.clientX
        lastY = e.clientY
      } else {
        return
      }

      // Moving mouse right (dx > 0) turns heading right (East)
      mouseYaw.current += dx * 0.0025
      // Moving mouse down (dy > 0) tilts camera down (pitch > 0)
      mousePitch.current = MathUtils.clamp(
        mousePitch.current + dy * 0.002,
        -Math.PI / 3, // look up limit (~60 deg)
        Math.PI / 3,  // look down limit (~60 deg)
      )
    }

    const onLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas
    }

    canvas.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mouseup', onPointerUp)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)
    return () => {
      canvas.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('mouseup', onPointerUp)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
      if (document.pointerLockElement === canvas) document.exitPointerLock()
    }
  }, [fpModeRef])

  const nearDoorRef = useRef<BuildingConfig | null>(null)

  useEffect(() => {
    const t = lookTarget(spawn[0], spawn[1], new Vector3())
    if (isArriving) {
      camera.position.copy(ARRIVAL_FROM)
      camera.lookAt(ARRIVAL_LOOK_START)
    } else if (fpModeRef.current) {
      camera.position.set(spawn[0], FP_EYE_HEIGHT, spawn[1])
      camera.rotation.order = 'YXZ'
      camera.rotation.y = -mouseYaw.current
      camera.rotation.x = mousePitch.current
    } else if (intro.current < 1) {
      camera.position.copy(INTRO_FROM)
      camera.lookAt(new Vector3(PLAZA_CENTER[0], 0, PLAZA_CENTER[1]))
    } else {
      camera.position.copy(t).add(CAMERA_OFFSET)
      camera.lookAt(t)
    }
    introPlayed = true
  }, [camera, spawn, isArriving, fpModeRef])

  const walkTo = (target: [number, number], building: BuildingConfig | null) => {
    const a = avatarRef.current
    if (!a) return
    const here: [number, number] = [a.position.x, a.position.z]
    const blocked = BUILDINGS.some(
      (b) => b.id !== building?.id && passesNear(here, target, b.position, 3.2),
    )
    if (blocked) {
      const ang = Math.atan2(target[0] - PLAZA_CENTER[0], target[1] - PLAZA_CENTER[1])
      waypoints.current = [
        [PLAZA_CENTER[0] + Math.sin(ang) * 3.6, PLAZA_CENTER[1] + Math.cos(ang) * 3.6],
        target,
      ]
    } else {
      waypoints.current = [target]
    }
    destination.current = building
    const m = markerRef.current
    if (m) {
      m.position.set(target[0], 0.05, target[1])
      m.visible = true
      m.scale.setScalar(1)
    }
  }

  const walkGround = (x: number, z: number) => {
    const r = Math.hypot(x, z)
    const k = r > CAMPUS_RADIUS ? CAMPUS_RADIUS / r : 1
    walkTo([x * k, z * k], null)
  }

  useEffect(() => {
    walkGroundRef.current = walkGround
  })

  const look = new Vector3()
  const follow = new Vector3()
  const lookAt = new Vector3()
  const proj = new Vector3()

  const place = (key: string, x: number, y: number, z: number) => {
    const el = labels.current.get(key)
    if (!el) return
    proj.set(x, y, z).project(camera)
    const px = ((proj.x + 1) / 2) * size.width
    const py = ((1 - proj.y) / 2) * size.height
    el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`
    el.style.visibility = proj.z < 1 ? 'visible' : 'hidden'
  }

  useFrame((state, dt) => {
    const a = avatarRef.current
    if (!a) return

    // ── Arrival animation ─────────────────────────────────────────────
    if (isArrivingRef.current) {
      arrivalT.current = Math.min(1, arrivalT.current + dt / ARRIVAL_SECONDS)
      const e = 1 - Math.pow(1 - arrivalT.current, 3)
      const followTarget = lookTarget(a.position.x, a.position.z, look)
      const destCam = followTarget.clone().add(CAMERA_OFFSET)
      camera.position.lerpVectors(ARRIVAL_FROM, destCam, e)
      camera.lookAt(ARRIVAL_LOOK_START.clone().lerp(followTarget, e))
      fogT.current = Math.min(1, fogT.current + dt / ARRIVAL_SECONDS)
      if (scene.fog instanceof Fog) {
        scene.fog.near = MathUtils.lerp(FOG_NEAR_ARRIVAL, FOG_NEAR_CLEAR, fogT.current)
        scene.fog.far = MathUtils.lerp(FOG_FAR_ARRIVAL, FOG_FAR_CLEAR, fogT.current)
      }
      if (arrivalT.current >= 1) onArrivalDone()
      for (const b of BUILDINGS) place(b.id, b.position[0], labelHeight(b.shape), b.position[1])
      place('me', a.position.x, a.position.y + AVATAR_LABEL_HEIGHT, a.position.z)
      return
    }

    // ── WASD + Joystick movement ──────────────────────────────────────
    const k = keys.current
    let vx = 0
    let vz = 0
    const isFP = fpModeRef.current

    if (isFP) {
      // First-person: movement is relative to look heading
      const fwdX = Math.sin(mouseYaw.current)
      const fwdZ = -Math.cos(mouseYaw.current)
      const rightX = Math.cos(mouseYaw.current)
      const rightZ = Math.sin(mouseYaw.current)

      if (k.has('KeyW') || k.has('ArrowUp')) {
        vx += fwdX
        vz += fwdZ
      }
      if (k.has('KeyS') || k.has('ArrowDown')) {
        vx -= fwdX
        vz -= fwdZ
      }
      if (k.has('KeyD') || k.has('ArrowRight')) {
        vx += rightX
        vz += rightZ
      }
      if (k.has('KeyA') || k.has('ArrowLeft')) {
        vx -= rightX
        vz -= rightZ
      }

      const joy = joystickRef.current
      if (joy) {
        // In touch joystick, joy[1] < 0 is pushing UP (forward)
        vx += joy[0] * rightX - joy[1] * fwdX
        vz += joy[0] * rightZ - joy[1] * fwdZ
      }
    } else {
      // Third-person: movement is world-axis aligned
      if (k.has('KeyW') || k.has('ArrowUp')) vz -= 1
      if (k.has('KeyS') || k.has('ArrowDown')) vz += 1
      if (k.has('KeyA') || k.has('ArrowLeft')) vx -= 1
      if (k.has('KeyD') || k.has('ArrowRight')) vx += 1

      const joy = joystickRef.current
      if (joy) {
        vx += joy[0]
        vz += joy[1]
      }
    }

    let moving = false

    if (vx !== 0 || vz !== 0) {
      waypoints.current = []
      destination.current = null
      if (markerRef.current) markerRef.current.visible = false

      const mag = Math.hypot(vx, vz)
      const nx = vx / mag
      const nz = vz / mag
      const step = WALK_SPEED * dt
      const newX = a.position.x + nx * step
      const newZ = a.position.z + nz * step
      const dist = Math.hypot(newX, newZ)
      const clamp = dist > CAMPUS_RADIUS ? CAMPUS_RADIUS / dist : 1
      a.position.x = newX * clamp
      a.position.z = newZ * clamp

      if (!isFP) {
        const want = Math.atan2(nx, nz)
        const diff = Math.atan2(Math.sin(want - a.rotation.y), Math.cos(want - a.rotation.y))
        a.rotation.y += diff * Math.min(1, dt * 12)
      }
      moving = true
    } else {
      // Waypoint movement
      const next = waypoints.current[0]
      if (next) {
        const dx = next[0] - a.position.x
        const dz = next[1] - a.position.z
        const dist = Math.hypot(dx, dz)
        const step = WALK_SPEED * dt
        if (dist <= step) {
          a.position.x = next[0]
          a.position.z = next[1]
          waypoints.current.shift()
          if (waypoints.current.length === 0) {
            if (markerRef.current) markerRef.current.visible = false
            const b = destination.current
            destination.current = null
            if (b) onArrive(b)
          }
        } else {
          a.position.x += (dx / dist) * step
          a.position.z += (dz / dist) * step
          moving = true
        }
        const want = Math.atan2(next[0] - a.position.x, next[1] - a.position.z)
        const diff = Math.atan2(Math.sin(want - a.rotation.y), Math.cos(want - a.rotation.y))
        a.rotation.y += diff * Math.min(1, dt * 12)
        if (isFP) mouseYaw.current = a.rotation.y
      }
    }

    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.12 : 0
    a.position.y = MathUtils.damp(a.position.y, hop, 20, dt)

    const m = markerRef.current
    if (m?.visible) m.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.12)

    avatarPosRef.current = [a.position.x, a.position.z]
    avatarRotRef.current = isFP ? mouseYaw.current : a.rotation.y

    // Door proximity
    let nearest: BuildingConfig | null = null
    let nearestDist = DOOR_PROMPT_DISTANCE
    for (const b of BUILDINGS) {
      const dp = doorPoint(b)
      const d = Math.hypot(dp[0] - a.position.x, dp[1] - a.position.z)
      if (d < nearestDist && b.studentSees !== null) {
        nearest = b
        nearestDist = d
      }
    }
    if (nearest !== nearDoorRef.current) {
      nearDoorRef.current = nearest
      onNearDoor(nearest)
    }

    if (k.has('KeyE') && nearDoorRef.current) {
      k.delete('KeyE')
      onArrive(nearDoorRef.current)
    }

    // ── Camera ──────────────────────────────────────────────────────
    if (isFP) {
      // First-person: camera is at eye level, looking in mouse heading direction
      camera.position.set(a.position.x, a.position.y + FP_EYE_HEIGHT, a.position.z)
      camera.rotation.order = 'YXZ'
      camera.rotation.y = -mouseYaw.current
      camera.rotation.x = mousePitch.current
    } else {
      // Third-person follow
      lookTarget(a.position.x, a.position.z, look)
      if (intro.current < 1) {
        intro.current = Math.min(1, intro.current + dt / INTRO_SECONDS)
        const e2 = 1 - Math.pow(1 - intro.current, 3)
        follow.copy(look).add(CAMERA_OFFSET)
        camera.position.lerpVectors(INTRO_FROM, follow, e2)
        lookAt.set(PLAZA_CENTER[0], 0, PLAZA_CENTER[1]).lerp(look, e2)
        camera.lookAt(lookAt)
      } else {
        const kk = 1 - Math.exp(-3 * dt)
        camera.position.x += (look.x + CAMERA_OFFSET.x - camera.position.x) * kk
        camera.position.y += (look.y + CAMERA_OFFSET.y - camera.position.y) * kk
        camera.position.z += (look.z + CAMERA_OFFSET.z - camera.position.z) * kk
        camera.lookAt(look)
      }
    }

    // Labels
    for (const b of BUILDINGS) place(b.id, b.position[0], labelHeight(b.shape), b.position[1])
    if (!isFP) place('me', a.position.x, a.position.y + AVATAR_LABEL_HEIGHT, a.position.z)
  })

  return (
    <>
      <Ground onWalk={walkGround} />
      <ContextBuildings />
      <Hologram position={[PLAZA_CENTER[0], 6.2, PLAZA_CENTER[1]]} />
      <LightTrails />

      {BUILDINGS.map((b) => (
        <Building
          key={b.id}
          building={b}
          hovered={hovered === b.id}
          onHover={onHover}
          onSelect={(sel) => walkTo(doorPoint(sel), sel)}
        />
      ))}

      <mesh ref={markerRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.35, 0.5, 24]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>

      {/* Avatar is hidden in first-person (the player feels they are walking themselves) */}
      <group
        ref={avatarRef}
        position={[spawn[0], 0, spawn[1]]}
        rotation={[0, facingPlaza(spawn), 0]}
        visible={!fpModeRef.current}
      >
        <Avatar3D color={me.color} hat={me.hat} />
      </group>
    </>
  )
}
