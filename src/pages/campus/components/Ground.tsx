import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { DoubleSide, type Group } from 'three'
import { BUILDINGS, CAMPUS_PALETTE, CAR_PARKS, MRT_LINE, PLAZA_CENTER, POND } from '@/data/buildings'
import { doorPoint } from '../geometry'
import { getAsphaltTexture, getPavingTexture } from '../textures'
import CampusScenery from './CampusScenery'

export const CAMPUS_RADIUS = 32

/* ---------------------------------------------------------------- cars -- */

const CAR_COLORS = ['#EAEFF7', '#252932', '#1E468A', '#9B2226', '#8E9AAF', '#F7F7F7', '#3D405B']

function Car({ position, rotation = 0, color }: { position: [number, number, number]; rotation?: number; color: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.88}>
      {/* Lower chassis */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <boxGeometry args={[1.7, 0.38, 0.85]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Upper greenhouse / cabin with tinted glass */}
      <mesh position={[-0.1, 0.54, 0]} castShadow>
        <boxGeometry args={[1.0, 0.34, 0.78]} />
        <meshPhysicalMaterial color="#1E2738" roughness={0.1} metalness={0.5} clearcoat={1} />
      </mesh>
      {/* Wheels */}
      {[
        [-0.52, 0.16, 0.44],
        [0.52, 0.16, 0.44],
        [-0.52, 0.16, -0.44],
        [0.52, 0.16, -0.44],
      ].map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 14]} />
            <meshStandardMaterial color="#1A1C22" roughness={0.8} />
          </mesh>
          <mesh position={[0, wz > 0 ? 0.055 : -0.055, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 10]} />
            <meshStandardMaterial color="#D8DDE6" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      {/* Front Headlights */}
      <mesh position={[0.86, 0.28, 0.26]}>
        <boxGeometry args={[0.04, 0.1, 0.18]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFEBB5" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.86, 0.28, -0.26]}>
        <boxGeometry args={[0.04, 0.1, 0.18]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFEBB5" emissiveIntensity={1.2} />
      </mesh>
      {/* Rear Taillights */}
      <mesh position={[-0.86, 0.3, 0.26]}>
        <boxGeometry args={[0.04, 0.08, 0.18]} />
        <meshStandardMaterial color="#D90429" emissive="#D90429" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[-0.86, 0.3, -0.26]}>
        <boxGeometry args={[0.04, 0.08, 0.18]} />
        <meshStandardMaterial color="#D90429" emissive="#D90429" emissiveIntensity={1.0} />
      </mesh>
    </group>
  )
}

function CarPark({ at, size }: (typeof CAR_PARKS)[number]) {
  const asphalt = useMemo(() => getAsphaltTexture(), [])
  const bays = Math.floor(size[0] / 1.05)
  // Deterministic parked cars
  const cars = useMemo(() => {
    const list: { bay: number; color: string; flipped: boolean }[] = []
    for (let i = 0; i < bays; i++) {
      const seed = Math.sin(at[0] * 12.3 + i * 45.7) * 1000
      const rand = seed - Math.floor(seed)
      if (rand > 0.25) {
        // 75% occupancy
        const colorIdx = Math.floor(rand * CAR_COLORS.length) % CAR_COLORS.length
        list.push({ bay: i, color: CAR_COLORS[colorIdx], flipped: rand > 0.6 })
      }
    }
    return list
  }, [at, bays])

  return (
    <group position={[at[0], 0.02, at[1]]}>
      {/* Asphalt pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#2E3037" map={asphalt ?? undefined} roughness={0.85} />
      </mesh>
      {/* Concrete curb border */}
      <mesh position={[0, 0.05, -size[1] / 2]}>
        <boxGeometry args={[size[0] + 0.2, 0.1, 0.18]} />
        <meshStandardMaterial color="#B0B5C2" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, size[1] / 2]}>
        <boxGeometry args={[size[0] + 0.2, 0.1, 0.18]} />
        <meshStandardMaterial color="#B0B5C2" roughness={0.6} />
      </mesh>

      {/* Painted parking bay dividing lines */}
      {Array.from({ length: bays + 1 }, (_, i) => (
        <mesh
          key={i}
          position={[-size[0] / 2 + (size[0] / bays) * i, 0.015, -size[1] / 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.07, size[1] / 2 - 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Parked cars in bays */}
      {cars.map(({ bay, color, flipped }) => {
        const cx = -size[0] / 2 + (size[0] / bays) * (bay + 0.5)
        const cz = -size[1] / 4
        return (
          <Car
            key={bay}
            position={[cx, 0.01, cz]}
            rotation={flipped ? Math.PI / 2 : -Math.PI / 2}
            color={color}
          />
        )
      })}
    </group>
  )
}

/* ---------------------------------------------------------------- street lamps -- */

const LAMP_POSITIONS: [number, number, number][] = [
  [-12, 0, 3],
  [-7, 0, 2],
  [4, 0, -3],
  [10, 0, -6],
  [14, 0, 2],
  [-2, 0, 6.5],
  [5, 0, 7.5],
  [-14, 0, -4],
  [-10, 0, -8],
  [11, 0, -10],
  [1, 0, -14],
]

function StreetLamp({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base flange */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#22252C" roughness={0.5} />
      </mesh>
      {/* Sleek architectural mast */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 3.2, 8]} />
        <meshStandardMaterial color="#3A3E4A" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cantilever arm */}
      <mesh position={[0.22, 3.25, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <boxGeometry args={[0.55, 0.05, 0.08]} />
        <meshStandardMaterial color="#2B2F3A" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* LED Luminaire Head */}
      <mesh position={[0.45, 3.16, 0]} castShadow>
        <boxGeometry args={[0.3, 0.06, 0.14]} />
        <meshStandardMaterial color="#1E2028" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glowing Warm LED light panel */}
      <mesh position={[0.45, 3.12, 0]}>
        <boxGeometry args={[0.26, 0.02, 0.12]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFE6B3"
          emissiveIntensity={1.8}
        />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- modern furniture -- */

const BENCH_POSITIONS: [number, number, number][] = [
  [-2.5, 0, 4.0],
  [4.5, 0, 4.0],
  [4.5, 0, -4.0],
  [-3.5, 0, -4.0],
  [11.5, 0, 6.5],
  [-10.5, 0, 4.5],
]

function ModernBench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.85}>
      {/* Concrete/Steel legs */}
      {[-0.6, 0.6].map((bx) => (
        <mesh key={bx} position={[bx, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.4]} />
          <meshStandardMaterial color="#2C3038" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Wood slats seat */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.5, 0.06, 0.42]} />
        <meshStandardMaterial color="#A67049" roughness={0.6} />
      </mesh>
    </group>
  )
}

const PLANTER_POSITIONS: [number, number, number][] = [
  [-6.5, 0, 6.5],
  [1.5, 0, 6.0],
  [9.0, 0, 5.5],
  [-8.5, 0, -6.5],
  [6.5, 0, -6.5],
  [15.5, 0, 6.0],
]

function ModernPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Architectural concrete box */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.6, 0.8]} />
        <meshStandardMaterial color="#D0D5E0" roughness={0.6} />
      </mesh>
      {/* Dense manicured low shrub/hedge (no trees) */}
      <mesh position={[0, 0.68, 0]} castShadow>
        <boxGeometry args={[1.25, 0.28, 0.65]} />
        <meshStandardMaterial color="#3D7438" roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- path -- */

function Path({ from, to, width = 3.2 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const paving = useMemo(() => getPavingTexture(), [])
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  const angle = -Math.atan2(dz, dx)

  return (
    <group position={[(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2]} rotation={[-Math.PI / 2, 0, angle]}>
      {/* Architectural curb border trim on both edges for crisp visual contrast */}
      <mesh position={[0, 0, 0.032]} receiveShadow>
        <planeGeometry args={[length, width + 0.5]} />
        <meshStandardMaterial color="#B8BECB" roughness={0.6} />
      </mesh>
      {/* Main Paver Bed (Clean, wide, prominent pedestrian promenade) */}
      <mesh position={[0, 0, 0.038]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#F2EDE4" map={paving ?? undefined} roughness={0.7} />
      </mesh>
      {/* Subtle edge illumination runners for day/night visibility */}
      {[-width / 2, width / 2].map((edgeX, idx) => (
        <mesh key={idx} position={[0, edgeX, 0.04]}>
          <planeGeometry args={[length, 0.08]} />
          <meshStandardMaterial color="#FFE8A3" emissive="#FFE8A3" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- MRT viaduct & station canopy -- */

const VIADUCT_HEIGHT = 2.8
const TRAIN_LAP_SECONDS = 14

function Viaduct() {
  const train = useRef<Group>(null)
  const [fx, fz] = MRT_LINE.from
  const [tx, tz] = MRT_LINE.to
  const dx = tx - fx
  const dz = tz - fz
  const length = Math.hypot(dx, dz)
  const yaw = Math.atan2(dx, dz)
  const totalLength = length + 24
  const pillars = Math.floor(totalLength / 3.6)

  useFrame((state) => {
    const g = train.current
    if (!g) return
    // Smooth looping transit progress that stays strictly on the continuous viaduct rail bed
    const progress = (state.clock.elapsedTime % TRAIN_LAP_SECONDS) / TRAIN_LAP_SECONDS
    const t = 0.08 + progress * 0.84
    g.position.set(fx + dx * t, VIADUCT_HEIGHT + 0.48, fz + dz * t)
  })

  return (
    <group>
      {/* Continuous Elevated Guideway Concrete Box Girder (Extended seamlessly across horizon) */}
      <mesh
        position={[(fx + tx) / 2, VIADUCT_HEIGHT, (fz + tz) / 2]}
        rotation={[0, yaw, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.6, 0.45, totalLength]} />
        <meshStandardMaterial color="#C4CAD6" roughness={0.5} />
      </mesh>

      {/* Viaduct Side Parapets */}
      {[-0.78, 0.78].map((px) => (
        <mesh
          key={px}
          position={[(fx + tx) / 2 + Math.cos(yaw) * px, VIADUCT_HEIGHT + 0.22, (fz + tz) / 2 - Math.sin(yaw) * px]}
          rotation={[0, yaw, 0]}
        >
          <boxGeometry args={[0.14, 0.42, totalLength]} />
          <meshStandardMaterial color="#9FA6B5" roughness={0.6} />
        </mesh>
      ))}

      {/* Structural Piers / Columns (Supporting the entire elevated viaduct smoothly) */}
      {Array.from({ length: pillars + 1 }, (_, i) => {
        const t = (i / pillars) * (totalLength / length) - ((totalLength - length) / (2 * length))
        return (
          <group key={i} position={[fx + dx * t, 0, fz + dz * t]} rotation={[0, yaw, 0]}>
            <mesh position={[0, VIADUCT_HEIGHT / 2, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.42, VIADUCT_HEIGHT, 12]} />
              <meshStandardMaterial color="#B0B6C4" roughness={0.65} />
            </mesh>
            {/* Column Pier Cap */}
            <mesh position={[0, VIADUCT_HEIGHT - 0.15, 0]} castShadow>
              <boxGeometry args={[1.7, 0.3, 0.6]} />
              <meshStandardMaterial color="#9DA4B2" roughness={0.6} />
            </mesh>
          </group>
        )
      })}

      {/* SPU MRT EXIT 2 STATION CANOPY & SKYWALK CONNECTOR */}
      {/* Sits elevated right by the widened entry building [-15, -1] */}
      <group position={[-16.5, VIADUCT_HEIGHT, -1.0]} rotation={[0, yaw, 0]}>
        {/* Station Platform Canopy */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.6, 0.15, 8.5]} />
          <meshStandardMaterial color="#252A36" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Translucent Station Glass Roof */}
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[2.4, 0.06, 8.2]} />
          <meshPhysicalMaterial
            color="#A8E0FF"
            transmission={0.4}
            roughness={0.1}
            clearcoat={1}
            reflectivity={0.9}
          />
        </mesh>
        {/* Steel Arch Trusses */}
        {[-3.2, -1.6, 0, 1.6, 3.2].map((tzPos, idx) => (
          <group key={idx} position={[0, 0.6, tzPos]}>
            <mesh>
              <torusGeometry args={[1.25, 0.05, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#4A5263" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Illuminated Bang Bua (N15) Station Banner */}
        <mesh position={[1.35, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[5.2, 0.4]} />
          <meshStandardMaterial
            color="#00A859"
            emissive="#00A859"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Skywalk Corridor descending to SPU Gate */}
        <mesh position={[1.8, -0.6, 0.5]} rotation={[0.2, -Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[1.2, 0.2, 4.2]} />
          <meshStandardMaterial color="#8E96A6" />
        </mesh>

        {/* Station Platform Warm Downlight */}
        <pointLight position={[0, 0.8, 0]} color="#FFF0D0" intensity={3.5} distance={12} decay={2} />
      </group>

      {/* MODERN LIT COMMUTER TRAIN (Bangkok Green Line / Sukhumvit Line) */}
      <group ref={train} rotation={[0, yaw, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[0, 0, -i * 2.85]}>
            {/* Train Car Body (White pearl) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.18, 0.85, 2.7]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.3} roughness={0.2} />
            </mesh>
            {/* Bangkok Green & SPU Blue Livery Stripes */}
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[1.2, 0.12, 2.72]} />
              <meshStandardMaterial color="#00A859" />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[1.2, 0.08, 2.72]} />
              <meshStandardMaterial color="#1B4D9B" />
            </mesh>

            {/* Neon Under-chassis Track Glow (Bangkok Green Line emerald-cyan glow) */}
            <mesh position={[0, -0.44, 0]}>
              <boxGeometry args={[1.05, 0.04, 2.6]} />
              <meshBasicMaterial color="#00FF99" />
            </mesh>

            {/* Cabin Windows with VIBRANT WARM GLOWING INTERIOR TRANSIT LIGHT */}
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[1.21, 0.28, 2.45]} />
              <meshStandardMaterial
                color="#FFE5A8"
                emissive="#FFE5A8"
                emissiveIntensity={2.5}
                roughness={0.1}
              />
            </mesh>
            {/* Window divider mullions & passenger silhouettes */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((mx) => (
              <mesh key={mx} position={[0, 0.12, mx]}>
                <boxGeometry args={[1.22, 0.29, 0.08]} />
                <meshStandardMaterial color="#1E293B" />
              </mesh>
            ))}

            {/* Air conditioning roof pods */}
            <mesh position={[0, 0.48, 0]}>
              <boxGeometry args={[0.7, 0.12, 1.8]} />
              <meshStandardMaterial color="#AAB0BE" metalness={0.6} roughness={0.3} />
            </mesh>

            {/* Front Car Cab Features (Lead car i===0) */}
            {i === 0 && (
              <>
                {/* Aerodynamic windshield */}
                <mesh position={[0, 0.14, 1.36]} rotation={[0.2, 0, 0]}>
                  <boxGeometry args={[0.95, 0.4, 0.06]} />
                  <meshPhysicalMaterial color="#1A2433" roughness={0.1} metalness={0.6} clearcoat={1} />
                </mesh>

                {/* Glowing LED Destination Display: "N15 SPU BANG BUA" */}
                <mesh position={[0, 0.38, 1.35]} rotation={[0.2, 0, 0]}>
                  <boxGeometry args={[0.75, 0.1, 0.03]} />
                  <meshStandardMaterial color="#00FF88" emissive="#00FF88" emissiveIntensity={3.0} />
                </mesh>

                {/* Twin High-Intensity Projector LED Headlights */}
                <mesh position={[0.35, -0.12, 1.38]}>
                  <sphereGeometry args={[0.09, 12, 12]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFF2CC" emissiveIntensity={4.0} />
                </mesh>
                <mesh position={[-0.35, -0.12, 1.38]}>
                  <sphereGeometry args={[0.09, 12, 12]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFF2CC" emissiveIntensity={4.0} />
                </mesh>

                {/* Forward Projecting Headlight Cones (Volumetric Track Illumination) */}
                <mesh position={[0.35, -0.16, 2.8]} rotation={[Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.55, 2.9, 16, 1, true]} />
                  <meshBasicMaterial color="#FFFDE7" transparent opacity={0.35} side={DoubleSide} />
                </mesh>
                <mesh position={[-0.35, -0.16, 2.8]} rotation={[Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.55, 2.9, 16, 1, true]} />
                  <meshBasicMaterial color="#FFFDE7" transparent opacity={0.35} side={DoubleSide} />
                </mesh>

                {/* Real Three.js Headlight illuminating tracks and station */}
                <pointLight position={[0, 0, 2.2]} color="#FFF8D6" intensity={4.5} distance={16} decay={1.8} />
              </>
            )}

            {/* Rear Car Taillights (Trailing car i===3) */}
            {i === 3 && (
              <>
                <mesh position={[0.35, -0.12, -1.38]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial color="#E60000" emissive="#FF1744" emissiveIntensity={3.5} />
                </mesh>
                <mesh position={[-0.35, -0.12, -1.38]}>
                  <sphereGeometry args={[0.08, 12, 12]} />
                  <meshStandardMaterial color="#E60000" emissive="#FF1744" emissiveIntensity={3.5} />
                </mesh>
                {/* Red Taillight Streak Trails */}
                <mesh position={[0.35, -0.12, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.15, 1.6]} />
                  <meshBasicMaterial color="#FF1744" transparent opacity={0.5} />
                </mesh>
                <mesh position={[-0.35, -0.12, -2.2]} rotation={[Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.15, 1.6]} />
                  <meshBasicMaterial color="#FF1744" transparent opacity={0.5} />
                </mesh>
              </>
            )}
          </group>
        ))}
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- front road (Phahonyothin) -- */

function FrontRoad() {
  const asphalt = useMemo(() => getAsphaltTexture(), [])
  const [fx, fz] = MRT_LINE.from
  const [tx, tz] = MRT_LINE.to
  const dx = tx - fx
  const dz = tz - fz
  const length = Math.hypot(dx, dz) + 24
  const yaw = Math.atan2(dx, dz)
  const roadWidth = 4.2

  return (
    <group position={[(fx + tx) / 2 + 1.2, 0.03, (fz + tz) / 2 - 1.2]} rotation={[0, yaw, 0]}>
      {/* Road solid bed with slight depth to eliminate shadow acne & z-fighting */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[roadWidth, 0.06, length]} />
        <meshStandardMaterial
          color="#22242A"
          map={asphalt ?? undefined}
          roughness={0.85}
        />
      </mesh>

      {/* Concrete roadside curbs */}
      {[-roadWidth / 2 - 0.1, roadWidth / 2 + 0.1].map((cx, idx) => (
        <mesh key={idx} position={[cx, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.12, length]} />
          <meshStandardMaterial color="#B0B6C2" roughness={0.6} />
        </mesh>
      ))}

      {/* Dashed center lane divider */}
      {Array.from({ length: Math.floor(length / 2.2) }, (_, i) => (
        <mesh key={i} position={[0, 0.032, -length / 2 + i * 2.2 + 1.1]}>
          <boxGeometry args={[0.12, 0.005, 1.1]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Outer solid lane boundary lines */}
      <mesh position={[-roadWidth / 2 + 0.14, 0.032, 0]}>
        <boxGeometry args={[0.12, 0.005, length]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[roadWidth / 2 - 0.14, 0.032, 0]}>
        <boxGeometry args={[0.12, 0.005, length]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- main ground -- */

export default function Ground({ onWalk }: { onWalk: (x: number, z: number) => void }) {
  const paving = useMemo(() => getPavingTexture(), [])

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onWalk(e.point.x, e.point.z)
  }

  return (
    <group>
      {/* Expansive Surrounding Landscape (Vibrant university lawn extending smoothly to horizon) */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <planeGeometry args={[360, 360]} />
        <meshStandardMaterial color="#4EA342" roughness={0.92} />
      </mesh>

      {/* SPU Campus Boundary Base: Spacious open university precinct */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <planeGeometry args={[84, 76]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.grass} roughness={0.85} />
      </mesh>

      {/* Crisp Architectural Campus Perimeter Curbs */}
      <mesh position={[0, 0.005, -38]}>
        <boxGeometry args={[84.2, 0.08, 0.3]} />
        <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.005, 38]}>
        <boxGeometry args={[84.2, 0.08, 0.3]} />
        <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
      </mesh>
      <mesh position={[42, 0.005, 0]}>
        <boxGeometry args={[0.3, 0.08, 76.2]} />
        <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
      </mesh>
      <mesh position={[-42, 0.005, 0]}>
        <boxGeometry args={[0.3, 0.08, 76.2]} />
        <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
      </mesh>

      {/* Front Highway (Phahonyothin Road alongside the MRT) */}
      <FrontRoad />

      {/* Car Parks with Parked Cars */}
      {CAR_PARKS.map((c) => (
        <CarPark key={c.at.join()} {...c} />
      ))}

      {/* Central Plaza (Grand 5.2m Radius Promenade Paved with modern pavers) */}
      <mesh position={[PLAZA_CENTER[0], 0.04, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.2, 48]} />
        <meshStandardMaterial color="#F5EFE6" map={paving ?? undefined} roughness={0.7} />
      </mesh>
      {/* Outer Plaza Ring / Step */}
      <mesh position={[PLAZA_CENTER[0], 0.038, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.6, 48]} />
        <meshStandardMaterial color="#A9AFBC" roughness={0.6} />
      </mesh>
      {/* Inner decorative star / compass inlay */}
      <mesh position={[PLAZA_CENTER[0], 0.042, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.5, 36]} />
        <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.5} />
      </mesh>

      {/* SPU Iconic Monument at Crossroads */}
      <group position={[PLAZA_CENTER[0], 0, PLAZA_CENTER[1]]}>
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.5, 0.8]} />
          <meshStandardMaterial color="#2B2E38" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[2.2, 0.65, 0.28]} />
          <meshStandardMaterial
            color={CAMPUS_PALETTE.spuPink}
            emissive={CAMPUS_PALETTE.spuPink}
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.7, 0.16]}>
          <planeGeometry args={[1.8, 0.42]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Wide Paved Walkways Connecting the Plaza to Every Building Door */}
      {BUILDINGS.map((b) => (
        <Path key={b.id} from={PLAZA_CENTER} to={doorPoint(b)} width={3.2} />
      ))}

      {/* Entrance Landing Courtyards / Aprons at Every Building Door */}
      {BUILDINGS.map((b) => {
        const dp = doorPoint(b)
        return (
          <group key={`apron-${b.id}`} position={[dp[0], 0, dp[1]]}>
            <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[2.6, 32]} />
              <meshStandardMaterial color="#F2EDE4" map={paving ?? undefined} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.55, 2.75, 32]} />
              <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.5} />
            </mesh>
          </group>
        )
      })}

      {/* REFLECTIVE ARCHITECTURAL POND (Matching SPU Official Map Blueprint) */}
      <group position={[POND.at[0], 0, POND.at[1]]}>
        {/* Deep Reflective Water (meshPhysicalMaterial for true water reflections) */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.5, 6.2]} />
          <meshPhysicalMaterial
            color="#143A52"
            roughness={0.04}
            metalness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            reflectivity={0.95}
            transmission={0.2}
          />
        </mesh>
        {/* Architectural Granite Curb Coping */}
        <mesh position={[0, 0.08, -3.15]} receiveShadow>
          <boxGeometry args={[8.9, 0.12, 0.28]} />
          <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 3.15]} receiveShadow>
          <boxGeometry args={[8.9, 0.12, 0.28]} />
          <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
        </mesh>
        <mesh position={[-4.3, 0.08, 0]} receiveShadow>
          <boxGeometry args={[0.28, 0.12, 6.4]} />
          <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
        </mesh>
        <mesh position={[4.3, 0.08, 0]} receiveShadow>
          <boxGeometry args={[0.28, 0.12, 6.4]} />
          <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
        </mesh>

        {/* Modern Center Aerator / Fountain Jets */}
        {[-2.0, 0, 2.0].map((fx, i) => (
          <group key={i} position={[fx, 0, 0]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.06, 0.09, 0.6, 12]} />
              <meshStandardMaterial
                color="#E8F4FA"
                emissive="#A8D8F0"
                emissiveIntensity={0.8}
                metalness={0.1}
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}

        {/* SPU OFFICIAL MONUMENT SIGN (As shown in official 3D map) */}
        <group position={[3.2, 0, 3.4]} rotation={[0, -0.38, 0]}>
          <mesh position={[0, 0.2, 0]} receiveShadow>
            <boxGeometry args={[2.8, 0.4, 0.8]} />
            <meshStandardMaterial color="#2B2F3A" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.6, 0.75, 0.35]} />
            <meshStandardMaterial color="#F4F6FA" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.05, 0.18]} userData={{ glow: true }}>
            <boxGeometry args={[2.4, 0.08, 0.03]} />
            <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.9} />
          </mesh>
          <mesh position={[-0.8, 0.72, 0.19]}>
            <planeGeometry args={[0.5, 0.3]} />
            <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.3, 0.72, 0.19]}>
            <planeGeometry args={[1.4, 0.25]} />
            <meshStandardMaterial color="#20242E" roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* MRT Elevated Viaduct + Lit Train + Exit 2 Canopy */}
      <Viaduct />

      {/* Modern Street Lamps with Warm Evening Glow */}
      {LAMP_POSITIONS.map((pos, idx) => (
        <StreetLamp key={idx} position={pos} rotation={Math.sin(idx) * 0.5} />
      ))}

      {/* Modern Campus Benches */}
      {BENCH_POSITIONS.map((pos, idx) => (
        <ModernBench key={idx} position={pos} rotation={Math.atan2(pos[0], pos[2])} />
      ))}

      {/* Modern Planters (Boxwood Shrubs, No Trees) */}
      {PLANTER_POSITIONS.map((pos, idx) => (
        <ModernPlanter key={idx} position={pos} />
      ))}

      {/* ── Rich SPU Game Universe Scenery: Sports Court, Botanical Pavilion, Coffee Terrace, Mobility Hub, Sculpture & Lush Trees ── */}
      <CampusScenery />
    </group>
  )
}
