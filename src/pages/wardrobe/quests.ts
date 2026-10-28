import type { QuestId } from './catalog'

/** How each legendary item is earned: shown on its locked cubby and in the Quests panel. */
export const SPECIAL_QUESTS: Record<QuestId, { name: { th: string; en: string }; how: { th: string; en: string }; go: 'campus' | 'braingym' | 'flashcards' }> = {
  'block-1': { name: { th: 'กล่อง ? ใบที่ 1', en: '? Block #1' }, how: { th: 'หากล่อง ? สีทองในแคมปัส แล้วตอบคำถามให้ถูก', en: 'Find a golden ? block on campus and answer its question' }, go: 'campus' },
  'block-2': { name: { th: 'กล่อง ? ใบที่ 2', en: '? Block #2' }, how: { th: 'หากล่อง ? สีทองในแคมปัส แล้วตอบคำถามให้ถูก', en: 'Find a golden ? block on campus and answer its question' }, go: 'campus' },
  'block-3': { name: { th: 'กล่อง ? ใบที่ 3', en: '? Block #3' }, how: { th: 'หากล่อง ? สีทองในแคมปัส แล้วตอบคำถามให้ถูก', en: 'Find a golden ? block on campus and answer its question' }, go: 'campus' },
  'block-4': { name: { th: 'กล่อง ? ใบที่ 4', en: '? Block #4' }, how: { th: 'หากล่อง ? สีทองในแคมปัส แล้วตอบคำถามให้ถูก', en: 'Find a golden ? block on campus and answer its question' }, go: 'campus' },
  'block-5': { name: { th: 'กล่อง ? ใบที่ 5', en: '? Block #5' }, how: { th: 'หากล่อง ? สีทองในแคมปัส แล้วตอบคำถามให้ถูก', en: 'Find a golden ? block on campus and answer its question' }, go: 'campus' },
  'gym-perfect': { name: { th: 'Brain Gym เต็ม 3/3', en: 'Perfect Brain Gym' }, how: { th: 'ตอบ Brain Gym ถูกครบ 3 ข้อ', en: 'Answer all 3 Brain Gym questions right' }, go: 'braingym' },
  flashcards: { name: { th: 'Flashcard Sprint', en: 'Flashcard Sprint' }, how: { th: 'ทบทวนแฟลชการ์ดให้ครบทุกใบ', en: 'Go through every flashcard' }, go: 'flashcards' },
  social: { name: { th: 'เพื่อนเยอะ', en: 'Make friends' }, how: { th: 'คุยกับเพื่อนในแคมปัสให้ครบ 3 คน', en: 'Talk to 3 classmates on campus' }, go: 'campus' },
}

/** Where the five blocks float: open ground along the paths, the first right in front of the gate. */
export const BLOCK_SPOTS: [number, number][] = [
  [-12, 2.4],
  [-6, -9],
  [14, -2],
  [3, 11],
  [17, -9],
]
