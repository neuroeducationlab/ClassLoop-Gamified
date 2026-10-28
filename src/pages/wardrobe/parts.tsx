/** Reusable drawn pieces (bows, flowers, glows, sleeves, a window) for the wardrobe art. */
import { OUT, S, shade } from './draw'

export function Bow({ x, y, color, s = 1, knot }: { x: number; y: number; color: string; s?: number; knot?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 C-10,-14 -26,-14 -26,0 C-26,14 -10,14 0,0Z" fill={color} {...S} />
      <path d="M0,0 C10,-14 26,-14 26,0 C26,14 10,14 0,0Z" fill={color} {...S} />
      <path d="M-4,4 L-12,20 L-4,17Z M4,4 L12,20 L4,17Z" fill={shade(color, -0.12)} {...S} />
      <path d="M-14,-4 C-10,-6 -7,-3 -5,0" fill="none" stroke={shade(color, 0.45)} strokeWidth={2} strokeLinecap="round" />
      <circle r={6} fill={knot ?? shade(color, -0.1)} {...S} />
    </g>
  )
}

export function Flower({ x, y, r = 7, color, center = '#FFD84D' }: { x: number; y: number; r?: number; color: string; center?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.75} cy={Math.sin((a * Math.PI) / 180) * r * 0.75} r={r * 0.62} fill={color} stroke={OUT} strokeWidth={2} />
      ))}
      <circle r={r * 0.42} fill={center} stroke={OUT} strokeWidth={1.6} />
    </g>
  )
}

/** Soft radial glow used by magic items and auras. */
export function Glow({ id, x, y, r, color, o = 0.7 }: { id: string; x: number; y: number; r: number; color: string; o?: number }) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={o} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} data-glow="" />
    </>
  )
}

/** Sleeves as two-pass strokes: an outline-coloured capsule, then the fill on top. */
export function Sleeves({ color, width = 17 }: { color: string; width?: number }) {
  const d = 'M93,176 L70,212 M147,176 L170,212'
  return (
    <>
      <path d={d} stroke={OUT} strokeWidth={width + 6.4} strokeLinecap="round" fill="none" />
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
    </>
  )
}

export function Window({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={70} height={84} rx={6} fill="#CDEBFF" {...S} />
      <path d={`M${x + 35},${y} L${x + 35},${y + 84} M${x},${y + 42} L${x + 70},${y + 42}`} stroke={OUT} strokeWidth={3} />
      <ellipse cx={x + 22} cy={y + 24} rx={12} ry={6} fill="#fff" />
    </g>
  )
}
