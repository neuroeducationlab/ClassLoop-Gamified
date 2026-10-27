import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { MRT_LINE } from '@/data/buildings'

/** Cars per direction, lap time, and lane offset — matched to the front road in Ground.tsx (3.8 wide). */
const CARS_PER_LANE = 7
const LAP_SECONDS = 9
const LANE_X = 0.95

/**
 * Long-exposure light trails on Phahonyothin Road under the MRT: white
 * headlights one way, red tail-lights the other. Pure emissive streaks,
 * untoned so bloom turns them into trails on the filming laptop.
 */
export default function LightTrails() {
  const lanes = useRef<Group>(null)
  const road = useMemo(() => {
    const [fx, fz] = MRT_LINE.from
    const [tx, tz] = MRT_LINE.to
    const dx = tx - fx
    const dz = tz - fz
    // same placement as FrontRoad in Ground.tsx
    return {
      position: [(fx + tx) / 2 + 1.2, 0.12, (fz + tz) / 2 - 1.2] as [number, number, number],
      yaw: Math.atan2(dx, dz),
      length: Math.hypot(dx, dz) + 8,
    }
  }, [])
  // deterministic spacing + speed jitter, identical every take
  const cars = useMemo(
    () =>
      Array.from({ length: CARS_PER_LANE * 2 }, (_, i) => ({
        lane: i % 2 === 0 ? 1 : -1,
        offset: ((i * 0.6180339) % 1) * road.length,
        speed: 0.85 + ((i * 37) % 10) / 30,
      })),
    [road.length],
  )

  useFrame((state) => {
    const g = lanes.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.children.forEach((car, i) => {
      const c = cars[i]
      const travel = ((t / LAP_SECONDS) * road.length * c.speed + c.offset) % road.length
      // lane +1 drives toward +z, lane -1 toward -z
      car.position.z = c.lane * (travel - road.length / 2)
    })
  })

  return (
    <group position={road.position} rotation={[0, road.yaw, 0]}>
      <group ref={lanes}>
        {cars.map((c, i) => (
          <group key={i} position={[c.lane * LANE_X, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.22, 0.06, 2.2]} />
              <meshBasicMaterial color={c.lane > 0 ? '#FFF6E0' : '#FF3B3B'} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
