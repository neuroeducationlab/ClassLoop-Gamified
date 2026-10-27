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
/** The texture carries its own translucency at the edges, so the core can be solid white. */
const MAX_OPACITY = 1

/** Soft-light layout of each texture variant: [x, y, radius] blobs, flatter at the base. */
const SHAPES: [x: number, y: number, r: number][][] = [
  [[0.5, 0.58, 0.24], [0.32, 0.62, 0.17], [0.68, 0.62, 0.18], [0.42, 0.45, 0.17], [0.6, 0.43, 0.15]],
  [[0.45, 0.6, 0.22], [0.66, 0.58, 0.2], [0.28, 0.65, 0.14], [0.55, 0.44, 0.17], [0.78, 0.66, 0.11]],
  [[0.5, 0.56, 0.26], [0.3, 0.6, 0.15], [0.7, 0.6, 0.15], [0.5, 0.4, 0.14]],
]

const textures: CanvasTexture[] = []

/** Deterministic 0–1 noise so the cloud field looks the same on every load. */
const rand = (i: number, salt: number) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return s - Math.floor(s)
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Fractal value noise: the wispy, frayed detail at a real cloud's edge. */
function fbm(x: number, y: number, seed: number) {
  let sum = 0
  let amp = 0.5
  for (let o = 0; o < 5; o++) {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = x - xi
    const v = y - yi
    const su = u * u * (3 - 2 * u)
    const sv = v * v * (3 - 2 * v)
    const h = (a: number, b: number) => rand(a * 57 + b * 131, seed + o)
    const a = h(xi, yi)
    const b = h(xi + 1, yi)
    const c = h(xi, yi + 1)
    const d = h(xi + 1, yi + 1)
    sum += amp * (a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv)
    x *= 2.03
    y *= 2.03
    amp *= 0.5
  }
  return sum
}

/**
 * A fluffy cumulus puff, drawn once per variant: soft gaussian blobs for the body,
 * broken up by fractal noise so the edge thins out into wisps instead of ending in a
 * hard rim. Pure white on top, a faint warm (never grey) tint underneath.
 */
function puffTexture(variant: number) {
  if (textures[variant]) return textures[variant]
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const blobs = SHAPES[variant]
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = px / size
      const y = py / size
      let mass = 0
      for (const [bx, by, r] of blobs) mass += Math.exp(-(((x - bx) ** 2 + (y - by) ** 2) / (r * r)) * 1.6)
      const n = fbm(x * 6, y * 6, variant * 7 + 1)
      // a dense white body, plus a wider, sheer halo that the noise frays into wisps
      const body = mass - 0.4 + (n - 0.5) * 0.5
      const halo = mass * 0.9 - 0.12 + (n - 0.5) * 1.1
      // never reach the tile border, so no square edges
      const border = 1 - smoothstep(0.38, 0.5, Math.max(Math.abs(x - 0.5), Math.abs(y - 0.5)))
      const alpha = Math.max(smoothstep(0, 0.65, body), smoothstep(0, 0.6, halo) * 0.45) * border
      // sunlit white top, the faintest cream underside for volume (never grey)
      const under = smoothstep(0.5, 0.85, y) * 0.5
      const i = (py * size + px) * 4
      img.data[i] = 255
      img.data[i + 1] = 255 - under * 12
      img.data[i + 2] = 255 - under * 22
      img.data[i + 3] = alpha * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  textures[variant] = tex
  return tex
}

/** Sprites per cloud: a few overlapping puffs build one soft, billowy cloud. */
const PUFFS_PER_CLOUD = 3

/**
 * A ring of soft cloud puffs at "cloud altitude" over the campus. Hidden on the
 * opening shot; `shown` rolls them in (opacity eases up) once Start is pressed.
 */
export default function CloudLayer({ shown }: { shown: boolean }) {
  const group = useRef<Group>(null)
  const opacity = useRef(0)

  // one material per texture variant, each with a slight tilt so the puffs don't look stamped.
  // toneMapped off: tone mapping turns pure white into ~80% grey, which is why the deck read as grey
  const materials = useMemo(
    () =>
      SHAPES.map(
        (_, v) =>
          new SpriteMaterial({
            map: puffTexture(v),
            rotation: (v - 1) * 0.12,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: false,
            toneMapped: false,
          }),
      ),
    [],
  )

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
        const cx = Math.sin(angle) * r
        const cz = Math.cos(angle) * r
        const cy = MathUtils.lerp(CENTER_BOTTOM, CENTER_TOP, rand(i, 4))
        // a big central puff plus smaller ones beside it, slightly lower: one billowy cloud
        return Array.from({ length: PUFFS_PER_CLOUD }, (_, k) => {
          const j = i * PUFFS_PER_CLOUD + k
          const side = k === 0 ? 0 : (k % 2 ? -1 : 1) * (0.25 + rand(j, 6) * 0.15) * w
          const pw = w * (k === 0 ? 1 : 0.6 + rand(j, 7) * 0.2)
          return {
            // relative to the plaza (the parent group sits there)
            position: [cx + Math.cos(angle) * side, cy - (k === 0 ? 0 : w * 0.06), cz - Math.sin(angle) * side] as [number, number, number],
            scale: [pw, pw * (0.5 + rand(j, 5) * 0.1), 1] as [number, number, number],
            material: materials[j % materials.length],
          }
        })
      }).flat(),
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
