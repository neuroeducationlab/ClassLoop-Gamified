import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MathUtils, SpriteMaterial, SRGBColorSpace, type Group } from 'three'
import { PLAZA_CENTER } from '@/data/buildings'

/** Height band the puffs float in; Landing.tsx uses it for the fly-through veil. */
export const CLOUD_BOTTOM = 12.5
export const CLOUD_TOP = 16

const PUFFS = 42
/** No puffs inside this radius, so the campus shows through a hole in the cloud. */
const HOLE_RADIUS = 15
const OUTER_RADIUS = 38
const MAX_OPACITY = 0.82

let texture: CanvasTexture | null = null

/** A soft cumulus puff: a few overlapping radial gradients, drawn once and shared. */
function puffTexture() {
  if (texture) return texture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const lumps: [x: number, y: number, r: number][] = [
    [0.5, 0.55, 0.42],
    [0.32, 0.6, 0.28],
    [0.68, 0.6, 0.3],
    [0.42, 0.42, 0.26],
    [0.6, 0.4, 0.24],
  ]
  for (const [x, y, r] of lumps) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    g.addColorStop(0, 'rgba(255,255,255,0.75)')
    g.addColorStop(0.55, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** Deterministic 0–1 noise so the cloud field looks the same on every load. */
const rand = (i: number, salt: number) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return s - Math.floor(s)
}

/**
 * A ring of soft cloud puffs at "cloud altitude" over the campus. Hidden on the
 * opening shot; `shown` rolls them in (opacity eases up) once Start is pressed.
 */
export default function CloudLayer({ shown }: { shown: boolean }) {
  const group = useRef<Group>(null)
  const opacity = useRef(0)

  // a few materials with different rotations and warm tints, so the puffs don't look stamped
  const materials = useMemo(() => {
    const map = puffTexture()
    return ['#FFF6EE', '#FFE9DC', '#FFFFFF', '#F8E4E6'].map(
      (color, i) =>
        new SpriteMaterial({ map, color, rotation: i * 1.7, transparent: true, opacity: 0, depthWrite: false, fog: false }),
    )
  }, [])

  const puffs = useMemo(
    () =>
      Array.from({ length: PUFFS }, (_, i) => {
        const angle = (i / PUFFS) * Math.PI * 2 + rand(i, 1) * 0.5
        const r = HOLE_RADIUS + rand(i, 2) * (OUTER_RADIUS - HOLE_RADIUS)
        const w = 9 + rand(i, 3) * 9
        return {
          // relative to the plaza (the parent group sits there)
          position: [Math.sin(angle) * r, MathUtils.lerp(CLOUD_BOTTOM, CLOUD_TOP, rand(i, 4)), Math.cos(angle) * r] as [number, number, number],
          scale: [w, w * (0.55 + rand(i, 5) * 0.2), 1] as [number, number, number],
          material: materials[i % materials.length],
        }
      }),
    [materials],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    opacity.current = MathUtils.damp(opacity.current, shown ? MAX_OPACITY : 0, 1.6, dt)
    g.visible = opacity.current > 0.005
    for (const m of materials) m.opacity = opacity.current
    // the whole field drifts slowly around the campus, with a gentle breathing bob
    g.rotation.y += dt * 0.01
    g.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.25
  })

  return (
    // rotate about the plaza, not the world origin
    <group position={[PLAZA_CENTER[0], 0, PLAZA_CENTER[1]]}>
      <group ref={group} visible={false}>
        {puffs.map((p, i) => (
          <sprite
            key={i}
            position={p.position}
            scale={p.scale}
            material={p.material}
          />
        ))}
      </group>
    </group>
  )
}
