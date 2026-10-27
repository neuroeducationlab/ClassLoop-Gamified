import { useState } from 'react'
import { CheckCircle2, FileText, PlayCircle, XCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import Section, { XPChip } from './Section'

const XP_VIDEO = 10
const XP_CORRECT = 10
const XP_SUBMIT = 30

/** Faculty hall: lessons, a pre-class video, the quiz and the graded assignment. */
export default function FacultyHall() {
  const { topics, course, remediation, generatedContent, assignments, submitAssignment, addXP, lang } = useApp()
  const video = remediation.resources.find((r) => r.type === 'video')
  const [watched, setWatched] = useState(false)

  return (
    <>
      <Section
        title={lang === 'th' ? `บทเรียน · ${course.code}` : `Lessons · ${course.code}`}
        sub={course.name}
      >
        <ol className="space-y-2">
          {topics.map((t) => (
            <li key={t.id} className="flex gap-3 rounded-2xl bg-canvas p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                W{t.week}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{t.title}</p>
                <p className="text-xs text-grey-600">{t.learningObjective}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {video && (
        <Section title={lang === 'th' ? 'วิดีโอก่อนเรียน · Pre-class video' : 'Pre-Class Video'}>
          <button
            onClick={() => {
              if (!watched) addXP(XP_VIDEO)
              setWatched(true)
            }}
            className="relative flex aspect-video w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#3A3D7A] to-[#7C9BE8] text-white cursor-pointer"
          >
            {watched ? <CheckCircle2 className="h-14 w-14" /> : <PlayCircle className="h-14 w-14" />}
            <span className="px-4 text-sm font-semibold">{video.title}</span>
            {watched && <XPChip amount={XP_VIDEO} />}
          </button>
        </Section>
      )}

      <Section
        title={lang === 'th' ? 'แบบทดสอบก่อนเรียน · Quiz' : 'Pre-Class Quiz'}
        sub={
          lang === 'th'
            ? `${generatedContent.pretest.length} ข้อ · +${XP_CORRECT} XP ต่อข้อที่ถูก`
            : `${generatedContent.pretest.length} questions · +${XP_CORRECT} XP per correct answer`
        }
      >
        <Quiz onCorrect={() => addXP(XP_CORRECT)} lang={lang} />
      </Section>

      <Section title={lang === 'th' ? 'งานที่ต้องส่ง · Graded work' : 'Graded Assignments'}>
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-canvas p-3">
              <FileText className="h-5 w-5 shrink-0 text-grey-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{a.title}</p>
                <p className="text-xs text-grey-600">
                  {lang === 'th' ? `ส่งภายใน ${a.dueDate}` : `Due: ${a.dueDate}`}
                </p>
              </div>
              {a.submitted ? (
                <span className="text-xs font-bold text-green-600">
                  {lang === 'th' ? 'ส่งแล้ว ✓' : 'Submitted ✓'}
                </span>
              ) : (
                <button
                  onClick={() => {
                    submitAssignment(a.id)
                    addXP(XP_SUBMIT)
                  }}
                  className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-bold text-paper hover:bg-pink-500 cursor-pointer"
                >
                  {lang === 'th' ? `ส่งงาน +${XP_SUBMIT}` : `Submit +${XP_SUBMIT}`}
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function Quiz({ onCorrect, lang }: { onCorrect: () => void; lang: 'th' | 'en' }) {
  const { generatedContent } = useApp()
  const questions = generatedContent.pretest
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  if (index >= questions.length) {
    return (
      <div className="rounded-2xl bg-canvas p-6 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 font-bold text-ink">
          {lang === 'th'
            ? `ได้ ${score}/${questions.length} ข้อ`
            : `Score: ${score}/${questions.length} correct`}
        </p>
        <button
          onClick={() => {
            setIndex(0)
            setPicked(null)
            setScore(0)
          }}
          className="mt-3 text-sm font-semibold text-pink-600 underline underline-offset-4 cursor-pointer"
        >
          {lang === 'th' ? 'ทำอีกครั้ง' : 'Retake Quiz'}
        </button>
      </div>
    )
  }

  const q = questions[index]
  const answered = picked !== null

  return (
    <div>
      <p className="text-xs font-semibold text-grey-600">
        {lang === 'th'
          ? `ข้อ ${index + 1}/${questions.length}`
          : `Question ${index + 1}/${questions.length}`}
      </p>
      <p className="mt-1 font-bold text-ink">{q.stem}</p>
      <div className="mt-3 space-y-2">
        {q.options.map((opt, i) => {
          const correct = i === q.answerIndex
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                if (correct) {
                  setScore((s) => s + 1)
                  onCorrect()
                }
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors cursor-pointer',
                !answered && 'border-grey-300/80 hover:border-blue-500 hover:bg-blue-50/40',
                answered && correct && 'border-green-500 bg-green-50 font-semibold text-green-700',
                answered && !correct && i === picked && 'border-red-400 bg-red-50 text-red-600',
                answered && !correct && i !== picked && 'border-grey-300/60 opacity-60',
              )}
            >
              {answered && correct && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {answered && !correct && i === picked && <XCircle className="h-4 w-4 shrink-0" />}
              <span>{opt}</span>
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-3 flex items-center justify-between gap-3">
          {picked === q.answerIndex ? (
            <XPChip amount={XP_CORRECT} />
          ) : (
            <p className="text-xs text-grey-600">💡 {q.misconception}</p>
          )}
          <button
            onClick={() => {
              setIndex((i) => i + 1)
              setPicked(null)
            }}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
          >
            {lang === 'th' ? 'ข้อต่อไป →' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  )
}
