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
import { Shirt, LayoutGrid } from 'lucide-react'
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
import { doorPoint, facingPlaza, labelHeight } from './geometry'
import Ground, { CAMPUS_RADIUS } from './components/Ground'
import Minimap from './components/Minimap'
import TouchJoystick from './components/TouchJoystick'

const WALK_SPEED = 5 // units / second
const CAMERA_OFFSET = new Vector3(0, 16, 17)
const GATE = BUILDINGS.find((b) => b.id === 'entry')!
/** Step out of MRT Exit 2 onto campus. */
const GATE_SPAWN = doorPoint(GATE)

/** Opening shot: start high over the whole campus, then swoop down to the avatar. */
const INTRO_FROM = new Vector3(PLAZA_CENTER[0], 42, PLAZA_CENTER[1] + 26)
const INTRO_SECONDS = 2.4
const ENTER_DELAY_MS = 550

/**
 * Phase 6 Step 3 — Arrival animation.
 * Camera starts above the MRT train line, descends toward Exit 2, and the fog
 * lifts from dense (foggy arrival) to clear (normal campus view).
 */
const ARRIVAL_FROM = new Vector3(-24, 26, -10)
const ARRIVAL_LOOK_START = new Vector3(-16, 4, -4)
// const ARRIVAL_LOOK_END = new Vector3(-11.5, 4, -2) // reserved for future sub-step
const ARRIVAL_SECONDS = 4.8
const FOG_NEAR_ARRIVAL = 4
const FOG_FAR_ARRIVAL = 24
const FOG_NEAR_CLEAR = 48
const FOG_FAR_CLEAR = 90
/** Distance threshold for "near door" prompt (in world units). */
const DOOR_PROMPT_DISTANCE = 2.4

/**
 * The camera looks halfway between the avatar and the plaza: the avatar stays
 * in frame while the whole campus stays readable — this is filmed, not played.
 */
function lookTarget(x: number, z: number, out: Vector3) {
  return out.set((x + PLAZA_CENTER[0]) / 2, 0.8, (z + PLAZA_CENTER[1]) / 2)
}

/**
 * Where the avatar stood when it last went into a building, so coming back
 * out of an interior drops you at that door rather than back at the gate.
 */
let lastSpot: [number, number] | null = null
/** The intro swoop plays once per visit, not every time you leave a building. */
let introPlayed = false

/** Screen-space label elements, keyed by building id or 'me' for the avatar. */
type LabelMap = Map<string, HTMLDivElement>
const AVATAR_LABEL_HEIGHT = 2.1

/** Student 3D campus: click the ground to walk, click a building to walk in and open it. */
export default function Campus3D() {
  const { avatar, currentStudent, setRole, studentXP } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [hovered, setHovered] = useState<BuildingId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [entering, setEntering] = useState<BuildingConfig | null>(null)

  // ── Phase 6 Step 3: Arrival ─────────────────────────────────────────────
  const [isArriving, setIsArriving] = useState(() => {
    // Only show arrival when navigated from /create with state.arrival = true
    const state = location.state as { arrival?: boolean } | null
    return Boolean(state?.arrival)
  })

  // ── Phase 6 Step 5: near-door prompt ──────────────────────────────────
  const [nearDoor, setNearDoor] = useState<BuildingConfig | null>(null)

  // ── Phase 6 Step 4 & 5: live avatar tracking (shared refs for minimap + WASD) ──
  const avatarPosRef = useRef<[number, number]>(lastSpot ?? GATE_SPAWN)
  const avatarRotRef = useRef<number>(0)
  // Render-trigger state for minimap (updated every ~16ms via rAF, not every frame)
  const [minimapAvatarPos, setMinimapAvatarPos] = useState<[number, number]>(
    lastSpot ?? GATE_SPAWN,
  )
  const [minimapAvatarRot, setMinimapAvatarRot] = useState(0)

  const labels = useRef<LabelMap>(new Map())
  const labelRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) labels.current.set(key, el)
    else labels.current.delete(key)
  }

  // Detect mobile device to disable postprocessing for 60fps performance
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth < 768 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
  }, [])

  // the campus is a student surface — mirror StudentShell so direct URLs agree
  useEffect(() => setRole('student'), [setRole])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  // Poll avatarPosRef to update minimap (~60fps via rAF)
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
        setToast(`${b.emoji} ${b.name.th} เป็นพื้นที่ของอาจารย์ · Teachers only`)
        return
      }
      // door transition: flood the screen with the building's colour, then go in
      setEntering(b)
      setTimeout(() => navigate(`/campus/${b.id}`), ENTER_DELAY_MS)
    },
    [navigate],
  )

  const level = Math.floor(studentXP / 100) + 1
  const progress = studentXP % 100

  // ── Phase 6 Step 5: Joystick direction for use in scene ────────────────
  const joystickRef = useRef<[number, number] | null>(null)

  // Shared walkTo/walkGround callbacks passed down into the scene
  // These are stored as refs so the scene can call them without re-rendering
  const walkGroundRef = useRef<(x: number, z: number) => void>(() => {})

  return (
    <div className="fixed inset-0 select-none font-campus" style={{ backgroundColor: '#D4B896' }}>
      <Canvas
        shadows="percentage"
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        camera={{ fov: 45, position: [0, 20, 22] }}
      >
        {/* Golden Hour Atmosphere & Sky */}
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

        {/* Ambient & Golden Hour Directional Sunlight */}
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

        {/* Environment with procedural Lightformers for PBR glass & metal reflections */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={3.5}
            color="#FFA84D"
            position={[25, 12, 22]}
            scale={[28, 14, 1]}
            target={[0, 0, 0]}
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            color="#6B95D1"
            position={[-25, 18, -22]}
            scale={[32, 16, 1]}
          />
          <Lightformer
            form="ring"
            intensity={0.9}
            color="#FFF4D6"
            position={[0, 26, 0]}
            scale={[30, 30, 1]}
          />
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
        />

        {/* Postprocessing effects disabled on mobile for buttery smooth 60fps */}
        {!isMobile && (
          <EffectComposer multisampling={4}>
            <Bloom
              luminanceThreshold={0.72}
              luminanceSmoothing={0.3}
              intensity={0.85}
              mipmapBlur
            />
            <N8AO aoRadius={1.5} distanceFalloff={0.2} intensity={1.8} />
            <Vignette offset={0.28} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>

      {/*
        Floating labels are plain DOM moved every frame by CampusScene (projected
        from 3D), not drei <Html> — that dropped a label at random under React 19.
        Hidden until the first frame places them, so nothing flashes at 0,0.
      */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUILDINGS.map((b) => {
          const isHovered = hovered === b.id
          const locked = b.studentSees === null
          return (
            <div key={b.id} ref={labelRef(b.id)} className="absolute left-0 top-0" style={{ visibility: 'hidden' }}>
              <div
                className="whitespace-nowrap rounded-full px-3 py-1 text-center text-sm font-bold text-white shadow-lg transition-transform duration-200"
                style={{
                  backgroundColor: b.color,
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  opacity: locked && !isHovered ? 0.75 : 1,
                }}
              >
                <span className="mr-1">{b.emoji}</span>
                {b.name.th}
                {isHovered && (
                  <span className="block text-[11px] font-semibold opacity-90">
                    {locked ? '🔒 สำหรับอาจารย์' : 'คลิกเพื่อเข้า · Click to enter'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={labelRef('me')} className="absolute left-0 top-0" style={{ visibility: 'hidden' }}>
          <span className="whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-ink shadow">
            {me.nickname}
          </span>
        </div>
      </div>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-black/40 px-4 py-3 text-white backdrop-blur-md border border-white/10 shadow-lg">
          <span className="h-9 w-9 rounded-full border-2 border-white shadow" style={{ backgroundColor: me.color }} />
          <div className="min-w-[9rem]">
            <p className="text-sm font-bold leading-tight">{me.nickname}</p>
            <p className="text-[11px] text-white/80">
              Lv.{level} · {studentXP} XP
            </p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: CAMPUS_PALETTE.path }} />
            </div>
          </div>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <Link
            to="/create"
            className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors shadow"
          >
            <Shirt className="h-4 w-4" /> แต่งตัว
          </Link>
          <Link
            to="/student"
            className="flex items-center gap-1.5 rounded-xl bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors shadow"
          >
            <LayoutGrid className="h-4 w-4" /> หน้าเดิม
          </Link>
        </div>
      </div>

      {/* Bottom HUD: toast + instructions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2">
        {toast && (
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg animate-fadeIn">{toast}</p>
        )}

        {/* Phase 6 Step 5: Door prompt */}
        {nearDoor && !isArriving && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/70 px-5 py-2.5 text-white backdrop-blur-md border border-white/20 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-base">{nearDoor.emoji}</span>
            <span className="text-sm font-bold">
              {nearDoor.name.th}
            </span>
            <span className="hidden sm:inline text-xs text-white/60 mx-1">—</span>
            <span className="hidden sm:inline text-xs text-white/60">
              กด <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-white font-mono">E</kbd> เพื่อเข้า
            </span>
            <button
              onClick={() => arrive(nearDoor)}
              className="ml-2 rounded-full bg-white/20 hover:bg-white/35 px-3 py-1 text-xs font-bold transition-colors border border-white/30 cursor-pointer"
            >
              เข้าอาคาร →
            </button>
          </div>
        )}

        {/* Default walk hint, hidden when near door or arriving */}
        {!nearDoor && !isArriving && (
          <p className="rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/95 backdrop-blur-md border border-white/10 shadow">
            คลิกพื้นเพื่อเดิน · WASD เพื่อเดิน · คลิกอาคารเพื่อเข้า
          </p>
        )}
      </div>

      {/* Phase 6 Step 3: Arrival overlay */}
      {isArriving && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-end pb-24 gap-4">
          {/* Caption */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center gap-1">
            <p className="text-white text-lg font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide">
              กำลังลงสู่แคมปัส…
            </p>
            <p className="text-white/70 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Arriving at SPU Campus
            </p>
          </div>
          {/* Skip button */}
          <button
            className="pointer-events-auto rounded-full bg-black/50 hover:bg-black/70 border border-white/25 px-5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-colors cursor-pointer shadow-lg"
            onClick={() => setIsArriving(false)}
          >
            ข้ามแอนิเมชัน · Skip arrival ↷
          </button>
        </div>
      )}

      {/* Phase 6 Step 4: Minimap (bottom-right) */}
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
        />
      )}

      {/* Phase 6 Step 5: Touch Joystick (bottom-left) */}
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

      {entering && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 text-white animate-in fade-in duration-500"
          style={{ backgroundColor: entering.color }}
        >
          <span className="text-7xl animate-in zoom-in-50 duration-500">{entering.emoji}</span>
          <p className="text-2xl font-bold animate-in slide-in-from-bottom-4 duration-500">{entering.name.th}</p>
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
}

/** True when the segment a→b passes within `r` of point p (all on the ground plane). */
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
}: SceneProps) {
  const { camera, size, scene } = useThree()
  const avatarRef = useRef<Group>(null)
  const markerRef = useRef<Mesh>(null)
  const waypoints = useRef<[number, number][]>([])
  const destination = useRef<BuildingConfig | null>(null)
  const spawn = lastSpot ?? GATE_SPAWN
  const intro = useRef(introPlayed ? 1 : 0)

  // ── Phase 6 Step 3: Arrival animation state ──────────────────────────
  const arrivalT = useRef(0) // 0→1 over ARRIVAL_SECONDS
  const fogT = useRef(isArriving ? 0 : 1)
  const isArrivingRef = useRef(isArriving)
  useEffect(() => {
    isArrivingRef.current = isArriving
    if (!isArriving) {
      // Skip: snap fog & camera immediately
      fogT.current = 1
      arrivalT.current = 1
    }
  }, [isArriving])

  // ── Phase 6 Step 5: keyboard state ─────────────────────────────────
  const keys = useRef<Set<string>>(new Set())
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current.add(e.code)
      // E key is consumed in useFrame where nearDoorRef is checked
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [onArrive])

  // Ref to track nearest door for E-key press
  const nearDoorRef = useRef<BuildingConfig | null>(null)

  // place the camera before the first frame
  useEffect(() => {
    const t = lookTarget(spawn[0], spawn[1], new Vector3())
    if (isArriving) {
      camera.position.copy(ARRIVAL_FROM)
      camera.lookAt(ARRIVAL_LOOK_START)
    } else if (intro.current < 1) {
      camera.position.copy(INTRO_FROM)
      camera.lookAt(new Vector3(PLAZA_CENTER[0], 0, PLAZA_CENTER[1]))
    } else {
      camera.position.copy(t).add(CAMERA_OFFSET)
      camera.lookAt(t)
    }
    introPlayed = true
  }, [camera, spawn, isArriving])

  const walkTo = (target: [number, number], building: BuildingConfig | null) => {
    const a = avatarRef.current
    if (!a) return
    const here: [number, number] = [a.position.x, a.position.z]
    // Detour through the plaza when the straight line would clip another building.
    const blocked = BUILDINGS.some(
      (b) => b.id !== building?.id && passesNear(here, target, b.position, 3.2),
    )
    if (blocked) {
      const ang = Math.atan2(target[0] - PLAZA_CENTER[0], target[1] - PLAZA_CENTER[1])
      waypoints.current = [[PLAZA_CENTER[0] + Math.sin(ang) * 3.6, PLAZA_CENTER[1] + Math.cos(ang) * 3.6], target]
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

  // Expose walkGround to parent for minimap tap-to-walk
  useEffect(() => {
    walkGroundRef.current = walkGround
  })

  const look = new Vector3()
  const follow = new Vector3()
  const lookAt = new Vector3()
  const proj = new Vector3()
  /** Pin a DOM label over a world point; hide it when the point is behind the camera. */
  const place = (key: string, x: number, y: number, z: number) => {
    const el = labels.current.get(key)
    if (!el) return
    proj.set(x, y, z).project(camera)
    const px = ((proj.x + 1) / 2) * size.width
    const py = ((1 - proj.y) / 2) * size.height
    el.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%)`
    el.style.visibility = proj.z < 1 ? 'visible' : 'hidden'
  }

  useFrame((state, dt) => {
    const a = avatarRef.current
    if (!a) return

    // ── Phase 6 Step 3: Arrival animation ────────────────────────────
    if (isArrivingRef.current) {
      arrivalT.current = Math.min(1, arrivalT.current + dt / ARRIVAL_SECONDS)
      const e = 1 - Math.pow(1 - arrivalT.current, 3)

      // Camera: lerp from ARRIVAL_FROM toward follow position
      const followTarget = lookTarget(a.position.x, a.position.z, look)
      const destCam = followTarget.clone().add(CAMERA_OFFSET)
      camera.position.lerpVectors(ARRIVAL_FROM, destCam, e)
      // Look target: lerp from the train line down to the avatar
      const camLookAt = ARRIVAL_LOOK_START.clone().lerp(followTarget, e)
      camera.lookAt(camLookAt)

      // Fog: lerp from dense to clear
      fogT.current = Math.min(1, fogT.current + dt / ARRIVAL_SECONDS)
      if (scene.fog instanceof Fog) {
        scene.fog.near = MathUtils.lerp(FOG_NEAR_ARRIVAL, FOG_NEAR_CLEAR, fogT.current)
        scene.fog.far = MathUtils.lerp(FOG_FAR_ARRIVAL, FOG_FAR_CLEAR, fogT.current)
      }

      if (arrivalT.current >= 1) {
        onArrivalDone()
      }

      // Labels still get updated even during arrival
      for (const b of BUILDINGS) place(b.id, b.position[0], labelHeight(b.shape), b.position[1])
      place('me', a.position.x, a.position.y + AVATAR_LABEL_HEIGHT, a.position.z)
      return
    }

    // ── Phase 6 Step 5: WASD + Joystick movement ─────────────────────
    const k = keys.current
    let vx = 0
    let vz = 0

    if (k.has('KeyW') || k.has('ArrowUp')) vz -= 1
    if (k.has('KeyS') || k.has('ArrowDown')) vz += 1
    if (k.has('KeyA') || k.has('ArrowLeft')) vx -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) vx += 1

    // Joystick overrides/adds to keyboard
    const joy = joystickRef.current
    if (joy) {
      vx += joy[0]
      vz += joy[1]
    }

    let moving = false

    if (vx !== 0 || vz !== 0) {
      // Direct velocity movement — clear waypoints
      waypoints.current = []
      destination.current = null
      if (markerRef.current) markerRef.current.visible = false

      // Normalize diagonal movement
      const mag = Math.hypot(vx, vz)
      const nx = vx / mag
      const nz = vz / mag

      const step = WALK_SPEED * dt
      const newX = a.position.x + nx * step
      const newZ = a.position.z + nz * step

      // Clamp to campus radius
      const dist = Math.hypot(newX, newZ)
      const clamp = dist > CAMPUS_RADIUS ? CAMPUS_RADIUS / dist : 1
      a.position.x = newX * clamp
      a.position.z = newZ * clamp

      // Face direction of travel
      const want = Math.atan2(nx, nz)
      const diff = Math.atan2(Math.sin(want - a.rotation.y), Math.cos(want - a.rotation.y))
      a.rotation.y += diff * Math.min(1, dt * 12)

      moving = true
    } else {
      // Waypoint movement (click/tap)
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
        // turn smoothly toward the direction of travel
        const want = Math.atan2(next[0] - a.position.x, next[1] - a.position.z)
        const diff = Math.atan2(Math.sin(want - a.rotation.y), Math.cos(want - a.rotation.y))
        a.rotation.y += diff * Math.min(1, dt * 12)
      }
    }

    // hop while walking
    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.12 : 0
    a.position.y = MathUtils.damp(a.position.y, hop, 20, dt)

    const m = markerRef.current
    if (m?.visible) m.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.12)

    // ── Phase 6 Step 4: Update avatar position refs for minimap ──────
    avatarPosRef.current = [a.position.x, a.position.z]
    avatarRotRef.current = a.rotation.y

    // ── Phase 6 Step 5: Door proximity check ─────────────────────────
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

    // E key: enter door when near
    if (k.has('KeyE') && nearDoorRef.current) {
      k.delete('KeyE') // consume the keypress
      onArrive(nearDoorRef.current)
    }

    // Normal camera follow
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

    // labels last, so they use this frame's camera
    for (const b of BUILDINGS) place(b.id, b.position[0], labelHeight(b.shape), b.position[1])
    place('me', a.position.x, a.position.y + AVATAR_LABEL_HEIGHT, a.position.z)
  })

  return (
    <>
      <Ground onWalk={walkGround} />

      {/* Context towers for real SPU campus buildings 2, 3, 4, 7, 8, 10, 12 */}
      <ContextBuildings />

      {/* The 6 interactive demo buildings */}
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

      <group ref={avatarRef} position={[spawn[0], 0, spawn[1]]} rotation={[0, facingPlaza(spawn), 0]}>
        <Avatar3D color={me.color} hat={me.hat} />
      </group>
    </>
  )
}
