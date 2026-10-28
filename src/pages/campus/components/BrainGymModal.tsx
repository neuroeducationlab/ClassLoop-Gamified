import { useState } from 'react'
import { Check, X, RotateCcw, ArrowRight, Zap } from 'lucide-react'
import { useApp } from '@/context/AppContext'

interface DrillQuestion {
  id: number
  stem: string
  stemEn: string
  sub: string
  subEn: string
  options: string[]
  optionsEn: string[]
  answer: number
  explanation: string
  explanationEn: string
}

const DRILL_QUESTIONS: DrillQuestion[] = [
  {
    id: 1,
    stem: 'ในการเจรจาการค้ากับนักธุรกิจชาวญี่ปุ่น (High-Context Culture) ข้อใดถูกต้องที่สุด?',
    stemEn: 'When negotiating business with Japanese partners (High-Context Culture), which strategy is most appropriate?',
    sub: 'หัวข้อการสื่อสารและการเจรจาข้ามวัฒนธรรม',
    subEn: 'Cross-Cultural Communication & Negotiation',
    options: [
      'พูดตรงไปตรงมาและปิดดีลให้เร็วที่สุดในวันแรก',
      'ให้ความสำคัญกับการสร้างความสัมพันธ์ (Nemawashi) และความเคารพในลำดับขั้น',
      'ใช้อารมณ์ร่วมเพื่อแสดงความจริงใจ',
      'ไม่จำเป็นต้องแลกนามบัตรอย่างเป็นทางการ',
    ],
    optionsEn: [
      'Be overly direct and pressure for an immediate close on Day 1',
      'Prioritize consensus-building (Nemawashi) and respect for organizational hierarchy',
      'Rely heavily on emotional displays to express sincerity',
      'Omit formal business card exchange protocols',
    ],
    answer: 1,
    explanation: 'วัฒนธรรมญี่ปุ่นเป็น High-Context และให้ความสำคัญกับการสร้างความสัมพันธ์ล่วงหน้า (Nemawashi) และความเคารพในลำดับอาวุโส',
    explanationEn: 'Japanese business culture is High-Context, emphasizing groundwork consensus (Nemawashi) and seniority protocols before closing deals.',
  },
  {
    id: 2,
    stem: 'มิติทางวัฒนธรรม "Power Distance Index (PDI)" สูง ใน Hofstede Model บ่งบอกถึงสิ่งใด?',
    stemEn: 'In Hofstede\'s Model, what does a high Power Distance Index (PDI) signify?',
    sub: 'หัวข้อ Hofstede’s Cultural Dimensions',
    subEn: 'Hofstede\'s Cultural Dimensions',
    options: [
      'พนักงานทุกคนมีอำนาจตัดสินใจเท่าเทียมกัน',
      'องค์กรยอมรับความเหลื่อมล้ำของอำนาจและมีการตัดสินใจแบบ Top-Down ชัดเจน',
      'ทุกคนในองค์กรหลีกเลี่ยงความเสี่ยง',
      'เน้นการทำงานแบบประชาธิปไตยในทุกขั้นตอน',
    ],
    optionsEn: [
      'Subordinates and managers hold strictly equal decision-making power',
      'Hierarchical authority is accepted, with clear top-down directive decisions',
      'The organization actively avoids all structural risks',
      'Consensus voting is strictly required for every workflow',
    ],
    answer: 1,
    explanation: 'ค่า PDI สูง แสดงว่าคนในสังคมหรือองค์กรยอมรับความแตกต่างของระดับชั้นอำนาจ การตัดสินใจส่วนใหญ่มาจากผู้บริหารระดับสูง',
    explanationEn: 'High PDI indicates acceptance of hierarchical inequality, where strategic decisions predominantly originate from top leadership.',
  },
  {
    id: 3,
    stem: 'แนวคิด "Glocalization" ในการบริหารธุรกิจระหว่างประเทศหมายถึงอะไร?',
    stemEn: 'What does the term "Glocalization" mean in international business management?',
    sub: 'หัวข้อ Global vs Local Strategy',
    subEn: 'Global vs Local Strategy',
    options: [
      'การดำเนินธุรกิจโดยใช้กลยุทธ์เดียวกันเป๊ะทั่วโลก',
      'การปรับผลิตภัณฑ์ระดับสากลให้เข้ากับรสนิยมและวัฒนธรรมท้องถิ่น (Think Global, Act Local)',
      'การขายสินค้าเฉพาะในตลาดท้องถิ่นเท่านั้น',
      'การนำเข้าสินค้าจากต่างประเทศโดยไม่ดัดแปลง',
    ],
    optionsEn: [
      'Enforcing identical products and marketing worldwide without modification',
      'Adapting global products to resonate with local cultural tastes (Think Global, Act Local)',
      'Restricting brand operations exclusively to domestic markets',
      'Importing foreign goods without localization or language adaptation',
    ],
    answer: 1,
    explanation: 'Glocalization (Global + Local) คือการคิดเชิงระดับสากลแต่ปรับการปฏิบัติการ ผลิตภัณฑ์ หรือการตลาดให้เข้ากับบริบทท้องถิ่น',
    explanationEn: 'Glocalization (Global + Local) represents thinking on a global scale while customizing product design and messaging to local cultural contexts.',
  },
]

export default function BrainGymModal({ onClose }: { onClose: () => void }) {
  const { addXP, addCoins, lang } = useApp()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = DRILL_QUESTIONS[currentIdx]
  const currentStem = lang === 'en' ? q.stemEn : q.stem
  const currentSub = lang === 'en' ? q.subEn : q.sub
  const currentOptions = lang === 'en' ? q.optionsEn : q.options
  const currentExplanation = lang === 'en' ? q.explanationEn : q.explanation

  const handleSelect = (idx: number) => {
    if (answered) return
    setSelectedOpt(idx)
    setAnswered(true)
    if (idx === q.answer) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentIdx + 1 < DRILL_QUESTIONS.length) {
      setCurrentIdx((c) => c + 1)
      setSelectedOpt(null)
      setAnswered(false)
    } else {
      setFinished(true)
      // Award XP and coins
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#16182E]/95 p-6 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {!finished ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg text-xl">
                🧠
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {lang === 'th' ? 'ลานฝึกสมอง & สกิลอารีน่า' : 'Brain Gym & Skill Arena'}
                  </h3>
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/30">
                    {lang === 'th' ? 'เรียนล่วงหน้า' : 'Pre-learning'}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {lang === 'th'
                    ? `ข้อ ${currentIdx + 1} จาก ${DRILL_QUESTIONS.length} · สะสมคะแนนและฝีมือก่อนเข้าคลาส`
                    : `Question ${currentIdx + 1} of ${DRILL_QUESTIONS.length} · Earn XP & Coins before class`}
                </p>
              </div>
            </div>

            {/* Question Stem */}
            <div className="rounded-2xl bg-white/5 p-4 border border-white/10 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                {currentSub}
              </span>
              <p className="text-sm font-bold text-white leading-relaxed">{currentStem}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {currentOptions.map((opt, idx) => {
                const isSelected = selectedOpt === idx
                const isCorrect = idx === q.answer

                let btnStyle = 'border-white/10 bg-white/5 hover:bg-white/10 text-white/90'
                if (answered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/60 text-emerald-200'
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-950/60 text-rose-200'
                  } else {
                    btnStyle = 'border-white/5 bg-white/5 opacity-50'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {answered && isCorrect && <Check className="h-4 w-4 text-emerald-400 shrink-0" />}
                    {answered && isSelected && !isCorrect && <X className="h-4 w-4 text-rose-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            {/* Explanation card after answered */}
            {answered && (
              <div className="rounded-xl bg-cyan-950/30 border border-cyan-500/30 p-3 mb-4 text-xs animate-in fade-in">
                <p className="font-bold text-cyan-300 mb-0.5">
                  {lang === 'th' ? 'คำอธิบายความรู้:' : 'Explanation:'}
                </p>
                <p className="text-white/80 leading-relaxed">{currentExplanation}</p>
              </div>
            )}

            {/* Bottom Next Button */}
            {answered && (
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>
                    {currentIdx + 1 < DRILL_QUESTIONS.length
                      ? lang === 'th'
                        ? 'ข้อถัดไป'
                        : 'Next Question'
                      : lang === 'th'
                      ? 'สรุปผลคะแนน'
                      : 'View Results'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Result Screen */
          <div className="text-center py-4">
            <span className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-4xl shadow-xl animate-bounce mb-3">
              🏆
            </span>
            <h3 className="text-xl font-black text-white">
              {lang === 'th' ? 'ฝึกฝนล่วงหน้าสำเร็จ!' : 'Pre-Learning Completed!'}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {lang === 'th'
                ? `คุณตอบถูก ${score} จาก ${DRILL_QUESTIONS.length} ข้อ`
                : `You scored ${score} of ${DRILL_QUESTIONS.length} correct`}
            </p>

            {/* Rewards Received */}
            <div className="my-5 flex items-center justify-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm">
                <Zap className="h-4 w-4 fill-amber-400" />
                <span>+{50 + score * 20} XP</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-yellow-300 font-extrabold text-sm">
                <span>🪙</span>
                <span>+{30 + score * 10} Coins</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{lang === 'th' ? 'ฝึกฝนอีกครั้ง' : 'Try Again'}</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span>{lang === 'th' ? 'กลับสู่แคมปัส' : 'Return to Campus'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
