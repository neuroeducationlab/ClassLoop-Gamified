import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, type Group, type Mesh, type MeshStandardMaterial, type Texture } from 'three'
import type { Building as BuildingConfig, BuildingShape } from '@/data/buildings'
import { facingPlaza } from '../geometry'
import { brickTexture, concreteTexture, facadeTextures, lawnTexture } from '../textures'

type Props = {
  building: BuildingConfig
  hovered?: boolean
  onHover?: (id: BuildingConfig['id'] | null) => void
  onSelect?: (b: BuildingConfig) => void
  /** Seconds after mount before the building rises out of the ground (landing page). Omit = already standing. */
  riseDelay?: number
}

const RISE_SECONDS = 1.2

/** easeOutBack: overshoots a little, so towers "land" with a bounce. */
function easeOutBack(t: number) {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function Building({ building, hovered = false, onHover, onSelect, riseDelay }: Props) {
  const group = useRef<Group>(null)
  const glow = useRef(0)
  const born = useRef<number | null>(null)
  const interactive = Boolean(onSelect)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Ease the hover glow + lift instead of snapping — reads much better on video.
    glow.current = MathUtils.damp(glow.current, hovered ? 1 : 0, 10, dt)
    let sy = 1
    if (riseDelay !== undefined) {
      born.current ??= state.clock.elapsedTime
      const t = MathUtils.clamp((state.clock.elapsedTime - born.current - riseDelay) / RISE_SECONDS, 0, 1)
      sy = t === 0 ? 0.001 : easeOutBack(t)
    }
    const s = 1 + glow.current * 0.04
    g.scale.set(s, s * sy, s)
    g.traverse((o) => {
      if (!o.userData.glow) return
      const mat = (o as Mesh).material as MeshStandardMaterial
      mat.emissiveIntensity = (o.userData.base ?? 0) + glow.current * 1.4
    })
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover?.(building.id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover?.(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect?.(building)
  }

  const [x, z] = building.position

  return (
    <group position={[x, 0, z]} rotation={[0, facingPlaza(building.position), 0]}>
      <group
        ref={group}
        onPointerOver={interactive ? over : undefined}
        onPointerOut={interactive ? out : undefined}
        onClick={interactive ? click : undefined}
      >
        <Shape shape={building.shape} color={building.color} seed={building.id} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------- materials -- */

/** A clone of a cached texture with its own repeat, so buildings of different sizes don't fight over one. */
function useRepeat(tex: Texture, rx: number, ry: number) {
  return useMemo(() => {
    const t = tex.clone()
    t.repeat.set(rx, ry)
    t.needsUpdate = true
    return t
  }, [tex, rx, ry])
}

/** Glass curtain wall with lit rooms. `floors`/`bays` set the pane grid on one face. */
function Glass({ seed, bays, floors }: { seed: string; bays: number; floors: number }) {
  const { map, emissiveMap } = facadeTextures(seed, 6, 10)
  const m = useRepeat(map, bays / 6, floors / 10)
  const e = useRepeat(emissiveMap, bays / 6, floors / 10)
  return (
    <meshPhysicalMaterial
      map={m}
      emissiveMap={e}
      emissive="#FFC98A"
      emissiveIntensity={0.5}
      roughness={0.15}
      metalness={0.55}
      clearcoat={1}
      clearcoatRoughness={0.1}
      envMapIntensity={1.3}
    />
  )
}

function Concrete({ rx = 1, ry = 1 }: { rx?: number; ry?: number }) {
  const map = useRepeat(concreteTexture(), rx, ry)
  return <meshStandardMaterial map={map} roughness={0.85} />
}

/** Accent part in the building's brief colour — glows on hover (and a little at rest for signs). */
function Accent({ color, base = 0 }: { color: string; base?: number }) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={base} roughness={0.4} metalness={0.2} />
}

function AccentMesh({ color, base = 0, children, ...rest }: { color: string; base?: number; children: ReactNode } & ThreeElements['mesh']) {
  return (
    <mesh castShadow userData={{ glow: true, base }} {...rest}>
      {children}
      <Accent color={color} base={base} />
    </mesh>
  )
}

/** Lit entrance with a canopy, on the +z face at distance `z`. */
function Entrance({ z, color, width = 1.6 }: { z: number; color: string; width?: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.75, 0.02]}>
        <boxGeometry args={[width, 1.5, 0.06]} />
        <meshStandardMaterial color="#FFE2B0" emissive="#FFC277" emissiveIntensity={1.6} />
      </mesh>
      <AccentMesh color={color} base={0.25} position={[0, 1.65, 0.45]}>
        <boxGeometry args={[width + 1, 0.12, 0.9]} />
      </AccentMesh>
    </group>
  )
}

/** Tower: glass box on a concrete podium, accent crown band. */
function Tower({ w, h, d, seed, color }: { w: number; h: number; d: number; seed: string; color: string }) {
  const floors = Math.round(h / 0.9)
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.4, 1.2, d + 0.4]} />
        <Concrete rx={2} />
      </mesh>
      <mesh position={[0, 1.2 + (h - 1.2) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h - 1.2, d]} />
        <Glass seed={seed} bays={Math.round(w * 1.3)} floors={floors} />
      </mesh>
      <AccentMesh color={color} base={0.6} position={[0, h + 0.15, 0]}>
        <boxGeometry args={[w + 0.15, 0.3, d + 0.15]} />
      </AccentMesh>
      <Entrance z={d / 2 + 0.2} color={color} />
    </group>
  )
}

/* ---------------------------------------------------------------- shapes -- */

function Shape({ shape, color, seed }: { shape: BuildingShape; color: string; seed: string }) {
  switch (shape) {
    case 'gate':
      // MRT Exit 2: glass station box under a curved accent roof
      return (
        <group>
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[5, 0.2, 3]} />
            <Concrete rx={2} />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[4.2, 2.5, 2.2]} />
            <meshPhysicalMaterial color="#BFD6E6" roughness={0.08} metalness={0.4} clearcoat={1} transparent opacity={0.7} />
          </mesh>
          <AccentMesh color={color} base={0.3} position={[0, 2.6, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}>
            <cylinderGeometry args={[1.3, 1.3, 4.6, 24, 1, false, 0, Math.PI]} />
          </AccentMesh>
          {/* MRT blue sign */}
          <mesh position={[1.6, 3.1, 1.15]}>
            <boxGeometry args={[0.9, 0.5, 0.06]} />
            <meshStandardMaterial color="#2F5DBA" emissive="#2F5DBA" emissiveIntensity={0.8} />
          </mesh>
          <Entrance z={1.12} color={color} width={2} />
        </group>
      )
    case 'hall':
      // bldg 1/11: rounded stacked podium (like bldg 1 on the map) + glass tower
      return (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[-0.6, 0.7 + i * 1.3, 0.6]} castShadow receiveShadow>
              <cylinderGeometry args={[2.2 - i * 0.15, 2.2 - i * 0.15, 1.2, 32]} />
              {i === 1 ? <Glass seed={`${seed}-pod`} bays={14} floors={1} /> : <Concrete rx={4} />}
            </mesh>
          ))}
          <group position={[0.6, 0, -0.6]}>
            <Tower w={3.6} h={10} d={3} seed={seed} color={color} />
          </group>
        </group>
      )
    case 'hub':
      // bldg 9: tall glass tower with vertical accent fins
      return (
        <group>
          <Tower w={4} h={10.5} d={3.4} seed={seed} color={color} />
          {[-1.6, -0.55, 0.55, 1.6].map((fx) => (
            <AccentMesh key={fx} color={color} base={0.15} position={[fx, 5.5, 1.78]}>
              <boxGeometry args={[0.12, 8.6, 0.25]} />
            </AccentMesh>
          ))}
        </group>
      )
    case 'office':
      // bldg 5: mid-rise, accent fins, solar panels on the roof
      return (
        <group>
          <Tower w={4.2} h={6.2} d={3.4} seed={seed} color={color} />
          {[-1.2, 0, 1.2].map((px) => (
            <mesh key={px} position={[px, 6.55, -0.4]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[1, 0.05, 1.4]} />
              <meshStandardMaterial color="#1F2F5A" roughness={0.2} metalness={0.7} />
            </mesh>
          ))}
        </group>
      )
    case 'house':
      return <Dorm color={color} seed={seed} />
    case 'arena':
      return <ArenaShape color={color} />
  }
}

/** bldg 6: red-brick residence (as on the SPU map) with balconies and an accent sign fin. */
function Dorm({ color, seed }: { color: string; seed: string }) {
  const brick = useRepeat(brickTexture(), 3, 4)
  const floors = 6
  return (
    <group>
      <mesh position={[0, 3.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 6.5, 3.4]} />
        <meshStandardMaterial map={brick} roughness={0.9} />
      </mesh>
      {/* window strip + balconies per floor on the front */}
      <mesh position={[0, 3.6, 1.71]}>
        <planeGeometry args={[3.2, 5.4]} />
        <Glass seed={`${seed}-win`} bays={4} floors={floors} />
      </mesh>
      {Array.from({ length: floors - 1 }, (_, i) => (
        <mesh key={i} position={[0, 1.6 + i * 0.95, 1.95]} castShadow>
          <boxGeometry args={[3.4, 0.08, 0.5]} />
          <meshStandardMaterial color="#EDEDED" />
        </mesh>
      ))}
      <AccentMesh color={color} base={0.5} position={[2.15, 3.8, 1.4]}>
        <boxGeometry args={[0.25, 4.5, 0.6]} />
      </AccentMesh>
      <Entrance z={1.72} color={color} />
    </group>
  )
}

/** Sports arena: concrete bowl, glowing LED ring, floodlight masts, turf. */
function ArenaShape({ color }: { color: string }) {
  const turf = useRepeat(lawnTexture(), 3, 3)
  return (
    <group>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 3.1, 2, 32, 1, true]} />
        <meshStandardMaterial color="#D9D6D0" side={2} roughness={0.85} />
      </mesh>
      <AccentMesh color={color} base={0.9} position={[0, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.85, 0.1, 8, 48]} />
      </AccentMesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.7, 32]} />
        <meshStandardMaterial map={turf} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <group key={i} position={[Math.sin(a) * 3.2, 0, Math.cos(a) * 3.2]}>
            <mesh position={[0, 2.2, 0]}>
              <cylinderGeometry args={[0.05, 0.07, 4.4, 6]} />
              <meshStandardMaterial color="#9AA0AA" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 4.45, 0]}>
              <boxGeometry args={[0.5, 0.3, 0.2]} />
              <meshStandardMaterial color="#FFFFFF" emissive="#FFF4D6" emissiveIntensity={2.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
