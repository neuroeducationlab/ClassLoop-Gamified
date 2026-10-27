import { useMemo } from 'react'
import { getConcreteTexture, getWindowGridTextures } from '../textures'

interface ContextBuildingDef {
  num: number
  name: string
  position: [x: number, y: number, z: number]
  size: [w: number, h: number, d: number]
  accentColor: string
  rotation?: number
}

const CONTEXT_BUILDINGS: ContextBuildingDef[] = [
  {
    num: 2,
    name: 'SPU 2 · อาคาร 2 (4 ชั้น เลียบทางรถไฟฟ้า)',
    position: [-12.0, 0, 7.5],
    size: [7.2, 3.6, 2.2],
    accentColor: '#3A86FF',
    rotation: 0.74, // Parallel to the elevated BTS viaduct
  },
  {
    num: 8,
    name: 'SPU 8 · สำนักงานกลาง',
    position: [-4.0, 0, -21.0],
    size: [4.4, 5.8, 3.4],
    accentColor: '#FF006E',
  },
  {
    num: 10,
    name: 'SPU 10 · กิจกรรมนักศึกษาและโภชนาการ',
    position: [4.5, 0, -21.0],
    size: [6.5, 5.6, 4.4],
    accentColor: '#06D6A0',
  },
  {
    num: 12,
    name: 'SPU 12 · ศูนย์มีเดีย ดร.วีระ ปิตรชาติ',
    position: [22.0, 0, -15.0],
    size: [4.8, 9.6, 4.0],
    accentColor: '#E89BC4',
  },
  {
    num: 4,
    name: 'SPU 4 · วิศวกรรมศาสตร์',
    position: [18.5, 0, 7.5],
    size: [2.6, 5.4, 4.8],
    accentColor: '#FFBE0B',
  },
  {
    num: 3,
    name: 'SPU 3 · อาคารอเนกประสงค์',
    position: [19.0, 0, 14.5],
    size: [3.8, 4.2, 4.2],
    accentColor: '#FB5607',
  },
  {
    num: 7,
    name: 'SPU 7 · ศูนย์อาหาร 1',
    position: [21.0, 0, 1.5],
    size: [3.6, 3.8, 3.6],
    accentColor: '#8338EC',
  },
]

function SingleContextTower({ def }: { def: ContextBuildingDef }) {
  const { num, position, size, accentColor, rotation = 0 } = def
  const [w, h, d] = size
  const textures = useMemo(() => getWindowGridTextures(), [])
  const concrete = useMemo(() => getConcreteTexture(), [])

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Concrete foundation plinth */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[w + 0.4, 0.4, d + 0.4]} />
        <meshStandardMaterial color="#B0B5C0" roughness={0.7} />
      </mesh>

      {/* Main Structural Core (Concrete) */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.98, h, d * 0.98]} />
        <meshStandardMaterial
          color="#E4E7ED"
          map={concrete ?? undefined}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Glass Curtain Wall Facades */}
      <mesh position={[0, h / 2, d / 2 + 0.02]} castShadow receiveShadow>
        <planeGeometry args={[w * 0.92, h * 0.88]} />
        <meshPhysicalMaterial
          color="#22354A"
          map={textures.diffuse ?? undefined}
          emissive="#FFE6A3"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[w * 0.92, h * 0.88]} />
        <meshPhysicalMaterial
          color="#22354A"
          map={textures.diffuse ?? undefined}
          emissive="#FFE6A3"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Side Glass Panels */}
      <mesh position={[w / 2 + 0.02, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d * 0.9, h * 0.88]} />
        <meshPhysicalMaterial
          color="#22354A"
          map={textures.diffuse ?? undefined}
          emissive="#FFE6A3"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>
      <mesh position={[-w / 2 - 0.02, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[d * 0.9, h * 0.88]} />
        <meshPhysicalMaterial
          color="#22354A"
          map={textures.diffuse ?? undefined}
          emissive="#FFE6A3"
          emissiveMap={textures.emissive ?? undefined}
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.9}
        />
      </mesh>

      {/* Architectural Accent Fins (Vertical sunshades) */}
      {[-w * 0.4, -w * 0.2, 0, w * 0.2, w * 0.4].map((fx, i) => (
        <mesh key={i} position={[fx, h / 2, d / 2 + 0.1]} castShadow>
          <boxGeometry args={[0.08, h * 0.9, 0.22]} />
          <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}

      {/* Rooftop Parapet and Plant Room */}
      <mesh position={[0, h + 0.15, 0]}>
        <boxGeometry args={[w + 0.1, 0.3, d + 0.1]} />
        <meshStandardMaterial color="#3E424C" roughness={0.5} />
      </mesh>
      <mesh position={[w * 0.15, h + 0.75, -d * 0.1]} castShadow>
        <boxGeometry args={[w * 0.45, 1.2, d * 0.45]} />
        <meshStandardMaterial color="#686E7D" roughness={0.6} />
      </mesh>
      {/* Rooftop Communications Spire / Antenna */}
      <mesh position={[-w * 0.25, h + 1.2, d * 0.15]}>
        <cylinderGeometry args={[0.03, 0.06, 2.2, 8]} />
        <meshStandardMaterial color="#D4D9E2" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Illuminated Building Number Badge */}
      <group position={[0, h - 0.5, d / 2 + 0.15]}>
        <mesh>
          <boxGeometry args={[1.5, 0.6, 0.06]} />
          <meshStandardMaterial color="#1E2028" />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[1.3, 0.45]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.7}
          />
        </mesh>
        {/* White number indicator blocks */}
        <mesh position={[-0.35, 0, 0.06]}>
          <boxGeometry args={[0.2, 0.3, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.15, 0, 0.06]}>
          <boxGeometry args={[num >= 10 ? 0.4 : 0.25, 0.3, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export default function ContextBuildings() {
  return (
    <group>
      {CONTEXT_BUILDINGS.map((b) => (
        <SingleContextTower key={b.num} def={b} />
      ))}
    </group>
  )
}
