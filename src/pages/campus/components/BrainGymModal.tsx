import { useEffect, useState } from 'react'
import { Check, X, RotateCcw, ArrowRight, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playCorrectSound, playWrongSound } from '../soundEngine'
import { GameIcon } from '@/components/icons/GameIcon'

interface DrillQuestion {
  id: number
  stem: string
  stemEn: string
  options: string[]
  optionsEn: string[]
  answer: number
  explanation: string
  explanationEn: string
}

// Kept short on purpose: one line of question, one line per answer, one line of why.
const DRILL_QUESTIONS: DrillQuestion[] = [
  {
    id: 1,
    stem: 'เจรจาธุรกิจกับคนญี่ปุ่น (วัฒนธรรม High-Context) ควรทำแบบไหน?',
    stemEn: 'Negotiating with Japanese partners (a high-context culture). What works best?',
    options: [
      'เร่งปิดดีลให้ได้ในวันแรก',
      'ปูทางสร้างฉันทามติก่อน (Nemawashi) และเคารพอาวุโส',
      'แสดงอารมณ์ให้เห็นความจริงใจ',
      'ข้ามการแลกนามบัตรแบบเป็นทางการ',
    ],
    optionsEn: [
      'Push to close the deal on day one',
      'Build consensus first (Nemawashi) and respect seniority',
      'Show strong emotion to prove sincerity',
      'Skip the formal business-card exchange',
    ],
    answer: 1,
    explanation: 'ญี่ปุ่นเป็น High-Context: ต้องปูทางสร้างฉันทามติก่อน (Nemawashi) และเคารพอาวุโส',
    explanationEn: 'Japan is high-context: build consensus quietly first (Nemawashi) and follow seniority.',
  },
  {
    id: 2,
    stem: 'ใน Hofstede Model ค่า Power Distance (PDI) สูง หมายถึงอะไร?',
    stemEn: 'In Hofstede\'s model, what does a high Power Distance (PDI) mean?',
    options: [
      'พนักงานกับหัวหน้ามีสิทธิ์ตัดสินใจเท่ากัน',
      'ยอมรับลำดับชั้น การตัดสินใจมาจากบนลงล่าง',
      'องค์กรหลีกเลี่ยงความเสี่ยงทุกอย่าง',
      'ทุกขั้นตอนต้องโหวตร่วมกัน',
    ],
    optionsEn: [
      'Staff and managers have an equal say',
      'Hierarchy is accepted; decisions come top-down',
      'The company avoids every risk',
      'Every step needs a team vote',
    ],
    answer: 1,
    explanation: 'PDI สูง = ยอมรับความต่างของอำนาจ การตัดสินใจส่วนใหญ่มาจากผู้บริหาร',
    explanationEn: 'High PDI = people accept unequal power, so decisions mostly come from the top.',
  },
  {
    id: 3,
    stem: '"Glocalization" หมายถึงอะไร?',
    stemEn: 'What does "Glocalization" mean?',
    options: [
      'ใช้สินค้าและโฆษณาเหมือนกันทั่วโลก',
      'ปรับสินค้าระดับโลกให้เข้ากับท้องถิ่น (Think Global, Act Local)',
      'ขายเฉพาะตลาดในประเทศ',
      'นำเข้าสินค้ามาขายโดยไม่ปรับเลย',
    ],
    optionsEn: [
      'Same product and ads everywhere',
      'Adapt a global product to local taste (think global, act local)',
      'Sell only in the home market',
      'Import goods without any changes',
    ],
    answer: 1,
    explanation: 'Glocalization = คิดระดับโลก ทำแบบท้องถิ่น ปรับสินค้าและการสื่อสารให้เข้ากับแต่ละตลาด',
    explanationEn: 'Glocalization = think global, act local: adapt the product and message to each market.',
  },
]

const LETTERS = ['A', 'B', 'C', 'D']

export default function BrainGymModal({ onClose }: { onClose: () => void }) {
  const { addXP, addCoins, lang } = useApp()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const th = lang === 'th'

  // Esc closes, like every other campus modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = DRILL_QUESTIONS[currentIdx]
  const stem = th ? q.stem : q.stemEn
  const options = th ? q.options : q.optionsEn
  const explanation = th ? q.explanation : q.explanationEn
  const last = currentIdx + 1 === DRILL_QUESTIONS.length
  const correct = selectedOpt === q.answer

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelectedOpt(idx)
    setAnswered(true)
    if (idx === q.answer) {
      setScore((s) => s + 1)
      playCorrectSound()
    } else {
      playWrongSound()
    }
  }

  const handleNext = () => {
    if (!last) {
      setCurrentIdx((c) => c + 1)
      setSelectedOpt(null)
      setAnswered(false)
    } else {
      setFinished(true)
      addXP(50 + score * 20)
      addCoins(30 + score * 10)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelectedOpt(null)
    setAnswered(false)
    setScore(0)
    setFinished(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-300"
      // a click outside the card closes it
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#16182E]/95 p-5 text-white shadow-2xl sm:p-6">
        <button
          onClick={onClose}
          aria-label={th ? 'ปิด' : 'Close'}
          className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/25 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {!finished ? (
          <div>
            {/* Header: name + progress, nothing else */}
            <div className="mb-4 flex items-center gap-3 pr-12">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-xl shadow-lg">
                <GameIcon name="brain" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold">{th ? 'ลานฝึกสมอง' : 'Brain Gym'}</h3>
                <div className="mt-1 flex items-center gap-1.5" aria-label={`${currentIdx + 1} / ${DRILL_QUESTIONS.length}`}>
                  {DRILL_QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i < currentIdx ? 'w-5 bg-cyan-400' : i === currentIdx ? 'w-8 bg-cyan-300' : 'w-5 bg-white/15'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[11px] font-semibold text-white/50">
                    {currentIdx + 1}/{DRILL_QUESTIONS.length}
                  </span>
                </div>
              </div>
            </div>

            <p className="mb-3 text-base font-bold leading-snug sm:text-lg">{stem}</p>

            {/* The call to action, until an answer is picked */}
            {!answered && (
              <p className="mb-2 text-sm font-semibold text-cyan-300">{th ? 'แตะคำตอบที่ถูก' : 'Tap the right answer'}</p>
            )}

            <div className="mb-4 space-y-2">
              {options.map((opt, idx) => {
                const isSelected = selectedOpt === idx
                const isCorrect = idx === q.answer
                let style = 'border-white/15 bg-white/5 hover:border-cyan-300/70 hover:bg-white/10'
                let chip = 'bg-white/10 text-white/80'
                if (answered) {
                  if (isCorrect) {
                    style = 'border-emerald-400 bg-emerald-950/60 text-emerald-100'
                    chip = 'bg-emerald-400 text-emerald-950'
                  } else if (isSelected) {
                    style = 'border-rose-400 bg-rose-950/60 text-rose-100'
                    chip = 'bg-rose-400 text-rose-950'
                  } else {
                    style = 'border-white/5 bg-white/5 opacity-40'
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left text-sm font-medium transition-all disabled:cursor-default ${style}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${chip}`}>
                      {LETTERS[idx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && isCorrect && <Check className="h-5 w-5 shrink-0 text-emerald-300" />}
                    {answered && isSelected && !isCorrect && <X className="h-5 w-5 shrink-0 text-rose-300" />}
                  </button>
                )
              })}
            </div>

            {answered && (
              <div className="animate-in fade-in">
                <p className="mb-3 text-sm leading-relaxed text-white/85">
                  <span className={`font-extrabold ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {correct ? (th ? 'ถูกต้อง! ' : 'Correct! ') : th ? 'ยังไม่ใช่ ' : 'Not quite. '}
                  </span>
                  {explanation}
                </p>
                <button
                  onClick={handleNext}
                  autoFocus
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold shadow-lg transition-all hover:brightness-110"
                >
                  {last ? (th ? 'ดูผลคะแนน' : 'See my score') : th ? 'ข้อถัดไป' : 'Next question'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 animate-bounce items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-4xl shadow-xl">
              <GameIcon name="trophy" className="text-amber-900" />
            </span>
            <h3 className="text-xl font-black">
              {th ? `ถูก ${score} จาก ${DRILL_QUESTIONS.length} ข้อ` : `${score} of ${DRILL_QUESTIONS.length} correct`}
            </h3>

            <div className="my-5 flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-300">
                <Zap className="h-4 w-4 fill-amber-400" />
                <span>+{50 + score * 20} XP</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-yellow-300">
                <GameIcon name="coin" />
                <span>+{30 + score * 10}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              autoFocus
              className="mb-2 flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 py-3 text-sm font-bold shadow-lg transition-all hover:brightness-110"
            >
              {th ? 'กลับสู่แคมปัส' : 'Back to campus'}
            </button>
            <button
              onClick={handleRestart}
              className="mx-auto flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {th ? 'เล่นอีกครั้ง' : 'Play again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
