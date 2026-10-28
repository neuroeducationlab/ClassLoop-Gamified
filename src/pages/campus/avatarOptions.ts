import type { AvatarHat, AvatarOutfit, AvatarAura } from '@/context/AppContext'
import type { IconName } from '@/components/icons/GameIcon'

export const AVATAR_COLORS = [
  '#E89BC4', // SPU Classic Pink
  '#3B82F6', // Tech Blue
  '#10B981', // Emerald Green
  '#F59E0B', // Warm Amber
  '#8B5CF6', // Purple Glow
  '#EC4899', // Hot Pink
  '#06B6D4', // Cyber Cyan
  '#64748B', // Sleek Slate
]

export const AVATAR_HATS: { id: AvatarHat; labelTh: string; labelEn: string; icon: IconName }[] = [
  { id: 'none', labelTh: 'ไม่สวมหมวก', labelEn: 'No Hat', icon: 'sparkle' },
  { id: 'grad', labelTh: 'หมวกบัณฑิต SPU', labelEn: 'SPU Grad Cap', icon: 'gradCap' },
  { id: 'cyber_cat', labelTh: 'หูแมวไซเบอร์', labelEn: 'Cyber Cat', icon: 'cat' },
  { id: 'dj_headset', labelTh: 'หูฟังดีเจ', labelEn: 'DJ Headset', icon: 'headphones' },
  { id: 'crown', labelTh: 'มงกุฎทองคำ', labelEn: 'Gold Crown', icon: 'crown' },
  { id: 'beanie', labelTh: 'หมวกบีนนี่', labelEn: 'Beanie', icon: 'star' },
  { id: 'cap', labelTh: 'หมวกแก๊ป', labelEn: 'Campus Cap', icon: 'cap' },
]

export const AVATAR_OUTFITS: { id: AvatarOutfit; labelTh: string; labelEn: string; icon: IconName }[] = [
  { id: 'default', labelTh: 'เสื้อยืดแคชชวล', labelEn: 'Casual Tee', icon: 'shirt' },
  { id: 'suit', labelTh: 'สูทผู้บริหาร & ไท SPU', labelEn: 'CEO Suit & Tie', icon: 'blazer' },
  { id: 'hoodie', labelTh: 'สตรีทฮู้ดดี้', labelEn: 'Street Hoodie', icon: 'flame' },
  { id: 'labcoat', labelTh: 'เสื้อกาวน์นักวิจัย', labelEn: 'Lab Coat', icon: 'labCoat' },
]

export const AVATAR_AURAS: { id: AvatarAura; labelTh: string; labelEn: string; icon: IconName }[] = [
  { id: 'none', labelTh: 'ไม่มีออร่า', labelEn: 'No Aura', icon: 'sparkle' },
  { id: 'neon', labelTh: 'วงแหวนนีออนคู่', labelEn: 'Cyber Neon Rings', icon: 'swords' },
  { id: 'gold', labelTh: 'ออร่าทองประกาย', labelEn: 'Golden Halo', icon: 'crown' },
  { id: 'stars', labelTh: 'ดวงดาวโคจร', labelEn: 'Orbiting Stars', icon: 'star' },
]
