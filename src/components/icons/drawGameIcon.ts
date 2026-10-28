import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GAME_ICONS, type IconName } from '@/components/icons/GameIcon'

const shapeCache = new Map<IconName, Path2D[]>()

function shapes(name: IconName): Path2D[] {
  const hit = shapeCache.get(name)
  if (hit) return hit
  const markup = renderToStaticMarkup(createElement(GAME_ICONS[name]))
  const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  const out: Path2D[] = []
  for (const el of Array.from(svg.children)) {
    const n = (a: string) => Number(el.getAttribute(a) ?? 0)
    const p = new Path2D()
    switch (el.tagName) {
      case 'path':
        p.addPath(new Path2D(el.getAttribute('d') ?? ''))
        break
      case 'circle':
        p.arc(n('cx'), n('cy'), n('r'), 0, Math.PI * 2)
        break
      case 'ellipse':
        p.ellipse(n('cx'), n('cy'), n('rx'), n('ry'), 0, 0, Math.PI * 2)
        break
      case 'rect':
        p.roundRect(n('x'), n('y'), n('width'), n('height'), n('rx'))
        break
      case 'line':
        p.moveTo(n('x1'), n('y1'))
        p.lineTo(n('x2'), n('y2'))
        break
      case 'polyline':
      case 'polygon': {
        const pts = (el.getAttribute('points') ?? '').trim().split(/[\s,]+/).map(Number)
        for (let i = 0; i + 1 < pts.length; i += 2) (i ? p.lineTo : p.moveTo).call(p, pts[i], pts[i + 1])
        if (el.tagName === 'polygon') p.closePath()
        break
      }
    }
    out.push(p)
  }
  shapeCache.set(name, out)
  return out
}

/** Strokes a Lucide icon onto a 2D canvas — billboard textures can't host DOM. */
export function drawGameIcon(
  g: CanvasRenderingContext2D,
  name: IconName,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  g.save()
  g.translate(cx - size / 2, cy - size / 2)
  g.scale(size / 24, size / 24)
  g.strokeStyle = color
  g.lineWidth = 2.25
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const p of shapes(name)) g.stroke(p)
  g.restore()
}
