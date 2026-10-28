/**
 * Mario-style "?" blocks floating around the campus. Tap one, answer its question, and it
 * pops a legendary wardrobe item, then turns into a spent brown block. Textures are drawn
 * on a canvas at runtime (no image files).
 */
import { useMemo, useRef, useState } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, type Group } from 'three'
import type { QuestId } from './catalog'
import { BLOCK_QUESTS, useWardrobe } from './store'
import { BLOCK_SPOTS } from './quests'

const HEIGHT = 2.9

function blockTexture(used: boolean) {
  const size = 256
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const g = cv.getContext('2d')!
  g.fillStyle = used ? '#9A6A3A' : '#F7B733'
  g.fillRect(0, 0, size, size)
  // bevel: light top-left, dark bottom-right
  g.fillStyle = used ? '#B7854F' : '#FFD66B'
  g.fillRect(0, 0, size, 18)
  g.fillRect(0, 0, 18, size)
  g.fillStyle = used ? '#6E4524' : '#C77D12'
  g.fillRect(0, size - 18, size, 18)
  g.fillRect(size - 18, 0, 18, size)
  g.strokeStyle = '#5B3A2E'
  g.lineWidth = 10
  g.strokeRect(5, 5, size - 10, size - 10)
  // rivets
  g.fillStyle = used ? '#5B3A2E' : '#8A4F0E'
  for (const [x, y] of [[40, 40], [216, 40], [40, 216], [216, 216]]) {
    g.beginPath()
    g.arc(x, y, 10, 0, Math.PI * 2)
    g.fill()
  }
  if (!used) {
    g.font = 'bold 170px Fredoka, Arial Rounded MT Bold, sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.lineWidth = 16
    g.strokeStyle = '#5B3A2E'
    g.strokeText('?', size / 2, size / 2 + 10)
    g.fillStyle = '#FFFFFF'
    g.fillText('?', size / 2, size / 2 + 10)
  }
  const t = new CanvasTexture(cv)
  t.colorSpace = SRGBColorSpace
  return t
}

function Block({ index, used, onOpen }: { index: number; used: boolean; onOpen: (q: QuestId) => void }) {
  const ref = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const map = useMemo(() => blockTexture(used), [used])
  const [x, z] = BLOCK_SPOTS[index]

  useFrame((state) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime + index
    // spent blocks drift up out of the eye line and shrink, so they never block a shot
    g.position.y = HEIGHT + (used ? 1.1 : Math.sin(t * 2) * 0.15)
    if (!used) g.rotation.y += 0.01
    const s = used ? 0.7 : hover ? 1.1 : 1
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.2)
  })

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6 || used) return
    onOpen(BLOCK_QUESTS[index])
  }

  return (
    <group ref={ref} position={[x, HEIGHT, z]}>
      <mesh
        castShadow
        onClick={click}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); if (!used) document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
      >
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshStandardMaterial map={map} emissive={used ? '#000000' : '#F7B733'} emissiveIntensity={used ? 0 : 0.35} roughness={0.5} />
      </mesh>
      {!used && (
        <pointLight color="#FFD66B" intensity={4} distance={5} decay={2} />
      )}
    </group>
  )
}

export default function MysteryBlocks({ onOpen }: { onOpen: (q: QuestId) => void }) {
  const { quests } = useWardrobe()
  return (
    <>
      {BLOCK_SPOTS.map((_, i) => (
        <Block key={i} index={i} used={quests.includes(BLOCK_QUESTS[i])} onOpen={onOpen} />
      ))}
    </>
  )
}
