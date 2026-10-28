import { useEffect } from 'react'
import { useApp, type AvatarAura, type AvatarHat, type AvatarOutfit } from '@/context/AppContext'
import { ITEM_BY_ID } from './catalog'
import { useWardrobe } from './store'

/** Dress the 3D campus avatar from the 2D wardrobe look (hat, outfit, aura, colour). */
export function useAvatar3DSync() {
  const { avatar, setAvatar, currentStudent } = useApp()
  const { look } = useWardrobe()
  useEffect(() => {
    const hat = (ITEM_BY_ID[look.hat]?.three?.hat ?? 'none') as AvatarHat
    const outfitItem = ITEM_BY_ID[look.outfit]?.three
    const outfit = (outfitItem?.outfit ?? 'default') as AvatarOutfit
    const aura = (ITEM_BY_ID[look.aura]?.three?.aura ?? 'none') as AvatarAura
    const color = outfitItem?.color ?? '#E89BC4'
    const nickname = avatar?.nickname ?? currentStudent.nickname
    if (avatar && avatar.hat === hat && avatar.outfit === outfit && avatar.aura === aura && avatar.color === color) return
    setAvatar({ color, hat, outfit, aura, nickname })
  }, [look, avatar, setAvatar, currentStudent.nickname])
}
