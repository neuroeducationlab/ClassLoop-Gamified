import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useApp, type AvatarHat, type AvatarOutfit, type AvatarAura } from '@/context/AppContext'
import { playClickSound, playCoinSound, playLevelUpSound, playWrongSound } from '../soundEngine'

interface ShopItem {
  id: string
  name: string
  nameEn: string
  category: 'hat' | 'outfit' | 'aura'
  itemKey: AvatarHat | AvatarOutfit | AvatarAura
  price: number
  icon: string
  description: string
  descriptionEn: string
  color: string
}

const SHOP_ITEMS: ShopItem[] = [
  // Hats
  {
    id: 'hat-grad',
    name: 'หมวกรับปริญญา SPU',
    nameEn: 'SPU Graduation Mortarboard',
    category: 'hat',
    itemKey: 'grad',
    price: 0,
    icon: '🎓',
    description: 'หมวกบัณฑิตคลาสสิก มหาวิทยาลัยศรีปทุม',
    descriptionEn: 'Classic Sripatum University graduate mortarboard',
    color: '#2B2D55',
  },
  {
    id: 'hat-cyber_cat',
    name: 'หูแมวไซเบอร์ Cyber Cat',
    nameEn: 'Cyber Cat Neon Ears',
    category: 'hat',
    itemKey: 'cyber_cat',
    price: 80,
    icon: '🐱',
    description: 'หูแมวเรืองแสงนีออนสีชมพูสำหรับเกมเมอร์',
    descriptionEn: 'Glow-in-the-dark neon pink gaming cat ears',
    color: '#EC4899',
  },
  {
    id: 'hat-dj_headset',
    name: 'หูฟังดีเจนิเทศ DJ Headset',
    nameEn: 'DJ Studio Headphones',
    category: 'hat',
    itemKey: 'dj_headset',
    price: 90,
    icon: '🎧',
    description: 'หูฟังบลูทูธสตรีมเมอร์ พร้อมไฟสีฟ้า',
    descriptionEn: 'Streamer Bluetooth headset with cyan LED indicators',
    color: '#06B6D4',
  },
  {
    id: 'hat-crown',
    name: 'มงกุฎเกียรตินิยม Golden Crown',
    nameEn: 'Golden Honors Crown',
    category: 'hat',
    itemKey: 'crown',
    price: 150,
    icon: '👑',
    description: 'มงกุฎทองคำประดับอัญมณีสำหรับผู้ทำคะแนนสูงสุด',
    descriptionEn: 'Royal jeweled gold crown for top leaderboard rankers',
    color: '#FBBF24',
  },
  {
    id: 'hat-cap',
    name: 'หมวกแก๊ปเด็กสถาปัตย์',
    nameEn: 'Architecture Studio Cap',
    category: 'hat',
    itemKey: 'cap',
    price: 40,
    icon: '🧢',
    description: 'หมวกแก๊ปสไตล์เด็กสถาปัตย์สุดคูล',
    descriptionEn: 'Streetwear baseball cap favored by architecture designers',
    color: '#3B82F6',
  },
  {
    id: 'hat-beanie',
    name: 'หมวกบีนนี่เด็กอินดี้',
    nameEn: 'Indie Creator Beanie',
    category: 'hat',
    itemKey: 'beanie',
    price: 50,
    icon: '🧶',
    description: 'หมวกไหมพรมสตรีทแฟชั่น',
    descriptionEn: 'Cozy knitted streetwear beanie for campus wanderers',
    color: '#10B981',
  },

  // Outfits
  {
    id: 'outfit-default',
    name: 'เครื่องแบบนักศึกษา SPU',
    nameEn: 'SPU Official Student Uniform',
    category: 'outfit',
    itemKey: 'default',
    price: 0,
    icon: '👕',
    description: 'ชุดนักศึกษาสีชมพูอันเป็นเอกลักษณ์ของ SPU',
    descriptionEn: 'Signature Sripatum University pink uniform',
    color: '#E89BC4',
  },
  {
    id: 'outfit-hoodie',
    name: 'สตรีทฮู้ดดี้ Esports Team',
    nameEn: 'Esports Varsity Hoodie',
    category: 'outfit',
    itemKey: 'hoodie',
    price: 70,
    icon: '🧥',
    description: 'เสื้อฮู้ดดี้ทีมนักกีฬาอีสปอร์ตมหาวิทยาลัย',
    descriptionEn: 'Official team hoodie for university esports athletes',
    color: '#3B82F6',
  },
  {
    id: 'outfit-suit',
    name: 'สูทเบลเซอร์ Business Blazer',
    nameEn: 'Executive Business Blazer',
    category: 'outfit',
    itemKey: 'suit',
    price: 110,
    icon: '👔',
    description: 'สูทผู้บริหารระดับสากลพร้อมเนกไทสีชมพู',
    descriptionEn: 'Tailored corporate blazer with SPU signature pink tie',
    color: '#1E2235',
  },
  {
    id: 'outfit-labcoat',
    name: 'เสื้อกาวน์แล็บวิทยาการคอมฯ',
    nameEn: 'Computer Science Lab Coat',
    category: 'outfit',
    itemKey: 'labcoat',
    price: 120,
    icon: '🥼',
    description: 'ชุดกาวน์ห้องปฏิบัติการนวัตกรรมและ AI',
    descriptionEn: 'Innovation & AI lab coat for research projects',
    color: '#F8FAFC',
  },

  // Auras
  {
    id: 'aura-none',
    name: 'ไม่มีออร่า',
    nameEn: 'No Aura',
    category: 'aura',
    itemKey: 'none',
    price: 0,
    icon: '✨',
    description: 'มุมมองเรียบง่าย สบายตา',
    descriptionEn: 'Clean, minimalist everyday campus presence',
    color: '#94A3B8',
  },
  {
    id: 'aura-neon',
    name: 'วงแหวนไซเบอร์นีออน',
    nameEn: 'Cyber Neon Rings',
    category: 'aura',
    itemKey: 'neon',
    price: 140,
    icon: '💫',
    description: 'วงแหวนแสงคู่หมุนรอบเท้าสไตล์เกม Sci-Fi',
    descriptionEn: 'Twin orbiting luminescent rings around the avatar',
    color: '#38BDF8',
  },
  {
    id: 'aura-gold',
    name: 'ละอองแสงทองคำ Golden Aura',
    nameEn: 'Radiant Golden Aura',
    category: 'aura',
    itemKey: 'gold',
    price: 130,
    icon: '🌟',
    description: 'ออร่าแสงสีทองเรืองรองเปล่งประกายรอบตัว',
    descriptionEn: 'Gleaming gold starlight emanating from the student',
    color: '#F59E0B',
  },
  {
    id: 'aura-stars',
    name: 'ดวงดาวโคจร Star Dust',
    nameEn: 'Orbiting Star Dust',
    category: 'aura',
    itemKey: 'stars',
    price: 160,
    icon: '⭐',
    description: 'ดาวหมุนลอยรอบตัวละครเหมือนเวทมนตร์',
    descriptionEn: 'Constellations orbiting the avatar like a magic spell',
    color: '#FDE047',
  },
]

export default function AvatarShopModal({ onClose }: { onClose: () => void }) {
  const {
    studentCoins,
    ownedStoreItems,
    buyStoreItem,
    equipStoreItem,
    avatar,
    lang,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'hat' | 'outfit' | 'aura'>('hat')
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null)

  const items = SHOP_ITEMS.filter((i) => i.category === activeTab)

  // Esc closes, like every other campus modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleAction = (item: ShopItem) => {
    const isOwned = item.price === 0 || ownedStoreItems.includes(item.id)

    if (isOwned) {
      equipStoreItem(item.category, item.itemKey)
      playLevelUpSound()
      setPurchaseMsg(
        lang === 'th'
          ? `สวมใส่ ${item.name} เรียบร้อย! ✨`
          : `Equipped ${item.name} successfully! ✨`
      )
      setTimeout(() => setPurchaseMsg(null), 2500)
    } else {
      if (studentCoins >= item.price) {
        const ok = buyStoreItem(item.id, item.price)
        if (ok) {
          playCoinSound()
          equipStoreItem(item.category, item.itemKey)
          setPurchaseMsg(
            lang === 'th'
              ? `ซื้อและสวมใส่ ${item.name} สำเร็จ! 🎉`
              : `Purchased & equipped ${item.name}! 🎉`
          )
          setTimeout(() => setPurchaseMsg(null), 2500)
        }
      } else {
        playWrongSound()
        setPurchaseMsg(
          lang === 'th'
            ? 'เหรียญของคุณไม่เพียงพอ! ทำการบ้านหรือควิซเพื่อสะสมเหรียญเพิ่มนะ'
            : 'Not enough coins! Complete quizzes or quests to earn more coins.'
        )
        setTimeout(() => setPurchaseMsg(null), 3000)
      }
    }
  }

  const isEquipped = (item: ShopItem) => {
    if (item.category === 'hat') return (avatar?.hat ?? 'grad') === item.itemKey
    if (item.category === 'outfit') return (avatar?.outfit ?? 'default') === item.itemKey
    if (item.category === 'aura') return (avatar?.aura ?? 'none') === item.itemKey
    return false
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300"
      // a click outside the card closes it
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-[#16182E]/95 p-6 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            playClickSound()
            onClose()
          }}
          aria-label={lang === 'th' ? 'ปิด' : 'Close'}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/25 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header & Coin Counter */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-lg text-xl">
              🛍️
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'th' ? 'ร้านค้าแฟชั่น SPU Boutique' : 'SPU Boutique Fashion Shop'}
              </h3>
              <p className="text-xs text-white/60">
                {lang === 'th'
                  ? 'แต่งตัวคาแรคเตอร์ด้วยเหรียญจากการเรียน'
                  : 'Style your character with earned study coins'}
              </p>
            </div>
          </div>

          {/* Coin Wallet Badge */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 px-3.5 py-1.5 text-amber-300 shadow-md">
            <span className="text-base">🪙</span>
            <span className="text-sm font-extrabold">{studentCoins}</span>
            <span className="text-[10px] text-amber-400/80">{lang === 'th' ? 'Coins' : 'Coins'}</span>
          </div>
        </div>

        {/* Toast / Feedback Notice */}
        {purchaseMsg && (
          <div className="mb-3 rounded-xl bg-pink-500/20 border border-pink-400/40 px-3 py-2 text-center text-xs font-bold text-pink-300 animate-in zoom-in-95">
            {purchaseMsg}
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1 mb-4 text-xs font-bold border border-white/10">
          <button
            onClick={() => {
              playClickSound()
              setActiveTab('hat')
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeTab === 'hat' ? 'bg-pink-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{lang === 'th' ? '👑 หมวก & เครื่องประดับ' : '👑 Hats & Accessories'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound()
              setActiveTab('outfit')
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeTab === 'outfit' ? 'bg-pink-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{lang === 'th' ? '👔 ชุดแฟชั่น' : '👔 Outfits'}</span>
          </button>
          <button
            onClick={() => {
              playClickSound()
              setActiveTab('aura')
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              activeTab === 'aura' ? 'bg-pink-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            <span>{lang === 'th' ? '✨ ออร่าเรืองแสง' : '✨ Glowing Auras'}</span>
          </button>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => {
            const isOwned = item.price === 0 || ownedStoreItems.includes(item.id)
            const equipped = isEquipped(item)
            const canAfford = studentCoins >= item.price

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                  equipped
                    ? 'border-pink-500 bg-pink-950/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : isOwned
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Equipped Badge */}
                {equipped && (
                  <span className="absolute right-2 top-2 rounded-full bg-pink-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
                    {lang === 'th' ? 'ใส่แล้ว ✓' : 'Equipped ✓'}
                  </span>
                )}

                <div>
                  {/* Icon & Color Dot */}
                  <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-2xl bg-white/10 text-2xl shadow mb-2">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-xs text-center text-white line-clamp-1">
                    {lang === 'en' && item.nameEn ? item.nameEn : item.name}
                  </h4>
                  <p className="text-[10px] text-white/60 text-center mt-0.5 line-clamp-2 leading-relaxed">
                    {lang === 'en' && item.descriptionEn ? item.descriptionEn : item.description}
                  </p>
                </div>

                {/* Price / Action Button */}
                <div className="mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleAction(item)}
                    disabled={equipped}
                    className={`w-full flex items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      equipped
                        ? 'bg-white/10 text-white/50 cursor-default'
                        : isOwned
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    {equipped ? (
                      lang === 'th' ? 'ใช้งานอยู่' : 'Equipped'
                    ) : isOwned ? (
                      lang === 'th' ? 'สวมใส่' : 'Equip'
                    ) : (
                      <>
                        <span>🪙 {item.price}</span>
                        <span>{lang === 'th' ? 'ซื้อเลย' : 'Buy Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
