import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Color, MathUtils, type Group } from 'three'
import type { Building as BuildingConfig, BuildingShape } from '@/data/buildings'
import { facingPlaza } from '../geometry'
import { getConcreteTexture, getWindowGridTextures } from '../textures'

type Props = {
  building: BuildingConfig
  hovered: boolean
  onHover: (id: BuildingConfig['id'] | null) => void
  onSelect: (b: BuildingConfig) => void
}

export default function Building({ building, hovered, onHover, onSelect }: Props) {
  const group = useRef<Group>(null)
  const glow = useRef(0)

  // Smooth hover lift & glow
  useFrame((_, dt) => {
    glow.current = MathUtils.damp(glow.current, hovered ? 1 : 0, 10, dt)
    const g = group.current
    if (!g) return
    const s = 1 + glow.current * 0.04
    g.scale.set(s, s, s)
    g.position.y = glow.current * 0.35
    g.traverse((o) => {
      const mat = (o as { material?: { emissive?: Color; emissiveIntensity?: number } }).material
      if (mat?.emissive && o.userData.glow) {
        mat.emissiveIntensity = 0.3 + glow.current * 1.2
      }
    })
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(building.id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect(building)
  }

  const [x, z] = building.position

  return (
    <group position={[x, 0, z]} rotation={[0, facingPlaza(building.position), 0]}>
      <group ref={group} onPointerOver={over} onPointerOut={out} onClick={click}>
        <ModernShape shape={building.shape} color={building.color} name={building.name.th} />
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- modern shapes -- */

function ModernShape({
  shape,
  color,
  name,
}: {
  shape: BuildingShape
  color: string
  name: string
}) {
  const textures = useMemo(() => getWindowGridTextures(), [])
  const concrete = useMemo(() => getConcreteTexture(), [])

  switch (shape) {
    case 'gate':
      return <ModernGate color={color} />
    case 'hall':
      return <ModernFacultyHall color={color} textures={textures} concrete={concrete} name={name} />
    case 'arena':
      return <ModernArena color={color} />
    case 'house':
      return <ModernDorm color={color} textures={textures} concrete={concrete} />
    case 'hub':
      return <ModernDataHub color={color} textures={textures} concrete={concrete} />
    case 'office':
      return <ModernPlanOffice color={color} textures={textures} concrete={concrete} />
    case 'library':
      return <ModernLibrary color={color} textures={textures} concrete={concrete} />
    case 'union':
      return <ModernUnion color={color} textures={textures} concrete={concrete} />
    case 'lounge':
      return <ModernLounge color={color} textures={textures} concrete={concrete} />
  }
}

/** 1. GATE / SPU MRT Exit 2 Canopy & Grand Campus Portal */
function ModernGate({ color }: { color: string }) {
  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.2, 2.6]} />
        <meshStandardMaterial color="#888E9B" roughness={0.7} />
      </mesh>

      {/* Main architectural portal pylons */}
      {[-2.1, 2.1].map((px) => (
        <group key={px} position={[px, 0, 0]}>
          <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 4.4, 1.2]} />
            <meshStandardMaterial color="#2B2E38" metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Vertical illuminated accent fin */}
          <mesh position={[px > 0 ? 0.38 : -0.38, 2.2, 0.3]} userData={{ glow: true }}>
            <boxGeometry args={[0.08, 4.2, 0.4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Grand Overhead Bridge / Canopy */}
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 0.6, 1.6]} />
        <meshStandardMaterial color="#222530" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* SPU Exit 2 Illuminated LED Signboard */}
      <mesh position={[0, 4.2, 0.82]} userData={{ glow: true }}>
        <boxGeometry args={[3.8, 0.45, 0.04]} />
        <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.9} />
      </mesh>

      {/* Glass Entrance Canopy */}
      <mesh position={[0, 3.4, 0.9]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[4.2, 0.08, 1.4]} />
        <meshPhysicalMaterial
          color="#8AC8EB"
          transmission={0.4}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Glass Entrance Turnstiles & Doors */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.2, 2.2, 0.1]} />
        <meshPhysicalMaterial
          color="#3A556A"
          roughness={0.1}
          transmission={0.3}
          clearcoat={1}
        />
      </mesh>
      {/* Turnstile gates */}
      {[-0.9, 0, 0.9].map((tx) => (
        <mesh key={tx} position={[tx, 0.5, 0.3]}>
          <boxGeometry args={[0.2, 0.9, 0.5]} />
          <meshStandardMaterial color="#D0D5E0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

/** 2. FACULTY HALL (Building 11 · 40 Years SPU & Building 1 · Dr. Sook Pookayaporn Complex) */
function ModernFacultyHall({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
  name: string
}) {
  return (
    <group>
      {/* ── BUILDING 11 (Rear High-Rise & Curved Glass Atrium) ── */}
      {/* Foundation podium */}
      <mesh position={[-0.4, 0.25, -1.2]} receiveShadow>
        <boxGeometry args={[7.2, 0.5, 4.4]} />
        <meshStandardMaterial color="#8E95A5" roughness={0.7} />
      </mesh>

      {/* Main Building 11 Tower Body (Height ~9.2) */}
      <mesh position={[-0.4, 5.0, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 9.2, 3.8]} />
        <meshStandardMaterial
          color="#E8EBF2"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.12}
        />
      </mesh>

      {/* Building 11 Right Wing Iconic Terracotta Accent Stripe (as seen on official map) */}
      <mesh position={[2.95, 5.0, -1.2]} castShadow>
        <boxGeometry args={[0.2, 9.0, 3.82]} />
        <meshStandardMaterial color="#A83232" roughness={0.7} />
      </mesh>

      {/* Building 11 Left Wing: Sweeping Curved Cyan Glass Facade */}
      <group position={[-1.8, 5.0, 0.72]}>
        {/* Curved Glass Front Segment */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 8.4, 24, 1, false, Math.PI * 0.75, Math.PI * 0.7]} />
          <meshPhysicalMaterial
            color="#1B4D68"
            emissive="#1B4D68"
            emissiveIntensity={0.2}
            roughness={0.08}
            metalness={0.25}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transmission={0.35}
            reflectivity={0.95}
          />
        </mesh>
        {/* Curved Vertical Aluminum Mullions with illuminated center accent fin */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((offset, idx) => (
          <mesh key={idx} position={[offset * 1.6, 0, 0.55]} castShadow userData={idx === 2 ? { glow: true } : undefined}>
            <boxGeometry args={[0.08, 8.6, 0.22]} />
            <meshStandardMaterial
              color={idx === 2 ? color : '#D8DEEA'}
              emissive={idx === 2 ? color : undefined}
              emissiveIntensity={idx === 2 ? 0.6 : 0}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* Building 11 Window Grid on Main Facade */}
      <mesh position={[-0.4, 5.2, 0.72]} castShadow receiveShadow>
        <planeGeometry args={[6.2, 7.8]} />
        <meshPhysicalMaterial
          color="#20384E"
          map={textures.diffuse ?? undefined}
          emissive="#FFE090"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.85}
          roughness={0.12}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Iconic Building 11 Arched Architectural Crown / Roof Curve */}
      <group position={[-0.4, 9.9, -1.0]}>
        {/* Cantilevered Top Penthouse */}
        <mesh castShadow>
          <boxGeometry args={[7.2, 0.6, 4.2]} />
          <meshStandardMaterial color="#20242E" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Sweeping Architectural Roof Arch */}
        <mesh position={[-1.2, 0.6, 0.5]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[4.4, 0.35, 3.2]} />
          <meshStandardMaterial color="#2B303C" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Illuminated SPU 40 Signboard */}
        <mesh position={[-0.4, 0.05, 2.12]} userData={{ glow: true }}>
          <boxGeometry args={[3.8, 0.4, 0.06]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.3} />
        </mesh>
      </group>

      {/* ── BUILDING 1 (Dr. Sook Pookayaporn Hall - Stepped Hexagonal in Front) ── */}
      <group position={[1.2, 0, 1.8]}>
        {/* Hexagonal Stepped Tower Base (Height 5.4) */}
        <mesh position={[0, 2.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 2.2, 5.4, 6]} />
          <meshStandardMaterial
            color="#F2F4F8"
            map={concrete ?? undefined}
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>

        {/* Stepped Upper Hexagonal Penthouse */}
        <mesh position={[0, 5.7, 0]} castShadow>
          <cylinderGeometry args={[1.4, 1.7, 1.0, 6]} />
          <meshStandardMaterial color="#E0E4EC" roughness={0.5} />
        </mesh>

        {/* Building 1 Horizontal Architectural Window Louver Rings */}
        {[1.4, 2.3, 3.2, 4.1, 5.0].map((ly) => (
          <mesh key={ly} position={[0, ly, 0]} castShadow>
            <cylinderGeometry args={[2.02, 2.02, 0.1, 6]} />
            <meshStandardMaterial color="#4A5262" metalness={0.5} roughness={0.3} />
          </mesh>
        ))}

        {/* Building 1 Stepped Front Entrance Terrace */}
        <mesh position={[0, 0.25, 1.8]} receiveShadow>
          <boxGeometry args={[3.4, 0.5, 1.8]} />
          <meshStandardMaterial color="#CAD0DC" roughness={0.65} />
        </mesh>

        {/* SPU Official Crest / Emblem on Building 1 Facade */}
        <mesh position={[0, 4.2, 1.82]} userData={{ glow: true }}>
          <circleGeometry args={[0.38, 24]} />
          <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.8} />
        </mesh>

        {/* ── 3 ICONIC CAMPUS FLAGPOLES (Thai Flag, SPU Pink, Blue) ── */}
        <group position={[0, 0.5, 2.3]}>
          {/* Thai National Flag (Center) */}
          <group position={[0, 0, 0]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 2.8, 8]} />
              <meshStandardMaterial color="#E0E4EC" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.28, 2.5, 0]}>
              <planeGeometry args={[0.55, 0.35]} />
              <meshStandardMaterial color="#E11D48" roughness={0.5} />
            </mesh>
            <mesh position={[0.28, 2.5, 0.005]}>
              <planeGeometry args={[0.55, 0.12]} />
              <meshStandardMaterial color="#1E40AF" roughness={0.5} />
            </mesh>
          </group>

          {/* SPU Pink Flag (Left) */}
          <group position={[-0.65, 0, 0]}>
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 2.6, 8]} />
              <meshStandardMaterial color="#E0E4EC" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.26, 2.35, 0]}>
              <planeGeometry args={[0.5, 0.32]} />
              <meshStandardMaterial color="#E89BC4" emissive="#E89BC4" emissiveIntensity={0.3} roughness={0.5} />
            </mesh>
          </group>

          {/* University Blue Flag (Right) */}
          <group position={[0.65, 0, 0]}>
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 2.6, 8]} />
              <meshStandardMaterial color="#E0E4EC" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.26, 2.35, 0]}>
              <planeGeometry args={[0.5, 0.32]} />
              <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={0.2} roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* Double-Height Glass Entrance Lobby & Canopy */}
        <mesh position={[0, 0.9, 1.95]}>
          <boxGeometry args={[1.8, 1.4, 0.2]} />
          <meshPhysicalMaterial color="#A4D8F0" transmission={0.5} roughness={0.1} clearcoat={1} />
        </mesh>
        <mesh position={[0, 1.65, 2.2]} castShadow>
          <boxGeometry args={[2.2, 0.1, 0.8]} />
          <meshStandardMaterial color="#20242E" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/** 3. ARENA (SPU Modern Sports Complex & Esports Amphitheater) */
function ModernArena({ color }: { color: string }) {
  return (
    <group>
      {/* Arena circular podium */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.4, 0.3, 32]} />
        <meshStandardMaterial color="#959BA8" roughness={0.7} />
      </mesh>

      {/* Modern Curved Glass Outer Ring */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.0, 3.1, 2.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#223B52"
          emissive={color}
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          transmission={0.2}
          reflectivity={0.9}
        />
      </mesh>

      {/* Glowing Neon Architectural Ring around the upper rim */}
      <mesh position={[0, 2.25, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ glow: true }}>
        <torusGeometry args={[3.02, 0.1, 12, 36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>

      {/* Tensile Cantilevered Membrane Roof Structure */}
      <mesh position={[0, 2.45, 0]} castShadow>
        <cylinderGeometry args={[2.0, 3.15, 0.35, 32, 1, true]} />
        <meshStandardMaterial color="#F4F6FA" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Center court / synthetic field */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.75, 32]} />
        <meshStandardMaterial color="#3A5BA0" roughness={0.8} />
      </mesh>
      {/* Arena Court Lines */}
      <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.08, 24]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Arena Floodlight / LED Towers */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        const lx = Math.sin(a) * 3.15
        const lz = Math.cos(a) * 3.15
        return (
          <group key={i} position={[lx, 0, lz]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#D2D6E0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 3.6, 0]} userData={{ glow: true }}>
              <boxGeometry args={[0.45, 0.3, 0.15]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFF4D6" emissiveIntensity={1.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** 4. HEART DORM (Building 6 - Student Residence & Wellness Center) */
function ModernDorm({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.4, 3.8]} />
        <meshStandardMaterial color="#949AA6" roughness={0.7} />
      </mesh>

      {/* Modern High-rise Residential Tower */}
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 6.4, 3.2]} />
        <meshStandardMaterial
          color="#EAEDF5"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Glass facade with residential grid */}
      <mesh position={[0, 3.5, 1.62]} castShadow receiveShadow>
        <planeGeometry args={[3.4, 5.6]} />
        <meshPhysicalMaterial
          color="#223C4D"
          map={textures.diffuse ?? undefined}
          emissive="#FFDE94"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.85}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Balcony horizontal bands & modern sunshades */}
      {[1.6, 2.7, 3.8, 4.9, 6.0].map((by) => (
        <group key={by} position={[0, by, 1.7]}>
          <mesh castShadow>
            <boxGeometry args={[3.6, 0.12, 0.25]} />
            <meshStandardMaterial color="#DCE0EB" roughness={0.4} />
          </mesh>
          {/* Glass balcony railing */}
          <mesh position={[0, 0.2, 0.1]}>
            <boxGeometry args={[3.4, 0.3, 0.04]} />
            <meshPhysicalMaterial
              color="#A0DCF0"
              transmission={0.4}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}

      {/* Cantilevered Glass Wellness Sky-Lounge */}
      <mesh position={[1.1, 5.2, -0.2]} castShadow>
        <boxGeometry args={[1.8, 1.6, 2.0]} />
        <meshPhysicalMaterial
          color="#38B2A3"
          transmission={0.3}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Glowing Neon Heart Architectural Beacon on the facade */}
      <group position={[0, 5.8, 1.76]} scale={0.26} userData={{ glow: true }}>
        {[-0.6, 0.6].map((hx) => (
          <mesh key={hx} position={[hx, 0.4, 0]}>
            <sphereGeometry args={[0.7, 16, 14]} />
            <meshStandardMaterial color="#F25F5C" emissive="#F25F5C" emissiveIntensity={1.0} />
          </mesh>
        ))}
        <mesh position={[0, -0.45, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[1.18, 1.6, 20]} />
          <meshStandardMaterial color="#F25F5C" emissive="#F25F5C" emissiveIntensity={1.0} />
        </mesh>
      </group>

      {/* Glass Entrance Lobby */}
      <mesh position={[0, 0.8, 1.65]}>
        <boxGeometry args={[2.2, 1.4, 0.2]} />
        <meshPhysicalMaterial
          color="#90D5E8"
          transmission={0.4}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      {/* Front canopy */}
      <mesh position={[0, 1.55, 1.95]} castShadow>
        <boxGeometry args={[2.6, 0.1, 0.7]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** 5. DATA & RESEARCH HUB (Building 9 - Library & Innovation Hub) */
function ModernDataHub({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.4, 4.2]} />
        <meshStandardMaterial color="#9197A4" roughness={0.7} />
      </mesh>

      {/* Bold cubic IT/Library Tower */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 6.0, 3.6]} />
        <meshStandardMaterial
          color="#E6E9F0"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Angled Glass Curtain Wall Atrium */}
      <mesh position={[0, 3.2, 1.82]} castShadow receiveShadow>
        <planeGeometry args={[3.8, 5.2]} />
        <meshPhysicalMaterial
          color="#1E3348"
          map={textures.diffuse ?? undefined}
          emissive="#FFD985"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.9}
          roughness={0.12}
          metalness={0.2}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Horizontal Architectural Sunshade Louvers in Data Orange */}
      {[1.8, 2.7, 3.6, 4.5, 5.4].map((ly, i) => (
        <mesh key={i} position={[0, ly, 1.92]} castShadow userData={{ glow: true }}>
          <boxGeometry args={[4.0, 0.08, 0.28]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Glowing Vertical Data Bar Sign on the facade */}
      <group position={[-1.2, 3.8, 1.95]} userData={{ glow: true }}>
        {[0.5, 1.0, 0.75, 1.25].map((h, i) => (
          <mesh key={i} position={[i * 0.32, h / 2, 0]}>
            <boxGeometry args={[0.2, h, 0.08]} />
            <meshStandardMaterial
              color="#FFA733"
              emissive="#FFA733"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Rooftop Solar Pergola / Innovation Observation Deck */}
      <mesh position={[0, 6.35, 0]} castShadow>
        <boxGeometry args={[4.4, 0.3, 3.8]} />
        <meshStandardMaterial color="#2B2E38" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Glass Entrance */}
      <mesh position={[0.6, 0.8, 1.85]}>
        <boxGeometry args={[1.8, 1.4, 0.15]} />
        <meshPhysicalMaterial
          color="#A2DCF2"
          transmission={0.4}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  )
}

/** 6. LESSON PLANNING ROOM (Building 5 · Siam Boromrajakumari Hall) */
function ModernPlanOffice({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Foundation plinth */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[6.0, 0.5, 5.0]} />
        <meshStandardMaterial color="#8E95A5" roughness={0.7} />
      </mesh>

      {/* ── MAIN TOWER BODY (12-Story Academic High-Rise) ── */}
      <mesh position={[0, 4.8, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 8.6, 4.2]} />
        <meshStandardMaterial
          color="#EAEDF4"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.12}
        />
      </mesh>

      {/* Front High-Rise Window Facade */}
      <mesh position={[0, 5.2, 1.82]} castShadow receiveShadow>
        <planeGeometry args={[4.8, 6.8]} />
        <meshPhysicalMaterial
          color="#22364C"
          map={textures.diffuse ?? undefined}
          emissive="#FFDF8F"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.85}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Rear High-Rise Window Facade */}
      <mesh position={[0, 5.2, -2.42]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.8, 6.8]} />
        <meshPhysicalMaterial
          color="#22364C"
          map={textures.diffuse ?? undefined}
          emissive="#FFDF8F"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Rooftop Parapet and Mechanical Plant Room */}
      <mesh position={[0, 9.25, -0.3]} castShadow>
        <boxGeometry args={[5.4, 0.4, 4.4]} />
        <meshStandardMaterial color="#2B303C" roughness={0.5} />
      </mesh>
      <mesh position={[0, 10.0, -0.3]} castShadow>
        <boxGeometry args={[3.6, 1.2, 2.8]} />
        <meshStandardMaterial color="#5A6272" roughness={0.6} />
      </mesh>

      {/* ── ICONIC 2-STORY REDDISH-TERRACOTTA BRICK ENTRANCE BASE ── */}
      {/* As prominently featured in the real SPU photograph and official 3D map */}
      <group position={[0, 0, 1.2]}>
        {/* Main Red Terracotta Brick Structure */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.6, 2.8, 1.8]} />
          <meshStandardMaterial
            color="#9C3A2C" // Authentic SPU reddish-terracotta brick tone
            roughness={0.82}
            metalness={0.08}
          />
        </mesh>

        {/* Terracotta Brick Upper Cornice / Coffer Border */}
        <mesh position={[0, 2.85, 0]} castShadow>
          <boxGeometry args={[5.8, 0.25, 2.0]} />
          <meshStandardMaterial color="#7D2C20" roughness={0.85} />
        </mesh>

        {/* Flanking Grand Brick Portal Atrium Windows (Left & Right) */}
        {[-1.85, 1.85].map((wx) => (
          <group key={wx} position={[wx, 1.5, 0.92]}>
            {/* Recessed Atrium Glass */}
            <mesh>
              <planeGeometry args={[1.3, 2.1]} />
              <meshPhysicalMaterial
                color="#1B3850"
                transmission={0.4}
                roughness={0.1}
                clearcoat={1}
                reflectivity={0.9}
              />
            </mesh>
            {/* Window Mullions */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[0.06, 2.1, 0.04]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[1.3, 0.06, 0.04]} />
              <meshStandardMaterial color="#FFFFFF" metalness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Center Recessed Grand Entrance Portal Arch */}
        <mesh position={[0, 1.35, 0.4]} receiveShadow>
          <boxGeometry args={[2.0, 2.4, 1.2]} />
          <meshStandardMaterial color="#7D2C20" roughness={0.8} />
        </mesh>

        {/* Double-Height Glass Entrance Lobby */}
        <mesh position={[0, 1.0, 0.94]}>
          <planeGeometry args={[1.8, 1.8]} />
          <meshPhysicalMaterial
            color="#A8DCF2"
            transmission={0.5}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>

        {/* Illuminated Warm Entrance Lobby Light */}
        <mesh position={[0, 0.9, 0.7]}>
          <boxGeometry args={[1.6, 1.6, 0.2]} />
          <meshStandardMaterial
            color="#FFF4D6"
            emissive="#FFE6A3"
            emissiveIntensity={1.4}
          />
        </mesh>

        {/* Terracotta Entrance Cantilever Canopy */}
        <mesh position={[0, 2.1, 1.35]} castShadow>
          <boxGeometry args={[2.4, 0.12, 0.9]} />
          <meshStandardMaterial color="#2B303C" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Illuminated SPU Building 5 Badge */}
        <group position={[0, 2.5, 0.93]} userData={{ glow: true }}>
          <mesh>
            <boxGeometry args={[1.6, 0.38, 0.06]} />
            <meshStandardMaterial color="#1E2028" />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[1.4, 0.26]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.9}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/** 7. LEARNING LIBRARY (Modern Scandinavian University Study Cube) */
function ModernLibrary({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[6.4, 0.4, 5.0]} />
        <meshStandardMaterial color="#8E95A5" roughness={0.7} />
      </mesh>

      {/* Main Structural Core (White Concrete & Light Oak) */}
      <mesh position={[0, 3.4, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5.6, 6.4, 4.0]} />
        <meshStandardMaterial
          color="#F1F5F9"
          map={concrete ?? undefined}
          roughness={0.6}
          metalness={0.08}
        />
      </mesh>

      {/* Rear High-Rise Window Grid Facade */}
      <mesh position={[0, 4.2, -2.42]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[5.0, 4.8]} />
        <meshPhysicalMaterial
          color="#0F2840"
          map={textures.diffuse ?? undefined}
          emissive="#FFE6A3"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.7}
          roughness={0.12}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Double-Height Glass Curtain Atrium (Front) */}
      <mesh position={[0, 3.2, 1.62]} castShadow receiveShadow>
        <planeGeometry args={[5.2, 5.6]} />
        <meshPhysicalMaterial
          color="#0F2840"
          transmission={0.62}
          roughness={0.06}
          metalness={0.15}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Interior Study Sanctuary Visible Through Glass */}
      <group position={[0, 0.4, 0.8]}>
        {/* Warm wooden library interior floor */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[5.0, 0.05, 2.4]} />
          <meshStandardMaterial color="#D97706" roughness={0.5} />
        </mesh>

        {/* Ambient Warm Reading Light Core */}
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[3.6, 3.6, 1.2]} />
          <meshStandardMaterial
            color="#FFFBEB"
            emissive="#FEF3C7"
            emissiveIntensity={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Left & Right Bookshelves visible through the glass facade */}
        {[-1.8, 1.8].map((bx) => (
          <group key={bx} position={[bx, 0, 0.2]}>
            {/* Wooden shelf rack */}
            <mesh position={[0, 1.6, 0]} castShadow>
              <boxGeometry args={[1.0, 3.2, 0.45]} />
              <meshStandardMaterial color="#78350F" roughness={0.7} />
            </mesh>
            {/* Shelf dividers */}
            {[0.6, 1.2, 1.8, 2.4].map((sy) => (
              <mesh key={sy} position={[0, sy, 0.05]}>
                <boxGeometry args={[0.9, 0.04, 0.4]} />
                <meshStandardMaterial color="#5B2909" />
              </mesh>
            ))}
            {/* Colorful book rows on shelves */}
            {[
              { y: 0.9, c: '#3B82F6' },
              { y: 1.5, c: '#EF4444' },
              { y: 2.1, c: '#10B981' },
              { y: 2.7, c: '#F59E0B' },
            ].map((row, i) => (
              <mesh key={i} position={[0, row.y, 0.08]}>
                <boxGeometry args={[0.82, 0.24, 0.3]} />
                <meshStandardMaterial color={row.c} roughness={0.4} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Central Reading Table & Lamp */}
        <mesh position={[0, 0.7, 0.3]} castShadow>
          <boxGeometry args={[1.6, 0.08, 0.8]} />
          <meshStandardMaterial color="#A16207" roughness={0.6} />
        </mesh>
        {/* Glowing Table Reading Lamp */}
        <mesh position={[0, 1.05, 0.3]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FBBF24" emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* Vertical Blue Architectural Fins (Library Accent) */}
      {[-2.3, -1.15, 0, 1.15, 2.3].map((fx, i) => (
        <mesh key={i} position={[fx, 3.4, 1.74]} castShadow userData={{ glow: true }}>
          <boxGeometry args={[0.08, 5.8, 0.24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Cantilevered Top Parapet & Roof Skylight Box */}
      <mesh position={[0, 6.7, -0.4]} castShadow>
        <boxGeometry args={[5.8, 0.3, 4.2]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 7.1, -0.4]} castShadow>
        <boxGeometry args={[3.2, 0.5, 2.2]} />
        <meshPhysicalMaterial
          color="#38BDF8"
          transmission={0.5}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>

      {/* Entrance Glass Canopy */}
      <mesh position={[0, 1.5, 1.95]} castShadow>
        <boxGeometry args={[2.4, 0.08, 0.8]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Illuminated "SPU LIBRARY" Signboard */}
      <group position={[0, 2.0, 1.82]} userData={{ glow: true }}>
        <mesh>
          <boxGeometry args={[2.2, 0.42, 0.06]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[2.0, 0.3]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.1}
          />
        </mesh>
      </group>
    </group>
  )
}

/** 8. STUDENT UNION (Creative Social Hub, Café Pavilion & String Lights) */
function ModernUnion({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Warm Teak Deck Base */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[6.0, 0.3, 4.8]} />
        <meshStandardMaterial color="#9A3412" roughness={0.6} />
      </mesh>

      {/* Main Social Union Block */}
      <mesh position={[0, 3.0, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 5.6, 3.8]} />
        <meshStandardMaterial
          color="#FAF5FF"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Rear Social Window Grid Facade */}
      <mesh position={[0, 3.6, -2.32]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.8, 3.8]} />
        <meshPhysicalMaterial
          color="#2E1065"
          map={textures.diffuse ?? undefined}
          emissive="#E9D5FF"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.65}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Front Open Glass Café Bay */}
      <mesh position={[0, 2.2, 1.52]} castShadow receiveShadow>
        <planeGeometry args={[4.8, 3.8]} />
        <meshPhysicalMaterial
          color="#2E1065"
          transmission={0.58}
          roughness={0.08}
          metalness={0.15}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Interior Warm Café & Social Glow */}
      <group position={[0, 0.3, 0.6]}>
        {/* Warm Café Ambient Core */}
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[4.4, 2.8, 1.6]} />
          <meshStandardMaterial
            color="#FFFBEB"
            emissive="#FEF3C7"
            emissiveIntensity={0.85}
          />
        </mesh>

        {/* Café Service Counter */}
        <mesh position={[-1.2, 0.6, 0.4]} castShadow>
          <boxGeometry args={[1.4, 1.0, 0.6]} />
          <meshStandardMaterial color="#B45309" roughness={0.5} />
        </mesh>

        {/* Espresso Machine Silhouettes on Counter */}
        <mesh position={[-1.2, 1.25, 0.4]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Round Lounge Table inside */}
        <mesh position={[1.1, 0.5, 0.4]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.06, 12]} />
          <meshStandardMaterial color="#78350F" roughness={0.6} />
        </mesh>
      </group>

      {/* Pergola Entrance Trellis Canopy in Union Violet */}
      <group position={[0, 2.4, 1.95]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 0.1, 1.2]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Support Posts */}
        {[-1.45, 1.45].map((px) => (
          <mesh key={px} position={[px, -1.15, 0.5]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 2.3, 8]} />
            <meshStandardMaterial color="#1E1B4B" metalness={0.7} />
          </mesh>
        ))}

        {/* Hanging Warm Festoon String Lights under Pergola */}
        {[-1.0, -0.5, 0, 0.5, 1.0].map((lx) => (
          <group key={lx} position={[lx, -0.15, 0.2]}>
            {/* Small black cord */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.1, 6]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            {/* Glowing Bistro Bulb */}
            <mesh position={[0, -0.05, 0]} userData={{ glow: true }}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial
                color="#FEF08A"
                emissive="#FACC15"
                emissiveIntensity={3.0}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rooftop Student Terrace Balustrade */}
      <group position={[0, 5.9, -0.4]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[5.4, 0.2, 4.0]} />
          <meshStandardMaterial color="#1E1B4B" />
        </mesh>
        {/* Glass Railing */}
        <mesh position={[0, 0.6, 1.95]}>
          <planeGeometry args={[5.2, 0.8]} />
          <meshPhysicalMaterial
            color="#A78BFA"
            transmission={0.6}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Marquee Sign: "SPU STUDENT UNION" */}
      <group position={[0, 4.5, 1.55]} userData={{ glow: true }}>
        <mesh>
          <boxGeometry args={[3.0, 0.48, 0.08]} />
          <meshStandardMaterial color="#1E1B4B" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[2.8, 0.34]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>
    </group>
  )
}

/** 9. STAFF LOUNGE (Executive Faculty Suite & Wall of Monitors) */
function ModernLounge({
  color,
  textures,
  concrete,
}: {
  color: string
  textures: { diffuse: any; emissive: any }
  concrete: any
}) {
  return (
    <group>
      {/* Dark Charcoal Granite Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.4, 4.4]} />
        <meshStandardMaterial color="#1E222B" roughness={0.8} />
      </mesh>

      {/* Executive Limestone & Bronze Tower Block */}
      <mesh position={[0, 3.1, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 5.8, 3.8]} />
        <meshStandardMaterial
          color="#332E27"
          map={concrete ?? undefined}
          roughness={0.6}
          metalness={0.35}
        />
      </mesh>

      {/* Rear Executive Window Grid Facade */}
      <mesh position={[0, 3.6, -2.22]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.6, 3.8]} />
        <meshPhysicalMaterial
          color="#1A202C"
          map={textures.diffuse ?? undefined}
          emissive="#FEF08A"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Executive Glass Ribbon Window */}
      <mesh position={[0, 3.2, 1.62]} castShadow receiveShadow>
        <planeGeometry args={[4.6, 4.2]} />
        <meshPhysicalMaterial
          color="#1A202C"
          transmission={0.42}
          roughness={0.12}
          metalness={0.3}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Interior: Wall of 6 Command Monitors & Staff Coffee Station */}
      <group position={[0, 0.4, 0.7]}>
        {/* Ambient Warm Golden Interior Lighting */}
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[4.2, 3.2, 1.4]} />
          <meshStandardMaterial
            color="#FFFBEB"
            emissive="#FEF3C7"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* ── WALL OF 6 MONITORS (3 across x 2 high) ── */}
        <group position={[0, 2.6, 0.5]}>
          {/* Backing monitor wall board */}
          <mesh position={[0, 0, -0.05]}>
            <boxGeometry args={[3.2, 1.8, 0.1]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          {[-1.0, 0, 1.0].map((mx, cIdx) =>
            [0.45, -0.45].map((my, rIdx) => {
              const screenColor = (cIdx + rIdx) % 2 === 0 ? '#06B6D4' : '#F59E0B'
              return (
                <mesh
                  key={`${cIdx}-${rIdx}`}
                  position={[mx, my, 0.02]}
                  userData={{ glow: true }}
                >
                  <boxGeometry args={[0.9, 0.75, 0.04]} />
                  <meshStandardMaterial
                    color={screenColor}
                    emissive={screenColor}
                    emissiveIntensity={1.4}
                  />
                </mesh>
              )
            })
          )}
        </group>

        {/* Executive Staff Table & Coffee Counter */}
        <mesh position={[0, 0.6, 0.4]} castShadow>
          <boxGeometry args={[2.4, 0.1, 0.8]} />
          <meshStandardMaterial color="#78350F" roughness={0.4} />
        </mesh>
      </group>

      {/* Horizontal Architectural Sun Louvers in Staff Gold */}
      {[2.0, 2.8, 3.6, 4.4, 5.2].map((ly, i) => (
        <mesh key={i} position={[0, ly, 1.74]} castShadow userData={{ glow: true }}>
          <boxGeometry args={[4.8, 0.08, 0.22]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Rooftop Parapet in Dark Bronze */}
      <mesh position={[0, 6.1, -0.3]} castShadow>
        <boxGeometry args={[5.2, 0.3, 4.0]} />
        <meshStandardMaterial color="#1A1814" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* ── BOLD "STAFF ONLY · เฉพาะอาจารย์" SIGN OVER DOOR ── */}
      <group position={[0, 1.45, 1.85]} userData={{ glow: true }}>
        {/* Dark plaque backing */}
        <mesh castShadow>
          <boxGeometry args={[2.8, 0.62, 0.12]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} />
        </mesh>

        {/* Glowing Gold Plaque Inner Border */}
        <mesh position={[0, 0, 0.07]}>
          <planeGeometry args={[2.65, 0.48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* Inner Dark Badge with Security Lock Emblem */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[2.5, 0.38]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>

        {/* Lock / Keycard Emblem on the sign */}
        <group position={[-0.95, 0, 0.09]}>
          {/* Lock body */}
          <mesh>
            <boxGeometry args={[0.18, 0.16, 0.02]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.5} />
          </mesh>
          {/* Lock shackle hoop */}
          <mesh position={[0, 0.1, 0]}>
            <torusGeometry args={[0.07, 0.025, 8, 12, Math.PI]} />
            <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* Luminous Gold Text Bar Indicator */}
        <mesh position={[0.2, 0, 0.09]}>
          <boxGeometry args={[1.7, 0.16, 0.02]} />
          <meshStandardMaterial
            color="#FEF08A"
            emissive="#E0B04B"
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>

      {/* Entrance Glass Doorway */}
      <mesh position={[0, 0.7, 1.65]}>
        <boxGeometry args={[1.8, 1.3, 0.1]} />
        <meshPhysicalMaterial
          color="#94A3B8"
          transmission={0.3}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
    </group>
  )
}

