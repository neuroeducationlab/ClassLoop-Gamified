/**
 * Drawing kit for the chibi character (reference: cozy dress-up games): thick warm-brown
 * outlines, pastel fills, big head. Everything is plain SVG in one 240×300 space, so an
 * item is drawn once and serves both as a layer on the character and, cropped, as its
 * shelf thumbnail. No image files, so nothing can 404 on stage.
 */
import type { ReactNode, SVGProps } from 'react'

export const OUT = '#5B3A2E'
export const SW = 3.2
/** Outline props shared by every shape. */
export const S = { stroke: OUT, strokeWidth: SW, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

export const SKIN_TONES = ['#FFE6D5', '#F6CDB0', '#DDA47E', '#A8704C'] as const
export const HAIR_COLORS = [
  '#A8653A', // caramel
  '#3B2A22', // espresso
  '#E9C46A', // honey blonde
  '#F4A6C0', // sakura pink
  '#B9A3E8', // lavender
  '#7FD3C3', // mint
  '#262338', // midnight
  '#E8E6F0', // silver
] as const

/** Geometry of the base body, shared by items that sit on it. */
export const G = {
  head: { cx: 120, cy: 112, rx: 64, ry: 58 },
  eyeL: [98, 122] as const,
  eyeR: [142, 122] as const,
  handL: [66, 218] as const,
  handR: [174, 218] as const,
  neck: [120, 170] as const,
}

export const shade = (hex: string, k: number) => {
  // k < 0 darkens, k > 0 lightens
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.round(Math.max(0, Math.min(255, k < 0 ? c * (1 + k) : c + (255 - c) * k)))
  return `#${[n >> 16, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`
}

export function starPath(cx: number, cy: number, r: number, inner = r * 0.45, points = 5, rot = -Math.PI / 2) {
  const pts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? inner : r
    const a = rot + (i * Math.PI) / points
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

export function heartPath(cx: number, cy: number, s: number) {
  return `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy} ${cx - s * 0.9},${cy - s * 1.1} ${cx},${cy - s * 0.35} C${cx + s * 0.9},${cy - s * 1.1} ${cx + s * 1.4},${cy} ${cx},${cy + s * 0.9}Z`
}

/** A four-point twinkle. */
export function twinkle(cx: number, cy: number, r: number) {
  const k = r * 0.28
  return `M${cx},${cy - r} Q${cx + k},${cy - k} ${cx + r},${cy} Q${cx + k},${cy + k} ${cx},${cy + r} Q${cx - k},${cy + k} ${cx - r},${cy} Q${cx - k},${cy - k} ${cx},${cy - r}Z`
}




export type DrawCtx = { hair: string; skin: string; uid: string }
export type Draw = (c: DrawCtx) => ReactNode
export type P = SVGProps<SVGSVGElement>
