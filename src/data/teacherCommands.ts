import type { BuildingId } from './buildings'
import type { ContentKey } from './interiors'

/**
 * Everything a teacher can do, as one RPG-style command list. The Command Deck
 * on the campus shows these; the Staff Lounge turns each into a station; each
 * also lives in a "home" building, which glows when the command is hovered.
 */
export type TeacherCommand = {
  id: string
  icon: string
  label: { th: string; en: string }
  /** What the teacher does there, in plain words. */
  does: { th: string; en: string }
  /** Real-time actionable badge showing what needs attention ("เห็นสิ่งที่ต้องทำ"). */
  actionBadge?: { th: string; en: string }
  urgent?: boolean
  /** The full page route in the app. */
  route: string
  content: ContentKey
  buildingId: BuildingId
}

export const TEACHER_COMMANDS: TeacherCommand[] = [
  {
    id: 'studio',
    icon: '🪄',
    label: { th: 'ออกแบบบทเรียน', en: 'Lesson Design (Studio)' },
    does: { th: 'วางซิลลาบัส → AI เสนอกิจกรรม → เลือกใช้', en: 'Drop in syllabus → AI suggests activities → pick' },
    actionBadge: { th: '✨ สัปดาห์ที่ 2: Hofstede', en: '✨ Week 2: Hofstede' },
    route: '/teacher',
    content: 'teacher-studio',
    buildingId: 'plan',
  },
  {
    id: 'dashboard',
    icon: '📊',
    label: { th: 'สถิติ & Gap Analysis', en: 'Analytics & Gap Analysis' },
    does: { th: 'ดูว่าใครตามไม่ทัน และหัวข้อไหนต้องส่งชุดทบทวน', en: 'See who is falling behind & push remediation' },
    actionBadge: { th: '⚠️ 5 คนยังไม่ส่งงาน', en: '⚠️ 5 unsubmitted' },
    urgent: true,
    route: '/teacher/dashboard',
    content: 'teacher-dashboard',
    buildingId: 'data',
  },
  {
    id: 'live',
    icon: '📡',
    label: { th: 'สอนสด & คอนโซล', en: 'Live Class & Console' },
    does: { th: 'เปิดคลาสสด ถามตอบและควิซแบบเรียลไทม์ พร้อมสุ่มผู้ตอบ', en: 'Run live class with real-time quizzes & picker' },
    actionBadge: { th: '🟢 Session พร้อมเปิดคลาส', en: '🟢 Ready to launch' },
    route: '/teacher/live',
    content: 'teacher-live',
    buildingId: 'faculty',
  },
  {
    id: 'exams',
    icon: '📝',
    label: { th: 'คลังข้อสอบ & ปรีเทสต์', en: 'Exams & Pre-tests' },
    does: { th: 'สร้างและจัดการข้อสอบ Pre/Post-test ตรวจผลอัตโนมัติ', en: 'Build & manage exams, auto-graded' },
    actionBadge: { th: '📝 3 ชุดข้อสอบพร้อมใช้', en: '📝 3 active exams' },
    route: '/teacher/exams',
    content: 'teacher-exams',
    buildingId: 'plan',
  },
  {
    id: 'roster',
    icon: '👥',
    label: { th: 'รายชื่อ & การเข้าเรียน', en: 'Class Roster & Attendance' },
    does: { th: 'รายชื่อ ความคืบหน้า และการเข้าเรียนของแต่ละคน', en: 'Every student’s progress and attendance' },
    actionBadge: { th: '👥 25 นักศึกษาในระบบ', en: '👥 25 students' },
    route: '/teacher/class',
    content: 'teacher-roster',
    buildingId: 'data',
  },
  {
    id: 'community',
    icon: '💬',
    label: { th: 'เสียงนักศึกษา & ฟีดแบค', en: 'Student Voice & Feedback' },
    does: { th: 'อ่านคำถามและฟีดแบคแบบไม่ระบุชื่อ แล้วตอบกลับ', en: 'Read anonymous inquiries and reply safely' },
    actionBadge: { th: '🔥 3 คำถามนิรนามใหม่', en: '🔥 3 new inquiries' },
    urgent: true,
    route: '/teacher/community',
    content: 'teacher-community',
    buildingId: 'dorm',
  },
  {
    id: 'lounge',
    icon: '☕',
    label: { th: 'ห้องพักครู VIP Lounge', en: 'Staff Lounge (3D Room)' },
    does: { th: 'ศูนย์ควบคุม 3D มอนิเตอร์ 6 หน้าจอ รวมทุกเครื่องมือ', en: '3D executive room with 6-monitor wall' },
    actionBadge: { th: '☕ เฉพาะอาจารย์', en: '☕ Staff Only' },
    route: '/campus/lounge',
    content: 'teacher-dashboard',
    buildingId: 'lounge',
  },
  {
    id: 'library',
    icon: '📚',
    label: { th: 'คลังทบทวน & ซิลลาบัส', en: 'Library & Syllabus' },
    does: { th: 'ตรวจเป้าหมายรายสัปดาห์และเอกสารทบทวนของนักศึกษา', en: 'Inspect student review cards & weekly syllabus' },
    actionBadge: { th: '📖 6 หัวข้อทบทวน', en: '📖 6 review topics' },
    route: '/campus/library',
    content: 'student-syllabus',
    buildingId: 'library',
  },
  {
    id: 'arena',
    icon: '🏆',
    label: { th: 'สังเวียน & ลีดเดอร์บอร์ด', en: 'Arena & Leaderboard' },
    does: { th: 'ดูอันดับคะแนนห้องเรียน การแข่ง Brain Gym และ Boss Rush', en: 'View class competition & live leaderboard' },
    actionBadge: { th: '⚔️ อันดับคะแนนสด', en: '⚔️ Live rankings' },
    route: '/campus/arena',
    content: 'arena-room',
    buildingId: 'arena',
  },
]
