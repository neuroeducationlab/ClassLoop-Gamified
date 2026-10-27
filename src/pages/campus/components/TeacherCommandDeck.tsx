import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { BUILDINGS, type BuildingId } from '@/data/buildings'
import { TEACHER_COMMANDS } from '@/data/teacherCommands'
import CommandMenu from './CommandMenu'
import HoloPreview from './HoloPreview'

const LOUNGE = 'lounge-room'

/**
 * The teacher's whole job on the campus, as one RPG command box: no walking
 * needed. Hovering a command projects a hologram preview of its real page and
 * lights up the building it lives in; choosing it opens the page.
 */
export default function TeacherCommandDeck({ onHoverBuilding }: { onHoverBuilding: (id: BuildingId | null) => void }) {
  const { lang } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(true)

  const items = [
    ...TEACHER_COMMANDS.map((c) => ({ id: c.id, icon: c.icon, label: c.label[lang], does: c.does[lang] })),
    {
      id: LOUNGE,
      icon: '☕',
      label: lang === 'th' ? 'เข้าห้องพักครู' : 'Enter the Staff Lounge',
      does: lang === 'th' ? 'ทุกเครื่องมือในห้องเดียว (เฉพาะอาจารย์)' : 'Every tool in one room — staff only',
    },
  ]
  const command = TEACHER_COMMANDS.find((c) => c.id === selected)
  const home = BUILDINGS.find((b) => b.id === (command?.buildingId ?? (selected === LOUNGE ? 'lounge' : null)))

  const select = (id: string | null) => {
    setSelected(id)
    const c = TEACHER_COMMANDS.find((x) => x.id === id)
    onHoverBuilding(c ? c.buildingId : id === LOUNGE ? 'lounge' : null)
  }
  const confirm = (id: string) => {
    onHoverBuilding(null)
    if (id === LOUNGE) navigate('/campus/lounge')
    else navigate(TEACHER_COMMANDS.find((c) => c.id === id)!.route)
  }

  return (
    <div className="pointer-events-none absolute left-4 top-20 z-30 flex items-start gap-8">
      <div className="pointer-events-auto w-[min(20rem,calc(100vw-2rem))]">
        <button
          onClick={() => setOpen((o) => !o)}
          className="mb-2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur hover:text-white"
        >
          {open ? (lang === 'th' ? '▾ ซ่อนเมนู' : '▾ Hide menu') : lang === 'th' ? '▸ เมนูอาจารย์' : '▸ Teacher menu'}
        </button>
        {open && (
          <CommandMenu
            title={lang === 'th' ? 'คำสั่งอาจารย์' : 'TEACHER COMMANDS'}
            items={items}
            selected={selected}
            onSelect={select}
            onConfirm={confirm}
          />
        )}
      </div>
      {/* the preview needs room: laptops and up only */}
      {open && (
        <div className="relative mt-9 hidden lg:block">
          <HoloPreview
            content={command?.content ?? null}
            footer={
              command && (
                <p className="mt-2 max-w-[400px] rounded-xl border border-[#7FE3FF]/30 bg-[#0D1030]/80 px-3 py-2 text-xs text-white/90 backdrop-blur">
                  <span className="font-bold text-[#7FE3FF]">{home?.emoji} {home?.name[lang]}</span>
                  <span className="text-white/60"> · {lang === 'th' ? 'กด Enter หรือคลิกเพื่อเปิด' : 'press Enter or click to open'}</span>
                </p>
              )
            }
          />
        </div>
      )}
    </div>
  )
}
