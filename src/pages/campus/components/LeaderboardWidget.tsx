import { useState } from 'react'
import { Trophy, Flame, ChevronLeft, ChevronRight, Crown, Sparkles, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { lookupEn } from '@/components/AutoTranslate'

interface LeaderboardEntry {
  rank: number
  name: string
  nickname: string
  faculty: string
  xp: number
  streak: number
  change: number // positive for up, 0 for same
  isUser?: boolean
  avatarColor: string
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    name: 'ตะวัน รัตนเวช',
    nickname: 'ตะวัน',
    faculty: 'สถาปัตย์',
    xp: 850,
    streak: 7,
    change: 0,
    avatarColor: '#F59E0B',
  },
  {
    rank: 2,
    name: 'เมธาวี สุวรรณ',
    nickname: 'เมย์',
    faculty: 'ดิจิทัลมีเดีย',
    xp: 780,
    streak: 6,
    change: 1,
    avatarColor: '#EC4899',
  },
  {
    rank: 3,
    name: 'ณัฐวุฒิ สิทธิชัย',
    nickname: 'ณัฐ (คุณ)',
    faculty: 'วิศวกรรมศาสตร์',
    xp: 620,
    streak: 5,
    change: 2,
    isUser: true,
    avatarColor: '#E89BC4',
  },
  {
    rank: 4,
    name: 'พรรณี เจริญสุข',
    nickname: 'พลอย',
    faculty: 'บริหารธุรกิจ',
    xp: 590,
    streak: 4,
    change: -1,
    avatarColor: '#10B981',
  },
  {
    rank: 5,
    name: 'ธีรวัฒน์ มั่นคง',
    nickname: 'ต้น',
    faculty: 'วิศวกรรมศาสตร์',
    xp: 540,
    streak: 3,
    change: 0,
    avatarColor: '#3B82F6',
  },
]

export default function LeaderboardWidget() {
  const { studentXP, lang } = useApp()
  // phones start tucked away, so the panel doesn't cover the 3D view
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  const [filter, setFilter] = useState<'all' | 'faculty'>('all')

  // Live updated user XP
  const liveData = LEADERBOARD_DATA.map((entry) => {
    if (entry.isUser) {
      return {
        ...entry,
        nickname: lang === 'th' ? 'ณัฐ (คุณ)' : 'Nat (You)',
        faculty: lang === 'th' ? 'วิศวกรรมศาสตร์' : 'Engineering',
        xp: Math.max(entry.xp, studentXP),
      }
    }
    return {
      ...entry,
      faculty: lang === 'th'
        ? entry.faculty
        : entry.faculty === 'สถาปัตย์'
        ? 'Architecture'
        : entry.faculty === 'ดิจิทัลมีเดีย'
        ? 'Digital Media'
        : entry.faculty === 'บริหารธุรกิจ'
        ? 'Business'
        : 'Engineering',
    }
  }).sort((a, b) => b.xp - a.xp).map((entry, idx) => ({ ...entry, rank: idx + 1 }))

  return (
    <div
      className={`pointer-events-auto absolute left-4 top-24 z-20 transition-all duration-500 ease-out ${
        // tucked: slide out past the left-4 gap too, so only the 🏆 tab shows at the edge
        collapsed ? '-translate-x-[calc(100%-1.5rem)]' : 'translate-x-0'
      }`}
    >
      <div className="relative flex items-start">
        {/* Main Leaderboard Card */}
        <div className="w-80 overflow-hidden rounded-3xl border border-white/20 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg">
                <Trophy className="h-4 w-4 fill-black" />
              </span>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide uppercase text-white flex items-center gap-1.5">
                  {lang === 'th' ? 'อันดับประจำสัปดาห์' : 'Weekly Leaderboard'}
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
              </div>
            </div>

            {/* Live Filter Buttons */}
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
            <button
              onClick={() => setCollapsed(true)}
              aria-label={lang === 'th' ? 'ปิดอันดับ' : 'Close leaderboard'}
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/25 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-1.5">
            {liveData.map((item) => {
              const isTop1 = item.rank === 1
              const isTop2 = item.rank === 2
              const isTop3 = item.rank === 3

              return (
                <div
                  key={item.nickname}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 text-xs transition-all ${
                    item.isUser
                      ? 'border border-pink-500/50 bg-gradient-to-r from-pink-950/60 to-purple-950/60 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : isTop1
                      ? 'bg-amber-500/15 border border-amber-400/30'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {/* Left: Rank & Avatar */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg font-black text-xs ${
                        isTop1
                          ? 'bg-amber-400 text-black shadow'
                          : isTop2
                          ? 'bg-slate-300 text-black shadow'
                          : isTop3
                          ? 'bg-amber-700 text-white shadow'
                          : 'text-white/60 bg-white/10'
                      }`}
                    >
                      {isTop1 ? <Crown className="h-3.5 w-3.5" /> : item.rank}
                    </span>

                    <span
                      className="h-7 w-7 rounded-full border border-white/40 shadow-xs shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: item.avatarColor }}
                    >
                      {(lang === 'en' ? lookupEn(item.nickname) : item.nickname)[0]}
                    </span>

                    <div>
                      <p className={`font-bold leading-tight ${item.isUser ? 'text-pink-300' : 'text-white'}`}>
                        {item.nickname}
                      </p>
                      <p className="text-[10px] text-white/50">{item.faculty}</p>
                    </div>
                  </div>

                  {/* Right: XP & Streak */}
                  <div className="text-right flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-300 text-[11px] font-semibold" title="Daily streak">
                      <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      <span>{item.streak}</span>
                    </div>
                    <div className="min-w-[3.5rem]">
                      <span className="font-extrabold text-white text-xs">{item.xp}</span>
                      <span className="text-[10px] text-white/50 ml-0.5">XP</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer perk / motivator */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-1.5 text-[11px] text-white/70">
            <span className="flex items-center gap-1 text-pink-300 font-medium">
              <Sparkles className="h-3 w-3 text-pink-400" />
              {lang === 'th' ? 'อีก 160 XP ถึงอันดับ 2' : '160 XP to Rank 2'}
            </span>
            <span className="text-white/40">{lang === 'th' ? 'รีเซ็ตทุกวันจันทร์' : 'Resets Monday'}</span>
          </div>
        </div>

        {/* Toggle Collapse Tab Button */}
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
