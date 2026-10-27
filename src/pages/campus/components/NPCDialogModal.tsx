import { useEffect, useState } from 'react'
import { ChevronRight, MessageSquare, Sparkles, X } from 'lucide-react'
import type { CampusNPC } from './CampusNPCs'
import { playClickSound, playCoinSound, playDialogBlip, playXPSparkle } from '../soundEngine'

export default function NPCDialogModal({
  npc,
  lang,
  onClose,
  onAddXP,
  onAddCoins,
  onNavigateToBuilding,
  onOpenShop,
}: {
  npc: CampusNPC
  lang: 'th' | 'en'
  onClose: () => void
  onAddXP: (amount: number) => void
  onAddCoins: (amount: number) => void
  onNavigateToBuilding: (buildingId: string) => void
  onOpenShop: () => void
}) {
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null)
  const [rewardClaimed, setRewardClaimed] = useState<{ xp?: number; coins?: number } | null>(null)

  // Play dialogue chirp on mount
  useEffect(() => {
    playDialogBlip()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOptionClick = (opt: CampusNPC['options'][number]) => {
    playClickSound()

    if (opt.rewardXP || opt.rewardCoins) {
      if (opt.rewardXP) {
        onAddXP(opt.rewardXP)
        playXPSparkle()
      }
      if (opt.rewardCoins) {
        onAddCoins(opt.rewardCoins)
        playCoinSound()
      }
      setRewardClaimed({ xp: opt.rewardXP, coins: opt.rewardCoins })
    }

    if (opt.action === 'close') {
      onClose()
      return
    }

    if (opt.action === 'open_shop') {
      onClose()
      onOpenShop()
      return
    }

    if (opt.targetBuildingId) {
      onClose()
      onNavigateToBuilding(opt.targetBuildingId)
      return
    }

    // Show feedback text
    const feedback = lang === 'th' ? opt.feedback : opt.feedbackEn
    setSelectedFeedback(feedback)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#16182E]/95 via-[#1E1B4B]/95 to-[#0F172A]/95 p-6 text-white shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        {/* Ambient Glow */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: npc.color }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 text-2xl shadow-lg backdrop-blur"
              style={{ backgroundColor: npc.color }}
            >
              🧑‍🎓
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {lang === 'th' ? npc.name : npc.nameEn}
                </h3>
                <span className="rounded-full border border-pink-400/30 bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                  {lang === 'th' ? npc.faculty : npc.facultyEn}
                </span>
              </div>
              <p className="text-xs text-white/60 font-semibold">
                {lang === 'th' ? npc.title : npc.titleEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* NPC Speech Bubble */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
          <p className="text-xs font-bold text-pink-300 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {lang === 'th' ? npc.greeting : npc.greetingEn}
          </p>
          <p className="text-sm font-medium leading-relaxed text-white/95">
            {selectedFeedback ?? (lang === 'th' ? npc.dialogue : npc.dialogueEn)}
          </p>

          {/* Reward Toast Banner */}
          {rewardClaimed && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-2.5 text-xs font-black text-amber-300 animate-in zoom-in-75">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>
                {lang === 'th' ? 'ภารกิจสำเร็จ! ได้รับ' : 'Quest Reward Claimed!'}
                {rewardClaimed.xp && ` ✨ +${rewardClaimed.xp} XP`}
                {rewardClaimed.coins && ` 🪙 +${rewardClaimed.coins} Coins`}
              </span>
            </div>
          )}
        </div>

        {/* Dialogue Branching Options */}
        <div className="mt-4 space-y-2">
          {npc.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(opt)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs sm:text-sm font-semibold text-white/90 transition-all hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-white cursor-pointer group"
            >
              <span>{lang === 'th' ? opt.label : opt.labelEn}</span>
              <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
