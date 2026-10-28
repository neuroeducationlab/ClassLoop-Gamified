import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Clock,
  Crown,
  Flame,
  RotateCcw,
  ShieldAlert,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import Section, { CoinChip, XPChip } from './Section'
import {
  playCoinSound,
  playCorrectSound,
  playLevelUpSound,
  playStreakSound,
  playWrongSound,
  playXPSparkle,
} from '../soundEngine'

const XP_CORRECT = 15
const BOSS_TOTAL_XP = 150
const BOSS_TOTAL_COINS = 50

function classmateXP(seed: number) {
  return 30 + ((seed * 53) % 150)
}

const BOSS_EXAM_QUESTIONS = [
  {
    q: 'เมื่อเจรจาธุรกิจกับคู่ค้าในประเทศญี่ปุ่น (High-Context Culture) พฤติกรรมใดแสดงถึงความเข้าใจวัฒนธรรมถูกต้องที่สุด?',
    qEn: 'In high-context Japanese business negotiations, which behavior best demonstrates cultural intelligence?',
    options: [
      { text: 'กดดันให้เซ็นสัญญาปิดดีลในห้องประชุมทันที', textEn: 'Pressuring for an immediate on-the-spot contract signature', correct: false },
      { text: 'ให้ความสำคัญกับการสร้างสายสัมพันธ์ ความเงียบ และฉันทามติร่วมกัน (Nemawashi)', textEn: 'Valuing relationship-building, deliberate pauses, and consensus (Nemawashi)', correct: true },
      { text: 'โต้เถียงข้อตกลงอย่างเปิดเผยเพื่อแสดงความโปร่งใส', textEn: 'Aggressively disputing clauses in public to show transparency', correct: false },
      { text: 'หลีกเลี่ยงการพบหน้าและเน้นส่งข้อความสั้นเท่านั้น', textEn: 'Avoiding in-person meetings and relying solely on brief text pings', correct: false },
    ],
  },
  {
    q: 'ตามมิติวัฒนธรรมของ Hofstede มิติ "Power Distance (PDI)" สูง บ่งบอกถึงสิ่งใด?',
    qEn: 'According to Hofstede’s Cultural Dimensions, a high "Power Distance Index (PDI)" indicates:',
    options: [
      { text: 'องค์กรที่พนักงานระดับล่างมีสิทธิ์ยับยั้งคำสั่งของผู้บริหารได้เสรี', textEn: 'Organizations where lower-tier staff can freely veto executive decisions', correct: false },
      { text: 'การยอมรับและคาดหวังความไม่เท่าเทียมทางอำนาจและการรวมศูนย์การตัดสินใจ', textEn: 'Acceptance and expectation of hierarchical authority and centralized decisions', correct: true },
      { text: 'การไม่มีหัวหน้างานและทุกคนเป็นผู้ร่วมก่อตั้งเท่าเทียมกัน', textEn: 'A flat structure with zero managers where everyone shares co-founder equity', correct: false },
      { text: 'การไม่คำนึงถึงอาวุโสในการร่วมงาน', textEn: 'Total disregard for seniority in workplace hierarchy', correct: false },
    ],
  },
  {
    q: 'กลยุทธ์ "Glocalization" ในการบริหารธุรกิจระหว่างประเทศหมายถึงข้อใด?',
    qEn: 'What does the international business strategy "Glocalization" refer to?',
    options: [
      { text: 'การยกเลิกการขยายตลาดไปต่างประเทศทั้งหมด', textEn: 'Withdrawing completely from all international markets', correct: false },
      { text: 'คิดเชิงสากล แต่ปรับผลิตภัณฑ์ให้เข้ากับวัฒนธรรมท้องถิ่น (Think Global, Act Local)', textEn: 'Thinking globally while adapting products to local culture (Think Global, Act Local)', correct: true },
      { text: 'การขายสินค้าแบบเดียวกัน 100% โดยห้ามเปลี่ยนแปลงรสชาติหรือฉลาก', textEn: 'Selling identical goods without modifying flavor, packaging, or messaging', correct: false },
      { text: 'การผลิตเฉพาะเพื่อการบริโภคในครัวเรือน', textEn: 'Producing strictly for cottage household consumption', correct: false },
    ],
  },
  {
    q: 'การสื่อสารแบบ Low-Context (เช่น สหรัฐอเมริกา, เยอรมนี) มีจุดเด่นคืออะไร?',
    qEn: 'What is a core characteristic of Low-Context Communication (e.g. USA, Germany)?',
    options: [
      { text: 'ความหมายทั้งหมดถูกถ่ายทอดอย่างชัดเจน ตรงไปตรงมาผ่านถ้อยคำที่พูด', textEn: 'Meaning is explicitly, clearly, and directly coded into the spoken words', correct: true },
      { text: 'เน้นการอ่านแววตาและการนิ่งเงียบเพื่อส่งสาร', textEn: 'Relying primarily on eye movement and prolonged silence to convey meaning', correct: false },
      { text: 'ห้ามพูดตรงๆ ต้องพูดเปรียบเทียบเป็นสำนวนเสมอ', textEn: 'Strict prohibition of direct speech, requiring metaphors only', correct: false },
      { text: 'การหลีกเลี่ยงการทำสัญญาเป็นลายลักษณ์อักษร', textEn: 'Avoiding any written or documented contracts', correct: false },
    ],
  },
  {
    q: 'ในภาวะวิกฤตข้ามวัฒนธรรม (Cross-Cultural Crisis) กุญแจสำคัญที่สุดของผู้นำสากลคืออะไร?',
    qEn: 'In a cross-cultural crisis, what is the most vital leadership asset?',
    options: [
      { text: 'ตำหนิความเชื่อท้องถิ่นในที่ประชุมใหญ่', textEn: 'Blaming local customs in a public all-hands assembly', correct: false },
      { text: 'การรับฟังอย่างมี Empathy สื่อสารโปร่งใส และเคารพคุณค่าของแต่ละฝ่าย', textEn: 'Empathetic active listening, transparent dialogue, and respect for cultural values', correct: true },
      { text: 'ตัดการติดต่อสื่อสารกับสาขาต่างประเทศ', textEn: 'Cutting off communications with overseas branch offices', correct: false },
      { text: 'บังคับใช้วัฒนธรรมสำนักงานใหญ่โดยไม่รับฟัง', textEn: 'Forcefully imposing headquarter norms without consultation', correct: false },
    ],
  },
]

/**
 * Arena: High-Tech Cyber Colosseum & Brain Gym (Building 12)
 * Features real-time flashcard rapid fire matching, combo streaks,
 * final boss 60-second exam countdown, and live classroom leaderboard.
 */
export default function Arena() {
  const {
    generatedContent,
    students,
    currentStudent,
    avatar,
    studentXP,
    addXP,
    addCoins,
    lang,
  } = useApp()
  const cards = generatedContent.flashcards
  const [activeTab, setActiveTab] = useState<'flashcards' | 'boss'>('flashcards')

  const board = useMemo(() => {
    const rows = students.map((s) =>
      s.id === currentStudent.id
        ? {
            id: s.id,
            name: avatar?.nickname ?? s.nickname,
            faculty: s.faculty,
            xp: studentXP,
            me: true,
          }
        : {
            id: s.id,
            name: s.nickname,
            faculty: s.faculty,
            xp: classmateXP(s.avatarSeed),
            me: false,
          },
    )
    return rows.sort((a, b) => b.xp - a.xp)
  }, [students, currentStudent.id, avatar?.nickname, studentXP])

  const myRank = board.findIndex((r) => r.me) + 1
  const top = board.slice(0, 8)
  const meRow = board[myRank - 1]
  const level = Math.max(1, Math.floor(studentXP / 100))

  return (
    <>
      {/* ── Top Cybernetic Stat Pods ── */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatPod
          icon={<Zap className="h-5 w-5 text-amber-300" />}
          label={lang === 'th' ? 'XP ของฉัน' : 'My Total XP'}
          value={studentXP}
          accent="amber"
        />
        <StatPod
          icon={<Trophy className="h-5 w-5 text-pink-300" />}
          label={lang === 'th' ? 'อันดับในห้อง' : 'Class Rank'}
          value={`#${myRank}`}
          accent="pink"
        />
        <StatPod
          icon={<Flame className="h-5 w-5 text-purple-300" />}
          label={lang === 'th' ? 'ระดับเลเวล' : 'Cyber Level'}
          value={`Lv.${level}`}
          accent="purple"
        />
      </div>

      {/* ── Mode Switcher Tab ── */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-black/40 p-1.5 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer',
            activeTab === 'flashcards'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25'
              : 'text-white/60 hover:text-white hover:bg-white/5',
          )}
        >
          <Swords className="h-4 w-4" />
          <span>{lang === 'th' ? 'ลานฝึกคำศัพท์ (Flashcards)' : 'Flashcard Arena'}</span>
        </button>
        <button
          onClick={() => setActiveTab('boss')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer',
            activeTab === 'boss'
              ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
              : 'text-white/60 hover:text-white hover:bg-white/5',
          )}
        >
          <ShieldAlert className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>{lang === 'th' ? 'บอสข้อสอบปลายภาค (Boss Rush)' : 'Boss Rush Exam'}</span>
        </button>
      </div>

      {/* ── Active Game Mode ── */}
      {activeTab === 'flashcards' ? (
        <Section
          title={lang === 'th' ? 'ลานฝึกสมองประลองคำศัพท์ · Brain Gym' : 'Cyber Flashcard Speed Match'}
          sub={
            lang === 'th'
              ? `เลือกความหมายที่ถูกต้อง · รับ +${XP_CORRECT} XP & +5 Coins ต่อข้อ`
              : `Match terms to correct definitions · Earn +${XP_CORRECT} XP & +5 Coins`
          }
          icon={<Swords className="h-4 w-4 text-pink-400" />}
        >
          <WordMatch
            cards={cards}
            onCorrect={() => {
              addXP(XP_CORRECT)
              addCoins(5)
            }}
            lang={lang}
          />
        </Section>
      ) : (
        <Section
          title={lang === 'th' ? 'ศึกบอสข้อสอบจำลองปลายภาค · Boss Rush' : 'Final Boss Exam Rush'}
          sub={
            lang === 'th'
              ? 'โค่นบอสใน 60 วินาที ตอบถูกลดเลือดบอส 20% · ชนะรับ +150 XP & +50 Coins'
              : 'Defeat the Boss in 60s! Correct answers deal 20% DMG · Win +150 XP & +50 Coins'
          }
          icon={<ShieldAlert className="h-4 w-4 text-amber-400" />}
        >
          <BossRushExam
            lang={lang}
            onVictory={() => {
              addXP(BOSS_TOTAL_XP)
              addCoins(BOSS_TOTAL_COINS)
            }}
          />
        </Section>
      )}

      {/* ── Hall of Champions: Classroom Leaderboard ── */}
      <Section
        title={lang === 'th' ? 'ทำเนียบเกียรติยศ · Hall of Champions' : 'Classroom Leaderboard'}
        sub={
          lang === 'th'
            ? 'ตารางจัดอันดับประจำสัปดาห์แบบเรียลไทม์'
            : 'Live weekly standings of classmates'
        }
        icon={<Crown className="h-4 w-4 text-amber-400" />}
        action={
          <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
            {lang === 'th' ? `คุณอยู่อันดับ #${myRank}` : `You are Rank #${myRank}`}
          </span>
        }
      >
        <ol className="space-y-2">
          {top.map((r, i) => (
            <Row key={r.id} rank={i + 1} {...r} lang={lang} />
          ))}
          {!top.includes(meRow) && (
            <>
              <li className="py-1 text-center text-xs tracking-widest text-white/40">· · ·</li>
              <Row rank={myRank} {...meRow} lang={lang} />
            </>
          )}
        </ol>
      </Section>
    </>
  )
}

function StatPod({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode
  label: string
  value: string | number
  accent: 'amber' | 'pink' | 'purple'
}) {
  const borderCol =
    accent === 'amber'
      ? 'border-amber-500/30 bg-amber-950/20'
      : accent === 'pink'
      ? 'border-pink-500/30 bg-pink-950/20'
      : 'border-purple-500/30 bg-purple-950/20'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-3.5 text-center text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]',
        borderCol,
      )}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-inner">
        {icon}
      </div>
      <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-white/70">{label}</p>
    </div>
  )
}

const MEDALS = ['👑', '🥈', '🥉']

function Row({
  rank,
  name,
  faculty,
  xp,
  me,
  lang,
}: {
  rank: number
  name: string
  faculty: string
  xp: number
  me: boolean
  lang: 'th' | 'en'
}) {
  const isPodium = rank <= 3

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-all duration-200',
        me
          ? 'border-pink-500/80 bg-gradient-to-r from-pink-600/25 via-purple-600/20 to-pink-600/25 shadow-[0_0_20px_rgba(236,72,153,0.3)] ring-1 ring-pink-400'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
      )}
    >
      {/* Rank Medal / Number */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-black">
        {MEDALS[rank - 1] ?? rank}
      </span>

      {/* Name & Faculty */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-white tracking-wide">
            {name}
          </p>
          {me && (
            <span className="rounded-md border border-pink-400/50 bg-pink-500/30 px-1.5 py-0.5 text-[10px] font-black text-pink-200 animate-pulse">
              {lang === 'th' ? 'ฉันเอง' : 'YOU'}
            </span>
          )}
          {isPodium && !me && (
            <span className="text-[10px] font-bold text-amber-300">
              Top {rank}
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-white/60">{faculty}</p>
      </div>

      {/* XP Score Badge */}
      <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-300">
        <Zap className="h-3 w-3" />
        <span>{xp} XP</span>
      </div>
    </li>
  )
}

type Card = { front: string; back: string }

function WordMatch({
  cards,
  onCorrect,
  lang,
}: {
  cards: Card[]
  onCorrect: () => void
  lang: 'th' | 'en'
}) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)

  const card = cards[index % cards.length]
  const choices = useMemo(() => {
    const others = [1, 2].map((k) => cards[(index + k) % cards.length].back)
    const list = [card.back, ...others]
    const shift = index % 3
    return [...list.slice(shift), ...list.slice(0, shift)]
  }, [cards, card.back, index])

  const answered = picked !== null
  const correctIdx = choices.indexOf(card.back)

  return (
    <div className="space-y-4">
      {/* Progress & Streak Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
          {lang === 'th'
            ? `การ์ดที่ ${(index % cards.length) + 1} จาก ${cards.length}`
            : `Card ${(index % cards.length) + 1} of ${cards.length}`}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black transition-all',
            streak > 0
              ? 'border border-amber-400/50 bg-amber-500/20 text-amber-300 animate-pulse'
              : 'text-white/50',
          )}
        >
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          {lang === 'th' ? `ต่อเนื่อง ${streak}x` : `${streak}x Streak`}
        </span>
      </div>

      {/* Concept Front Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-pink-500/40 bg-gradient-to-br from-pink-600/30 via-purple-700/25 to-indigo-800/30 p-6 text-center shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:12px_12px]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-pink-300">
          TARGET CONCEPT
        </span>
        <h3 className="mt-1 text-xl sm:text-2xl font-black text-white drop-shadow">
          {card.front}
        </h3>
      </div>

      {/* Answer Choice Cards */}
      <div className="space-y-2.5">
        {choices.map((c, i) => {
          const isCorrect = i === correctIdx
          const isSelected = i === picked

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                if (isCorrect) {
                  const nextStreak = streak + 1
                  setStreak(nextStreak)
                  playCorrectSound()
                  playStreakSound(nextStreak)
                  playXPSparkle()
                  onCorrect()
                } else {
                  setStreak(0)
                  playWrongSound()
                }
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer',
                !answered &&
                  'border-white/10 bg-white/5 text-white/90 hover:border-pink-500/60 hover:bg-pink-500/10 hover:text-white',
                answered &&
                  isCorrect &&
                  'border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]',
                answered &&
                  !isCorrect &&
                  isSelected &&
                  'border-rose-400 bg-rose-500/20 text-rose-200 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]',
                answered && !isCorrect && !isSelected && 'border-white/5 bg-white/[0.02] text-white/40',
              )}
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-bold">
                  {i + 1}
                </span>
                <span>{c}</span>
              </span>
              {answered && isCorrect && <span className="text-emerald-400 font-bold">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Feedback & Next Button */}
      {answered && (
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          {picked === correctIdx ? (
            <div className="flex items-center gap-2">
              <XPChip amount={XP_CORRECT} label="Combo Hit!" />
              <CoinChip amount={5} />
            </div>
          ) : (
            <span className="text-xs font-semibold text-rose-300">
              {lang === 'th' ? 'คำตอบยังไม่ถูกต้อง ลองใหม่ข้อถัดไป!' : 'Incorrect match. Try the next card!'}
            </span>
          )}
          <button
            onClick={() => {
              setIndex((i) => i + 1)
              setPicked(null)
            }}
            className="rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all cursor-pointer"
          >
            {lang === 'th' ? 'การ์ดถัดไป →' : 'Next Card →'}
          </button>
        </div>
      )}
    </div>
  )
}

function BossRushExam({
  lang,
  onVictory,
}: {
  lang: 'th' | 'en'
  onVictory: () => void
}) {
  const [bossHP, setBossHP] = useState(100)
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [picked, setPicked] = useState<number | null>(null)
  const [combo, setCombo] = useState(0)
  const [gameOver, setGameOver] = useState<'victory' | 'timeout' | null>(null)

  // Countdown timer
  useEffect(() => {
    if (gameOver) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setGameOver('timeout')
          playWrongSound()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameOver])

  const restartBoss = () => {
    setBossHP(100)
    setQIndex(0)
    setTimeLeft(60)
    setPicked(null)
    setCombo(0)
    setGameOver(null)
  }

  const currentQ = BOSS_EXAM_QUESTIONS[qIndex % BOSS_EXAM_QUESTIONS.length]
  const answered = picked !== null

  const handlePick = (i: number, isCorrect: boolean) => {
    setPicked(i)
    if (isCorrect) {
      const nextCombo = combo + 1
      setCombo(nextCombo)
      playCorrectSound()
      playStreakSound(nextCombo)
      playXPSparkle()

      const nextHP = Math.max(0, bossHP - 20)
      setBossHP(nextHP)

      if (nextHP === 0) {
        setGameOver('victory')
        playLevelUpSound()
        playCoinSound()
        onVictory()
      }
    } else {
      setCombo(0)
      playWrongSound()
    }
  }

  if (gameOver === 'victory') {
    return (
      <div className="rounded-2xl border border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-[#16182E] to-purple-950/40 p-6 text-center text-white shadow-2xl animate-in zoom-in-95">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/30 text-4xl border-2 border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce">
          👑
        </div>
        <h3 className="mt-4 text-2xl font-black text-amber-300">
          {lang === 'th' ? 'พิชิตบอสข้อสอบปลายภาคสำเร็จ!' : 'FINAL BOSS DEFEATED!'}
        </h3>
        <p className="mt-1 text-sm text-white/80 max-w-md mx-auto">
          {lang === 'th'
            ? 'คุณตอบข้อสอบถูกต้องครบถ้วน พิชิตเกรด A+ รับตราเกียรตินิยมและคะแนนมหาศาล!'
            : 'You crushed the comprehensive exam rush with A+ mastery! Epic bounty rewarded!'}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <XPChip amount={BOSS_TOTAL_XP} label="Boss Defeated" />
          <CoinChip amount={BOSS_TOTAL_COINS} />
        </div>

        <button
          onClick={restartBoss}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/30 hover:brightness-110 transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          {lang === 'th' ? 'เล่นท้าทายใหม่อีกครั้ง' : 'Challenge Boss Again'}
        </button>
      </div>
    )
  }

  if (gameOver === 'timeout') {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-[#16182E] to-black/60 p-6 text-center text-white shadow-2xl animate-in zoom-in-95">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl border border-rose-400/40 text-rose-300">
          ⏳
        </div>
        <h3 className="mt-3 text-lg font-black text-rose-300">
          {lang === 'th' ? 'หมดเวลาการสอบ!' : 'Time Expired!'}
        </h3>
        <p className="mt-1 text-xs text-white/70">
          {lang === 'th' ? 'บอสยังเหลือพลังชีวิตอยู่ ลองวางแผนและท้าทายใหม่อีกรอบ!' : 'The Boss withstood the rush. Regroup and challenge again!'}
        </p>
        <button
          onClick={restartBoss}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          {lang === 'th' ? 'เริ่มใหม่ทันที' : 'Retry Boss Rush'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Boss Profile Banner & HP Bar */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-[#16182E] to-amber-950/30 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-xl border border-rose-400/40 text-rose-300">
              👹
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">Dr. Examus Prime</h4>
                <span className="rounded bg-rose-500/30 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-200">
                  BOSS
                </span>
              </div>
              <p className="text-[10px] text-white/60">Final Exam Guardian · SPU Assessment</p>
            </div>
          </div>

          {/* 60s Countdown Timer */}
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black shadow-sm',
              timeLeft <= 15
                ? 'border-rose-400 bg-rose-500/20 text-rose-300 animate-pulse'
                : 'border-amber-400/40 bg-amber-500/15 text-amber-300',
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-rose-300">BOSS HP: {bossHP}%</span>
            <span className="text-white/60">
              {bossHP === 0 ? 'DEFEATED' : `${Math.ceil(bossHP / 20)} Hits Remaining`}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              style={{ width: `${bossHP}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Counter & Stem */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            {lang === 'th' ? `ข้อสอบข้อที่ ${qIndex + 1}` : `Question ${qIndex + 1}`}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-purple-300">
            <Flame className="h-3.5 w-3.5" />
            Combo: {combo}x
          </span>
        </div>

        <p className="text-sm font-bold leading-relaxed text-white">
          {lang === 'th' ? currentQ.q : currentQ.qEn}
        </p>

        {/* 4 Choices */}
        <div className="mt-3.5 space-y-2">
          {currentQ.options.map((opt, i) => {
            const isCorrect = opt.correct
            const isSelected = i === picked

            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => handlePick(i, isCorrect)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer',
                  !answered &&
                    'border-white/10 bg-white/5 text-white/90 hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-white',
                  answered &&
                    isCorrect &&
                    'border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]',
                  answered &&
                    !isCorrect &&
                    isSelected &&
                    'border-rose-400 bg-rose-500/20 text-rose-200 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]',
                  answered && !isCorrect && !isSelected && 'border-white/5 bg-white/[0.02] text-white/40',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{lang === 'th' ? opt.text : opt.textEn}</span>
                </span>
                {answered && isCorrect && <span className="text-emerald-400 font-bold">✓ -20% HP</span>}
              </button>
            )
          })}
        </div>

        {/* Next Question Button */}
        {answered && (
          <div className="mt-4 flex justify-end border-t border-white/10 pt-3">
            <button
              onClick={() => {
                setQIndex((q) => q + 1)
                setPicked(null)
              }}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-5 py-2 text-xs font-black text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              {lang === 'th' ? 'ข้อต่อไป →' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
