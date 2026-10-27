import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { BUILDINGS, CAMPUS_PALETTE, CAR_PARKS, MRT_LINE, PLAZA_CENTER, POND } from '@/data/buildings'
import { doorPoint } from '../geometry'
import { getAsphaltTexture, getPavingTexture } from '../textures'

export const CAMPUS_RADIUS = 22

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
  [-9, 0, 3],
  [-5, 0, 1],
  [3, 0, -2],
  [7, 0, -5],
  [12, 0, 1],
  [-2, 0, 4.5],
  [4, 0, 5],
  [-11, 0, -4],
  [-8, 0, -6],
  [9, 0, -8],
  [1, 0, -10],
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
  [-1.5, 0, 2.5],
  [3.5, 0, 2.5],
  [3.5, 0, -2.5],
  [-2.5, 0, -2.5],
  [8.5, 0, 5],
  [-7.5, 0, 3],
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
  [-4.5, 0, 4.5],
  [1.0, 0, 4.2],
  [6.5, 0, 3.8],
  [-6.5, 0, -4.5],
  [4.5, 0, -4.5],
  [11.5, 0, 4.5],
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

function Path({ from, to, width = 1.6 }: { from: [number, number]; to: [number, number]; width?: number }) {
  const paving = useMemo(() => getPavingTexture(), [])
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const length = Math.hypot(dx, dz)
  return (
    <mesh
      position={[(from[0] + to[0]) / 2, 0.035, (from[1] + to[1]) / 2]}
      rotation={[-Math.PI / 2, 0, -Math.atan2(dz, dx)]}
      receiveShadow
    >
      <planeGeometry args={[length, width]} />
      <meshStandardMaterial color="#E0DCD4" map={paving ?? undefined} roughness={0.8} />
    </mesh>
  )
}

/* ---------------------------------------------------------------- MRT viaduct & station canopy -- */

const VIADUCT_HEIGHT = 2.8
const TRAIN_LAP_SECONDS = 12

function Viaduct() {
  const train = useRef<Group>(null)
  const [fx, fz] = MRT_LINE.from
  const [tx, tz] = MRT_LINE.to
  const dx = tx - fx
  const dz = tz - fz
  const length = Math.hypot(dx, dz)
  const yaw = Math.atan2(dx, dz)
  const pillars = Math.floor(length / 3.4)

  useFrame((state) => {
    const g = train.current
    if (!g) return
    const t = ((state.clock.elapsedTime % TRAIN_LAP_SECONDS) / TRAIN_LAP_SECONDS) * 1.6 - 0.3
    g.position.set(fx + dx * t, VIADUCT_HEIGHT + 0.48, fz + dz * t)
  })

  return (
    <group>
      {/* Elevated Guideway Concrete Box Girder */}
      <mesh
        position={[(fx + tx) / 2, VIADUCT_HEIGHT, (fz + tz) / 2]}
        rotation={[0, yaw, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.5, 0.35, length + 8]} />
        <meshStandardMaterial color="#C4CAD6" roughness={0.5} />
      </mesh>

      {/* Viaduct Side Parapets */}
      {[-0.72, 0.72].map((px) => (
        <mesh
          key={px}
          position={[(fx + tx) / 2 + Math.cos(yaw) * px, VIADUCT_HEIGHT + 0.22, (fz + tz) / 2 - Math.sin(yaw) * px]}
          rotation={[0, yaw, 0]}
        >
          <boxGeometry args={[0.12, 0.4, length + 8]} />
          <meshStandardMaterial color="#9FA6B5" roughness={0.6} />
        </mesh>
      ))}

      {/* Structural Piers / Columns */}
      {Array.from({ length: pillars + 1 }, (_, i) => {
        const t = i / pillars
        return (
          <group key={i} position={[fx + dx * t, 0, fz + dz * t]} rotation={[0, yaw, 0]}>
            <mesh position={[0, VIADUCT_HEIGHT / 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.38, VIADUCT_HEIGHT, 12]} />
              <meshStandardMaterial color="#B0B6C4" roughness={0.65} />
            </mesh>
            {/* Column Pier Cap */}
            <mesh position={[0, VIADUCT_HEIGHT - 0.15, 0]} castShadow>
              <boxGeometry args={[1.6, 0.3, 0.6]} />
              <meshStandardMaterial color="#9DA4B2" roughness={0.6} />
            </mesh>
          </group>
        )
      })}

      {/* SPU MRT EXIT 2 STATION CANOPY & SKYWALK CONNECTOR */}
      {/* Sits elevated right by the entry building [-10, -1] */}
      <group position={[-11.5, VIADUCT_HEIGHT, -2]} rotation={[0, yaw, 0]}>
        {/* Station Platform Canopy */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.6, 0.15, 7.5]} />
          <meshStandardMaterial color="#252A36" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Translucent Station Glass Roof */}
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[2.4, 0.06, 7.2]} />
          <meshPhysicalMaterial
            color="#A8E0FF"
            transmission={0.4}
            roughness={0.1}
            clearcoat={1}
            reflectivity={0.9}
          />
        </mesh>
        {/* Steel Arch Trusses */}
        {[-3, -1.5, 0, 1.5, 3].map((tzPos, idx) => (
          <group key={idx} position={[0, 0.6, tzPos]}>
            <mesh>
              <torusGeometry args={[1.25, 0.05, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#4A5263" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}

        {/* Illuminated Bang Bua (N15) Station Banner */}
        <mesh position={[1.35, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.5, 0.4]} />
          <meshStandardMaterial
            color="#00A859"
            emissive="#00A859"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Skywalk Corridor descending to SPU Gate */}
        <mesh position={[1.8, -0.6, 0.5]} rotation={[0.2, -Math.PI / 4, 0]} castShadow>
          <boxGeometry args={[1.2, 0.2, 3.8]} />
          <meshStandardMaterial color="#8E96A6" />
        </mesh>
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
            {/* Cabin Windows with WARM GLOWING INTERIOR LIGHT */}
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[1.21, 0.28, 2.45]} />
              <meshStandardMaterial
                color="#FFE5A8"
                emissive="#FFE5A8"
                emissiveIntensity={1.5}
                roughness={0.1}
              />
            </mesh>
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
                {/* Twin High-Intensity LED Headlights */}
                <mesh position={[0.35, -0.12, 1.38]}>
                  <sphereGeometry args={[0.07, 12, 12]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFF2CC" emissiveIntensity={2.5} />
                </mesh>
                <mesh position={[-0.35, -0.12, 1.38]}>
                  <sphereGeometry args={[0.07, 12, 12]} />
                  <meshStandardMaterial color="#FFFFFF" emissive="#FFF2CC" emissiveIntensity={2.5} />
                </mesh>
              </>
            )}

            {/* Rear Car Taillights (Trailing car i===3) */}
            {i === 3 && (
              <>
                <mesh position={[0.35, -0.12, -1.38]}>
                  <sphereGeometry args={[0.07, 12, 12]} />
                  <meshStandardMaterial color="#E60000" emissive="#E60000" emissiveIntensity={2.0} />
                </mesh>
                <mesh position={[-0.35, -0.12, -1.38]}>
                  <sphereGeometry args={[0.07, 12, 12]} />
                  <meshStandardMaterial color="#E60000" emissive="#E60000" emissiveIntensity={2.0} />
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
  const length = Math.hypot(dx, dz) + 22
  const yaw = Math.atan2(dx, dz)
  const roadWidth = 3.8

  return (
    <group position={[(fx + tx) / 2 + 1.2, 0.02, (fz + tz) / 2 - 1.2]} rotation={[0, yaw, 0]}>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, length]} />
        <meshStandardMaterial color="#25272D" map={asphalt ?? undefined} roughness={0.85} />
      </mesh>
      {/* Dashed center lane divider */}
      {Array.from({ length: Math.floor(length / 2.2) }, (_, i) => (
        <mesh key={i} position={[0, 0.022, -length / 2 + i * 2.2 + 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 1.1]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {/* Outer curb lines */}
      <mesh position={[-roadWidth / 2 + 0.06, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, length]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[roadWidth / 2 - 0.06, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, length]} />
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
      {/* Expansive Outer Landscape (Full scale map with ample surrounding empty space) */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <circleGeometry args={[110, 64]} />
        <meshStandardMaterial color="#5E8C4A" roughness={0.95} />
      </mesh>

      {/* Campus Base Terrain / Modern Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={click}>
        <circleGeometry args={[38, 64]} />
        <meshStandardMaterial color={CAMPUS_PALETTE.grass} roughness={0.88} />
      </mesh>

      {/* Stylized Perimeter Border Ring */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[37.5, 38.2, 64]} />
        <meshStandardMaterial color="#CAD0DC" roughness={0.5} />
      </mesh>

      {/* Surrounding Perimeter Trees (Based on reference maps for clean, positive university vibe) */}
      {[
        [-22, 0, -18],
        [-16, 0, -22],
        [-8, 0, -24],
        [4, 0, -25],
        [15, 0, -22],
        [24, 0, -15],
        [26, 0, -5],
        [27, 0, 8],
        [22, 0, 18],
        [14, 0, 24],
        [2, 0, 26],
        [-10, 0, 23],
        [-20, 0, 16],
        [-25, 0, 4],
        [-26, 0, -8],
      ].map(([tx, ty, tz], i) => (
        <group key={i} position={[tx, ty, tz]} scale={0.9 + (i % 3) * 0.2}>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 1.4, 6]} />
            <meshStandardMaterial color="#4A3525" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.0, 0]} castShadow>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#548C38' : '#65A344'} roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.8, 0]} castShadow>
            <dodecahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color="#74B850" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Front Highway (Phahonyothin Road alongside the MRT) */}
      <FrontRoad />

      {/* Car Parks with Parked Cars */}
      {CAR_PARKS.map((c) => (
        <CarPark key={c.at.join()} {...c} />
      ))}

      {/* Central Plaza (Paved with modern pavers) */}
      <mesh position={[PLAZA_CENTER[0], 0.04, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.2, 36]} />
        <meshStandardMaterial color="#E0DCD4" map={paving ?? undefined} roughness={0.75} />
      </mesh>
      {/* Outer Plaza Ring / Step */}
      <mesh position={[PLAZA_CENTER[0], 0.038, PLAZA_CENTER[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.45, 36]} />
        <meshStandardMaterial color="#A9AFBC" roughness={0.6} />
      </mesh>

      {/* SPU Iconic Monument at Crossroads */}
      <group position={[PLAZA_CENTER[0], 0, PLAZA_CENTER[1]]}>
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.5, 0.7]} />
          <meshStandardMaterial color="#2B2E38" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[2.0, 0.65, 0.25]} />
          <meshStandardMaterial
            color={CAMPUS_PALETTE.spuPink}
            emissive={CAMPUS_PALETTE.spuPink}
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.7, 0.14]}>
          <planeGeometry args={[1.7, 0.4]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* Paved Walkways Connecting the Plaza to Every Building Door */}
      {BUILDINGS.map((b) => (
        <Path key={b.id} from={PLAZA_CENTER} to={doorPoint(b)} />
      ))}

      {/* REFLECTIVE ARCHITECTURAL POND */}
      <group position={[POND.at[0], 0, POND.at[1]]}>
        {/* Deep Reflective Water (meshPhysicalMaterial for true water reflections) */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[POND.r, 48]} />
          <meshPhysicalMaterial
            color="#143A52"
            roughness={0.04}
            metalness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.04}
            reflectivity={0.95}
            transmission={0.15}
          />
        </mesh>
        {/* Architectural Granite Curb Coping */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[POND.r - 0.05, POND.r + 0.35, 48]} />
          <meshStandardMaterial color="#C5CAD6" roughness={0.5} />
        </mesh>
        {/* Modern Center Aerator / Fountain Jet */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.7, 12]} />
          <meshStandardMaterial
            color="#E8F4FA"
            emissive="#A8D8F0"
            emissiveIntensity={0.8}
            metalness={0.1}
            roughness={0.1}
          />
        </mesh>
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
    </group>
  )
}
