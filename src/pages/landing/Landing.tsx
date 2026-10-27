import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, Vignette } from '@react-three/postprocessing'
import { MathUtils, Vector3, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { ArrowUpRight } from 'lucide-react'
import { BUILDINGS, PLAZA_CENTER } from '@/data/buildings'
import Building from '@/pages/campus/components/Building'
import ContextBuildings from '@/pages/campus/components/ContextBuildings'
import Ground from '@/pages/campus/components/Ground'
import Hologram from '@/pages/campus/components/Hologram'
import LightTrails from '@/pages/campus/components/LightTrails'
import { isLowPower } from '@/pages/campus/lowPower'

/** Seconds before the first tower rises, and between towers. */
const RISE_START = 0.5
const RISE_STEP = 0.32
const RISE_SECONDS = 1.1
/** Title fades in once the skyline has finished rising. */
const TITLE_DELAY_MS = (RISE_START + RISE_STEP * BUILDINGS.length + 0.4) * 1000
const DIVE_SECONDS = 1.6

const ORBIT_RADIUS = 36
const ORBIT_HEIGHT = 21
const ORBIT_SPEED = 0.045 // radians / second — slow, cinematic
const GATE = BUILDINGS.find((b) => b.id === 'entry')!

const noop = () => {}

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

/** Slow orbit around the campus; on `diving`, swoops down to MRT Exit 2. */
function CameraRig({ diving, onDived }: { diving: boolean; onDived: () => void }) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(PLAZA_CENTER[0], 2, PLAZA_CENTER[1]), [])
  const angle = useRef(0.6)
  const dive = useRef<{ t: number; from: Vector3 } | null>(null)
  const done = useRef(false)
  const gate = useMemo(() => new Vector3(GATE.position[0] + 5, 3, GATE.position[1] + 5), [])
  const gateLook = useMemo(() => new Vector3(GATE.position[0], 1.5, GATE.position[1]), [])
  const look = useMemo(() => new Vector3(), [])

  useFrame((_, dt) => {
    if (diving) {
      dive.current ??= { t: 0, from: camera.position.clone() }
      const d = dive.current
      d.t = Math.min(1, d.t + dt / DIVE_SECONDS)
      const e = d.t * d.t * (3 - 2 * d.t) // smoothstep
      camera.position.lerpVectors(d.from, gate, e)
      look.copy(target).lerp(gateLook, e)
      camera.lookAt(look)
      if (d.t >= 1 && !done.current) {
        done.current = true
        onDived()
      }
      return
    }
    angle.current += dt * ORBIT_SPEED
    camera.position.set(
      PLAZA_CENTER[0] + Math.sin(angle.current) * ORBIT_RADIUS,
      ORBIT_HEIGHT,
      PLAZA_CENTER[1] + Math.cos(angle.current) * ORBIT_RADIUS,
    )
    camera.lookAt(target)
  })
  return null
}

/** Grand opening page at `/`: the campus builds itself at golden hour, then Start dives into Exit 2 → login. */
export default function Landing() {
  const navigate = useNavigate()
  const [lowPower] = useState(isLowPower)
  const [showTitle, setShowTitle] = useState(false)
  const [diving, setDiving] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setShowTitle(true), TITLE_DELAY_MS)
    return () => clearTimeout(id)
  }, [])

  return (
    // Sky is a CSS golden-hour gradient behind a transparent canvas: the brief's dusk
    // indigo fading through data-orange to a peach horizon, identical on every device.
    <div className="fixed inset-0 select-none overflow-hidden bg-gradient-to-b from-[#3A3D7A] via-[#C9708A] via-45% to-[#F5B98A] font-campus">
      <Canvas shadows="percentage" dpr={lowPower ? [1, 1.25] : [1, 1.75]} camera={{ fov: 42, position: [0, ORBIT_HEIGHT, ORBIT_RADIUS] }}>
        <fog attach="fog" args={['#F5B98A', 60, 120]} />
        <hemisphereLight args={['#FFF2DF', '#4C586B', 1.2]} />
        <directionalLight
          position={[18, 22, 14]}
          intensity={2.2}
          color="#FFD6A4"
          castShadow
          shadow-mapSize={lowPower ? [512, 512] : [1024, 1024]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <Environment resolution={lowPower ? 64 : 256}>
          <Lightformer form="rect" intensity={3.5} color="#FFA84D" position={[25, 12, 22]} scale={[28, 14, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.2} color="#6B95D1" position={[-25, 18, -22]} scale={[32, 16, 1]} />
          <Lightformer form="ring" intensity={0.9} color="#FFF4D6" position={[0, 26, 0]} scale={[30, 30, 1]} />
        </Environment>

        <Ground onWalk={noop} />
        <LightTrails />
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
          <Hologram position={[PLAZA_CENTER[0], 13, PLAZA_CENTER[1]]} scale={2.2} />
        </Rise>

        <CameraRig diving={diving} onDived={() => navigate('/login')} />

        {!lowPower && (
          <EffectComposer multisampling={4}>
            <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.3} intensity={0.95} mipmapBlur />
            <N8AO aoRadius={1.5} distanceFalloff={0.2} intensity={1.6} />
            <Vignette offset={0.28} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>

      {/* soft top/bottom shading so the title reads over any part of the scene */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />

      <div
        className={`absolute inset-0 isolate flex flex-col items-center justify-center gap-5 px-6 text-center text-white transition-opacity duration-700 ${
          showTitle && !diving ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* soft dark halo so the copy stays legible over the towers */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[min(760px,120vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(20,18,40,0.55),transparent_70%)]" />
        <p className="rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] backdrop-blur">
          CLASSLOOP · 3D LEARNING CAMPUS
        </p>
        <h1 className="text-5xl font-bold leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:text-7xl">
          ClassLoop <span className="text-[#F2C879]">Campus</span>
        </h1>
        <p className="max-w-md text-base text-white/90 drop-shadow sm:text-lg">
          เดินเข้าห้องเรียนแห่งอนาคต · Step into a campus that learns with you
        </p>
        <button
          onClick={() => setDiving(true)}
          className="group mt-3 flex w-full max-w-xs items-center justify-between gap-6 rounded-full bg-gradient-to-r from-[#F7E3B4] to-[#F2C879] px-8 py-4 text-lg font-bold text-[#2B2D55] shadow-[0_0_40px_rgba(242,200,121,0.65)] transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
        >
          เริ่มต้น · Start
          <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>

      <p
        className={`pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs tracking-wide text-white/85 transition-opacity duration-700 ${
          showTitle && !diving ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ClassLoop Campus · SPU edition — สร้างให้มหาวิทยาลัยศรีปทุม
      </p>

      {diving && (
        <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm text-white drop-shadow animate-in fade-in duration-500">
          กำลังลงสู่ MRT Exit 2…
        </p>
      )}
    </div>
  )
}
