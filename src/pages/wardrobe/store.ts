/**
 * Wardrobe progress: owned items, the equipped look, badges and special-quest progress.
 * Kept out of AppContext (HANDOFF: additive fields only) and saved to localStorage, so a
 * look survives a reload while filming. Coins still live in AppContext.
 */
import { useSyncExternalStore } from 'react'
import { DEFAULT_LOOK, ITEMS, ITEM_BY_ID, type Item, type QuestId, type Slot } from './catalog'
import { HAIR_COLORS, SKIN_TONES } from './draw'
import type { Look } from './ChibiAvatar'
import type { BadgeId } from './badges'

export type Reward = { kind: 'item'; id: string } | { kind: 'badge'; id: BadgeId } | { kind: 'coins'; amount: number }

type State = {
  look: Look
  owned: string[]
  badges: BadgeId[]
  quests: QuestId[]
  npcTalks: string[]
  /** Rewards waiting to be celebrated, oldest first. */
  pending: Reward[]
  /** Blocks just opened, so they show spent and re-arm a few seconds later. Never saved. */
  cooling: QuestId[]
}

const KEY = 'classloop_wardrobe_v1'
const BLOCKS: QuestId[] = ['block-1', 'block-2', 'block-3', 'block-4', 'block-5']

const initial = (): State => ({
  look: { ...DEFAULT_LOOK, skin: SKIN_TONES[0], hairColor: HAIR_COLORS[0] },
  owned: [],
  badges: ['newcomer'],
  quests: [],
  npcTalks: [],
  pending: [],
  cooling: [],
})

/**
 * sessionStorage, not localStorage: at a demo booth each visitor opens the QR in a fresh
 * tab and should start from zero, while a reload mid-play keeps their look and coins.
 */
const store = () => window.sessionStorage

function load(): State {
  try {
    const raw = store().getItem(KEY)
    if (!raw) return initial()
    const s = { ...initial(), ...JSON.parse(raw) } as State
    s.look = { ...initial().look, ...s.look }
    // drop ids that no longer exist
    for (const slot of Object.keys(DEFAULT_LOOK) as Slot[]) if (!ITEM_BY_ID[s.look[slot]]) s.look[slot] = DEFAULT_LOOK[slot]
    s.pending = []
    s.cooling = []
    return s
  } catch {
    return initial()
  }
}

let state: State = typeof window === 'undefined' ? initial() : load()
const listeners = new Set<() => void>()

function set(next: Partial<State>) {
  state = { ...state, ...next }
  try {
    const { pending: _p, cooling: _c, ...save } = state
    void _p
    void _c
    store().setItem(KEY, JSON.stringify(save))
  } catch {
    /* private mode: progress lives in memory only */
  }
  listeners.forEach((l) => l())
}

export function useWardrobe() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}
export const wardrobeState = () => state

export function isOwned(it: Item, s: State = state) {
  if (it.unlock.kind === 'free') return true
  if (it.unlock.kind === 'quest') return s.quests.includes(it.unlock.quest)
  return s.owned.includes(it.id)
}

export function equip(slot: Slot, id: string) {
  set({ look: { ...state.look, [slot]: id } })
}
export function setLookColors(next: Partial<Pick<Look, 'skin' | 'hairColor'>>) {
  set({ look: { ...state.look, ...next } })
}

function award(badge: BadgeId, queue: Reward[]) {
  if (state.badges.includes(badge) || queue.some((r) => r.kind === 'badge' && r.id === badge)) return
  queue.push({ kind: 'badge', id: badge })
}

/** Badges that depend on what you own; call after anything is added. */
function collectionBadges(owned: string[], quests: QuestId[], queue: Reward[]) {
  const paid = ITEMS.filter((i) => i.unlock.kind !== 'free' && (owned.includes(i.id) || (i.unlock.kind === 'quest' && quests.includes(i.unlock.quest))))
  if (paid.length >= 8) award('collector', queue)
  if (paid.some((i) => i.rarity === 'legendary')) award('legend', queue)
}

function commit(next: Partial<State>, queue: Reward[]) {
  const badges = [...state.badges, ...queue.filter((r): r is Extract<Reward, { kind: 'badge' }> => r.kind === 'badge').map((r) => r.id)]
  set({ ...next, badges, pending: [...state.pending, ...queue] })
}

/** Buy with coins. `spend` deducts from AppContext; returns false when the wallet is short. */
export function buy(it: Item, coins: number, spend: (amount: number) => void) {
  if (isOwned(it) || it.unlock.kind !== 'coins') return false
  if (coins < it.unlock.price) return false
  spend(it.unlock.price)
  const owned = [...state.owned, it.id]
  const queue: Reward[] = [{ kind: 'item', id: it.id }]
  award('fashionista', queue)
  collectionBadges(owned, state.quests, queue)
  commit({ owned, look: { ...state.look, [it.slot]: it.id } }, queue)
  return true
}

/**
 * A special quest is done: unlock its legendary item, plus any badge it completes.
 * Replayable — a visitor can run a quest as often as they like and the coins land every
 * time; the item and badges are only ever granted once.
 */
export function completeQuest(q: QuestId, bonusCoins = 0) {
  const repeat = state.quests.includes(q)
  const quests = repeat ? state.quests : [...state.quests, q]
  const queue: Reward[] = []
  const reward = ITEMS.find((i) => i.unlock.kind === 'quest' && i.unlock.quest === q)
  if (reward && !repeat) queue.push({ kind: 'item', id: reward.id })
  if (bonusCoins) queue.push({ kind: 'coins', amount: bonusCoins })
  if (q === 'gym-perfect') award('brainiac', queue)
  if (q === 'flashcards') award('card-master', queue)
  if (q === 'social') award('social-star', queue)
  if (q.startsWith('block-')) {
    award('first-block', queue)
    if (BLOCKS.every((b) => quests.includes(b))) award('block-buster', queue)
  }
  collectionBadges(state.owned, quests, queue)
  commit({ quests }, queue)
  return true
}

/** How long a "?" block stays spent before it re-arms, so the demo can be replayed. */
const BLOCK_RESPAWN_MS = 6000

/** Mark a block spent; it turns gold again a few seconds later. */
export function coolBlock(q: QuestId) {
  if (state.cooling.includes(q)) return
  set({ cooling: [...state.cooling, q] })
  setTimeout(() => set({ cooling: state.cooling.filter((c) => c !== q) }), BLOCK_RESPAWN_MS)
}

/** Wipe this visitor's progress so the next person at the booth starts clean. */
export function restartDemo() {
  try {
    store().removeItem(KEY)
  } catch {
    /* private mode: nothing was saved anyway */
  }
  state = initial()
  listeners.forEach((l) => l())
}

/** Talking to three different classmates completes the "social" quest. */
export function recordTalk(npcId: string) {
  if (state.npcTalks.includes(npcId)) return
  const npcTalks = [...state.npcTalks, npcId]
  set({ npcTalks })
  if (npcTalks.length >= 3) completeQuest('social')
}

export function popReward() {
  const [, ...rest] = state.pending
  set({ pending: rest })
}

export const BLOCK_QUESTS = BLOCKS
