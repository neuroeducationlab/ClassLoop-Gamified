import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Award,
  BookOpen,
  ExternalLink,
  Flame,
  Gamepad2,
  Lightbulb,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Tv,
  Zap,
  Shirt,
  Map,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'
import { GameIcon } from '@/components/icons/GameIcon'
import Avatar3DSvg from '@/pages/campus/components/Avatar3DSvg'
import { playClickSound, playCoinSound } from '@/pages/campus/soundEngine'

export default function Home() {
  const navigate = useNavigate()
  const { currentStudent, studentXP, avatar, activeCoursePack, lang } = useApp()
  const course = activeCoursePack.course
  const currentTopic = activeCoursePack.topics[activeCoursePack.currentWeek - 1]
  const revealRef = useReveal(true)

  // Top 5 Leaderboard Data sorted by XP/spokeCount
  const leaderboardData = [
    { rank: 1, name: 'ณัฐ', nickname: 'นัท', faculty: 'Digital Media', xp: 240, badge: '1' },
    { rank: 2, name: 'วรรณา', nickname: 'นุ้ย', faculty: 'Accounting', xp: 210, badge: '2' },
    { rank: 3, name: 'ธีรวัฒน์', nickname: 'ต้น', faculty: 'Engineering', xp: 190, badge: '3' },
    { rank: 4, name: 'พรรณี', nickname: 'พลอย', faculty: 'Business Admin', xp: 160, badge: '4' },
    { rank: 5, name: 'สมชาย', nickname: 'แมน', faculty: 'Law', xp: 140, badge: '5' },
  ]

  // Pre-test vs Post-test Growth Comparison Data
  const progressComparisonData = [
    { name: 'Power Distance', pretest: 55, posttest: 85 },
    { name: 'Individualism', pretest: 60, posttest: 90 },
    { name: 'Masculinity', pretest: 70, posttest: 95 },
    { name: 'Uncertainty Avoid', pretest: 50, posttest: 80 },
    { name: 'Long-Term Orient', pretest: 65, posttest: 88 },
  ]

  const userNickname = avatar?.nickname || currentStudent.nickname
  const userXP = studentXP > 0 ? studentXP : 120

  return (
    <div ref={revealRef} className="w-full space-y-6">
      {/* ── TOP HERO COURSE BANNER ── */}
      <div className="reveal relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-black tracking-wider uppercase font-mono backdrop-blur-sm">
                {course.code}
              </span>
              <span className="rounded-full bg-pink-400/30 px-3 py-0.5 text-xs font-bold text-pink-200">
                {lang === 'th' ? `สัปดาห์ที่ ${activeCoursePack.currentWeek}` : `Week ${activeCoursePack.currentWeek}`}
              </span>
              <span className="hidden sm:inline text-xs text-white/70">
                • {lang === 'th' ? 'ระบบการเรียนรู้ข้ามคณะ SPU' : 'SPU Cross-Faculty Learning'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              {course.name}
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 font-medium">
              {lang === 'th' ? 'หัวข้อประจำสัปดาห์: ' : 'Weekly Topic: '}
              <strong className="text-white underline decoration-pink-300 underline-offset-4">
                {currentTopic?.title ?? course.name}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                playCoinSound()
                navigate('/campus')
              }}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-pink-600 shadow-lg shadow-black/10 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
            >
              <GameIcon name="gamepad" />
              <span>{lang === 'th' ? 'เข้าสู่แคมปัส 3D' : 'Enter 3D Campus'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN RESPONSIVE LAPTOP TWO-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ── LEFT COLUMN (Main Activities & Graphs - 8 Cols on Laptop) ── */}
        <div className="lg:col-span-8 space-y-6">
          {/* 🎮 GAME & INTERACTIVE ACTIVITY LAUNCHER CARD */}
          <div className="reveal rounded-3xl border-2 border-pink-500 bg-paper p-6 sm:p-7 shadow-lg space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-pink-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span>{lang === 'th' ? 'เกมท้าดวลประจำคาบเรียน' : 'Class Duel Game'}</span>
              </span>
              <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 shadow-xs">
                {lang === 'th' ? '5 คำถาม • +10 XP/ข้อ' : '5 questions • +10 XP each'}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-ink tracking-tight">Speed Culture Quiz</h2>
              <p className="text-xs sm:text-sm font-bold text-pink-600">
                {lang === 'th' ? 'หัวข้อ: ' : 'Topic: '}{currentTopic?.title ?? course.name}
              </p>
              <p className="text-xs sm:text-sm text-grey-600 pt-1 leading-relaxed">
                {lang === 'th'
                  ? 'ตอบคำถามวัดความรู้ 5 ข้อ สะสม XP ติดอันดับ Leaderboard ประจำคลาสเรียนข้ามคณะ!'
                  : 'Answer 5 timed cultural dilemma questions, collect XP and climb the cross-faculty class leaderboard!'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound()
                navigate('/student/join')
              }}
              className="flex w-full min-h-[58px] items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 py-4 px-6 text-base font-black text-white shadow-xl shadow-pink-600/30 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer text-center"
            >
              <Zap className="h-5 w-5 fill-white" />
              <span>{lang === 'th' ? 'เริ่มเล่นเกมท้าดวล (Start the duel)' : 'Start the duel'}</span>
            </button>
          </div>

          {/* 📈 PROGRESS GROWTH COMPARISON GRAPH */}
          <div className="reveal rounded-3xl border border-emerald-300/80 bg-paper p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 font-bold shadow-xs">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    {lang === 'th' ? 'กราฟพัฒนาการการเรียนรู้ (Learning Growth)' : 'Learning Growth Comparison'}
                  </h3>
                  <p className="text-xs text-grey-500">
                    {lang === 'th' ? 'เปรียบเทียบ ก่อนเรียน (Pre) vs หลังเรียน (Post)' : 'Comparison: Pre-test vs Post-test mastery'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                +28% {lang === 'th' ? 'พัฒนาขึ้น!' : 'Growth!'}
              </span>
            </div>

            {/* Recharts BarChart with laptop spaciousness */}
            <div className="h-[260px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#2A262E', fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl bg-ink p-3 text-xs text-paper shadow-2xl space-y-1">
                            <p className="font-bold text-pink-400">{payload[0].payload.name}</p>
                            <p className="text-pink-300">ก่อนเรียน (Pre-test): {payload[0].value}%</p>
                            <p className="text-emerald-400">หลังเรียน (Post-test): {payload[1].value}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="pretest" name="ก่อนเรียน (Pre-test)" fill="#F472B6" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="posttest" name="หลังเรียน (Post-test)" fill="#DB2777" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Callout Banner */}
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <p className="font-black flex items-center gap-1.5 text-emerald-800 text-sm">
                <Award className="h-4 w-4 text-emerald-600" />
                <span>{lang === 'th' ? 'ผลสรุปพัฒนาการ:' : 'Key Mastery Findings:'}</span>
              </p>
              <p className="text-xs font-semibold text-emerald-900 leading-relaxed">
                {lang === 'th'
                  ? 'ความเข้าใจเพิ่มขึ้นจาก 60% ก่อนเรียน เป็น 88% หลังเรียน โดยเฉพาะมิติ Masculinity และ Individualism มีความก้าวหน้าสูงสุด!'
                  : 'Student understanding jumped from 60% pre-test to 88% post-test, with peak acceleration in Masculinity and Individualism!'}
              </p>
            </div>
          </div>

          {/* 💡 PERSONALIZED LEARNING SUGGESTIONS & EXTRA CHANNELS */}
          <div className="reveal rounded-3xl border border-pink-300/80 bg-paper p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 font-bold shadow-xs">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink">
                    {lang === 'th' ? 'คำแนะนำการเรียนรู้ส่วนบุคคล' : 'Personalized Learning Channels'}
                  </h3>
                  <p className="text-xs text-pink-600 font-semibold">
                    {lang === 'th' ? `วิเคราะห์จากผลคะแนนของคุณ ${userNickname}` : `Personalized insights for ${userNickname}`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 shadow-xs">
                AI Suggestion
              </span>
            </div>

            <p className="text-xs sm:text-sm text-grey-600 leading-relaxed">
              {lang === 'th'
                ? `ผลคะแนนของคุณในบท ${currentTopic?.title ?? course.name} อยู่ที่ 80%! เพื่ออัปสปีดความเข้าใจให้เต็ม 100% แนะนำช่องทางเสริมเพิ่มเติม:`
                : `Your score on ${currentTopic?.title ?? course.name} reached 80%! To accelerate full mastery, here are curated learning paths:`}
            </p>

            {/* Grid of channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* YouTube Suggestion */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black text-rose-700">
                      <Tv className="h-4 w-4 text-rose-600" />
                      <span>{lang === 'th' ? 'วิดีโอสรุปแนะนำ (YouTube)' : 'Video Summary (YouTube)'}</span>
                    </span>
                    <span className="text-[9px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">10 min</span>
                  </div>
                  <p className="text-xs font-bold text-ink mt-2">
                    Hofstede's 6 Cultural Dimensions Explained With Real-World Examples
                  </p>
                </div>
                <a
                  href="https://www.youtube.com/results?search_query=Hofstede+cultural+dimensions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-black text-rose-600 hover:underline pt-1 cursor-pointer"
                >
                  <GameIcon name="play" />
                  <span>{lang === 'th' ? 'เปิดดูบน YouTube' : 'Watch on YouTube'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Book / Reading Suggestion */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black text-blue-700">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span>{lang === 'th' ? 'หนังสือ & E-Book แนะนำ' : 'Recommended Reading'}</span>
                    </span>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">SPU Library</span>
                  </div>
                  <p className="text-xs font-bold text-ink mt-2">
                    Cultures and Organizations: Software of the Mind (Chapter 2, pp. 45–60)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/student/review')}
                  className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:underline pt-1 cursor-pointer"
                >
                  <GameIcon name="book" />
                  <span>{lang === 'th' ? 'อ่านสรุปย่อในศูนย์ทบทวน' : 'Read Summary Notes'}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Actionable Flashcard Tip */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>{lang === 'th' ? 'ทบทวนแนะนำประจำวัน' : 'Daily Flashcard Sprint'}</span>
                </p>
                <p className="text-xs text-amber-900">
                  {lang === 'th' ? 'ทบทวน Flashcards หมวด Uncertainty Avoidance อีก 5 ใบ' : 'Review 5 Flashcards on Uncertainty Avoidance'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/review')}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-amber-600 shrink-0 cursor-pointer"
              >
                {lang === 'th' ? 'ทบทวน +10XP' : 'Review +10XP'}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (Sidebar: Profile, Leaderboard, Gateways - 4 Cols on Laptop) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Player Welcome Status Card (3D Avatar Powered) */}
          <div className="reveal rounded-3xl border border-pink-300/80 bg-paper p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3.5">
              {/* High-fidelity 3D Avatar Vector rendering */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-pink-500/40 shadow-md">
                <Avatar3DSvg
                  color={avatar?.color || '#E89BC4'}
                  hat={avatar?.hat || 'grad'}
                  outfit={avatar?.outfit || 'default'}
                  aura={avatar?.aura || 'none'}
                  size={56}
                  className="h-full w-full"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-ink truncate">{currentStudent.name}</h2>
                  <span className="text-xs font-black text-pink-600">
                    "{userNickname}"
                  </span>
                </div>
                <p className="text-xs text-grey-500 truncate">{currentStudent.faculty}</p>
                <span className="inline-block rounded-md bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600 border border-pink-200 mt-1">
                  SPU Student • Yr {currentStudent.year}
                </span>
              </div>
            </div>

            {/* XP & Streak Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-grey-200/60">
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50/70 p-2.5 border border-amber-200/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">{userXP} XP</p>
                  <p className="text-[10px] text-grey-500 font-semibold">{lang === 'th' ? 'เลเวล 1' : 'Level 1'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-orange-50/70 p-2.5 border border-orange-200/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shrink-0">
                  <Flame className="h-4 w-4 fill-orange-400 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-ink">3 {lang === 'th' ? 'วันติด' : 'Days'}</p>
                  <p className="text-[10px] text-grey-500 font-semibold">{lang === 'th' ? 'สถิติเรียนรู้' : 'Streak'}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/create')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-500/30 bg-pink-50 px-4 py-2.5 text-xs font-black text-pink-600 hover:bg-pink-100 transition-all cursor-pointer shadow-xs"
            >
              <Shirt className="h-4 w-4" />
              <span>{lang === 'th' ? 'แต่งตัวละคร 3D (Customize)' : 'Customize 3D Avatar'}</span>
            </button>
          </div>

          {/* 🏆 LEADERBOARD CARD (อันดับผู้นำคลาสเรียน) */}
          <div className="reveal rounded-3xl border border-amber-300 bg-paper p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">
                    {lang === 'th' ? 'Leaderboard อันดับประจำสัปดาห์' : 'Weekly Class Leaderboard'}
                  </h3>
                  <p className="text-[10px] text-grey-500">
                    {lang === 'th' ? 'อันดับผู้เรียนที่มี XP สูงสุดในคลาส' : 'Top XP leaders in active course'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Top 5
              </span>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-2">
              {leaderboardData.map((player) => {
                const isMe = player.name === currentStudent.name || player.nickname === currentStudent.nickname
                return (
                  <div
                    key={player.rank}
                    className={cn(
                      'flex items-center justify-between rounded-2xl p-2.5 sm:p-3 border transition-all',
                      isMe
                        ? 'bg-pink-50/90 border-pink-300 shadow-xs'
                        : 'bg-canvas border-grey-300/40 hover:bg-grey-50',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0',
                          player.rank === 1 && 'bg-amber-100 text-amber-700 border border-amber-300',
                          player.rank === 2 && 'bg-slate-200 text-slate-700 border border-slate-300',
                          player.rank === 3 && 'bg-amber-700/10 text-amber-800 border border-amber-700/20',
                          player.rank > 3 && 'bg-canvas text-grey-600 border border-grey-300/40',
                        )}
                      >
                        {player.rank === 1 ? <Trophy className="h-3.5 w-3.5 fill-amber-400 text-amber-600" /> : player.rank}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-ink truncate">{player.name}</span>
                          <span className="text-[11px] font-semibold text-pink-600 truncate">
                            "{player.nickname}"
                          </span>
                          {isMe && (
                            <span className="rounded-full bg-pink-600 px-1.5 py-0.2 text-[9px] font-black text-white shrink-0">
                              {lang === 'th' ? 'คุณ' : 'You'}
                            </span>
                          )}
                        </div>
                        <span className="inline-block rounded-md bg-paper px-1.5 py-0.5 text-[9px] font-medium text-grey-600 border border-grey-300/40 truncate">
                          {player.faculty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{player.xp} XP</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick 3D Campus & 2D Map Gateways */}
          <div className="reveal rounded-3xl border border-grey-300/60 bg-paper p-5 space-y-3">
            <h3 className="text-xs font-black text-ink uppercase tracking-wider">
              {lang === 'th' ? 'สำรวจมหาวิทยาลัย SPU' : 'Explore SPU Campus'}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/campus')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 text-center transition-all cursor-pointer group"
              >
                <div className="h-9 w-9 rounded-xl bg-pink-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-black text-ink">{lang === 'th' ? 'แคมปัส 3D' : '3D Campus'}</span>
                <span className="text-[10px] text-grey-500">{lang === 'th' ? 'เดินสำรวจ' : 'Walk around'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/map')}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-center transition-all cursor-pointer group"
              >
                <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Map className="h-5 w-5" />
                </div>
                <span className="text-xs font-black text-ink">{lang === 'th' ? 'แผนที่ 2D' : '2D Map'}</span>
                <span className="text-[10px] text-grey-500">{lang === 'th' ? 'ภาพรวมแคมปัส' : 'Top-down'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
