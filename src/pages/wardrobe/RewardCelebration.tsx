import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { playCoinSound, playLevelUpSound } from '@/pages/campus/soundEngine'
import { ITEM_BY_ID, RARITY } from './catalog'
import { ItemThumb } from './ChibiAvatar'
import { BADGE_BY_ID } from './badges'
import { Medal } from './Medal'
import { popReward, useWardrobe } from './store'

/**
 * Pops every new reward (item, badge, coins) one at a time: light rays, the prize,
 * a fanfare. Mounted on the campus and in the wardrobe.
 */
export default function RewardCelebration() {
  const { lang, addCoins } = useApp()
  const { pending, look } = useWardrobe()
  const r = pending[0]
  const th = lang === 'th'

  useEffect(() => {
    if (!r) return
    if (r.kind === 'coins') {
      addCoins(r.amount)
      playCoinSound()
    } else playLevelUpSound()
  }, [r, addCoins])

  useEffect(() => {
    if (!r) return
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && popReward()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [r])

  if (!r) return null
  const item = r.kind === 'item' ? ITEM_BY_ID[r.id] : null
  const badge = r.kind === 'badge' ? BADGE_BY_ID[r.id] : null
  const rarity = item ? RARITY[item.rarity] : null
  const accent = rarity?.color ?? (badge ? badge.to : '#F5B82E')

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2A1A14]/70 p-6 font-campus backdrop-blur-sm animate-in fade-in duration-300" onMouseDown={(e) => e.target === e.currentTarget && popReward()}>
      <div className="relative w-full max-w-sm text-center animate-in zoom-in-75 duration-500">
        {/* rotating rays behind the prize */}
        <div className="pointer-events-none absolute left-1/2 top-32 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-full w-full animate-[spin_14s_linear_infinite] rounded-full opacity-80"
            style={{ background: `repeating-conic-gradient(${accent}66 0deg 10deg, transparent 10deg 24deg)`, maskImage: 'radial-gradient(circle, black 20%, transparent 65%)', WebkitMaskImage: 'radial-gradient(circle, black 20%, transparent 65%)' }}
          />
        </div>
        <p className="relative text-sm font-bold tracking-[0.3em] text-[#FFE7A8]">
          {item ? (th ? 'ได้ไอเท็มใหม่!' : 'NEW ITEM!') : badge ? (th ? 'ได้รับเหรียญตรา!' : 'BADGE EARNED!') : th ? 'ได้รับเหรียญ!' : 'COINS!'}
        </p>
        <div className="relative mx-auto mt-3 flex h-48 w-48 items-center justify-center rounded-[2rem] border-4 border-[#5B3A2E] bg-gradient-to-b from-[#FFF6E8] to-[#FBE3C4] shadow-[0_0_60px_rgba(255,220,120,0.6)]">
          {item && <ItemThumb item={item} look={look} className="h-40 w-40 drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)]" />}
          {badge && <Medal id={badge.id} size={120} />}
          {r.kind === 'coins' && <span className="text-6xl font-black text-[#E89B1E]">+{r.amount}</span>}
        </div>
        <h3 className="relative mt-4 text-2xl font-bold text-white drop-shadow">
          {item ? item.name[lang] : badge ? badge.name[lang] : th ? 'เหรียญ SPU' : 'SPU coins'}
        </h3>
        {rarity && (
          <p className="relative mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-bold text-white" style={{ background: rarity.color }}>
            {rarity[lang]}
          </p>
        )}
        {badge && <p className="relative mt-1 text-sm text-white/80">{badge.how[lang]}</p>}
        <button
          onClick={popReward}
          autoFocus
          className="relative mx-auto mt-6 block w-48 rounded-2xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#FFB0A6] to-[#F27D74] py-3 text-lg font-bold text-white shadow-[0_5px_0_#B85B52] transition active:translate-y-1 active:shadow-none"
        >
          {th ? 'เยี่ยมเลย!' : 'Awesome!'}
        </button>
      </div>
    </div>
  )
}
