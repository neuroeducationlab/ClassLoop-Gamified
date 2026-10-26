import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CAMPUS_PALETTE } from '@/data/buildings'

/**
 * Phase 1 placeholder for the student 3D campus. Full-screen, outside
 * StudentShell — the campus replaces the tab bar as the student's home.
 * Phase 3 swaps the body for the R3F scene.
 */
export default function Campus3D() {
  const { currentStudent } = useApp()

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center text-white"
      style={{ backgroundColor: CAMPUS_PALETTE.sky }}
    >
      <p className="text-sm text-white/70">สวัสดี, {currentStudent.nickname}</p>
      <h1 className="text-3xl font-bold">ClassLoop Campus</h1>
      <p className="rounded-full bg-white/10 px-4 py-1.5 text-sm">เร็วๆ นี้: แคมปัส 3D · Coming soon: 3D campus</p>
      <Link to="/student" className="text-sm font-semibold underline underline-offset-4">
        ไปหน้าเดิม · Classic view
      </Link>
    </div>
  )
}
