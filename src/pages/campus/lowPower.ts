let cached: boolean | null = null

const QUALITY_KEY = 'classloop-quality'

/** True when WebGL is running on a CPU rasteriser (no GPU) — post-processing would crawl there. */
function softwareRenderer() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return true
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    return /swiftshader|llvmpipe|software/i.test(name)
  } catch {
    return true
  }
}

/** Remembered choice from a previous ?hq / ?lite, so the filming laptop stays on full quality. */
function storedQuality(): string | null {
  try {
    return localStorage.getItem(QUALITY_KEY)
  } catch {
    return null
  }
}

function storeQuality(value: 'hq' | 'lite' | null) {
  try {
    if (value) localStorage.setItem(QUALITY_KEY, value)
    else localStorage.removeItem(QUALITY_KEY)
  } catch {
    // private mode / blocked storage: the URL flag still works for this visit
  }
}

/**
 * Phones, small screens and GPU-less machines skip post-processing and use
 * lighter shadows so the campus stays smooth. A laptop with a GPU gets full
 * quality automatically.
 *
 * Overrides (remembered on this browser until changed):
 *   ?hq   — always full quality (use once on the filming laptop)
 *   ?lite — always light mode
 *   ?auto — forget the choice, detect again
 */
export function isLowPower() {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  if (q.has('hq')) storeQuality('hq')
  else if (q.has('lite')) storeQuality('lite')
  else if (q.has('auto')) storeQuality(null)

  const choice = storedQuality()
  if (choice === 'hq') return false
  if (choice === 'lite') return true
  cached ??=
    window.innerWidth < 768 ||
    window.matchMedia('(pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    softwareRenderer()
  return cached
}
