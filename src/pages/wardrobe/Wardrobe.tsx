import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ban, Check, ChevronLeft, ChevronRight, Lock, Pencil, RefreshCw, Sparkles, Star, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { playClickSound, playWrongSound } from '@/pages/campus/soundEngine'
import ChibiAvatar, { ItemThumb, type Look } from './ChibiAvatar'
import { ITEMS, ITEM_BY_ID, RARITY, SLOTS, type Item, type Slot } from './catalog'
import { HAIR_COLORS, SKIN_TONES } from './draw'
import { BADGES } from './badges'
import { Medal } from './Medal'
import { SPECIAL_QUESTS } from './quests'
import { buy, equip, isOwned, setLookColors, useWardrobe } from './store'
import { useAvatar3DSync } from './sync'
import RewardCelebration from './RewardCelebration'

type Filter = 'all' | 'owned' | 'shop' | 'special'

const SLOT_ICON: Record<Slot, string> = {
  hat: 'hat-cat',
  hair: 'hair-fluffy',
  eyes: 'eyes-hearts',
  neck: 'neck-bow-red',
  outfit: 'outfit-frog',
  held: 'held-heartwand',
  aura: 'aura-sparkle',
  bg: 'bg-night',
}

/** Wood-shelf cubby colours, after the reference closet. */
const WOOD = {
  frame: '#6B3127',
  back: 'linear-gradient(180deg,#8E4A3B 0%,#7B3D31 78%,#A15C48 78%,#B26A55 84%,#8C4A3B 100%)',
  hatch: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 7px)',
}

/**
 * Change Outfit: a cozy dress-up closet. Try anything on; buy with coins; legendaries come
 * from special quests. Shown either as a full page at `/create` (no `onClose`), or as a
 * popup from the campus HUD (an `onClose` callback dismisses it instead of navigating).
 */
export default function Wardrobe({ onClose }: { onClose?: () => void } = {}) {
  const navigate = useNavigate()
  const asModal = Boolean(onClose)
  const { lang, studentCoins, addCoins, avatar, setAvatar, currentStudent, studentXP } = useApp()
  const w = useWardrobe()
  const th = lang === 'th'
  const [slot, setSlot] = useState<Slot>('hat')
  const [filter, setFilter] = useState<Filter>('all')
  /** Unowned items being tried on, per slot. Never saved. */
  const [trying, setTrying] = useState<Partial<Record<Slot, string>>>({})
  const [editingName, setEditingName] = useState(false)
  const nickname = avatar?.nickname ?? currentStudent.nickname
  const [name, setName] = useState(nickname)
  useAvatar3DSync()

  const look: Look = { ...w.look, ...trying } as Look
  const tried = trying[slot] ? ITEM_BY_ID[trying[slot]!] : null
  const sceneEdge = ITEM_BY_ID[look.bg]?.edge ?? ['#FBE3C4', '#F2C9A0']
  const level = Math.max(1, Math.floor(studentXP / 100))

  const items = useMemo(
    () =>
      ITEMS.filter((i) => i.slot === slot).filter((i) => {
        const owned = isOwned(i, w)
        if (filter === 'owned') return owned
        if (filter === 'shop') return i.unlock.kind === 'coins'
        if (filter === 'special') return i.unlock.kind === 'quest'
        return true
      }),
    [slot, filter, w],
  )
  const ownedCount = ITEMS.filter((i) => isOwned(i, w)).length
  const scenes = ITEMS.filter((i) => i.slot === 'bg' && isOwned(i, w))

  const pick = (it: Item) => {
    playClickSound()
    if (isOwned(it, w)) {
      equip(it.slot, it.id)
      setTrying(({ [it.slot]: _, ...rest }) => rest)
    } else {
      setTrying((t) => ({ ...t, [it.slot]: it.id }))
    }
  }

  const cycleScene = (dir: number) => {
    const i = Math.max(0, scenes.findIndex((s) => s.id === w.look.bg))
    const next = scenes[(i + dir + scenes.length) % scenes.length]
    if (next) equip('bg', next.id)
    setTrying(({ bg: _, ...rest }) => rest)
  }

  const cycleSkin = () => {
    const i = SKIN_TONES.indexOf(w.look.skin as (typeof SKIN_TONES)[number])
    setLookColors({ skin: SKIN_TONES[(i + 1) % SKIN_TONES.length] })
  }

  const purchase = (it: Item) => {
    if (!buy(it, studentCoins, (p) => addCoins(-p))) {
      playWrongSound()
      return
    }
    setTrying(({ [it.slot]: _, ...rest }) => rest)
  }

  const saveName = () => {
    const n = name.trim() || currentStudent.nickname
    setName(n)
    setEditingName(false)
    if (avatar) setAvatar({ ...avatar, nickname: n })
  }

  const done = () => {
    setTrying({})
    if (onClose) onClose()
    else navigate('/campus')
  }

  /** Special-quest buttons: in modal mode, just close so the campus beneath can handle it. */
  const openOnCampus = (where: string) => {
    if (onClose) onClose()
    navigate('/campus', { state: { open: where } })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !editingName && done()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div
      className={asModal
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 font-campus text-[#5B3A2E] backdrop-blur-sm animate-in fade-in duration-200'
        : 'min-h-screen bg-[#FFF3E8] font-campus text-[#5B3A2E]'}
      onMouseDown={asModal ? (e) => e.target === e.currentTarget && done() : undefined}
    >
      <div
        className={asModal
          ? 'flex max-h-[94vh] w-full max-w-5xl flex-col gap-3 overflow-y-auto rounded-[2rem] border-[4px] border-[#5B3A2E] bg-[#FFF3E8] p-3 shadow-[0_8px_0_#5B3A2E] animate-in zoom-in-95 duration-300 sm:p-4 lg:flex-row'
          : 'mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-3 sm:p-5 lg:flex-row'}
      >
        {/* ───────────── stage ───────────── */}
        <section className="relative flex flex-col lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-[44%]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              onClick={done}
              aria-label={asModal ? (th ? 'ปิด' : 'Close') : (th ? 'กลับแคมปัส' : 'Back to campus')}
              className="flex items-center gap-1.5 rounded-2xl border-[3px] border-[#5B3A2E] bg-white px-3 py-1.5 text-sm font-bold shadow-[0_3px_0_#5B3A2E] transition active:translate-y-0.5 active:shadow-none"
            >
              {asModal ? <X className="h-4 w-4" strokeWidth={3} /> : <ArrowLeft className="h-4 w-4" />}
              {asModal ? (th ? 'ปิด' : 'Close') : (th ? 'แคมปัส' : 'Campus')}
            </button>
            <h1 className="text-xl font-bold sm:text-2xl">{th ? 'ตู้เสื้อผ้า' : 'Wardrobe'}</h1>
            <span className="flex items-center gap-1.5 rounded-2xl border-[3px] border-[#5B3A2E] bg-[#FFE7A8] px-3 py-1.5 text-sm font-bold shadow-[0_3px_0_#5B3A2E]" title={th ? 'เหรียญ' : 'Coins'}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#5B3A2E] bg-[#F5C33B] text-[10px] font-black">C</span>
              {studentCoins}
            </span>
          </div>

          <div
            className="relative flex-1 overflow-hidden rounded-[2rem] border-[3px] border-[#5B3A2E] shadow-[0_6px_0_#5B3A2E]"
            style={{ background: `linear-gradient(${sceneEdge[0]} 50%, ${sceneEdge[1]} 50%)` }}
          >
            <style>{'@keyframes idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6%)}}@keyframes pop{0%{transform:scale(1)}35%{transform:scale(1.06)}70%{transform:scale(0.98)}100%{transform:scale(1)}}'}</style>
            {/* scene and character are drawn apart so only the character breathes and bounces */}
            <ChibiAvatar look={look} only="scene" className="absolute inset-0 h-full w-full" />
            <div key={Object.values(look).join('|')} className="relative mx-auto h-[46vh] max-h-[520px] min-h-[300px] w-full animate-[pop_0.45s_ease-out] lg:h-full lg:max-h-none">
              <ChibiAvatar look={look} only="character" className="block h-full w-full animate-[idle_3.2s_ease-in-out_infinite]" />
            </div>

            <button onClick={() => cycleScene(-1)} aria-label={th ? 'ฉากก่อนหน้า' : 'Previous scene'} className="absolute left-2 top-1/2 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/80 text-[#5B3A2E] shadow transition hover:bg-white">
              <ChevronLeft className="h-7 w-7" strokeWidth={3} />
            </button>
            <button onClick={() => cycleScene(1)} aria-label={th ? 'ฉากถัดไป' : 'Next scene'} className="absolute right-2 top-1/2 flex h-12 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-white/80 text-[#5B3A2E] shadow transition hover:bg-white">
              <ChevronRight className="h-7 w-7" strokeWidth={3} />
            </button>
            <button onClick={cycleSkin} className="absolute right-3 top-3 flex flex-col items-center rounded-2xl border-[3px] border-[#5B3A2E] bg-white/90 px-2.5 py-1.5 text-[11px] font-bold shadow-[0_3px_0_#5B3A2E] transition active:translate-y-0.5 active:shadow-none">
              <RefreshCw className="h-5 w-5" strokeWidth={2.6} />
              {th ? 'สีผิว' : 'Switch'}
            </button>

            {/* name plate + badges */}
            {/* on phones it sits on the floor, clear of the character's head; the try-on bar takes its place */}
            <div className={`absolute bottom-3 left-3 max-w-[60%] rounded-2xl border-[3px] border-[#5B3A2E] bg-white/90 px-3 py-1.5 shadow-[0_3px_0_#5B3A2E] lg:bottom-auto lg:top-3 ${tried ? 'hidden lg:block' : ''}`}>
              {editingName ? (
                <form onSubmit={(e) => { e.preventDefault(); saveName() }} className="flex items-center gap-1">
                  <input autoFocus value={name} maxLength={16} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="w-28 rounded-lg bg-[#FFF3E8] px-1.5 text-sm font-bold outline-none" />
                  <button type="submit" aria-label="Save"><Check className="h-4 w-4" /></button>
                </form>
              ) : (
                <button onClick={() => setEditingName(true)} className="flex items-center gap-1.5 text-sm font-bold">
                  {nickname} <Pencil className="h-3.5 w-3.5 opacity-60" />
                </button>
              )}
              <p className="text-[11px] font-semibold opacity-70">Lv.{level} · {ownedCount}/{ITEMS.length} {th ? 'ไอเท็ม' : 'items'}</p>
              <div className="mt-1 flex gap-1">
                {BADGES.filter((b) => w.badges.includes(b.id)).slice(-5).map((b) => <Medal key={b.id} id={b.id} size={22} />)}
              </div>
            </div>

            {/* try-on bar: what it is and how to get it */}
            {tried && (
              <TryOnBar
                item={tried}
                coins={studentCoins}
                lang={lang}
                onBuy={() => purchase(tried)}
                onUndo={() => setTrying(({ [slot]: _, ...rest }) => rest)}
                onGo={(where) => openOnCampus(where)}
              />
            )}
          </div>
        </section>

        {/* ───────────── closet ───────────── */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* category tabs */}
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {SLOTS.map((s) => {
              const active = s.slot === slot
              return (
                <button
                  key={s.slot}
                  onClick={() => { setSlot(s.slot); playClickSound() }}
                  className={`flex shrink-0 flex-col items-center rounded-t-2xl border-[3px] border-b-0 border-[#5B3A2E] px-2 pb-1 pt-1.5 transition ${active ? 'translate-y-0 bg-[#FFF8F0]' : 'translate-y-1 bg-[#F6A79B] hover:bg-[#F8B7AD]'}`}
                >
                  <ItemThumb item={ITEM_BY_ID[SLOT_ICON[s.slot]]} look={w.look} className="h-9 w-9" />
                  <span className="text-[11px] font-bold">{s.name[lang]}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-1 flex-col rounded-b-3xl rounded-tr-3xl border-[3px] border-[#5B3A2E] bg-[#FFF8F0] p-3 shadow-[0_6px_0_#5B3A2E]">
            {/* filters */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {(['all', 'owned', 'shop', 'special'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1 rounded-full border-2 border-[#5B3A2E] px-3 py-1 text-xs font-bold transition ${filter === f ? 'bg-[#F27D74] text-white' : 'bg-white hover:bg-[#FFEDE6]'}`}
                >
                  {f === 'special' && <Star className="h-3.5 w-3.5 fill-current" />}
                  {{ all: th ? 'ทั้งหมด' : 'All', owned: th ? 'ของฉัน' : 'Mine', shop: th ? 'ร้านค้า' : 'Shop', special: th ? 'พิเศษ' : 'Special' }[f]}
                </button>
              ))}
            </div>

            {/* hair colours */}
            {slot === 'hair' && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold">{th ? 'สีผม' : 'Hair colour'}</span>
                {HAIR_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => setLookColors({ hairColor: col })}
                    aria-label={col}
                    className={`h-7 w-7 rounded-full border-[3px] transition ${w.look.hairColor === col ? 'scale-110 border-[#5B3A2E] ring-2 ring-[#F27D74] ring-offset-1' : 'border-[#5B3A2E]/60'}`}
                    style={{ background: col }}
                  />
                ))}
              </div>
            )}

            {/* the closet: wooden cubbies */}
            <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-2xl border-[4px] sm:grid-cols-4" style={{ borderColor: WOOD.frame, background: WOOD.frame }}>
              {items.map((it) => (
                <Cubby key={it.id} item={it} look={w.look} owned={isOwned(it, w)} equipped={w.look[it.slot] === it.id} trying={trying[it.slot] === it.id} onPick={() => pick(it)} lang={lang} />
              ))}
              {items.length === 0 && <p className="col-span-full bg-[#7B3D31] p-8 text-center text-sm font-bold text-[#FFE7D6]">{th ? 'ยังไม่มีไอเท็มในหมวดนี้' : 'Nothing here yet'}</p>}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <p className="text-xs font-semibold opacity-70">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                {th ? 'แตะเพื่อลองใส่ · ได้เหรียญจากเควสต์และ Brain Gym · ไอเท็ม ★ ได้จากภารกิจพิเศษ' : 'Tap to try on · earn coins from quests and Brain Gym · ★ items come from special quests'}
              </p>
              <button
                onClick={done}
                aria-label={th ? 'เสร็จแล้ว' : 'Done'}
                className="flex shrink-0 items-center gap-1.5 rounded-2xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#FFB0A6] to-[#F27D74] px-5 py-2.5 text-base font-bold text-white shadow-[0_4px_0_#B85B52] transition active:translate-y-1 active:shadow-none"
              >
                <Check className="h-5 w-5" strokeWidth={3} /> {th ? 'เสร็จแล้ว' : 'Done'}
              </button>
            </div>
          </div>
        </section>
      </div>
      <RewardCelebration />
    </div>
  )
}

function Cubby({ item, look, owned, equipped, trying, onPick, lang }: { item: Item; look: Look; owned: boolean; equipped: boolean; trying: boolean; onPick: () => void; lang: 'th' | 'en' }) {
  const r = RARITY[item.rarity]
  const empty = !item.front && !item.back
  return (
    <button
      onClick={onPick}
      title={item.name[lang]}
      className="group relative aspect-square p-[5px] outline-none"
      style={{ background: WOOD.frame }}
    >
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md" style={{ background: `${WOOD.hatch}, ${WOOD.back}`, boxShadow: `inset 0 0 0 2px rgba(0,0,0,0.12), 0 0 22px ${r.glow}` }}>
        {/* selected: cream frame like the reference */}
        {(equipped || trying) && <span className={`absolute inset-1 rounded-lg border-[3px] ${trying ? 'border-dashed border-[#FFE7A8]' : 'border-[#FFF1DF]'}`} />}
        {item.rarity === 'legendary' && <span className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_40%,rgba(255,226,122,0.45),transparent_65%)]" />}
        {empty ? (
          <Ban className="h-1/2 w-1/2 text-[#F4B9A8]" strokeWidth={2.5} />
        ) : (
          <ItemThumb item={item} look={look} className={`h-[86%] w-[86%] drop-shadow-[0_4px_0_rgba(0,0,0,0.18)] transition group-hover:scale-110 group-active:scale-95 ${owned ? '' : 'saturate-[0.85]'}`} />
        )}

        {/* rarity gem */}
        {item.rarity !== 'common' && <span className="absolute left-1.5 top-1.5 h-3 w-3 rotate-45 rounded-[3px] border-2 border-[#5B3A2E]" style={{ background: r.color }} />}
        {/* equipped tick */}
        {equipped && (
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#5B3A2E] bg-[#F5C33B]">
            <Check className="h-4 w-4 text-[#5B3A2E]" strokeWidth={3.5} />
          </span>
        )}
        {/* price or quest lock */}
        {!owned && item.unlock.kind === 'coins' && (
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full border-2 border-[#5B3A2E] bg-[#FFF3D6] px-1.5 text-[11px] font-black leading-5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F5C33B] text-[8px]">C</span>
            {item.unlock.price}
          </span>
        )}
        {!owned && item.unlock.kind === 'quest' && (
          <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#5B3A2E] bg-[#C9A7FF]">
            <Lock className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
        )}
      </span>
    </button>
  )
}

function TryOnBar({ item, coins, lang, onBuy, onUndo, onGo }: { item: Item; coins: number; lang: 'th' | 'en'; onBuy: () => void; onUndo: () => void; onGo: (where: string) => void }) {
  const th = lang === 'th'
  const r = RARITY[item.rarity]
  const quest = item.unlock.kind === 'quest' ? SPECIAL_QUESTS[item.unlock.quest] : null
  const price = item.unlock.kind === 'coins' ? item.unlock.price : 0
  const short = price - coins
  return (
    <div className="absolute inset-x-3 bottom-3 rounded-2xl border-[3px] border-[#5B3A2E] bg-white/95 p-3 shadow-[0_4px_0_#5B3A2E] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: r.color }}>
            {th ? 'กำลังลองใส่ · ' : 'Trying on · '}{r[lang]}
          </p>
          <p className="truncate text-base font-bold">{item.name[lang]}</p>
          {quest && <p className="text-xs font-semibold opacity-75"><Star className="mr-1 inline h-3.5 w-3.5 fill-[#F5B82E] text-[#F5B82E]" />{quest.how[lang]}</p>}
          {!quest && short > 0 && <p className="text-xs font-semibold text-[#C9395B]">{th ? `ขาดอีก ${short} เหรียญ · ทำเควสต์หรือ Brain Gym เพื่อสะสม` : `${short} more coins needed · earn them from quests and Brain Gym`}</p>}
        </div>
        <button onClick={onUndo} className="shrink-0 rounded-xl border-2 border-[#5B3A2E] px-2 py-1 text-xs font-bold hover:bg-[#FFF3E8]">{th ? 'ถอดออก' : 'Take off'}</button>
      </div>
      <div className="mt-2">
        {quest ? (
          <button onClick={() => onGo(quest.go)} className="w-full rounded-xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#D9C2FF] to-[#A97BFF] py-2 text-sm font-bold text-white shadow-[0_3px_0_#6E4BC2] active:translate-y-0.5 active:shadow-none">
            {th ? 'ไปทำภารกิจพิเศษ' : 'Go do the special quest'}
          </button>
        ) : short > 0 ? (
          <button onClick={() => onGo('quests')} className="w-full rounded-xl border-[3px] border-[#5B3A2E] bg-white py-2 text-sm font-bold shadow-[0_3px_0_#5B3A2E] active:translate-y-0.5 active:shadow-none">
            {th ? 'ไปหาเหรียญ' : 'Go earn coins'}
          </button>
        ) : (
          <button onClick={onBuy} className="flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#5B3A2E] bg-gradient-to-b from-[#FFE27A] to-[#F5B82E] py-2 text-sm font-black shadow-[0_3px_0_#B9811B] active:translate-y-0.5 active:shadow-none">
            {th ? 'ซื้อเลย' : 'Buy'}
            <span className="flex items-center gap-1 rounded-full bg-white/70 px-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F5C33B] text-[9px]">C</span>{price}</span>
          </button>
        )}
      </div>
    </div>
  )
}
