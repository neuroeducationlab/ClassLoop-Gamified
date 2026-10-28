import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playCorrectSound, playWrongSound } from '@/pages/campus/soundEngine'
import { ITEMS, RARITY, type QuestId } from './catalog'
import { ItemThumb } from './ChibiAvatar'
import { completeQuest, useWardrobe } from './store'

const Q: Record<string, { q: [string, string]; a: [string, string][]; ok: number }> = {
  'block-1': { q: ['ญี่ปุ่น: ยื่นนามบัตรอย่างไรจึงสุภาพ?', 'In Japan, how do you hand over a business card?'], a: [['ใช้สองมือ ก้มศีรษะเล็กน้อย', 'With both hands and a small bow'], ['โยนวางบนโต๊ะ', 'Toss it on the table'], ['มือเดียว แล้วเก็บกระเป๋าหลัง', 'One hand, then into your back pocket']], ok: 0 },
  'block-2': { q: ['วัฒนธรรมที่ชอบกฎชัดเจน ไม่ชอบความคลุมเครือ มีค่าอะไรสูง?', 'A culture that wants clear rules and avoids ambiguity is high in…'], a: [['Indulgence', 'Indulgence'], ['Uncertainty Avoidance', 'Uncertainty avoidance'], ['Masculinity', 'Masculinity']], ok: 1 },
  'block-3': { q: ['การสื่อสารแบบ Low-Context เป็นแบบไหน?', 'Low-context communication is…'], a: [['พูดอ้อม ๆ ให้เดาเอง', 'Indirect, read between the lines'], ['ตรงไปตรงมา ชัดเจน', 'Direct and explicit'], ['เงียบเป็นส่วนใหญ่', 'Mostly silence']], ok: 1 },
  'block-4': { q: ['ประเทศใดมีค่า Individualism สูงที่สุด?', 'Which country scores highest on individualism?'], a: [['กัวเตมาลา', 'Guatemala'], ['อินโดนีเซีย', 'Indonesia'], ['สหรัฐอเมริกา', 'United States']], ok: 2 },
  'block-5': { q: ['McDonald’s ขายเมนูมังสวิรัติในอินเดีย คือแนวคิดใด?', 'McDonald’s selling vegetarian burgers in India is…'], a: [['Glocalization', 'Glocalization'], ['Standardization', 'Standardization'], ['Exporting', 'Exporting']], ok: 0 },
}

/** The question inside a "?" block. Right answer: the block pops its legendary item. */
export default function BlockQuestion({ quest, onClose }: { quest: QuestId; onClose: () => void }) {
  const { lang } = useApp()
  const { look } = useWardrobe()
  const th = lang === 'th'
  const data = Q[quest]
  const prize = ITEMS.find((i) => i.unlock.kind === 'quest' && i.unlock.quest === quest)!
  const [wrong, setWrong] = useState<number | null>(null)
  const [shake, setShake] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const answer = (i: number) => {
    if (i === data.ok) {
      playCorrectSound()
      completeQuest(quest, 20)
      onClose()
    } else {
      playWrongSound()
      setWrong(i)
      setShake((s) => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-campus backdrop-blur-sm animate-in fade-in duration-200" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <style>{'@keyframes wiggle{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px) rotate(-2deg)}40%{transform:translateX(9px) rotate(2deg)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}'}</style>
      <div key={shake} className={`relative w-full max-w-md rounded-[2rem] border-[4px] border-[#5B3A2E] bg-gradient-to-b from-[#FFE9A8] to-[#F7C04A] p-5 text-[#5B3A2E] shadow-[0_8px_0_#5B3A2E] animate-in zoom-in-90 duration-300 ${shake ? 'animate-[wiggle_0.4s_ease-in-out]' : ''}`}>
        <button onClick={onClose} aria-label={th ? 'ปิด' : 'Close'} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#5B3A2E] bg-white/80 hover:bg-white">
          <X className="h-5 w-5" strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3 pr-12">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#5B3A2E] bg-[#F7B733] text-4xl font-black text-white [text-shadow:_-2px_-2px_0_#5B3A2E,2px_-2px_0_#5B3A2E,-2px_2px_0_#5B3A2E,2px_2px_0_#5B3A2E]">?</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">{th ? 'กล่องปริศนา' : 'Mystery block'}</p>
            <p className="text-sm font-semibold opacity-80">{th ? 'ตอบถูก รับของรางวัลระดับตำนาน!' : 'Answer right to win a legendary prize!'}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border-[3px] border-[#5B3A2E] bg-white/70 p-2">
          <ItemThumb item={prize} look={look} className="h-14 w-14 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold" style={{ color: RARITY.legendary.color }}>★ {RARITY.legendary[lang]}</p>
            <p className="truncate text-sm font-bold">{prize.name[lang]}</p>
            <p className="text-xs font-semibold opacity-70">+20 {th ? 'เหรียญ' : 'coins'}</p>
          </div>
        </div>

        <p className="mt-4 text-lg font-bold leading-snug">{data.q[th ? 0 : 1]}</p>
        <div className="mt-3 space-y-2">
          {data.a.map((a, i) => (
            <button
              key={i}
              onClick={() => answer(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border-[3px] border-[#5B3A2E] p-3 text-left text-sm font-bold shadow-[0_3px_0_#5B3A2E] transition active:translate-y-0.5 active:shadow-none ${wrong === i ? 'bg-[#FFB3B3] line-through opacity-70' : 'bg-white hover:bg-[#FFF6DC]'}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#5B3A2E] bg-[#FFE27A] text-xs font-black">{'ABC'[i]}</span>
              {a[th ? 0 : 1]}
            </button>
          ))}
        </div>
        {wrong !== null && <p className="mt-3 text-center text-sm font-bold text-[#B23A48]">{th ? 'ยังไม่ใช่ ลองอีกครั้ง!' : 'Not quite. Try again!'}</p>}
      </div>
    </div>
  )
}
