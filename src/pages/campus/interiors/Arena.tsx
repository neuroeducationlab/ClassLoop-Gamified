import { useMemo, useState, type ReactNode } from 'react'
import {
  Crown,
  Flame,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import Section, { CoinChip, XPChip } from './Section'

const XP_CORRECT = 15

/**
 * Classmates' XP for the leaderboard. Derived from the frozen avatarSeed so
 * the board is identical on every take (seed-data.ts forbids runtime randomness).
 * Capped near the demo student's starting XP so a few rounds of the game
 * visibly climb the board on camera.
 */
function classmateXP(seed: number) {
  return 30 + ((seed * 53) % 150)
}

/**
 * Arena: High-Tech Cyber Colosseum & Brain Gym (Building 12)
 * Features real-time flashcard rapid fire matching, combo streaks,
 * and the Hall of Champions live classroom leaderboard.
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

      {/* ── Brain Gym: Flashcard Speed Match ── */}
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
                  setStreak((s) => s + 1)
                  onCorrect()
                } else {
                  setStreak(0)
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
