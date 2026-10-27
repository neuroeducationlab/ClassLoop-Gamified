import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { AdditiveBlending, CanvasTexture, SRGBColorSpace, type Group, type Mesh, type MeshBasicMaterial } from 'three'

const W = 1024
const H = 384

/**
 * Draws `text` at `size`, shrinking the font until it fits `maxWidth` — the
 * fallback font (if Fredoka hasn't loaded, e.g. on weak venue wifi) is wider.
 */
function fitText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, size: number, weight = 700) {
  let px = size
  ctx.font = `${weight} ${px}px Fredoka, Sarabun, sans-serif`
  const w = ctx.measureText(text).width
  if (w > maxWidth) {
    px = Math.floor((size * maxWidth) / w)
    ctx.font = `${weight} ${px}px Fredoka, Sarabun, sans-serif`
  }
  ctx.fillText(text, x, y)
}

/**
 * Draws the ClassLoop wordmark on a canvas: a looping-arrow mark, the name,
 * and a small "SPU campus edition" line — ClassLoop is the brand, SPU the client.
 */
function drawWordmark(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H)
  const glow = (blur: number) => {
    ctx.shadowColor = '#7FE3FF'
    ctx.shadowBlur = blur
  }
  // loop mark: an open ring with an arrowhead
  ctx.lineWidth = 22
  ctx.strokeStyle = '#BFF4FF'
  glow(30)
  ctx.beginPath()
  ctx.arc(150, 180, 82, Math.PI * 0.25, Math.PI * 1.95)
  ctx.stroke()
  ctx.fillStyle = '#BFF4FF'
  ctx.beginPath()
  ctx.moveTo(232, 150)
  ctx.lineTo(262, 205)
  ctx.lineTo(200, 200)
  ctx.closePath()
  ctx.fill()
  // wordmark
  const grad = ctx.createLinearGradient(270, 0, 990, 0)
  grad.addColorStop(0, '#E9FBFF')
  grad.addColorStop(1, '#8FE6FF')
  ctx.fillStyle = grad
  glow(36)
  ctx.textBaseline = 'middle'
  fitText(ctx, 'ClassLoop', 280, 170, 700, 150)
  glow(14)
  ctx.fillStyle = 'rgba(220,248,255,0.85)'
  fitText(ctx, '3D LEARNING CAMPUS  ·  SPU EDITION', 288, 292, 690, 40, 600)
  // scanlines
  ctx.shadowBlur = 0
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2)
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Floating holographic ClassLoop logo over the plaza: a billboarded
 * wordmark, a light beam from the ground and a slowly spinning ring.
 * Additive + untoned so bloom picks it up; still bright without bloom.
 */
export default function Hologram({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const sign = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const t = new CanvasTexture(canvas)
    t.colorSpace = SRGBColorSpace
    return t
  }, [])

  useEffect(() => {
    const ctx = (texture.image as HTMLCanvasElement).getContext('2d')
    if (!ctx) return
    const redraw = () => {
      drawWordmark(ctx)
      texture.needsUpdate = true
    }
    redraw()
    // repaint once Fredoka has loaded (first paint may use the fallback font)
    document.fonts?.load('700 150px Fredoka').then(redraw).catch(() => {})
    return () => texture.dispose()
  }, [texture])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (sign.current) {
      sign.current.position.y = Math.sin(t * 1.4) * 0.15
      const mat = (sign.current.children[0] as Mesh | undefined)?.material as MeshBasicMaterial | undefined
      // holographic flicker
      if (mat) mat.opacity = 0.82 + Math.sin(t * 23) * 0.05 + (Math.sin(t * 3.1) > 0.97 ? -0.3 : 0)
    }
    if (ring.current) ring.current.rotation.z = t * 0.6
  })

  return (
    <group position={position}>
      {/* beam from the plaza */}
      <mesh position={[0, -position[1] / 2, 0]}>
        <cylinderGeometry args={[0.35, 1.1, position[1], 24, 1, true]} />
        <meshBasicMaterial color="#7FE3FF" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} toneMapped={false} side={2} />
      </mesh>
      <mesh ref={ring} position={[0, -position[1] + 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.35, 48, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color="#9FEFFF" transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <Billboard>
        <group ref={sign} scale={scale}>
          <mesh>
            <planeGeometry args={[5.4, 2.03]} />
            <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          {/* dark glass plate behind the wordmark so it reads against a bright daytime sky too */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[5.7, 2.3]} />
            <meshBasicMaterial color="#0E1530" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </Billboard>
    </group>
  )
}
