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

/** 2. FACULTY HALL (Building 11 / IT & Design Tower) */
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
      {/* Podium base */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[5.6, 0.5, 4.8]} />
        <meshStandardMaterial color="#9CA2B0" roughness={0.7} />
      </mesh>

      {/* Main Tower Body (Height ~8.4) */}
      <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.0, 8.0, 4.2]} />
        <meshStandardMaterial
          color="#E8EBF2"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Front Glass Facade with Window Texture */}
      <mesh position={[0, 4.5, 2.12]} castShadow receiveShadow>
        <planeGeometry args={[4.6, 7.2]} />
        <meshPhysicalMaterial
          color="#22384D"
          map={textures.diffuse ?? undefined}
          emissive="#FFE399"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.9}
          roughness={0.12}
          metalness={0.2}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Rear Glass Facade */}
      <mesh position={[0, 4.5, -2.12]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.6, 7.2]} />
        <meshPhysicalMaterial
          color="#22384D"
          map={textures.diffuse ?? undefined}
          emissive="#FFE399"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.12}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Architectural Aerodynamic Accent Fins (Iconic SPU Bldg 11 louvers) */}
      {[-2.1, -1.1, 0, 1.1, 2.1].map((fx, i) => (
        <mesh key={i} position={[fx, 4.5, 2.25]} castShadow userData={{ glow: true }}>
          <boxGeometry args={[0.08, 7.4, 0.35]} />
          <meshStandardMaterial
            color={i === 2 ? '#E89BC4' : color}
            emissive={i === 2 ? '#E89BC4' : color}
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Cantilevered Top Penthouse / Architectural Crown */}
      <mesh position={[0, 8.6, 0.2]} castShadow>
        <boxGeometry args={[5.3, 0.7, 4.5]} />
        <meshStandardMaterial color="#222530" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Top Building 11 Signage Strip */}
      <mesh position={[0, 8.6, 2.47]} userData={{ glow: true }}>
        <boxGeometry args={[3.2, 0.35, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.2} />
      </mesh>

      {/* Ground Floor Double-Height Glass Entrance Lobby */}
      <mesh position={[0, 1.1, 2.2]}>
        <boxGeometry args={[2.8, 1.8, 0.3]} />
        <meshPhysicalMaterial
          color="#A8D8F8"
          transmission={0.5}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
      {/* Entrance Canopy */}
      <mesh position={[0, 2.1, 2.6]} castShadow>
        <boxGeometry args={[3.2, 0.12, 1.2]} />
        <meshStandardMaterial color="#2B2F3D" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Front Entrance Door */}
      <mesh position={[0, 0.9, 2.36]}>
        <boxGeometry args={[1.2, 1.6, 0.04]} />
        <meshStandardMaterial color="#1E2028" metalness={0.8} roughness={0.2} />
      </mesh>
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

/** 6. LESSON PLANNING ROOM (Building 5 - Academic Studio) */
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
      {/* Plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.4, 3.9]} />
        <meshStandardMaterial color="#9197A4" roughness={0.7} />
      </mesh>

      {/* Modern offset stacked architectural volumes */}
      <mesh position={[-0.2, 2.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 4.4, 3.3]} />
        <meshStandardMaterial
          color="#E6E9F0"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Upper cantilevered conference glass cube */}
      <mesh position={[0.6, 4.2, 0.4]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.2, 2.4]} />
        <meshPhysicalMaterial
          color="#223C56"
          transmission={0.3}
          roughness={0.1}
          metalness={0.15}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Glass facade with window textures */}
      <mesh position={[-0.2, 2.4, 1.68]} castShadow receiveShadow>
        <planeGeometry args={[3.4, 3.8]} />
        <meshPhysicalMaterial
          color="#20364C"
          map={textures.diffuse ?? undefined}
          emissive="#FFDF8F"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Vertical architectural color fins in Faculty/Plan Blue */}
      {[-1.6, -1.0, -0.4, 0.2].map((fx, i) => (
        <mesh key={i} position={[fx, 2.4, 1.8]} castShadow userData={{ glow: true }}>
          <boxGeometry args={[0.08, 4.0, 0.26]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Rooftop academic terrace */}
      <mesh position={[-0.2, 4.65, 0]}>
        <boxGeometry args={[3.9, 0.15, 3.4]} />
        <meshStandardMaterial color="#323642" roughness={0.5} />
      </mesh>

      {/* Entrance */}
      <mesh position={[0, 0.8, 1.72]}>
        <boxGeometry args={[1.5, 1.4, 0.1]} />
        <meshPhysicalMaterial
          color="#9ED7EE"
          transmission={0.4}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  )
}
