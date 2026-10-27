import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, type BuildingId } from '@/data/buildings'
import { TEACHER_COMMANDS } from '@/data/teacherCommands'
import CommandMenu from './CommandMenu'
import HoloPreview from './HoloPreview'

/**
 * The teacher's complete control center on the campus, as one RPG command box:
 * - Direct shortcut button to the original web dashboard
 * - Vertically stacked, readable text cards with action badges ("เห็นสิ่งที่ต้องทำ")
 * - Hover triggers an animated hologram preview of the real feature page
 * - Unlocks all features and buildings for the instructor
 */
export default function TeacherCommandDeck({
  onHoverBuilding,
}: {
  onHoverBuilding: (id: BuildingId | null) => void
}) {
  const { lang } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  const items = TEACHER_COMMANDS.map((c) => ({
    id: c.id,
    icon: c.icon,
    label: c.label[lang],
    does: c.does[lang],
    actionBadge: c.actionBadge?.[lang],
    urgent: c.urgent,
  }))

  const command = TEACHER_COMMANDS.find((c) => c.id === selected)
  const home = BUILDINGS.find((b) => b.id === command?.buildingId)

  const select = (id: string | null) => {
    setSelected(id)
    const c = TEACHER_COMMANDS.find((x) => x.id === id)
    onHoverBuilding(c ? c.buildingId : null)
  }

  const confirm = (id: string) => {
    onHoverBuilding(null)
    const target = TEACHER_COMMANDS.find((c) => c.id === id)
    if (target) {
      navigate(target.route)
    }
  }

  return (
    <div className="pointer-events-none absolute left-4 top-16 z-30 flex items-start gap-6 select-none font-campus">
      <div className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))]">
        {/* Top Control Bar: Toggle + Quick Original Dashboard Shortcut */}
        <div className="mb-2 space-y-1.5">
          {/* Prominent Shortcut to Original Web Dashboard */}
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="group flex w-full items-center justify-between rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500/25 via-[#231e33] to-[#16182e] px-3.5 py-2 text-xs font-black text-amber-300 shadow-lg shadow-amber-500/20 backdrop-blur-xl transition-all duration-200 hover:border-amber-300 hover:brightness-125 cursor-pointer active:scale-98"
            title={lang === 'th' ? 'กลับสู่หน้าแดชบอร์ดหลักของครู' : 'Return to original teacher web dashboard'}
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-amber-400 group-hover:rotate-6 transition-transform" />
              <span>
                {lang === 'th'
                  ? '⚡ หน้าเว็บหลักครู (Original Dashboard)'
                  : '⚡ Original Teacher Dashboard'}
              </span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-200/80 group-hover:translate-x-0.5 transition-transform">
              <span>Go</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </button>

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-bold text-white/80 backdrop-blur-md hover:bg-black/80 hover:text-white transition-all cursor-pointer"
          >
            <span>{open ? '▾' : '▸'}</span>
            <span>
              {open
                ? lang === 'th'
                  ? 'ซ่อนเมนูคำสั่งอาจารย์'
                  : 'Hide Commands'
                : lang === 'th'
                ? 'เมนูคำสั่งอาจารย์ (RPG Console)'
                : 'Teacher Commands'}
            </span>
          </button>
        </div>

        {/* RPG Vertical Command Box */}
        {open && (
          <CommandMenu
            title={lang === 'th' ? 'เมนูคำสั่งอาจารย์ (TEACHER CONSOLE)' : 'TEACHER COMMANDS'}
            subtitle={lang === 'th' ? 'เลือกเมนูเพื่อดูโฮโลแกรมตัวอย่าง' : 'Hover command to project hologram preview'}
            items={items}
            selected={selected}
            onSelect={select}
            onConfirm={confirm}
          />
        )}
      </div>

      {/* ── Hologram Pop-Up Preview (Laptops & Desktops) ── */}
      {open && (
        <div className="relative mt-12 hidden lg:block">
          <HoloPreview
            content={command?.content ?? null}
            footer={
              command && (
                <div className="mt-2.5 max-w-[460px] space-y-1.5 rounded-2xl border border-[#7FE3FF]/40 bg-[#0D1030]/90 p-3 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-black text-[#7FE3FF]">
                      <Sparkles className="h-3.5 w-3.5 text-[#7FE3FF]" />
                      {home?.emoji} {home?.name[lang]} (SPU · {home?.spuRef})
                    </span>
                    {command.actionBadge && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                          command.urgent
                            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-teal-400/20 text-teal-200 border border-teal-400/30'
                        }`}
                      >
                        {command.actionBadge[lang]}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed">
                    {command.does[lang]}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-white/50 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                      {lang === 'th' ? 'เห็นสิ่งที่ต้องทำ & ข้อมูลจริง' : 'Live data preview'}
                    </span>
                    <button
                      onClick={() => confirm(command.id)}
                      className="pointer-events-auto rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-3 py-1 font-black text-white shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{lang === 'th' ? 'เปิดใช้งาน (Enter)' : 'Launch (Enter)'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )
            }
          />
        </div>
      )}
    </div>
  )
}
