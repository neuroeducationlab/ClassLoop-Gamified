import type { ThreeEvent } from '@react-three/fiber'
import { BUILDINGS, CAMPUS_PALETTE, PLAZA_CENTER } from '@/data/buildings'
import { doorPoint } from '../geometry'

export const CAMPUS_RADIUS = 21

/** Fixed tree spots around the edge — hand-placed so the scene is identical on every take. */
const TREES: [number, number, number][] = [
  [-14, 9, 1.1], [-16, 3, 0.9], [-15, -4, 1.2], [-12, -13, 1], [-4, -15, 0.9],
  [4, -15, 1.1], [12, -13, 1], [15, -3, 0.9], [16, 4, 1.2], [14, 10, 1],
  [-5, 13, 0.8], [5, 13, 0.8], [-3, -5, 0.7], [3, -5, 0.7], [-17, -10, 1.1], [17, -10, 1],
]

function Path({ from, to, width = 1.4 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.02, (from[1] + to[1]) / 2]}
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

/** Grass, plaza, paths to every door, and trees. Clicking the grass walks the avatar there. */
export default function Ground({ onWalk }: { onWalk: (x: number, z: number) => void }) {
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onWalk(e.point.x, e.point.z)
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <circleGeometry args={[CAMPUS_RADIUS + 6, 48]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.grass} roughness={1} />
      </mesh>

      <mesh position={[PLAZA_CENTER[0], 0.03, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 32]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.path} roughness={1} />
      </mesh>
      {/* centre fountain */}
      <mesh position={[PLAZA_CENTER[0], 0.25, PLAZA_CENTER[1]]} castShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.5, 16]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.spuPink} flatShading />
      </mesh>
      <mesh position={[PLAZA_CENTER[0], 0.52, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 16]} />
        <meshStandardMaterial color="#7CC6F2" emissive="#7CC6F2" emissiveIntensity={0.3} />
      </mesh>

      {BUILDINGS.map((b) => (
        <Path key={b.id} from={PLAZA_CENTER} to={doorPoint(b)} />
      ))}

      {TREES.map(([x, z, s]) => (
        <Tree key={`${x},${z}`} x={x} z={z} s={s} />
      ))}
    </group>
  )
}
