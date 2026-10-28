import { useState, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  Send,
  Sparkles,
  Flame,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  Hash,
  Shield,
  Lock,
  CheckCircle2,
  Search,
  Radio,
  DoorOpen,
  SlidersHorizontal,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import {
  playClickSound,
  playCoinSound,
  playXPSparkle,
  playLevelUpSound,
} from '../soundEngine'
import { GameIcon, type IconName } from '@/components/icons/GameIcon'

const MYSTERY_AVATARS = [
  {
    id: 'fox',
    label: 'Fox Sage #42',
    name: 'Fox Sage #42',
    icon: 'fox' as IconName,
    color: '#F59E0B',
    accent: 'from-amber-500 to-orange-600',
    faculty: { th: 'คณะสถาปัตยกรรมศาสตร์', en: 'Faculty of Architecture' },
    shortFaculty: { th: 'สถาปัตย์', en: 'Architecture' },
  },
  {
    id: 'owl',
    label: 'Night Owl #17',
    name: 'Night Owl #17',
    icon: 'owl' as IconName,
    color: '#8B5CF6',
    accent: 'from-purple-500 to-indigo-600',
    faculty: { th: 'คณะวิศวกรรมศาสตร์ (คอมฯ)', en: 'Faculty of Computer Eng.' },
    shortFaculty: { th: 'วิศวะคอมฯ', en: 'Computer Eng.' },
  },
  {
    id: 'dolphin',
    label: 'Cyber Dolphin #88',
    name: 'Cyber Dolphin #88',
    icon: 'dolphin' as IconName,
    color: '#06B6D4',
    accent: 'from-cyan-500 to-teal-600',
    faculty: { th: 'คณะดิจิทัลมีเดีย', en: 'Faculty of Digital Media' },
    shortFaculty: { th: 'ดิจิทัลมีเดีย', en: 'Digital Media' },
  },
  {
    id: 'raccoon',
    label: 'Shadow Raccoon #05',
    name: 'Shadow Raccoon #05',
    icon: 'raccoon' as IconName,
    color: '#10B981',
    accent: 'from-emerald-500 to-green-600',
    faculty: { th: 'คณะบริหารธุรกิจ', en: 'Faculty of Business Admin' },
    shortFaculty: { th: 'บริหารธุรกิจ', en: 'Business Admin' },
  },
  {
    id: 'lion',
    label: 'Brave Lion #99',
    name: 'Brave Lion #99',
    icon: 'lion' as IconName,
    color: '#EF4444',
    accent: 'from-rose-500 to-red-600',
    faculty: { th: 'คณะนิเทศศาสตร์', en: 'Faculty of Comm. Arts' },
    shortFaculty: { th: 'นิเทศศาสตร์', en: 'Comm. Arts' },
  },
]

type QuestionCategory = 'sos' | 'quest' | 'spark'
type DiscordChannel = 'all' | 'sos' | 'quest' | 'spark' | 'oracle'

const TEXT = {
  th: {
    roomTitle: 'หอใจ · ศาลานิรนามกิลด์มาสเตอร์ (Student Wellness Lounge)',
    roomEnteredBadge: 'เปิดประตูเข้าสู่ห้องเรียบร้อย · Door Status: Connected',
    roomDesc: 'ห้องสนทนานิรนามแบบ Discord สำหรับเปิดใจถามทุกข้อสงสัยกับอาจารย์ผู้สอน โดยไม่มีใครรู้ชื่อจริงของคุณ',
    sanctuaryTitle: 'SPU Heart Sanctuary',
    serverVerified: 'พื้นที่ปลอดภัย 100% ปลอดตัวตน',
    channelsHeader: 'ช่องข้อความ (TEXT CHANNELS)',
    chanAll: 'กระทู้ทั้งหมด',
    chanSos: 'เร่งด่วน / SOS',
    chanQuest: 'ข้อสงสัยเชิงลึก',
    chanSpark: 'ไอเดียสร้างสรรค์',
    chanOracle: 'คำตอบจากอาจารย์',
    myPersonaHeader: 'ตัวตนแฝงของคุณ (MYSTERY MASK)',
    clickToSwitch: 'คลิกเพื่อสลับตัวตน',
    maskedStatus: 'สวมหน้ากากปริศนา · ไร้ชื่อจริง',
    xpRewardBadge: '+15 XP ต่อคำถาม',
    placeholder: 'พิมพ์ข้อความถามในห้องนิรนาม... (กด Enter เพื่อส่งคำถาม)',
    submittingAs: 'กำลังส่งในนาม',
    sendBtn: 'ส่งข้อความนิรนาม',
    sentSuccess: '✓ ส่งคำถามลึกลับสำเร็จแล้ว! (รับ +15 XP)',
    safeBadge: 'ส่งผ่านม่านเวทมนตร์ ปลอดภัย 100%',
    sameQuestion: 'สงสัยเหมือนกัน',
    teacherAdvice: 'คำตอบจากกิลด์มาสเตอร์ (อาจารย์ผู้สอน):',
    teacherPlaceholder: 'ตอบคำถามของนักศึกษาในฐานะกิลด์มาสเตอร์…',
    replyBtn: 'ตอบกลับ & ให้คะแนน Insight',
    onlineGuildMaster: 'กิลด์มาสเตอร์ (อาจารย์)',
    activeScholars: 'นักศึกษาปริศนาในห้อง',
    hologramTerminal: 'โฮโลแกรมตัวตน 3D (HOLO CORE)',
    holoSub: 'ฉายภาพตัวตนแฝงแบบเรียลไทม์',
    holoDragHint: 'หมุนสำรวจ 3D ได้',
    securityRules: 'กฎความปลอดภัยแห่งศาลานิรนาม',
    rule1: '1. ซ่อนตัวตนจริง 100%: อาจารย์จะเห็นเฉพาะชื่อตัวละครปริศนา',
    rule2: '2. ถามได้ทุกเรื่อง: ไม่มีคำถามไหนไร้สาระ กล้าถามเพื่อเรียนรู้',
    rule3: '3. รับค่าประสบการณ์: ถามได้ +15 XP, กดเห็นด้วยได้ +5 XP',
    searchPlaceholder: 'ค้นหาคำถามในห้อง...',
    filterAll: 'ทั้งหมด',
    filterAnswered: 'ตอบแล้ว',
    filterUnanswered: 'รอคำตอบ',
    noQuestions: 'ยังไม่มีคำถามในหมวดหมู่นี้ เป็นคนแรกที่เริ่มเปิดประเด็นเลย!',
  },
  en: {
    roomTitle: 'Heart Dorm · Guild Master Secret Sanctuary (Wellness Lounge)',
    roomEnteredBadge: 'Door Opened · Chamber Status: Connected',
    roomDesc: 'A Discord-style anonymous sanctuary to ask professors anything under a mystery mask with zero fear.',
    sanctuaryTitle: 'SPU Heart Sanctuary',
    serverVerified: '100% Encrypted Safe Zone',
    channelsHeader: 'TEXT CHANNELS',
    chanAll: 'all-inquiries',
    chanSos: 'urgent-sos',
    chanQuest: 'deep-inquiry',
    chanSpark: 'creative-spark',
    chanOracle: 'oracle-answers',
    myPersonaHeader: 'YOUR MYSTERY PERSONA',
    clickToSwitch: 'Click to switch disguise',
    maskedStatus: 'Masked Disguise · 0 Identity Leak',
    xpRewardBadge: '+15 XP per question',
    placeholder: 'Message anonymous sanctuary... (Press Enter to submit)',
    submittingAs: 'Posting as',
    sendBtn: 'Send Secret Inquiry',
    sentSuccess: '✓ Secret inquiry submitted successfully! (+15 XP)',
    safeBadge: '100% Encrypted & Anonymous',
    sameQuestion: 'Wondering too',
    teacherAdvice: 'Guild Master Wisdom (Instructor):',
    teacherPlaceholder: 'Answer this inquiry as Guild Master…',
    replyBtn: 'Reply & Award XP',
    onlineGuildMaster: 'GUILD MASTER (FACULTY)',
    activeScholars: 'ONLINE MYSTERY SCHOLARS',
    hologramTerminal: '3D HOLOGRAM CHAMBER',
    holoSub: 'Real-time Identity Projection',
    holoDragHint: 'Interactive 3D Preview',
    securityRules: 'SANCTUARY PRIVACY PROTOCOL',
    rule1: '1. Zero Identity Logs: Professors see only your mystery avatar.',
    rule2: '2. Psychological Safety: Ask tough or simple questions freely.',
    rule3: '3. Earn XP Rewards: +15 XP for asking, +5 XP per upvote.',
    searchPlaceholder: 'Search inquiries in this room...',
    filterAll: 'All Threads',
    filterAnswered: 'Answered',
    filterUnanswered: 'Unanswered',
    noQuestions: 'No questions in this channel yet. Be the first to spark the fire!',
  },
}

// ─────────────────────────────────────────────────────────────
// 3D Hologram Projection Core (Three.js inside Canvas)
// ─────────────────────────────────────────────────────────────
function HologramScene({ color }: { color: string }) {
  const coreRef = useRef<THREE.Group>(null)
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const particleCount = 45
  const [positions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const radius = 0.2 + Math.random() * 0.8
      const theta = Math.random() * Math.PI * 2
      pos[i * 3] = Math.cos(theta) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0
      pos[i * 3 + 2] = Math.sin(theta) * radius
    }
    return [pos]
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()

    // Smooth bobbing & multi-axis rotation of the hologram core
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 1.8) * 0.1 + 0.1
      coreRef.current.rotation.y += delta * 0.7
      coreRef.current.rotation.x = Math.sin(t * 0.9) * 0.15
    }

    // Orbiting gyroscope rings
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 1.1
      ring1Ref.current.rotation.x += delta * 0.4
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.9
      ring2Ref.current.rotation.z -= delta * 0.5
    }

    // Drifting holographic particles
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.attributes.position
      const arr = posAttr.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += delta * 0.45
        if (arr[i * 3 + 1] > 1.2) {
          arr[i * 3 + 1] = -1.0
        }
      }
      posAttr.needsUpdate = true
    }
  })

  const threeColor = useMemo(() => new THREE.Color(color), [color])

  return (
    <group position={[0, -0.05, 0]}>
      {/* Metallic pedestal base */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[1.3, 1.45, 0.18, 32]} />
        <meshStandardMaterial color="#0c1024" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Outer Pedestal Neon Ring */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.2, 32]} />
        <meshBasicMaterial color={threeColor} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner Cyan Emitter Ring */}
      <mesh position={[0, -1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.6, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Holographic light cylinder / scanline beam */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.05, 1.25, 2.3, 32, 1, true]} />
        <meshBasicMaterial
          color={threeColor}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Horizontal Laser Scanline Rings */}
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.02, 32]} />
        <meshBasicMaterial color={threeColor} transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.08, 1.12, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Swirling energy particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          color={threeColor}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Floating 3D Holographic Core */}
      <group ref={coreRef}>
        {/* Faceted inner gem */}
        <mesh>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={threeColor}
            emissive={threeColor}
            emissiveIntensity={0.65}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>

        {/* Outer glowing wireframe cage */}
        <mesh scale={1.14}>
          <dodecahedronGeometry args={[0.48, 0]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Orbiting Gyroscope Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.82, 0.02, 16, 48]} />
          <meshBasicMaterial color={threeColor} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.95, 0.018, 16, 48]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Gamified Heart Dorm: Clean, Desktop-First Discord 3D Holographic Cyber Sanctuary.
 * Incorporates a live 3D hologram chamber, Discord channel sidebar, Discord forum feed,
 * teacher reply Oracle card, and member list in full PC desktop ergonomics.
 */
export default function HeartDorm() {
  const { role, posts, addPost, addReply, addXP, lang } = useApp()
  const t = TEXT[lang] || TEXT.en
  const anon = posts.filter((p) => p.isAnonymous)

  const [activeChannel, setActiveChannel] = useState<DiscordChannel>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'answered' | 'unanswered'>('all')
  const [draft, setDraft] = useState('')
  const [selectedPersona, setSelectedPersona] = useState(MYSTERY_AVATARS[0])
  const [category, setCategory] = useState<QuestionCategory>('sos')
  const [sent, setSent] = useState(false)
  const [upvotes, setUpvotes] = useState<Record<string, number>>({})

  const handleUpvote = (postId: string) => {
    setUpvotes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }))
    playCoinSound()
    addXP(5) // Award XP for voting/curating
  }

  const handleChannelSelect = (ch: DiscordChannel) => {
    playClickSound()
    setActiveChannel(ch)
  }

  const handlePersonaSelect = (m: (typeof MYSTERY_AVATARS)[0]) => {
    playXPSparkle()
    setSelectedPersona(m)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!draft.trim()) return

    const prefix =
      category === 'sos'
        ? lang === 'en'
          ? '[Urgent / SOS] '
          : '[SOS เร่งด่วน] '
        : category === 'quest'
        ? lang === 'en'
          ? '[Deep Inquiry] '
          : '[ข้อสงสัยลึกซึ้ง] '
        : lang === 'en'
        ? '[Creative Spark] '
        : '[ไอเดียสร้างสรรค์] '

    const facultyStr = selectedPersona.shortFaculty[lang] || selectedPersona.shortFaculty.en
    const senderSuffix =
      lang === 'en'
        ? ` — Posted by ${selectedPersona.label} (${facultyStr})`
        : ` — ส่งโดย ${selectedPersona.label} (${facultyStr})`

    addPost(`${prefix}${draft}${senderSuffix}`, true, 'ฟีดแบค')
    playXPSparkle()
    setDraft('')
    setSent(true)
    addXP(15) // Reward for asking a good question
    setTimeout(() => setSent(false), 3500)
  }

  // Filter inquiries based on active channel and search query
  const filteredPosts = useMemo(() => {
    return anon.filter((p) => {
      // Channel filtering
      if (activeChannel === 'sos' && !p.body.includes('SOS') && !p.body.includes('Urgent')) return false
      if (activeChannel === 'quest' && !p.body.includes('Deep') && !p.body.includes('ข้อสงสัย')) return false
      if (activeChannel === 'spark' && !p.body.includes('Creative') && !p.body.includes('ไอเดีย')) return false
      if (activeChannel === 'oracle' && (!p.replies || p.replies.length === 0)) return false

      // Status filter
      if (filterMode === 'answered' && (!p.replies || p.replies.length === 0)) return false
      if (filterMode === 'unanswered' && p.replies && p.replies.length > 0) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return p.body.toLowerCase().includes(q) || (p.alias && p.alias.toLowerCase().includes(q))
      }

      return true
    })
  }, [anon, activeChannel, filterMode, searchQuery])

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 font-campus text-white select-none">
      {/* ── Top Atmospheric Room Entrance Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/30 bg-gradient-to-r from-[#0d1326] via-[#141b33] to-[#0f172a] p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-400/40 bg-teal-500/20 text-2xl shadow-inner shadow-teal-500/30">
              <GameIcon name="chat" className="text-teal-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-teal-300 border border-teal-400/30">
                  <DoorOpen className="h-3 w-3" /> {t.roomEnteredBadge}
                </span>
                <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-400/30">
                  SPU · BLDG 6
                </span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> 100% Encrypted
                </span>
              </div>
              <h1 className="mt-1 text-base sm:text-lg font-black tracking-wide text-white">
                {t.roomTitle}
              </h1>
              <p className="text-xs text-white/70 max-w-2xl leading-relaxed mt-0.5">
                {t.roomDesc}
              </p>
            </div>
          </div>

          {/* Active Disguise Pill */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 px-3 self-start md:self-auto backdrop-blur-md">
            <GameIcon name={selectedPersona.icon} className="text-2xl" style={{ color: selectedPersona.color }} />
            <div className="text-left">
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                {t.submittingAs}
              </p>
              <p className="text-xs font-black text-teal-300">
                {selectedPersona.label}
              </p>
            </div>
            <button
              onClick={() => {
                const nextIdx = (MYSTERY_AVATARS.findIndex((m) => m.id === selectedPersona.id) + 1) % MYSTERY_AVATARS.length
                handlePersonaSelect(MYSTERY_AVATARS[nextIdx])
              }}
              className="ml-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 p-1 text-[10px] font-bold border border-teal-400/30 transition-all cursor-pointer"
              title={t.clickToSwitch}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Discord PC 3-Column Architecture ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── LEFT COLUMN: Discord Channels & Persona Switcher (3 cols) ── */}
        <aside className="lg:col-span-3 space-y-3.5">
          {/* Server Identity Card */}
          <div className="rounded-2xl border border-white/10 bg-[#1e1f22]/90 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-lg border border-teal-400/30">
                <GameIcon name="shield" className="text-teal-200" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-black text-white truncate flex items-center gap-1">
                  {t.sanctuaryTitle}
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                </h2>
                <p className="text-[10px] text-teal-300/80 font-medium truncate">
                  {t.serverVerified}
                </p>
              </div>
            </div>

            {/* Channels Header */}
            <div className="mt-3">
              <p className="px-2 text-[10px] font-black uppercase tracking-wider text-white/45 mb-1.5 flex items-center justify-between">
                <span>{t.channelsHeader}</span>
                <span className="text-white/30 text-[9px]">{anon.length} Inquiries</span>
              </p>

              {/* Channel list */}
              <div className="space-y-1">
                {[
                  { id: 'all', icon: Hash, label: t.chanAll, count: anon.length, color: 'text-teal-400' },
                  { id: 'sos', icon: AlertTriangle, label: t.chanSos, count: anon.filter((p) => p.body.includes('SOS') || p.body.includes('Urgent')).length, color: 'text-rose-400' },
                  { id: 'quest', icon: HelpCircle, label: t.chanQuest, count: anon.filter((p) => p.body.includes('Deep') || p.body.includes('ข้อสงสัย')).length, color: 'text-amber-400' },
                  { id: 'spark', icon: Lightbulb, label: t.chanSpark, count: anon.filter((p) => p.body.includes('Creative') || p.body.includes('ไอเดีย')).length, color: 'text-emerald-400' },
                  { id: 'oracle', icon: Sparkles, label: t.chanOracle, count: anon.filter((p) => p.replies && p.replies.length > 0).length, color: 'text-purple-400' },
                ].map((ch) => {
                  const Icon = ch.icon
                  const active = activeChannel === ch.id
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleChannelSelect(ch.id as DiscordChannel)}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-teal-500/20 text-teal-200 border border-teal-400/40 shadow-sm'
                          : 'text-white/65 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-teal-300' : ch.color}`} />
                        <span className="truncate">{ch.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold rounded-full px-2 py-0.2 ${
                        active ? 'bg-teal-400/30 text-teal-100' : 'bg-white/10 text-white/50'
                      }`}>
                        {ch.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mystery Persona Switcher Drawer */}
          <div className="rounded-2xl border border-white/10 bg-[#1e1f22]/90 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-teal-400" />
                {t.myPersonaHeader}
              </span>
              <span className="text-[9px] text-white/40">{t.clickToSwitch}</span>
            </div>

            <div className="space-y-1.5">
              {MYSTERY_AVATARS.map((m) => {
                const isSelected = selectedPersona.id === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => handlePersonaSelect(m)}
                    className={`w-full flex items-center gap-2.5 rounded-xl p-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border border-teal-400/50 bg-teal-500/20 shadow-md scale-[1.01]'
                        : 'border border-white/5 bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    <GameIcon name={m.icon} className="text-xl" style={{ color: m.color }} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-teal-200' : 'text-white'}`}>
                        {m.name}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">
                        {m.shortFaculty[lang]}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_#2dd4bf] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Bottom active pill */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.maskedStatus}
              </span>
              <span className="text-amber-300 font-bold">{t.xpRewardBadge}</span>
            </div>
          </div>
        </aside>

        {/* ── CENTER COLUMN: Discord Inquiries Feed & Input (6 cols) ── */}
        <main className="lg:col-span-6 space-y-3.5">
          {/* Channel Header Bar */}
          <div className="rounded-2xl border border-white/10 bg-[#2b2d31]/90 p-3 sm:px-4 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Hash className="h-4 w-4 text-teal-400 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs font-black text-white truncate">
                  {activeChannel === 'all'
                    ? t.chanAll
                    : activeChannel === 'sos'
                    ? t.chanSos
                    : activeChannel === 'quest'
                    ? t.chanQuest
                    : activeChannel === 'spark'
                    ? t.chanSpark
                    : t.chanOracle}
                </h3>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-white/40 border-l border-white/15 pl-2 truncate max-w-xs">
                {filteredPosts.length} questions logged
              </span>
            </div>

            {/* Search and Filter mode chips */}
            <div className="flex items-center gap-2 text-[11px] flex-wrap">
              <div className="relative flex items-center">
                <Search className="h-3 w-3 text-white/40 absolute left-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="rounded-lg border border-white/10 bg-black/30 pl-6 pr-2 py-0.5 text-[11px] text-white placeholder-white/40 outline-none focus:border-teal-400 w-32 sm:w-40"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`rounded-lg px-2 py-0.5 font-bold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.filterAll}
                </button>
                <button
                  onClick={() => setFilterMode('answered')}
                  className={`rounded-lg px-2 py-0.5 font-bold transition-all cursor-pointer ${
                    filterMode === 'answered'
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.filterAnswered}
                </button>
                <button
                  onClick={() => setFilterMode('unanswered')}
                  className={`rounded-lg px-2 py-0.5 font-bold transition-all cursor-pointer ${
                    filterMode === 'unanswered'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t.filterUnanswered}
                </button>
              </div>
            </div>
          </div>

          {/* Question Feed */}
          <div className="space-y-3 max-h-[calc(100vh-320px)] min-h-[360px] overflow-y-auto pr-1">
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#2b2d31]/50 p-10 text-center text-white/60">
                <MessageSquare className="h-10 w-10 mx-auto text-teal-400/40 mb-2" />
                <p className="text-xs font-bold text-white/80">{t.noQuestions}</p>
                <p className="text-[11px] text-white/50 mt-1">
                  Type your anonymous inquiry in the box below to receive guidance!
                </p>
              </div>
            ) : (
              filteredPosts.map((p) => {
                const votes = (upvotes[p.id] || 0) + (p.reactions?.idea || 2)
                const hasOracleReply = p.replies && p.replies.length > 0

                // Guess category icon from title
                const isSos = p.body.includes('SOS') || p.body.includes('Urgent')
                const isQuest = p.body.includes('Deep') || p.body.includes('ข้อสงสัย')
                const isSpark = p.body.includes('Creative') || p.body.includes('ไอเดีย')

                return (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-white/10 bg-[#2b2d31]/90 p-4 shadow-lg backdrop-blur-md transition-all hover:border-teal-500/30 hover:bg-[#313338]"
                  >
                    {/* Discord message author bar */}
                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 text-lg border border-teal-400/30 shadow-inner">
                          <GameIcon
                            className="text-teal-200"
                            name={
                              p.alias?.includes('Fox')
                                ? 'fox'
                                : p.alias?.includes('Owl')
                                  ? 'owl'
                                  : p.alias?.includes('Dolphin')
                                    ? 'dolphin'
                                    : p.alias?.includes('Raccoon')
                                      ? 'raccoon'
                                      : p.alias?.includes('Lion')
                                        ? 'lion'
                                        : 'mask'
                            }
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-teal-300">
                              {p.alias ?? t.activeScholars}
                            </span>
                            {isSos && (
                              <span className="rounded-md bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                                <GameIcon name="dot" className="mr-0.5 fill-current" />
                                SOS
                              </span>
                            )}
                            {isQuest && (
                              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                                <GameIcon name="dot" className="mr-0.5 fill-current" />
                                Deep Inquiry
                              </span>
                            )}
                            {isSpark && (
                              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                                <GameIcon name="dot" className="mr-0.5 fill-current" />
                                Creative Spark
                              </span>
                            )}
                            <span className="text-[10px] text-white/40">
                              {p.createdAt}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5">
                            <Lock className="h-2.5 w-2.5 text-teal-400" />
                            100% Encrypted Mask
                          </span>
                        </div>
                      </div>

                      {/* Flame Upvote Bounty Button */}
                      <button
                        onClick={() => handleUpvote(p.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
                        title={lang === 'en' ? 'Upvote (+5 XP)' : 'กดเห็นด้วย (+5 XP)'}
                      >
                        <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>{votes} {t.sameQuestion}</span>
                      </button>
                    </div>

                    {/* Question Content */}
                    <p className="mt-3 text-xs leading-relaxed text-white/90 whitespace-pre-wrap pl-1 font-medium">
                      {p.body}
                    </p>

                    {/* Threaded Guild Master Oracle Responses */}
                    {hasOracleReply && (
                      <div className="mt-3.5 space-y-2 border-t border-white/10 pt-3">
                        {p.replies?.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-[#1e1f22] to-[#16182e] p-3 shadow-inner"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                                {r.authorRole === 'teacher' ? t.teacherAdvice : r.authorName}
                              </span>
                              <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[9px] font-black text-amber-300 border border-amber-400/30">
                                <GameIcon name="star" className="mr-0.5 fill-current" />
                                Verified Guild Master
                              </span>
                            </div>
                            <p className="text-xs text-white/95 leading-relaxed pl-3.5 border-l-2 border-amber-400/60">
                              {r.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Teacher Reply Input (Visible in teacher mode) */}
                    {role === 'teacher' && (
                      <TeacherReplyBox
                        onSend={(body) => addReply(p.id, body)}
                        placeholder={t.teacherPlaceholder}
                        replyText={t.replyBtn}
                      />
                    )}
                  </article>
                )
              })
            )}
          </div>

          {/* Discord-Style Bottom Input Bar */}
          {role === 'student' && (
            <div className="rounded-2xl border border-white/10 bg-[#1e1f22]/95 p-3.5 shadow-2xl backdrop-blur-xl space-y-2.5">
              {/* Category tags selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                    Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound()
                      setCategory('sos')
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                      category === 'sos'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" /> SOS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound()
                      setCategory('quest')
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                      category === 'quest'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    <HelpCircle className="h-3 w-3" /> Deep Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound()
                      setCategory('spark')
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                      category === 'spark'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    <Lightbulb className="h-3 w-3" /> Creative Spark
                  </button>
                </div>

                <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> {t.xpRewardBadge}
                </span>
              </div>

              {/* Textarea message box */}
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="relative">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    rows={2}
                    placeholder={`${t.placeholder} (${selectedPersona.label})`}
                    className="w-full resize-none rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-teal-400 font-bold flex items-center gap-1">
                    {sent ? t.sentSuccess : t.safeBadge}
                  </span>

                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-xs font-black text-white shadow-lg hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{t.sendBtn}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* ── RIGHT COLUMN: 3D Hologram Chamber & Member Roster (3 cols) ── */}
        <aside className="lg:col-span-3 space-y-3.5">
          {/* 3D Hologram Projection Widget */}
          <div className="rounded-2xl border border-teal-500/30 bg-[#1e1f22]/90 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                {t.hologramTerminal}
              </span>
              <span className="text-[9px] text-white/40">{t.holoSub}</span>
            </div>

            {/* 3D Canvas Box */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-teal-500/30 bg-[#0a0d1f] shadow-inner">
              <Canvas
                camera={{ position: [0, 0.4, 3.2], fov: 42 }}
                style={{ width: '100%', height: '100%' }}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.9} />
                <pointLight position={[0, 2, 2.5]} intensity={2.5} color={selectedPersona.color} />
                <pointLight position={[-1.5, -1, 1]} intensity={1.5} color="#00e5ff" />
                <HologramScene color={selectedPersona.color} />
              </Canvas>

              {/* HUD scanline and overlay badges */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(0,229,255,0.06)_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="pointer-events-none absolute top-2 left-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono font-bold text-teal-300 border border-teal-400/30">
                [HOLO ACTIVE // 60 FPS]
              </div>
              <div className="pointer-events-none absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-white/60 border border-white/10">
                432 MHz
              </div>

              {/* Bottom active persona name */}
              <div className="pointer-events-none absolute bottom-2 inset-x-2 rounded-lg bg-black/70 p-1.5 text-center border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-black text-white leading-tight">
                  {selectedPersona.label}
                </p>
                <p className="text-[9px] text-teal-300 font-semibold truncate">
                  {selectedPersona.faculty[lang]}
                </p>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-white/45">
              {t.holoDragHint}
            </p>
          </div>

          {/* Discord Member List: Guild Master & Mystery Scholars */}
          <div className="rounded-2xl border border-white/10 bg-[#1e1f22]/90 p-3.5 shadow-xl backdrop-blur-md">
            {/* Guild Master Section */}
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1">
                <span>{t.onlineGuildMaster}</span>
                <span className="text-white/40">· 1</span>
              </p>
              <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2">
                <GameIcon name="teacher" className="text-xl text-amber-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-amber-300 truncate">
                    อ.ดร.ธนพร (Guild Master)
                  </p>
                  <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Listening in Sanctuary
                  </p>
                </div>
              </div>
            </div>

            {/* Mystery Scholars Section */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1">
                <span>{t.activeScholars}</span>
                <span className="text-white/40">· {MYSTERY_AVATARS.length}</span>
              </p>

              <div className="space-y-1">
                {MYSTERY_AVATARS.map((m) => {
                  const isYou = selectedPersona.id === m.id
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                        isYou ? 'bg-white/10 text-white font-bold' : 'text-white/60'
                      }`}
                    >
                      <GameIcon name={m.icon} className="text-sm" style={{ color: m.color }} />
                      <span className="truncate flex-1 text-[11px]">
                        {m.name} {isYou && <span className="text-teal-300 text-[10px]">(You)</span>}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sanctuary Privacy Rules Card */}
            <div className="mt-3.5 pt-3 border-t border-white/10 text-[10px] text-white/60 space-y-1 leading-relaxed">
              <p className="font-black text-white/80 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Shield className="h-3 w-3 text-teal-400" /> {t.securityRules}
              </p>
              <p>{t.rule1}</p>
              <p>{t.rule2}</p>
              <p className="text-amber-300 font-bold">{t.rule3}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function TeacherReplyBox({
  onSend,
  placeholder,
  replyText,
}: {
  onSend: (body: string) => void
  placeholder: string
  replyText: string
}) {
  const [text, setText] = useState('')
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onSend(text)
        playLevelUpSound()
        setText('')
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-400 placeholder-white/40"
      />
      <button
        type="submit"
        className="rounded-xl bg-amber-500 px-4 text-xs font-bold text-black hover:bg-amber-400 shadow cursor-pointer transition-all"
      >
        {replyText}
      </button>
    </form>
  )
}
