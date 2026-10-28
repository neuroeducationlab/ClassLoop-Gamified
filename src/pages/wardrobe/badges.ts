import { Blocks, BookOpenCheck, Brain, Crown, Gem, Heart, Shirt, Sparkles, Users, type LucideIcon } from 'lucide-react'

export type BadgeId =
  | 'newcomer'
  | 'fashionista'
  | 'brainiac'
  | 'card-master'
  | 'first-block'
  | 'block-buster'
  | 'social-star'
  | 'collector'
  | 'legend'

export type Badge = {
  id: BadgeId
  name: { th: string; en: string }
  how: { th: string; en: string }
  icon: LucideIcon
  from: string
  to: string
}

export const BADGES: Badge[] = [
  { id: 'newcomer', name: { th: 'น้องใหม่แคมปัส', en: 'Campus newcomer' }, how: { th: 'เข้าแคมปัสครั้งแรก', en: 'Enter the campus' }, icon: Heart, from: '#FF9CC0', to: '#F06292' },
  { id: 'fashionista', name: { th: 'แฟชั่นนิสต้า', en: 'Fashionista' }, how: { th: 'ซื้อไอเท็มชิ้นแรก', en: 'Buy your first item' }, icon: Shirt, from: '#7FD3C3', to: '#2BA58F' },
  { id: 'brainiac', name: { th: 'สมองเพชร', en: 'Brainiac' }, how: { th: 'Brain Gym ถูก 3/3', en: 'Score 3/3 in Brain Gym' }, icon: Brain, from: '#7FB7FF', to: '#3D6FE0' },
  { id: 'card-master', name: { th: 'เซียนแฟลชการ์ด', en: 'Flashcard master' }, how: { th: 'จบ Flashcard Sprint', en: 'Finish a Flashcard Sprint' }, icon: BookOpenCheck, from: '#C9A7FF', to: '#7A4FE0' },
  { id: 'first-block', name: { th: 'นักล่ากล่อง ?', en: 'Block hunter' }, how: { th: 'เปิดกล่อง ? กล่องแรก', en: 'Open your first ? block' }, icon: Blocks, from: '#FFD86B', to: '#F2A93B' },
  { id: 'block-buster', name: { th: 'ราชากล่อง ?', en: 'Block buster' }, how: { th: 'เปิดกล่อง ? ครบ 5 กล่อง', en: 'Open all five ? blocks' }, icon: Crown, from: '#FFE27A', to: '#E89B1E' },
  { id: 'social-star', name: { th: 'ดาวมนุษยสัมพันธ์', en: 'Social star' }, how: { th: 'คุยกับเพื่อน 3 คน', en: 'Talk to three classmates' }, icon: Users, from: '#FFB38A', to: '#F0705A' },
  { id: 'collector', name: { th: 'นักสะสม', en: 'Collector' }, how: { th: 'มีไอเท็มพิเศษ 8 ชิ้น', en: 'Own 8 special items' }, icon: Gem, from: '#9EE6FF', to: '#3BA6D9' },
  { id: 'legend', name: { th: 'ระดับตำนาน', en: 'Legendary' }, how: { th: 'ได้ไอเท็มระดับตำนาน', en: 'Earn a legendary item' }, icon: Sparkles, from: '#FFE27A', to: '#C9395B' },
]
export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b])) as Record<BadgeId, Badge>
