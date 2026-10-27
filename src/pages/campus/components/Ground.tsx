import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group, Texture } from 'three'
import { BUILDINGS, CAMPUS_PALETTE, CAR_PARKS, CONTEXT_BUILDINGS, MRT_LINE, PLAZA_CENTER, POND } from '@/data/buildings'
import { doorPoint } from '../geometry'
import { asphaltTexture, concreteTexture, facadeTextures, lawnTexture, pavingTexture } from '../textures'

export const CAMPUS_RADIUS = 21

/** Lawn patches, as on the SPU map — the campus is urban: grass, no trees. */
const LAWNS: { at: [number, number]; r: number }[] = [
  { at: [6.5, 7.5], r: 4.6 },
  { at: [-7.5, -4.5], r: 2.6 },
  { at: [6.5, -9], r: 2.4 },
  { at: [15, -5], r: 2.6 },
]

const CAR_COLOURS = ['#E8E8EA', '#2B2D33', '#B33A3A', '#3C5A8A', '#9AA3AE', '#F2F2F2', '#556B4E']

function useRepeat(tex: Texture, rx: number, ry: number) {
  return useMemo(() => {
    const t = tex.clone()
    t.repeat.set(rx, ry)
    t.needsUpdate = true
    return t
  }, [tex, rx, ry])
}

/** Paved walkway from the plaza to a door, lined with street lamps. */
function Walkway({ from, to, width = 1.6 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  const tex = useRepeat(pavingTexture('#E7C98C'), length / 2, width / 2)
  const lamps = Math.max(1, Math.floor(length / 3.5))
  const nx = -dz / length
  const nz = dx / length
  return (
    <group>
      <mesh
        position={[(from[0] + to[0]) / 2, 0.03, (from[1] + to[1]) / 2]}
        rotation={[-Math.PI / 2, 0, -Math.atan2(dz, dx)]}
        receiveShadow
      >
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      {Array.from({ length: lamps }, (_, i) => {
        const t = (i + 0.6) / (lamps + 0.2)
        const side = i % 2 ? 1 : -1
        return <StreetLamp key={i} x={from[0] + dx * t + nx * side * (width / 2 + 0.3)} z={from[1] + dz * t + nz * side * (width / 2 + 0.3)} />
      })}
    </group>
  )
}

function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#3A3D46" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.28]} />
        <meshStandardMaterial color="#FFF1D2" emissive="#FFD48A" emissiveIntensity={3} />
      </mesh>
    </group>
  )
}

/** Low-poly parked car: body + cabin. */
function Car({ x, z, rot, color }: { x: number; z: number; rot: number; color: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.7, 0.32, 1.4]} />
        <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.25} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.55, -0.05]} castShadow>
        <boxGeometry args={[0.62, 0.26, 0.8]} />
        <meshPhysicalMaterial color="#1E2530" metalness={0.3} roughness={0.05} />
      </mesh>
    </group>
  )
}

/** Asphalt with white bay lines and a few parked cars (deterministic, same every take). */
function CarPark({ at, size }: (typeof CAR_PARKS)[number]) {
  const tex = useRepeat(asphaltTexture(), size[0] / 2, size[1] / 2)
  const bays = Math.floor(size[0] / 0.9)
  const bw = size[0] / bays
  return (
    <group position={[at[0], 0.02, at[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      {Array.from({ length: bays + 1 }, (_, i) => (
        <mesh key={i} position={[-size[0] / 2 + bw * i, 0.01, -size[1] / 4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, size[1] / 2 - 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {Array.from({ length: bays }, (_, i) =>
        (i * 7 + at[0] * 3) % 3 === 1 ? null : (
          <Car key={i} x={-size[0] / 2 + bw * (i + 0.5)} z={-size[1] / 4} rot={0} color={CAR_COLOURS[(i + Math.abs(at[1] * 2)) % CAR_COLOURS.length | 0]} />
        ),
      )}
    </group>
  )
}

const VIADUCT_HEIGHT = 2.8
const TRAIN_LAP_SECONDS = 12
const MRT_DIR = (() => {
  const dx = MRT_LINE.to[0] - MRT_LINE.from[0]
  const dz = MRT_LINE.to[1] - MRT_LINE.from[1]
  const len = Math.hypot(dx, dz)
  return { dx, dz, len, yaw: Math.atan2(dx, dz) }
})()

/** Elevated MRT over the main road, with a lit three-car train looping along it. */
function Viaduct() {
  const train = useRef<Group>(null)
  const [fx, fz] = MRT_LINE.from
  const { dx, dz, len, yaw } = MRT_DIR
  const pillars = Math.floor(len / 3.4)
  const deck = useRepeat(concreteTexture(), 1, len / 3)
  const road = useRepeat(asphaltTexture(), 2, len / 2)
  // the road (Phahonyothin) runs under the viaduct, shifted to the outside so it clears the Exit 2 station
  const roadShift = -0.9
  const nx = dz / len
  const nz = -dx / len

  useFrame((state) => {
    const g = train.current
    if (!g) return
    // run past both ends so the train enters and leaves frame instead of popping
    const t = ((state.clock.elapsedTime % TRAIN_LAP_SECONDS) / TRAIN_LAP_SECONDS) * 1.5 - 0.25
    g.position.set(fx + dx * t, VIADUCT_HEIGHT + 0.5, fz + dz * t)
  })

  return (
    <group>
      <mesh
        position={[fx + dx / 2 + nx * roadShift, 0.025, fz + dz / 2 + nz * roadShift]}
        rotation={[-Math.PI / 2, 0, -Math.atan2(dz, dx)]}
        receiveShadow
      >
        <planeGeometry args={[len + 8, 3.4]} />
        <meshStandardMaterial map={road} roughness={0.95} />
      </mesh>
      <mesh position={[fx + dx / 2, VIADUCT_HEIGHT, fz + dz / 2]} rotation={[0, yaw, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.3, len + 6]} />
        <meshStandardMaterial map={deck} roughness={0.8} />
      </mesh>
      {Array.from({ length: pillars + 1 }, (_, i) => {
        const t = i / pillars
        return (
          <mesh key={i} position={[fx + dx * t, VIADUCT_HEIGHT / 2, fz + dz * t]} castShadow>
            <boxGeometry args={[0.4, VIADUCT_HEIGHT, 0.4]} />
            <meshStandardMaterial color="#C4C2BE" roughness={0.8} />
          </mesh>
        )
      })}
      <group ref={train} rotation={[0, yaw, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 0, -i * 2.7]}>
            <mesh castShadow>
              <boxGeometry args={[1.15, 0.8, 2.5]} />
              <meshPhysicalMaterial color="#F4F6FA" metalness={0.4} roughness={0.25} clearcoat={1} />
            </mesh>
            <mesh position={[0, -0.14, 0]}>
              <boxGeometry args={[1.17, 0.12, 2.52]} />
              <meshStandardMaterial color="#2F5DBA" />
            </mesh>
            {/* lit window band */}
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[1.17, 0.24, 2.2]} />
              <meshStandardMaterial color="#FFF3D6" emissive="#FFE2A8" emissiveIntensity={1.8} />
            </mesh>
            {i === 0 &&
              [-0.35, 0.35].map((hx) => (
                <mesh key={hx} position={[hx, -0.05, 1.27]}>
                  <boxGeometry args={[0.18, 0.1, 0.04]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={4} />
                </mesh>
              ))}
          </group>
        ))}
      </group>
    </group>
  )
}

/** The rest of SPU: white glass towers with pink roofs, as drawn on the campus map. */
function ContextTower({ no, at, size }: (typeof CONTEXT_BUILDINGS)[number]) {
  const [w, h, d] = size
  const { map, emissiveMap } = facadeTextures(`ctx-${no}`, 6, 10, 0.18)
  // one pane ≈ 0.75 wide, one floor ≈ 0.9 tall
  const m = useRepeat(map, w / 4.5, h / 9)
  const e = useRepeat(emissiveMap, w / 4.5, h / 9)
  return (
    <group position={[at[0], 0, at[1]]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshPhysicalMaterial map={m} emissiveMap={e} emissive="#FFC98A" emissiveIntensity={0.4} color="#F3F6FA" roughness={0.25} metalness={0.3} clearcoat={0.6} />
      </mesh>
      {/* white frame corners + SPU-pink roof slab */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * w) / 2, h / 2, (sz * d) / 2]} castShadow>
            <boxGeometry args={[0.18, h, 0.18]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
          </mesh>
        )),
      )}
      <mesh position={[0, h + 0.1, 0]} castShadow>
        <boxGeometry args={[w + 0.2, 0.2, d + 0.2]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.spuPink} roughness={0.6} />
      </mesh>
    </group>
  )
}

/** Ground plane, walkways, car parks, pond, MRT + road, and the rest of SPU's buildings. Clicking the ground walks the avatar there. */
export default function Ground({ onWalk }: { onWalk?: (x: number, z: number) => void }) {
  const base = useRepeat(pavingTexture('#CFC9BE'), 22, 22)
  const lawn = useRepeat(lawnTexture(), 3, 3)
  const plaza = useRepeat(pavingTexture('#E3D3B0'), 3, 3)

  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!onWalk) return
    e.stopPropagation()
    onWalk(e.point.x, e.point.z)
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <circleGeometry args={[CAMPUS_RADIUS + 14, 64]} />
        <meshStandardMaterial map={base} roughness={0.95} />
      </mesh>

      {LAWNS.map((l) => (
        <mesh key={l.at.join()} position={[l.at[0], 0.012, l.at[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[l.r, 40]} />
          <meshStandardMaterial map={lawn} roughness={1} />
        </mesh>
      ))}

      {CAR_PARKS.map((c) => (
        <CarPark key={c.at.join()} {...c} />
      ))}

      <mesh position={[PLAZA_CENTER[0], 0.04, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 40]} />
        <meshStandardMaterial map={plaza} roughness={0.85} />
      </mesh>
      {/* SPU sign at the crossroads */}
      <mesh position={[PLAZA_CENTER[0], 0.4, PLAZA_CENTER[1]]} castShadow>
        <boxGeometry args={[1.8, 0.8, 0.3]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.spuPink} emissive={CAMPUS_PALETTE.spuPink} emissiveIntensity={0.35} />
      </mesh>

      {BUILDINGS.map((b) => (
        <Walkway key={b.id} from={PLAZA_CENTER} to={doorPoint(b)} />
      ))}

      {/* pond: dark mirror water reflecting the sky */}
      <mesh position={[POND.at[0], 0.05, POND.at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[POND.r, 48]} />
        <meshPhysicalMaterial color="#2E5F86" roughness={0.04} metalness={0.9} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[POND.at[0], 0.06, POND.at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[POND.r, POND.r + 0.3, 48]} />
        <meshStandardMaterial color="#E8E2CF" roughness={0.8} />
      </mesh>

      <Viaduct />

      {CONTEXT_BUILDINGS.map((c) => (
        <ContextTower key={c.no} {...c} />
      ))}
    </group>
  )
}
