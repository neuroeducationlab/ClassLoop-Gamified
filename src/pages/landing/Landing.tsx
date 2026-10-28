import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, Vignette } from '@react-three/postprocessing'
import { MathUtils, Vector3, type Group, type Mesh, type MeshBasicMaterial, type PerspectiveCamera } from 'three'
import { ArrowLeft, ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react'
import { DEMO_ACCOUNTS, useApp, type Role } from '@/context/AppContext'
import { BUILDINGS, PLAZA_CENTER } from '@/data/buildings'
import Building from '@/pages/campus/components/Building'
import ContextBuildings from '@/pages/campus/components/ContextBuildings'
import Ground from '@/pages/campus/components/Ground'
import { HolographicSPULogo, MovingTraffic } from '@/pages/campus/components/SPUUniverse'
import { smootherstep, smoothstep } from '@/pages/campus/ease'
import { landingSpot } from '@/pages/campus/geometry'
import { isLowPower } from '@/pages/campus/lowPower'
import CloudLayer, { CLOUD_BOTTOM, CLOUD_TOP } from './CloudLayer'

/** Seconds before the first tower rises, and between towers. */
const RISE_START = 0.5
const RISE_STEP = 0.32
const RISE_SECONDS = 1.1
/** Title fades in once the skyline has finished rising. */
const TITLE_DELAY_MS = (RISE_START + RISE_STEP * BUILDINGS.length + 0.4) * 1000
/** Start → glide up to the cloud tops (role cards appear) → dive through the clouds. */
const APPROACH_SECONDS = 3
const RETURN_SECONDS = 1.8
const DIVE_SECONDS = 3.4
/** The dive's last moment fades to cloud-white; Campus3D fades back out of the same colour. */
const FADE_OUT_SECONDS = 0.45
const VEIL_COLOR = '#F3EEE6'

const ORBIT_RADIUS = 42
const ORBIT_HEIGHT = 24
const ORBIT_SPEED = 0.045 // radians / second — slow, cinematic
const ORBIT_FOV = 42
/** Hover spot for the role cards: clear above the cloud tops (the deck reaches ~21.5),
 *  half-way in, so the deck reads as clouds below instead of a puff across the lens. */
const CLOUD_RADIUS = 26
const CLOUD_HEIGHT = 23
/** Campus3D's first-person camera, which the dive ends exactly on. */
const FP_EYE_HEIGHT = 1.65
const FP_FOV = 75
const GATE = BUILDINGS.find((b) => b.id === 'entry')!
const GATE_ANGLE = Math.atan2(GATE.position[0] - PLAZA_CENTER[0], GATE.position[1] - PLAZA_CENTER[1])

const noop = () => {}

/** orbit → (Start) approach half-way → choose a role → dive into the campus. */
type Phase = 'orbit' | 'approach' | 'choose' | 'signin' | 'dive'


/** easeOutBack: overshoots a little, so towers "land" with a bounce. */
function easeOutBack(t: number) {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/**
 * Grows its children up out of the ground after `delay` seconds. Wraps the
 * campus components from outside so they need no landing-page-only props.
 */
function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  const ref = useRef<Group>(null)
  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = MathUtils.clamp((state.clock.elapsedTime - delay) / RISE_SECONDS, 0, 1)
    g.visible = t > 0
    g.scale.y = t === 0 ? 0.001 : easeOutBack(t)
  })
  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  )
}

/** A ring of light that sweeps outward from the plaza as each tower lands. */
function LightSweep({ delay }: { delay: number }) {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    const m = ref.current
    if (!m) return
    const t = (state.clock.elapsedTime - delay) / 1.8
    m.visible = t > 0 && t < 1
    m.scale.setScalar(1 + t * 26)
    ;(m.material as MeshBasicMaterial).opacity = 0.75 * (1 - t)
  })
  return (
    <mesh ref={ref} position={[PLAZA_CENTER[0], 0.08, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.9, 1, 64]} />
      <meshBasicMaterial color="#FFE3A8" transparent opacity={0} toneMapped={false} />
    </mesh>
  )
}

/** Cylindrical camera position around the plaza: angle, radius, height. */
type Cyl = { a: number; r: number; y: number }

const wrapAngle = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2))

function cylOf(v: Vector3): Cyl {
  const dx = v.x - PLAZA_CENTER[0]
  const dz = v.z - PLAZA_CENTER[1]
  return { a: Math.atan2(dx, dz), r: Math.hypot(dx, dz), y: v.y }
}

/**
 * Opacity of the white veil while the camera is inside the cloud band (a soft bump,
 * never a flash). The falloff spans the whole band, so the veil is already rising
 * where the first puffs reach the lens and peaks in the middle of the deck.
 */
function cloudVeil(y: number) {
  const mid = (CLOUD_BOTTOM + CLOUD_TOP) / 2
  const k = MathUtils.clamp((y - mid) / ((CLOUD_TOP - CLOUD_BOTTOM) / 2), -1, 1)
  return 0.7 * Math.cos((k * Math.PI) / 2) ** 2
}

/**
 * Every move is one continuous, eased glide around the plaza, so the campus stays
 * centred and nothing whips past:
 * - orbit: slow circle (and Back glides into it from wherever the camera is);
 * - approach: glide half-way in, up to the cloud tops above MRT Exit 2, and hover;
 * - dive: down through the clouds to the first-person eye pose Campus3D starts at,
 *   widening the FOV to Campus3D's, then fade to cloud-white for the hand-off.
 */
function CameraRig({
  phase,
  veil,
  onApproached,
  onDived,
}: {
  phase: Phase
  veil: RefObject<HTMLDivElement | null>
  onApproached: () => void
  onDived: () => void
}) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const plaza = useMemo(() => new Vector3(PLAZA_CENTER[0], 2, PLAZA_CENTER[1]), [])
  /**
   * What the camera looks at once it is up at the cloud tops. Aiming at the plaza
   * floor from up there pitches the camera ~43 degrees down, which puts the whole
   * cloud deck above the top of frame; this raised target keeps the campus in the
   * lower half and the clouds and horizon in view.
   */
  const hoverLook = useMemo(() => new Vector3(PLAZA_CENTER[0], 11, PLAZA_CENTER[1]), [])
  const end = useMemo(() => {
    const [x, z] = landingSpot()
    const dx = PLAZA_CENTER[0] - x
    const dz = PLAZA_CENTER[1] - z
    const len = Math.hypot(dx, dz)
    // first-person gaze: level, toward the plaza (Campus3D's initial heading)
    return { cyl: cylOf(new Vector3(x, FP_EYE_HEIGHT, z)), ahead: new Vector3(x + (dx / len) * 10, FP_EYE_HEIGHT, z + (dz / len) * 10) }
  }, [])
  const move = useRef<{ phase: 'orbit' | 'approach' | 'dive'; t: number; from: Cyl; da: number; fov: number } | null>(null)
  const orbitAngle = useRef(0.6)
  const notified = useRef(false)
  const look = useMemo(() => new Vector3(), [])
  const c = useMemo<Cyl>(() => ({ a: 0, r: 0, y: 0 }), [])

  useFrame((state, dt) => {
    // the signin card hovers above the role cards: the camera stays at the cloud tops
    const kind = phase === 'choose' || phase === 'signin' ? 'approach' : phase
    if (move.current?.phase !== kind) {
      // a new phase glides on from wherever the camera is now (the very first orbit starts in place)
      const from = move.current ? cylOf(camera.position) : { a: orbitAngle.current, r: ORBIT_RADIUS, y: ORBIT_HEIGHT }
      let da = 0
      if (kind === 'orbit') orbitAngle.current = from.a
      // hover a little to the camera's side of the gate: a 3/4 view over Exit 2 toward the plaza
      if (kind === 'approach') da = wrapAngle(GATE_ANGLE + (Math.sign(wrapAngle(from.a - GATE_ANGLE)) || 1) * 0.6 - from.a)
      if (kind === 'dive') da = wrapAngle(end.cyl.a - from.a)
      move.current = { phase: kind, t: move.current ? 0 : 1, from, da, fov: camera.fov }
      notified.current = false
    }
    const m = move.current
    let fov = m.fov
    let fade = 0

    if (kind === 'orbit') {
      m.t = Math.min(1, m.t + dt / RETURN_SECONDS)
      orbitAngle.current += dt * ORBIT_SPEED
      const e = smootherstep(m.t)
      c.a = MathUtils.lerp(m.from.a, orbitAngle.current, e)
      c.r = MathUtils.lerp(m.from.r, ORBIT_RADIUS, e)
      c.y = MathUtils.lerp(m.from.y, ORBIT_HEIGHT, e)
      fov = MathUtils.lerp(m.fov, ORBIT_FOV, e)
      // on the first orbit e is already 1, so this is simply the plaza
      look.copy(hoverLook).lerp(plaza, e)
    } else if (kind === 'approach') {
      m.t = Math.min(1, m.t + dt / APPROACH_SECONDS)
      const e = smootherstep(m.t)
      c.a = m.from.a + m.da * e
      c.r = MathUtils.lerp(m.from.r, CLOUD_RADIUS, e)
      // a gentle hover while the role cards are up, so the scene never freezes
      c.y = MathUtils.lerp(m.from.y, CLOUD_HEIGHT, e) + Math.sin(state.clock.elapsedTime * 0.6) * 0.15 * e
      look.copy(plaza).lerp(hoverLook, e)
      // cards start fading in as the glide settles
      if (m.t >= 0.85 && !notified.current) {
        notified.current = true
        onApproached()
      }
    } else {
      m.t = Math.min(1, m.t + dt / DIVE_SECONDS)
      const u = smootherstep(m.t)
      // the swing round the plaza finishes early, while the camera is still high above the gate
      c.a = m.from.a + m.da * (1 - (1 - u) ** 2)
      c.r = MathUtils.lerp(m.from.r, end.cyl.r, u)
      c.y = MathUtils.lerp(m.from.y, FP_EYE_HEIGHT, u)
      // one continuous sweep: starts where the hover left the gaze, leads the descent
      // down and levels out on the first-person eyeline for touchdown
      look.copy(hoverLook).lerp(end.ahead, smoothstep(u))
      fov = MathUtils.lerp(m.fov, FP_FOV, u)
      fade = smoothstep(MathUtils.clamp((m.t - 1) * (DIVE_SECONDS / FADE_OUT_SECONDS) + 1, 0, 1))
      if (m.t >= 1 && !notified.current) {
        notified.current = true
        onDived()
      }
    }

    camera.position.set(PLAZA_CENTER[0] + Math.sin(c.a) * c.r, c.y, PLAZA_CENTER[1] + Math.cos(c.a) * c.r)
    camera.lookAt(look)
    if (Math.abs(camera.fov - fov) > 1e-3) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    // the deck is hidden during the orbit, so its veil must be too (it was washing
    // the opening title shot with a faint 0.017)
    const mist = phase === 'orbit' ? 0 : cloudVeil(c.y)
    if (veil.current) veil.current.style.opacity = String(Math.max(mist, fade))
  })
  return null
}

const ROLE_CARDS: { role: Role; icon: typeof GraduationCap; title: string; blurb: string; accent: string }[] = [
  {
    role: 'student',
    icon: GraduationCap,
    title: 'Student',
    blurb: 'Explore the 3D campus, complete learning missions, earn XP, and climb the leaderboard.',
    accent: 'from-[#7C9BE8] to-[#4FB0A5]',
  },
  {
    role: 'teacher',
    icon: BookOpen,
    title: 'Faculty / Professor',
    blurb: 'View live class analytics, student engagement metrics, and design AI-powered lessons.',
    accent: 'from-[#E89BC4] to-[#F2994A]',
  },
]

/** Grand opening page at `/`: the campus builds itself at golden hour, then Start dives into Exit 2 → login. */
export default function Landing() {
  const navigate = useNavigate()
  const { signIn } = useApp()
  const [lowPower] = useState(isLowPower)
  const [showTitle, setShowTitle] = useState(false)
  const [phase, setPhase] = useState<Phase>('orbit')
  const veil = useRef<HTMLDivElement>(null)
  const diving = phase === 'dive'

  const start = () => {
    // fetch the campus while the camera glides, so the hand-off after the dive is instant
    void import('@/pages/campus/Campus3D')
    setPhase('approach')
  }

  /** Role picked: show the demo credentials card. The actual sign-in happens on Sign in. */
  const [picked, setPicked] = useState<Role | null>(null)
  const chooseRole = (role: Role) => {
    setPicked(role)
    setPhase('signin')
  }
  const signInAndDive = () => {
    if (!picked) return
    const account = DEMO_ACCOUNTS.find((a) => a.role === picked)
    if (!account || !signIn(account.email, account.password).ok) return
    setPhase('dive')
  }

  // Esc on the role cards goes back to the title
  useEffect(() => {
    if (phase !== 'choose') return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPhase('orbit')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  useEffect(() => {
    const id = setTimeout(() => setShowTitle(true), TITLE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    // Sky is a vibrant crisp daytime university azure gradient matching the cumulus clouds
    <div className="fixed inset-0 select-none overflow-hidden bg-gradient-to-b from-[#1D4ED8] via-[#3B82F6] via-45% to-[#BAE6FD] font-campus">
      <Canvas shadows="percentage" dpr={lowPower ? [1, 1.25] : [1, 1.75]} camera={{ fov: 42, position: [0, ORBIT_HEIGHT, ORBIT_RADIUS] }}>
        <fog attach="fog" args={['#BAE6FD', 85, 220]} />
        <hemisphereLight args={['#FFFFFF', '#384B66', 1.4]} />
        <directionalLight
          position={[20, 28, 16]}
          intensity={2.6}
          color="#FFFFFF"
          castShadow
          shadow-mapSize={lowPower ? [512, 512] : [1024, 1024]}
          shadow-camera-left={-42}
          shadow-camera-right={42}
          shadow-camera-top={42}
          shadow-camera-bottom={-42}
        />
        <Environment resolution={lowPower ? 64 : 256}>
          <Lightformer form="rect" intensity={2.8} color="#93C5FD" position={[25, 14, 22]} scale={[28, 14, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.2} color="#60A5FA" position={[-25, 18, -22]} scale={[32, 16, 1]} />
          <Lightformer form="ring" intensity={1.0} color="#FFFFFF" position={[0, 28, 0]} scale={[32, 32, 1]} />
        </Environment>

        <Ground onWalk={noop} />
        <MovingTraffic />
        <Rise delay={RISE_START - 0.3}>
          <ContextBuildings />
        </Rise>
        {BUILDINGS.map((b, i) => (
          <group key={b.id}>
            <Rise delay={RISE_START + i * RISE_STEP}>
              <Building building={b} hovered={false} onHover={noop} onSelect={noop} />
            </Rise>
            <LightSweep delay={RISE_START + i * RISE_STEP + 0.6} />
          </group>
        ))}
        {/* the ClassLoop hologram lands last — the brand is the climax of the build-up */}
        <Rise delay={RISE_START + RISE_STEP * BUILDINGS.length + 0.2}>
          <HolographicSPULogo position={[PLAZA_CENTER[0], 2.8, PLAZA_CENTER[1]]} />
        </Rise>

        <CloudLayer shown={phase !== 'orbit'} />

        <CameraRig
          phase={phase}
          veil={veil}
          onApproached={() => setPhase('choose')}
          // the dive already ends on Campus3D's first-person pose: no arrival sequence there
          onDived={() => navigate('/campus', { state: { fromLanding: true } })}
        />

        {!lowPower && (
          <EffectComposer multisampling={4}>
            <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.3} intensity={0.8} mipmapBlur />
            <N8AO aoRadius={1.5} distanceFalloff={0.2} intensity={1.4} />
            <Vignette offset={0.35} darkness={0.25} />
          </EffectComposer>
        )}
      </Canvas>

      {/* Gentle top gradient so title and copy read clearly without muddying the horizon.
          Only for the title: up at the clouds it would dim the white deck to grey (the role
          cards carry their own dark backing). */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 transition-opacity duration-1000 ${
          phase === 'orbit' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* white mist while flying through the cloud band, and the final fade (opacity set per frame by CameraRig) */}
      <div ref={veil} className="pointer-events-none absolute inset-0" style={{ background: VEIL_COLOR, opacity: 0 }} />

      <div
        className={`absolute inset-0 isolate flex flex-col items-center justify-center gap-5 px-6 text-center text-white transition-opacity duration-700 ${
          showTitle && phase === 'orbit' ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* soft dark halo so the copy stays legible over the towers */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[min(760px,120vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(20,18,40,0.55),transparent_70%)]" />
        <p className="rounded-full border border-white/40 bg-white/10 px-5 py-1 text-xs font-semibold tracking-[0.25em] backdrop-blur">
          Analyse &nbsp;·&nbsp; Learn &nbsp;·&nbsp; Connect
        </p>
        <h1 className="text-5xl font-bold leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
          ClassLoop <span className="text-[#F2C879]">Campus</span>
        </h1>
        <p className="max-w-xl text-base text-white/90 drop-shadow sm:text-lg font-medium">
          Learning Management System & Educational Gamification
        </p>
        <button
          onClick={start}
          className="group mt-3 flex items-center justify-center rounded-full bg-gradient-to-r from-[#F7E3B4] to-[#F2C879] px-12 py-3.5 text-lg font-extrabold tracking-wider text-[#2B2D55] shadow-[0_0_40px_rgba(242,200,121,0.65)] transition-all hover:scale-[1.05] active:scale-95 cursor-pointer"
        >
          ENTER
        </button>
      </div>

      <p
        className={`pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs tracking-wide text-white/85 transition-opacity duration-700 ${
          showTitle && phase === 'orbit' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ClassLoop Campus · SPU Edition — The Winner from LearnHackathon
      </p>

      {/* role cards: always mounted, faded with a transition (a keyframe animation can stall on a busy GPU) */}
      {(
        <div
          inert={phase !== 'choose'}
          className={`absolute inset-0 isolate flex flex-col items-center justify-center gap-6 px-5 text-white transition-all duration-700 ${
            phase === 'choose' ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[min(900px,130vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,18,40,0.6),transparent_70%)]" />
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#7FE3FF]">CLASSLOOP CAMPUS</p>
            <h2 className="mt-1 text-3xl font-bold drop-shadow sm:text-4xl">Select Your Role</h2>
          </div>
          <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
            {ROLE_CARDS.map(({ role, icon: Icon, title, blurb, accent }) => (
              <button
                key={role}
                onClick={() => chooseRole(role)}
                className="group flex items-center gap-4 rounded-3xl border border-white/25 bg-[#16182E]/70 p-5 text-left shadow-2xl backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/50 hover:bg-[#16182E]/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F2C879]/70 sm:flex-col sm:items-start sm:p-6"
              >
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </span>
                <span>
                  <span className="block text-xl font-bold text-white">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm text-white/75">{blurb}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => setPhase('orbit')} className="flex items-center gap-1.5 text-white/80 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={() => navigate('/login')} className="text-white/80 underline-offset-4 hover:text-white hover:underline">
              Sign in with email
            </button>
          </div>
        </div>
      )}

      {diving && (
        <p className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center animate-in fade-in duration-500">
          <span className="rounded-full bg-[#16182E]/45 px-4 py-1.5 text-sm text-white backdrop-blur">Descending to BTS SPU Station Exit 2…</span>
        </p>
      )}

      {/* Demo sign-in card: the viewer sees who they'd log in as, confirms, then the dive starts */}
      {phase === 'signin' && picked && <SignInCard role={picked} onConfirm={signInAndDive} onBack={() => { setPicked(null); setPhase('choose') }} />}
    </div>
  )
}

function SignInCard({ role, onConfirm, onBack }: { role: Role; onConfirm: () => void; onBack: () => void }) {
  const account = DEMO_ACCOUNTS.find((a) => a.role === role)!
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack, onConfirm])
  return (
    <div
      className="absolute inset-0 isolate flex items-center justify-center px-5 text-white animate-in fade-in duration-300"
      // click outside the card goes back to role picking
      onMouseDown={(e) => e.target === e.currentTarget && onBack()}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[560px] w-[min(900px,130vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,18,40,0.75),transparent_70%)]" />
      <form
        onSubmit={(e) => { e.preventDefault(); onConfirm() }}
        className="w-full max-w-md rounded-3xl border border-white/25 bg-[#16182E]/90 p-6 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#7FE3FF]">SIGN IN · เข้าสู่ระบบ</p>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-white/70">DEMO</span>
        </div>
        <h3 className="mt-1 text-2xl font-bold">
          {role === 'student' ? 'Student' : 'Faculty'} <span className="text-white/40 text-base font-medium">· {account.name}</span>
        </h3>
        <p className="mt-1 text-[11px] text-white/55">Credentials are pre-filled so anyone can sign in. Click Sign in when ready.</p>

        <label className="mt-4 block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Email</span>
          <input
            type="email"
            readOnly
            value={account.email}
            onFocus={(e) => e.target.select()}
            className="w-full cursor-text select-all rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-[#7FE3FF]/60 focus:bg-white/[0.1]"
          />
        </label>
        <label className="mt-2.5 block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/50">Password</span>
          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 transition focus-within:border-[#7FE3FF]/60 focus-within:bg-white/[0.1]">
            <input
              type={show ? 'text' : 'password'}
              readOnly
              value={account.password}
              className="w-full cursor-text select-all bg-transparent font-mono text-sm tracking-widest text-white outline-none"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70 hover:bg-white/20">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button
          type="submit"
          autoFocus
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F7E3B4] to-[#F2C879] px-6 py-3 text-base font-bold text-[#2B2D55] shadow-[0_0_30px_rgba(242,200,121,0.55)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          Sign in · ลงชื่อเข้าใช้
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        <button type="button" onClick={onBack} className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-white/70 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back · เลือกบทบาทใหม่
        </button>
      </form>
    </div>
  )
}
