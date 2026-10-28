import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { CanvasTexture, MathUtils, RepeatWrapping, SRGBColorSpace, Vector3, type Group, type MeshStandardMaterial } from 'three'
import type { Building } from '@/data/buildings'
import type { InteriorConfig, Station, StationKind } from '@/data/interiors'
import { smootherstep } from '../ease'
import { getConcreteTexture } from '../textures'
import RoomDressing from './RoomDressing'
import { drawGameIcon } from '@/components/icons/drawGameIcon'

export type LabelMap = Map<string, HTMLDivElement>

const EYE = 1.7
/** How far the camera stands back from each kind of station, and what height it looks at. */
const FRAMING: Record<StationKind, { dist: number; lookY: number; labelY: number }> = {
  screen: { dist: 4.4, lookY: 2.2, labelY: 3.6 },
  board: { dist: 3.4, lookY: 1.7, labelY: 2.9 },
  shelf: { dist: 3.4, lookY: 1.4, labelY: 2.9 },
  kiosk: { dist: 2.7, lookY: 1.2, labelY: 2.2 },
  desk: { dist: 3.0, lookY: 1.0, labelY: 2.0 },
}

/** The spot every station turns to face: just inside the door. */
const viewPoint = (config: InteriorConfig) => new Vector3(0, 0, config.size[1] / 2 - 2)

function facing(s: Station, config: InteriorConfig) {
  const v = viewPoint(config)
  return Math.atan2(v.x - s.at[0], v.z - s.at[1])
}

type Pose = { pos: Vector3; look: Vector3 }

/** A station's framing, shrunk with its prop. */
function framing(s: Station) {
  const f = FRAMING[s.kind]
  const k = s.scale ?? 1
  return { dist: Math.max(2.2, f.dist * k), lookY: f.lookY * k, labelY: f.labelY * k }
}

function stationPose(s: Station, config: InteriorConfig): Pose {
  const f = framing(s)
  const yaw = facing(s, config)
  const [w, d] = config.size
  // stand back along the station's facing, kept inside the walls
  const x = MathUtils.clamp(s.at[0] + Math.sin(yaw) * f.dist, -w / 2 + 0.8, w / 2 - 0.8)
  const z = MathUtils.clamp(s.at[1] + Math.cos(yaw) * f.dist, -d / 2 + 0.8, d / 2 - 0.4)
  return { pos: new Vector3(x, Math.min(EYE, f.lookY + 0.5), z), look: new Vector3(s.at[0], f.lookY, s.at[1]) }
}

/* ---------------------------------------------------------------- textures -- */

const screenCache = new Map<string, CanvasTexture>()

/** What a station's screen shows: its icon and name on the building's colour, like a wayfinding display. */
function screenTexture(s: Station, color: string, lang: 'th' | 'en') {
  const key = `${s.id}-${color}-${lang}`
  const hit = screenCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 288
  const g = c.getContext('2d')!
  const bg = g.createLinearGradient(0, 0, 512, 288)
  bg.addColorStop(0, '#0D1030')
  bg.addColorStop(1, color)
  g.fillStyle = bg
  g.fillRect(0, 0, 512, 288)
  // faint grid, like a hologram display
  g.strokeStyle = 'rgba(127,227,255,0.18)'
  for (let x = 0; x < 512; x += 32) g.strokeRect(x, 0, 0.5, 288)
  for (let y = 0; y < 288; y += 32) g.strokeRect(0, y, 512, 0.5)
  g.textAlign = 'center'
  drawGameIcon(g, s.icon, 256, 102, 84, '#FFFFFF')
  g.fillStyle = '#FFFFFF'
  g.font = 'bold 38px sans-serif'
  g.fillText(s.label[lang], 256, 210, 470)
  g.fillStyle = 'rgba(255,255,255,0.7)'
  g.font = '22px sans-serif'
  g.fillText(s.does[lang], 256, 250, 470)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  screenCache.set(key, tex)
  return tex
}

let skyTex: CanvasTexture | null = null
/** The view out of the windows: soft sky over a pale campus skyline. */
function skyTexture() {
  if (skyTex) return skyTex
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#8EC5FF')
  grad.addColorStop(0.7, '#DCEBFF')
  grad.addColorStop(1, '#FDE7C8')
  g.fillStyle = grad
  g.fillRect(0, 0, 1024, 256)
  g.fillStyle = 'rgba(120,140,170,0.45)'
  let x = 0
  let i = 0
  while (x < 1024) {
    const w = 40 + ((i * 37) % 70)
    const h = 50 + ((i * 53) % 110)
    g.fillRect(x, 256 - h, w, h)
    x += w + 6
    i++
  }
  skyTex = new CanvasTexture(c)
  skyTex.colorSpace = SRGBColorSpace
  return skyTex
}

/* ---------------------------------------------------------------- room shell -- */

function RoomShell({ config, color }: { config: InteriorConfig; color: string }) {
  const [w, d] = config.size
  const h = config.height
  const floorTex = useMemo(() => {
    const t = getConcreteTexture()?.clone()
    if (t) {
      t.wrapS = t.wrapT = RepeatWrapping
      t.repeat.set(w / 3, d / 3)
      t.needsUpdate = true
    }
    return t
  }, [w, d])
  const door = 2.6
  const doorH = 3.1
  const side = (w - door) / 2
  const sky = skyTexture()
  const mullions = Math.floor(d / 1.6)
  const strips = Math.max(2, Math.floor(w / 3.5))
  const openSky = config.dressing === 'arena'

  return (
    <group>
      {/* floor + accent inlay where the room's stations gather */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#E9E4DC" map={floorTex ?? undefined} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -d / 6]}>
        <ringGeometry args={[1.5, 1.62, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {/* back wall with the building's accent band */}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#F4F1EC" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, -d / 2 + 0.01]}>
        <planeGeometry args={[w, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>

      {/* right wall (solid) */}
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#EEEAE3" roughness={0.9} />
      </mesh>

      {/* left wall: a band of windows onto the campus */}
      <group position={[-w / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <planeGeometry args={[d, 0.9]} />
          <meshStandardMaterial color="#DAD5CD" roughness={0.9} />
        </mesh>
        <mesh position={[0, (h + h - 0.7) / 2, 0]}>
          <planeGeometry args={[d, 0.7]} />
          <meshStandardMaterial color="#DAD5CD" roughness={0.9} />
        </mesh>
        <mesh position={[0, (0.9 + h - 0.7) / 2, -0.02]}>
          <planeGeometry args={[d, h - 1.6]} />
          <meshBasicMaterial map={sky} toneMapped={false} />
        </mesh>
        {Array.from({ length: mullions + 1 }, (_, i) => (
          <mesh key={i} position={[-d / 2 + (i * d) / mullions, (0.9 + h - 0.7) / 2, 0.03]}>
            <boxGeometry args={[0.08, h - 1.6, 0.06]} />
            <meshStandardMaterial color="#2B2E38" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* front wall with the doorway we came in through, framed in the accent colour */}
      {[-1, 1].map((sgn) => (
        <mesh key={sgn} position={[sgn * (door / 2 + side / 2), h / 2, d / 2]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[side, h]} />
          <meshStandardMaterial color="#EEEAE3" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, (doorH + h) / 2, d / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[door, h - doorH]} />
        <meshStandardMaterial color="#EEEAE3" roughness={0.9} />
      </mesh>
      <mesh position={[0, doorH, d / 2 - 0.02]}>
        <boxGeometry args={[door + 0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {openSky ? (
        // the arena is open-air: sky overhead instead of a ceiling
        <mesh position={[0, h + 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w * 3, d * 3]} />
          <meshBasicMaterial color="#9CCBFF" toneMapped={false} />
        </mesh>
      ) : (
        <>
          {/* ceiling with light strips */}
          <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial color="#3A3D4A" roughness={0.9} />
          </mesh>
          {Array.from({ length: strips }, (_, i) => (
            <mesh key={i} position={[-w / 2 + ((i + 0.5) * w) / strips, h - 0.03, 0]}>
              <boxGeometry args={[0.18, 0.04, d * 0.8]} />
              <meshStandardMaterial color="#FFF6E5" emissive="#FFF2D6" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

/* ---------------------------------------------------------------- stations -- */

function StationProp({
  station,
  color,
  lang,
  lit,
  yaw,
  onHover,
  onPick,
}: {
  station: Station
  color: string
  lang: 'th' | 'en'
  lit: boolean
  yaw: number
  onHover: (id: string | null) => void
  onPick: (id: string) => void
}) {
  const glow = useRef(0)
  const ring = useRef<MeshStandardMaterial>(null)
  const screen = useRef<MeshStandardMaterial>(null)
  const group = useRef<Group>(null)
  const tex = useMemo(() => screenTexture(station, color, lang), [station, color, lang])

  useFrame((_, dt) => {
    glow.current = MathUtils.damp(glow.current, lit ? 1 : 0, 8, dt)
    if (ring.current) ring.current.opacity = 0.25 + glow.current * 0.75
    if (screen.current) screen.current.emissiveIntensity = 0.75 + glow.current * 0.6
    if (group.current) group.current.position.y = glow.current * 0.04
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(station.id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onPick(station.id)
  }

  const screenMat = (
    <meshStandardMaterial ref={screen} color="#0D1030" emissive="#FFFFFF" emissiveMap={tex} emissiveIntensity={0.75} toneMapped={false} />
  )
  const dark = <meshStandardMaterial color="#23262F" metalness={0.5} roughness={0.35} />

  return (
    <group position={[station.at[0], 0, station.at[1]]} rotation={[0, yaw, 0]} scale={station.scale ?? 1}>
      {/* floor ring that lights up on hover / when chosen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.9]}>
        <ringGeometry args={[0.85, 1.0, 48]} />
        <meshStandardMaterial ref={ring} color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <group ref={group} onPointerOver={over} onPointerOut={out} onClick={click}>
        {station.kind === 'screen' && (
          <>
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[3.7, 2.15, 0.12]} />
              {dark}
            </mesh>
            <mesh position={[0, 2.2, 0.065]}>
              <planeGeometry args={[3.5, 1.97]} />
              {screenMat}
            </mesh>
            <mesh position={[0, 0.6, -0.05]} castShadow>
              <boxGeometry args={[0.18, 1.2, 0.18]} />
              {dark}
            </mesh>
          </>
        )}
        {station.kind === 'kiosk' && (
          <>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.75, 1.1, 0.5]} />
              {dark}
            </mesh>
            <mesh position={[0, 1.32, 0.05]} rotation={[-0.35, 0, 0]} castShadow>
              <boxGeometry args={[0.95, 0.6, 0.06]} />
              {dark}
            </mesh>
            <mesh position={[0, 1.32, 0.09]} rotation={[-0.35, 0, 0]}>
              <planeGeometry args={[0.88, 0.5]} />
              {screenMat}
            </mesh>
          </>
        )}
        {station.kind === 'desk' && (
          <>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.07, 1.0]} />
              <meshStandardMaterial color="#C9A97E" roughness={0.6} />
            </mesh>
            {[-1, 1].flatMap((sx) =>
              [-1, 1].map((sz) => (
                <mesh key={`${sx}${sz}`} position={[sx * 1.0, 0.37, sz * 0.42]}>
                  <boxGeometry args={[0.06, 0.74, 0.06]} />
                  {dark}
                </mesh>
              )),
            )}
            <mesh position={[0, 1.15, -0.3]} castShadow>
              <boxGeometry args={[1.05, 0.62, 0.05]} />
              {dark}
            </mesh>
            <mesh position={[0, 1.15, -0.27]}>
              <planeGeometry args={[0.98, 0.55]} />
              {screenMat}
            </mesh>
          </>
        )}
        {station.kind === 'board' && (
          <>
            <mesh position={[0, 1.7, 0]} castShadow>
              <boxGeometry args={[2.8, 1.8, 0.08]} />
              <meshStandardMaterial color="#B98E5E" roughness={0.9} />
            </mesh>
            <mesh position={[0, 2.35, 0.05]}>
              <planeGeometry args={[2.6, 0.46]} />
              {screenMat}
            </mesh>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} position={[-1.05 + (i % 4) * 0.7, 1.75 - Math.floor(i / 4) * 0.62, 0.05]} rotation={[0, 0, ((i * 7) % 5) * 0.03 - 0.06]}>
                <planeGeometry args={[0.5, 0.42]} />
                <meshStandardMaterial color={['#FFF7D6', '#FFE1EC', '#DDF4FF', '#E6FFE8'][i % 4]} roughness={0.9} />
              </mesh>
            ))}
          </>
        )}
        {station.kind === 'shelf' && (
          <>
            <mesh position={[0, 1.2, -0.05]} castShadow>
              <boxGeometry args={[2.6, 2.4, 0.5]} />
              <meshStandardMaterial color="#8A6A4A" roughness={0.8} />
            </mesh>
            {Array.from({ length: 4 }, (_, row) =>
              Array.from({ length: 11 }, (_, i) => (
                <mesh key={`${row}-${i}`} position={[-1.1 + i * 0.22, 0.42 + row * 0.55, 0.1]}>
                  <boxGeometry args={[0.16, 0.42 - ((i * 3 + row) % 4) * 0.04, 0.3]} />
                  <meshStandardMaterial color={['#3B5BA9', '#C2454B', '#E0B04B', '#3F8F6B', '#7C5BB5'][(i + row * 2) % 5]} roughness={0.7} />
                </mesh>
              )),
            )}
            <mesh position={[0, 2.62, 0.21]}>
              <planeGeometry args={[1.6, 0.36]} />
              {screenMat}
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- camera -- */

/**
 * The camera walks in through the door on arrival, then glides between the room
 * overview and each station: one eased move at a time, gaze leading, no roll.
 */
function CameraRig({
  config,
  stations,
  focused,
  onArrived,
}: {
  config: InteriorConfig
  stations: Station[]
  focused: string | null
  onArrived: (id: string) => void
}) {
  const camera = useThree((s) => s.camera)
  const d = config.size[1]
  const overview = useMemo<Pose>(() => ({ pos: new Vector3(0, 2.7, d / 2 - 0.9), look: new Vector3(0, 1.5, -d / 4) }), [d])
  const entry = useMemo<Pose>(() => ({ pos: new Vector3(0, 1.9, d / 2 + 3.2), look: new Vector3(0, 1.6, 0) }), [d])
  const poses = useMemo(() => new Map(stations.map((s) => [s.id, stationPose(s, config)])), [stations, config])
  const look = useRef(entry.look.clone())
  const move = useRef<{ key: string; from: Pose; to: Pose; t: number; seconds: number; done: boolean } | null>(null)

  useEffect(() => {
    camera.position.copy(entry.pos)
    camera.lookAt(entry.look)
  }, [camera, entry])

  useFrame((_, dt) => {
    const key = focused && poses.has(focused) ? focused : ''
    if (move.current?.key !== key) {
      move.current = {
        key,
        from: { pos: camera.position.clone(), look: look.current.clone() },
        to: key ? poses.get(key)! : overview,
        t: 0,
        // the first move is walking in through the door
        seconds: move.current ? 1.1 : 1.7,
        done: false,
      }
    }
    const m = move.current
    // cap the step so a slow first frame doesn't skip the move
    m.t = Math.min(1, m.t + Math.min(dt, 1 / 20) / m.seconds)
    const e = smootherstep(m.t)
    camera.position.lerpVectors(m.from.pos, m.to.pos, e)
    look.current.lerpVectors(m.from.look, m.to.look, e)
    camera.lookAt(look.current)
    if (m.t >= 1 && !m.done) {
      m.done = true
      if (key) onArrived(key)
    }
  })
  return null
}

/** Keeps each station's DOM label pinned above it (plain DOM, not drei <Html>: see HANDOFF). */
function LabelProjector({ stations, config, labels }: { stations: Station[]; config: InteriorConfig; labels: RefObject<LabelMap> }) {
  const { camera, size } = useThree()
  const p = useMemo(() => new Vector3(), [])
  useFrame(() => {
    for (const s of stations) {
      const el = labels.current?.get(s.id)
      if (!el) continue
      p.set(s.at[0], framing(s).labelY, s.at[1]).project(camera)
      el.style.transform = `translate(${((p.x + 1) / 2) * size.width}px, ${((1 - p.y) / 2) * size.height}px) translate(-50%, -100%)`
      el.style.visibility = p.z < 1 && Math.abs(p.x) < 1.1 ? 'visible' : 'hidden'
    }
  })
  void config
  return null
}

/* ---------------------------------------------------------------- scene -- */

export default function InteriorScene({
  building,
  config,
  stations,
  lang,
  hovered,
  focused,
  lowPower,
  labels,
  onHover,
  onPick,
  onArrived,
}: {
  building: Building
  config: InteriorConfig
  stations: Station[]
  lang: 'th' | 'en'
  hovered: string | null
  focused: string | null
  lowPower: boolean
  labels: RefObject<LabelMap>
  onHover: (id: string | null) => void
  onPick: (id: string) => void
  onArrived: (id: string) => void
}) {
  const [w, d] = config.size
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <Canvas shadows={!lowPower} dpr={lowPower ? [1, 1.25] : [1, 1.75]} camera={{ fov: 60, near: 0.1, far: 80 }}>
      <color attach="background" args={['#1A1C2A']} />
      <hemisphereLight args={['#FFF6E8', '#5A5560', 0.9]} />
      <ambientLight intensity={0.25} />
      {/* daylight through the window band */}
      <directionalLight
        position={[-w, config.height * 1.6, 2]}
        intensity={1.6}
        color="#FFE9C9"
        castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-w}
        shadow-camera-right={w}
        shadow-camera-top={d}
        shadow-camera-bottom={-d}
      />
      <pointLight position={[0, config.height - 0.6, -d / 4]} intensity={8} distance={d} color={building.color} />
      {!lowPower && (
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={2} color="#FFF2D6" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={1} color={building.color} position={[0, 2, -8]} scale={[10, 4, 1]} />
        </Environment>
      )}

      <RoomShell config={config} color={building.color} />
      <RoomDressing dressing={config.dressing} config={config} color={building.color} lang={lang} />
      {stations.map((s) => (
        <StationProp
          key={s.id}
          station={s}
          color={building.color}
          lang={lang}
          lit={hovered === s.id || focused === s.id}
          yaw={facing(s, config)}
          onHover={onHover}
          onPick={onPick}
        />
      ))}

      <CameraRig config={config} stations={stations} focused={focused} onArrived={onArrived} />
      <LabelProjector stations={stations} config={config} labels={labels} />

      {!lowPower && (
        <EffectComposer multisampling={4}>
          <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.6} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
