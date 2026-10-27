import { CanvasTexture, RepeatWrapping, SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter } from 'three'

/**
 * Procedural texture generators for urban realism.
 * Avoids any external image/HDR files so nothing can 404.
 */

let cachedPaving: CanvasTexture | null = null
let cachedAsphalt: CanvasTexture | null = null
let cachedWindowGrid: CanvasTexture | null = null
let cachedWindowEmissive: CanvasTexture | null = null
let cachedConcrete: CanvasTexture | null = null

function configureTexture(tex: CanvasTexture, repeatX: number, repeatY: number) {
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.colorSpace = SRGBColorSpace
  tex.generateMipmaps = true
  tex.minFilter = LinearMipmapLinearFilter
  tex.magFilter = LinearFilter
  tex.anisotropy = 16
  tex.repeat.set(repeatX, repeatY)
  tex.needsUpdate = true
  return tex
}

export function getPavingTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (cachedPaving) return cachedPaving

  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Base warm stone / granite tone
  ctx.fillStyle = '#D6D1C7'
  ctx.fillRect(0, 0, size, size)

  // Subtle aggregate stone noise
  const imgData = ctx.getImageData(0, 0, size, size)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14
    d[i] = Math.min(255, Math.max(0, d[i] + noise))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise))
  }
  ctx.putImageData(imgData, 0, 0)

  // Modern large-format paving slab grid
  const tileW = 128
  const tileH = 64
  ctx.strokeStyle = '#A8A297'
  ctx.lineWidth = 3

  let row = 0
  for (let y = 0; y <= size; y += tileH) {
    const offsetX = (row % 2) * (tileW / 2)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()

    for (let x = offsetX - tileW; x <= size + tileW; x += tileW) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + tileH)
      ctx.stroke()
    }
    row++
  }

  const tex = configureTexture(new CanvasTexture(canvas), 6, 6)
  cachedPaving = tex
  return tex
}

export function getAsphaltTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (cachedAsphalt) return cachedAsphalt

  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Base dark asphalt
  ctx.fillStyle = '#282A30'
  ctx.fillRect(0, 0, size, size)

  // Aggregate grain / road texture
  const imgData = ctx.getImageData(0, 0, size, size)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const grain = (Math.random() - 0.5) * 20
    d[i] = Math.min(255, Math.max(0, d[i] + grain))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + grain))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + grain + 2))
  }
  ctx.putImageData(imgData, 0, 0)

  const tex = configureTexture(new CanvasTexture(canvas), 4, 4)
  cachedAsphalt = tex
  return tex
}

export function getConcreteTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null
  if (cachedConcrete) return cachedConcrete

  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Architectural light off-white concrete
  ctx.fillStyle = '#E8EBF2'
  ctx.fillRect(0, 0, size, size)

  const imgData = ctx.getImageData(0, 0, size, size)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 10
    d[i] = Math.min(255, Math.max(0, d[i] + n))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
  }
  ctx.putImageData(imgData, 0, 0)

  // Formwork tie-rod holes and subtle panel seams
  ctx.strokeStyle = '#D4D7E2'
  ctx.lineWidth = 2
  for (let y = 256; y < size; y += 256) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  const tex = configureTexture(new CanvasTexture(canvas), 1, 1)
  cachedConcrete = tex
  return tex
}

/**
 * Modern architectural curtain-wall glass texture.
 * Generates both diffuse/color map and matching emissive map for glowing office windows.
 */
export function getWindowGridTextures(): {
  diffuse: CanvasTexture | null
  emissive: CanvasTexture | null
} {
  if (typeof document === 'undefined') return { diffuse: null, emissive: null }
  if (cachedWindowGrid && cachedWindowEmissive) {
    return { diffuse: cachedWindowGrid, emissive: cachedWindowEmissive }
  }

  const sizeW = 1024
  const sizeH = 1024
  const diffuseCanvas = document.createElement('canvas')
  diffuseCanvas.width = sizeW
  diffuseCanvas.height = sizeH
  const dCtx = diffuseCanvas.getContext('2d')

  const emissiveCanvas = document.createElement('canvas')
  emissiveCanvas.width = sizeW
  emissiveCanvas.height = sizeH
  const eCtx = emissiveCanvas.getContext('2d')

  if (!dCtx || !eCtx) return { diffuse: null, emissive: null }

  // Background frame / dark architectural mullions
  dCtx.fillStyle = '#181B22'
  dCtx.fillRect(0, 0, sizeW, sizeH)

  eCtx.fillStyle = '#000000'
  eCtx.fillRect(0, 0, sizeW, sizeH)

  const cols = 12
  const rows = 24
  const padX = 4
  const padY = 4
  const cellW = sizeW / cols
  const cellH = sizeH / rows

  const warmLitColors = ['#FFE8B3', '#FFD480', '#FFF3D6', '#FFCA6B', '#FCEECB']
  const coolDarkColors = ['#1D2A3B', '#243447', '#1E2C3D', '#2A3C52']

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW + padX
      const y = r * cellH + padY
      const w = cellW - padX * 2
      const h = cellH - padY * 2

      // Deterministic pseudo-random so it stays identical across frames
      const seed = Math.sin(r * 31.7 + c * 17.3) * 10000
      const rand = seed - Math.floor(seed)
      const isLit = rand > 0.38 // ~62% of windows lit (bustling evening university)

      if (isLit) {
        const colorIdx = Math.floor(rand * warmLitColors.length) % warmLitColors.length
        const color = warmLitColors[colorIdx]
        dCtx.fillStyle = color
        dCtx.fillRect(x, y, w, h)

        // Subtle gradient / blinds inside window
        dCtx.fillStyle = 'rgba(0,0,0,0.1)'
        dCtx.fillRect(x, y + h * 0.5, w, h * 0.5)

        eCtx.fillStyle = color
        eCtx.fillRect(x, y, w, h)
      } else {
        const colorIdx = Math.floor(rand * coolDarkColors.length) % coolDarkColors.length
        const color = coolDarkColors[colorIdx]
        dCtx.fillStyle = color
        dCtx.fillRect(x, y, w, h)
        // Emissive stays pure black
      }
    }
  }

  const diffuseTex = configureTexture(new CanvasTexture(diffuseCanvas), 1, 1)
  const emissiveTex = configureTexture(new CanvasTexture(emissiveCanvas), 1, 1)

  cachedWindowGrid = diffuseTex
  cachedWindowEmissive = emissiveTex

  return { diffuse: diffuseTex, emissive: emissiveTex }
}
