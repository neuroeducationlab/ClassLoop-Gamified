import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Vector3, type Group, type Mesh } from 'three'
import { MRT_LINE, PLAZA_CENTER } from '@/data/buildings'

export type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night'

export interface SkyPreset {
  id: TimeOfDay
  label: { th: string; en: string }
  icon: string
  skyGradient: [string, string, string] // top, mid, horizon
  fogColor: string
  fogNear: number
  fogFar: number
  sunPos: [number, number, number]
  sunColor: string
  sunIntensity: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  showStars: boolean
  windowEmissiveBoost: number
}

export const SKY_PRESETS: Record<TimeOfDay, SkyPreset> = {
  morning: {
    id: 'morning',
    label: { th: 'เช้า', en: 'Morning' },
    icon: '🌅',
    skyGradient: ['#3A4E7A', '#F68B6E', '#FDE0A9'],
    fogColor: '#FDD5A6',
    fogNear: 55,
    fogFar: 140,
    sunPos: [20, 24, 14],
    sunColor: '#FFE5B4',
    sunIntensity: 2.2,
    hemiSky: '#FFF5E0',
    hemiGround: '#526173',
    hemiIntensity: 1.2,
    showStars: false,
    windowEmissiveBoost: 0.3,
  },
  midday: {
    id: 'midday',
    label: { th: 'กลางวัน', en: 'Midday' },
    icon: '☀️',
    skyGradient: ['#2563EB', '#60A5FA', '#BAE6FD'],
    fogColor: '#BAE6FD',
    fogNear: 65,
    fogFar: 160,
    sunPos: [12, 38, 14],
    sunColor: '#FFFFFF',
    sunIntensity: 2.6,
    hemiSky: '#FFFFFF',
    hemiGround: '#64748B',
    hemiIntensity: 1.4,
    showStars: false,
    windowEmissiveBoost: 0.1,
  },
  evening: {
    id: 'evening',
    label: { th: 'เย็น', en: 'Sunset' },
    icon: '🌇',
    skyGradient: ['#2A2858', '#99355D', '#F59E0B'],
    fogColor: '#E68A65',
    fogNear: 50,
    fogFar: 130,
    sunPos: [-14, 22, 14],
    sunColor: '#FDBA74',
    sunIntensity: 2.3,
    hemiSky: '#FED7AA',
    hemiGround: '#3730A3',
    hemiIntensity: 1.1,
    showStars: false,
    windowEmissiveBoost: 1.0,
  },
  night: {
    id: 'night',
    label: { th: 'ค่ำ/ดวงดาว', en: 'Night' },
    icon: '🌌',
    skyGradient: ['#070A14', '#0F172A', '#1E1B4B'],
    fogColor: '#0F172A',
    fogNear: 45,
    fogFar: 120,
    sunPos: [8, 25, -12], // Moon
    sunColor: '#A5B4FC',
    sunIntensity: 0.8,
    hemiSky: '#1E1B4B',
    hemiGround: '#020617',
    hemiIntensity: 0.6,
    showStars: true,
    windowEmissiveBoost: 2.2,
  },
}

/* ---------------------------------------------------------------- drifting thin clouds -- */

function ThinCloud({
  startPos,
  speed,
  scale = 1,
}: {
  startPos: [number, number, number]
  speed: number
  scale?: number
}) {
  const ref = useRef<Group>(null)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    // Drift gently along X axis
    g.position.x += dt * speed
    // Wrap around
    if (g.position.x > 70) g.position.x = -70
    // Subtle whimsical bobbing
    g.position.y = startPos[1] + Math.sin(state.clock.elapsedTime * 0.4 + startPos[0]) * 0.6
  })

  return (
    <group ref={ref} position={startPos} scale={scale}>
      {/* Soft rounded cloud puffs */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.4, 16, 12]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.65} roughness={1} />
      </mesh>
      <mesh position={[2.2, -0.3, 0.4]}>
        <sphereGeometry args={[1.8, 14, 10]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} roughness={1} />
      </mesh>
      <mesh position={[-2.0, -0.2, -0.3]}>
        <sphereGeometry args={[1.9, 14, 10]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.6} roughness={1} />
      </mesh>
      <mesh position={[0.8, 0.6, -0.2]}>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} roughness={1} />
      </mesh>
    </group>
  )
}

export function WhimsicalClouds() {
  const clouds = useMemo(
    () => [
      { startPos: [-45, 32, -25] as [number, number, number], speed: 1.1, scale: 1.3 },
      { startPos: [-10, 36, -38] as [number, number, number], speed: 0.9, scale: 1.6 },
      { startPos: [25, 30, -18] as [number, number, number], speed: 1.2, scale: 1.1 },
      { startPos: [-30, 34, 15] as [number, number, number], speed: 0.8, scale: 1.4 },
      { startPos: [15, 38, 28] as [number, number, number], speed: 1.0, scale: 1.5 },
      { startPos: [-55, 28, 5] as [number, number, number], speed: 1.3, scale: 1.0 },
    ],
    [],
  )

  return (
    <group>
      {clouds.map((c, i) => (
        <ThinCloud key={i} {...c} />
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- holographic SPU logo (Step 7) -- */

export function HolographicSPULogo({ position = [PLAZA_CENTER[0], 2.8, PLAZA_CENTER[1]] }: { position?: [number, number, number] }) {
  const groupRef = useRef<Group>(null)
  const ringRef1 = useRef<Mesh>(null)
  const ringRef2 = useRef<Mesh>(null)
  const diamondRef = useRef<Mesh>(null)

  useFrame((state, dt) => {
    const g = groupRef.current
    if (!g) return
    const t = state.clock.elapsedTime

    // Gentle float
    g.position.y = position[1] + Math.sin(t * 1.5) * 0.18

    // Counter-rotating tech rings
    if (ringRef1.current) ringRef1.current.rotation.z += dt * 0.8
    if (ringRef2.current) ringRef2.current.rotation.x += dt * 0.6
    if (diamondRef.current) diamondRef.current.rotation.y += dt * 1.0
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Upward vertical holographic light beacon */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.08, 0.45, 9, 16]} />
        <meshBasicMaterial color="#E89BC4" transparent opacity={0.25} />
      </mesh>

      {/* Central Holographic SPU Gem / Prism */}
      <mesh ref={diamondRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshPhysicalMaterial
          color="#FF3388"
          emissive="#FF2A85"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Outer Holographic Rings */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.2, 0.03, 16, 48]} />
        <meshBasicMaterial color="#60A5FA" transparent opacity={0.8} />
      </mesh>

      <mesh ref={ringRef2} rotation={[-Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.03, 16, 48]} />
        <meshBasicMaterial color="#F472B6" transparent opacity={0.7} />
      </mesh>

      {/* Ground light aura */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 2.8, 32]} />
        <meshBasicMaterial color="#EC4899" transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- moving light-trail traffic (Step 7) -- */

const ROAD_DIRECTION = new Vector3(
  MRT_LINE.to[0] - MRT_LINE.from[0],
  0,
  MRT_LINE.to[1] - MRT_LINE.from[1],
).normalize()
const ROAD_LENGTH = Math.hypot(
  MRT_LINE.to[0] - MRT_LINE.from[0],
  MRT_LINE.to[1] - MRT_LINE.from[1],
) + 24
const ROAD_YAW = Math.atan2(
  MRT_LINE.to[0] - MRT_LINE.from[0],
  MRT_LINE.to[1] - MRT_LINE.from[1],
)

type VehicleType = 'sedan' | 'taxi_pink' | 'taxi_green' | 'van' | 'bike'

interface VehicleConfig {
  type: VehicleType
  color: string
  speed: number
  startProgress: number
  lane: 'forward' | 'reverse' // forward = from -> to (left lane: -1.1); reverse = to -> from (left lane: +1.1)
  laneOffset?: number
}

function TrafficVehicle({
  type,
  color,
  speed,
  startProgress,
  lane,
  laneOffset = 0,
}: VehicleConfig) {
  const ref = useRef<Group>(null)
  const progress = useRef(startProgress)
  const isReverse = lane === 'reverse'
  // In Thailand (left-side drive):
  // Forward lane sits at negative X relative to road center (-1.1)
  // Reverse lane sits at positive X relative to road center (+1.1)
  const baseOffset = isReverse ? 1.1 + laneOffset : -1.1 + laneOffset
  const vehicleYaw = isReverse ? ROAD_YAW + Math.PI : ROAD_YAW

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    // Advance progress smoothly along the highway
    progress.current = (progress.current + (speed * dt) / ROAD_LENGTH) % 1
    const p = progress.current
    // For forward: travels from -0.5 to +0.5 of ROAD_LENGTH
    // For reverse: travels from +0.5 down to -0.5 of ROAD_LENGTH
    const dist = isReverse ? (0.5 - p) * ROAD_LENGTH : (p - 0.5) * ROAD_LENGTH
    const midX = (MRT_LINE.from[0] + MRT_LINE.to[0]) / 2 + 1.2
    const midZ = (MRT_LINE.from[1] + MRT_LINE.to[1]) / 2 - 1.2

    g.position.x = midX + ROAD_DIRECTION.x * dist + Math.cos(ROAD_YAW) * baseOffset
    g.position.z = midZ + ROAD_DIRECTION.z * dist - Math.sin(ROAD_YAW) * baseOffset
  })

  return (
    <group ref={ref} position={[0, 0.08, 0]} rotation={[0, vehicleYaw, 0]} scale={0.72}>
      {/* ── Vehicle specific geometry: length is along Z, width along X ── */}
      {type === 'bike' ? (
        <group>
          {/* Motorbike Body */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.3, 0.35, 1.1]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Handlebar & Windscreen */}
          <mesh position={[0, 0.48, 0.28]}>
            <boxGeometry args={[0.45, 0.12, 0.08]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          {/* Driver Helmet */}
          <mesh position={[0, 0.65, -0.05]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#F97316" roughness={0.3} />
          </mesh>
          {/* Delivery Box / Carrier */}
          <mesh position={[0, 0.48, -0.38]} castShadow>
            <boxGeometry args={[0.38, 0.32, 0.36]} />
            <meshStandardMaterial color="#EA580C" />
          </mesh>
          {/* Single Bright Front Headlamp */}
          <mesh position={[0, 0.28, 0.56]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#FFFDE7" />
          </mesh>
          {/* Forward Light Beam */}
          <mesh position={[0, 0.12, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.45, 1.3]} />
            <meshBasicMaterial color="#FFF9C4" transparent opacity={0.35} />
          </mesh>
          {/* Red Tail Light */}
          <mesh position={[0, 0.28, -0.56]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </group>
      ) : type === 'van' ? (
        <group>
          {/* High-roof Van Body */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.9, 0.58, 2.1]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} />
          </mesh>
          {/* Side Windows Strip */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.92, 0.22, 1.8]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 0.46, 0.95]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.82, 0.26, 0.08]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} />
          </mesh>
          {/* Headlights */}
          <mesh position={[0.32, 0.25, 1.06]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.32, 0.25, 1.06]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Forward Light Beams */}
          <mesh position={[0, 0.12, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.8, 1.5]} />
            <meshBasicMaterial color="#FFF9C4" transparent opacity={0.3} />
          </mesh>
          {/* Taillights */}
          <mesh position={[0.32, 0.3, -1.06]}>
            <boxGeometry args={[0.08, 0.22, 0.04]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          <mesh position={[-0.32, 0.3, -1.06]}>
            <boxGeometry args={[0.08, 0.22, 0.04]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
        </group>
      ) : (
        /* Sedan & Taxis */
        <group>
          {/* Lower Chassis */}
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.84, 0.28, 1.72]} />
            <meshStandardMaterial
              color={type === 'taxi_green' ? '#10B981' : color}
              metalness={0.4}
              roughness={0.25}
            />
          </mesh>

          {/* Cabin & Roof */}
          <mesh position={[0, 0.38, -0.06]} castShadow>
            <boxGeometry args={[0.74, 0.24, 0.96]} />
            <meshStandardMaterial
              color={type === 'taxi_green' ? '#FBBF24' : color}
              metalness={0.3}
              roughness={0.3}
            />
          </mesh>

          {/* Windshield (Front at +Z) */}
          <mesh position={[0, 0.37, 0.44]} rotation={[-0.45, 0, 0]}>
            <planeGeometry args={[0.68, 0.28]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} />
          </mesh>
          {/* Rear Window (Back at -Z) */}
          <mesh position={[0, 0.37, -0.56]} rotation={[0.45, Math.PI, 0]}>
            <planeGeometry args={[0.68, 0.28]} />
            <meshStandardMaterial color="#0F172A" roughness={0.1} />
          </mesh>

          {/* Bangkok Taxi Roof Sign Light */}
          {(type === 'taxi_pink' || type === 'taxi_green') && (
            <mesh position={[0, 0.54, -0.06]}>
              <boxGeometry args={[0.32, 0.08, 0.14]} />
              <meshStandardMaterial
                color="#FDE047"
                emissive="#FDE047"
                emissiveIntensity={1.8}
              />
            </mesh>
          )}

          {/* Glowing Front Headlights (at +Z) */}
          <mesh position={[0.3, 0.18, 0.86]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[-0.3, 0.18, 0.86]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>

          {/* Forward Headlight Ground Beam (Projects along +Z) */}
          <mesh position={[0, 0.08, 1.65]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.85, 1.5]} />
            <meshBasicMaterial color="#FFFDE7" transparent opacity={0.35} />
          </mesh>

          {/* Glowing Rear Taillights (at -Z) */}
          <mesh position={[0.3, 0.2, -0.86]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>
          <mesh position={[-0.3, 0.2, -0.86]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#EF4444" />
          </mesh>

          {/* Red Taillight Streak Trail (Extends backward along -Z) */}
          <mesh position={[0, 0.08, -1.55]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 1.3]} />
            <meshBasicMaterial color="#EF4444" transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export function MovingTraffic() {
  const vehicles = useMemo<VehicleConfig[]>(
    () => [
      // ── Forward Lane (Heading towards 'to', Thai left lane) ──
      { type: 'taxi_pink', color: '#EC4899', speed: 8.5, startProgress: 0.08, lane: 'forward' },
      { type: 'sedan', color: '#FFFFFF', speed: 9.2, startProgress: 0.42, lane: 'forward' },
      { type: 'bike', color: '#3B82F6', speed: 7.2, startProgress: 0.72, lane: 'forward', laneOffset: -0.3 },
      { type: 'van', color: '#CBD5E1', speed: 7.8, startProgress: 0.88, lane: 'forward' },

      // ── Reverse Lane (Heading towards 'from', Oncoming Thai left lane) ──
      { type: 'taxi_green', color: '#10B981', speed: 8.8, startProgress: 0.18, lane: 'reverse' },
      { type: 'sedan', color: '#2563EB', speed: 9.5, startProgress: 0.52, lane: 'reverse' },
      { type: 'bike', color: '#E11D48', speed: 7.0, startProgress: 0.68, lane: 'reverse', laneOffset: 0.3 },
      { type: 'sedan', color: '#E11D48', speed: 8.4, startProgress: 0.94, lane: 'reverse' },
    ],
    [],
  )

  return (
    <group>
      {vehicles.map((v, i) => (
        <TrafficVehicle key={i} {...v} />
      ))}
    </group>
  )
}

/* ---------------------------------------------------------------- SPU Universe Sky & Lighting ---------------------------------------------------------------- */

export function SPUUniverseEnvironment({
  timeOfDay = 'evening',
  isArriving = false,
}: {
  timeOfDay?: TimeOfDay
  isArriving?: boolean
}) {
  const preset = SKY_PRESETS[timeOfDay]

  return (
    <>
      {/* Atmospheric Fog */}
      <fog
        attach="fog"
        args={[
          preset.fogColor,
          isArriving ? 18 : preset.fogNear,
          isArriving ? 60 : preset.fogFar,
        ]}
      />

      {/* Dynamic Hemisphere and Sunlight */}
      <hemisphereLight args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]} />
      <directionalLight
        position={preset.sunPos}
        intensity={preset.sunIntensity}
        color={preset.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />

      {/* Whimsical Thin Clouds */}
      <WhimsicalClouds />

      {/* Starry Nightfield when Night */}
      {preset.showStars && (
        <Stars radius={95} depth={45} count={2200} factor={4} saturation={0} fade speed={1.2} />
      )}

      {/* Extra Wow: Holographic SPU Monument at Plaza (Step 7) */}
      <HolographicSPULogo />

      {/* Floating Ambient Light Motes & Whimsical Sparkles */}
      <FloatingCampusMotes />

      {/* Extra Wow: Moving Traffic with Light Trails on Phahonyothin Road (Step 7) */}
      <MovingTraffic />
    </>
  )
}

/* ---------------------------------------------------------------- floating magical motes -- */

export function FloatingCampusMotes({ count = 32 }: { count?: number }) {
  const motes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 48,
      y: 0.8 + Math.random() * 8,
      z: (Math.random() - 0.5) * 44,
      speed: 0.35 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      scale: 0.07 + Math.random() * 0.08,
      color: i % 3 === 0 ? '#F472B6' : i % 3 === 1 ? '#60A5FA' : '#FDE047',
    }))
  }, [count])

  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    const g = groupRef.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.children.forEach((child, i) => {
      const m = motes[i]
      if (!m) return
      // Upward drift with wrap-around and sinusoidal floating breeze
      child.position.y = ((m.y + t * m.speed) % 8.5) + 0.6
      child.position.x = m.x + Math.sin(t * 0.7 + m.phase) * 0.8
      child.position.z = m.z + Math.cos(t * 0.6 + m.phase) * 0.8
    })
  })

  return (
    <group ref={groupRef}>
      {motes.map((m, i) => (
        <mesh key={i} position={[m.x, m.y, m.z]} scale={m.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={m.color} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  )
}
