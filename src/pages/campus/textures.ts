import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/**
 * Procedural textures, drawn once on a canvas and cached. No image files:
 * nothing to download, nothing that can 404 on stage (see CAMPUS_BRIEF.md).
 *
 * Everything uses a seeded PRNG so the campus looks identical on every take.
 */

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const cache = new Map<string, Texture>()

function make(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, rand: () => number) => void, srgb = true) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  draw(ctx, rng(key.length * 7919 + size))
  const tex = new CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.anisotropy = 8
  if (srgb) tex.colorSpace = SRGBColorSpace
  cache.set(key, tex)
  return tex
}

/** Speckle noise over a base colour — the grain that makes flat planes read as material. */
function speckle(ctx: CanvasRenderingContext2D, rand: () => number, size: number, alpha: number, count: number) {
  for (let i = 0; i < count; i++) {
    const v = rand() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${v},${v},${v},${rand() * alpha})`
    ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2)
  }
}

/** Square paving slabs with mortar joints, for plazas and walkways. */
export function pavingTexture(base = '#CFC6B6') {
  return make(`paving-${base}`, 256, (ctx, rand) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 256, 256)
    const tile = 64
    for (let y = 0; y < 256; y += tile)
      for (let x = 0; x < 256; x += tile) {
        const shade = 0.9 + rand() * 0.14
        ctx.fillStyle = `rgba(255,255,255,${(shade - 0.9) * 0.6})`
        ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4)
      }
    speckle(ctx, rand, 256, 0.12, 2600)
    ctx.strokeStyle = 'rgba(60,50,40,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 256; i += tile) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 256)
      ctx.moveTo(0, i)
      ctx.lineTo(256, i)
    }
    ctx.stroke()
  })
}

/** Dark asphalt grain for roads and car parks. */
export function asphaltTexture() {
  return make('asphalt', 256, (ctx, rand) => {
    ctx.fillStyle = '#3B3D44'
    ctx.fillRect(0, 0, 256, 256)
    speckle(ctx, rand, 256, 0.18, 5000)
  })
}

/** Light board-formed concrete for podiums, viaduct and context buildings. */
export function concreteTexture() {
  return make('concrete', 256, (ctx, rand) => {
    ctx.fillStyle = '#D8D6D2'
    ctx.fillRect(0, 0, 256, 256)
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = `rgba(0,0,0,${0.02 + rand() * 0.04})`
      ctx.fillRect(0, y, 256, 32)
    }
    speckle(ctx, rand, 256, 0.1, 2500)
  })
}

/** Short grass for lawn patches (the campus is urban — lawns only, no trees). */
export function lawnTexture() {
  return make('lawn', 256, (ctx, rand) => {
    ctx.fillStyle = '#6E9E57'
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 4000; i++) {
      const g = 120 + rand() * 70
      ctx.fillStyle = `rgba(${60 + rand() * 30},${g},${50 + rand() * 20},0.5)`
      ctx.fillRect(rand() * 256, rand() * 256, 1, 2 + rand() * 3)
    }
  })
}

/**
 * Curtain-wall facade: a grid of glass panes with mullions. Returns the
 * colour map plus an emissive map where some rooms have their lights on,
 * which glows at golden hour and under bloom.
 */
export function facadeTextures(seed: string, cols = 6, rows = 10, litRatio = 0.22) {
  const draw = (lit: boolean) => (ctx: CanvasRenderingContext2D, rand: () => number) => {
    const w = 256 / cols
    const h = 256 / rows
    ctx.fillStyle = lit ? '#000000' : '#7F91A3'
    ctx.fillRect(0, 0, 256, 256)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const on = rand() < litRatio
        if (lit) {
          if (!on) continue
          const warm = 200 + rand() * 55
          ctx.fillStyle = `rgb(${warm},${warm * 0.88},${warm * 0.68})`
        } else {
          const tint = 120 + rand() * 40
          ctx.fillStyle = `rgb(${tint * 0.78},${tint * 0.9},${tint * 1.05})`
        }
        ctx.fillRect(c * w + 2, r * h + 2, w - 4, h - 3)
        if (!lit) {
          // sky reflection streak across the top of each pane
          ctx.fillStyle = 'rgba(255,255,255,0.18)'
          ctx.fillRect(c * w + 2, r * h + 2, w - 4, (h - 3) * 0.35)
        }
      }
    if (!lit) {
      ctx.fillStyle = '#E6E8EC'
      for (let r = 0; r <= rows; r++) ctx.fillRect(0, r * h - 1, 256, 3) // floor slabs
    }
  }
  return {
    map: make(`facade-${seed}-${cols}x${rows}`, 256, draw(false)),
    emissiveMap: make(`facade-lit-${seed}-${cols}x${rows}`, 256, draw(true)),
  }
}

/** Red brick with mortar, for the dorm (bldg 6 is red brick on the SPU map). */
export function brickTexture() {
  return make('brick', 256, (ctx, rand) => {
    ctx.fillStyle = '#C9B9A6'
    ctx.fillRect(0, 0, 256, 256)
    const bw = 32
    const bh = 14
    for (let y = 0, row = 0; y < 256; y += bh, row++)
      for (let x = row % 2 ? -bw / 2 : 0; x < 256; x += bw) {
        const r = 150 + rand() * 40
        ctx.fillStyle = `rgb(${r},${r * 0.42},${r * 0.32})`
        ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2)
      }
    speckle(ctx, rand, 256, 0.12, 1500)
  })
}
