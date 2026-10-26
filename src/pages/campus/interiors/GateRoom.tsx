import { useNavigate } from 'react-router-dom'
import { LogOut, Shirt } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Section from './Section'

/** Gate: who you are on campus — change character or sign out. */
export default function GateRoom() {
  const { avatar, currentStudent, studentXP, signOut } = useApp()
  const navigate = useNavigate()
  const nickname = avatar?.nickname ?? currentStudent.nickname

  return (
    <Section title="ยินดีต้อนรับสู่ ClassLoop Campus" sub="Welcome — this is your campus pass">
      <div className="flex items-center gap-4 rounded-2xl bg-canvas p-4">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ backgroundColor: avatar?.color ?? '#E89BC4' }}
        >
          🧑‍🎓
        </span>
        <div>
          <p className="font-bold text-ink">{nickname}</p>
          <p className="text-sm text-grey-600">
            {currentStudent.name} · {currentStudent.faculty}
          </p>
          <p className="text-xs font-semibold text-pink-600">{studentXP} XP</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/create')}
          className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-sm font-bold text-paper hover:bg-pink-500"
        >
          <Shirt className="h-4 w-4" /> เปลี่ยนตัวละคร
        </button>
        <button
          onClick={() => {
            signOut()
            navigate('/login')
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-grey-300/80 py-3 text-sm font-bold text-ink hover:bg-canvas"
        >
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </button>
      </div>
    </Section>
  )
}
