import { useState, useMemo } from 'react'
import {
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  ShieldAlert,
  Check,
  Radio,
  X,
  Shuffle,
  MapPin,
  Maximize2,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { type Student } from '@/data/seed-data'
import { cn } from '@/lib/utils'
import { initials } from '@/components/AutoTranslate'
import { GameIcon } from '@/components/icons/GameIcon'

// Authentic SPU Classroom numbers pool
const SPU_ROOMS = [
  '11-704',
  '11-1002',
  '11-801',
  '11-1205',
  '11-903',
  '5-603',
  '9-301',
  '1-502',
  '11-0402',
]

/**
 * Realistic deterministic 25x25 SVG QR Code Generator with finder patterns,
 * timing tracks, alignment module, and center SPU badge.
 */
function RealisticQRCode({
  value,
  size = 112,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const matrix = useMemo(() => {
    const N = 25
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i)
      hash |= 0
    }
    const mat: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))
    const reserved: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))

    // Helper: 7x7 Finder Patterns + 1-module light border
    const setFinder = (sr: number, sc: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const row = sr + r
          const col = sc + c
          reserved[row][col] = true
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6
          const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4
          mat[row][col] = isBorder || isCore
        }
      }
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const row = sr + r
          const col = sc + c
          if (row >= 0 && row < N && col >= 0 && col < N) {
            reserved[row][col] = true
            if (r === -1 || r === 7 || c === -1 || c === 7) {
              mat[row][col] = false
            }
          }
        }
      }
    }

    setFinder(0, 0)
    setFinder(0, N - 7)
    setFinder(N - 7, 0)

    // Alignment pattern at (18, 18)
    const ar = 18,
      ac = 18
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        reserved[ar + r][ac + c] = true
        mat[ar + r][ac + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1
      }
    }

    // Timing strips
    for (let i = 8; i < N - 8; i++) {
      reserved[6][i] = true
      mat[6][i] = i % 2 === 0
      reserved[i][6] = true
      mat[i][6] = i % 2 === 0
    }

    // Center logo cutout (5x5)
    const mid = Math.floor(N / 2)
    for (let r = mid - 2; r <= mid + 2; r++) {
      for (let c = mid - 2; c <= mid + 2; c++) {
        reserved[r][c] = true
        mat[r][c] = false
      }
    }

    // PRNG data fill based on seed hash
    let prng = Math.abs(hash) || 987654321
    const nextRand = () => {
      prng = (prng * 1664525 + 1013904223) % 4294967296
      return prng / 4294967296
    }

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!reserved[r][c]) {
          const rand = nextRand()
          mat[r][c] = rand > 0.47 !== ((r + c) % 3 === 0)
        }
      }
    }

    return mat
  }, [value])

  const cellSize = 100 / 25

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'relative bg-white rounded-2xl p-1.5 shadow-sm border border-grey-200 select-none flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" shapeRendering="crispEdges">
        <rect width="100" height="100" fill="#FFFFFF" />
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return null
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#17161A"
              />
            )
          }),
        )}
      </svg>
      {/* Central Brand Badge with SPU pink accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-6 w-6 rounded-md bg-white shadow-sm border border-pink-200 flex items-center justify-center">
          <span className="text-[8px] font-black tracking-tighter text-pink-600 font-campus">
            SPU
          </span>
        </div>
      </div>
    </div>
  )
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave'

type StudentAttendanceRecord = {
  status: AttendanceStatus
  time: string
  method: 'qr' | 'manual' | 'pin'
  note?: string
  totalPresent: number // out of 5 weeks
}

export default function Attendance() {
  const { students, course, lang } = useApp()

  // State: Interactive attendance records per student
  const [attendance, setAttendance] = useState<Record<string, StudentAttendanceRecord>>(() => {
    const initial: Record<string, StudentAttendanceRecord> = {}
    students.forEach((s, idx) => {
      // Deterministic realistic initial attendance state
      let status: AttendanceStatus = 'present'
      let time = `08:${50 + (idx % 12)} น.`
      let method: 'qr' | 'manual' | 'pin' = idx % 3 === 0 ? 'pin' : 'qr'

      if (idx === 3 || idx === 11) {
        status = 'late'
        time = `09:18 น.`
      } else if (idx === 7) {
        status = 'absent'
        time = '-'
        method = 'manual'
      } else if (idx === 15) {
        status = 'leave'
        time = 'ส่งใบลา'
        method = 'manual'
      }

      initial[s.id] = {
        status,
        time,
        method,
        totalPresent: status === 'absent' ? 3 : status === 'late' ? 4 : 5,
        note: idx === 15 ? 'ลากิจร่วมงานสโมสรนักศึกษา' : undefined,
      }
    })
    return initial
  })

  // Controls & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSec, setSelectedSec] = useState<'all' | 'sec1' | 'sec2' | 'sec3'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all')
  const [currentWeek, setCurrentWeek] = useState(5)
  const [roomNumber, setRoomNumber] = useState('11-704')
  const [liveCode, setLiveCode] = useState('9452')
  const [isChangingCode, setIsChangingCode] = useState(false)
  const [isProjectorOpen, setIsProjectorOpen] = useState(false)
  const [isLiveOpen, setIsLiveOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [randomModalOpen, setRandomModalOpen] = useState(false)
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }

  // Update single student attendance status
  const updateStatus = (id: string, newStatus: AttendanceStatus) => {
    setAttendance((prev) => {
      const cur = prev[id] || { status: 'absent', time: '-', method: 'manual', totalPresent: 4 }
      const newTotal =
        newStatus === 'absent'
          ? Math.max(0, cur.totalPresent - 1)
          : cur.status === 'absent'
          ? cur.totalPresent + 1
          : cur.totalPresent

      return {
        ...prev,
        [id]: {
          ...cur,
          status: newStatus,
          method: 'manual',
          time: newStatus === 'absent' ? '-' : cur.time === '-' ? '09:05 น.' : cur.time,
          totalPresent: newTotal,
        },
      }
    })
    const s = students.find((x) => x.id === id)
    showToast(
      lang === 'th'
        ? `บันทึกสถานะ: ${s?.name || ''} → ${
            newStatus === 'present'
              ? 'มาเรียน'
              : newStatus === 'late'
              ? 'มาสาย'
              : newStatus === 'absent'
              ? 'ขาดเรียน'
              : 'ลา'
          }`
        : `Updated: ${s?.name || ''} → ${newStatus}`,
    )
  }

  // Action: Mark all filtered students as present
  const handleMarkAllPresent = () => {
    setAttendance((prev) => {
      const next = { ...prev }
      filteredStudents.forEach((s) => {
        next[s.id] = {
          ...next[s.id],
          status: 'present',
          time: '09:00 น.',
          method: 'manual',
        }
      })
      return next
    })
    showToast(lang === 'th' ? 'เช็คชื่อทุกคนในรายการว่า "มาเรียน" เรียบร้อย' : 'Marked all filtered as Present')
  }

  // Action: Random Student Roll Call
  const handleRandomPick = () => {
    setRandomModalOpen(true)
    setIsRolling(true)
    let count = 0
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length)
      setPickedStudent(students[randomIdx])
      count++
      if (count > 14) {
        clearInterval(interval)
        setIsRolling(false)
      }
    }, 80)
  }

  // Action: Generate new Room number & PIN code
  const handleGenerateNewCode = () => {
    setIsChangingCode(true)
    setTimeout(() => setIsChangingCode(false), 500)

    // Pick a new room different from current
    const availableRooms = SPU_ROOMS.filter((r) => r !== roomNumber)
    const newRoom =
      availableRooms[Math.floor(Math.random() * availableRooms.length)] || '11-1002'

    // Pick a new 4-digit PIN different from current
    let newCode = Math.floor(1000 + Math.random() * 9000).toString()
    while (newCode === liveCode) {
      newCode = Math.floor(1000 + Math.random() * 9000).toString()
    }

    setRoomNumber(newRoom)
    setLiveCode(newCode)

    showToast(
      lang === 'th'
        ? `เปลี่ยนห้องและรหัสใหม่: ห้อง ${newRoom} | PIN: ${newCode}`
        : `Generated New Room & PIN: Room ${newRoom} | PIN: ${newCode}`,
    )
  }

  // Action: Export CSV
  const handleExportCSV = () => {
    const headers =
      lang === 'th'
        ? 'รหัสนักศึกษา,ชื่อ-นามสกุล,ชื่อเล่น,คณะ,Section,สัปดาห์ที่ 5,เวลาเช็คชื่อ,วิธี,หมายเหตุ\n'
        : 'StudentID,FullName,Nickname,Faculty,Section,Week 5,CheckInTime,Method,Notes\n'
    const rows = students
      .map((s) => {
        const att = attendance[s.id]
        return `${s.id},"${s.name}",${s.nickname},${s.faculty},${s.sec},${att?.status || 'absent'},${att?.time || '-'},${att?.method || '-'},${att?.note || '-'}`
      })
      .join('\n')

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Attendance_${course.code}_Week${currentWeek}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showToast(lang === 'th' ? 'ส่งออกรายงานการเข้าเรียนเรียบร้อย' : 'Attendance report exported')
  }

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.faculty.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSec = selectedSec === 'all' || s.sec === selectedSec

      const att = attendance[s.id]
      const matchesStatus = statusFilter === 'all' || att?.status === statusFilter

      return matchesSearch && matchesSec && matchesStatus
    })
  }, [students, searchQuery, selectedSec, statusFilter, attendance])

  // Aggregate metrics
  const stats = useMemo(() => {
    let present = 0
    let late = 0
    let absent = 0
    let leave = 0
    students.forEach((s) => {
      const st = attendance[s.id]?.status
      if (st === 'present') present++
      else if (st === 'late') late++
      else if (st === 'absent') absent++
      else if (st === 'leave') leave++
    })
    const total = students.length || 1
    const presentPercent = Math.round((present / total) * 100)
    const atRiskCount = students.filter((s) => (attendance[s.id]?.totalPresent || 0) <= 3).length

    return { present, late, absent, leave, total: students.length, presentPercent, atRiskCount }
  }, [students, attendance])

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16 font-campus">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-grey-900/95 px-4 py-3 text-xs font-bold text-white shadow-2xl backdrop-blur-md border border-white/20 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-grey-300/40 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                {lang === 'th' ? 'ระบบเช็คชื่อ & สถิติการเข้าเรียน' : 'Attendance & Live Roll Call'}
              </h1>
              <p className="text-xs text-grey-600">
                {course.code} · {course.name} · {lang === 'th' ? `สัปดาห์ที่ ${currentWeek}` : `Week ${currentWeek}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRandomPick}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-all shadow-xs cursor-pointer"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>{lang === 'th' ? 'สุ่มเรียกชื่อ' : 'Random Call'}</span>
          </button>

          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-all shadow-xs cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{lang === 'th' ? 'เช็คทุกคนว่ามา' : 'Mark All Present'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-grey-300/70 bg-paper px-3.5 py-2 text-xs font-bold text-ink hover:bg-grey-100 transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-grey-500" />
            <span>{lang === 'th' ? 'ส่งออก CSV' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Live QR Code & PIN Code for in-class screen projection */}
      <div className="rounded-3xl border border-pink-200/80 bg-gradient-to-br from-pink-500/10 via-paper to-sky-500/10 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Live QR Code Box with click-to-project & zoom hint */}
            <div
              onClick={() => setIsProjectorOpen(true)}
              title={lang === 'th' ? 'คลิกเพื่อฉายจอใหญ่ (Projector Mode)' : 'Click to open Projector Mode'}
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-pink-200/80 hover:border-pink-400 transition-all cursor-pointer hover:shadow-lg shrink-0"
            >
              <div className={cn('transition-all duration-300', isChangingCode && 'scale-95 opacity-70 rotate-3')}>
                <RealisticQRCode value={`${roomNumber}-${liveCode}`} size={112} />
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-grey-500 group-hover:text-pink-600 transition-colors">
                <Maximize2 className="h-3 w-3" />
                <span>{lang === 'th' ? 'สแกนผ่าน SPU Life' : 'Scan via SPU App'}</span>
              </div>
            </div>

            {/* Live Session Info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border',
                    isLiveOpen
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-grey-300 bg-grey-100 text-grey-600',
                  )}
                >
                  <Radio className={cn('h-3 w-3', isLiveOpen ? 'text-emerald-500 animate-pulse' : 'text-grey-400')} />
                  <span>{isLiveOpen ? (lang === 'th' ? 'กำลังเปิดรับเช็คชื่อสด' : 'Live Check-in Open') : (lang === 'th' ? 'ปิดรับชั่วคราว' : 'Session Paused')}</span>
                </span>
                <span className="text-xs text-grey-500 font-medium">
                  {lang === 'th' ? 'หมดเวลาใน 09:12 นาที' : 'Session expires in 09:12'}
                </span>
              </div>

              {/* Room & PIN Display Row */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Classroom / Room Number */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-grey-500 mb-0.5">
                    {lang === 'th' ? 'เลขห้องเรียน (ROOM)' : 'CLASSROOM / ROOM'}
                  </span>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 font-mono text-xl font-extrabold text-indigo-700 shadow-xs transition-all duration-300',
                      isChangingCode && 'scale-105 bg-indigo-100 text-indigo-800',
                    )}
                  >
                    <span className="text-[11px] font-bold font-sans text-indigo-500 uppercase">
                      {lang === 'th' ? 'ห้อง' : 'RM'}
                    </span>
                    <span>{roomNumber}</span>
                  </div>
                </div>

                {/* 4-Digit PIN */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-grey-500 mb-0.5">
                    {lang === 'th' ? 'รหัส PIN เข้าห้อง' : 'IN-CLASS 4-DIGIT PIN'}
                  </span>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 font-mono text-2xl font-extrabold tracking-widest text-pink-600 bg-pink-100/80 px-3.5 py-1.5 rounded-xl border border-pink-300/80 shadow-xs transition-all duration-300',
                      isChangingCode && 'scale-105 bg-pink-200 text-pink-700',
                    )}
                  >
                    {liveCode}
                  </div>
                </div>

                {/* Quick Refresh Button */}
                <div className="self-end pb-0.5">
                  <button
                    onClick={handleGenerateNewCode}
                    title={lang === 'th' ? 'สุ่มเลขห้องและรหัส PIN ใหม่' : 'Generate new Room & PIN'}
                    className={cn(
                      'flex h-10 items-center gap-1.5 px-3 rounded-xl border border-grey-300/80 bg-white text-grey-700 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-all shadow-xs cursor-pointer active:scale-95',
                      isChangingCode && 'border-pink-500 text-pink-600 bg-pink-50',
                    )}
                  >
                    <RefreshCw className={cn('h-4 w-4', isChangingCode && 'animate-spin text-pink-600')} />
                    <span className="text-xs font-bold hidden sm:inline">
                      {lang === 'th' ? 'เปลี่ยนห้อง/รหัส' : 'Change'}
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-grey-600 flex items-center gap-1.5 pt-0.5">
                <MapPin className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                <span>
                  {lang === 'th'
                    ? `จำกัดพิกัด: อาคาร ${roomNumber.split('-')[0] || '11'} (ห้อง ${roomNumber}) ม.ศรีปทุม`
                    : `Geofence: Building ${roomNumber.split('-')[0] || '11'} (Room ${roomNumber}), SPU Main Campus`}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Session Control Switch */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <button
              onClick={() => {
                setIsLiveOpen(!isLiveOpen)
                showToast(
                  isLiveOpen
                    ? (lang === 'th' ? 'ปิดรับการเช็คชื่อสดแล้ว' : 'Live check-in closed')
                    : (lang === 'th' ? 'เปิดรับการเช็คชื่อสดแล้ว' : 'Live check-in opened')
                )
              }}
              className={cn(
                'rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 border',
                isLiveOpen
                  ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700',
              )}
            >
              <Radio className="h-4 w-4" />
              <span>{isLiveOpen ? (lang === 'th' ? 'ปิดรับเช็คชื่อ (Close Session)' : 'Close Session') : (lang === 'th' ? 'เปิดรับเช็คชื่อ (Open Session)' : 'Open Session')}</span>
            </button>
            <span className="text-[11px] text-grey-500">
              {lang === 'th' ? 'ซิงก์อัตโนมัติกับ SPU e-Learning' : 'Auto-synced with SPU e-Learning'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Present */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {lang === 'th' ? 'มาตรงเวลา' : 'Present'}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-700">{stats.present}</span>
            <span className="text-xs text-emerald-600 font-semibold">({stats.presentPercent}%)</span>
          </div>
          <p className="mt-1 text-[11px] text-grey-600">
            {lang === 'th' ? `จากทั้งหมด ${stats.total} คน` : `Out of ${stats.total} students`}
          </p>
        </div>

        {/* Late */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {lang === 'th' ? 'มาสาย' : 'Late'}
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-700">{stats.late}</span>
            <span className="text-xs text-amber-600 font-semibold">
              ({Math.round((stats.late / stats.total) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-grey-600">
            {lang === 'th' ? 'หลังเวลา 09:15 น.' : 'After 09:15 AM'}
          </p>
        </div>

        {/* Absent */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              {lang === 'th' ? 'ขาดเรียน' : 'Absent'}
            </span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-700">{stats.absent}</span>
            <span className="text-xs text-rose-600 font-semibold">
              ({Math.round((stats.absent / stats.total) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-grey-600">
            {lang === 'th' ? 'ยังไม่ได้เข้าเช็คชื่อ' : 'Unchecked students'}
          </p>
        </div>

        {/* Risk / Leave */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              {lang === 'th' ? 'เสี่ยงหมดสิทธิ์สอบ' : 'At-Risk (≤75%)'}
            </span>
            <ShieldAlert className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">{stats.atRiskCount}</span>
            <span className="text-xs text-purple-600 font-semibold">{lang === 'th' ? 'คน' : 'students'}</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-700 font-medium">
            {lang === 'th' ? 'ขาดเกิน 2 ครั้ง (จาก 5 ครั้ง)' : 'Missed > 2 sessions'}
          </p>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-grey-500 mr-1">{lang === 'th' ? 'สัปดาห์:' : 'Week:'}</span>
          {[1, 2, 3, 4, 5].map((w) => (
            <button
              key={w}
              onClick={() => {
                setCurrentWeek(w)
                showToast(lang === 'th' ? `สลับดูสถิติสัปดาห์ที่ ${w}` : `Switched to Week ${w}`)
              }}
              className={cn(
                'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer inline-flex items-center gap-1',
                currentWeek === w
                  ? 'border-pink-500 bg-pink-600 text-white shadow-xs'
                  : 'border-grey-300/60 bg-paper text-grey-600 hover:border-grey-300',
              )}
            >
              <span>Week {w}</span>
              {w === 5 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold opacity-95">
                  <GameIcon name="flame" className="h-3 w-3 text-amber-300" />
                  <span>({lang === 'th' ? 'ปัจจุบัน' : 'current'})</span>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Section filter */}
          <select
            value={selectedSec}
            onChange={(e) => setSelectedSec(e.target.value as any)}
            className="rounded-xl border border-grey-300/80 bg-paper px-3 py-1.5 text-xs font-bold text-ink outline-none"
          >
            <option value="all">
              {lang === 'th' ? `ทุก Section (${students.length} คน)` : `All Sections (${students.length} students)`}
            </option>
            <option value="sec1">Sec 1 (24 {lang === 'th' ? 'คน' : 'students'})</option>
            <option value="sec2">Sec 2 (25 {lang === 'th' ? 'คน' : 'students'})</option>
            <option value="sec3">Sec 3 (25 {lang === 'th' ? 'คน' : 'students'})</option>
          </select>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-grey-300/60 bg-paper p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-grey-400" />
          <input
            type="text"
            placeholder={lang === 'th' ? 'ค้นหาชื่อ, รหัสนักศึกษา หรือ คณะ...' : 'Search student by name, ID or faculty...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-grey-300/80 bg-canvas pl-10 pr-4 py-2 text-xs font-medium text-ink outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer',
              statusFilter === 'all'
                ? 'border-grey-800 bg-grey-900 text-white'
                : 'border-grey-300/60 bg-canvas text-grey-600 hover:border-grey-300',
            )}
          >
            {lang === 'th' ? 'ทั้งหมด' : 'All'} ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer',
              statusFilter === 'present'
                ? 'border-emerald-500 bg-emerald-600 text-white'
                : 'border-grey-300/60 bg-canvas text-emerald-700 hover:border-emerald-300',
            )}
          >
            {lang === 'th' ? 'มาเรียน' : 'Present'} ({stats.present})
          </button>
          <button
            onClick={() => setStatusFilter('late')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer',
              statusFilter === 'late'
                ? 'border-amber-500 bg-amber-600 text-white'
                : 'border-grey-300/60 bg-canvas text-amber-700 hover:border-amber-300',
            )}
          >
            {lang === 'th' ? 'มาสาย' : 'Late'} ({stats.late})
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer',
              statusFilter === 'absent'
                ? 'border-rose-500 bg-rose-600 text-white'
                : 'border-grey-300/60 bg-canvas text-rose-700 hover:border-rose-300',
            )}
          >
            {lang === 'th' ? 'ขาดเรียน' : 'Absent'} ({stats.absent})
          </button>
          <button
            onClick={() => setStatusFilter('leave')}
            className={cn(
              'rounded-xl px-3 py-1.5 text-xs font-bold transition-all border cursor-pointer',
              statusFilter === 'leave'
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-grey-300/60 bg-canvas text-blue-700 hover:border-blue-300',
            )}
          >
            {lang === 'th' ? 'ลา' : 'Leave'} ({stats.leave})
          </button>
        </div>
      </div>

      {/* Main Interactive Student Attendance Table */}
      <div className="overflow-hidden rounded-2xl border border-grey-300/60 bg-paper shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-grey-300/60 bg-grey-50/70 text-[11px] font-bold uppercase tracking-wider text-grey-500">
                <th className="py-3 px-4">{lang === 'th' ? 'นักศึกษา' : 'Student'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'คณะ' : 'Faculty'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'เวลา & ช่องทาง' : 'Time & Method'}</th>
                <th className="py-3 px-4 text-center">{lang === 'th' ? 'บันทึกสถานะการเข้าเรียน' : 'Attendance Status'}</th>
                <th className="py-3 px-4 text-center">{lang === 'th' ? 'สถิติสะสม (5 สัปดาห์)' : 'Rate (5 Weeks)'}</th>
                <th className="py-3 px-4">{lang === 'th' ? 'หมายเหตุ' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-300/40">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-grey-500">
                    {lang === 'th' ? 'ไม่พบข้อมูลนักศึกษาที่ตรงกับเงื่อนไขการค้นหา' : 'No students found matching search criteria'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const att = attendance[s.id] || {
                    status: 'absent',
                    time: '-',
                    method: 'manual',
                    totalPresent: 4,
                  }
                  const isAtRisk = att.totalPresent <= 3

                  return (
                    <tr
                      key={s.id}
                      className={cn(
                        'transition-colors hover:bg-pink-50/30',
                        att.status === 'absent' && 'bg-rose-50/20',
                      )}
                    >
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs shrink-0"
                            style={{
                              backgroundColor:
                                s.faculty === 'Accounting'
                                  ? '#3B82F6'
                                  : s.faculty === 'Communication Arts'
                                  ? '#EC4899'
                                  : s.faculty === 'Engineering'
                                  ? '#F97316'
                                  : '#10B981',
                            }}
                          >
                            {initials(s.nickname, lang)}
                          </span>
                          <div>
                            <p className="font-bold text-ink flex items-center gap-1.5">
                              <span>{s.name}</span>
                              <span className="text-[11px] font-normal text-grey-500">
                                ({s.nickname})
                              </span>
                            </p>
                            <span className="text-[10px] font-mono text-grey-500">
                              {s.id} · {s.sec.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Faculty */}
                      <td className="py-3 px-4 text-grey-600 font-medium">
                        {s.faculty}
                      </td>

                      {/* Check-in Time & Method */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-grey-600">
                          {att.method === 'qr' ? (
                            <QrCode className="h-3.5 w-3.5 text-pink-500" />
                          ) : att.method === 'pin' ? (
                            <span className="font-mono text-[10px] font-bold text-sky-600">PIN</span>
                          ) : (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          <span className="font-mono text-xs">
                            {att.time === 'ส่งใบลา'
                              ? (lang === 'th' ? 'ส่งใบลา' : 'Leave slip')
                              : (lang === 'th' ? att.time : att.time.replace(' น.', ' AM'))}
                          </span>
                        </div>
                      </td>

                      {/* 4 Interactive Toggle Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => updateStatus(s.id, 'present')}
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer',
                              att.status === 'present'
                                ? 'border-emerald-500 bg-emerald-600 text-white shadow-xs'
                                : 'border-grey-300/60 bg-paper text-grey-600 hover:border-emerald-400 hover:text-emerald-700',
                            )}
                          >
                            {lang === 'th' ? 'มา' : 'Present'}
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => updateStatus(s.id, 'late')}
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer',
                              att.status === 'late'
                                ? 'border-amber-500 bg-amber-600 text-white shadow-xs'
                                : 'border-grey-300/60 bg-paper text-grey-600 hover:border-amber-400 hover:text-amber-700',
                            )}
                          >
                            {lang === 'th' ? 'สาย' : 'Late'}
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => updateStatus(s.id, 'absent')}
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer',
                              att.status === 'absent'
                                ? 'border-rose-500 bg-rose-600 text-white shadow-xs'
                                : 'border-grey-300/60 bg-paper text-grey-600 hover:border-rose-400 hover:text-rose-700',
                            )}
                          >
                            {lang === 'th' ? 'ขาด' : 'Absent'}
                          </button>

                          {/* Leave */}
                          <button
                            type="button"
                            onClick={() => updateStatus(s.id, 'leave')}
                            className={cn(
                              'rounded-lg px-2.5 py-1 text-xs font-bold transition-all border cursor-pointer',
                              att.status === 'leave'
                                ? 'border-blue-500 bg-blue-600 text-white shadow-xs'
                                : 'border-grey-300/60 bg-paper text-grey-600 hover:border-blue-400 hover:text-blue-700',
                            )}
                          >
                            {lang === 'th' ? 'ลา' : 'Leave'}
                          </button>
                        </div>
                      </td>

                      {/* Cumulative attendance % */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              'font-bold text-xs',
                              isAtRisk ? 'text-rose-600' : 'text-emerald-700',
                            )}
                          >
                            {Math.round((att.totalPresent / 5) * 100)}% ({att.totalPresent}/5 {lang === 'th' ? 'ครั้ง' : 'sessions'})
                          </span>
                          {isAtRisk && (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 mt-0.5">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {lang === 'th' ? 'เสี่ยงหมดสิทธิ์สอบ' : 'Attendance Warning'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notes / Remark */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          defaultValue={
                            att.note
                              ? lang === 'th'
                                ? att.note
                                : att.note === 'ลากิจร่วมงานสโมสรนักศึกษา'
                                ? 'Student council duty'
                                : att.note
                              : ''
                          }
                          placeholder={lang === 'th' ? 'พิมพ์บันทึก...' : 'Add notes...'}
                          onBlur={(e) => {
                            setAttendance((prev) => ({
                              ...prev,
                              [s.id]: {
                                ...prev[s.id],
                                note: e.target.value,
                              },
                            }))
                            if (e.target.value) {
                              showToast(lang === 'th' ? `บันทึกหมายเหตุ: ${s.nickname}` : `Note saved for ${s.nickname}`)
                            }
                          }}
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-[11px] text-grey-600 hover:border-grey-300 focus:border-pink-500 focus:bg-canvas outline-none transition-all"
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Random Picker Modal */}
      {randomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-purple-300/60 bg-paper p-6 shadow-2xl space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-grey-300/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Shuffle className="h-4 w-4" />
                </span>
                <h3 className="text-base font-extrabold text-ink">
                  {lang === 'th' ? 'สุ่มเรียกนักศึกษาตอบ / เช็คชื่อ' : 'Random Roll Call Picker'}
                </h3>
              </div>
              <button
                onClick={() => setRandomModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-grey-100 text-grey-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {pickedStudent && (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-3xl font-extrabold text-white shadow-xl ring-4 ring-purple-100">
                    {initials(pickedStudent.nickname, lang)}
                  </div>
                  {isRolling && (
                    <span className="absolute inset-0 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                  )}
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-ink">{pickedStudent.name}</h4>
                  <p className="text-sm font-semibold text-purple-600">
                    "{pickedStudent.nickname}" · {pickedStudent.faculty}
                  </p>
                  <p className="text-xs text-grey-500 font-mono mt-0.5">
                    {pickedStudent.id} · {pickedStudent.sec.toUpperCase()}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateStatus(pickedStudent.id, 'present')
                      setRandomModalOpen(false)
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
                  >
                    {lang === 'th' ? 'มาตรงเวลา (Present)' : 'Present'}
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(pickedStudent.id, 'late')
                      setRandomModalOpen(false)
                    }}
                    className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 cursor-pointer"
                  >
                    {lang === 'th' ? 'มาสาย (Late)' : 'Late'}
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(pickedStudent.id, 'absent')
                      setRandomModalOpen(false)
                    }}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 cursor-pointer"
                  >
                    {lang === 'th' ? 'ไม่ขานชื่อ (Absent)' : 'Absent'}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-grey-300/40 pt-3 flex justify-between items-center">
              <button
                onClick={handleRandomPick}
                disabled={isRolling}
                className="flex items-center gap-1.5 rounded-xl border border-grey-300 bg-canvas px-3.5 py-1.5 text-xs font-bold text-grey-700 hover:bg-grey-100 cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>{lang === 'th' ? 'สุ่มคนใหม่' : 'Pick Again'}</span>
              </button>

              <button
                onClick={() => setRandomModalOpen(false)}
                className="rounded-xl bg-grey-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-black cursor-pointer"
              >
                {lang === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big Screen Projector Mode Modal */}
      {isProjectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-pink-300/50 bg-white p-8 text-center shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsProjectorOpen(false)}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-grey-100 text-grey-600 hover:bg-grey-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header info */}
            <div className="space-y-1 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold border border-pink-300 bg-pink-50 text-pink-600">
                <Radio className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
                <span>{lang === 'th' ? 'ฉายจอเช็คชื่อสดในห้องเรียน' : 'Live In-Class Projector Mode'}</span>
              </span>
              <h2 className="text-2xl font-black text-ink">
                {course.code} · {course.name}
              </h2>
              <p className="text-xs text-grey-600">
                {lang === 'th'
                  ? 'เปิดแอป SPU Life สแกน QR Code หรือกรอก PIN เพื่อเช็คชื่อเข้าเรียน'
                  : 'Open SPU Life app to scan QR Code or enter 4-digit PIN'}
              </p>
            </div>

            {/* Large QR Code */}
            <div className="flex justify-center my-6">
              <div className="p-4 rounded-3xl bg-pink-50/60 border-2 border-pink-200 shadow-inner">
                <RealisticQRCode
                  value={`${roomNumber}-${liveCode}`}
                  size={240}
                  className="shadow-lg border-2 border-grey-300/80"
                />
              </div>
            </div>

            {/* Large Room & PIN Display */}
            <div className="flex items-center justify-center gap-4 my-4 flex-wrap">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-5 py-3 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                  {lang === 'th' ? 'ห้องเรียน (Room)' : 'Classroom'}
                </span>
                <span className="font-mono text-3xl font-black text-indigo-700">
                  {roomNumber}
                </span>
              </div>

              <div className="rounded-2xl border-2 border-pink-300 bg-pink-50 px-6 py-3 text-center">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-pink-500">
                  {lang === 'th' ? 'รหัส PIN เช็คชื่อ' : '4-Digit PIN'}
                </span>
                <span className="font-mono text-4xl font-black tracking-widest text-pink-600">
                  {liveCode}
                </span>
              </div>
            </div>

            {/* Action buttons inside modal */}
            <div className="mt-6 flex items-center justify-center gap-3 pt-4 border-t border-grey-200">
              <button
                onClick={handleGenerateNewCode}
                className="flex items-center gap-2 rounded-2xl bg-pink-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-pink-700 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={cn('h-4 w-4', isChangingCode && 'animate-spin')} />
                <span>{lang === 'th' ? 'สุ่มเลขห้องและรหัสใหม่' : 'Generate New Room & PIN'}</span>
              </button>

              <button
                onClick={() => setIsProjectorOpen(false)}
                className="rounded-2xl border border-grey-300 bg-white px-5 py-2.5 text-xs font-bold text-grey-700 hover:bg-grey-100 transition-all cursor-pointer"
              >
                {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
