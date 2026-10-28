import { useEffect, useState, useRef } from 'react'

/**
  * Soft, organic cloud transition component:
  * - Covers screen gently with fluffy daylight/morning clouds ("มีเมฆบัง")
  * - Smoothly parts away horizontally to reveal the destination page ("เปิดออกแบบซอฟและสมูท")
  */
export default function CloudTransition({
  active,
  onCoverComplete,
  onTransitionEnd,
}: {
  active: boolean
  onCoverComplete?: () => void
  onTransitionEnd?: () => void
}) {
  const [stage, setStage] = useState<'idle' | 'covering' | 'parting'>('idle')
  const onCoverCompleteRef = useRef(onCoverComplete)
  onCoverCompleteRef.current = onCoverComplete
  const onTransitionEndRef = useRef(onTransitionEnd)
  onTransitionEndRef.current = onTransitionEnd

  useEffect(() => {
    if (!active) {
      setStage((prev) => {
        if (prev !== 'idle') return 'parting'
        return prev
      })
      const timer = setTimeout(() => {
        setStage('idle')
        onTransitionEndRef.current?.()
      }, 550)
      return () => clearTimeout(timer)
    }

    setStage('covering')
    const timer = setTimeout(() => {
      onCoverCompleteRef.current?.()
    }, 420)

    return () => clearTimeout(timer)
  }, [active])

  if (stage === 'idle') return null

  const isCovering = stage === 'covering'

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* Background Soft Sky Mist Overlay with gentle blur */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-sky-100/90 via-white/95 to-pink-50/90 backdrop-blur-2xl transition-opacity duration-500 ${
          isCovering ? 'animate-cloud-mist-in' : 'animate-cloud-mist-out'
        }`}
      />

      {/* Gentle Morning Sun Ray Glow in Center */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          isCovering ? 'opacity-80' : 'opacity-0'
        }`}
      >
        <div className="h-[36rem] w-[36rem] rounded-full bg-gradient-to-r from-amber-200/40 via-pink-200/30 to-sky-200/40 blur-3xl" />
      </div>

      {/* Left Cloud Bank — Puffy billowy clouds flowing from left */}
      <div
        className={`absolute inset-y-0 left-0 w-[62vw] flex items-center justify-start ${
          isCovering ? 'animate-cloud-cover-left' : 'animate-cloud-part-left'
        }`}
      >
        <svg
          viewBox="0 0 800 1000"
          className="h-full w-full object-cover filter drop-shadow-[0_15px_30px_rgba(186,230,253,0.35)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cloudGradLeft1" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#F0F9FF" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="cloudGradLeft2" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.99" />
              <stop offset="50%" stopColor="#FFF7ED" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Back puff */}
          <path
            d="M-50,0 Q180,80 320,180 T480,450 Q560,650 380,820 T-50,1050 Z"
            fill="url(#cloudGradLeft1)"
            opacity="0.9"
          />
          {/* Main billowing cloud front */}
          <path
            d="M-50,-20 Q280,40 420,200 T580,500 Q620,720 440,880 T-50,1020 Z"
            fill="url(#cloudGradLeft2)"
          />
        </svg>
      </div>

      {/* Right Cloud Bank — Puffy billowy clouds flowing from right */}
      <div
        className={`absolute inset-y-0 right-0 w-[62vw] flex items-center justify-end ${
          isCovering ? 'animate-cloud-cover-right' : 'animate-cloud-part-right'
        }`}
      >
        <svg
          viewBox="0 0 800 1000"
          className="h-full w-full object-cover filter drop-shadow-[0_15px_30px_rgba(251,207,232,0.35)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cloudGradRight1" x1="100%" y1="0%" x2="0%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#FDF2F8" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#FCE7F3" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="cloudGradRight2" x1="90%" y1="10%" x2="10%" y2="90%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.99" />
              <stop offset="50%" stopColor="#F0F9FF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {/* Back puff */}
          <path
            d="M850,0 Q620,80 480,220 T320,520 Q240,720 420,850 T850,1050 Z"
            fill="url(#cloudGradRight1)"
            opacity="0.9"
          />
          {/* Main billowing cloud front */}
          <path
            d="M850,-20 Q520,60 380,240 T220,540 Q180,750 360,890 T850,1020 Z"
            fill="url(#cloudGradRight2)"
          />
        </svg>
      </div>

      {/* Floating Cloud Tufts Drift in Center */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
          isCovering ? 'scale-100 opacity-90' : 'scale-125 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sky-600/80 font-bold text-xs tracking-widest uppercase font-mono">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            <span>ClassLoop Space Gateway</span>
          </div>
          <p className="text-sm font-semibold text-grey-700/80">
            กำลังเปิดประตูบทเรียน...
          </p>
        </div>
      </div>
    </div>
  )
}
