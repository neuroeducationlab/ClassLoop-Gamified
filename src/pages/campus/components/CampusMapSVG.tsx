import { useRef, type MouseEvent } from 'react'
import {
  BUILDINGS,
  CAMPUS_PALETTE,
  CAR_PARKS,
  MRT_LINE,
  PLAZA_CENTER,
  POND,
  type Building,
  type BuildingShape,
} from '@/data/buildings'
import { doorPoint } from '../geometry'

/** Footprint (width, depth) of each shape on the top-down map, in world units. */
const FOOTPRINT: Record<Exclude<BuildingShape, 'arena'>, [number, number]> = {
  gate: [4.4, 1.2],
  hall: [5.0, 4.2],
  house: [3.8, 3.2],
  hub: [4.2, 3.6],
  office: [3.8, 3.3],
}

const MRT_ANGLE = (Math.atan2(MRT_LINE.to[1] - MRT_LINE.from[1], MRT_LINE.to[0] - MRT_LINE.from[0]) * 180) / Math.PI
const MRT_LABEL: [number, number] = [MRT_LINE.from[0] + 2.5, MRT_LINE.from[1] + 4.2]

export type CampusMapSVGProps = {
  className?: string
  activeFilter?: (b: Building) => boolean
  onBuildingClick?: (b: Building) => void
  onMapClick?: (worldX: number, worldZ: number) => void
  avatarPosition?: [x: number, z: number]
  avatarColor?: string
  avatarRotation?: number
  showLabels?: boolean
  interactive?: boolean
  lang?: 'th' | 'en'
}

export default function CampusMapSVG({
  className = 'block h-auto w-full',
  activeFilter,
  onBuildingClick,
  onMapClick,
  avatarPosition,
  avatarColor = '#E89BC4',
  avatarRotation = 0,
  showLabels = true,
  interactive = true,
  lang = 'en',
}: CampusMapSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!onMapClick || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    // SVG viewBox: -21 -16 39 32 (minX=-21, minY=-16, width=39, height=32)
    const nx = (e.clientX - rect.left) / rect.width
    const ny = (e.clientY - rect.top) / rect.height
    const worldX = -21 + nx * 39
    const worldZ = -16 + ny * 32
    onMapClick(worldX, worldZ)
  }

  return (
    <svg
      ref={svgRef}
      viewBox="-21 -16 39 32"
      className={className}
      role="img"
      aria-label="แผนที่แคมปัส SPU"
      onClick={handleSvgClick}
      style={{ cursor: onMapClick ? 'crosshair' : 'default' }}
    >
      {/* Base Campus Ground */}
      <rect x={-19.5} y={-15} width={36} height={30} rx={3} fill={CAMPUS_PALETTE.grass} />

      {/* Front Road (Phahonyothin) alongside the MRT */}
      <line
        x1={MRT_LINE.from[0] + 1.2}
        y1={MRT_LINE.from[1] - 1.2}
        x2={MRT_LINE.to[0] + 1.2}
        y2={MRT_LINE.to[1] - 1.2}
        stroke="#2E3036"
        strokeWidth={3.8}
        strokeLinecap="round"
      />
      {/* Dashed center line on road */}
      <line
        x1={MRT_LINE.from[0] + 1.2}
        y1={MRT_LINE.from[1] - 1.2}
        x2={MRT_LINE.to[0] + 1.2}
        y2={MRT_LINE.to[1] - 1.2}
        stroke="#FFFFFF"
        strokeWidth={0.2}
        strokeDasharray="0.8 1.2"
      />

      {/* MRT Viaduct */}
      <line
        x1={MRT_LINE.from[0]}
        y1={MRT_LINE.from[1]}
        x2={MRT_LINE.to[0]}
        y2={MRT_LINE.to[1]}
        stroke="#BFC5D2"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      {showLabels && (
        <text
          x={MRT_LABEL[0]}
          y={MRT_LABEL[1]}
          fontSize={0.85}
          fill="#FFFFFF"
          fontWeight={600}
          transform={`rotate(${MRT_ANGLE} ${MRT_LABEL[0]} ${MRT_LABEL[1]})`}
        >
          MRT · Exit 2
        </text>
      )}

      {/* Car parks + pond */}
      {CAR_PARKS.map(({ at, size }) => (
        <rect
          key={at.join()}
          x={at[0] - size[0] / 2}
          y={at[1] - size[1] / 2}
          width={size[0]}
          height={size[1]}
          rx={0.3}
          fill="#373942"
        />
      ))}

      {/* Reflective Pond */}
      <circle cx={POND.at[0]} cy={POND.at[1]} r={POND.r} fill="#1E5274" stroke="#DCE1ED" strokeWidth={0.3} />

      {/* Walkway Paths */}
      {BUILDINGS.map((b) => {
        const [dx, dz] = doorPoint(b)
        return (
          <line
            key={b.id}
            x1={PLAZA_CENTER[0]}
            y1={PLAZA_CENTER[1]}
            x2={dx}
            y2={dz}
            stroke={CAMPUS_PALETTE.path}
            strokeWidth={1.3}
            strokeLinecap="round"
          />
        )
      })}
      {/* Central Crossroads Plaza */}
      <circle cx={PLAZA_CENTER[0]} cy={PLAZA_CENTER[1]} r={2.5} fill={CAMPUS_PALETTE.path} />
      <circle cx={PLAZA_CENTER[0]} cy={PLAZA_CENTER[1]} r={0.7} fill={CAMPUS_PALETTE.spuPink} />

      {/* 6 Campus Buildings */}
      {BUILDINGS.map((b) => {
        const isActive = activeFilter ? activeFilter(b) : true
        const clickHandler =
          interactive && onBuildingClick
            ? (e: MouseEvent) => {
                e.stopPropagation()
                onBuildingClick(b)
              }
            : undefined
        return (
          <MapBuildingItem
            key={b.id}
            b={b}
            active={isActive}
            onOpen={clickHandler}
            showLabels={showLabels}
            lang={lang}
          />
        )
      })}

      {/* LIVE AVATAR DOT & DIRECTION INDICATOR */}
      {avatarPosition && (
        <g
          transform={`translate(${avatarPosition[0]}, ${avatarPosition[1]})`}
          className="pointer-events-none"
        >
          {/* Pulsing radar circle */}
          <circle r={1.6} fill={avatarColor} opacity={0.35} className="animate-ping origin-center" />
          {/* White border circle */}
          <circle r={0.9} fill="#FFFFFF" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
          {/* Avatar color center */}
          <circle r={0.65} fill={avatarColor} />
          {/* Heading pointer triangle */}
          <polygon
            points="0,-1.4 0.45,-0.4 -0.45,-0.4"
            fill="#FFFFFF"
            transform={`rotate(${(avatarRotation * 180) / Math.PI})`}
          />
        </g>
      )}
    </svg>
  )
}

function MapBuildingItem({
  b,
  active,
  onOpen,
  showLabels,
  lang,
}: {
  b: Building
  active: boolean
  onOpen?: (e: MouseEvent) => void
  showLabels: boolean
  lang: 'th' | 'en'
}) {
  const [x, z] = b.position
  const clickable = Boolean(onOpen)

  const body =
    b.shape === 'arena' ? (
      <circle cx={x} cy={z} r={2.8} fill={b.color} />
    ) : (
      <rect
        x={x - FOOTPRINT[b.shape][0] / 2}
        y={z - FOOTPRINT[b.shape][1] / 2}
        width={FOOTPRINT[b.shape][0]}
        height={FOOTPRINT[b.shape][1]}
        rx={0.5}
        fill={b.color}
      />
    )

  return (
    <g
      opacity={active ? 1 : 0.45}
      onClick={onOpen}
      className={clickable ? 'cursor-pointer hover:opacity-100 transition-opacity' : undefined}
      role={clickable ? 'button' : undefined}
      aria-label={b.name[lang]}
    >
      {active && (
        <circle cx={x} cy={z} r={2.9} fill="none" stroke="#FFFFFF" strokeWidth={0.2} className="animate-pulse" />
      )}
      {body}
      <text x={x} y={z + 0.35} fontSize={1.3} textAnchor="middle">
        {b.emoji}
      </text>
      {showLabels && (
        <text
          x={x}
          y={z + (b.shape === 'gate' ? 1.9 : b.shape === 'arena' ? 3.9 : FOOTPRINT[b.shape][1] / 2 + 1.2)}
          fontSize={0.9}
          fontWeight={700}
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#1A1C2C"
          strokeWidth={0.28}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {b.name[lang]}
        </text>
      )}
    </g>
  )
}
