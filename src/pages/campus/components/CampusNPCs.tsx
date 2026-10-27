import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Group } from 'three'
import Avatar3D from './Avatar3D'
import type { AvatarAura, AvatarHat, AvatarOutfit } from '@/context/AppContext'

export interface CampusNPC {
  id: string
  name: string
  nameEn: string
  faculty: string
  facultyEn: string
  title: string
  titleEn: string
  questIcon: string
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
    questIcon: '⚔️',
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
        label: '💡 ขอทวนคำศัพท์ด่วน 1 ข้อ (+20 XP)',
        labelEn: '💡 Quick Flashcard Drill (+20 XP)',
        action: 'xp',
        rewardXP: 20,
        rewardCoins: 10,
        feedback: 'ยอดเยี่ยม! High-Context Culture มักเน้นการสื่อสารแบบอ้อมและความสัมพันธ์อันลึกซึ้ง รับไปเลย +20 XP!',
        feedbackEn: 'Awesome! High-Context cultures emphasize indirect communication and deep relational bonds. +20 XP awarded!',
      },
      {
        label: '🏟️ นำทางฉันไปที่ Arena',
        labelEn: '🏟️ Guide me to the Arena',
        action: 'navigate_arena',
        targetBuildingId: 'arena',
        feedback: 'จัดไป! ประตู Arena เปิดแล้ว ไปลุยคว้าแชมป์ลีดเดอร์บอร์ดเลย!',
        feedbackEn: 'Let’s go! Arena doors are open. Climb the weekly leaderboard!',
      },
      {
        label: '👋 ไว้เจอกันใหม่นะ',
        labelEn: '👋 See you around',
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
    questIcon: '📜',
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
        label: '📚 ขอรับเคล็ดลับการเรียนล่วงหน้า (+25 XP)',
        labelEn: '📚 Claim Study Pro-Tips (+25 XP)',
        action: 'xp',
        rewardXP: 25,
        rewardCoins: 15,
        feedback: 'เคล็ดลับคือ: ทำควิซสปีดเทสต์วันละ 3 นาที คะแนนเกรด A+ แน่นอน! รับไป +25 XP & +15 Coins!',
        feedbackEn: 'Pro-tip: 3 minutes of daily pre-tests guarantees an A+ grade! Claimed +25 XP & +15 Coins!',
      },
      {
        label: '🏛️ นำทางฉันเข้าสู่อาคาร 1 (Faculty Hall)',
        labelEn: '🏛️ Guide me into Building 1',
        action: 'navigate_faculty',
        targetBuildingId: 'faculty',
        feedback: 'เดินตามทางไฟนีออนตรงไปหน้าอาคาร 1 ได้เลย!',
        feedbackEn: 'Follow the neon path straight to Building 1!',
      },
      {
        label: '👍 ขอบคุณมากครับพี่',
        labelEn: '👍 Thanks mentor',
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
    title: 'ผู้พิทักษ์ศาลานิรนาม',
    titleEn: 'Oracle Sanctuary Keeper',
    questIcon: '🎭',
    color: '#EC4899',
    hat: 'crown',
    outfit: 'hoodie',
    aura: 'gold',
    position: [-12, 0, 10],
    rotation: Math.PI / 3,
    greeting: 'ชู่ว์... ยินดีต้อนรับสู่เขตศาลานิรนาม (อาคาร 10)',
    greetingEn: 'Shh... Welcome near the Secret Sanctuary (Bldg 10)!',
    dialogue:
      'ถ้าเธอมีข้อสงสัยหรือติดขัดบทเรียน แต่ไม่กล้าถามในห้อง ที่นี่สามารถสวมหน้ากากสุนัขจิ้งจอก นกฮูก หรือโลมา ส่งคำถามหาอาจารย์ได้โดยไม่มีใครรู้ชื่อจริงเลยนะ!',
    dialogueEn:
      'If you are ever puzzled in lecture but hesitate to speak up, put on a mystery fox or owl persona in the Sanctuary. Guild Master answers you with total anonymity!',
    options: [
      {
        label: '✨ รับหน้ากากปริศนาสำรวจศาลานิรนาม (+15 XP)',
        labelEn: '✨ Equip Mystery Persona & Visit (+15 XP)',
        action: 'xp',
        rewardXP: 15,
        rewardCoins: 10,
        feedback: 'สวมหน้ากากปริศนาเรียบร้อย! ส่งคำถามแรกเพื่อรับเพิ่มอีก +15 XP ในอาคาร 10 นะ!',
        feedbackEn: 'Mystery persona equipped! Drop your inquiry inside Building 10 for another +15 XP!',
      },
      {
        label: '🚪 นำทางฉันไปที่ศาลานิรนาม (Heart Dorm)',
        labelEn: '🚪 Guide me to Secret Sanctuary',
        action: 'navigate_dorm',
        targetBuildingId: 'dorm',
        feedback: 'กำลังมุ่งหน้าสู่ศาลานิรนาม อาคาร 10!',
        feedbackEn: 'Heading toward Heart Dorm Secret Sanctuary!',
      },
      {
        label: 'ไว้แวะมาใหม่นะ',
        labelEn: 'I will check back soon',
        action: 'close',
        feedback: 'ความลับของคุณจะปลอดภัยที่นี่เสมอ...',
        feedbackEn: 'Your secrets are always safe here...',
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
    questIcon: '🤖',
    color: '#E89BC4',
    hat: 'grad',
    outfit: 'default',
    aura: 'neon',
    position: [0, 0, 15],
    rotation: 0,
    greeting: 'สวัสดีครับ! ยินดีต้อนรับสู่ ClassLoop SPU Universe!',
    greetingEn: 'Hello! Welcome to the ClassLoop SPU Universe!',
    dialogue:
      'คุณสามารถเดินสำรวจมหาลัยด้วยปุ่ม W A S D หรือคลิกลากเมาส์เพื่อหันมองรอบทิศทาง สามารถเก็บเหรียญ SPU Coins จากการเรียนมาแต่งตัวที่ร้าน Boutique ได้เลย!',
    dialogueEn:
      'You can freely roam SPU campus with WASD or mouse drag. Earn study coins across all buildings to customize your 3D outfit in the Boutique!',
    options: [
      {
        label: '🛍️ เปิดร้านค้าแฟชั่น SPU Boutique ตอนนี้',
        labelEn: '🛍️ Open SPU Boutique Shop',
        action: 'open_shop',
        feedback: 'เปิดตู้เสื้อผ้าแฟชั่น SPU Boutique แล้ว!',
        feedbackEn: 'Opening SPU Boutique Fashion Shop!',
      },
      {
        label: '🪙 รับโบนัสต้อนรับสู่แคมปัส (+30 Coins)',
        labelEn: '🪙 Claim Welcome Coins (+30 Coins)',
        action: 'xp',
        rewardXP: 10,
        rewardCoins: 30,
        feedback: 'รับเหรียญต้อนรับ +30 Coins & +10 XP สำหรับนำไปแต่งตัวใน Boutique!',
        feedbackEn: 'Claimed welcome gift of +30 Coins & +10 XP for the Boutique!',
      },
      {
        label: 'เข้าใจแล้ว ขอบคุณมาก',
        labelEn: 'Got it, thank you',
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

      {/* Floating Hologram Nametag & Quest Indicator */}
      <Html
        position={[0, 2.15, 0]}
        center
        distanceFactor={22}
        className="pointer-events-auto select-none"
      >
        <button
          onClick={() => onTalk(npc)}
          className="group flex flex-col items-center cursor-pointer transition-all hover:scale-110 active:scale-95"
        >
          {/* Animated Quest Icon Badge */}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/60 bg-amber-500/30 text-sm shadow-[0_0_12px_rgba(251,191,36,0.5)] backdrop-blur-md animate-bounce">
            {npc.questIcon}
          </span>

          {/* Holographic Nametag Pill */}
          <div className="mt-1 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-0.5 text-white backdrop-blur-md shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-wide text-white group-hover:text-pink-300 transition-colors">
              {lang === 'th' ? npc.name : npc.nameEn}
            </span>
            <span className="text-[9px] font-semibold text-white/60">
              · {lang === 'th' ? npc.faculty : npc.facultyEn}
            </span>
          </div>

          {/* Quick interaction hint */}
          <span className="mt-0.5 text-[9px] font-bold text-amber-300 drop-shadow">
            [E] {lang === 'th' ? 'คุย' : 'Talk'}
          </span>
        </button>
      </Html>
    </group>
  )
}
