import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Crown,
  Flame,
  Minus,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { lookupEn } from '@/components/AutoTranslate'
import { ProfilePic } from '@/pages/wardrobe/ProfileCard'

/**
 * Leaderboard widget that reorders rows with a FLIP animation whenever XP
 * changes, so the demo visitor actually *sees* their row climb the ranks
 * instead of popping into place.
 *
 * - `change` is computed from the current rank vs the previous rank, not from
 *   a hard-coded field, so the arrow next to each row always tells the truth.
 * - The footer ("X XP to rank N") is derived live from the gap to the row
 *   above the user — no more stale "160 XP to Rank 2" when the user is on
 *   rank 1 already.
 * - A tiny +25 XP button is tucked into the header so visitors can poke it
 *   and watch the rows shuffle. Reset Demo clears it.
 */

type Entry = {
  id: string
  name: string
  nickname: string
  faculty: string // th text, mapped to en below
  xp: number
  streak: number
  isUser?: boolean
  avatarColor: string
}

const SEED: Entry[] = [
  { id: 's-tawan', name: 'ตะวัน รัตนเวช',   nickname: 'ตะวัน',  faculty: 'สถาปัตย์',       xp: 850, streak: 7, avatarColor: '#F59E0B' },
  { id: 's-may',   name: 'เมธาวี สุวรรณ',   nickname: 'เมย์',   faculty: 'ดิจิทัลมีเดีย',   xp: 780, streak: 6, avatarColor: '#EC4899' },
  { id: 's-nat',   name: 'ณัฐวุฒิ สิทธิชัย',  nickname: 'ณัฐ',    faculty: 'วิศวกรรมศาสตร์', xp: 620, streak: 5, isUser: true, avatarColor: '#E89BC4' },
  { id: 's-ploy',  name: 'พรรณี เจริญสุข',   nickname: 'พลอย',  faculty: 'บริหารธุรกิจ',   xp: 590, streak: 4, avatarColor: '#10B981' },
  { id: 's-ton',   name: 'ธีรวัฒน์ มั่นคง',   nickname: 'ต้น',   faculty: 'วิศวกรรมศาสตร์', xp: 540, streak: 3, avatarColor: '#3B82F6' },
]

const FACULTY_EN: Record<string, string> = {
  'สถาปัตย์': 'Architecture',
  'ดิจิทัลมีเดีย': 'Digital Media',
  'บริหารธุรกิจ': 'Business',
  'วิศวกรรมศาสตร์': 'Engineering',
}

export default function LeaderboardWidget() {
  const { studentXP, lang, avatar, currentStudent } = useApp()
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  )
  const [filter, setFilter] = useState<'all' | 'faculty'>('all')
  const [extraXP, setExtraXP] = useState(0)

  const userNick = avatar?.nickname || currentStudent.nickname

  /* Build sorted rows live: user's XP tracks AppContext + the demo nudge. */
  const rows = useMemo(() => {
    const userFacultyTh = currentStudent.faculty
    const copy = SEED.map((e) =>
      e.isUser
        ? {
            ...e,
            nickname: userNick,
            faculty: userFacultyTh,
            // 620 is the baseline for the user in SEED. Starting XP from
            // AppContext plus any demo bumps lifts the user above the baseline.
            xp: Math.max(e.xp, e.xp + Math.max(0, studentXP - 120) + extraXP),
          }
        : e,
    )
    copy.sort((a, b) => b.xp - a.xp)
    return copy
  }, [studentXP, extraXP, userNick, currentStudent.faculty])

  /* Remember the previous rank per id so we can draw the "+N/−N" arrow and
     drive the FLIP slide. On the first render the previous rank is the same
     as the current rank, so nothing moves. */
  const prevRanks = useRef<Map<string, number>>(new Map())
  useEffect(() => {
    const next = new Map<string, number>()
    rows.forEach((r, i) => next.set(r.id, i + 1))
    prevRanks.current = next
  }, [rows])
  const prev = prevRanks.current

  /* FLIP — Measure each row's DOM position before the next paint, then compute
     the delta from where it was last frame and animate it into place. */
  const rowRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const prevPositions = useRef<Map<string, number>>(new Map())
  useLayoutEffect(() => {
    const curr = new Map<string, number>()
    rowRefs.current.forEach((el, id) => {
      if (el) curr.set(id, el.getBoundingClientRect().top)
    })
    // Second pass: for every row whose top moved, slide it from the old top
    rowRefs.current.forEach((el, id) => {
      if (!el) return
      const was = prevPositions.current.get(id)
      const now = curr.get(id)
      if (was != null && now != null && was !== now) {
        const dy = was - now
        el.style.transition = 'none'
        el.style.transform = `translateY(${dy}px)`
        // Force style flush, then animate to 0
        void el.offsetHeight
        el.style.transition = 'transform 650ms cubic-bezier(.22,1.3,.36,1)'
        el.style.transform = 'translateY(0)'
      }
    })
    prevPositions.current = curr
  }, [rows])

  const highestUserRank = rows.findIndex((r) => r.isUser)
  const nextUpXp = highestUserRank > 0 ? rows[highestUserRank - 1].xp - rows[highestUserRank].xp : 0

  return (
    <div
      className={`pointer-events-auto absolute left-4 top-24 z-20 transition-all duration-500 ease-out ${
        collapsed ? '-translate-x-[calc(100%-1.5rem)]' : 'translate-x-0'
      }`}
    >
      <div className="relative flex items-start">
        <div className="w-80 overflow-hidden rounded-3xl border border-white/20 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg shrink-0">
                <Trophy className="h-4 w-4 fill-black" />
              </span>
              <h3 className="text-xs font-extrabold tracking-wide uppercase text-white flex items-center gap-1.5 truncate">
                {lang === 'th' ? 'อันดับประจำสัปดาห์' : 'Weekly Leaderboard'}
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Live Filter */}
              <div className="flex rounded-lg bg-white/10 p-0.5 text-[10px]">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded px-1.5 py-0.5 font-bold transition-all ${
                    filter === 'all' ? 'bg-amber-400 text-black shadow' : 'text-white/70 hover:text-white'
                  }`}
                >
                  SPU
                </button>
                <button
                  onClick={() => setFilter('faculty')}
                  className={`rounded px-1.5 py-0.5 font-bold transition-all ${
                    filter === 'faculty' ? 'bg-amber-400 text-black shadow' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {lang === 'th' ? 'คณะ' : 'Faculty'}
                </button>
              </div>

              {/* +25 XP: a demo visitor pokes this and watches the row climb */}
              <button
                onClick={() => setExtraXP((x) => x + 25)}
                title={lang === 'th' ? 'ลองเพิ่ม XP ของคุณ' : 'Add 25 XP to your row'}
                className="flex h-7 shrink-0 items-center gap-0.5 rounded-lg bg-pink-500/85 px-1.5 text-[10px] font-black text-white shadow-sm hover:bg-pink-500 active:scale-95 transition-all cursor-pointer"
              >
                +25
              </button>

              <button
                onClick={() => setCollapsed(true)}
                aria-label={lang === 'th' ? 'ปิดอันดับ' : 'Close leaderboard'}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/25 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Rows */}
          <div className="relative space-y-1.5">
            {rows.map((item, idx) => {
              const rank = idx + 1
              const was = prev.get(item.id) ?? rank
              const change = was - rank // >0 climbed, <0 fell
              const faculty = lang === 'th' ? item.faculty : (FACULTY_EN[item.faculty] ?? 'Engineering')
              const nickRender =
                item.isUser
                  ? `${item.nickname} (${lang === 'th' ? 'คุณ' : 'You'})`
                  : lang === 'en'
                  ? (lookupEn(item.nickname) || item.nickname)
                  : item.nickname

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    rowRefs.current.set(item.id, el)
                  }}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs will-change-transform ${
                    item.isUser
                      ? 'border border-pink-500/50 bg-gradient-to-r from-pink-950/60 to-purple-950/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : rank === 1
                      ? 'bg-amber-500/15 border border-amber-400/30'
                      : 'bg-white/5'
                  } ${change > 0 ? 'ring-1 ring-emerald-400/30' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Rank chip with up/down arrow */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg font-black text-xs ${
                          rank === 1
                            ? 'bg-amber-400 text-black shadow'
                            : rank === 2
                            ? 'bg-slate-300 text-black shadow'
                            : rank === 3
                            ? 'bg-amber-700 text-white shadow'
                            : 'text-white/60 bg-white/10'
                        }`}
                      >
                        {rank === 1 ? <Crown className="h-3.5 w-3.5" /> : rank}
                      </span>
                      <RankDelta change={change} />
                    </div>

                    {item.isUser ? (
                      <ProfilePic size={28} ring="#F9A8D4" />
                    ) : (
                      <span
                        className="h-7 w-7 rounded-full border border-white/40 shadow-xs shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                        style={{ backgroundColor: item.avatarColor }}
                      >
                        {(lang === 'en' ? (lookupEn(item.nickname) || item.nickname) : item.nickname)[0]}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className={`font-bold leading-tight truncate ${item.isUser ? 'text-pink-300' : 'text-white'}`}>
                        {nickRender}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">{faculty}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-0.5 text-amber-300 text-[11px] font-semibold" title="Daily streak">
                      <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{item.streak}</span>
                    </div>
                    <AnimatedXp value={item.xp} highlight={item.isUser === true} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-1.5 text-[11px] text-white/70">
            <span className="flex items-center gap-1 text-pink-300 font-medium">
              <Sparkles className="h-3 w-3 text-pink-400" />
              {nextUpXp > 0
                ? (lang === 'th' ? `อีก ${nextUpXp} XP ถึงอันดับ ${highestUserRank}` : `${nextUpXp} XP to rank ${highestUserRank}`)
                : (lang === 'th' ? '🏆 คุณคืออันดับ 1!' : "🏆 You're #1!")}
            </span>
            <span className="text-white/40">{lang === 'th' ? 'รีเซ็ตทุกวันจันทร์' : 'Resets Monday'}</span>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`ml-1 flex items-center justify-center gap-0.5 rounded-r-xl border border-l-0 border-white/20 bg-black/70 text-white/80 backdrop-blur-md hover:bg-black/90 hover:text-white transition-all shadow-xl cursor-pointer ${
            collapsed ? 'h-14 w-9 flex-col' : 'h-10 w-6'
          }`}
          title={
            collapsed
              ? (lang === 'th' ? 'เปิดลีดเดอร์บอร์ด' : 'Open Leaderboard')
              : (lang === 'th' ? 'ซ่อนลีดเดอร์บอร์ด' : 'Hide Leaderboard')
          }
        >
          {collapsed && <Trophy className="h-4 w-4 text-amber-300" />}
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/* ─── inner components ─────────────────────────────────────────────────── */

/** Small up/down/same arrow + delta number, under the rank chip. */
function RankDelta({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1 py-0.5 text-[9px] font-black text-emerald-300">
        <ChevronUp className="h-2.5 w-2.5" />
        {change}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-0.5 rounded-full bg-rose-500/20 px-1 py-0.5 text-[9px] font-black text-rose-300">
        <ChevronDown className="h-2.5 w-2.5" />
        {Math.abs(change)}
      </span>
    )
  }
  return (
    <span className="flex items-center justify-center rounded-full bg-white/10 px-1 py-0.5 text-[9px] text-white/40">
      <Minus className="h-2.5 w-2.5" />
    </span>
  )
}

/** XP that counts up/down over 500 ms when the value changes. */
function AnimatedXp({ value, highlight }: { value: number; highlight: boolean }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (shown === value) return
    const from = shown
    const diff = value - shown
    const start = performance.now()
    const dur = 500
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(Math.round(from + diff * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-w-[3.5rem]">
      <span className={`font-extrabold text-xs tabular-nums ${highlight ? 'text-pink-200' : 'text-white'}`}>
        {shown}
      </span>
      <span className="text-[10px] text-white/50 ml-0.5">XP</span>
    </div>
  )
}
