import { useState } from 'react'
import { EyeOff, Send } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Section from './Section'

/**
 * Heart dorm: students talk to the teacher with their name hidden; the
 * teacher reads and replies without ever seeing who wrote it. Only
 * anonymous posts live here — named posts stay in the community board.
 */
export default function HeartDorm() {
  const { role, posts, addPost, addReply } = useApp()
  const anon = posts.filter((p) => p.isAnonymous)
  const [draft, setDraft] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <>
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-teal-50 p-4 text-teal-800">
        <EyeOff className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">
          {role === 'teacher' ? (
            <>
              <b>ชื่อนักศึกษาถูกซ่อนทั้งหมด</b> อาจารย์เห็นแค่ชื่อแฝง — คำตอบของคุณจะส่งถึงเจ้าของข้อความ
            </>
          ) : (
            <>
              <b>ชื่อของคุณจะถูกซ่อน</b> อาจารย์จะเห็นแค่ชื่อแฝงสัตว์ เล่าได้เต็มที่ ไม่มีใครรู้ว่าเป็นคุณ
            </>
          )}
        </p>
      </div>

      {role === 'student' && (
        <Section title="คุยกับอาจารย์แบบไม่ระบุชื่อ" sub="Talk to your teacher — anonymously">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              addPost(draft, true, 'ฟีดแบค')
              setDraft('')
              setSent(true)
            }}
          >
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setSent(false)
              }}
              rows={3}
              placeholder="เช่น ช่วงนี้ตามเนื้อหาไม่ทัน อยากให้อาจารย์อธิบาย Hofstede อีกรอบ…"
              className="w-full resize-none rounded-xl border border-grey-300/80 bg-canvas p-3 text-sm text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-teal-700">{sent ? '✓ ส่งแล้ว — ไม่มีชื่อของคุณติดไป' : ''}</span>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-500"
              >
                <Send className="h-4 w-4" /> ส่งแบบไม่ระบุชื่อ
              </button>
            </div>
          </form>
        </Section>
      )}

      <Section
        title={role === 'teacher' ? 'ข้อความจากนักศึกษา (ไม่ระบุชื่อ)' : 'ข้อความในหอใจ'}
        sub={`${anon.length} ข้อความ`}
      >
        <ul className="space-y-3">
          {anon.map((p) => (
            <li key={p.id} className="rounded-2xl bg-canvas p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-sm">🐾</span>
                <span className="text-sm font-bold text-ink">{p.alias ?? 'ไม่ระบุชื่อ'}</span>
                <span className="ml-auto text-[11px] text-grey-500">{p.createdAt}</span>
              </div>
              <p className="mt-2 text-sm text-ink">{p.body}</p>
              {p.replies?.map((r) => (
                <p key={r.id} className="mt-2 rounded-xl border-l-4 border-teal-400 bg-paper px-3 py-2 text-sm text-ink">
                  <b className="text-teal-700">{r.authorRole === 'teacher' ? r.authorName : r.isAnonymous ? r.authorName : 'นักศึกษา'}:</b>{' '}
                  {r.body}
                </p>
              ))}
              {role === 'teacher' && <ReplyBox onSend={(body) => addReply(p.id, body)} />}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}

function ReplyBox({ onSend }: { onSend: (body: string) => void }) {
  const [text, setText] = useState('')
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onSend(text)
        setText('')
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ตอบกลับ…"
        className="min-w-0 flex-1 rounded-xl border border-grey-300/80 bg-paper px-3 py-2 text-sm outline-none focus:border-teal-500"
      />
      <button type="submit" className="rounded-xl bg-teal-600 px-3 text-sm font-bold text-white hover:bg-teal-500">
        ส่ง
      </button>
    </form>
  )
}
