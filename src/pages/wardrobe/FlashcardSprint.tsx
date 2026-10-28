import { useEffect, useState } from 'react'
import { BookOpenCheck, Check, RotateCcw, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playClickSound, playCorrectSound, playStreakSound } from '@/pages/campus/soundEngine'
import { ITEMS, RARITY } from './catalog'
import { ItemThumb } from './ChibiAvatar'
import { completeQuest, useWardrobe } from './store'

type Card = { term: [string, string]; def: [string, string] }
const CARDS: Card[] = [
  { term: ['High-Context', 'High-context culture'], def: ['ความหมายอยู่ในบริบทและความสัมพันธ์ พูดอ้อม (ญี่ปุ่น, ไทย)', 'Meaning lives in context and relationships; people speak indirectly (Japan, Thailand)'] },
  { term: ['Low-Context', 'Low-context culture'], def: ['พูดตรง ชัดเจน ทุกอย่างอยู่ในคำพูด (เยอรมนี, สหรัฐฯ)', 'Direct and explicit: the words carry the meaning (Germany, US)'] },
  { term: ['Power Distance', 'Power distance'], def: ['ระดับที่คนยอมรับว่าอำนาจไม่เท่ากัน', 'How much people accept that power is unequal'] },
  { term: ['Nemawashi', 'Nemawashi'], def: ['ปูทางพูดคุยหาฉันทามติก่อนการประชุมจริง', 'Quietly building consensus before the real meeting'] },
  { term: ['Glocalization', 'Glocalization'], def: ['คิดระดับโลก ปรับให้เข้ากับท้องถิ่น', 'Think global, act local'] },
  { term: ['Uncertainty Avoidance', 'Uncertainty avoidance'], def: ['ความไม่สบายใจต่อความคลุมเครือ ชอบกฎชัดเจน', 'Discomfort with ambiguity; a liking for clear rules'] },
]

/** Special quest: flip through every card. Finishing the first time pops the Book of Spells. */
export default function FlashcardSprint({ onClose }: { onClose: () => void }) {
  const { lang, addXP, addCoins } = useApp()
  const { quests, look } = useWardrobe()
  const th = lang === 'th'
  const L = th ? 0 : 1
  const [deck, setDeck] = useState<number[]>(() => CARDS.map((_, i) => i))
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [combo, setCombo] = useState(0)
  const [done, setDone] = useState(false)
  const prize = ITEMS.find((i) => i.unlock.kind === 'quest' && i.unlock.quest === 'flashcards')!
  const firstTime = !quests.includes('flashcards')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' && !done) { e.preventDefault(); setFlipped((f) => !f) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, done])

  const card = CARDS[deck[0]]

  const gotIt = () => {
    playCorrectSound()
    if (combo + 1 >= 2) playStreakSound(combo + 1)
    setCombo((c) => c + 1)
    setKnown((k) => k + 1)
    const rest = deck.slice(1)
    setFlipped(false)
    if (rest.length === 0) {
      setDone(true)
      addXP(30)
      if (firstTime) completeQuest('flashcards', 40)
      else addCoins(15)
    }
    setDeck(rest)
  }
  const again = () => {
    playClickSound()
    setCombo(0)
    setFlipped(false)
    setDeck(([first, ...rest]) => [...rest, first])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-campus backdrop-blur-sm animate-in fade-in duration-200" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-md rounded-[2rem] border-[4px] border-[#5B3A2E] bg-[#FFF3E8] p-5 text-[#5B3A2E] shadow-[0_8px_0_#5B3A2E] animate-in zoom-in-90 duration-300">
        <button onClick={onClose} aria-label={th ? 'ปิด' : 'Close'} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#5B3A2E] bg-white hover:bg-[#FFF8F0]">
          <X className="h-5 w-5" strokeWidth={3} />
        </button>
        <div className="flex items-center gap-3 pr-12">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#5B3A2E] bg-[#C9A7FF] text-white">
            <BookOpenCheck className="h-6 w-6" strokeWidth={2.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-tight">Flashcard Sprint</p>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-[#5B3A2E] bg-white">
              <div className="h-full bg-[#A97BFF] transition-all" style={{ width: `${(known / CARDS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {!done ? (
          <>
            <p className="mt-4 text-center text-sm font-bold text-[#7A4FE0]">
              {flipped ? (th ? 'จำได้ไหม?' : 'Did you know it?') : th ? 'แตะการ์ดเพื่อพลิก' : 'Tap the card to flip it'}
              {combo >= 2 && <span className="ml-2 rounded-full bg-[#FFE27A] px-2 text-[#5B3A2E]">Combo ×{combo}</span>}
            </p>
            {/* the card: flips in 3D */}
            <button onClick={() => { playClickSound(); setFlipped((f) => !f) }} className="mt-2 block h-48 w-full [perspective:900px]" aria-label={th ? 'พลิกการ์ด' : 'Flip card'}>
              <span className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                <span className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-[3px] border-[#5B3A2E] bg-white p-4 shadow-[0_5px_0_#5B3A2E] [backface-visibility:hidden]">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">{th ? 'คำศัพท์' : 'Term'} · {CARDS.length - deck.length + 1}/{CARDS.length}</span>
                  <span className="mt-2 text-center text-2xl font-bold">{card.term[L]}</span>
                </span>
                <span className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-[3px] border-[#5B3A2E] bg-[#F3EBFF] p-4 shadow-[0_5px_0_#5B3A2E] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">{th ? 'ความหมาย' : 'Meaning'}</span>
                  <span className="mt-2 text-center text-base font-semibold leading-snug">{card.def[L]}</span>
                </span>
              </span>
            </button>
            <div className={`mt-4 grid grid-cols-2 gap-3 transition-opacity ${flipped ? 'opacity-100' : 'pointer-events-none opacity-30'}`}>
              <button onClick={again} className="flex items-center justify-center gap-1.5 rounded-2xl border-[3px] border-[#5B3A2E] bg-white py-3 text-sm font-bold shadow-[0_3px_0_#5B3A2E] active:translate-y-0.5 active:shadow-none">
                <RotateCcw className="h-4 w-4" /> {th ? 'ยังไม่แม่น' : 'Again'}
              </button>
              <button onClick={gotIt} className="flex items-center justify-center gap-1.5 rounded-2xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#B8F0B0] to-[#7DD47A] py-3 text-sm font-bold shadow-[0_3px_0_#4E9A4B] active:translate-y-0.5 active:shadow-none">
                <Check className="h-4 w-4" strokeWidth={3} /> {th ? 'จำได้แล้ว' : 'Got it'}
              </button>
            </div>
            {firstTime && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border-2 border-dashed border-[#5B3A2E]/50 p-2">
                <ItemThumb item={prize} look={look} className="h-10 w-10 shrink-0" />
                <p className="text-xs font-semibold">
                  {th ? 'ครบทุกใบรับ ' : 'Finish every card to win '}
                  <b style={{ color: RARITY.legendary.color }}>★ {prize.name[lang]}</b> + 40 {th ? 'เหรียญ' : 'coins'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-2xl font-bold">{th ? 'ครบทุกใบแล้ว!' : 'Deck complete!'}</p>
            <p className="mt-1 text-sm font-semibold opacity-75">+30 XP{firstTime ? '' : th ? ' · +15 เหรียญ' : ' · +15 coins'}</p>
            <button onClick={onClose} autoFocus className="mx-auto mt-5 block w-48 rounded-2xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#FFB0A6] to-[#F27D74] py-3 text-base font-bold text-white shadow-[0_4px_0_#B85B52]">
              {th ? 'กลับสู่แคมปัส' : 'Back to campus'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
