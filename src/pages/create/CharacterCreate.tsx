import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, RotateCw, Check } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useApp, type AvatarHat, type AvatarOutfit, type AvatarAura } from '@/context/AppContext'
import Avatar3D from '@/pages/campus/components/Avatar3D'
import {
  AVATAR_COLORS,
  AVATAR_HATS,
  AVATAR_OUTFITS,
  AVATAR_AURAS,
} from '@/pages/campus/avatarOptions'
import { playClickSound, playCoinSound } from '@/pages/campus/soundEngine'
import { GameIcon } from '@/components/icons/GameIcon'
import { cn } from '@/lib/utils'

type Tab = 'color' | 'hat' | 'outfit' | 'aura' | 'name'

export default function CharacterCreate() {
  const { currentStudent, avatar, setAvatar, lang } = useApp()
  const navigate = useNavigate()

  // State: Avatar Customization
  const [color, setColor] = useState<string>(() => avatar?.color || AVATAR_COLORS[0])
  const [hat, setHat] = useState<AvatarHat>(() => avatar?.hat || 'grad')
  const [outfit, setOutfit] = useState<AvatarOutfit>(() => avatar?.outfit || 'default')
  const [aura, setAura] = useState<AvatarAura>(() => avatar?.aura || 'none')
  const [nickname, setNickname] = useState<string>(() => avatar?.nickname || currentStudent.nickname)

  const [activeTab, setActiveTab] = useState<Tab>('color')

  const handleSave = (e?: FormEvent) => {
    if (e) e.preventDefault()
    playCoinSound()
    const cleanNick = nickname.trim() || currentStudent.nickname
    const saved = { color, hat, outfit, aura, nickname: cleanNick }
    setAvatar(saved)
    try {
      localStorage.setItem('classloop_avatar_3d', JSON.stringify(saved))
    } catch {}
    navigate('/campus')
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-grey-900 via-[#181A2A] to-[#0F111E] font-campus text-white select-none">
      {/* Top Navbar */}
      <header className="z-20 flex items-center justify-between border-b border-white/10 bg-black/40 px-6 py-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/campus')}
          className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/15 cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{lang === 'th' ? 'กลับสู่แคมปัส 3D' : 'Back to Campus'}</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>{lang === 'th' ? 'ห้องแต่งตัวตัวละคร 3D' : '3D Avatar Customizer'}</span>
          </h1>
          <p className="text-[11px] text-white/60">
            {lang === 'th' ? 'ปรับแต่งโมเดล 3D แบบเดียวกันกับที่แสดงในแคมปัส' : 'Customize the exact 3D avatar that walks on campus'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-xs font-black text-white shadow-lg shadow-pink-500/25 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
        >
          <Check className="h-4 w-4 stroke-[3]" />
          <span>{lang === 'th' ? 'บันทึก & ใช้งาน' : 'Save & Equip'}</span>
        </button>
      </header>

      {/* Main Split Layout: 3D Stage on Left/Top, Controls on Right/Bottom */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left: Interactive 3D Canvas Stage */}
        <div className="relative flex-1 min-h-[340px] lg:min-h-auto flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.15)_0%,rgba(0,0,0,0)_70%)]">
          <div className="absolute top-4 left-4 z-10 rounded-xl bg-black/40 px-3 py-1.5 text-[11px] text-white/70 backdrop-blur-md border border-white/10 flex items-center gap-1.5 pointer-events-none">
            <RotateCw className="h-3 w-3 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{lang === 'th' ? 'คลิกและลากเพื่อหมุนดูรอบตัว 360°' : 'Click & drag to rotate 360°'}</span>
          </div>

          <Canvas flat camera={{ position: [0, 1.3, 3.2], fov: 42 }} dpr={[1, 2]}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[4, 6, 4]} intensity={1.5} color="#FFEACC" />
            <directionalLight position={[-4, 3, -3]} intensity={0.7} color="#90CDF4" />

            <group position={[0, -0.72, 0]}>
              <Avatar3D color={color} hat={hat} outfit={outfit} aura={aura} />
              <ContactShadows opacity={0.5} scale={4} blur={2.4} far={2} />
            </group>

            <OrbitControls
              target={[0, 0.1, 0]}
              autoRotate
              autoRotateSpeed={1.8}
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3.2}
              maxPolarAngle={Math.PI / 1.9}
            />
          </Canvas>

          {/* Avatar Name Tag Preview */}
          <div className="absolute bottom-4 z-10 flex flex-col items-center">
            <div className="rounded-full bg-black/70 px-4 py-1 text-xs font-black text-pink-300 border border-pink-500/30 shadow-md">
              {nickname.trim() || currentStudent.nickname}
            </div>
            <span className="text-[10px] text-white/40 mt-1">SPU Student Avatar</span>
          </div>
        </div>

        {/* Right: Customization Controls Panel */}
        <div className="w-full lg:w-[480px] flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-[#121422]/90 backdrop-blur-xl">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 border-b border-white/10 p-2 overflow-x-auto">
            {(
              [
                { id: 'color', labelTh: 'สีตัวละคร', labelEn: 'Color', icon: 'sparkle' },
                { id: 'hat', labelTh: 'หมวก 3D', labelEn: '3D Hat', icon: 'gradCap' },
                { id: 'outfit', labelTh: 'ชุด 3D', labelEn: '3D Outfit', icon: 'shirt' },
                { id: 'aura', labelTh: 'ออร่า 3D', labelEn: '3D Aura', icon: 'crown' },
                { id: 'name', labelTh: 'ฉายา', labelEn: 'Name', icon: 'idea' },
              ] as const
            ).map((t) => {
              const isSelected = activeTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    playClickSound()
                    setActiveTab(t.id)
                  }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap',
                    isSelected
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50 shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent',
                  )}
                >
                  <GameIcon name={t.icon} className="h-3.5 w-3.5" />
                  <span>{lang === 'th' ? t.labelTh : t.labelEn}</span>
                </button>
              )
            })}
          </div>

          {/* Options Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Color Palette Tab */}
            {activeTab === 'color' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'th' ? 'เลือกสีผิวตัวละคร 3D' : 'Select Avatar Body Color'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'th' ? 'สีหลักของตัวละคร 3D ในแคมปัส' : 'Primary color for your in-game 3D avatar'}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {AVATAR_COLORS.map((c) => {
                    const isSelected = color === c
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          playClickSound()
                          setColor(c)
                        }}
                        className={cn(
                          'relative flex h-14 w-full items-center justify-center rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md',
                          isSelected ? 'border-white scale-105 ring-4 ring-pink-500/40' : 'border-transparent',
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {isSelected && <Check className="h-5 w-5 text-white drop-shadow-md stroke-[3]" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Hat Selection Tab */}
            {activeTab === 'hat' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'th' ? 'เลือกหมวกและเครื่องประดับศีรษะ 3D' : 'Choose 3D Headgear & Hats'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'th' ? 'ไอเทมประดับศีรษะแบบ 3D แสดงบนตัวละครทันที' : '3D head items equipped directly on your avatar'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {AVATAR_HATS.map((h) => {
                    const isSelected = hat === h.id
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          playClickSound()
                          setHat(h.id)
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                          isSelected
                            ? 'border-pink-500 bg-pink-500/20 text-white shadow-sm ring-1 ring-pink-500/30'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            isSelected ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/80',
                          )}
                        >
                          <GameIcon name={h.icon} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-white truncate">
                            {lang === 'th' ? h.labelTh : h.labelEn}
                          </p>
                          <span className="text-[10px] text-white/50 font-mono">{h.id}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Outfit Selection Tab */}
            {activeTab === 'outfit' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'th' ? 'เลือกชุดเครื่องแต่งกาย 3D' : 'Choose 3D Outfit'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'th' ? 'สไตล์ชุดลำลอง สูทผู้บริหาร หรือเสื้อกาวน์' : 'Campus uniform, CEO suit, hoodie or lab coat'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {AVATAR_OUTFITS.map((o) => {
                    const isSelected = outfit === o.id
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          playClickSound()
                          setOutfit(o.id)
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                          isSelected
                            ? 'border-pink-500 bg-pink-500/20 text-white shadow-sm ring-1 ring-pink-500/30'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            isSelected ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/80',
                          )}
                        >
                          <GameIcon name={o.icon} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-white truncate">
                            {lang === 'th' ? o.labelTh : o.labelEn}
                          </p>
                          <span className="text-[10px] text-white/50 font-mono">{o.id}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Aura Selection Tab */}
            {activeTab === 'aura' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'th' ? 'เลือกออร่าและเอฟเฟกต์พิเศษ 3D' : 'Choose 3D Visual Aura'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'th' ? 'เอฟเฟกต์แสงหมุนวนและดวงดาวโคจรรอบตัว' : 'Animated neon rings, golden glow, and orbiting stars'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {AVATAR_AURAS.map((a) => {
                    const isSelected = aura === a.id
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          playClickSound()
                          setAura(a.id)
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer',
                          isSelected
                            ? 'border-pink-500 bg-pink-500/20 text-white shadow-sm ring-1 ring-pink-500/30'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10',
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                            isSelected ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/80',
                          )}
                        >
                          <GameIcon name={a.icon} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-white truncate">
                            {lang === 'th' ? a.labelTh : a.labelEn}
                          </p>
                          <span className="text-[10px] text-white/50 font-mono">{a.id}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nickname Tab */}
            {activeTab === 'name' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'th' ? 'ตั้งชื่อเล่นในเกม (Campus Nickname)' : 'Campus Handle / Nickname'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {lang === 'th' ? 'ชื่อนี้จะแสดงเหนือศีรษะตัวละครและบนลีดเดอร์บอร์ด' : 'Displayed above your avatar head and on the leaderboard'}
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    placeholder={currentStudent.nickname}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all"
                  />
                  <p className="text-[11px] text-white/50">
                    {lang === 'th' ? `ชื่อเริ่มต้น: ${currentStudent.nickname} (${currentStudent.name})` : `Default: ${currentStudent.nickname} (${currentStudent.name})`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-white/10 p-5 bg-black/30">
            <button
              type="button"
              onClick={() => handleSave()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 py-3.5 text-sm font-black text-white shadow-xl shadow-pink-500/30 transition-all hover:brightness-110 active:scale-98 cursor-pointer"
            >
              <Check className="h-5 w-5 stroke-[3]" />
              <span>{lang === 'th' ? 'บันทึกตัวละครและเข้าสู่แคมปัส 3D' : 'Save Avatar & Enter 3D Campus'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
