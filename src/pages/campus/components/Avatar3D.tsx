import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import type { AvatarAura, AvatarHat, AvatarOutfit } from '@/context/AppContext'

const SKIN = '#F5D3B3'
const DARK = '#2B2D55'

/**
 * Capsule + sphere character, ~1.6 units tall with its feet at y=0.
 * Pure geometry (no model files) so it loads instantly and never 404s on stage.
 * Now supports Outfits (suits, hoodies, labcoats) and animated Visual Auras!
 */
export default function Avatar3D({
  color,
  hat,
  outfit = 'default',
  aura = 'none',
}: {
  color: string
  hat: AvatarHat
  outfit?: AvatarOutfit
  aura?: AvatarAura
}) {
  return (
    <group>
      {/* Animated Visual Aura */}
      <AvatarAuraEffect aura={aura} />

      {/* Body / Outfit */}
      <AvatarBody color={color} outfit={outfit} />

      {/* Head */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>

      {/* Eyes face +z, the direction the avatar walks */}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 1.26, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={DARK} />
        </mesh>
      ))}

      {/* Hat / Headgear */}
      <Hat hat={hat} color={color} />
    </group>
  )
}

function AvatarBody({ color, outfit }: { color: string; outfit: AvatarOutfit }) {
  switch (outfit) {
    case 'suit':
      return (
        <group>
          {/* Dark Blazer Body */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.33, 0.45, 6, 16]} />
            <meshStandardMaterial color="#1E2235" roughness={0.7} />
          </mesh>
          {/* White Dress Shirt V-Neck */}
          <mesh position={[0, 0.72, 0.24]}>
            <boxGeometry args={[0.18, 0.24, 0.12]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </mesh>
          {/* SPU Pink Necktie */}
          <mesh position={[0, 0.62, 0.31]}>
            <boxGeometry args={[0.06, 0.28, 0.02]} />
            <meshStandardMaterial color="#E89BC4" roughness={0.4} />
          </mesh>
        </group>
      )
    case 'hoodie':
      return (
        <group>
          {/* Street Hoodie Body */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.34, 0.45, 6, 16]} />
            <meshStandardMaterial color="#3B82F6" roughness={0.8} />
          </mesh>
          {/* Hoodie Collar Ring */}
          <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26, 0.08, 12, 24]} />
            <meshStandardMaterial color="#2563EB" roughness={0.8} />
          </mesh>
          {/* Kangaroo Pocket */}
          <mesh position={[0, 0.45, 0.28]}>
            <boxGeometry args={[0.28, 0.16, 0.1]} />
            <meshStandardMaterial color="#1D4ED8" roughness={0.8} />
          </mesh>
        </group>
      )
    case 'labcoat':
      return (
        <group>
          {/* White Lab Coat */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <capsuleGeometry args={[0.34, 0.48, 6, 16]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
          {/* Inner Cyan Shirt */}
          <mesh position={[0, 0.72, 0.24]}>
            <boxGeometry args={[0.14, 0.22, 0.12]} />
            <meshStandardMaterial color="#06B6D4" roughness={0.6} />
          </mesh>
          {/* Pocket Badge */}
          <mesh position={[-0.14, 0.62, 0.31]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#0284C7" />
          </mesh>
        </group>
      )
    default:
      return (
        <mesh position={[0, 0.55, 0]} castShadow>
          <capsuleGeometry args={[0.32, 0.45, 6, 16]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      )
  }
}

function Hat({ hat, color }: { hat: AvatarHat; color: string }) {
  switch (hat) {
    case 'cap':
      return (
        <group position={[0, 1.38, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.31, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.01, 0.28]} rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.36, 0.03, 0.26]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      )
    case 'grad':
      return (
        <group position={[0, 1.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.24, 0.14, 16]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          <mesh position={[0, 0.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.62, 0.03, 0.62]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          {/* tassel */}
          <mesh position={[0.26, -0.02, 0.1]}>
            <cylinderGeometry args={[0.015, 0.015, 0.18, 6]} />
            <meshStandardMaterial color="#F2C879" />
          </mesh>
        </group>
      )
    case 'beanie':
      return (
        <group position={[0, 1.36, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <sphereGeometry args={[0.08, 12, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
        </group>
      )
    case 'cyber_cat':
      return (
        <group position={[0, 1.48, 0]}>
          {/* Left Cat Ear */}
          <mesh position={[-0.18, 0.12, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.12, 0.26, 4]} />
            <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={0.6} />
          </mesh>
          {/* Right Cat Ear */}
          <mesh position={[0.18, 0.12, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.12, 0.26, 4]} />
            <meshStandardMaterial color="#EC4899" emissive="#EC4899" emissiveIntensity={0.6} />
          </mesh>
          {/* Headband */}
          <mesh position={[0, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.28, 0.025, 8, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} />
          </mesh>
        </group>
      )
    case 'dj_headset':
      return (
        <group position={[0, 1.25, 0]}>
          {/* Headset Band */}
          <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.31, 0.035, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#0F172A" roughness={0.4} />
          </mesh>
          {/* Left Ear Cushion */}
          <mesh position={[-0.32, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
          </mesh>
          {/* Right Ear Cushion */}
          <mesh position={[0.32, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )
    case 'crown':
      return (
        <group position={[0, 1.54, 0]}>
          {/* Golden Crown Base */}
          <mesh>
            <cylinderGeometry args={[0.24, 0.26, 0.14, 8]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Crown Jewels */}
          {[-0.16, 0, 0.16].map((cx, idx) => (
            <mesh key={idx} position={[cx, 0.14, 0.15]}>
              <octahedronGeometry args={[0.04, 0]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
          ))}
        </group>
      )
    default:
      return null
  }
}

function AvatarAuraEffect({ aura }: { aura: AvatarAura }) {
  const ringRef1 = useRef<Mesh>(null)
  const ringRef2 = useRef<Mesh>(null)
  const starsGroup = useRef<Group>(null)

  useFrame((state, dt) => {
    if (ringRef1.current) ringRef1.current.rotation.z += dt * 1.5
    if (ringRef2.current) ringRef2.current.rotation.z -= dt * 1.2
    if (starsGroup.current) {
      starsGroup.current.rotation.y += dt * 1.0
      starsGroup.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  switch (aura) {
    case 'neon':
      return (
        <group position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh ref={ringRef1}>
            <ringGeometry args={[0.45, 0.52, 32]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={0.8} />
          </mesh>
          <mesh ref={ringRef2}>
            <ringGeometry args={[0.62, 0.68, 32]} />
            <meshBasicMaterial color="#F472B6" transparent opacity={0.7} />
          </mesh>
        </group>
      )
    case 'gold':
      return (
        <group position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[0.4, 0.75, 32]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
          </mesh>
        </group>
      )
    case 'stars':
      return (
        <group ref={starsGroup} position={[0, 0.8, 0]}>
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i * Math.PI) / 2
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6]}>
                <octahedronGeometry args={[0.06, 0]} />
                <meshBasicMaterial color="#FDE047" />
              </mesh>
            )
          })}
        </group>
      )
    default:
      return null
  }
}
