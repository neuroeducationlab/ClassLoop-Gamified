import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace, type MeshStandardMaterial } from 'three'
import type { Dressing, InteriorConfig } from '@/data/interiors'

/*
 * Set dressing that makes each room read as its building, procedural like the
 * campus (no model files). Rooms are centred on the origin: the door is the +z
 * wall, the window band is the -x wall, stations stand toward -z. Pieces keep
 * clear of the stations and of the aisle the camera walks in along (x ≈ 0).
 */

type V3 = [number, number, number]

function Box({ p, s, c, e, r = 0, rough = 0.7 }: { p: V3; s: V3; c: string; e?: number; r?: number; rough?: number }) {
  return (
    <mesh position={p} rotation={[0, r, 0]} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={rough} emissive={e ? c : '#000000'} emissiveIntensity={e ?? 0} toneMapped={!e} />
    </mesh>
  )
}

const signCache = new Map<string, CanvasTexture>()
/** A lit sign with the room's name, in the building's colour. */
function signTexture(text: string, color: string) {
  const key = `${text}-${color}`
  const hit = signCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 160
  const g = c.getContext('2d')!
  g.fillStyle = '#0D1030'
  g.fillRect(0, 0, 1024, 160)
  g.strokeStyle = color
  g.lineWidth = 8
  g.strokeRect(8, 8, 1008, 144)
  g.fillStyle = '#FFFFFF'
  g.font = 'bold 84px sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 512, 84, 960)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  signCache.set(key, t)
  return t
}

function Sign({ text, color, p, w = 4, r = 0 }: { text: string; color: string; p: V3; w?: number; r?: number }) {
  const map = useMemo(() => signTexture(text, color), [text, color])
  return (
    <mesh position={p} rotation={[0, r, 0]}>
      <planeGeometry args={[w, w * 0.156]} />
      <meshStandardMaterial color="#000000" emissive="#FFFFFF" emissiveMap={map} emissiveIntensity={1.1} toneMapped={false} />
    </mesh>
  )
}

function Plant({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Box p={[0, 0.3, 0]} s={[0.5, 0.6, 0.5]} c="#D9D2C5" />
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.45, 16, 12]} />
        <meshStandardMaterial color="#3F8F5A" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Bench({ p, w, r = 0, c = '#C9A97E' }: { p: V3; w: number; r?: number; c?: string }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.45, 0]} s={[w, 0.08, 0.5]} c={c} />
      <Box p={[0, 0.22, 0]} s={[w * 0.9, 0.44, 0.3]} c="#3A3D4A" />
    </group>
  )
}

function Sofa({ p, r = 0, c }: { p: V3; r?: number; c: string }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 0.25, 0]} s={[2.2, 0.5, 0.9]} c={c} rough={0.95} />
      <Box p={[0, 0.65, -0.38]} s={[2.2, 0.6, 0.18]} c={c} rough={0.95} />
      <Box p={[-1.05, 0.45, 0]} s={[0.16, 0.5, 0.9]} c={c} rough={0.95} />
      <Box p={[1.05, 0.45, 0]} s={[0.16, 0.5, 0.9]} c={c} rough={0.95} />
    </group>
  )
}

function RoundTable({ p, c }: { p: V3; c: string }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
        <meshStandardMaterial color="#F4EFE6" roughness={0.5} />
      </mesh>
      <Box p={[0, 0.37, 0]} s={[0.08, 0.74, 0.08]} c="#3A3D4A" />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.85, 0.45, Math.cos(a) * 0.85]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Server racks with status LEDs that blink at their own pace. */
function ServerRack({ p, r = 0, color }: { p: V3; r?: number; color: string }) {
  const leds = useRef<MeshStandardMaterial>(null)
  useFrame((state) => {
    if (leds.current) leds.current.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 3 + p[2]) * 0.8
  })
  return (
    <group position={p} rotation={[0, r, 0]}>
      <Box p={[0, 1.1, 0]} s={[0.9, 2.2, 0.8]} c="#1E2029" rough={0.4} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 0.45 + i * 0.3, 0.41]}>
          <planeGeometry args={[0.7, 0.05]} />
          <meshStandardMaterial ref={i === 0 ? leds : undefined} color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export default function RoomDressing({ dressing, config, color }: { dressing: Dressing; config: InteriorConfig; color: string }) {
  const [w, d] = config.size
  const right = w / 2 - 0.6
  const left = -w / 2 + 0.6
  const front = d / 2 - 0.6

  switch (dressing) {
    // MRT Exit 2: turnstiles you've just walked through, columns, the exit sign
    case 'concourse':
      return (
        <group>
          {[-3.6, -1.3, 1.3, 3.6].map((x) => (
            <group key={x} position={[x, 0, 2.6]}>
              <Box p={[0, 0.5, 0]} s={[0.25, 1.0, 1.2]} c="#D0D5E0" rough={0.25} />
              <Box p={[0, 1.02, 0]} s={[0.27, 0.04, 1.2]} c={color} e={0.8} />
            </group>
          ))}
          {[-1, 1].map((sx) =>
            [-2, 1].map((z) => (
              <mesh key={`${sx}${z}`} position={[sx * (w / 2 - 1.5), config.height / 2, z]} castShadow>
                <cylinderGeometry args={[0.32, 0.32, config.height, 20]} />
                <meshStandardMaterial color="#C4CAD6" roughness={0.5} />
              </mesh>
            )),
          )}
          <Sign text="MRT EXIT 2 · ClassLoop Campus" color={color} p={[0, config.height - 1, 3.4]} w={5.5} r={Math.PI} />
          <Bench p={[right - 0.2, 0, 0.5]} w={2.4} r={-Math.PI / 2} />
        </group>
      )

    // lecture hall: tiered rows facing the big screen, a centre aisle, a lectern
    case 'lecture':
      return (
        <group>
          {Array.from({ length: 5 }, (_, row) => {
            const z = -1.1 + row * 1.15
            const y = row * 0.16
            return [-1, 1].map((side) => (
              <group key={`${row}${side}`} position={[side * 3.6, y, z]}>
                <Box p={[0, y > 0 ? -y / 2 : 0, 0]} s={[5.0, Math.max(0.02, y), 1.1]} c="#D6D0C6" />
                <Bench p={[0, 0, 0.1]} w={4.6} c="#7C9BE8" />
              </group>
            ))
          })}
          <Box p={[2.2, 0.55, -4.4]} s={[0.7, 1.1, 0.5]} c="#C9A97E" />
          <Sign text="Rangsit-Nives Academic Hall" color={color} p={[0, config.height - 0.7, -d / 2 + 0.03]} w={6} />
          <Plant p={[right - 0.3, 0, front - 0.5]} />
        </group>
      )

    // library: shelf walls, reading tables with lamps
    case 'library':
      return (
        <group>
          {[-3.6, 0, 3.6].map((z) => (
            <group key={z} position={[right - 0.1, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
              <Box p={[0, 1.3, 0]} s={[3.2, 2.6, 0.45]} c="#8A6A4A" />
              {Array.from({ length: 4 }, (_, row) =>
                Array.from({ length: 13 }, (_, i) => (
                  <Box
                    key={`${row}-${i}`}
                    p={[-1.4 + i * 0.23, 0.45 + row * 0.6, 0.12]}
                    s={[0.17, 0.44 - ((i + row) % 3) * 0.05, 0.28]}
                    c={['#3B5BA9', '#C2454B', '#E0B04B', '#3F8F6B', '#7C5BB5'][(i * 2 + row) % 5]}
                  />
                )),
              )}
            </group>
          ))}
          {[-4.2, 2.6].map((x) => (
            <group key={x} position={[x, 0, 1.8]}>
              <Box p={[0, 0.75, 0]} s={[2.4, 0.07, 1.1]} c="#B78D5E" />
              <Box p={[0, 0.37, 0]} s={[2.0, 0.74, 0.08]} c="#3A3D4A" />
              <Box p={[0.6, 0.98, 0]} s={[0.06, 0.4, 0.06]} c="#2B2E38" />
              <Box p={[0.6, 1.2, 0]} s={[0.3, 0.1, 0.3]} c="#FFE3A8" e={1.2} />
            </group>
          ))}
          <Sign text="Learning Library · หอสมุด" color={color} p={[0, config.height - 0.7, -d / 2 + 0.03]} w={5} />
        </group>
      )

    // the arena bowl: stands on both sides, court lines, a scoreboard
    case 'arena':
      return (
        <group>
          {[-1, 1].map((side) =>
            Array.from({ length: 4 }, (_, row) => (
              <Box
                key={`${side}${row}`}
                p={[side * (w / 2 - 0.9 - row * 0.8), 0.25 + row * 0.35, 0.5]}
                s={[0.8, 0.5 + row * 0.7, d - 4]}
                c={row % 2 ? '#E89BC4' : '#F4C6DD'}
              />
            )),
          )}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <ringGeometry args={[2.2, 2.32, 64]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.4} />
          </mesh>
          <Box p={[0, 0.016, 0]} s={[0.1, 0.01, d - 4]} c="#FFFFFF" />
          <Sign text="ARENA · LEADERBOARD LIVE" color={color} p={[0, config.height - 0.9, -d / 2 + 0.03]} w={6} />
        </group>
      )

    // student union: café counter, round tables, string lights
    case 'union':
      return (
        <group>
          <group position={[right - 0.4, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
            <Box p={[0, 0.55, 0]} s={[4.5, 1.1, 0.8]} c="#5A4636" />
            <Box p={[0, 1.12, 0]} s={[4.6, 0.06, 0.9]} c="#F4EFE6" />
            <Box p={[-1.4, 1.35, 0]} s={[0.5, 0.4, 0.4]} c="#2B2E38" />
          </group>
          {[
            [-4, 1.8],
            [-1.6, 3.2],
            [2.6, 2.4],
          ].map(([x, z]) => (
            <RoundTable key={`${x}${z}`} p={[x, 0, z]} c={color} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[left + 0.4 + i * ((w - 2) / 13), config.height - 0.6 - Math.sin((i / 13) * Math.PI) * 0.5, 0.5]}>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#FFE3A8" emissive="#FFE3A8" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
          <Sign text="STUDENT UNION · สโมสรนักศึกษา" color={color} p={[0, config.height - 0.7, -d / 2 + 0.03]} w={5.5} />
          <Plant p={[left + 0.4, 0, front - 0.6]} />
        </group>
      )

    // wellness lounge: soft sofas, a rug, plants, a warm lamp
    case 'lounge':
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.5, 0.012, 1.0]}>
            <circleGeometry args={[2.2, 40]} />
            <meshStandardMaterial color="#CFE9E4" roughness={1} />
          </mesh>
          <Sofa p={[-3.6, 0, 1.0]} r={Math.PI / 2} c={color} />
          <Sofa p={[2.8, 0, 1.6]} r={-Math.PI / 2.4} c={color} />
          <Plant p={[left + 0.3, 0, -3.8]} />
          <Plant p={[right - 0.3, 0, front - 0.4]} />
          <group position={[right - 0.5, 0, -1.5]}>
            <Box p={[0, 0.8, 0]} s={[0.06, 1.6, 0.06]} c="#2B2E38" />
            <Box p={[0, 1.65, 0]} s={[0.45, 0.3, 0.45]} c="#FFE3A8" e={1.5} />
          </group>
          <Sign text="Wellness Lounge · พื้นที่ปลอดภัย" color={color} p={[0, config.height - 0.6, -d / 2 + 0.03]} w={5} />
        </group>
      )

    // lesson planning studio: drafting tables, a pin-up wall of sticky notes
    case 'studio':
      return (
        <group>
          {[-0.5, 2.0].map((z) => (
            <group key={z} position={[right - 0.9, 0, z]} rotation={[0, -Math.PI / 2, 0]}>
              <Box p={[0, 0.9, 0]} s={[1.6, 0.06, 1.0]} c="#F4EFE6" r={0} />
              <Box p={[0, 0.45, 0]} s={[0.08, 0.9, 0.08]} c="#2B2E38" />
            </group>
          ))}
          <group position={[left + 0.02, 0, 1.6]} rotation={[0, Math.PI / 2, 0]}>
            {Array.from({ length: 12 }, (_, i) => (
              <Box key={i} p={[-1.5 + (i % 6) * 0.6, 1.5 + Math.floor(i / 6) * 0.55, 0]} s={[0.42, 0.42, 0.02]} c={['#FFF2A8', '#FFD1E0', '#C8F0FF', '#D6F5C9'][i % 4]} />
            ))}
          </group>
          <Sign text="Lesson Planning Studio" color={color} p={[0, config.height - 0.6, -d / 2 + 0.03]} w={5} />
        </group>
      )

    // data centre: racks with blinking LEDs along the wall
    case 'data':
      return (
        <group>
          {[-3.4, -2.3, -1.2, 1.2, 2.3].map((z) => (
            <ServerRack key={z} p={[right - 0.2, 0, z + 1.5]} r={-Math.PI / 2} color={color} />
          ))}
          <Sign text="Academic Data & Research Center" color={color} p={[0, config.height - 0.6, -d / 2 + 0.03]} w={5.5} />
        </group>
      )

    // staff lounge: the teachers' table, a coffee bar, a sofa by the window
    case 'staff':
      return (
        <group>
          <group position={[0, 0, 1.2]}>
            <Box p={[0, 0.75, 0]} s={[4.2, 0.07, 1.4]} c="#B78D5E" />
            <Box p={[0, 0.37, 0]} s={[3.6, 0.74, 0.1]} c="#3A3D4A" />
            {[-1.5, -0.5, 0.5, 1.5].flatMap((x) =>
              [-1, 1].map((sz) => <Box key={`${x}${sz}`} p={[x, 0.45, sz * 1.05]} s={[0.5, 0.08, 0.5]} c={color} />),
            )}
          </group>
          <group position={[right - 0.4, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]}>
            <Box p={[0, 0.55, 0]} s={[3.0, 1.1, 0.7]} c="#5A4636" />
            <Box p={[-0.8, 1.3, 0]} s={[0.45, 0.4, 0.4]} c="#2B2E38" />
            <Box p={[0.6, 1.2, 0]} s={[0.2, 0.18, 0.2]} c="#F4EFE6" />
          </group>
          <Sofa p={[left + 1.0, 0, 2.2]} r={Math.PI / 2} c="#4C5A78" />
          <Sign text="STAFF ONLY · ห้องพักครู" color={color} p={[0, config.height - 0.6, -d / 2 + 0.03]} w={5} />
          <Plant p={[right - 0.3, 0, -1.5]} />
        </group>
      )
  }
}
