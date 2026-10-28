import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Coins,
  LogOut,
  Palette,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Section from './Section'
import AvatarShopModal from '../components/AvatarShopModal'
import { playClickSound, playCoinSound } from '../soundEngine'
import { GameIcon } from '@/components/icons/GameIcon'

/**
 * GateRoom: SPU Cybernetic Gate & Virtual Student Identity Hub
 * Features a high-tech holographic campus pass, level progression bar,
 * wardrobe & boutique direct access, and presentation role quick-switching.
 */
export default function GateRoom() {
  const {
    avatar,
    currentStudent,
    studentXP,
    studentCoins,
    missions,
    setRole,
    signOut,
    lang,
  } = useApp()
  const navigate = useNavigate()
  const [shopOpen, setShopOpen] = useState(false)

  const nickname = avatar?.nickname ?? currentStudent.nickname
  const level = Math.max(1, Math.floor(studentXP / 100))
  const levelProgress = studentXP % 100
  const completedMissions = missions.filter((m) => m.completed).length

  return (
    <>
      {/* ── Holographic Student Pass Card ── */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#1E2246] via-[#16182E] to-[#2B1B40] p-6 text-white shadow-2xl backdrop-blur-2xl">
        {/* Ambient Hologram Glows */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Card Header: SPU Official Cyber Pass Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-xs font-bold text-pink-300 border border-pink-500/30">
              SPU
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-pink-300">
                SRIPATUM UNIVERSITY · CYBER CAMPUS PASS
              </p>
              <p className="text-xs text-white/60">ClassLoop Gamified v3.2 · Live Identity</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {lang === 'th' ? 'สถานะ: ออนไลน์' : 'Status: Online'}
          </span>
        </div>

        {/* Card Body: Avatar & Identity Details */}
        <div className="relative mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Hologram Disc */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-2 border-white/30 bg-gradient-to-tr from-pink-500/30 to-purple-600/30 text-5xl shadow-[0_0_25px_rgba(236,72,153,0.3)] backdrop-blur">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: avatar?.color ?? '#E89BC4' }}
            >
              <GameIcon name="gradCap" />
            </span>
            <span className="absolute -bottom-2 -right-1 rounded-full border border-pink-400/50 bg-[#16182E] px-2 py-0.5 text-[10px] font-extrabold text-pink-300 shadow">
              Lv.{level}
            </span>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">{nickname}</h1>
              <span className="rounded-md border border-purple-400/30 bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-200">
                {currentStudent.faculty}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/70">
              {currentStudent.name} · ID: SPU-67-04891
            </p>

            {/* Level & XP Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1 text-amber-300">
                  <Zap className="h-3.5 w-3.5" /> {studentXP} XP
                </span>
                <span className="text-white/60">
                  {lang === 'th' ? `อีก ${100 - levelProgress} XP ถึงเลเวล ${level + 1}` : `${100 - levelProgress} XP to Lv.${level + 1}`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  style={{ width: `${Math.max(8, levelProgress)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Rewards Row */}
        <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-white/60">{lang === 'th' ? 'เหรียญสะสม' : 'SPU Coins'}</p>
              <p className="flex items-center gap-1 text-base font-extrabold text-amber-300">
                <GameIcon name="coin" /> {studentCoins}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-white/60">{lang === 'th' ? 'ภารกิจสำเร็จ' : 'Quests Done'}</p>
              <p className="text-base font-extrabold text-purple-300">
                {completedMissions} / {missions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Character Wardrobe & SPU Boutique Section ── */}
      <Section
        title={lang === 'th' ? 'ตู้เสื้อผ้า & แฟชั่นมหาลัย' : 'Wardrobe & Campus Boutique'}
        sub={
          lang === 'th'
            ? 'ปรับแต่งรูปลักษณ์ ทรงผม หมวก และเสื้อผ้านักศึกษาเสมือนจริง'
            : 'Customize your avatar 3D looks, equipped hats, and campus cosmetics'
        }
        icon={<Palette className="h-4 w-4 text-pink-400" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              playClickSound()
              navigate('/create')
            }}
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {lang === 'th' ? 'เข้าห้องแต่งตัว 3D' : 'Enter 3D Fitting Room'}
          </button>
          <button
            onClick={() => {
              playCoinSound()
              setShopOpen(true)
            }}
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-5 py-3.5 text-sm font-extrabold text-amber-300 shadow-md hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            {lang === 'th' ? 'ร้านค้า SPU Boutique' : 'Open SPU Boutique'}
          </button>
        </div>
      </Section>

      {/* ── Presentation & Session Controls ── */}
      <Section
        title={lang === 'th' ? 'การตั้งค่า & สลับบทบาทเดโม' : 'Presentation & Session Control'}
        sub={
          lang === 'th'
            ? 'อำนวยความสะดวกสำหรับนำเสนองานบนเวที หรือออกจากระบบ'
            : 'Useful quick tools for onstage demo presentations or signing out'
        }
        icon={<UserCheck className="h-4 w-4 text-blue-400" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              playClickSound()
              setRole('teacher')
              navigate('/map')
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-blue-400/40 bg-blue-500/15 py-3.5 text-sm font-bold text-blue-200 hover:bg-blue-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            {lang === 'th' ? 'สลับเป็นโหมดอาจารย์ (Teacher Demo)' : 'Switch to Teacher Demo'}
          </button>
          <button
            onClick={() => {
              playClickSound()
              signOut()
              navigate('/login')
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-3.5 text-sm font-bold text-white/80 hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-rose-200 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            {lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
          </button>
        </div>
      </Section>

      {/* SPU Boutique Shop Modal */}
      {shopOpen && <AvatarShopModal onClose={() => setShopOpen(false)} />}
    </>
  )
}
