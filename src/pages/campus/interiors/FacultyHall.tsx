import { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Lightbulb,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Video,
  XCircle,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import Section, { CoinChip, XPChip } from './Section'
import {
  playCoinSound,
  playCorrectSound,
  playLevelUpSound,
  playWrongSound,
  playXPSparkle,
} from '../soundEngine'

const XP_VIDEO = 15
const XP_CORRECT = 10
const XP_SUBMIT = 35

const STUDY_GUIDES = [
  {
    week: 1,
    title: 'Globalisation & International Market Entry',
    titleTh: 'โลกาภิวัตน์และการเข้าสู่ตลาดสากล',
    keyTakeaway:
      'การเลือกระหว่าง Foreign Direct Investment (FDI), Joint Venture, หรือ Licensing ขึ้นอยู่กับระดับการควบคุมและความเสี่ยงในตลาดเป้าหมาย',
    keyTakeawayEn:
      'Choosing between FDI, Joint Ventures, or Licensing depends on risk tolerance, capital readiness, and desired operational control.',
  },
  {
    week: 2,
    title: 'High-Context vs Low-Context Communication',
    titleTh: 'การสื่อสารแบบบริบทสูง vs บริบทต่ำ',
    keyTakeaway:
      'High-Context (เช่น ญี่ปุ่น, ไทย) เน้นสายสัมพันธ์ น้ำเสียง ภาษากาย และความเงียบ / Low-Context (เช่น เยอรมนี, อเมริกา) เน้นความชัดเจนตรงไปตรงมาในสัญญา',
    keyTakeawayEn:
      'High-Context (Japan, Thailand) emphasizes relationships, non-verbal cues, and harmony. Low-Context (USA, Germany) requires precise, literal clarity.',
  },
  {
    week: 3,
    title: 'Hofstede’s Cultural Dimensions Matrix',
    titleTh: 'มิติวัฒนธรรม 6 ด้านของ Hofstede',
    keyTakeaway:
      'Power Distance (PDI), Individualism (IDV), Masculinity (MAS), Uncertainty Avoidance (UAI), Long-Term Orientation (LTO), Indulgence (IVR)',
    keyTakeawayEn:
      'Core matrix: Power Distance, Individualism vs Collectivism, Masculinity vs Femininity, Uncertainty Avoidance, Long-Term Horizon, and Restraint.',
  },
  {
    week: 4,
    title: 'Glocalization & Cultural Adaptations',
    titleTh: 'กลยุทธ์คิดระดับโลก ปรับให้ตรงใจท้องถิ่น (Glocalization)',
    keyTakeaway:
      'Think Global, Act Local — รักษาวิสัยทัศน์ของแบรนด์หลัก แต่ปรับเมนู บริการ และแคมเปญให้เข้ากับวิถีชีวิตของชุมชนท้องถิ่นอย่างเคารพ',
    keyTakeawayEn:
      'Think Global, Act Local — Safeguard brand integrity while thoughtfully adapting product features, flavor palettes, and local marketing resonance.',
  },
]

/**
 * FacultyHall: High-Tech Cyber Lecture Amphitheater (Building 1)
 * Features dynamic lesson syllabi, study guide tablet, holographic pre-class video terminal,
 * gamified pre-test assessment with combo multiplier, and quest assignment submitter.
 */
export default function FacultyHall() {
  const {
    topics,
    course,
    remediation,
    generatedContent,
    assignments,
    submitAssignment,
    addXP,
    addCoins,
    lang,
  } = useApp()
  const video = remediation.resources.find((r) => r.type === 'video')
  const [watched, setWatched] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  const handleWatchVideo = () => {
    if (!watched) {
      addXP(XP_VIDEO)
      addCoins(10)
      playCoinSound()
      playXPSparkle()
    }
    setWatched(true)
  }

  const handleSubmit = (id: string) => {
    submitAssignment(id)
    addXP(XP_SUBMIT)
    addCoins(25)
    playLevelUpSound()
    playCoinSound()
    setSubmittedId(id)
    setTimeout(() => setSubmittedId(null), 3000)
  }

  return (
    <>
      {/* ── Active Course Syllabus Section ── */}
      <Section
        title={lang === 'th' ? `หลักสูตรรายวิชา · ${course.code}` : `Course Syllabus · ${course.code}`}
        sub={course.name}
        icon={<BookOpen className="h-4 w-4 text-blue-400" />}
      >
        <ol className="space-y-2.5">
          {topics.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition-all hover:border-blue-400/40 hover:bg-white/10"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 text-xs font-black text-blue-300 shadow-inner">
                W{t.week}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white tracking-wide">{t.title}</p>
                  <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                    Week {t.week}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/70 leading-relaxed">{t.learningObjective}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Holographic Study Guide & Cheat Sheet Tablet ── */}
      <Section
        title={lang === 'th' ? 'คลังสรุปเนื้อหาสำคัญ · Holographic Notes' : 'Holographic Study Archive'}
        sub={
          lang === 'th'
            ? 'สรุปแก่นประเด็นที่มักออกสอบประจำสัปดาห์ สำหรับทบทวนล่วงหน้า'
            : 'Key conceptual takeaways & high-yield exam points for pre-study'
        }
        icon={<Sparkles className="h-4 w-4 text-emerald-400" />}
      >
        <div className="space-y-2">
          {STUDY_GUIDES.map((sg) => {
            const isExpanded = expandedWeek === sg.week
            return (
              <div
                key={sg.week}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all"
              >
                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : sg.week)}
                  className="flex w-full items-center justify-between p-3.5 text-left hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-xs font-extrabold text-emerald-300">
                      W{sg.week}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {lang === 'th' ? sg.titleTh : sg.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/60" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/60" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/30 p-3.5 text-xs leading-relaxed text-emerald-200/90 animate-in fade-in duration-200">
                    <p className="font-semibold text-amber-300 mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      {lang === 'th' ? 'หัวใจสำคัญที่ต้องจำ:' : 'Core Exam Takeaway:'}
                    </p>
                    <p>{lang === 'th' ? sg.keyTakeaway : sg.keyTakeawayEn}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── Pre-Class Holographic Video Section ── */}
      {video && (
        <Section
          title={lang === 'th' ? 'วิดีโอปูพื้นฐานก่อนเข้าเรียน' : 'Pre-Class Holographic Video'}
          sub={
            lang === 'th'
              ? 'รับชมเพื่อทำความเข้าใจล่วงหน้าและรับคะแนนโบนัส XP'
              : 'Watch before class to unlock foundational concepts & bonus XP'
          }
          icon={<Video className="h-4 w-4 text-purple-400" />}
          action={
            watched ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {lang === 'th' ? 'รับชมแล้ว' : 'Watched'}
              </span>
            ) : undefined
          }
        >
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E293B] p-5 shadow-2xl">
            {/* Ambient visualizer backdrop */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />

            <div className="relative flex flex-col items-center justify-center text-center">
              <button
                onClick={handleWatchVideo}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-purple-400/50 bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-105 hover:brightness-110 cursor-pointer"
                aria-label={video.title}
              >
                {watched ? (
                  <CheckCircle2 className="h-10 w-10 text-white" />
                ) : (
                  <PlayCircle className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>

              <h3 className="mt-4 text-base font-bold text-white max-w-md">{video.title}</h3>
              <p className="mt-1 text-xs text-white/60">
                Duration: 08:45 · Sripatum University Digital Classroom
              </p>

              {/* Holographic Equalizer Bar */}
              <div className="mt-4 flex items-end justify-center gap-1 h-4">
                {[40, 75, 55, 90, 65, 80, 45, 95, 70, 60].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-purple-400/80 animate-pulse"
                    style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {watched ? (
                  <div className="flex items-center gap-2">
                    <XPChip amount={XP_VIDEO} label="Earned" />
                    <CoinChip amount={10} />
                  </div>
                ) : (
                  <button
                    onClick={handleWatchVideo}
                    className="rounded-xl bg-purple-600/30 border border-purple-400/40 px-4 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-600/50 transition-all cursor-pointer"
                  >
                    {lang === 'th' ? `ดูจบรับ +${XP_VIDEO} XP & +10 Coins` : `Watch to claim +${XP_VIDEO} XP & +10 Coins`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ── Gamified Pre-Class Quiz Terminal ── */}
      <Section
        title={lang === 'th' ? 'แบบทดสอบประเมินความพร้อม · Pre-Test' : 'Interactive Pre-Class Assessment'}
        sub={
          lang === 'th'
            ? `${generatedContent.pretest.length} ข้อ · ตอบถูกรับ +${XP_CORRECT} XP ต่อข้อ`
            : `${generatedContent.pretest.length} questions · Earn +${XP_CORRECT} XP per correct answer`
        }
        icon={<Sparkles className="h-4 w-4 text-amber-400" />}
      >
        <QuizTerminal
          onCorrect={() => {
            addXP(XP_CORRECT)
            addCoins(5)
          }}
          lang={lang}
        />
      </Section>

      {/* ── Graded Quests & Assignments Board ── */}
      <Section
        title={lang === 'th' ? 'กระดานภารกิจและการบ้าน · Quest Board' : 'Graded Coursework & Quests'}
        sub={
          lang === 'th'
            ? 'ส่งงานตามกำหนดเพื่อสะสม XP และเหรียญสำหรับปลดล็อกไอเทม'
            : 'Submit coursework on time to accumulate XP and Coins'
        }
        icon={<FileText className="h-4 w-4 text-pink-400" />}
      >
        <ul className="space-y-3">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-pink-500/40"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">{a.title}</p>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/70">
                      Quest
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-300" />
                      {lang === 'th' ? `กำหนดส่ง: ${a.dueDate}` : `Due: ${a.dueDate}`}
                    </span>
                    <span className="text-amber-300 font-bold">+{XP_SUBMIT} XP</span>
                    <span className="text-yellow-300 font-bold">+25 Coins</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                {a.submitted || submittedId === a.id ? (
                  <span className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-2 text-xs font-extrabold text-emerald-300 shadow-sm animate-in zoom-in-75">
                    <CheckCircle2 className="h-4 w-4" />
                    {lang === 'th' ? 'ส่งเรียบร้อย ✓' : 'Submitted ✓'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleSubmit(a.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all cursor-pointer"
                  >
                    <span>{lang === 'th' ? 'ส่งการบ้าน' : 'Submit Quest'}</span>
                    <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px]">
                      +{XP_SUBMIT} XP
                    </span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function QuizTerminal({ onCorrect, lang }: { onCorrect: () => void; lang: 'th' | 'en' }) {
  const { generatedContent } = useApp()
  const questions = generatedContent.pretest
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  if (index >= questions.length) {
    return (
      <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-transparent p-6 text-center backdrop-blur-md animate-in zoom-in-95">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl border border-amber-400/40 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          🏆
        </div>
        <h3 className="mt-3 text-lg font-black text-white">
          {lang === 'th' ? 'ทำแบบทดสอบครบถ้วนแล้ว!' : 'Assessment Completed!'}
        </h3>
        <p className="mt-1 text-sm font-semibold text-amber-300">
          {lang === 'th'
            ? `คุณทำได้ ${score}/${questions.length} ข้อ · รับคะแนน XP เข้าสู่กระเป๋าแล้ว!`
            : `Score: ${score}/${questions.length} correct · XP rewards added to your pass!`}
        </p>
        <button
          onClick={() => {
            setIndex(0)
            setPicked(null)
            setScore(0)
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {lang === 'th' ? 'ฝึกฝนอีกครั้ง' : 'Retake Assessment'}
        </button>
      </div>
    )
  }

  const q = questions[index]
  const answered = picked !== null

  return (
    <div className="space-y-4">
      {/* Progress & Question Counter */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
          {lang === 'th' ? `ข้อที่ ${index + 1} จาก ${questions.length}` : `Question ${index + 1} of ${questions.length}`}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70">
          Score: {score}
        </span>
      </div>

      {/* Question Stem */}
      <p className="text-sm font-bold leading-relaxed text-white">{q.stem}</p>

      {/* Answer Choices */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answerIndex
          const isSelected = i === picked

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                if (isCorrect) {
                  setScore((s) => s + 1)
                  playCorrectSound()
                  playXPSparkle()
                  onCorrect()
                } else {
                  playWrongSound()
                }
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer',
                !answered &&
                  'border-white/10 bg-white/5 text-white/90 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-white',
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
                <span>{opt}</span>
              </span>
              {answered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              {answered && !isCorrect && isSelected && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
            </button>
          )
        })}
      </div>

      {/* Answer feedback & Next button */}
      {answered && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="min-w-0 flex-1">
            {picked === q.answerIndex ? (
              <div className="flex items-center gap-2">
                <XPChip amount={XP_CORRECT} label="Correct!" />
                <CoinChip amount={5} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-300">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="truncate">{q.misconception}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIndex((i) => i + 1)
              setPicked(null)
            }}
            className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            {lang === 'th' ? 'ข้อต่อไป →' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  )
}
