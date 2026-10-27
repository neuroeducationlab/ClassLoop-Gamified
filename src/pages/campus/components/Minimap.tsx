import { useState } from 'react'
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import type { Building } from '@/data/buildings'
import CampusMapSVG from './CampusMapSVG'

type MinimapProps = {
  avatarPosition: [number, number]
  avatarColor?: string
  avatarRotation?: number
  onWalk: (x: number, z: number) => void
  onSelectBuilding: (b: Building) => void
  lang?: 'th' | 'en'
}

export default function Minimap({
  avatarPosition,
  avatarColor,
  avatarRotation,
  onWalk,
  onSelectBuilding,
  lang = 'en',
}: MinimapProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="fixed bottom-5 right-4 z-20 select-none">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/50 text-white shadow-2xl backdrop-blur-md transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-white/90">
            <MapPin className="h-3 w-3 text-pink-400" />
            <span>{lang === 'en' ? 'Campus Map' : 'แผนที่ · Minimap'}</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-white/15 text-white/80 transition-colors cursor-pointer"
            title={collapsed ? (lang === 'en' ? 'Expand map' : 'ขยายแผนที่') : (lang === 'en' ? 'Collapse map' : 'ย่อแผนที่')}
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Map Body */}
        {!collapsed && (
          <div className="p-1.5">
            <div className="relative w-40 sm:w-48 overflow-hidden rounded-xl border border-white/10">
              <CampusMapSVG
                className="block h-auto w-full"
                avatarPosition={avatarPosition}
                avatarColor={avatarColor}
                avatarRotation={avatarRotation}
                showLabels={false}
                interactive={true}
                onBuildingClick={onSelectBuilding}
                onMapClick={onWalk}
                lang={lang}
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-white/70">
              {lang === 'en' ? 'Tap map to walk · Click to navigate' : 'แตะเพื่อเดิน · Tap to walk'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
