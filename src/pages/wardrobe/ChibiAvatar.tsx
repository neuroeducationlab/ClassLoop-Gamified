import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { DEFAULT_EYES, DEFAULT_LOOK, ITEM_BY_ID, THUMB_BOX, type Item, type Slot } from './catalog'
import { G, OUT, S, shade, type DrawCtx } from './draw'

export type Look = Record<Slot, string> & { skin: string; hairColor: string }

const item = (look: Look, slot: Slot): Item => ITEM_BY_ID[look[slot]] ?? ITEM_BY_ID[DEFAULT_LOOK[slot]]

/**
 * The player's chibi, layered back to front: scene, aura glow, long hair and capes,
 * legs, outfit, held item, hands, neckwear, head and face, hair, hat, aura sparkles.
 * `crop="bust"` frames head and shoulders for profile pictures.
 */
export default function ChibiAvatar({
  look,
  crop = 'full',
  scene = true,
  only,
  className,
  style,
  title,
}: {
  look: Look
  crop?: 'full' | 'bust'
  /** Draw the background scene (off for transparent shelf / HUD use). */
  scene?: boolean
  /** Draw only the background scene, or only the character (to animate them apart). */
  only?: 'scene' | 'character'
  className?: string
  style?: CSSProperties
  title?: string
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const c: DrawCtx = { hair: look.hairColor, skin: look.skin, uid }
  const bg = item(look, 'bg')
  const hair = item(look, 'hair')
  const outfit = item(look, 'outfit')
  const eyes = item(look, 'eyes')
  const parts = (['aura', 'outfit', 'held', 'neck', 'hat'] as Slot[]).map((s) => item(look, s))
  const [aura, , held, neck, hat] = parts
  const legs = outfit.pants ?? look.skin
  const shoes = outfit.shoes ?? '#F4F4F8'
  const viewBox = crop === 'bust' ? '30 6 180 180' : '0 0 240 300'

  if (only === 'scene') {
    return (
      <svg viewBox={viewBox} className={className} style={style} aria-hidden>
        {bg.back?.(c)}
      </svg>
    )
  }

  return (
    <svg viewBox={viewBox} className={className} style={style} role="img" aria-label={title ?? 'avatar'}>
      {scene && only !== 'character' && bg.back?.(c)}
      {aura.back?.(c)}
      {outfit.back?.(c)}
      {hair.back?.(c)}

      {/* legs and shoes */}
      <rect x={100} y={224} width={16} height={36} rx={6} fill={legs} {...S} />
      <rect x={124} y={224} width={16} height={36} rx={6} fill={legs} {...S} />
      <ellipse cx={106} cy={262} rx={14} ry={8} fill={shoes} {...S} />
      <ellipse cx={134} cy={262} rx={14} ry={8} fill={shoes} {...S} />

      {outfit.front?.(c)}
      {/* hands sit on top of the sleeves */}
      <circle cx={G.handL[0] + 2} cy={G.handL[1] - 2} r={9.5} fill={look.skin} {...S} />
      <circle cx={G.handR[0] - 2} cy={G.handR[1] - 2} r={9.5} fill={look.skin} {...S} />

      {neck.front?.(c)}

      {/* head */}
      <ellipse cx={G.head.cx} cy={G.head.cy} rx={G.head.rx} ry={G.head.ry} fill={look.skin} {...S} />
      <ellipse cx={84} cy={138} rx={10} ry={6} fill="#FF9E9E" opacity={0.55} />
      <ellipse cx={156} cy={138} rx={10} ry={6} fill="#FF9E9E" opacity={0.55} />
      {!eyes.replacesEyes && DEFAULT_EYES(c)}
      {eyes.front?.(c)}
      {/* A plain smile curve, in the same brown as the brows: friendly and simple. */}
      <path d="M114,148 Q120,154 126,148" fill="none" stroke={OUT} strokeWidth={2.6} strokeLinecap="round" />

      {hair.front?.(c)}
      {/* Held item in front of hair and head: the character is proudly holding it up, not hiding
          it behind long hair. Hat and aura (sparkles) still sit above. */}
      {held.front?.(c)}
      {hat.front?.(c)}
      {aura.front?.(c)}
    </svg>
  )
}

/** Slots whose thumbnail is fitted to the drawing itself; the rest use a fixed crop. */
const FIT: Partial<Record<Slot, boolean>> = { hat: true, eyes: true, neck: true, outfit: true, held: true }

/** One item on its own, sized to fill its shelf cubby (glows don't count towards the fit). */
export function ItemThumb({ item, look, className }: { item: Item; look: Look; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const c: DrawCtx = { hair: look.hairColor, skin: look.skin, uid }
  const g = useRef<SVGGElement>(null)
  const [box, setBox] = useState<[number, number, number, number]>(THUMB_BOX[item.slot])

  useLayoutEffect(() => {
    const el = g.current
    if (!FIT[item.slot] || !el) return
    // measure the whole drawing (so nested transforms count) with the glows switched off
    const glows = Array.from(el.querySelectorAll<SVGElement>('[data-glow]'))
    glows.forEach((n) => (n.style.display = 'none'))
    let b: DOMRect | null = null
    try {
      b = el.getBBox()
    } catch {
      /* not laid out yet */
    }
    glows.forEach((n) => (n.style.display = ''))
    if (!b || (!b.width && !b.height)) return
    const [x0, y0, x1, y1] = [b.x, b.y, b.x + b.width, b.y + b.height]
    const pad = 8
    const side = Math.max(x1 - x0, y1 - y0) + pad * 2
    const cx = (x0 + x1) / 2
    const cy = (y0 + y1) / 2
    setBox([cx - side / 2, cy - side / 2, side, side])
  }, [item, look.hairColor, look.skin])

  const [x, y, w, h] = box
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} className={className} aria-hidden>
      {item.slot === 'aura' && (
        // a ghost of the character, so an effect reads as "around you"
        <g fill="#fff" opacity={0.28}>
          <ellipse cx={G.head.cx} cy={G.head.cy} rx={G.head.rx} ry={G.head.ry} />
          <path d="M86,168 Q120,158 154,168 L162,262 Q120,272 78,262 Z" />
        </g>
      )}
      <g ref={g}>
        {item.slot === 'hair' && (
          <>
            {item.back?.(c)}
            <ellipse cx={G.head.cx} cy={G.head.cy} rx={G.head.rx} ry={G.head.ry} fill={look.skin} {...S} />
            {item.front?.(c)}
          </>
        )}
        {item.slot === 'bg' && item.back?.(c)}
        {item.slot !== 'hair' && item.slot !== 'bg' && (
          <>
            {item.back?.(c)}
            {item.front?.(c)}
          </>
        )}
        {item.slot === 'outfit' && (
          <>
            <circle cx={G.handL[0] + 2} cy={G.handL[1] - 2} r={9.5} fill={shade(look.skin, 0)} {...S} />
            <circle cx={G.handR[0] - 2} cy={G.handR[1] - 2} r={9.5} fill={look.skin} {...S} />
          </>
        )}
      </g>
    </svg>
  )
}
