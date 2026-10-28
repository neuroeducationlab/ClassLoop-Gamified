import type { AvatarHat, AvatarOutfit, AvatarAura } from '@/context/AppContext'

interface Avatar3DSvgProps {
  color?: string
  hat?: AvatarHat
  outfit?: AvatarOutfit
  aura?: AvatarAura
  size?: number | string
  className?: string
}

/**
 * High-fidelity 2D vector representation of the 3D Avatar (capsule robot)
 * Perfectly matches Avatar3D geometry, colors, hats, outfits, and auras.
 * Used in profile pictures, leaderboards, and UI badges.
 */
export default function Avatar3DSvg({
  color = '#E89BC4',
  hat = 'grad',
  outfit = 'default',
  aura = 'none',
  size = 40,
  className = '',
}: Avatar3DSvgProps) {
  // Unique ID prefix to avoid SVG filter/gradient conflicts across multiple instances
  const id = `av3d-${color.replace('#', '')}-${hat}-${outfit}-${aura}`

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Background Radial Glow */}
        <radialGradient id={`${id}-bg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A2D4A" />
          <stop offset="100%" stopColor="#141624" />
        </radialGradient>

        {/* Head 3D Skin Gradient */}
        <radialGradient id={`${id}-skin`} cx="42%" cy="36%" r="55%">
          <stop offset="0%" stopColor="#FFE8D6" />
          <stop offset="60%" stopColor="#F5D3B3" />
          <stop offset="100%" stopColor="#DEB192" />
        </radialGradient>

        {/* Body 3D Base Color Gradient */}
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="35%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>

        {/* Suit Dark Blazer Gradient */}
        <linearGradient id={`${id}-suit`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E344D" />
          <stop offset="70%" stopColor="#1E2235" />
          <stop offset="100%" stopColor="#11131E" />
        </linearGradient>

        {/* Hoodie Blue Gradient */}
        <linearGradient id={`${id}-hoodie`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="65%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Labcoat White Gradient */}
        <linearGradient id={`${id}-labcoat`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Golden Crown Gradient */}
        <linearGradient id={`${id}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Dark Mortarboard Gradient */}
        <linearGradient id={`${id}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3E426D" />
          <stop offset="60%" stopColor="#2B2D55" />
          <stop offset="100%" stopColor="#1A1C36" />
        </linearGradient>

        {/* Aura Blur Filter */}
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Background Circle ── */}
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-bg)`} />

      {/* ── Aura Layer (Behind Character) ── */}
      {aura === 'neon' && (
        <g filter={`url(#${id}-glow)`}>
          <ellipse
            cx="50"
            cy="52"
            rx="42"
            ry="40"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            opacity="0.85"
          />
          <ellipse
            cx="50"
            cy="52"
            rx="36"
            ry="34"
            fill="none"
            stroke="#F472B6"
            strokeWidth="2.5"
            opacity="0.75"
          />
        </g>
      )}

      {aura === 'gold' && (
        <g filter={`url(#${id}-glow)`}>
          <circle cx="50" cy="45" r="34" fill="none" stroke="#F59E0B" strokeWidth="4" opacity="0.8" />
          <circle cx="50" cy="45" r="38" fill="none" stroke="#FBBF24" strokeWidth="1.5" opacity="0.5" />
        </g>
      )}

      {aura === 'stars' && (
        <g fill="#FDE047" filter={`url(#${id}-glow)`}>
          {/* 4 Twinkling Orbiting Stars */}
          <path d="M 16 26 Q 16 32 10 32 Q 16 32 16 38 Q 16 32 22 32 Q 16 32 16 26 Z" />
          <path d="M 84 22 Q 84 27 79 27 Q 84 27 84 32 Q 84 27 89 27 Q 84 27 84 22 Z" />
          <path d="M 18 68 Q 18 73 13 73 Q 18 73 18 78 Q 18 73 23 73 Q 18 73 18 68 Z" />
          <path d="M 82 66 Q 82 72 76 72 Q 82 72 82 78 Q 82 72 88 72 Q 82 72 82 66 Z" />
        </g>
      )}

      {/* ── Body / Outfit Layer ── */}
      <g id="body-group">
        {outfit === 'suit' ? (
          <>
            {/* Suit Blazer Body */}
            <path
              d="M 22 62 C 22 55, 30 54, 50 54 C 70 54, 78 55, 78 62 L 80 98 C 80 100, 20 100, 20 98 Z"
              fill={`url(#${id}-suit)`}
            />
            {/* White Dress Shirt V-Neck */}
            <polygon points="41,54 59,54 50,76" fill="#FFFFFF" />
            {/* SPU Pink Necktie */}
            <polygon points="48,58 52,58 53,78 50,86 47,78" fill="#E89BC4" />
            <polygon points="47,56 53,56 52,60 48,60" fill="#DB7093" />
            {/* Blazer Lapel Lines */}
            <path d="M 36 54 L 43 72 L 50 82" stroke="#141724" strokeWidth="1.5" fill="none" />
            <path d="M 64 54 L 57 72 L 50 82" stroke="#141724" strokeWidth="1.5" fill="none" />
          </>
        ) : outfit === 'hoodie' ? (
          <>
            {/* Street Hoodie Body */}
            <path
              d="M 22 62 C 22 55, 30 54, 50 54 C 70 54, 78 55, 78 62 L 80 98 C 80 100, 20 100, 20 98 Z"
              fill={`url(#${id}-hoodie)`}
            />
            {/* Hoodie Collar Ring */}
            <ellipse cx="50" cy="56" rx="16" ry="6" fill="#2563EB" />
            {/* Drawstring Strings */}
            <line x1="46" y1="58" x2="45" y2="72" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="54" y1="58" x2="55" y2="72" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Kangaroo Pocket */}
            <path
              d="M 34 80 L 66 80 L 63 94 L 37 94 Z"
              fill="#1D4ED8"
              stroke="#2563EB"
              strokeWidth="1"
            />
          </>
        ) : outfit === 'labcoat' ? (
          <>
            {/* White Lab Coat */}
            <path
              d="M 22 62 C 22 55, 30 54, 50 54 C 70 54, 78 55, 78 62 L 80 98 C 80 100, 20 100, 20 98 Z"
              fill={`url(#${id}-labcoat)`}
            />
            {/* Inner Cyan Shirt */}
            <polygon points="42,54 58,54 50,72" fill="#06B6D4" />
            {/* Coat Lapel Overlap */}
            <path d="M 40 54 L 46 72 L 46 98" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
            <path d="M 60 54 L 54 72 L 54 98" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
            {/* ID Pocket Badge */}
            <rect x="27" y="72" width="10" height="12" rx="2" fill="#0284C7" />
            <rect x="29" y="74" width="6" height="4" rx="1" fill="#FFFFFF" opacity="0.8" />
          </>
        ) : (
          /* Default Casual Avatar Body (Solid / Gradient) */
          <>
            <path
              d="M 22 62 C 22 55, 30 54, 50 54 C 70 54, 78 55, 78 62 L 80 98 C 80 100, 20 100, 20 98 Z"
              fill={color}
            />
            <path
              d="M 22 62 C 22 55, 30 54, 50 54 C 70 54, 78 55, 78 62 L 80 98 C 80 100, 20 100, 20 98 Z"
              fill={`url(#${id}-body)`}
            />
            {/* Subtle Collar Line */}
            <path
              d="M 38 55 Q 50 62 62 55"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </g>

      {/* ── Head Sphere ── */}
      <circle cx="50" cy="38" r="21" fill={`url(#${id}-skin)`} />

      {/* ── Cute Eyes ── */}
      {/* Left Eye */}
      <circle cx="43" cy="39" r="3.2" fill="#2B2D55" />
      <circle cx="41.8" cy="37.8" r="1.1" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="57" cy="39" r="3.2" fill="#2B2D55" />
      <circle cx="55.8" cy="37.8" r="1.1" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <ellipse cx="37" cy="43.5" rx="3.5" ry="2" fill="#F472B6" opacity="0.4" />
      <ellipse cx="63" cy="43.5" rx="3.5" ry="2" fill="#F472B6" opacity="0.4" />

      {/* ── Hat / Headgear Layer ── */}
      {hat === 'grad' && (
        <g id="hat-grad">
          {/* Mortarboard Skull Base */}
          <path d="M 34 22 C 34 18, 66 18, 66 22 L 64 29 C 55 33, 45 33, 36 29 Z" fill="#20223E" />
          {/* Mortarboard Diamond Top */}
          <polygon points="50,9 82,19 50,29 18,19" fill={`url(#${id}-dark)`} />
          <polygon points="50,9 82,19 50,19" fill="#3E426D" opacity="0.6" />
          {/* Center Button */}
          <circle cx="50" cy="19" r="2.8" fill="#F2C879" />
          {/* Gold Tassel Cord & Brush */}
          <path
            d="M 50 19 Q 73 21 74 32"
            stroke="#F2C879"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <polygon points="71,32 77,32 75,43 73,43" fill="#F2C879" />
        </g>
      )}

      {hat === 'dj_headset' && (
        <g id="hat-dj">
          {/* Dark Headband */}
          <path
            d="M 22 41 C 22 14, 78 14, 78 41"
            stroke="#0F172A"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left Cushion */}
          <rect
            x="19"
            y="31"
            width="8"
            height="18"
            rx="4"
            fill="#06B6D4"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <rect x="21" y="34" width="3" height="12" rx="1.5" fill="#A5F3FC" />
          {/* Right Cushion */}
          <rect
            x="73"
            y="31"
            width="8"
            height="18"
            rx="4"
            fill="#06B6D4"
            stroke="#0F172A"
            strokeWidth="2"
          />
          <rect x="76" y="34" width="3" height="12" rx="1.5" fill="#A5F3FC" />
        </g>
      )}

      {hat === 'cyber_cat' && (
        <g id="hat-cat">
          {/* Headband */}
          <path
            d="M 26 31 C 28 18, 72 18, 74 31"
            stroke="#1E293B"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Left Ear */}
          <polygon
            points="26,29 35,9 46,24"
            fill="#EC4899"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <polygon points="30,26 35,14 41,23" fill="#FCE7F3" />
          {/* Right Ear */}
          <polygon
            points="54,24 65,9 74,29"
            fill="#EC4899"
            stroke="#BE185D"
            strokeWidth="1.5"
          />
          <polygon points="59,23 65,14 70,26" fill="#FCE7F3" />
        </g>
      )}

      {hat === 'crown' && (
        <g id="hat-crown">
          {/* Golden Crown Base & Peaks */}
          <path
            d="M 30 25 Q 50 28 70 25 L 74 15 L 62 20 L 50 10 L 38 20 L 26 15 Z"
            fill={`url(#${id}-gold)`}
            stroke="#B45309"
            strokeWidth="1.5"
          />
          {/* Ruby Jewels */}
          <circle cx="26" cy="15" r="2.2" fill="#EF4444" />
          <circle cx="50" cy="10" r="2.6" fill="#EF4444" />
          <circle cx="74" cy="15" r="2.2" fill="#EF4444" />
        </g>
      )}

      {hat === 'beanie' && (
        <g id="hat-beanie">
          {/* Knitted Beanie Dome */}
          <path
            d="M 28 32 C 28 14, 72 14, 72 32 Q 50 36 28 32 Z"
            fill={color}
            stroke="#00000033"
            strokeWidth="1"
          />
          {/* Cuff Brim */}
          <path
            d="M 27 29 Q 50 33 73 29 L 73 35 Q 50 39 27 35 Z"
            fill={color}
            opacity="0.85"
          />
          {/* Fluffy White Pom-Pom */}
          <circle cx="50" cy="14" r="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        </g>
      )}

      {hat === 'cap' && (
        <g id="hat-cap">
          {/* Cap Dome */}
          <path
            d="M 28 32 C 28 17, 72 17, 72 32 Z"
            fill={color}
            stroke="#00000022"
            strokeWidth="1"
          />
          {/* Front Visor Bill */}
          <path
            d="M 25 33 Q 50 40 76 34 Q 50 35 25 33 Z"
            fill={color}
            opacity="0.85"
          />
          <path
            d="M 28 34 Q 50 38 72 35 Q 50 36 28 34 Z"
            fill="#1E293B"
            opacity="0.3"
          />
          {/* Center Button */}
          <circle cx="50" cy="18" r="2" fill="#FFFFFF" opacity="0.7" />
        </g>
      )}

      {/* None hat: clean skin dome */}
    </svg>
  )
}
