import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { type BuildingId } from '@/data/buildings'
import { TEACHER_COMMANDS } from '@/data/teacherCommands'
import { playCloudWhooshSound } from '../soundEngine'
import CommandMenu from './CommandMenu'
import HoloPreview from './HoloPreview'
import CloudTransition from './CloudTransition'

/**
 * The teacher's complete control center on the campus, as one RPG command box:
 * - Vertically stacked, readable text cards with action badges ("เห็นสิ่งที่ต้องทำ")
 * - Hover triggers a large animated sci-fi hologram preview in the center of the screen
 * - Click/Enter triggers a soft, smooth cloud cover and parting transition into the feature
 * - Clean, distraction-free game UI
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
  const [isClouding, setIsClouding] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  const items = TEACHER_COMMANDS.map((c) => ({
    id: c.id,
    icon: c.icon,
    label: c.label[lang],
    does: c.does[lang],
    actionBadge: c.actionBadge?.[lang],
    urgent: c.urgent,
  }))

  const command = TEACHER_COMMANDS.find((c) => c.id === selected)

  const select = (id: string | null) => {
    setSelected(id)
    const c = TEACHER_COMMANDS.find((x) => x.id === id)
    onHoverBuilding(c ? c.buildingId : null)
  }

  const confirm = (id: string) => {
    if (isClouding) return
    const target = TEACHER_COMMANDS.find((c) => c.id === id)
    if (!target) return

    setPendingRoute(target.route)
    setIsClouding(true)
    playCloudWhooshSound()
  }

  const handleCloudCovered = () => {
    onHoverBuilding(null)
    if (pendingRoute) {
      navigate(pendingRoute)
    }
  }

  return (
    <>
      {/* ── Left Column: RPG Command Menu ── */}
      <div className="pointer-events-none fixed left-4 top-16 z-30 flex items-start gap-6 select-none font-campus">
        <div className="pointer-events-auto w-[min(22rem,calc(100vw-2rem))]">
          {/* Top Control Bar: Minimize / Expand Toggle */}
          <div className="mb-2">
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
      </div>

      {/* ── Center Stage: Large Hologram Preview in Remaining Screen Space ── */}
      {open && command && (
        <div className="pointer-events-none fixed inset-y-0 left-[23rem] right-4 z-30 hidden lg:flex items-center justify-center p-4">
          <HoloPreview
            content={command.content}
            width={720}
            height={440}
            isWarping={isClouding}
            onConfirm={() => confirm(command.id)}
          />
        </div>
      )}

      {/* ── Soft Cloud Cover & Reveal Transition ── */}
      <CloudTransition
        active={isClouding}
        onCoverComplete={handleCloudCovered}
      />
    </>
  )
}
