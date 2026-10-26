import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CAMPUS_PALETTE } from '@/data/buildings'

/**
 * Phase 1 placeholder: nickname only, then into the campus.
 * Phase 2 adds colour + hat pickers, a spinning 3D preview, and saves the
 * character to AppContext.
 */
export default function CharacterCreate() {
  const { currentStudent } = useApp()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(currentStudent.nickname)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate('/campus')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-6 text-white"
      style={{ backgroundColor: CAMPUS_PALETTE.sky }}
    >
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 text-center">
        <h1 className="text-3xl font-bold">สร้างตัวละครของคุณ</h1>
        <p className="text-sm text-white/70">Create your character</p>

        {/* stand-in for the Phase 2 3D preview */}
        <div
          className="mx-auto flex h-40 w-40 items-center justify-center rounded-full text-6xl shadow-lg"
          style={{ backgroundColor: CAMPUS_PALETTE.spuPink }}
          aria-hidden
        >
          🧑‍🎓
        </div>

        <label htmlFor="nickname" className="block text-left text-sm font-semibold">
          ชื่อเล่น · Nickname
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-white outline-none focus:border-white"
        />

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
