import { useCallback, useEffect, useRef, useState, type TouchEvent, type MouseEvent } from 'react'
import { GameIcon } from '@/components/icons/GameIcon'

type TouchJoystickProps = {
  onMove: (vector: [dx: number, dz: number]) => void
  onEnd: () => void
}

const RADIUS = 40 // Maximum knob travel radius (px)

export default function TouchJoystick({ onMove, onEnd }: TouchJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const touchId = useRef<number | null>(null)

  const handlePointerStart = (clientX: number, clientY: number) => {
    isDragging.current = true
    handlePointerMove(clientX, clientY)
  }

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rawDx = clientX - centerX
      const rawDy = clientY - centerY
      const dist = Math.hypot(rawDx, rawDy)
      const clampedDist = Math.min(dist, RADIUS)
      const angle = Math.atan2(rawDy, rawDx)

      const kx = Math.cos(angle) * clampedDist
      const ky = Math.sin(angle) * clampedDist

      setKnobPos({ x: kx, y: ky })

      // Normalize between -1 and 1
      const nx = kx / RADIUS
      // In 3D: Screen Up (negative Y) corresponds to World Forward (negative Z)
      const nz = ky / RADIUS
      onMove([nx, nz])
    },
    [onMove],
  )

  const handlePointerEnd = useCallback(() => {
    isDragging.current = false
    touchId.current = null
    setKnobPos({ x: 0, y: 0 })
    onEnd()
  }, [onEnd])

  // Global touch/mouse up listeners
  useEffect(() => {
    const onWindowMove = (e: globalThis.MouseEvent) => {
      if (isDragging.current) handlePointerMove(e.clientX, e.clientY)
    }
    const onWindowUp = () => {
      if (isDragging.current) handlePointerEnd()
    }
    window.addEventListener('mousemove', onWindowMove)
    window.addEventListener('mouseup', onWindowUp)
    return () => {
      window.removeEventListener('mousemove', onWindowMove)
      window.removeEventListener('mouseup', onWindowUp)
    }
  }, [handlePointerMove, handlePointerEnd])

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const t = e.changedTouches[0]
    touchId.current = t.identifier
    handlePointerStart(t.clientX, t.clientY)
  }

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]
      if (t.identifier === touchId.current) {
        handlePointerMove(t.clientX, t.clientY)
        break
      }
    }
  }

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    handlePointerStart(e.clientX, e.clientY)
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handlePointerEnd}
      onTouchCancel={handlePointerEnd}
      onMouseDown={onMouseDown}
      className="fixed bottom-6 left-6 z-30 flex h-24 w-24 select-none items-center justify-center rounded-full border-2 border-white/25 bg-black/40 backdrop-blur-md shadow-2xl cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Direction Cross Guides */}
      <span className="pointer-events-none absolute top-1.5 text-[9px] font-bold text-white/40">▲</span>
      <span className="pointer-events-none absolute bottom-1.5 text-[9px] font-bold text-white/40">▼</span>
      <GameIcon name="chevronLeft" className="pointer-events-none absolute left-1 text-[11px] text-white/40" />
      <GameIcon name="chevronRight" className="pointer-events-none absolute right-1 text-[11px] text-white/40" />

      {/* Thumb Knob */}
      <div
        className="pointer-events-none h-11 w-11 rounded-full bg-white/90 shadow-lg border border-white/50 transition-transform duration-75"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
        }}
      />
    </div>
  )
}
