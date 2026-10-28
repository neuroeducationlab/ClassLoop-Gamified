/**
 * Every wardrobe item. Each one is drawn in the character's 240×300 space (see draw.tsx),
 * so the same drawing dresses the character and fills its shelf cubby.
 *
 * Unlocks: common items are free, rare/epic cost coins earned from quests and drills,
 * legendary items only come from special quests (? blocks, perfect Brain Gym, flashcards…).
 */
import type { AvatarAura, AvatarHat, AvatarOutfit } from '@/context/AppContext'
import { G, OUT, S, SW, heartPath, shade, starPath, twinkle, type Draw } from './draw'
import { Bow, Flower, Glow, Sleeves, Window } from './parts'

export type Slot = 'hat' | 'hair' | 'eyes' | 'neck' | 'outfit' | 'held' | 'aura' | 'bg'
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type QuestId = 'block-1' | 'block-2' | 'block-3' | 'block-4' | 'block-5' | 'gym-perfect' | 'flashcards' | 'social'
export type Unlock = { kind: 'free' } | { kind: 'coins'; price: number } | { kind: 'quest'; quest: QuestId }

export type Item = {
  id: string
  slot: Slot
  name: { th: string; en: string }
  rarity: Rarity
  unlock: Unlock
  /** Main layer, in front of the body. */
  front?: Draw
  /** Behind the head and body (long hair, capes, wings, halos). */
  back?: Draw
  /** Eye styles draw their own eyes instead of the default ones. */
  replacesEyes?: boolean
  /** Outfits: leg and shoe colours (legs are skin when unset). */
  pants?: string
  shoes?: string
  /** Scenes: sky and floor colours, to fill the stage around the 240×300 drawing. */
  edge?: [top: string, bottom: string]
  /** What the 3D campus avatar wears when this is equipped. */
  three?: { hat?: AvatarHat; outfit?: AvatarOutfit; aura?: AvatarAura; color?: string }
}

const free = { kind: 'free' } as const
const coins = (price: number) => ({ kind: 'coins', price }) as const
const quest = (q: QuestId) => ({ kind: 'quest', quest: q }) as const
const n = (th: string, en: string) => ({ th, en })

/* ─────────────────────────────── shared body parts ── */

const TORSO = 'M86,168 Q120,158 154,168 L162,230 Q120,238 78,230 Z'

type OutfitSpec = { top: string; sleeve?: string; details?: Draw; long?: boolean }
function outfitFront({ top, sleeve, details, long }: OutfitSpec): Draw {
  return (c) => (
    <g>
      <Sleeves color={sleeve ?? top} />
      <path d={long ? 'M86,168 Q120,158 154,168 L170,256 Q120,266 70,256 Z' : TORSO} fill={top} {...S} />
      {details?.(c)}
    </g>
  )
}

/* ─────────────────────────────────────────── hair ── */

function hairItem(id: string, name: ReturnType<typeof n>, front: Draw, back?: Draw): Item {
  return { id, slot: 'hair', name, rarity: 'common', unlock: free, front, back }
}

const BANGS = 'M56,118 Q50,62 96,50 Q120,40 146,48 Q192,60 184,118 Q178,96 170,92 L162,104 L154,86 L140,100 L132,80 L118,98 L108,80 L96,98 L86,84 L76,100 Q66,98 56,118 Z'

const HAIRS: Item[] = [
  hairItem('hair-fluffy', n('ผมฟูนุ่ม', 'Fluffy'), (c) => (
    <g>
      <path d={BANGS} fill={c.hair} {...S} />
      <path d="M78,64 Q96,54 112,58" fill="none" stroke={shade(c.hair, 0.4)} strokeWidth={3} strokeLinecap="round" />
      <path d="M118,42 Q122,30 132,34" fill="none" stroke={OUT} strokeWidth={SW} strokeLinecap="round" />
    </g>
  ), (c) => <ellipse cx={120} cy={104} rx={70} ry={62} fill={c.hair} {...S} />),
  hairItem('hair-bob', n('ผมบ๊อบ', 'Bob'), (c) => (
    <g>
      <path d="M54,150 Q44,58 120,46 Q196,58 186,150 Q178,154 172,146 Q170,110 160,96 Q130,104 100,90 Q86,108 70,104 Q66,124 68,146 Q62,154 54,150 Z" fill={c.hair} {...S} />
      <path d="M84,66 Q102,56 120,58" fill="none" stroke={shade(c.hair, 0.4)} strokeWidth={3} strokeLinecap="round" />
    </g>
  ), (c) => <path d="M52,104 Q52,40 120,40 Q188,40 188,104 L190,160 Q120,176 50,160 Z" fill={c.hair} {...S} />),
  hairItem('hair-long', n('ผมยาวสลวย', 'Long & flowy'), (c) => (
    <g>
      <path d="M56,124 Q48,56 120,46 Q192,56 184,124 Q176,100 166,92 Q150,100 138,86 Q124,100 104,90 Q92,104 76,98 Q62,106 56,124 Z" fill={c.hair} {...S} />
      <path d="M84,62 Q102,54 118,56" fill="none" stroke={shade(c.hair, 0.4)} strokeWidth={3} strokeLinecap="round" />
    </g>
  ), (c) => <path d="M50,110 Q46,40 120,38 Q194,40 190,110 Q196,190 178,236 Q160,226 150,236 Q120,220 90,236 Q80,226 62,236 Q44,190 50,110 Z" fill={c.hair} {...S} />),
  hairItem('hair-twintails', n('ผมแกละ', 'Twin tails'), (c) => (
    <g>
      <path d={BANGS} fill={c.hair} {...S} />
      <circle cx={58} cy={84} r={7} fill="#F47C9C" {...S} />
      <circle cx={182} cy={84} r={7} fill="#F47C9C" {...S} />
    </g>
  ), (c) => (
    <g>
      <path d="M58,84 Q20,100 26,160 Q30,196 50,206 Q44,170 60,140 Q66,110 58,84 Z" fill={c.hair} {...S} />
      <path d="M182,84 Q220,100 214,160 Q210,196 190,206 Q196,170 180,140 Q174,110 182,84 Z" fill={c.hair} {...S} />
      <ellipse cx={120} cy={104} rx={68} ry={60} fill={c.hair} {...S} />
    </g>
  )),
  hairItem('hair-bun', n('ผมดังโงะ', 'Top bun'), (c) => (
    <g>
      <path d={BANGS} fill={c.hair} {...S} />
      <path d="M100,52 Q104,44 112,48" fill="none" stroke={shade(c.hair, 0.4)} strokeWidth={3} strokeLinecap="round" />
    </g>
  ), (c) => (
    <g>
      <circle cx={120} cy={40} r={22} fill={c.hair} {...S} />
      <path d="M104,34 Q114,26 126,30" fill="none" stroke={shade(c.hair, 0.4)} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={120} cy={104} rx={68} ry={60} fill={c.hair} {...S} />
    </g>
  )),
  hairItem('hair-spiky', n('ผมตั้งเท่', 'Spiky'), (c) => (
    <path d="M56,118 Q48,80 62,62 L58,40 L80,52 L86,26 L104,46 L120,20 L136,46 L154,26 L160,52 L182,40 L178,62 Q192,80 184,118 Q176,98 166,96 L158,108 L148,90 L134,104 L122,86 L108,104 L94,90 L84,108 L74,96 Q62,100 56,118 Z" fill={c.hair} {...S} />
  ), (c) => <ellipse cx={120} cy={106} rx={68} ry={60} fill={c.hair} {...S} />),
  hairItem('hair-wavy', n('ผมลอนหวาน', 'Sweet waves'), (c) => (
    <g>
      <path d="M56,122 Q46,58 120,46 Q194,58 184,122 Q180,100 170,96 Q160,106 148,94 Q136,106 122,92 Q108,106 96,94 Q84,106 72,96 Q60,104 56,122 Z" fill={c.hair} {...S} />
    </g>
  ), (c) => <path d="M50,108 Q46,40 120,38 Q194,40 190,108 Q206,140 192,170 Q206,196 186,214 Q170,206 160,216 Q150,200 120,206 Q90,200 80,216 Q70,206 54,214 Q34,196 48,170 Q34,140 50,108 Z" fill={c.hair} {...S} />),
]

/* ─────────────────────────────────────────── hats ── */

function catEars(color: (c: Parameters<Draw>[0]) => string): Draw {
  return (c) => (
    <g>
      <path d="M64,86 L72,36 L106,60 Z" fill={color(c)} {...S} />
      <path d="M74,72 L77,48 L94,60 Z" fill="#FFC1CC" />
      <path d="M176,86 L168,36 L134,60 Z" fill={color(c)} {...S} />
      <path d="M166,72 L163,48 L146,60 Z" fill="#FFC1CC" />
    </g>
  )
}

const HATS: Item[] = [
  { id: 'hat-none', slot: 'hat', name: n('ไม่สวม', 'None'), rarity: 'common', unlock: free, three: { hat: 'none' } },
  { id: 'hat-sprout', slot: 'hat', name: n('ต้นอ่อนน้อย', 'Little sprout'), rarity: 'common', unlock: free, front: () => (
    <g>
      <path d="M120,50 Q118,36 120,26" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      <path d="M120,30 Q104,16 92,26 Q104,38 120,30Z" fill="#8FD16A" {...S} />
      <path d="M120,30 Q136,14 148,24 Q136,38 120,30Z" fill="#A6E07F" {...S} />
    </g>
  ) },
  { id: 'hat-cat', slot: 'hat', name: n('หูแมว', 'Cat ears'), rarity: 'common', unlock: free, front: catEars((c) => c.hair), three: { hat: 'cyber_cat' } },
  { id: 'hat-grad', slot: 'hat', name: n('หมวกบัณฑิต SPU', 'SPU grad cap'), rarity: 'common', unlock: free, three: { hat: 'grad' }, front: () => (
    <g>
      <path d="M86,70 Q120,80 154,70 L154,58 L86,58 Z" fill="#26335C" {...S} />
      <path d="M56,56 L120,34 L184,56 L120,78 Z" fill="#33467A" {...S} />
      <path d="M120,56 L168,62 L170,92" fill="none" stroke="#F7C948" strokeWidth={3} strokeLinecap="round" />
      <path d="M164,92 L176,92 L172,106 L168,106 Z" fill="#F7C948" {...S} />
      <circle cx={120} cy={56} r={4} fill="#F7C948" stroke={OUT} strokeWidth={2} />
    </g>
  ) },
  { id: 'hat-beret', slot: 'hat', name: n('หมวกเบเร่ต์', 'Artist beret'), rarity: 'common', unlock: free, front: () => (
    <g>
      <path d="M62,80 Q62,42 124,40 Q186,42 180,72 Q122,92 62,80 Z" fill="#E2564F" {...S} />
      <path d="M124,40 Q126,30 132,30" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      <path d="M86,56 Q104,48 122,48" fill="none" stroke="#F49A93" strokeWidth={3} strokeLinecap="round" />
    </g>
  ) },
  { id: 'hat-frog', slot: 'hat', name: n('หมวกกบน้อย', 'Froggy hat'), rarity: 'rare', unlock: coins(80), three: { hat: 'beanie' }, front: () => (
    <g>
      <circle cx={90} cy={46} r={17} fill="#9ED36A" {...S} />
      <circle cx={150} cy={46} r={17} fill="#9ED36A" {...S} />
      <path d="M58,98 Q56,48 120,46 Q184,48 182,98 Q120,84 58,98 Z" fill="#9ED36A" {...S} />
      <circle cx={90} cy={44} r={7} fill="#fff" stroke={OUT} strokeWidth={2} />
      <circle cx={150} cy={44} r={7} fill="#fff" stroke={OUT} strokeWidth={2} />
      <circle cx={91} cy={45} r={3.2} fill={OUT} />
      <circle cx={151} cy={45} r={3.2} fill={OUT} />
      <ellipse cx={82} cy={72} rx={8} ry={5} fill="#F7A9A0" opacity={0.8} />
      <ellipse cx={158} cy={72} rx={8} ry={5} fill="#F7A9A0" opacity={0.8} />
    </g>
  ) },
  { id: 'hat-beanie', slot: 'hat', name: n('บีนนี่ปอมปอม', 'Pom-pom beanie'), rarity: 'rare', unlock: coins(60), three: { hat: 'beanie' }, front: () => (
    <g>
      <path d="M60,96 Q56,40 120,38 Q184,40 180,96 Z" fill="#F49AC1" {...S} />
      <rect x={56} y={82} width={128} height={20} rx={10} fill="#E57AAA" {...S} />
      {[72, 88, 104, 120, 136, 152, 168].map((x) => <path key={x} d={`M${x},86 L${x},98`} stroke="#C85D8E" strokeWidth={2} strokeLinecap="round" />)}
      <circle cx={120} cy={34} r={13} fill="#FFE3EF" {...S} />
    </g>
  ) },
  { id: 'hat-bunny', slot: 'hat', name: n('หูกระต่าย', 'Bunny ears'), rarity: 'rare', unlock: coins(90), front: () => (
    <g>
      <g transform="rotate(-14 94 50)"><ellipse cx={94} cy={22} rx={13} ry={36} fill="#fff" {...S} /><ellipse cx={94} cy={24} rx={6} ry={25} fill="#FFC1D6" /></g>
      <g transform="rotate(14 146 50)"><ellipse cx={146} cy={22} rx={13} ry={36} fill="#fff" {...S} /><ellipse cx={146} cy={24} rx={6} ry={25} fill="#FFC1D6" /></g>
      <Bow x={156} y={62} color="#FF8FB1" s={0.55} />
    </g>
  ) },
  { id: 'hat-strawberry', slot: 'hat', name: n('หมวกสตรอว์เบอร์รี่', 'Strawberry hat'), rarity: 'rare', unlock: coins(110), front: () => (
    <g>
      <path d="M60,96 Q58,42 120,40 Q182,42 180,96 Q120,82 60,96 Z" fill="#F0525B" {...S} />
      {[[84, 64], [104, 54], [126, 56], [148, 62], [96, 78], [120, 72], [144, 78], [164, 80], [76, 84]].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx={2.4} ry={3.4} fill="#FFE07A" />
      ))}
      <path d="M120,44 L104,30 L116,36 L120,22 L124,36 L136,30 Z" fill="#7CC25A" {...S} />
    </g>
  ) },
  { id: 'hat-devil', slot: 'hat', name: n('เขาปีศาจน้อย', 'Little devil horns'), rarity: 'rare', unlock: coins(100), front: () => (
    <g>
      <path d="M80,74 Q66,52 76,34 Q84,52 98,62 Z" fill="#E8414E" {...S} />
      <path d="M160,74 Q174,52 164,34 Q156,52 142,62 Z" fill="#E8414E" {...S} />
    </g>
  ) },
  { id: 'hat-flowers', slot: 'hat', name: n('มงกุฎดอกไม้', 'Flower crown'), rarity: 'rare', unlock: coins(120), front: () => (
    <g>
      <path d="M60,90 Q120,40 180,90" fill="none" stroke="#6FB05A" strokeWidth={5} strokeLinecap="round" />
      {[[64, 86, '#FFB3C7'], [82, 70, '#FFF1A8'], [102, 60, '#C9B6FF'], [120, 57, '#FF8FB1'], [138, 60, '#FFF1A8'], [158, 70, '#B5E8FF'], [176, 86, '#FFB3C7']].map(([x, y, col]) => (
        <Flower key={`${x}`} x={x as number} y={y as number} r={9} color={col as string} />
      ))}
    </g>
  ) },
  { id: 'hat-headphones', slot: 'hat', name: n('หูฟังดีเจ', 'DJ headphones'), rarity: 'rare', unlock: coins(150), three: { hat: 'dj_headset' }, front: () => (
    <g>
      <path d="M58,112 Q56,42 120,40 Q184,42 182,112" fill="none" stroke={OUT} strokeWidth={13} strokeLinecap="round" />
      <path d="M58,112 Q56,42 120,40 Q184,42 182,112" fill="none" stroke="#4A4E7A" strokeWidth={7} strokeLinecap="round" />
      <rect x={42} y={96} width={24} height={38} rx={11} fill="#F27FB2" {...S} />
      <rect x={174} y={96} width={24} height={38} rx={11} fill="#F27FB2" {...S} />
      <circle cx={54} cy={115} r={5} fill="#FFD3E6" />
      <circle cx={186} cy={115} r={5} fill="#FFD3E6" />
    </g>
  ) },
  { id: 'hat-witch', slot: 'hat', name: n('หมวกแม่มดดาว', 'Starry witch hat'), rarity: 'epic', unlock: coins(220), front: () => (
    <g>
      <ellipse cx={120} cy={76} rx={80} ry={15} fill="#6D4AA8" {...S} />
      <path d="M80,74 Q104,46 112,10 Q122,0 150,22 Q132,30 136,46 Q144,62 160,74 Z" fill="#7B57BE" {...S} />
      <path d="M86,64 Q120,72 154,64 L158,74 Q120,82 82,74 Z" fill="#F7C948" {...S} />
      <path d={starPath(120, 44, 9)} fill="#FFE27A" {...S} strokeWidth={2} />
    </g>
  ) },
  { id: 'hat-crown', slot: 'hat', name: n('มงกุฎราชา', 'Royal crown'), rarity: 'epic', unlock: coins(300), three: { hat: 'crown' }, front: () => (
    <g>
      <path d="M74,78 L78,38 L98,58 L120,30 L142,58 L162,38 L166,78 Z" fill="#F7C948" {...S} />
      <rect x={72} y={70} width={96} height={14} rx={6} fill="#E8B23A" {...S} />
      <circle cx={120} cy={77} r={5} fill="#E8414E" stroke={OUT} strokeWidth={2} />
      <circle cx={96} cy={77} r={4} fill="#4FA3F7" stroke={OUT} strokeWidth={2} />
      <circle cx={144} cy={77} r={4} fill="#4FA3F7" stroke={OUT} strokeWidth={2} />
      <circle cx={78} cy={36} r={4} fill="#fff" stroke={OUT} strokeWidth={2} />
      <circle cx={120} cy={28} r={4} fill="#fff" stroke={OUT} strokeWidth={2} />
      <circle cx={162} cy={36} r={4} fill="#fff" stroke={OUT} strokeWidth={2} />
    </g>
  ) },
  { id: 'hat-halo', slot: 'hat', name: n('วงแหวนนางฟ้า', 'Angel halo'), rarity: 'epic', unlock: coins(260), front: (c) => (
    <g>
      <Glow id={`${c.uid}halo`} x={120} y={30} r={50} color="#FFE9A3" />
      <ellipse cx={120} cy={30} rx={42} ry={10} fill="none" stroke={OUT} strokeWidth={10} />
      <ellipse cx={120} cy={30} rx={42} ry={10} fill="none" stroke="#FFD95A" strokeWidth={5} />
    </g>
  ) },
  { id: 'hat-starcrown', slot: 'hat', name: n('มงกุฎดวงดาว', 'Star crown'), rarity: 'legendary', unlock: quest('block-1'), three: { hat: 'crown' }, front: (c) => (
    <g>
      <Glow id={`${c.uid}sc`} x={120} y={44} r={64} color="#FFF0A8" o={0.85} />
      <path d="M70,80 L74,44 L94,62 L104,34 L120,52 L136,34 L146,62 L166,44 L170,80 Z" fill="#FFD447" {...S} />
      <rect x={68} y={72} width={104} height={14} rx={7} fill="#B78BFF" {...S} />
      <path d={starPath(120, 30, 20, 9)} fill="#FFF3A6" {...S} />
      {[[90, 79], [120, 79], [150, 79]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={4} fill="#fff" stroke={OUT} strokeWidth={2} />)}
      <path d={twinkle(62, 40, 7)} fill="#fff" />
      <path d={twinkle(178, 36, 8)} fill="#fff" />
    </g>
  ) },
]

/* ─────────────────────────────────────────── eyes ── */

const [ELX, ELY] = G.eyeL
const [ERX, ERY] = G.eyeR
function dotEyes(): Draw {
  return () => (
    <g>
      <ellipse cx={ELX} cy={ELY} rx={6} ry={8} fill={OUT} />
      <ellipse cx={ERX} cy={ERY} rx={6} ry={8} fill={OUT} />
      <circle cx={ELX + 2} cy={ELY - 3} r={2.3} fill="#fff" />
      <circle cx={ERX + 2} cy={ERY - 3} r={2.3} fill="#fff" />
    </g>
  )
}
export const DEFAULT_EYES = dotEyes()

function glasses(lens: (x: number, y: number) => ReturnType<Draw>, bridge = true): Draw {
  return () => (
    <g>
      {bridge && <path d={`M${ELX + 14},${ELY - 2} Q120,${ELY - 10} ${ERX - 14},${ERY - 2}`} fill="none" stroke={OUT} strokeWidth={3} />}
      {lens(ELX, ELY)}
      {lens(ERX, ERY)}
    </g>
  )
}

const EYES: Item[] = [
  { id: 'eyes-dot', slot: 'eyes', name: n('ตาแป๋ว', 'Bright eyes'), rarity: 'common', unlock: free, replacesEyes: true, front: DEFAULT_EYES },
  { id: 'eyes-happy', slot: 'eyes', name: n('ตายิ้ม ^^', 'Happy ^^'), rarity: 'common', unlock: free, replacesEyes: true, front: () => (
    <g fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round">
      <path d={`M${ELX - 7},${ELY + 3} Q${ELX},${ELY - 8} ${ELX + 7},${ELY + 3}`} />
      <path d={`M${ERX - 7},${ERY + 3} Q${ERX},${ERY - 8} ${ERX + 7},${ERY + 3}`} />
    </g>
  ) },
  { id: 'eyes-sleepy', slot: 'eyes', name: n('ตาง่วงนิด ๆ', 'Sleepy'), rarity: 'common', unlock: free, replacesEyes: true, front: () => (
    <g fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round">
      <path d={`M${ELX - 8},${ELY} Q${ELX},${ELY + 6} ${ELX + 8},${ELY}`} />
      <path d={`M${ERX - 8},${ERY} Q${ERX},${ERY + 6} ${ERX + 8},${ERY}`} />
      <path d={`M${ELX - 8},${ELY} L${ELX - 12},${ELY - 3} M${ERX + 8},${ERY} L${ERX + 12},${ERY - 3}`} strokeWidth={2.5} />
    </g>
  ) },
  { id: 'eyes-round', slot: 'eyes', name: n('แว่นกลมนักอ่าน', 'Round specs'), rarity: 'common', unlock: free, front: glasses((x, y) => (
    <g><circle cx={x} cy={y} r={15} fill="#D9F1FF" fillOpacity={0.35} stroke={OUT} strokeWidth={3.2} /><path d={`M${x - 8},${y - 6} L${x - 3},${y - 10}`} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" /></g>
  )) },
  { id: 'eyes-sparkle', slot: 'eyes', name: n('ตาประกายดาว', 'Starry-eyed'), rarity: 'rare', unlock: coins(70), replacesEyes: true, front: (c) => (
    <g>
      <defs>
        <linearGradient id={`${c.uid}iris`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B2E6E" /><stop offset="100%" stopColor="#7E8CF2" /></linearGradient>
      </defs>
      {[[ELX, ELY], [ERX, ERY]].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={9} ry={11} fill={`url(#${c.uid}iris)`} stroke={OUT} strokeWidth={2.4} />
          <path d={twinkle(x + 3, y - 4, 4.5)} fill="#fff" />
          <circle cx={x - 3} cy={y + 5} r={1.8} fill="#fff" />
        </g>
      ))}
    </g>
  ) },
  { id: 'eyes-3d', slot: 'eyes', name: n('แว่นสามมิติ', '3D glasses'), rarity: 'rare', unlock: coins(90), front: () => (
    <g>
      <rect x={78} y={110} width={84} height={26} rx={6} fill="#fff" {...S} />
      <rect x={84} y={115} width={30} height={16} rx={4} fill="#FF6B6B" fillOpacity={0.85} />
      <rect x={126} y={115} width={30} height={16} rx={4} fill="#4DA8FF" fillOpacity={0.85} />
    </g>
  ) },
  { id: 'eyes-shades', slot: 'eyes', name: n('แว่นกันแดดสุดคูล', 'Cool shades'), rarity: 'rare', unlock: coins(100), front: glasses((x, y) => (
    <g><path d={`M${x - 15},${y - 9} L${x + 15},${y - 9} Q${x + 15},${y + 11} ${x},${y + 11} Q${x - 15},${y + 11} ${x - 15},${y - 9}Z`} fill="#2A2A3D" {...S} /><path d={`M${x - 9},${y - 4} L${x - 2},${y - 4}`} stroke="#7A7AA6" strokeWidth={3} strokeLinecap="round" /></g>
  )) },
  { id: 'eyes-hearts', slot: 'eyes', name: n('แว่นหัวใจ', 'Heart shades'), rarity: 'rare', unlock: coins(120), front: glasses((x, y) => (
    <g><path d={heartPath(x, y - 1, 13)} fill="#3B2E52" {...S} /><path d={heartPath(x + 4, y - 4, 4.5)} fill="#B48CFF" /></g>
  )) },
  { id: 'eyes-stars', slot: 'eyes', name: n('แว่นดาวป๊อป', 'Pop-star glasses'), rarity: 'rare', unlock: coins(140), front: glasses((x, y) => (
    <g><path d={starPath(x, y, 17, 9)} fill="#FFE27A" fillOpacity={0.5} stroke="#F2A93B" strokeWidth={4} strokeLinejoin="round" /><path d={starPath(x, y, 17, 9)} fill="none" stroke={OUT} strokeWidth={1.5} strokeLinejoin="round" /></g>
  )) },
  { id: 'eyes-cat', slot: 'eyes', name: n('ตาแมวมรกต', 'Emerald cat eyes'), rarity: 'epic', unlock: coins(180), replacesEyes: true, front: () => (
    <g>
      {[[ELX, ELY], [ERX, ERY]].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={10} ry={10} fill="#7FE0A1" stroke={OUT} strokeWidth={2.6} />
          <ellipse cx={x} cy={y} rx={2.6} ry={8} fill={OUT} />
          <circle cx={x + 4} cy={y - 4} r={2} fill="#fff" />
        </g>
      ))}
    </g>
  ) },
  { id: 'eyes-monocle', slot: 'eyes', name: n('แว่นข้างเดียวผู้ดี', 'Gentleman monocle'), rarity: 'epic', unlock: coins(200), front: () => (
    <g>
      <circle cx={ERX} cy={ERY} r={15} fill="#E8F6FF" fillOpacity={0.35} stroke="#E0A93A" strokeWidth={4.5} />
      <circle cx={ERX} cy={ERY} r={15} fill="none" stroke={OUT} strokeWidth={1.6} />
      <path d={`M${ERX + 12},${ERY + 9} Q${ERX + 30},${ERY + 40} ${ERX + 14},${ERY + 62}`} fill="none" stroke="#E0A93A" strokeWidth={2.5} strokeDasharray="2 4" strokeLinecap="round" />
    </g>
  ) },
  { id: 'eyes-galaxy', slot: 'eyes', name: n('ตากาแล็กซี', 'Galaxy eyes'), rarity: 'legendary', unlock: quest('block-2'), replacesEyes: true, front: (c) => (
    <g>
      <defs>
        <radialGradient id={`${c.uid}gal`} cx="40%" cy="35%"><stop offset="0%" stopColor="#F2B8FF" /><stop offset="55%" stopColor="#7A5CFF" /><stop offset="100%" stopColor="#1F1A4D" /></radialGradient>
      </defs>
      {[[ELX, ELY], [ERX, ERY]].map(([x, y]) => (
        <g key={x}>
          <Glow id={`${c.uid}ge${x}`} x={x} y={y} r={20} color="#C9A7FF" o={0.6} />
          <ellipse cx={x} cy={y} rx={10} ry={12} fill={`url(#${c.uid}gal)`} stroke={OUT} strokeWidth={2.4} />
          <path d={starPath(x + 2, y - 3, 4.6, 2)} fill="#fff" />
          <circle cx={x - 4} cy={y + 5} r={1.4} fill="#fff" />
          <circle cx={x + 4} cy={y + 6} r={0.9} fill="#fff" />
        </g>
      ))}
    </g>
  ) },
]

/* ──────────────────────────────────────────── neck ── */

const [NX, NY] = G.neck
const NECK: Item[] = [
  { id: 'neck-none', slot: 'neck', name: n('ไม่สวม', 'None'), rarity: 'common', unlock: free },
  { id: 'neck-bow-blue', slot: 'neck', name: n('โบว์ฟ้า', 'Sky bow'), rarity: 'common', unlock: free, front: () => <Bow x={NX} y={NY + 2} color="#6EC1F2" /> },
  { id: 'neck-tie', slot: 'neck', name: n('เนกไทนักศึกษา', 'Student tie'), rarity: 'common', unlock: free, front: () => (
    <g>
      <path d={`M${NX - 7},${NY - 2} L${NX + 7},${NY - 2} L${NX + 5},${NY + 8} L${NX - 5},${NY + 8} Z`} fill="#4A5068" {...S} />
      <path d={`M${NX - 5},${NY + 8} L${NX + 5},${NY + 8} L${NX + 9},${NY + 46} L${NX},${NY + 56} L${NX - 9},${NY + 46} Z`} fill="#5A6178" {...S} />
      <path d={`M${NX - 6},${NY + 22} L${NX + 6},${NY + 16} M${NX - 7},${NY + 36} L${NX + 7},${NY + 30}`} stroke="#8A91AB" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ) },
  { id: 'neck-bow-red', slot: 'neck', name: n('โบว์แดงสด', 'Cherry-red bow'), rarity: 'rare', unlock: coins(50), front: () => <Bow x={NX} y={NY + 2} color="#EE5B5B" /> },
  { id: 'neck-bow-pink', slot: 'neck', name: n('โบว์ชมพูหวาน', 'Candy-pink bow'), rarity: 'rare', unlock: coins(50), front: () => <Bow x={NX} y={NY + 2} color="#FF9CC0" /> },
  { id: 'neck-bell', slot: 'neck', name: n('ปลอกคอกระดิ่ง', 'Bell collar'), rarity: 'rare', unlock: coins(80), front: () => (
    <g>
      <path d={`M${NX - 36},${NY - 6} Q${NX},${NY + 12} ${NX + 36},${NY - 6}`} fill="none" stroke={OUT} strokeWidth={11} strokeLinecap="round" />
      <path d={`M${NX - 36},${NY - 6} Q${NX},${NY + 12} ${NX + 36},${NY - 6}`} fill="none" stroke="#5CB8E6" strokeWidth={5.5} strokeLinecap="round" />
      <circle cx={NX} cy={NY + 12} r={11} fill="#F5C33B" {...S} />
      <path d={`M${NX - 8},${NY + 12} L${NX + 8},${NY + 12}`} stroke={OUT} strokeWidth={2.5} />
      <circle cx={NX} cy={NY + 17} r={2.4} fill={OUT} />
      <circle cx={NX - 4} cy={NY + 7} r={2.2} fill="#FFF2B8" />
    </g>
  ) },
  { id: 'neck-bandana', slot: 'neck', name: n('ผ้าพันคอบันดานา', 'Bandana'), rarity: 'rare', unlock: coins(70), front: () => (
    <g>
      <path d={`M${NX - 34},${NY - 6} Q${NX},${NY + 4} ${NX + 34},${NY - 6} L${NX + 4},${NY + 30} Z`} fill="#E5484D" {...S} />
      {[[-14, 2], [8, 6], [-2, 16], [14, -2]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={NX + dx} cy={NY + dy} r={2.2} fill="#fff" />)}
    </g>
  ) },
  { id: 'neck-scarf', slot: 'neck', name: n('ผ้าพันคอไหมพรม', 'Knit scarf'), rarity: 'rare', unlock: coins(90), front: () => (
    <g>
      <path d={`M${NX + 12},${NY + 4} L${NX + 28},${NY + 50} L${NX + 12},${NY + 54} L${NX},${NY + 8} Z`} fill="#E8605A" {...S} />
      <path d={`M${NX - 38},${NY - 8} Q${NX},${NY + 8} ${NX + 38},${NY - 8} L${NX + 36},${NY + 6} Q${NX},${NY + 22} ${NX - 36},${NY + 6} Z`} fill="#F07A72" {...S} />
      <path d={`M${NX + 14},${NY + 50} L${NX + 15},${NY + 58} M${NX + 21},${NY + 48} L${NX + 23},${NY + 56}`} stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ) },
  { id: 'neck-cherry', slot: 'neck', name: n('โชคเกอร์เชอร์รี่', 'Cherry choker'), rarity: 'rare', unlock: coins(110), front: () => (
    <g>
      <path d={`M${NX - 36},${NY - 6} Q${NX},${NY + 10} ${NX + 36},${NY - 6}`} fill="none" stroke={OUT} strokeWidth={10} strokeLinecap="round" />
      <path d={`M${NX - 36},${NY - 6} Q${NX},${NY + 10} ${NX + 36},${NY - 6}`} fill="none" stroke="#D9474E" strokeWidth={5} strokeLinecap="round" />
      <path d={`M${NX},${NY + 4} Q${NX - 4},${NY + 14} ${NX - 8},${NY + 20} M${NX},${NY + 4} Q${NX + 4},${NY + 14} ${NX + 8},${NY + 20}`} fill="none" stroke="#6FB05A" strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={NX - 8} cy={NY + 22} r={5.5} fill="#E8414E" stroke={OUT} strokeWidth={2.2} />
      <circle cx={NX + 8} cy={NY + 22} r={5.5} fill="#E8414E" stroke={OUT} strokeWidth={2.2} />
    </g>
  ) },
  { id: 'neck-cape', slot: 'neck', name: n('ปกเสื้อทองคำ', 'Golden cape collar'), rarity: 'epic', unlock: coins(180), front: () => (
    <path d={`M${NX - 40},${NY - 8} Q${NX},${NY + 4} ${NX + 40},${NY - 8} L${NX + 34},${NY + 16} L${NX + 22},${NY + 8} L${NX + 12},${NY + 22} L${NX},${NY + 10} L${NX - 12},${NY + 22} L${NX - 22},${NY + 8} L${NX - 34},${NY + 16} Z`} fill="#F2C14E" {...S} />
  ) },
  { id: 'neck-gembow', slot: 'neck', name: n('โบว์ดำประดับพลอย', 'Jewel bow'), rarity: 'epic', unlock: coins(220), front: () => (
    <g>
      <Bow x={NX} y={NY + 2} color="#33303F" s={1.15} knot="#F5C33B" />
      <circle cx={NX} cy={NY + 2} r={4} fill="#FFF3B0" />
    </g>
  ) },
  { id: 'neck-medal', slot: 'neck', name: n('เหรียญราชสำนัก', 'Royal medal'), rarity: 'legendary', unlock: quest('social'), front: (c) => (
    <g>
      <path d={`M${NX - 22},${NY - 6} L${NX - 6},${NY + 24} L${NX + 6},${NY + 24} L${NX + 22},${NY - 6}`} fill="#4F7BFF" {...S} />
      <path d={`M${NX - 14},${NY - 6} L${NX - 2},${NY + 20} M${NX + 14},${NY - 6} L${NX + 2},${NY + 20}`} stroke="#E8414E" strokeWidth={4} />
      <Glow id={`${c.uid}md`} x={NX} y={NY + 36} r={26} color="#FFE9A3" />
      <circle cx={NX} cy={NY + 36} r={15} fill="#FFD447" {...S} />
      <path d={starPath(NX, NY + 36, 9, 4)} fill="#FFF7C2" stroke={OUT} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  ) },
]

/* ────────────────────────────────────────── outfits ── */

const OUTFITS: Item[] = [
  { id: 'outfit-tee', slot: 'outfit', name: n('เสื้อยืดขาวสะอาด', 'Clean white tee'), rarity: 'common', unlock: free, pants: '#7FA7D9', shoes: '#F4F4F8', three: { outfit: 'default', color: '#F4F4F8' },
    front: outfitFront({ top: '#FBFBFD', details: () => <circle cx={132} cy={190} r={5} fill="#F49AC1" stroke={OUT} strokeWidth={2} /> }) },
  { id: 'outfit-stripes', slot: 'outfit', name: n('เสื้อลายทาง', 'Stripy tee'), rarity: 'common', unlock: free, pants: '#4F5D7A', shoes: '#E86A6A', three: { outfit: 'default', color: '#DADDE8' },
    front: outfitFront({ top: '#FBFBFD', sleeve: '#DADDE8', details: (c) => (
      <g>
        <clipPath id={`${c.uid}st`}><path d={TORSO} /></clipPath>
        <g clipPath={`url(#${c.uid}st)`}>{[180, 196, 212, 228].map((y) => <rect key={y} x={70} y={y} width={100} height={7} fill="#9BA3BD" />)}</g>
        <path d={TORSO} fill="none" {...S} />
      </g>
    ) }) },
  { id: 'outfit-sailor', slot: 'outfit', name: n('ชุดกะลาสี', 'Sailor uniform'), rarity: 'common', unlock: free, pants: '#2F4170', shoes: '#3A3A4E', three: { outfit: 'default', color: '#F4F4F8' },
    front: outfitFront({ top: '#FBFBFD', details: () => (
      <g>
        <path d="M88,168 L120,196 L152,168 L156,184 L120,206 L84,184 Z" fill="#2F4170" {...S} />
        <path d="M94,174 L120,198 L146,174" fill="none" stroke="#fff" strokeWidth={2.4} />
        <path d="M112,196 L128,196 L124,214 L120,210 L116,214 Z" fill="#E8414E" {...S} />
      </g>
    ) }) },
  { id: 'outfit-spu', slot: 'outfit', name: n('ชุดนักศึกษา SPU', 'SPU student uniform'), rarity: 'common', unlock: free, pants: '#2B3150', shoes: '#2A2A35', three: { outfit: 'suit', color: '#F4F4F8' },
    front: outfitFront({ top: '#FBFBFD', details: () => (
      <g>
        <path d="M120,166 L108,176 L120,184 L132,176 Z" fill="#E6E8F0" {...S} />
        <path d="M120,184 L120,230" stroke={OUT} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" />
        <rect x={130} y={192} width={14} height={9} rx={2} fill="#E8414E" stroke={OUT} strokeWidth={1.8} />
        <rect x={78} y={222} width={84} height={9} rx={3} fill="#2B3150" {...S} />
      </g>
    ) }) },
  { id: 'outfit-frog', slot: 'outfit', name: n('เสื้อกันฝนกบน้อย', 'Froggy raincoat'), rarity: 'rare', unlock: coins(120), shoes: '#8CC85A', three: { outfit: 'hoodie', color: '#A6D46B' },
    front: outfitFront({ top: '#A6D46B', long: true, details: () => (
      <g>
        <path d="M90,168 Q120,186 150,168" fill="none" stroke={OUT} strokeWidth={3} />
        <circle cx={120} cy={196} r={5.5} fill="#7DB34A" stroke={OUT} strokeWidth={2.2} />
        <circle cx={120} cy={220} r={5.5} fill="#7DB34A" stroke={OUT} strokeWidth={2.2} />
      </g>
    ) }) },
  { id: 'outfit-hoodie', slot: 'outfit', name: n('ฮู้ดดี้พาสเทล', 'Pastel hoodie'), rarity: 'rare', unlock: coins(90), pants: '#5A6178', shoes: '#F4F4F8', three: { outfit: 'hoodie', color: '#F7A8C8' },
    front: outfitFront({ top: '#F7A8C8', details: () => (
      <g>
        <path d="M98,212 L142,212 L138,230 L102,230 Z" fill="#EE8FB6" {...S} />
        <path d="M110,170 L108,192 M130,170 L132,192" stroke={OUT} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={108} cy={194} r={3} fill="#fff" stroke={OUT} strokeWidth={1.6} />
        <circle cx={132} cy={194} r={3} fill="#fff" stroke={OUT} strokeWidth={1.6} />
      </g>
    ) }) },
  { id: 'outfit-overalls', slot: 'outfit', name: n('เอี๊ยมยีนส์', 'Denim overalls'), rarity: 'rare', unlock: coins(100), pants: '#5D8CC9', shoes: '#E8605A', three: { outfit: 'default', color: '#5D8CC9' },
    front: outfitFront({ top: '#FFE07A', details: () => (
      <g>
        <path d="M98,190 L142,190 L150,232 Q120,240 90,232 Z" fill="#5D8CC9" {...S} />
        <path d="M100,190 L94,168 M140,190 L146,168" stroke="#5D8CC9" strokeWidth={6} strokeLinecap="round" />
        <rect x={110} y={200} width={20} height={14} rx={3} fill="#4A76B3" stroke={OUT} strokeWidth={2} />
        <circle cx={102} cy={194} r={3} fill="#F5C33B" stroke={OUT} strokeWidth={1.4} />
        <circle cx={138} cy={194} r={3} fill="#F5C33B" stroke={OUT} strokeWidth={1.4} />
      </g>
    ) }) },
  { id: 'outfit-labcoat', slot: 'outfit', name: n('เสื้อกาวน์นักวิจัย', 'Lab coat'), rarity: 'rare', unlock: coins(130), pants: '#3E4A63', shoes: '#2A2A35', three: { outfit: 'labcoat', color: '#F8FAFC' },
    front: outfitFront({ top: '#F6FAFC', long: true, details: () => (
      <g>
        <path d="M108,166 L120,200 L132,166 Z" fill="#5FC6D0" {...S} />
        <path d="M120,200 L120,262" stroke={OUT} strokeWidth={2.5} />
        <rect x={128} y={206} width={18} height={14} rx={2} fill="none" stroke={OUT} strokeWidth={2} />
        <path d="M132,206 L132,200" stroke="#4FA3F7" strokeWidth={3} strokeLinecap="round" />
      </g>
    ) }) },
  { id: 'outfit-varsity', slot: 'outfit', name: n('แจ็กเก็ตวาร์ซิตี้', 'Varsity jacket'), rarity: 'epic', unlock: coins(220), pants: '#2B3150', shoes: '#F4F4F8', three: { outfit: 'hoodie', color: '#C9395B' },
    front: outfitFront({ top: '#C9395B', sleeve: '#FFF4DE', details: () => (
      <g>
        <path d="M120,170 L120,232" stroke={OUT} strokeWidth={2.5} />
        <path d="M80,224 L160,224" stroke="#FFF4DE" strokeWidth={5} />
        <path d="M92,186 Q100,178 108,186 Q100,194 92,186 M100,186 L100,206 M94,206 L106,206" fill="none" stroke="#FFF4DE" strokeWidth={4} strokeLinecap="round" />
      </g>
    ) }) },
  { id: 'outfit-suit', slot: 'outfit', name: n('สูทผู้บริหาร', 'CEO suit'), rarity: 'epic', unlock: coins(250), pants: '#262A3F', shoes: '#1D1D26', three: { outfit: 'suit', color: '#262A3F' },
    front: outfitFront({ top: '#2E3350', details: () => (
      <g>
        <path d="M106,166 L120,206 L134,166 Z" fill="#FBFBFD" {...S} />
        <path d="M117,174 L123,174 L125,200 L120,206 L115,200 Z" fill="#E8414E" {...S} strokeWidth={2} />
        <path d="M100,168 L114,204 M140,168 L126,204" stroke="#555C82" strokeWidth={3} strokeLinecap="round" />
        <path d="M136,190 L146,188" stroke="#F7C948" strokeWidth={3} strokeLinecap="round" />
      </g>
    ) }) },
  { id: 'outfit-yukata', slot: 'outfit', name: n('ยูกาตะดอกซากุระ', 'Sakura yukata'), rarity: 'epic', unlock: coins(280), shoes: '#B5774B', three: { outfit: 'default', color: '#9CC7F2' },
    front: outfitFront({ top: '#9CC7F2', long: true, details: (c) => (
      <g>
        <path d="M100,166 L136,206 M140,166 L118,190" stroke={OUT} strokeWidth={2.5} />
        <rect x={76} y={200} width={88} height={16} rx={4} fill="#F27FA3" {...S} />
        {[[94, 236], [146, 240], [118, 252], [92, 184], [150, 182]].map(([x, y]) => <Flower key={`${c.uid}${x}`} x={x} y={y} r={6} color="#FFE3EE" center="#F27FA3" />)}
      </g>
    ) }) },
  { id: 'outfit-wizard', slot: 'outfit', name: n('เสื้อคลุมพ่อมดดวงดาว', 'Star wizard robe'), rarity: 'epic', unlock: coins(320), shoes: '#4A3478', three: { outfit: 'labcoat', color: '#6D4AA8' },
    front: outfitFront({ top: '#6D4AA8', long: true, details: () => (
      <g>
        <path d="M100,168 Q120,180 140,168" fill="none" stroke="#F7C948" strokeWidth={4} />
        <path d="M120,176 L120,262" stroke="#F7C948" strokeWidth={3} />
        {[[98, 214, 6], [144, 230, 5], [104, 248, 4], [140, 200, 4]].map(([x, y, r]) => <path key={x} d={starPath(x, y, r)} fill="#FFE27A" />)}
      </g>
    ) }) },
  { id: 'outfit-hero', slot: 'outfit', name: n('ชุดฮีโร่แสงดาว', 'Starlight hero'), rarity: 'legendary', unlock: quest('block-4'), shoes: '#F2C14E', three: { outfit: 'suit', color: '#F2F4FF' },
    back: () => <path d="M88,170 Q60,240 70,266 Q120,256 170,266 Q180,240 152,170 Z" fill="#E84A6F" {...S} />,
    front: outfitFront({ top: '#F2F4FF', sleeve: '#DDE3FF', details: (c) => (
      <g>
        <Glow id={`${c.uid}he`} x={120} y={198} r={26} color="#FFE9A3" o={0.9} />
        <path d={starPath(120, 198, 15, 7)} fill="#FFD447" {...S} />
        <rect x={78} y={222} width={84} height={9} rx={3} fill="#F2C14E" {...S} />
        <circle cx={90} cy={172} r={6} fill="#F2C14E" stroke={OUT} strokeWidth={2} />
        <circle cx={150} cy={172} r={6} fill="#F2C14E" stroke={OUT} strokeWidth={2} />
      </g>
    ) }) },
]

/* ────────────────────────────────────────── held items ── */

const [HX, HY] = G.handR
const HELD: Item[] = [
  { id: 'held-none', slot: 'held', name: n('มือว่าง', 'Empty hands'), rarity: 'common', unlock: free },
  { id: 'held-book', slot: 'held', name: n('หนังสือเรียน', 'Textbook'), rarity: 'common', unlock: free, front: () => (
    <g transform={`rotate(-12 ${HX} ${HY})`}>
      <rect x={HX - 4} y={HY - 40} width={30} height={40} rx={4} fill="#3F6FD8" {...S} />
      <rect x={HX + 22} y={HY - 38} width={4} height={36} fill="#F4F4F8" />
      <path d={`M${HX + 3},${HY - 30} L${HX + 17},${HY - 30} M${HX + 3},${HY - 24} L${HX + 13},${HY - 24}`} stroke="#F7E39A" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ) },
  { id: 'held-bellflower', slot: 'held', name: n('ดอกระฆัง', 'Bellflower'), rarity: 'common', unlock: free, front: () => (
    <g>
      <path d={`M${HX},${HY + 6} Q${HX + 6},${HY - 40} ${HX - 4},${HY - 84}`} fill="none" stroke="#5EA94B" strokeWidth={4} strokeLinecap="round" />
      <path d={`M${HX + 2},${HY - 36} Q${HX + 20},${HY - 46} ${HX + 22},${HY - 30} Q${HX + 10},${HY - 28} ${HX + 2},${HY - 36}Z`} fill="#7CC25A" {...S} strokeWidth={2} />
      {[[-4, -86], [10, -70], [-12, -62]].map(([dx, dy]) => (
        <path key={dx} d={`M${HX + dx - 8},${HY + dy} Q${HX + dx},${HY + dy - 16} ${HX + dx + 8},${HY + dy} L${HX + dx + 6},${HY + dy + 6} L${HX + dx},${HY + dy + 2} L${HX + dx - 6},${HY + dy + 6} Z`} fill="#B48CFF" {...S} strokeWidth={2.2} />
      ))}
    </g>
  ) },
  { id: 'held-clover', slot: 'held', name: n('ใบโคลเวอร์นำโชค', 'Lucky clover'), rarity: 'common', unlock: free, front: () => (
    <g>
      <path d={`M${HX},${HY + 6} Q${HX + 8},${HY - 30} ${HX},${HY - 60}`} fill="none" stroke="#5EA94B" strokeWidth={4} strokeLinecap="round" />
      {[[-10, -66], [10, -66], [0, -78], [0, -56]].map(([dx, dy], i) => (
        <path key={i} d={heartPath(HX + dx, HY + dy, 9)} transform={`rotate(${[-45, 45, 180, 0][i]} ${HX + dx} ${HY + dy})`} fill="#9ED36A" {...S} strokeWidth={2.2} />
      ))}
      <circle cx={HX} cy={HY - 66} r={4} fill="#FFF3A6" stroke={OUT} strokeWidth={1.6} />
    </g>
  ) },
  { id: 'held-fries', slot: 'held', name: n('เฟรนช์ฟรายส์', 'Fries'), rarity: 'rare', unlock: coins(50), front: () => (
    <g>
      {[-10, -4, 2, 8, 14].map((dx, i) => <rect key={dx} x={HX + dx - 3} y={HY - 50 - (i % 2) * 8} width={7} height={34} rx={2} fill="#FFD66B" {...S} strokeWidth={2} />)}
      <path d={`M${HX - 16},${HY - 26} L${HX + 22},${HY - 26} L${HX + 16},${HY + 4} L${HX - 10},${HY + 4} Z`} fill="#E8414E" {...S} />
      <path d={`M${HX - 2},${HY - 16} L${HX + 8},${HY - 16} M${HX + 3},${HY - 20} L${HX + 3},${HY - 10}`} stroke="#FFF3E0" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  ) },
  { id: 'held-dango', slot: 'held', name: n('ดังโงะสามสี', 'Hanami dango'), rarity: 'rare', unlock: coins(60), front: () => (
    <g>
      <path d={`M${HX},${HY + 8} L${HX},${HY - 76}`} stroke="#D9A066" strokeWidth={4} strokeLinecap="round" />
      <circle cx={HX} cy={HY - 66} r={11} fill="#FFB3C7" {...S} />
      <circle cx={HX} cy={HY - 45} r={11} fill="#FFF8EE" {...S} />
      <circle cx={HX} cy={HY - 24} r={11} fill="#A6D98A" {...S} />
    </g>
  ) },
  { id: 'held-balloon', slot: 'held', name: n('ลูกโป่งลายทาง', 'Party balloon'), rarity: 'rare', unlock: coins(60), front: (c) => (
    <g>
      <path d={`M${HX},${HY} Q${HX + 16},${HY - 50} ${HX + 14},${HY - 98}`} fill="none" stroke={OUT} strokeWidth={2} />
      <clipPath id={`${c.uid}bl`}><ellipse cx={HX + 16} cy={HY - 124} rx={24} ry={28} /></clipPath>
      <ellipse cx={HX + 16} cy={HY - 124} rx={24} ry={28} fill="#8FD0F0" />
      <g clipPath={`url(#${c.uid}bl)`}>{[-140, -126, -112].map((dy) => <rect key={dy} x={HX - 10} y={HY + dy} width={52} height={6} fill="#F4F8FF" transform={`rotate(-18 ${HX + 16} ${HY - 124})`} />)}</g>
      <ellipse cx={HX + 16} cy={HY - 124} rx={24} ry={28} fill="none" {...S} />
      <path d={`M${HX + 12},${HY - 96} L${HX + 20},${HY - 96} L${HX + 16},${HY - 90} Z`} fill="#8FD0F0" {...S} strokeWidth={2} />
      <ellipse cx={HX + 7} cy={HY - 134} rx={5} ry={8} fill="#fff" opacity={0.7} />
    </g>
  ) },
  { id: 'held-icecream', slot: 'held', name: n('ไอศกรีมสามชั้น', 'Triple scoop'), rarity: 'rare', unlock: coins(70), front: () => (
    <g>
      <path d={`M${HX - 14},${HY - 28} L${HX + 14},${HY - 28} L${HX},${HY + 6} Z`} fill="#E9B26B" {...S} />
      <path d={`M${HX - 8},${HY - 22} L${HX + 4},${HY - 6} M${HX + 8},${HY - 22} L${HX - 4},${HY - 6}`} stroke="#C98B45" strokeWidth={2} />
      <circle cx={HX} cy={HY - 36} r={14} fill="#FFB3C7" {...S} />
      <circle cx={HX - 2} cy={HY - 56} r={13} fill="#8E5A47" {...S} />
      <circle cx={HX + 1} cy={HY - 74} r={12} fill="#FFF3D6" {...S} />
      <circle cx={HX + 4} cy={HY - 88} r={5} fill="#E8414E" {...S} strokeWidth={2} />
    </g>
  ) },
  { id: 'held-candle', slot: 'held', name: n('เทียนอุ่นใจ', 'Cozy candle'), rarity: 'rare', unlock: coins(80), front: (c) => (
    <g>
      <Glow id={`${c.uid}cd`} x={HX} y={HY - 56} r={30} color="#FFD27A" o={0.9} />
      <ellipse cx={HX} cy={HY - 4} rx={18} ry={6} fill="#F7B9C8" {...S} />
      <rect x={HX - 8} y={HY - 40} width={16} height={36} rx={4} fill="#FFF3EA" {...S} />
      <path d={`M${HX},${HY - 62} Q${HX + 7},${HY - 52} ${HX},${HY - 44} Q${HX - 7},${HY - 52} ${HX},${HY - 62}Z`} fill="#FFB53B" stroke={OUT} strokeWidth={2} />
    </g>
  ) },
  { id: 'held-umbrella', slot: 'held', name: n('ร่มดาวนางฟ้า', 'Fairy umbrella'), rarity: 'rare', unlock: coins(90), front: () => (
    <g transform={`rotate(10 ${HX} ${HY})`}>
      <path d={`M${HX},${HY + 10} Q${HX},${HY + 22} ${HX - 10},${HY + 18}`} fill="none" stroke="#F27FA3" strokeWidth={4} strokeLinecap="round" />
      <path d={`M${HX},${HY + 10} L${HX},${HY - 20}`} stroke={OUT} strokeWidth={3} />
      <path d={`M${HX},${HY - 104} L${HX - 16},${HY - 20} Q${HX},${HY - 14} ${HX + 16},${HY - 20} Z`} fill="#E9E3FF" {...S} />
      <path d={`M${HX},${HY - 104} L${HX - 4},${HY - 18} M${HX},${HY - 104} L${HX + 7},${HY - 18}`} stroke="#B9A7F0" strokeWidth={2} />
      {[[-6, -72], [5, -50], [-4, -36]].map(([dx, dy]) => <path key={dy} d={starPath(HX + dx, HY + dy, 4)} fill="#FFD447" />)}
    </g>
  ) },
  { id: 'held-trophy', slot: 'held', name: n('ถ้วยแชมป์', 'Champion trophy'), rarity: 'epic', unlock: coins(200), front: (c) => (
    <g>
      <Glow id={`${c.uid}tr`} x={HX} y={HY - 30} r={34} color="#FFE9A3" />
      <path d={`M${HX - 16},${HY - 52} L${HX + 16},${HY - 52} Q${HX + 16},${HY - 18} ${HX},${HY - 16} Q${HX - 16},${HY - 18} ${HX - 16},${HY - 52}Z`} fill="#FFC93C" {...S} />
      <path d={`M${HX - 16},${HY - 46} Q${HX - 30},${HY - 44} ${HX - 18},${HY - 30} M${HX + 16},${HY - 46} Q${HX + 30},${HY - 44} ${HX + 18},${HY - 30}`} fill="none" stroke={OUT} strokeWidth={3} />
      <rect x={HX - 4} y={HY - 16} width={8} height={10} fill="#E0A93A" {...S} strokeWidth={2} />
      <rect x={HX - 12} y={HY - 6} width={24} height={8} rx={2} fill="#8E5A47" {...S} strokeWidth={2} />
      <path d={starPath(HX, HY - 38, 7)} fill="#FFF3B0" />
    </g>
  ) },
  { id: 'held-heartwand', slot: 'held', name: n('คทาหัวใจ', 'Heart wand'), rarity: 'epic', unlock: coins(240), front: (c) => (
    <g>
      <path d={`M${HX},${HY + 8} L${HX + 10},${HY - 70}`} stroke={OUT} strokeWidth={7} strokeLinecap="round" />
      <path d={`M${HX},${HY + 8} L${HX + 10},${HY - 70}`} stroke="#B48CFF" strokeWidth={3.5} strokeLinecap="round" />
      <Glow id={`${c.uid}hw`} x={HX + 12} y={HY - 88} r={30} color="#FFB3E6" o={0.9} />
      <path d={heartPath(HX + 12, HY - 90, 18)} fill="#D9B8FF" {...S} />
      <path d={heartPath(HX + 12, HY - 90, 10)} fill="#F6EBFF" />
      <Bow x={HX + 8} y={HY - 64} color="#C49BFF" s={0.45} />
    </g>
  ) },
  { id: 'held-moon', slot: 'held', name: n('คทาจันทร์เสี้ยว', 'Crescent scepter'), rarity: 'epic', unlock: coins(300), front: (c) => (
    <g>
      <path d={`M${HX},${HY + 8} L${HX + 6},${HY - 70}`} stroke={OUT} strokeWidth={7} strokeLinecap="round" />
      <path d={`M${HX},${HY + 8} L${HX + 6},${HY - 70}`} stroke="#4F7BFF" strokeWidth={3.5} strokeLinecap="round" />
      <Glow id={`${c.uid}mn`} x={HX + 8} y={HY - 92} r={34} color="#9EC5FF" o={0.85} />
      <ellipse cx={HX + 8} cy={HY - 92} rx={30} ry={9} fill="none" stroke="#C9DBFF" strokeWidth={2.5} transform={`rotate(-24 ${HX + 8} ${HY - 92})`} />
      <path d={`M${HX + 18},${HY - 112} A22,22 0 1,0 ${HX + 22},${HY - 74} A16,16 0 1,1 ${HX + 18},${HY - 112}Z`} fill="#4F7BFF" {...S} />
      <path d={starPath(HX + 6, HY - 92, 6)} fill="#FFE27A" />
    </g>
  ) },
  { id: 'held-starwand', slot: 'held', name: n('คทาดาวอัจฉริยะ', 'Genius star wand'), rarity: 'legendary', unlock: quest('gym-perfect'), front: (c) => (
    <g>
      <path d={`M${HX},${HY + 8} L${HX + 8},${HY - 68}`} stroke={OUT} strokeWidth={7} strokeLinecap="round" />
      <path d={`M${HX},${HY + 8} L${HX + 8},${HY - 68}`} stroke="#FFD447" strokeWidth={3.5} strokeLinecap="round" />
      <Glow id={`${c.uid}sw`} x={HX + 9} y={HY - 88} r={40} color="#FFF0A8" o={0.95} />
      <path d={starPath(HX + 9, HY - 88, 22, 10)} fill="#FFE04F" {...S} />
      <path d={starPath(HX + 9, HY - 88, 10, 5)} fill="#FFF8D1" />
      <path d={twinkle(HX - 18, HY - 108, 6)} fill="#fff" />
      <path d={twinkle(HX + 36, HY - 70, 5)} fill="#fff" />
      <path d={`M${HX + 4},${HY - 64} Q${HX + 30},${HY - 40} ${HX + 20},${HY - 20}`} fill="none" stroke="#FF8FB1" strokeWidth={3} strokeLinecap="round" />
    </g>
  ) },
  { id: 'held-spellbook', slot: 'held', name: n('ตำราเวทมนตร์', 'Book of spells'), rarity: 'legendary', unlock: quest('flashcards'), front: (c) => (
    <g transform={`rotate(-14 ${HX} ${HY})`}>
      <Glow id={`${c.uid}sb`} x={HX + 12} y={HY - 26} r={42} color="#C9A7FF" o={0.9} />
      <rect x={HX - 8} y={HY - 54} width={40} height={50} rx={5} fill="#4B2E83" {...S} />
      <rect x={HX + 28} y={HY - 52} width={4} height={46} fill="#E9DDFF" />
      <circle cx={HX + 12} cy={HY - 29} r={13} fill="none" stroke="#F2B8FF" strokeWidth={2} />
      <path d={starPath(HX + 12, HY - 29, 11, 4.5, 6)} fill="none" stroke="#F2B8FF" strokeWidth={1.8} strokeLinejoin="round" />
      <path d={`M${HX - 8},${HY - 46} L${HX + 32},${HY - 46} M${HX - 8},${HY - 12} L${HX + 32},${HY - 12}`} stroke="#F2C14E" strokeWidth={2.5} />
    </g>
  ) },
]

/* ────────────────────────────────────────────── aura ── */

const AURA: Item[] = [
  { id: 'aura-none', slot: 'aura', name: n('ไม่มี', 'None'), rarity: 'common', unlock: free, three: { aura: 'none' } },
  { id: 'aura-notes', slot: 'aura', name: n('ตัวโน้ตลอยฟ่อง', 'Music notes'), rarity: 'rare', unlock: coins(90), three: { aura: 'neon' }, front: () => (
    <g fill="#6E7BF2" stroke={OUT} strokeWidth={1.8}>
      {[[38, 96, -10], [196, 84, 12], [30, 196, 6], [208, 176, -8]].map(([x, y, r]) => (
        <g key={x} transform={`rotate(${r} ${x} ${y})`}>
          <ellipse cx={x} cy={y} rx={7} ry={5.5} />
          <path d={`M${x + 6},${y} L${x + 6},${y - 22} Q${x + 14},${y - 18} ${x + 16},${y - 10}`} fill="none" strokeWidth={3} stroke={OUT} />
        </g>
      ))}
    </g>
  ) },
  { id: 'aura-sparkle', slot: 'aura', name: n('ประกายระยิบ', 'Sparkles'), rarity: 'rare', unlock: coins(100), three: { aura: 'gold' }, front: () => (
    <g fill="#FFE27A" stroke={OUT} strokeWidth={1.6}>
      {[[40, 80, 10], [200, 70, 12], [24, 170, 7], [214, 150, 8], [52, 250, 9], [196, 240, 10], [120, 22, 6]].map(([x, y, r]) => <path key={`${x}${y}`} d={twinkle(x, y, r)} />)}
    </g>
  ) },
  { id: 'aura-hearts', slot: 'aura', name: n('หัวใจลอยฟุ้ง', 'Floating hearts'), rarity: 'rare', unlock: coins(120), three: { aura: 'neon' }, front: () => (
    <g stroke={OUT} strokeWidth={2}>
      {[[36, 90, 10, '#FF8FB1'], [204, 76, 12, '#FFB3C7'], [24, 186, 8, '#FFB3C7'], [214, 170, 9, '#FF8FB1'], [200, 248, 7, '#FF6F9C'], [44, 252, 8, '#FF8FB1']].map(([x, y, s, col]) => (
        <path key={`${x}${y}`} d={heartPath(x as number, y as number, s as number)} fill={col as string} />
      ))}
    </g>
  ) },
  { id: 'aura-stars', slot: 'aura', name: n('วงโคจรดวงดาว', 'Orbiting stars'), rarity: 'epic', unlock: coins(200), three: { aura: 'stars' }, back: () => (
    <ellipse cx={120} cy={170} rx={108} ry={40} fill="none" stroke="#FFE27A" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={0.9} />
  ), front: () => (
    <g fill="#FFD447" stroke={OUT} strokeWidth={1.8} strokeLinejoin="round">
      {[[16, 168, 11], [224, 172, 11], [60, 206, 8], [184, 132, 8], [36, 120, 7]].map(([x, y, r]) => <path key={`${x}${y}`} d={starPath(x, y, r)} />)}
    </g>
  ) },
  { id: 'aura-petals', slot: 'aura', name: n('กลีบซากุระโปรย', 'Sakura petals'), rarity: 'epic', unlock: coins(220), three: { aura: 'neon' }, front: () => (
    <g fill="#FFC6D9" stroke="#E98BAE" strokeWidth={1.5}>
      {[[34, 70, 20], [206, 60, -30], [20, 150, 60], [222, 140, 10], [40, 234, -20], [200, 226, 40], [90, 34, 80], [160, 30, -60]].map(([x, y, r]) => (
        <path key={`${x}${y}`} transform={`rotate(${r} ${x} ${y})`} d={`M${x},${y - 9} Q${x + 8},${y - 2} ${x},${y + 9} Q${x - 8},${y - 2} ${x},${y - 9}Z M${x},${y - 9} L${x - 2},${y - 13} L${x + 2},${y - 13}Z`} />
      ))}
    </g>
  ) },
  { id: 'aura-rainbow', slot: 'aura', name: n('รัศมีสายรุ้ง', 'Rainbow aura'), rarity: 'legendary', unlock: quest('block-3'), three: { aura: 'stars' }, back: (c) => (
    <g>
      <Glow id={`${c.uid}rb`} x={120} y={150} r={130} color="#FFF3B0" o={0.7} />
      {['#FF8A8A', '#FFC56E', '#FFF07A', '#8FE08A', '#7FC8FF', '#B39BFF'].map((col, i) => (
        <path key={col} d={`M${20 + i * 6},170 A${100 - i * 6},${110 - i * 6} 0 0 1 ${220 - i * 6},170`} fill="none" stroke={col} strokeWidth={6} opacity={0.85} />
      ))}
    </g>
  ), front: () => (
    <g fill="#fff">
      {[[30, 120, 9], [212, 110, 10], [52, 60, 6], [190, 52, 7]].map(([x, y, r]) => <path key={x} d={twinkle(x, y, r)} />)}
    </g>
  ) },
]

/* ──────────────────────────────────────── backgrounds ── */


const BGS: Item[] = [
  { id: 'bg-room', slot: 'bg', name: n('ห้องนอนอบอุ่น', 'Cozy bedroom'), rarity: 'common', unlock: free, edge: ['#FBE3C4', '#F2C9A0'], back: () => (
    <g>
      <rect width={240} height={300} fill="#FBE3C4" />
      <rect y={214} width={240} height={86} fill="#F2C9A0" />
      <path d="M0,214 L240,214" stroke="#E2AE80" strokeWidth={3} />
      <Window x={30} y={40} />
      <path d="M22,34 Q34,90 26,132 L40,132 Q46,84 40,34 Z M110,34 Q100,90 106,132 L92,132 Q86,84 92,34 Z" fill="#FFF0B8" opacity={0.95} />
      <rect x={170} y={150} width={50} height={64} rx={6} fill="#D9A47A" {...S} />
      <circle cx={195} cy={120} r={24} fill="#E9C9A6" {...S} />
      <ellipse cx={120} cy={268} rx={74} ry={16} fill="#F7A49B" />
    </g>
  ) },
  { id: 'bg-campus', slot: 'bg', name: n('ลานแคมปัส SPU', 'SPU campus plaza'), rarity: 'common', unlock: free, edge: ['#A6D8F0', '#5FA847'], back: () => (
    <g>
      {/* Sky: soft blue, lighter at the horizon so the pink SPU building reads clean */}
      <defs>
        <linearGradient id="spu-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8CC8E8" />
          <stop offset="70%" stopColor="#C6E6F2" />
          <stop offset="100%" stopColor="#E6F2E0" />
        </linearGradient>
        <linearGradient id="spu-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8CCE6A" />
          <stop offset="100%" stopColor="#5FA847" />
        </linearGradient>
      </defs>
      <rect width={240} height={300} fill="url(#spu-sky)" />

      {/* Puffy clouds: three soft blobs each, like the landing deck */}
      {[[42, 44, 1], [172, 32, 0.9], [120, 60, 0.75]].map(([cx, cy, s], i) => (
        <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`} fill="#FFFFFF" opacity={0.95}>
          <ellipse rx={22} ry={9} />
          <ellipse cx={-14} cy={-3} rx={13} ry={10} />
          <ellipse cx={10} cy={-4} rx={15} ry={11} />
        </g>
      ))}

      {/* Context towers behind: a tall concrete block + a glass block, both muted so SPU reads first */}
      <g>
        <rect x={-4} y={108} width={54} height={118} fill="#D7D0C4" stroke={OUT} strokeWidth={2} />
        <rect x={6} y={120} width={10} height={10} fill="#A9B6C8" />
        <rect x={22} y={120} width={10} height={10} fill="#A9B6C8" />
        <rect x={38} y={120} width={10} height={10} fill="#A9B6C8" />
        <rect x={6} y={138} width={10} height={10} fill="#8AA0BC" />
        <rect x={22} y={138} width={10} height={10} fill="#A9B6C8" />
        <rect x={38} y={138} width={10} height={10} fill="#A9B6C8" />
        <rect x={6} y={156} width={10} height={10} fill="#A9B6C8" />
        <rect x={22} y={156} width={10} height={10} fill="#8AA0BC" />
        <rect x={38} y={156} width={10} height={10} fill="#A9B6C8" />
        <rect x={6} y={174} width={10} height={10} fill="#A9B6C8" />
        <rect x={22} y={174} width={10} height={10} fill="#A9B6C8" />
        <rect x={38} y={174} width={10} height={10} fill="#8AA0BC" />
      </g>

      {/* The hero SPU tower on the right: signature pink glass with a crown and the SPU mark */}
      <g>
        <rect x={168} y={82} width={66} height={144} fill="#F7B7D1" stroke={OUT} strokeWidth={2.5} />
        <rect x={168} y={78} width={66} height={8} fill="#E07AA8" stroke={OUT} strokeWidth={2.5} />
        {/* window grid */}
        {[94, 112, 130, 148, 166, 184, 202].map((y) => (
          <g key={y}>
            <rect x={174} y={y} width={11} height={11} fill="#FFF2E0" stroke={OUT} strokeWidth={1.4} />
            <rect x={189} y={y} width={11} height={11} fill="#FFE7A8" stroke={OUT} strokeWidth={1.4} />
            <rect x={204} y={y} width={11} height={11} fill="#FFF2E0" stroke={OUT} strokeWidth={1.4} />
            <rect x={219} y={y} width={11} height={11} fill="#FFE7A8" stroke={OUT} strokeWidth={1.4} />
          </g>
        ))}
        {/* "SPU" sign on the pink crown */}
        <text x={201} y={76} fontSize={9} fontWeight={800} fill="#FFF" textAnchor="middle" fontFamily="Fredoka, Arial Rounded MT Bold, sans-serif" letterSpacing={0.5}>SPU</text>
      </g>

      {/* MRT viaduct crossing the middle distance: columns, deck, a lit coach rolling by */}
      <g>
        <rect x={54} y={178} width={6} height={48} fill="#C8C0B4" stroke={OUT} strokeWidth={1.5} />
        <rect x={110} y={178} width={6} height={48} fill="#C8C0B4" stroke={OUT} strokeWidth={1.5} />
        <rect x={44} y={168} width={120} height={14} rx={3} fill="#DAD2C4" stroke={OUT} strokeWidth={2} />
        <rect x={66} y={154} width={54} height={16} rx={4} fill="#4A6BA8" stroke={OUT} strokeWidth={2} />
        <rect x={70} y={158} width={10} height={8} rx={1.5} fill="#FFE27A" />
        <rect x={86} y={158} width={10} height={8} rx={1.5} fill="#FFE27A" />
        <rect x={102} y={158} width={10} height={8} rx={1.5} fill="#FFE27A" />
      </g>

      {/* Ground: lawn with a cream path along the front */}
      <rect y={226} width={240} height={74} fill="url(#spu-ground)" />
      <path d="M-6,278 Q120,260 246,282 L246,300 L-6,300 Z" fill="#F3E9D1" stroke={OUT} strokeWidth={2} />

      {/* A cherry blossom tree for the plaza — SPU's signature pink puffs */}
      <g>
        <path d="M158,268 Q156,236 164,214 L172,214 Q180,236 174,268 Z" fill="#8E5A47" stroke={OUT} strokeWidth={2} />
        {[[150, 212, 18], [172, 198, 22], [194, 212, 17], [162, 184, 17], [184, 184, 15]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#FFB3D2' : '#FFC9DC'} stroke={OUT} strokeWidth={2} />
        ))}
      </g>

      {/* A banner stake with the SPU heart, so you know whose campus you're on */}
      <g>
        <rect x={28} y={226} width={2.5} height={44} fill={OUT} />
        <path d="M31,228 L58,228 L54,236 L58,244 L31,244 Z" fill="#E89BC4" stroke={OUT} strokeWidth={2} />
        <path d={heartPath(43, 236, 4)} fill="#FFF" />
      </g>
    </g>
  ) },
  { id: 'bg-classroom', slot: 'bg', name: n('ห้องเรียน', 'Classroom'), rarity: 'common', unlock: free, edge: ['#EAF4E4', '#D8B48A'], back: () => (
    <g>
      <rect width={240} height={300} fill="#EAF4E4" />
      <rect x={30} y={36} width={180} height={96} rx={6} fill="#3E6B52" stroke="#A97C50" strokeWidth={8} />
      <path d="M50,64 Q70,56 90,64 M50,84 L120,84 M140,60 L190,60 M146,96 Q168,86 186,100" stroke="#F4F4E8" strokeWidth={3} fill="none" strokeLinecap="round" />
      <text x={150} y={84} fontSize={16} fill="#F7E39A" fontFamily="Fredoka">A+</text>
      <rect y={220} width={240} height={80} fill="#D8B48A" />
    </g>
  ) },
  { id: 'bg-night', slot: 'bg', name: n('ท้องฟ้ายามค่ำ', 'Starry night'), rarity: 'rare', unlock: coins(120), edge: ['#1C1B4A', '#3B356E'], back: () => (
    <g>
      <defs><linearGradient id="bgnight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1C1B4A" /><stop offset="100%" stopColor="#5B4A9E" /></linearGradient></defs>
      <rect width={240} height={300} fill="url(#bgnight)" />
      <path d="M196,40 A20,20 0 1,0 210,74 A15,15 0 1,1 196,40Z" fill="#FFF3B0" />
      {[[30, 40], [70, 80], [130, 30], [160, 100], [24, 140], [214, 150], [100, 120], [56, 196]].map(([x, y]) => <path key={`${x}${y}`} d={twinkle(x, y, 4)} fill="#fff" />)}
      <rect y={226} width={240} height={74} fill="#3B356E" />
    </g>
  ) },
  { id: 'bg-sakura', slot: 'bg', name: n('สวนซากุระ', 'Sakura garden'), rarity: 'rare', unlock: coins(150), edge: ['#FFC1D6', '#C7EBB0'], back: () => (
    <g>
      <rect width={240} height={300} fill="#FFE8F0" />
      <path d="M0,40 Q60,10 120,36 Q180,6 240,30 L240,0 L0,0 Z" fill="#FFC1D6" />
      {[[20, 50, 26], [80, 30, 30], [160, 40, 28], [222, 60, 24]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#FFB3CC" />)}
      <path d="M200,60 Q206,140 196,220 L214,220 Q222,140 214,60Z" fill="#9A6A54" />
      <rect y={220} width={240} height={80} fill="#C7EBB0" />
      {[[40, 150], [70, 200], [180, 170], [120, 120], [30, 240]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={4} ry={2.5} fill="#FF9CC0" transform={`rotate(30 ${x} ${y})`} />)}
    </g>
  ) },
  { id: 'bg-beach', slot: 'bg', name: n('ชายหาดยามเย็น', 'Sunset beach'), rarity: 'epic', unlock: coins(200), edge: ['#FFB38A', '#F5D9A6'], back: () => (
    <g>
      <defs><linearGradient id="bgbeach" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFB38A" /><stop offset="60%" stopColor="#FFD9A0" /><stop offset="100%" stopColor="#FFE9C4" /></linearGradient></defs>
      <rect width={240} height={300} fill="url(#bgbeach)" />
      <circle cx={120} cy={150} r={34} fill="#FFE07A" />
      <rect y={150} width={240} height={70} fill="#5FB8E0" />
      <path d="M0,170 Q30,164 60,170 T120,170 T180,170 T240,170" fill="none" stroke="#B9E6FA" strokeWidth={3} />
      <rect y={214} width={240} height={86} fill="#F5D9A6" />
      <path d="M200,214 Q196,150 214,100" fill="none" stroke="#9A6A54" strokeWidth={8} />
      <path d="M214,100 Q190,92 176,108 M214,100 Q236,90 240,110 M214,100 Q210,80 196,74" fill="none" stroke="#5EA94B" strokeWidth={6} strokeLinecap="round" />
    </g>
  ) },
  { id: 'bg-fame', slot: 'bg', name: n('หอเกียรติยศ', 'Hall of fame'), rarity: 'legendary', unlock: quest('block-5'), edge: ['#C9395B', '#7A1730'], back: () => (
    <g>
      <defs>
        <radialGradient id="bgfame" cx="50%" cy="40%"><stop offset="0%" stopColor="#FFF4C8" /><stop offset="100%" stopColor="#C9395B" /></radialGradient>
      </defs>
      <rect width={240} height={300} fill="url(#bgfame)" />
      <path d="M0,0 L40,0 Q30,150 46,300 L0,300 Z M240,0 L200,0 Q210,150 194,300 L240,300 Z" fill="#9C1E3E" />
      <path d="M120,0 L60,300 L180,300 Z" fill="#FFF8DC" opacity={0.35} />
      {[[60, 60], [180, 70], [90, 110], [160, 30]].map(([x, y]) => <path key={x} d={starPath(x, y, 7)} fill="#FFE27A" />)}
      <rect y={226} width={240} height={74} fill="#7A1730" />
      <ellipse cx={120} cy={262} rx={80} ry={18} fill="#F2C14E" opacity={0.8} />
    </g>
  ) },
]

export const ITEMS: Item[] = [...HATS, ...HAIRS, ...EYES, ...NECK, ...OUTFITS, ...HELD, ...AURA, ...BGS]
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]))

export const SLOTS: { slot: Slot; name: { th: string; en: string } }[] = [
  { slot: 'hat', name: n('หมวก', 'Hats') },
  { slot: 'hair', name: n('ทรงผม', 'Hair') },
  { slot: 'eyes', name: n('ตา & แว่น', 'Eyes') },
  { slot: 'neck', name: n('ผูกคอ', 'Neck') },
  { slot: 'outfit', name: n('ชุด', 'Outfits') },
  { slot: 'held', name: n('ของถือ', 'Hand items') },
  { slot: 'aura', name: n('เอฟเฟกต์', 'Effects') },
  { slot: 'bg', name: n('ฉากหลัง', 'Scenes') },
]

/** Crop of the 240×300 space each slot's thumbnail shows. */
export const THUMB_BOX: Record<Slot, [number, number, number, number]> = {
  hat: [36, -12, 168, 128],
  hair: [30, 10, 180, 200],
  eyes: [74, 96, 92, 56],
  neck: [76, 146, 88, 92],
  outfit: [48, 150, 144, 126],
  held: [128, 44, 112, 196],
  aura: [0, 0, 240, 300],
  bg: [0, 0, 240, 300],
}

export const DEFAULT_LOOK: Record<Slot, string> = {
  hat: 'hat-sprout',
  hair: 'hair-fluffy',
  eyes: 'eyes-dot',
  neck: 'neck-bow-blue',
  outfit: 'outfit-spu',
  held: 'held-none',
  aura: 'aura-none',
  bg: 'bg-campus',
}

export const RARITY: Record<Rarity, { th: string; en: string; color: string; glow: string }> = {
  common: { th: 'ธรรมดา', en: 'Common', color: '#B9A89A', glow: 'transparent' },
  rare: { th: 'หายาก', en: 'Rare', color: '#4FA3F7', glow: 'rgba(79,163,247,0.35)' },
  epic: { th: 'เอพิค', en: 'Epic', color: '#A66BFF', glow: 'rgba(166,107,255,0.4)' },
  legendary: { th: 'ตำนาน', en: 'Legendary', color: '#F5B82E', glow: 'rgba(245,184,46,0.55)' },
}
