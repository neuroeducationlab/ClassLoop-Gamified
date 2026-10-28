import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { AlertCircle, BookOpen, GraduationCap, Loader2, Lock, Mail, Sparkles } from 'lucide-react'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'
import { BrandMark } from '@/components/brand/BrandMark'
import { DEMO_ACCOUNTS, useApp } from '@/context/AppContext'
import { BUILDINGS, PLAZA_CENTER } from '@/data/buildings'
import Building from '@/pages/campus/components/Building'
import ContextBuildings from '@/pages/campus/components/ContextBuildings'
import Ground from '@/pages/campus/components/Ground'
import { isLowPower } from '@/pages/campus/lowPower'
import { SPUUniverseEnvironment, SKY_PRESETS, type TimeOfDay } from '@/pages/campus/components/SPUUniverse'
import { cn } from '@/lib/utils'

const GATE = BUILDINGS.find((b) => b.id === 'entry') ?? BUILDINGS[0]
const DIVE_DURATION_SECONDS = 2.0
const noop = () => {}

const SPU_IMAGE_MAP: Record<TimeOfDay, string> = {
  morning: '/spu/morning.jpg',
  midday: '/spu/midday.jpg',
  evening: '/spu/sunset.jpg',
  night: '/spu/night.jpg',
}

/**
 * 4DX Bird's-Eye Camera Rig:
 * - Orbiting high in the sky over SPU campus with a majestic wide view.
 * - On `diving`, accelerates and swoops down with dynamic FOV & banking roll like a 4DX flight ride.
 */
function BirdEyeCameraRig({ isDiving, onLanded }: { isDiving: boolean; onLanded: () => void }) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(0, 1.8, -0.5), [])
  const dive = useRef<{ t: number; fromPos: Vector3; fromTarget: Vector3 } | null>(null)
  const landed = useRef(false)
  const gatePos = useMemo(() => new Vector3(GATE.position[0] + 4, 2.5, GATE.position[1] + 5), [])
  const gateLook = useMemo(() => new Vector3(GATE.position[0], 1.6, GATE.position[1]), [])
  const currentLook = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    if (isDiving) {
      if (!dive.current) {
        dive.current = {
          t: 0,
          fromPos: camera.position.clone(),
          fromTarget: target.clone(),
        }
      }
      const d = dive.current
      d.t = Math.min(1, d.t + dt / DIVE_DURATION_SECONDS)

      // 4DX S-curve ease for thrilling swoop sensation
      const t = d.t
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

      // Swoop position down towards SPU Plaza / MRT Exit 2
      camera.position.lerpVectors(d.fromPos, gatePos, ease)

      // 4DX Dynamic banking roll (tilt left then right like a glider)
      camera.rotation.z = Math.sin(ease * Math.PI) * 0.07

      // Dynamic FOV rush effect
      if ('fov' in camera && typeof camera.fov === 'number') {
        camera.fov = MathUtils.lerp(42, 60, Math.sin(ease * Math.PI))
        camera.updateProjectionMatrix()
      }

      currentLook.lerpVectors(d.fromTarget, gateLook, ease)
      camera.lookAt(currentLook)

      if (d.t >= 1 && !landed.current) {
        landed.current = true
        camera.rotation.z = 0
        onLanded()
      }
      return
    }

    // High 3D Game Camera: Dynamic cinematic sweeping arc around SPU campus
    const time = state.clock.elapsedTime
    // Sweep gracefully through the iconic diagonal blueprint angle with rich parallax
    const sweepAngle = -0.72 + Math.sin(time * 0.12) * 0.38
    const radius = 36.0 + Math.cos(time * 0.15) * 4.0
    const altitude = 25.0 + Math.sin(time * 0.18) * 3.5

    const camX = Math.sin(sweepAngle) * radius
    const camZ = Math.cos(sweepAngle) * radius
    const camY = altitude

    camera.position.set(camX, camY, camZ)
    camera.lookAt(target)
  })

  return null
}

export default function Login() {
  const { signIn, lang } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'none' | 'teacher' | 'student'>('none')
  const [isDiving, setIsDiving] = useState(false)
  const [lowPower] = useState(isLowPower)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [viewMode, setViewMode] = useState<'3d' | 'cinematic'>('3d')
  const targetDestination = useRef<string>('/campus')

  const cycleTimeOfDay = () => {
    setTimeOfDay((prev) => {
      if (prev === 'morning') return 'midday'
      if (prev === 'midday') return 'evening'
      if (prev === 'evening') return 'night'
      return 'morning'
    })
  }

  const handleLanded = useCallback(() => {
    navigate(targetDestination.current)
  }, [navigate])

  // Handle 4DX swoop landing completion for cinematic image mode
  useEffect(() => {
    if (isDiving && viewMode === 'cinematic') {
      const timer = setTimeout(() => {
        handleLanded()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isDiving, viewMode, handleLanded])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (loading || isDiving) return

    if (!email.trim() || !password) {
      setError(lang === 'th' ? 'กรุณากรอกอีเมลและรหัสผ่าน' : 'Please enter email and password')
      return
    }

    const result = signIn(email, password)
    if (!result.ok) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      return
    }

    setError(null)
    setLoading(true)

    // Set destination: Teacher goes to /campus (with their new zero-confusion Quick Access panel!),
    // Students also land in /campus
    targetDestination.current = '/campus'

    // Trigger the 4DX swoop down animation!
    setIsDiving(true)
  }

  const fill = (accEmail: string, accPassword: string) => {
    setEmail(accEmail)
    setPassword(accPassword)
    setError(null)
  }

  return (
    <div
      className="relative min-h-screen w-full select-none overflow-hidden font-campus transition-all duration-1000"
      style={{
        background: `linear-gradient(to bottom, ${SKY_PRESETS[timeOfDay].skyGradient.join(', ')})`,
      }}
    >
      {/* ── Background: Cinematic High-Fidelity Artwork OR 3D Canvas ── */}
      {viewMode === 'cinematic' ? (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={SPU_IMAGE_MAP[timeOfDay]}
            alt="SPU Campus Universe"
            className={cn(
              'h-full w-full object-cover object-center transition-all duration-[2000ms] ease-out will-change-transform select-none pointer-events-none',
              isDiving ? 'scale-[2.4] translate-x-[-6%] translate-y-[10%] blur-[1.5px]' : 'scale-105'
            )}
            style={{
              filter: isDiving ? 'brightness(1.15)' : 'brightness(1.0)',
            }}
          />

          {/* Atmospheric lighting layers */}
          {timeOfDay === 'night' && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-black/30" />
          )}
          {timeOfDay === 'evening' && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-orange-950/30 via-transparent to-purple-950/20" />
          )}
        </div>
      ) : (
        <div className="absolute inset-0">
          <Canvas
            shadows="percentage"
            dpr={lowPower ? [1, 1.25] : [1, 2]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ fov: 42, position: [PLAZA_CENTER[0], 35, PLAZA_CENTER[1] + 42] }}
          >
            <SPUUniverseEnvironment timeOfDay={timeOfDay} isArriving={isDiving} />

            <Environment resolution={lowPower ? 64 : 128}>
              <Lightformer form="rect" intensity={3.0} color="#FFA84D" position={[25, 12, 22]} scale={[28, 14, 1]} target={[0, 0, 0]} />
              <Lightformer form="rect" intensity={1.2} color="#6B95D1" position={[-25, 18, -22]} scale={[32, 16, 1]} />
            </Environment>

            <Ground onWalk={noop} />
            <ContextBuildings />
            {BUILDINGS.map((b) => (
              <Building key={b.id} building={b} hovered={false} onHover={noop} onSelect={noop} />
            ))}

            <BirdEyeCameraRig isDiving={isDiving} onLanded={handleLanded} />
          </Canvas>
        </div>
      )}

      {/* ── Soft vignette gradient overlay for contrast ── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/35" />

      {/* ── 4DX Landing HUD (Visible when diving) ── */}
      {isDiving && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-end pb-20 gap-3 text-center animate-in fade-in duration-500">
          <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-5 py-2 text-white backdrop-blur-md shadow-2xl">
            <span className="animate-spin text-lg">⚡</span>
            <span className="text-sm font-bold tracking-wide">4DX CAMPUS LANDING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {lang === 'th'
              ? 'กำลังนำท่านลงสู่แคมปัส มหาวิทยาลัยศรีปทุม (SPU)…'
              : 'Landing at Sripatum University (SPU) Campus…'}
          </h2>
          <p className="text-sm text-white/80 drop-shadow">
            {lang === 'th'
              ? 'Swooping into MRT Exit 2 & Campus Plaza · เดินทางถึงในไม่กี่วินาที'
              : 'Swooping into MRT Exit 2 & Campus Plaza · Arriving in seconds'}
          </p>
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-pink-500 to-amber-300 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* ── Login Glassmorphism Card (Fades out when diving) ── */}
      <div
        className={cn(
          'relative z-20 flex min-h-screen flex-col items-center justify-center p-4 transition-all duration-700 ease-out',
          isDiving ? 'pointer-events-none scale-90 opacity-0 -translate-y-8' : 'scale-100 opacity-100',
        )}
      >
        <div className="w-full max-w-md rounded-3xl border border-white/25 bg-black/45 p-7 text-white shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Top Header & Mode / Time / Language switch */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-600 font-extrabold text-xs text-white shadow">
                SPU
              </span>
              <span className="text-xs font-semibold tracking-wider text-white/80">
                CLASSLOOP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'cinematic' ? '3d' : 'cinematic'))}
                className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white/90 backdrop-blur hover:bg-white/20 transition-colors shadow-xs cursor-pointer"
                title="Switch between Cinematic Artwork and 3D Real-time"
              >
                <span className="text-[11px] font-bold">{viewMode === 'cinematic' ? '🖼️ HD Art' : '🎮 3D'}</span>
              </button>
              <button
                type="button"
                onClick={cycleTimeOfDay}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur hover:bg-white/20 transition-colors shadow-xs cursor-pointer"
                title={`Time of day: ${SKY_PRESETS[timeOfDay].label.en} (${SKY_PRESETS[timeOfDay].label.th})`}
              >
                <span>{SKY_PRESETS[timeOfDay].icon}</span>
                <span className="text-[11px] font-bold">{SKY_PRESETS[timeOfDay].label[lang]}</span>
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Logo & Headline */}
          <div className="mb-6 text-center">
            <BrandMark className="mx-auto mb-2 h-12 w-24 drop-shadow-[0_0_12px_rgba(209,46,128,0.55)]" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
              ClassLoop <span className="text-[#F2C879]">Campus</span>
            </h1>
            <p className="mt-1 text-xs text-white/75">
              {lang === 'th'
                ? 'ระบบการเรียนรู้แบบ 3D แคมปัสเสมือนจริง มหาวิทยาลัยศรีปทุม'
                : '3D Immersive Gamified Campus · Sripatum University'}
            </p>
          </div>

          {selectedRole === 'none' ? (
            <div className="space-y-3.5 animate-fadeIn">
              <h2 className="text-center text-sm font-bold text-white/90 mb-4">
                {lang === 'th' ? 'เลือกสถานะเพื่อเข้าสู่แคมปัส' : 'Select Your Role to Enter Campus'}
              </h2>

              {/* Teacher option */}
              <button
                onClick={() => setSelectedRole('teacher')}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 transition-all hover:border-pink-400 hover:bg-pink-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/30 text-pink-300 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors">
                    {lang === 'th' ? 'อาจารย์ผู้สอน (Faculty)' : 'Faculty & Instructor'}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {lang === 'th'
                      ? 'เข้าห้องสตูดิโอ วิเคราะห์ Gap นิสิต และเมนูลัด 1-คลิก'
                      : 'Course studio, student gap analytics & 1-click quick jump'}
                  </p>
                </div>
              </button>

              {/* Student option */}
              <button
                onClick={() => setSelectedRole('student')}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 transition-all hover:border-blue-400 hover:bg-blue-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/30 text-blue-300 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">
                    {lang === 'th' ? 'นักศึกษา (Student)' : 'Student'}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    {lang === 'th'
                      ? 'เดินเข้าห้องเรียน ทำเควสต์ และเก็บ XP ทบทวนบทเรียน'
                      : 'Walk into classrooms, conquer quests, and level up with XP'}
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <button
                onClick={() => setSelectedRole('none')}
                className="mb-3 text-xs font-semibold text-white/70 hover:text-pink-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {lang === 'th'
                  ? `← เปลี่ยนสถานะ (${selectedRole === 'teacher' ? 'อาจารย์' : 'นักศึกษา'})`
                  : `← Change Role (${selectedRole === 'teacher' ? 'Faculty' : 'Student'})`}
              </button>

              <form onSubmit={submit} className="space-y-3.5">
                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-medium text-white/90">
                    {lang === 'th' ? 'อีเมลมหาวิทยาลัย' : 'University Email'}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError(null)
                      }}
                      placeholder="you@spu.ac.th"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-pink-400 focus:bg-white/15 focus:ring-2 focus:ring-pink-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1 block text-xs font-medium text-white/90">
                    {lang === 'th' ? 'รหัสผ่าน' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition-all focus:border-pink-400 focus:bg-white/15 focus:ring-2 focus:ring-pink-500/30"
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="flex items-center gap-1.5 rounded-lg bg-pink-900/60 border border-pink-500/40 px-3 py-2 text-xs font-medium text-pink-200"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-pink-400" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || isDiving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading
                    ? lang === 'th'
                      ? 'กำลังเชื่อมต่อ…'
                      : 'Connecting…'
                    : lang === 'th'
                    ? 'เข้าสู่ระบบ (4DX Landing)'
                    : 'Sign In (4DX Landing)'}
                </button>
              </form>

              {/* Demo Account quick fill chips */}
              <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-white/70">
                    {lang === 'th' ? 'คลิกเพื่อกรอกบัญชีเดโมทันที' : 'Click to autofill demo account'}
                  </p>
                  <Sparkles className="h-3 w-3 text-amber-300" />
                </div>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.filter((acc) => acc.role === selectedRole).map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fill(acc.email, acc.password)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left transition-all hover:bg-white/20 active:scale-[0.98] cursor-pointer"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-600/80 text-white text-xs">
                        {acc.role === 'teacher' ? <BookOpen className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-white leading-tight">
                          {acc.name} ({acc.role === 'teacher' ? (lang === 'th' ? 'อาจารย์' : 'Faculty') : (lang === 'th' ? 'นักศึกษา' : 'Student')})
                        </span>
                        <span className="block truncate font-mono text-[10px] text-white/60">
                          {acc.email} · {acc.password}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-pink-300">
                        {lang === 'th' ? 'ใช้บัญชีนี้ →' : 'Use this →'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small footer credit */}
        <p className="mt-4 text-center text-xs text-white/60 drop-shadow">
          {lang === 'th'
            ? 'มหาวิทยาลัยศรีปทุม (SPU) · พัฒนาเพื่อการเรียนรู้ไร้รอยต่อ'
            : 'Sripatum University (SPU) · Seamless Gamified Learning'}
        </p>
      </div>
    </div>
  )
}
