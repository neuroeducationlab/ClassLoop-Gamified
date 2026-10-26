import { useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Color, MathUtils, type Group } from 'three'
import type { Building as BuildingConfig, BuildingShape } from '@/data/buildings'
import { facingPlaza } from '../geometry'

type Props = {
  building: BuildingConfig
  hovered: boolean
  onHover: (id: BuildingConfig['id'] | null) => void
  onSelect: (b: BuildingConfig) => void
}

export default function Building({ building, hovered, onHover, onSelect }: Props) {
  const group = useRef<Group>(null)
  const glow = useRef(0)

  // Ease the hover glow + lift instead of snapping — reads much better on video.
  useFrame((_, dt) => {
    glow.current = MathUtils.damp(glow.current, hovered ? 1 : 0, 10, dt)
    const g = group.current
    if (!g) return
    const s = 1 + glow.current * 0.05
    g.scale.set(s, s, s)
    g.traverse((o) => {
      const mat = (o as { material?: { emissive?: Color; emissiveIntensity?: number } }).material
      if (mat?.emissive && o.userData.glow) mat.emissiveIntensity = glow.current * 0.55
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
        <Shape shape={building.shape} color={building.color} />
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- shapes -- */

/** Wall material that lights up on hover (flagged via userData.glow). */
function Wall({ color }: { color: string }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0} roughness={0.8} flatShading />
}

function lighten(hex: string, amount: number) {
  return '#' + new Color(hex).lerp(new Color('#ffffff'), amount).getHexString()
}

function Windows({ rows, cols, width, z, y0 }: { rows: number; cols: number; width: number; z: number; y0: number }) {
  const out = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push(
        <mesh key={`${r}-${c}`} position={[-width / 2 + (width / (cols + 1)) * (c + 1), y0 + r * 1.1, z]}>
          <boxGeometry args={[0.45, 0.55, 0.05]} />
          <meshStandardMaterial color="#FFE9B0" emissive="#FFD27A" emissiveIntensity={0.35} />
        </mesh>,
      )
  return <>{out}</>
}

function Door({ z, color = '#5A3E36' }: { z: number; color?: string }) {
  return (
    <mesh position={[0, 0.6, z]}>
      <boxGeometry args={[0.9, 1.2, 0.08]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Shape({ shape, color }: { shape: BuildingShape; color: string }) {
  const roof = lighten(color, 0.45)

  switch (shape) {
    case 'gate':
      return (
        <group>
          {[-1.6, 1.6].map((px) => (
            <mesh key={px} position={[px, 1.5, 0]} castShadow userData={{ glow: true }}>
              <boxGeometry args={[0.6, 3, 0.6]} />
              <Wall color={color} />
            </mesh>
          ))}
          <mesh position={[0, 3.2, 0]} castShadow userData={{ glow: true }}>
            <boxGeometry args={[4.4, 0.5, 0.8]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 3.2, 0.42]}>
            <boxGeometry args={[2.2, 0.32, 0.04]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      )
    case 'hall':
      return (
        <group>
          <mesh position={[0, 2.25, 0]} castShadow receiveShadow userData={{ glow: true }}>
            <boxGeometry args={[4.6, 4.5, 3.6]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[3.5, 1.4, 4]} />
            <meshStandardMaterial color={roof} flatShading />
          </mesh>
          <Windows rows={3} cols={3} width={4.6} z={1.82} y0={1.6} />
          <Door z={1.82} />
        </group>
      )
    case 'arena':
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow receiveShadow userData={{ glow: true }}>
            <cylinderGeometry args={[2.7, 2.9, 1.8, 12, 1, true]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.7, 0.14, 6, 24]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[2.6, 24]} />
            <meshStandardMaterial color="#F2C879" />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4
            return (
              <group key={i} position={[Math.sin(a) * 2.8, 0, Math.cos(a) * 2.8]}>
                <mesh position={[0, 1.6, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 3.2, 6]} />
                  <meshStandardMaterial color="#FFFFFF" />
                </mesh>
                <mesh position={[0.25, 2.95, 0]}>
                  <boxGeometry args={[0.5, 0.32, 0.03]} />
                  <meshStandardMaterial color={i % 2 ? '#F2C879' : '#F25F5C'} />
                </mesh>
              </group>
            )
          })}
        </group>
      )
    case 'house':
      return (
        <group>
          <mesh position={[0, 1.3, 0]} castShadow receiveShadow userData={{ glow: true }}>
            <boxGeometry args={[3.6, 2.6, 3]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 3.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.9, 1.5, 4]} />
            <meshStandardMaterial color={roof} flatShading />
          </mesh>
          <Windows rows={1} cols={2} width={3.6} z={1.52} y0={1.6} />
          <Door z={1.52} />
          {/* heart sign over the door */}
          <group position={[0, 2.25, 1.56]} scale={0.22}>
            {[-0.5, 0.5].map((hx) => (
              <mesh key={hx} position={[hx, 0.3, 0]}>
                <sphereGeometry args={[0.62, 12, 10]} />
                <meshStandardMaterial color="#F25F5C" emissive="#F25F5C" emissiveIntensity={0.3} />
              </mesh>
            ))}
            <mesh position={[0, -0.45, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[1.05, 1.4, 16]} />
              <meshStandardMaterial color="#F25F5C" emissive="#F25F5C" emissiveIntensity={0.3} />
            </mesh>
          </group>
        </group>
      )
    case 'hub':
      return (
        <group>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow userData={{ glow: true }}>
            <boxGeometry args={[4, 3, 3.4]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 3, 0]} castShadow>
            <sphereGeometry args={[1.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={roof} flatShading />
          </mesh>
          {/* bar-chart sign */}
          {[0.5, 0.9, 0.7].map((h, i) => (
            <mesh key={i} position={[-0.45 + i * 0.45, 2.1 + h / 2, 1.73]}>
              <boxGeometry args={[0.3, h, 0.05]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          ))}
          <Door z={1.72} />
        </group>
      )
    case 'office':
      return (
        <group>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow userData={{ glow: true }}>
            <boxGeometry args={[3.8, 2.8, 3.2]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[1.1, 3.4, -0.6]} castShadow userData={{ glow: true }}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <Wall color={color} />
          </mesh>
          <mesh position={[0, 2.85, 0]}>
            <boxGeometry args={[4, 0.12, 3.4]} />
            <meshStandardMaterial color={roof} />
          </mesh>
          <Windows rows={1} cols={3} width={3.8} z={1.62} y0={1.7} />
          <Door z={1.62} />
        </group>
      )
  }
}
