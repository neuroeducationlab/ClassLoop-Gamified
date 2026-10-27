import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MathUtils, SpriteMaterial, SRGBColorSpace, type Group } from 'three'
import { PLAZA_CENTER } from '@/data/buildings'

/**
 * The band the cloud deck actually *occupies on screen* — puff centres plus half a
 * sprite. Landing.tsx fades the fly-through veil across exactly this range, so the
 * veil is already up by the time a puff can cover the lens (it used to describe only
 * the centres, which left the camera inside bare sprites with no veil: grey haze).
 */
export const CLOUD_BOTTOM = 11.5
export const CLOUD_TOP = 21.5

/**
 * Puff centres sit in a thin slab well clear of the skyline (the tallest tower is
 * about 10 units), so the deck reads as a floor of cloud over the campus.
 */
const CENTER_BOTTOM = 15
const CENTER_TOP = 17.5

const PUFFS = 80
/** No puffs inside this radius, so the campus shows through a hole in the cloud. */
const HOLE_RADIUS = 16
const OUTER_RADIUS = 46
const MAX_OPACITY = 0.92

let texture: CanvasTexture | null = null

/** A soft cumulus puff: a few overlapping radial gradients, drawn once and shared. */
function puffTexture() {
  if (texture) return texture
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  // cauliflower top, flatter base
  const lumps: [x: number, y: number, r: number][] = [
    [0.5, 0.6, 0.3],
    [0.3, 0.64, 0.2],
    [0.7, 0.64, 0.21],
    [0.4, 0.46, 0.2],
    [0.6, 0.44, 0.19],
    [0.5, 0.34, 0.15],
    [0.18, 0.7, 0.13],
    [0.82, 0.7, 0.13],
  ]
  for (const [x, y, r] of lumps) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size)
    // dense core with a soft but defined rim, so puffs read as clouds rather than haze
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.9)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  // shaded underside for volume (only where the puff is drawn)
  ctx.globalCompositeOperation = 'source-atop'
  const shade = ctx.createLinearGradient(0, size * 0.5, 0, size * 0.9)
  shade.addColorStop(0, 'rgba(255,255,255,0)')
  shade.addColorStop(1, 'rgba(178,164,186,0.34)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, size, size)
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

  // a few materials with slight tilts and warm tints, so the puffs don't look stamped (base stays down)
  const materials = useMemo(() => {
    const map = puffTexture()
    return ['#FFF6EE', '#FFE9DC', '#FFFFFF', '#F8E4E6'].map(
      (color, i) =>
        new SpriteMaterial({ map, color, rotation: (i - 1.5) * 0.18, transparent: true, opacity: 0, depthWrite: false, fog: false }),
    )
  }, [])

  const puffs = useMemo(
    () =>
      Array.from({ length: PUFFS }, (_, i) => {
        const angle = (i / PUFFS) * Math.PI * 2 + rand(i, 1) * 0.5
        const r = HOLE_RADIUS + rand(i, 2) * (OUTER_RADIUS - HOLE_RADIUS)
        // Puffs grow with distance from the plaza: the ones nearest the hover spot stay
        // small, so none of them can smear itself across the lens, while the far ones are
        // big enough to build a horizon. (A uniform size put a wall of white on the lens.)
        const spread = (r - HOLE_RADIUS) / (OUTER_RADIUS - HOLE_RADIUS)
        const w = 5 + spread * 9 + rand(i, 3) * 2
        return {
          // relative to the plaza (the parent group sits there)
          position: [Math.sin(angle) * r, MathUtils.lerp(CENTER_BOTTOM, CENTER_TOP, rand(i, 4)), Math.cos(angle) * r] as [number, number, number],
          scale: [w, w * (0.5 + rand(i, 5) * 0.1), 1] as [number, number, number],
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
