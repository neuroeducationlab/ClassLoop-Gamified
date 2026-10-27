import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { BUILDINGS, CAMPUS_PALETTE, CAR_PARKS, MRT_LINE, PLAZA_CENTER, POND } from '@/data/buildings'
import { doorPoint } from '../geometry'

export const CAMPUS_RADIUS = 21

/** Fixed tree spots, hand-placed clear of buildings, paths, car parks and the viaduct. */
const TREES: [number, number, number][] = [
  [-14, -12, 1.1], [-10.5, -13.5, 0.9], [-1.5, -12, 1], [2.5, -13, 0.9], [14.5, -12.5, 1.1],
  [15.5, -6, 0.9], [15, 1.5, 1.2], [9.5, 3, 0.8], [12.5, 6, 1], [-11, -6.5, 0.8],
  [-2, -10, 0.7], [-6, 3, 0.8], [4.5, 12.5, 0.9], [9, 11, 1], [-14.5, -3.5, 1],
]

function Path({ from, to, width = 1.4 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.03, (from[1] + to[1]) / 2]}
      rotation={[-Math.PI / 2, 0, -Math.atan2(dz, dx)]}
      receiveShadow
    >
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color={CAMPUS_PALETTE.path} roughness={1} />
    </mesh>
  )
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1, 6]} />
        <meshStandardMaterial color="#8B5E3C" flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.9, 1.8, 7]} />
        <meshStandardMaterial color="#4E8F4A" flatShading />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.65, 1.3, 7]} />
        <meshStandardMaterial color="#5FA358" flatShading />
      </mesh>
    </group>
  )
}

/** Dark asphalt with white bay lines. */
function CarPark({ at, size }: (typeof CAR_PARKS)[number]) {
  const bays = Math.floor(size[0] / 0.9)
  return (
    <group position={[at[0], 0.02, at[1]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#4A4C55" roughness={1} />
      </mesh>
      {Array.from({ length: bays + 1 }, (_, i) => (
        <mesh key={i} position={[-size[0] / 2 + (size[0] / bays) * i, 0.01, -size[1] / 4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, size[1] / 2 - 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
    </group>
  )
}

const VIADUCT_HEIGHT = 2.6
const TRAIN_LAP_SECONDS = 11

/** Elevated MRT line along the campus edge, with a train looping along it. */
function Viaduct() {
  const train = useRef<Group>(null)
  const [fx, fz] = MRT_LINE.from
  const [tx, tz] = MRT_LINE.to
  const dx = tx - fx
  const dz = tz - fz
  const length = Math.hypot(dx, dz)
  const yaw = Math.atan2(dx, dz)
  const pillars = Math.floor(length / 3.2)

  useFrame((state) => {
    const g = train.current
    if (!g) return
    // run past both ends so the train enters and leaves frame instead of popping
    const t = ((state.clock.elapsedTime % TRAIN_LAP_SECONDS) / TRAIN_LAP_SECONDS) * 1.5 - 0.25
    g.position.set(fx + dx * t, VIADUCT_HEIGHT + 0.5, fz + dz * t)
  })

  return (
    <group>
      <mesh position={[(fx + tx) / 2, VIADUCT_HEIGHT, (fz + tz) / 2]} rotation={[0, yaw, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.28, length + 6]} />
        <meshStandardMaterial color="#B9BEC9" flatShading />
      </mesh>
      {Array.from({ length: pillars + 1 }, (_, i) => {
        const t = i / pillars
        return (
          <mesh key={i} position={[fx + dx * t, VIADUCT_HEIGHT / 2, fz + dz * t]} castShadow>
            <boxGeometry args={[0.35, VIADUCT_HEIGHT, 0.35]} />
            <meshStandardMaterial color="#BFC3CC" />
          </mesh>
        )
      })}
      <group ref={train} rotation={[0, yaw, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, 0, -i * 2.7]}>
            <mesh castShadow>
              <boxGeometry args={[1.2, 0.8, 2.5]} />
              <meshStandardMaterial color="#F4F6FA" />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <boxGeometry args={[1.22, 0.14, 2.52]} />
              <meshStandardMaterial color="#2F5DBA" />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[1.22, 0.24, 2.1]} />
              <meshStandardMaterial color="#36405A" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Grass, crossroads plaza, paths to every door, car parks, pond, MRT viaduct and trees. Clicking the grass walks the avatar there. */
export default function Ground({ onWalk }: { onWalk: (x: number, z: number) => void }) {
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onWalk(e.point.x, e.point.z)
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <circleGeometry args={[CAMPUS_RADIUS + 8, 48]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.grass} roughness={1} />
      </mesh>

      {CAR_PARKS.map((c) => (
        <CarPark key={c.at.join()} {...c} />
      ))}

      <mesh position={[PLAZA_CENTER[0], 0.04, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.4, 32]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.path} roughness={1} />
      </mesh>
      {/* SPU sign at the crossroads */}
      <group position={[PLAZA_CENTER[0], 0, PLAZA_CENTER[1]]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.6, 0.7, 0.3]} />
          <meshStandardMaterial color={CAMPUS_PALETTE.spuPink} />
        </mesh>
      </group>

      {BUILDINGS.map((b) => (
        <Path key={b.id} from={PLAZA_CENTER} to={doorPoint(b)} />
      ))}

      {/* pond */}
      <mesh position={[POND.at[0], 0.05, POND.at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[POND.r, 32]} />
        <meshStandardMaterial color="#7CC6F2" emissive="#7CC6F2" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[POND.at[0], 0.04, POND.at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[POND.r, POND.r + 0.25, 32]} />
        <meshStandardMaterial color="#E8E2CF" />
      </mesh>

      <Viaduct />

      {TREES.map(([x, z, s]) => (
        <Tree key={`${x},${z}`} x={x} z={z} s={s} />
      ))}
    </group>
  )
}
