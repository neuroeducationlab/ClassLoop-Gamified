import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, Pencil, Shirt, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import ChibiAvatar from './ChibiAvatar'
import { ITEMS, ITEM_BY_ID, RARITY } from './catalog'
import { BADGES } from './badges'
import { Medal } from './Medal'
import { isOwned, useWardrobe } from './store'

/**
 * The player's chibi as a round profile picture (HUD, leaderboard).
 * Molly's reference is the cozy dress-up chibi, not the capsule-robot 3D avatar.
 */
export function ProfilePic({ size = 40, ring = '#fff' }: { size?: number; ring?: string }) {
  const { look } = useWardrobe()
  return (
    <span className="inline-block shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, boxShadow: `0 0 0 2px ${ring}` }}>
      <ChibiAvatar look={look} crop="bust" className="h-full w-full" />
    </span>
  )
}

/** Earned badges in a row, newest last. */
export function BadgeRow({ max = 4, size = 18 }: { max?: number; size?: number }) {
  const { badges } = useWardrobe()
  const earned = BADGES.filter((b) => badges.includes(b.id)).slice(-max)
  return (
    <span className="flex items-center gap-0.5">
      {earned.map((b) => <Medal key={b.id} id={b.id} size={size} />)}
    </span>
  )
}

/** Show-off card: the full character in its scene, level, best items and the badge wall. */
export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const { lang, studentXP, studentCoins, avatar, setAvatar, currentStudent } = useApp()
  const w = useWardrobe()
  const th = lang === 'th'
  const level = Math.max(1, Math.floor(studentXP / 100))
  const owned = ITEMS.filter((i) => isOwned(i, w))
  const best = owned.filter((i) => i.rarity === 'legendary' || i.rarity === 'epic').slice(0, 6)
  const equippedLegend = Object.values(w.look).map((id) => ITEM_BY_ID[id as string]).filter((i) => i?.rarity === 'legendary')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(avatar?.nickname ?? currentStudent.nickname)
  const saveName = () => {
    const n = draft.trim() || currentStudent.nickname
    setDraft(n)
    setEditing(false)
    const base = avatar ?? { color: '#E89BC4', hat: 'grad' as const, outfit: 'default' as const, aura: 'none' as const, nickname: currentStudent.nickname }
    setAvatar({ ...base, nickname: n })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-campus backdrop-blur-sm animate-in fade-in duration-200" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative grid max-h-[92vh] w-full max-w-2xl gap-4 overflow-y-auto rounded-[2rem] border-[4px] border-[#5B3A2E] bg-[#FFF3E8] p-4 text-[#5B3A2E] shadow-[0_8px_0_#5B3A2E] animate-in zoom-in-95 duration-300 sm:grid-cols-[0.9fr_1.1fr] sm:p-5">
        <button onClick={onClose} aria-label={th ? 'ปิด' : 'Close'} className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#5B3A2E] bg-white hover:bg-[#FFF8F0] cursor-pointer">
          <X className="h-5 w-5" strokeWidth={3} />
        </button>

        <div className="aspect-[4/5] self-start overflow-hidden rounded-3xl border-[3px] border-[#5B3A2E] shadow-[0_4px_0_#5B3A2E]">
          <ChibiAvatar look={w.look} className="block h-full w-full" />
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">{th ? 'โปรไฟล์ผู้เล่น' : 'Player profile'}</p>
          {editing ? (
            <form
              onSubmit={(e) => { e.preventDefault(); saveName() }}
              className="mt-1 flex items-center gap-2 rounded-2xl border-[3px] border-[#5B3A2E] bg-white px-3 py-1.5 shadow-[0_2px_0_#5B3A2E]"
            >
              <input
                autoFocus
                maxLength={16}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={saveName}
                aria-label={th ? 'ชื่อที่แสดง' : 'Display name'}
                className="w-full bg-transparent text-2xl font-bold outline-none"
              />
              <button type="submit" aria-label={th ? 'บันทึก' : 'Save'} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => { setDraft(avatar?.nickname ?? currentStudent.nickname); setEditing(true) }}
              className="group mt-0.5 flex items-center gap-2 self-start rounded-xl pr-10 text-left transition hover:bg-black/5 hover:px-2"
              title={th ? 'ตั้งชื่อที่แสดง' : 'Edit display name'}
            >
              <h2 className="text-2xl font-bold">{avatar?.nickname ?? currentStudent.nickname}</h2>
              <Pencil className="h-4 w-4 opacity-50 transition group-hover:opacity-100" strokeWidth={2.5} />
            </button>
          )}
          <p className="text-[11px] font-semibold opacity-60">{currentStudent.name} · {currentStudent.faculty} · {th ? `ปี ${currentStudent.year}` : `Yr ${currentStudent.year}`}</p>
          {equippedLegend.length > 0 && (
            <p className="mt-0.5 text-xs font-bold" style={{ color: RARITY.legendary.color }}>★ {equippedLegend.map((i) => i.name[lang]).join(' · ')}</p>
          )}
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              [th ? 'เลเวล' : 'Level', level],
              ['XP', studentXP],
              [th ? 'เหรียญ' : 'Coins', studentCoins],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border-[3px] border-[#5B3A2E] bg-white py-1.5">
                <p className="text-lg font-bold leading-tight">{v}</p>
                <p className="text-[10px] font-bold uppercase opacity-60">{k}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm font-bold">{th ? 'เหรียญตรา' : 'Badges'} · {w.badges.length}/{BADGES.length}</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {BADGES.map((b) => {
              const has = w.badges.includes(b.id)
              return (
                <div key={b.id} className={`flex flex-col items-center rounded-2xl border-2 p-1.5 text-center ${has ? 'border-[#5B3A2E] bg-white' : 'border-dashed border-[#5B3A2E]/40'}`} title={b.how[lang]}>
                  <span className="relative">
                    <Medal id={b.id} size={36} locked={!has} />
                    {!has && <Lock className="absolute -bottom-0.5 -right-1 h-3.5 w-3.5 rounded bg-white p-0.5" />}
                  </span>
                  <span className="mt-1 text-[10px] font-bold leading-tight">{b.name[lang]}</span>
                  {!has && <span className="text-[9px] leading-tight opacity-60">{b.how[lang]}</span>}
                </div>
              )
            })}
          </div>

          {best.length > 0 && (
            <>
              <p className="mt-4 text-sm font-bold">{th ? 'ไอเท็มเด็ด' : 'Best items'}</p>
              <p className="text-xs font-semibold opacity-75">{best.map((i) => i.name[lang]).join(' · ')}</p>
            </>
          )}

          <button
            onClick={() => {
              onClose()
              navigate('/create')
            }}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#FFB0A6] to-[#F27D74] py-3 text-base font-bold text-white shadow-[0_4px_0_#B85B52] active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <Shirt className="h-5 w-5" /> {th ? 'ห้องแต่งตัวตัวละคร 3D' : '3D Avatar Customizer'}
          </button>
          <p className="mt-2 text-center text-[11px] font-semibold opacity-60">{owned.length}/{ITEMS.length} {th ? 'ไอเท็มในตู้' : 'items in your closet'}</p>
        </div>
      </div>
    </div>
  )
}
