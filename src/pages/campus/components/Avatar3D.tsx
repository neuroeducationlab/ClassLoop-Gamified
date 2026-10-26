import type { AvatarHat } from '@/context/AppContext'

const SKIN = '#F5D3B3'
const DARK = '#2B2D55'

/**
 * Capsule + sphere character, ~1.6 units tall with its feet at y=0.
 * Pure geometry (no model files) so it loads instantly and never 404s on stage.
 */
export default function Avatar3D({ color, hat }: { color: string; hat: AvatarHat }) {
  return (
    <group>
      {/* body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.45, 6, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <sphereGeometry args={[0.3, 24, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.7} />
      </mesh>
      {/* eyes face +z, the direction the avatar walks */}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 1.26, 0.27]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={DARK} />
        </mesh>
      ))}
      <Hat hat={hat} color={color} />
    </group>
  )
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
    default:
      return null
  }
}
