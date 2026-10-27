import { useMemo, useState, type ReactNode } from 'react'
import { Flame, Trophy, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import Section, { XPChip } from './Section'

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

/** Arena: a flashcard match game for points, plus the class leaderboard. */
export default function Arena() {
  const { generatedContent, students, currentStudent, avatar, studentXP, addXP } = useApp()
  const cards = generatedContent.flashcards

  const board = useMemo(() => {
    const rows = students.map((s) =>
      s.id === currentStudent.id
        ? { id: s.id, name: avatar?.nickname ?? s.nickname, faculty: s.faculty, xp: studentXP, me: true }
        : { id: s.id, name: s.nickname, faculty: s.faculty, xp: classmateXP(s.avatarSeed), me: false },
    )
    return rows.sort((a, b) => b.xp - a.xp)
  }, [students, currentStudent.id, avatar?.nickname, studentXP])
  const myRank = board.findIndex((r) => r.me) + 1
  const top = board.slice(0, 8)
  const meRow = board[myRank - 1]

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat icon={<Zap className="h-5 w-5" />} label="XP ของฉัน" value={studentXP} />
        <Stat icon={<Trophy className="h-5 w-5" />} label="อันดับ" value={`#${myRank}`} />
        <Stat icon={<Flame className="h-5 w-5" />} label="เลเวล" value={Math.max(1, Math.floor(studentXP / 100))} /* same formula as the campus HUD */ />
      </div>

      <Section title="เกมจับคู่คำศัพท์ · Word match" sub={`เลือกความหมายที่ถูก · +${XP_CORRECT} XP ต่อข้อ`}>
        <WordMatch cards={cards} onCorrect={() => addXP(XP_CORRECT)} />
      </Section>

      <Section title="ลีดเดอร์บอร์ด · Leaderboard" sub="อันดับประจำสัปดาห์ของห้อง">
        <ol className="space-y-1.5">
          {top.map((r, i) => (
            <Row key={r.id} rank={i + 1} {...r} />
          ))}
          {!top.includes(meRow) && (
            <>
              <li className="text-center text-xs text-grey-400">⋯</li>
              <Row rank={myRank} {...meRow} />
            </>
          )}
        </ol>
      </Section>
    </>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    // glass tile — sits directly on the room's dark gradient, above the white cards
    <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600">{icon}</div>
      <p className="mt-1.5 text-lg font-extrabold">{value}</p>
      <p className="text-[11px] text-white/70">{label}</p>
    </div>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

function Row({ rank, name, faculty, xp, me }: { rank: number; name: string; faculty: string; xp: number; me: boolean }) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2',
        me ? 'bg-pink-50 ring-2 ring-pink-300' : 'bg-canvas',
      )}
    >
      <span className="w-7 text-center text-sm font-bold text-grey-600">{MEDALS[rank - 1] ?? rank}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">
          {name}
          {me && <span className="ml-1 text-xs text-pink-600">(ฉัน)</span>}
        </span>
        <span className="block truncate text-[11px] text-grey-600">{faculty}</span>
      </span>
      <span className="text-sm font-extrabold text-ink">{xp}</span>
    </li>
  )
}

type Card = { front: string; back: string }

function WordMatch({ cards, onCorrect }: { cards: Card[]; onCorrect: () => void }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)

  // Three choices: the right back plus the next two cards' backs, rotated by
  // index so the answer isn't always in the same slot. Deterministic on purpose.
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
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-grey-600">
        <span>
          การ์ด {(index % cards.length) + 1}/{cards.length}
        </span>
        <span className="text-orange-500">🔥 ต่อเนื่อง {streak}</span>
      </div>
      <p className="mt-2 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 p-5 text-center text-lg font-extrabold text-white">
        {card.front}
      </p>
      <div className="mt-3 space-y-2">
        {choices.map((c, i) => (
          <button
            key={i}
            disabled={answered}
            onClick={() => {
              setPicked(i)
              if (i === correctIdx) {
                setStreak((s) => s + 1)
                onCorrect()
              } else {
                setStreak(0)
              }
            }}
            className={cn(
              'w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
              !answered && 'border-grey-300/80 hover:border-pink-400 hover:bg-pink-50/40',
              answered && i === correctIdx && 'border-green-500 bg-green-50 font-semibold text-green-700',
              answered && i !== correctIdx && i === picked && 'border-red-400 bg-red-50 text-red-600',
              answered && i !== correctIdx && i !== picked && 'border-grey-300/60 opacity-60',
            )}
          >
            {c}
          </button>
        ))}
      </div>
      {answered && (
        <div className="mt-3 flex items-center justify-between">
          {picked === correctIdx ? <XPChip amount={XP_CORRECT} /> : <span className="text-xs text-grey-600">ลองใหม่ข้อหน้า!</span>}
          <button
            onClick={() => {
              setIndex((i) => i + 1)
              setPicked(null)
            }}
            className="rounded-lg bg-pink-600 px-4 py-2 text-xs font-bold text-paper hover:bg-pink-500"
          >
            การ์ดถัดไป →
          </button>
        </div>
      )}
    </div>
  )
}
