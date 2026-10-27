import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useApp, type AvatarHat } from '@/context/AppContext'
import { CAMPUS_PALETTE } from '@/data/buildings'
import Avatar3D from '@/pages/campus/components/Avatar3D'
import { AVATAR_COLORS, AVATAR_HATS } from '@/pages/campus/avatarOptions'
import { cn } from '@/lib/utils'

/** Pick colour + hat + nickname with a spinning 3D preview, then enter the campus. */
export default function CharacterCreate() {
  const { currentStudent, avatar, setAvatar, lang } = useApp()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(avatar?.nickname ?? currentStudent.nickname)
  const [color, setColor] = useState(avatar?.color ?? AVATAR_COLORS[0])
  const [hat, setHat] = useState<AvatarHat>(avatar?.hat ?? 'grad')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAvatar({ color, hat, nickname: nickname.trim() || currentStudent.nickname })
    // Return directly into 3D campus without re-triggering arrival flyover
    navigate('/campus')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 font-campus text-white relative"
      style={{ backgroundColor: CAMPUS_PALETTE.sky }}
    >
      {/* Quick Back to Campus button */}
      <button
        type="button"
        onClick={() => navigate('/campus')}
        className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-black/60 transition-all cursor-pointer shadow-lg"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{lang === 'th' ? 'กลับสู่แคมปัส 3D' : 'Back to 3D Campus'}</span>
      </button>

      <form onSubmit={submit} className="w-full max-w-sm space-y-5 text-center mt-6">
        <div>
          <h1 className="text-3xl font-bold">{lang === 'th' ? 'สร้างตัวละครของคุณ' : 'Customize Your Avatar'}</h1>
          <p className="mt-1 text-sm text-white/70">
            {lang === 'th' ? 'ปรับแต่งสี หมวก และฉายาในเกม' : 'Pick colours, hats, and your campus handle'}
          </p>
        </div>

        <div className="mx-auto h-64 w-full overflow-hidden rounded-3xl bg-white/5">
          <Canvas flat camera={{ position: [0, 1.4, 3.4], fov: 40 }} dpr={[1, 2]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 5, 4]} intensity={1.4} color="#FFE8C7" />
            <group position={[0, -0.75, 0]}>
              <Avatar3D color={color} hat={hat} />
              <ContactShadows opacity={0.4} scale={4} blur={2.5} far={2} />
            </group>
            <OrbitControls
              target={[0, 0.1, 0]}
              autoRotate
              autoRotateSpeed={2.5}
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </div>

        <fieldset>
          <legend className="mb-2 text-left text-sm font-semibold">สี · Colour</legend>
          <div className="flex justify-between">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={c === color}
                onClick={() => setColor(c)}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-transform',
                  c === color ? 'scale-110 border-white' : 'border-transparent',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-left text-sm font-semibold">หมวก · Hat</legend>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_HATS.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-pressed={h.id === hat}
                onClick={() => setHat(h.id)}
                className={cn(
                  'rounded-xl border py-2 text-xs font-semibold transition-colors',
                  h.id === hat ? 'border-white bg-white/20' : 'border-white/20 bg-white/5 hover:bg-white/10',
                )}
              >
                {h.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="nickname" className="mb-2 block text-left text-sm font-semibold">
            ชื่อเล่น · Nickname
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-white outline-none focus:border-white"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3 font-bold text-ink shadow-sm transition-transform active:scale-[0.98]"
          style={{ backgroundColor: CAMPUS_PALETTE.path }}
        >
          เข้าแคมปัส · Enter campus →
        </button>
      </form>
    </div>
  )
}
