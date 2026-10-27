let cached: boolean | null = null

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

/**
 * Phones, small screens and GPU-less machines skip post-processing and use
 * lighter shadows so the campus stays smooth. `?lite` forces it on any device;
 * `?hq` forces full quality (e.g. filming on a laptop that misreports itself).
 */
export function isLowPower() {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  if (q.has('hq')) return false
  if (q.has('lite')) return true
  cached ??= window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 || softwareRenderer()
  return cached
}
