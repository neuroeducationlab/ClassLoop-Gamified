import { useState } from 'react'
import { Send, Sparkles, Flame, HelpCircle, Lightbulb, AlertTriangle, MessageSquare } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playClickSound, playCoinSound, playXPSparkle, playLevelUpSound } from '../soundEngine'

const MYSTERY_AVATARS = [
  { id: 'fox', label: '🦊 Fox Sage #42', emoji: '🦊', faculty: { th: 'สถาปัตย์', en: 'Architecture' } },
  { id: 'owl', label: '🦉 Night Owl #17', emoji: '🦉', faculty: { th: 'วิศวะคอมฯ', en: 'Computer Eng.' } },
  { id: 'dolphin', label: '🐬 Cyber Dolphin #88', emoji: '🐬', faculty: { th: 'ดิจิทัลมีเดีย', en: 'Digital Media' } },
  { id: 'raccoon', label: '🦝 Shadow Raccoon #05', emoji: '🦝', faculty: { th: 'บริหารธุรกิจ', en: 'Business Admin' } },
  { id: 'lion', label: '🦁 Brave Lion #99', emoji: '🦁', faculty: { th: 'นิเทศศาสตร์', en: 'Comm. Arts' } },
]

type QuestionCategory = 'sos' | 'quest' | 'spark'

const TEXT = {
  th: {
    sanctuaryTitle: 'ศาลานิรนามแห่งความลับ & ตู้คำถามกิลด์มาสเตอร์',
    sanctuarySubTeacher: 'อาจารย์กำลังเข้าสู่ โหมดกิลด์มาสเตอร์ — ตอบคำถามและให้คำแนะนำแก่นักศึกษาโดยไม่เปิดเผยตัวตนของพวกเขา',
    sanctuarySubStudent: 'พื้นที่ปลอดภัยแบบเกม RPG สวมหน้ากากปริศนาถามข้อสงสัยได้เต็มที่ ไม่มีใครรู้ชื่อจริงของคุณ แม้แต่อาจารย์!',
    askBoxTitle: 'ส่งคำถามปริศนาถึงกิลด์มาสเตอร์ (อาจารย์)',
    xpReward: '+15 XP เมื่อตั้งคำถาม',
    categoryLabel: 'หมวดหมู่:',
    catSos: 'เร่งด่วน / SOS',
    catQuest: 'ข้อสงสัยลึกซึ้ง',
    catSpark: 'ไอเดียกิจกรรม',
    personaLabel: 'ตัวตนแฝงของคุณ:',
    placeholder: "พิมพ์คำถามหรือข้อสงสัยที่นี่อย่างสบายใจ เช่น 'ไม่เข้าใจโมเดล Hofstede ในส่วน Long-term Orientation อยากให้อาจารย์ยกตัวอย่างธุรกิจจริง…'",
    sentSuccess: '✓ ส่งคำถามลึกลับสำเร็จแล้ว! (รับ +15 XP)',
    safeBadge: '🔒 ส่งผ่านม่านเวทมนตร์ ปลอดภัย 100%',
    submitBtn: 'ส่งคำถามแบบนิรนาม',
    boardTitle: 'กระดานคำถามจากเพื่อนร่วมคลาส',
    boardSub: 'โหวตข้อสงสัยที่คุณเห็นด้วยได้',
    anonStudent: 'นักศึกษาปริศนา',
    sameQuestion: 'สงสัยเหมือนกัน',
    teacherAdvice: '📜 คำแนะนำจากอาจารย์ (Guild Master):',
    teacherPlaceholder: 'ตอบคำถามของนักศึกษาในฐานะกิลด์มาสเตอร์…',
    replyBtn: 'ตอบกลับ',
  },
  en: {
    sanctuaryTitle: 'Secret Sanctuary & Guild Master Oracle',
    sanctuarySubTeacher: 'You are in Guild Master Mode — Answer questions and guide students while preserving their total anonymity.',
    sanctuarySubStudent: 'A safe RPG sanctuary to ask anything under a mystery mask. No one knows your real name, not even professors!',
    askBoxTitle: 'Submit Anonymous Inquiry to Guild Master',
    xpReward: '+15 XP per question',
    categoryLabel: 'Category:',
    catSos: 'Urgent / SOS',
    catQuest: 'Deep Inquiry',
    catSpark: 'Creative Spark',
    personaLabel: 'Your Mystery Persona:',
    placeholder: "Ask freely without hesitation, e.g. 'Could you clarify the practical application of Hofstede’s Cultural Dimensions in real-world startup strategy?'",
    sentSuccess: '✓ Secret inquiry submitted successfully! (+15 XP)',
    safeBadge: '🔒 100% Encrypted & Anonymous',
    submitBtn: 'Submit Anonymous Inquiry',
    boardTitle: 'Classmate Anonymous Inquiries',
    boardSub: 'Upvote questions you also wonder about',
    anonStudent: 'Mystery Scholar',
    sameQuestion: 'Wondering too',
    teacherAdvice: '📜 Advice from Guild Master (Instructor):',
    teacherPlaceholder: 'Answer this inquiry as Guild Master…',
    replyBtn: 'Reply',
  },
}

/**
 * Gamified Heart Dorm: Guild Master's Secret Oracle Sanctuary
 * Students ask questions completely anonymously with cool mystery RPG personas,
 * teachers answer as the Guild Master with XP bounties, and peers upvote!
 */
export default function HeartDorm() {
  const { role, posts, addPost, addReply, addXP, lang } = useApp()
  const t = TEXT[lang] || TEXT.en
  const anon = posts.filter((p) => p.isAnonymous)
  const [draft, setDraft] = useState('')
  const [selectedPersona, setSelectedPersona] = useState(MYSTERY_AVATARS[0])
  const [category, setCategory] = useState<QuestionCategory>('sos')
  const [sent, setSent] = useState(false)
  const [upvotes, setUpvotes] = useState<Record<string, number>>({})

  const handleUpvote = (postId: string) => {
    setUpvotes((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }))
    playCoinSound()
    addXP(5) // Award tiny XP for curating / participating
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    const prefix =
      category === 'sos'
        ? lang === 'en'
          ? '[🔴 Urgent / SOS] '
          : '[🔴 SOS เร่งด่วน] '
        : category === 'quest'
        ? lang === 'en'
          ? '[🟡 Deep Inquiry] '
          : '[🟡 ข้อสงสัยลึกซึ้ง] '
        : lang === 'en'
        ? '[🟢 Creative Spark] '
        : '[🟢 ไอเดียสร้างสรรค์] '

    const facultyStr = selectedPersona.faculty[lang] || selectedPersona.faculty.en
    const senderSuffix = lang === 'en'
      ? ` — Posted by ${selectedPersona.label} (${facultyStr})`
      : ` — ส่งโดย ${selectedPersona.label} (${facultyStr})`

    addPost(`${prefix}${draft}${senderSuffix}`, true, 'ฟีดแบค')
    playXPSparkle()
    setDraft('')
    setSent(true)
    addXP(15) // Reward for asking a good question
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* ── Sanctuary Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/80 via-[#16182E] to-purple-950/80 p-5 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-2xl border border-teal-400/40 shadow-inner">
            🎭
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {t.sanctuaryTitle}
              </h2>
              <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-400/30">
                100% Anonymous
              </span>
            </div>
            <p className="mt-1 text-xs text-white/75 leading-relaxed">
              {role === 'teacher' ? t.sanctuarySubTeacher : t.sanctuarySubStudent}
            </p>
          </div>
        </div>
      </div>

      {/* ── Student Question Submission Box (Gamified Quest Ask) ── */}
      {role === 'student' && (
        <div className="rounded-3xl border border-white/15 bg-black/40 p-5 text-white backdrop-blur-xl shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📜</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                {t.askBoxTitle}
              </h3>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {t.xpReward}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Category selection tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/60">{t.categoryLabel}</span>
              <button
                type="button"
                onClick={() => {
                  playClickSound()
                  setCategory('sos')
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  category === 'sos'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <AlertTriangle className="h-3 w-3" /> {t.catSos}
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound()
                  setCategory('quest')
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  category === 'quest'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <HelpCircle className="h-3 w-3" /> {t.catQuest}
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound()
                  setCategory('spark')
                }}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                  category === 'spark'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                }`}
              >
                <Lightbulb className="h-3 w-3" /> {t.catSpark}
              </button>
            </div>

            {/* Persona Selector */}
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-2 text-xs border border-white/10">
              <span className="text-white/60 text-[11px] shrink-0">{t.personaLabel}</span>
              <div className="flex flex-wrap gap-1.5">
                {MYSTERY_AVATARS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPersona(m)}
                    className={`rounded-xl px-2 py-1 text-[11px] font-bold transition-all ${
                      selectedPersona.id === m.id
                        ? 'bg-teal-500 text-white shadow'
                        : 'bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={t.placeholder}
              className="w-full resize-none rounded-2xl border border-white/15 bg-black/50 p-3.5 text-xs text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
            />

            {/* Submit & Status Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-400 font-bold">
                {sent ? t.sentSuccess : t.safeBadge}
              </span>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t.submitBtn}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Anonymous Questions & Oracle Wisdom Feed ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-teal-400" />
            {t.boardTitle} ({anon.length})
          </h3>
          <span className="text-[11px] text-white/50">{t.boardSub}</span>
        </div>

        <div className="space-y-3">
          {anon.map((p) => {
            const votes = (upvotes[p.id] || 0) + (p.reactions?.['💡'] || 2)

            return (
              <div
                key={p.id}
                className="rounded-3xl border border-white/15 bg-black/45 p-4 text-white backdrop-blur-md shadow-lg transition-all hover:border-white/25"
              >
                {/* Author Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-base border border-teal-400/30">
                      🎭
                    </span>
                    <div>
                      <span className="text-xs font-bold text-teal-300">
                        {p.alias ?? t.anonStudent}
                      </span>
                      <p className="text-[10px] text-white/50">{p.createdAt}</p>
                    </div>
                  </div>

                  {/* Upvote bounty button */}
                  <button
                    onClick={() => handleUpvote(p.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
                    title={lang === 'en' ? 'Upvote to raise priority for instructor' : 'กดเห็นด้วย เพื่อเร่งให้อาจารย์เห็นไวขึ้น'}
                  >
                    <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    <span>{votes} {t.sameQuestion}</span>
                  </button>
                </div>

                {/* Question Body */}
                <p className="mt-3 text-xs leading-relaxed text-white/90">
                  {p.body}
                </p>

                {/* Oracle / Teacher Responses */}
                {p.replies && p.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                    {p.replies.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-black/60 p-3 shadow-inner"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            {r.authorRole === 'teacher' ? t.teacherAdvice : r.authorName}
                          </span>
                          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                            Insight Oracle
                          </span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed pl-4 border-l-2 border-amber-400/40">
                          {r.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teacher Reply Input Box */}
                {role === 'teacher' && <TeacherReplyBox onSend={(body) => addReply(p.id, body)} placeholder={t.teacherPlaceholder} replyText={t.replyBtn} />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TeacherReplyBox({ onSend, placeholder, replyText }: { onSend: (body: string) => void; placeholder: string; replyText: string }) {
  const [text, setText] = useState('')
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim()) return
        onSend(text)
        playLevelUpSound()
        setText('')
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white outline-none focus:border-amber-400 placeholder-white/40"
      />
      <button
        type="submit"
        className="rounded-xl bg-amber-500 px-4 text-xs font-bold text-black hover:bg-amber-400 shadow cursor-pointer transition-all"
      >
        {replyText}
      </button>
    </form>
  )
}
