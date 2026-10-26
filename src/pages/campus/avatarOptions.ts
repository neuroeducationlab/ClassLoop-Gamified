import type { AvatarHat } from '@/context/AppContext'

export const AVATAR_COLORS = ['#E89BC4', '#4FB0A5', '#F2994A', '#7C9BE8', '#F25F5C', '#7FB069', '#F2C879']

export const AVATAR_HATS: { id: AvatarHat; label: string }[] = [
  { id: 'none', label: 'ไม่ใส่' },
  { id: 'cap', label: 'แก๊ป' },
  { id: 'grad', label: 'หมวกบัณฑิต' },
  { id: 'beanie', label: 'บีนนี่' },
]
