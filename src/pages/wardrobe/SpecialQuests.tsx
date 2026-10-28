import { Check, Star } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { ITEMS, type QuestId } from './catalog'
import { ItemThumb } from './ChibiAvatar'
import { BLOCK_QUESTS, useWardrobe } from './store'

export type SpecialGo = 'blocks' | 'flashcards' | 'braingym' | 'friends'

const prizeOf = (q: QuestId) => ITEMS.find((i) => i.unlock.kind === 'quest' && i.unlock.quest === q)!

/** "★ Special quests" at the top of the Quests panel: Mario-style bonus challenges with legendary prizes. */
export default function SpecialQuests({ onGo }: { onGo: (go: SpecialGo) => void }) {
  const { lang } = useApp()
  const { quests, npcTalks, look } = useWardrobe()
  const th = lang === 'th'
  const blocks = BLOCK_QUESTS.filter((b) => quests.includes(b)).length
  const nextBlock = BLOCK_QUESTS.find((b) => !quests.includes(b))

  const rows: { key: SpecialGo; title: string; sub: string; prize: QuestId; done: boolean; cta: string }[] = [
    { key: 'blocks', title: th ? 'ล่ากล่อง ?' : 'Hunt the ? blocks', sub: `${blocks}/5 ${th ? 'กล่อง' : 'found'}`, prize: nextBlock ?? 'block-5', done: blocks === 5, cta: th ? 'วาร์ปไป' : 'Warp' },
    { key: 'flashcards', title: 'Flashcard Sprint', sub: th ? 'ทบทวน 6 ใบ' : '6 cards', prize: 'flashcards', done: quests.includes('flashcards'), cta: th ? 'เล่น' : 'Play' },
    { key: 'braingym', title: th ? 'Brain Gym เต็ม 3/3' : 'Perfect Brain Gym', sub: th ? 'ถูกครบทุกข้อ' : 'All 3 right', prize: 'gym-perfect', done: quests.includes('gym-perfect'), cta: th ? 'เล่น' : 'Play' },
    { key: 'friends', title: th ? 'คุยกับเพื่อน' : 'Make friends', sub: `${Math.min(3, npcTalks.length)}/3 ${th ? 'คน' : 'classmates'}`, prize: 'social', done: quests.includes('social'), cta: th ? 'วาร์ปไป' : 'Warp' },
  ]

  return (
    <div className="mb-3 rounded-2xl border border-amber-300/50 bg-gradient-to-br from-amber-400/20 to-fuchsia-500/10 p-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-200">
        <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> {th ? 'ภารกิจพิเศษ · ได้ไอเท็มตำนาน' : 'Special quests · legendary prizes'}
      </p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.key} className={`flex items-center gap-2 rounded-xl bg-black/30 p-1.5 ${r.done ? 'opacity-60' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF3E0]">
              <ItemThumb item={prizeOf(r.prize)} look={look} className="h-8 w-8" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{r.title}</p>
              <p className="text-[10px] text-white/60">{r.sub}</p>
            </div>
            {r.done ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500"><Check className="h-4 w-4 text-white" strokeWidth={3} /></span>
            ) : (
              <button onClick={() => onGo(r.key)} className="shrink-0 cursor-pointer rounded-lg bg-amber-400 px-2.5 py-1.5 text-[11px] font-black text-[#5B3A2E] shadow transition hover:bg-amber-300">
                {r.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
