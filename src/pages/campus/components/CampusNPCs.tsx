import { useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { CanvasTexture, SRGBColorSpace, type Group } from 'three'
import Avatar3D from './Avatar3D'
import type { AvatarAura, AvatarHat, AvatarOutfit } from '@/context/AppContext'
import type { IconName } from '@/components/icons/GameIcon'
import { drawGameIcon } from '@/components/icons/drawGameIcon'

export interface CampusNPC {
  id: string
  name: string
  nameEn: string
  faculty: string
  facultyEn: string
  title: string
  titleEn: string
  questIcon: IconName
  color: string
  hat: AvatarHat
  outfit: AvatarOutfit
  aura: AvatarAura
  position: [number, number, number] // [x, y, z]
  rotation: number // Y rotation
  greeting: string
  greetingEn: string
  dialogue: string
  dialogueEn: string
  options: {
    label: string
    labelEn: string
    icon: IconName
    action: 'xp' | 'navigate_arena' | 'navigate_faculty' | 'navigate_dorm' | 'open_shop' | 'close'
    rewardXP?: number
    rewardCoins?: number
    targetBuildingId?: string
    feedback: string
    feedbackEn: string
  }[]
}

export const CAMPUS_NPCS: CampusNPC[] = [
  {
    id: 'npc-ice',
    name: 'น้องไอซ์',
    nameEn: 'Ice',
    faculty: 'ดิจิทัลมีเดีย',
    facultyEn: 'Digital Media',
    title: 'เซียนคำศัพท์ Arena',
    titleEn: 'Flashcard Arena Champion',
    questIcon: 'swords',
    color: '#06B6D4',
    hat: 'dj_headset',
    outfit: 'hoodie',
    aura: 'neon',
    position: [6, 0, 4],
    rotation: -Math.PI / 4,
    greeting: 'เฮ้! กำลังไปประลองที่ Arena อยู่เหรอ?',
    greetingEn: 'Hey! Are you heading to the Arena for a match?',
    dialogue:
      'คำศัพท์เรื่อง Cross-Cultural ในสัปดาห์นี้ออกสอบเยอะมากนะ! ถ้าจำโมเดล Hofstede ได้ครบ จะทำคอมโบได้คะแนนคูณสองใน Arena เลยล่ะ',
    dialogueEn:
      'Cross-Cultural concepts are huge on this exam! If you master Hofstede’s dimensions, you can chain 3x streaks for massive XP in the Arena.',
    options: [
      {
        label: 'ขอทวนคำศัพท์ด่วน 1 ข้อ (+20 XP)',
        labelEn: 'Quick Flashcard Drill (+20 XP)',
        icon: 'idea',
        action: 'xp',
        rewardXP: 20,
        rewardCoins: 10,
        feedback: 'ยอดเยี่ยม! High-Context Culture มักเน้นการสื่อสารแบบอ้อมและความสัมพันธ์อันลึกซึ้ง รับไปเลย +20 XP!',
        feedbackEn: 'Awesome! High-Context cultures emphasize indirect communication and deep relational bonds. +20 XP awarded!',
      },
      {
        label: 'นำทางฉันไปที่ Arena',
        labelEn: 'Guide me to the Arena',
        icon: 'swords',
        action: 'navigate_arena',
        targetBuildingId: 'arena',
        feedback: 'จัดไป! ประตู Arena เปิดแล้ว ไปลุยคว้าแชมป์ลีดเดอร์บอร์ดเลย!',
        feedbackEn: 'Let’s go! Arena doors are open. Climb the weekly leaderboard!',
      },
      {
        label: 'ไว้เจอกันใหม่นะ',
        labelEn: 'See you around',
        icon: 'wave',
        action: 'close',
        feedback: 'สู้ ๆ นะ แล้วเจอกันที่ลีดเดอร์บอร์ด!',
        feedbackEn: 'Good luck! See you on the leaderboard!',
      },
    ],
  },
  {
    id: 'npc-jean',
    name: 'พี่ยีนส์',
    nameEn: 'Jean',
    faculty: 'วิศวกรรมคอมพิวเตอร์',
    facultyEn: 'Computer Engineering',
    title: 'รุ่นพี่สโมสรนิสิต',
    titleEn: 'Senior Peer Mentor',
    questIcon: 'scroll',
    color: '#8B5CF6',
    hat: 'cyber_cat',
    outfit: 'suit',
    aura: 'stars',
    position: [15, 0, 8],
    rotation: -Math.PI / 2,
    greeting: 'สวัสดีน้องใหม่! กำลังจะเข้าอาคาร 1 ใช่ไหม?',
    greetingEn: 'Welcome scholar! Heading into Building 1?',
    dialogue:
      'ในอาคาร 1 มีห้องบรรยาย Cyber Lecture Hall อย่าลืมดูวิดีโอปูพื้นฐานและทำ Pre-Test ให้ครบก่อนเข้าห้องนะ อาจารย์มีแจกเหรียญไว้ซื้อชุดที่ Boutique ด้วย',
    dialogueEn:
      'Building 1 holds the Cyber Lecture Amphitheater. Make sure you watch the pre-class video and tackle the Pre-Test before class. You will stack coins for the Boutique!',
    options: [
      {
        label: 'ขอรับเคล็ดลับการเรียนล่วงหน้า (+25 XP)',
        labelEn: 'Claim Study Pro-Tips (+25 XP)',
        icon: 'books',
        action: 'xp',
        rewardXP: 25,
        rewardCoins: 15,
        feedback: 'เคล็ดลับคือ: ทำควิซสปีดเทสต์วันละ 3 นาที คะแนนเกรด A+ แน่นอน! รับไป +25 XP & +15 Coins!',
        feedbackEn: 'Pro-tip: 3 minutes of daily pre-tests guarantees an A+ grade! Claimed +25 XP & +15 Coins!',
      },
      {
        label: 'นำทางฉันเข้าสู่อาคาร 1 (Faculty Hall)',
        labelEn: 'Guide me into Building 1',
        icon: 'landmark',
        action: 'navigate_faculty',
        targetBuildingId: 'faculty',
        feedback: 'เดินตามทางไฟนีออนตรงไปหน้าอาคาร 1 ได้เลย!',
        feedbackEn: 'Follow the neon path straight to Building 1!',
      },
      {
        label: 'ขอบคุณมากครับพี่',
        labelEn: 'Thanks mentor',
        icon: 'like',
        action: 'close',
        feedback: 'ขอให้สนุกกับการเก็บเควสต์ในมอ!',
        feedbackEn: 'Have fun conquering quests on campus!',
      },
    ],
  },
  {
    id: 'npc-mind',
    name: 'น้องมายด์',
    nameEn: 'Mind',
    faculty: 'นิเทศศาสตร์',
    facultyEn: 'Communication Arts',
    title: 'บรรณารักษ์ & ผู้พิทักษ์ศาลานิรนาม',
    titleEn: 'Library Mentor & Sanctuary Keeper',
    questIcon: 'mask',
    color: '#EC4899',
    hat: 'crown',
    outfit: 'hoodie',
    aura: 'gold',
    position: [-4.8, 0, 7.8],
    rotation: Math.PI * 0.75,
    greeting: 'สวัสดีจ้า! แวะมาอ่านหนังสือที่หอสมุด หรือจะแวะไปส่งคำถามที่ศาลานิรนามดี?',
    greetingEn: 'Hello! Are you stopping by the Library to study, or heading to the Secret Sanctuary?',
    dialogue:
      'ที่หอสมุด (Learning Library) มีสรุปบทเรียนและ Syllabus ให้ทบทวนก่อนสอบ ส่วนถ้าติดขัดตรงไหนแล้วเขินไม่กล้าถามอาจารย์ สามารถสวมหน้ากากปริศนาส่งคำถามได้ที่อาคาร 10 นะ!',
    dialogueEn:
      'The Learning Library has weekly syllabus summaries and review notes before exams. And if you are ever stuck, you can submit anonymous inquiries to the Guild Master in Bldg 10!',
    options: [
      {
        label: 'รับหน้ากากปริศนา & เคล็ดลับทบทวนบทเรียน (+20 XP)',
        labelEn: 'Equip Mystery Persona & Study Tips (+20 XP)',
        icon: 'sparkles',
        action: 'xp',
        rewardXP: 20,
        rewardCoins: 10,
        feedback: 'สวมหน้ากากปริศนาเรียบร้อย! ส่งคำถามแรกเพื่อรับเพิ่มอีก +15 XP ในอาคาร 10 นะ!',
        feedbackEn: 'Mystery persona equipped! Drop your inquiry inside Building 10 for another +15 XP!',
      },
      {
        label: 'นำทางฉันไปที่ศาลานิรนาม (Heart Dorm)',
        labelEn: 'Guide me to Secret Sanctuary',
        icon: 'door',
        action: 'navigate_dorm',
        targetBuildingId: 'dorm',
        feedback: 'กำลังมุ่งหน้าสู่ศาลานิรนาม อาคาร 10!',
        feedbackEn: 'Heading toward Heart Dorm Secret Sanctuary!',
      },
      {
        label: 'ไว้แวะมาใหม่นะ',
        labelEn: 'I will check back soon',
        icon: 'wave',
        action: 'close',
        feedback: 'ขอให้สนุกกับการอ่านหนังสือและทำภารกิจนะ!',
        feedbackEn: 'Have a wonderful study session and quest run!',
      },
    ],
  },
  {
    id: 'npc-guide',
    name: 'SPU Smart Navigator',
    nameEn: 'SPU Smart Bot',
    faculty: 'ศูนย์นวัตกรรม SPU',
    facultyEn: 'SPU Innovation Center',
    title: 'ไกด์นำทางดิจิทัล',
    titleEn: 'Campus Smart Concierge',
    questIcon: 'bot',
    color: '#E89BC4',
    hat: 'grad',
    outfit: 'default',
    aura: 'neon',
    position: [-2.2, 0, 14.0],
    rotation: Math.PI / 4,
    greeting: 'สวัสดีครับ! ยินดีต้อนรับสู่ ClassLoop SPU Universe!',
    greetingEn: 'Hello! Welcome to the ClassLoop SPU Universe!',
    dialogue:
      'คุณเดินสำรวจมหาลัยได้ทั่ว แค่แตะพื้นหรือใช้จอยสติ๊กด้านซ้ายล่าง เก็บเหรียญ SPU Coins จากทุกอาคาร มาแต่งตัวที่ร้าน Boutique ได้เลย!',
    dialogueEn:
      'Roam the SPU campus freely — tap the ground or use the joystick at bottom-left. Earn SPU Coins across every building and dress up at the Boutique!',
    options: [
      {
        label: 'เปิดร้านค้าแฟชั่น SPU Boutique ตอนนี้',
        labelEn: 'Open SPU Boutique Shop',
        icon: 'shop',
        action: 'open_shop',
        feedback: 'เปิดตู้เสื้อผ้าแฟชั่น SPU Boutique แล้ว!',
        feedbackEn: 'Opening SPU Boutique Fashion Shop!',
      },
      {
        label: 'รับโบนัสต้อนรับสู่แคมปัส (+30 Coins)',
        labelEn: 'Claim Welcome Coins (+30 Coins)',
        icon: 'coin',
        action: 'xp',
        rewardXP: 10,
        rewardCoins: 30,
        feedback: 'รับเหรียญต้อนรับ +30 Coins & +10 XP สำหรับนำไปแต่งตัวใน Boutique!',
        feedbackEn: 'Claimed welcome gift of +30 Coins & +10 XP for the Boutique!',
      },
      {
        label: 'เข้าใจแล้ว ขอบคุณมาก',
        labelEn: 'Got it, thank you',
        icon: 'wave',
        action: 'close',
        feedback: 'ขอให้สนุกกับการผจญภัยในแคมปัส SPU ครับ!',
        feedbackEn: 'Enjoy your adventure across SPU campus!',
      },
    ],
  },
]

/**
 * 3D NPC Group rendered within the Three.js Canvas.
 * Animated with subtle breathing/swaying and floating holographic billboard tag.
 */
export default function CampusNPCs({
  lang,
  onTalk,
}: {
  lang: 'th' | 'en'
  onTalk: (npc: CampusNPC) => void
}) {
  return (
    <group name="campus-npcs">
      {CAMPUS_NPCS.map((npc) => (
        <SingleNPC key={npc.id} npc={npc} lang={lang} onTalk={onTalk} />
      ))}
    </group>
  )
}

function SingleNPC({
  npc,
  lang,
  onTalk,
}: {
  npc: CampusNPC
  lang: 'th' | 'en'
  onTalk: (npc: CampusNPC) => void
}) {
  const groupRef = useRef<Group>(null)
  const tag = useMemo(() => nametagTexture(npc, lang), [npc, lang])
  const talk = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onTalk(npc)
  }
  const pointer = () => void (document.body.style.cursor = 'pointer')
  const unpointer = () => void (document.body.style.cursor = '')

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Gentle floating idle breathing
    groupRef.current.position.y = npc.position[1] + Math.sin(t * 2 + npc.position[0]) * 0.04
  })

  return (
    <group
      ref={groupRef}
      position={[npc.position[0], npc.position[1], npc.position[2]]}
      rotation={[0, npc.rotation, 0]}
    >
      <Avatar3D
        color={npc.color}
        hat={npc.hat}
        outfit={npc.outfit}
        aura={npc.aura}
      />

      {/* Floating hologram nametag & quest badge. Drawn on a canvas billboard, not drei <Html>:
          Html's separate React root throws "removeChild" errors under React 19 when the campus unmounts (see HANDOFF). */}
      <Billboard position={[0, 2.45, 0]}>
        <mesh onClick={talk} onPointerOver={pointer} onPointerOut={unpointer}>
          <planeGeometry args={[2.4, 1.05]} />
          <meshBasicMaterial map={tag} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

const tagCache = new Map<string, CanvasTexture>()

/** The NPC's quest badge, name pill and "[E] Talk" hint, drawn once per language. */
function nametagTexture(npc: CampusNPC, lang: 'th' | 'en') {
  const key = `${npc.id}-${lang}`
  const hit = tagCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 224
  const g = c.getContext('2d')!
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  // quest badge
  g.fillStyle = 'rgba(245,158,11,0.35)'
  g.strokeStyle = 'rgba(251,191,36,0.85)'
  g.lineWidth = 4
  g.beginPath()
  g.arc(256, 40, 32, 0, Math.PI * 2)
  g.fill()
  g.stroke()
  drawGameIcon(g, npc.questIcon, 256, 40, 34, '#FDE68A')
  // name pill
  const name = lang === 'th' ? npc.name : npc.nameEn
  const faculty = lang === 'th' ? npc.faculty : npc.facultyEn
  g.font = 'bold 34px sans-serif'
  const nameW = g.measureText(name).width
  g.font = '600 24px sans-serif'
  const facW = g.measureText(` · ${faculty}`).width
  const pillW = Math.min(500, nameW + facW + 80)
  const x0 = 256 - pillW / 2
  g.fillStyle = 'rgba(0,0,0,0.78)'
  g.strokeStyle = 'rgba(255,255,255,0.25)'
  g.lineWidth = 2
  g.beginPath()
  g.roundRect(x0, 88, pillW, 60, 30)
  g.fill()
  g.stroke()
  g.fillStyle = '#34D399'
  g.beginPath()
  g.arc(x0 + 30, 118, 7, 0, Math.PI * 2)
  g.fill()
  g.textAlign = 'left'
  g.fillStyle = '#FFFFFF'
  g.font = 'bold 34px sans-serif'
  g.fillText(name, x0 + 48, 119, 300)
  g.fillStyle = 'rgba(255,255,255,0.6)'
  g.font = '600 24px sans-serif'
  g.fillText(` · ${faculty}`, x0 + 48 + Math.min(nameW, 300), 120, 180)
  // hint
  g.textAlign = 'center'
  g.fillStyle = '#FCD34D'
  g.font = 'bold 24px sans-serif'
  g.fillText(`[E] ${lang === 'th' ? 'คุย' : 'Talk'}`, 256, 182)
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tagCache.set(key, tex)
  return tex
}
