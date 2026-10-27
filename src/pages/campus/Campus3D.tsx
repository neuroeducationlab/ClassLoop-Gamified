import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing'
import { MathUtils, Vector3, type Group, type Mesh } from 'three'
import { Shirt, LayoutGrid } from 'lucide-react'
import { useApp, type Avatar } from '@/context/AppContext'
import { BUILDINGS, CAMPUS_PALETTE, PLAZA_CENTER, type Building as BuildingConfig, type BuildingId } from '@/data/buildings'
import Avatar3D from './components/Avatar3D'
import Building from './components/Building'
import ContextBuildings from './components/ContextBuildings'
import { doorPoint, facingPlaza, labelHeight } from './geometry'
import Ground, { CAMPUS_RADIUS } from './components/Ground'
import { isLowPower } from './lowPower'

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
  const [hovered, setHovered] = useState<BuildingId | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [entering, setEntering] = useState<BuildingConfig | null>(null)
  const labels = useRef<LabelMap>(new Map())
  const labelRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) labels.current.set(key, el)
    else labels.current.delete(key)
  }

  // Phones, small screens and GPU-less machines skip postprocessing (see lowPower.ts; ?hq / ?lite override)
  const isMobile = useMemo(isLowPower, [])

  // the campus is a student surface — mirror StudentShell so direct URLs agree
  useEffect(() => setRole('student'), [setRole])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])
  useEffect(() => () => void (document.body.style.cursor = ''), [])

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
        <fog attach="fog" args={['#ECCDA5', 48, 90]} />

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

        <CampusScene me={me} hovered={hovered} onHover={setHovered} onArrive={arrive} labels={labels} />

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

      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2">
        {toast && (
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg animate-fadeIn">{toast}</p>
        )}
        <p className="rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/95 backdrop-blur-md border border-white/10 shadow">
          คลิกพื้นเพื่อเดิน · คลิกอาคารเพื่อเข้า — Click to walk, click a building to enter
        </p>
      </div>

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
}

/** True when the segment a→b passes within `r` of point p (all on the ground plane). */
function passesNear(a: [number, number], b: [number, number], p: [number, number], r: number) {
  const [dx, dz] = [b[0] - a[0], b[1] - a[1]]
  const len2 = dx * dx + dz * dz || 1
  const t = MathUtils.clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / len2, 0, 1)
  return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1]) < r
}

function CampusScene({ me, hovered, onHover, onArrive, labels }: SceneProps) {
  const { camera, size } = useThree()
  const avatarRef = useRef<Group>(null)
  const markerRef = useRef<Mesh>(null)
  const waypoints = useRef<[number, number][]>([])
  const destination = useRef<BuildingConfig | null>(null)
  const spawn = lastSpot ?? GATE_SPAWN
  const intro = useRef(introPlayed ? 1 : 0)

  // place the camera before the first frame: high up for the intro, else already following
  useEffect(() => {
    const t = lookTarget(spawn[0], spawn[1], new Vector3())
    if (intro.current < 1) camera.position.copy(INTRO_FROM)
    else camera.position.copy(t).add(CAMERA_OFFSET)
    camera.lookAt(intro.current < 1 ? new Vector3(PLAZA_CENTER[0], 0, PLAZA_CENTER[1]) : t)
    introPlayed = true
  }, [camera, spawn])

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
    const next = waypoints.current[0]
    let moving = false
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
      // turn smoothly toward the direction of travel (shortest way round)
      const want = Math.atan2(dx, dz)
      const diff = Math.atan2(Math.sin(want - a.rotation.y), Math.cos(want - a.rotation.y))
      a.rotation.y += diff * Math.min(1, dt * 12)
    }
    // little hop while walking, settle when stopped
    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.12 : 0
    a.position.y = MathUtils.damp(a.position.y, hop, 20, dt)

    const m = markerRef.current
    if (m?.visible) m.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.12)

    lookTarget(a.position.x, a.position.z, look)
    if (intro.current < 1) {
      // intro swoop: ease from the overview shot into the follow position
      intro.current = Math.min(1, intro.current + dt / INTRO_SECONDS)
      const e = 1 - Math.pow(1 - intro.current, 3)
      follow.copy(look).add(CAMERA_OFFSET)
      camera.position.lerpVectors(INTRO_FROM, follow, e)
      lookAt.set(PLAZA_CENTER[0], 0, PLAZA_CENTER[1]).lerp(look, e)
      camera.lookAt(lookAt)
    } else {
      // camera follows with a soft lag
      const k = 1 - Math.exp(-3 * dt)
      camera.position.x += (look.x + CAMERA_OFFSET.x - camera.position.x) * k
      camera.position.y += (look.y + CAMERA_OFFSET.y - camera.position.y) * k
      camera.position.z += (look.z + CAMERA_OFFSET.z - camera.position.z) * k
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
