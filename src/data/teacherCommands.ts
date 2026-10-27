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
  /** The one thing the teacher does there, in plain words. */
  does: { th: string; en: string }
  /** The full page in the teacher web app. */
  route: string
  content: ContentKey
  buildingId: BuildingId
}

export const TEACHER_COMMANDS: TeacherCommand[] = [
  {
    id: 'studio',
    icon: '🪄',
    label: { th: 'ออกแบบบทเรียน', en: 'Design a lesson' },
    does: { th: 'วางซิลลาบัส → AI เสนอกิจกรรม → เลือกใช้', en: 'Drop in a syllabus → AI suggests activities → pick' },
    route: '/teacher',
    content: 'teacher-studio',
    buildingId: 'plan',
  },
  {
    id: 'dashboard',
    icon: '📊',
    label: { th: 'สถิติห้องเรียน', en: 'Class statistics' },
    does: { th: 'ดูว่าใครตามไม่ทัน และหัวข้อไหนต้องสอนซ้ำ', en: 'See who is falling behind and what to re-teach' },
    route: '/teacher/dashboard',
    content: 'teacher-dashboard',
    buildingId: 'data',
  },
  {
    id: 'exams',
    icon: '📝',
    label: { th: 'ข้อสอบ', en: 'Exams' },
    does: { th: 'สร้างและจัดการข้อสอบ ตรวจผลอัตโนมัติ', en: 'Build and manage exams, auto-graded' },
    route: '/teacher/exams',
    content: 'teacher-exams',
    buildingId: 'plan',
  },
  {
    id: 'live',
    icon: '📡',
    label: { th: 'สอนสด', en: 'Live class' },
    does: { th: 'เปิดคลาสสด ถามตอบและควิซแบบเรียลไทม์', en: 'Run a live class with real-time Q&A and quizzes' },
    route: '/teacher/live',
    content: 'teacher-live',
    buildingId: 'faculty',
  },
  {
    id: 'roster',
    icon: '👥',
    label: { th: 'รายชื่อนักศึกษา', en: 'Class roster' },
    does: { th: 'รายชื่อ ความคืบหน้า และการเข้าเรียนของแต่ละคน', en: 'Every student’s progress and attendance' },
    route: '/teacher/class',
    content: 'teacher-roster',
    buildingId: 'data',
  },
  {
    id: 'community',
    icon: '💬',
    label: { th: 'เสียงนักศึกษา', en: 'Student voice' },
    does: { th: 'อ่านคำถามและฟีดแบคแบบไม่ระบุชื่อ แล้วตอบกลับ', en: 'Read anonymous questions and feedback, and reply' },
    route: '/teacher/community',
    content: 'teacher-community',
    buildingId: 'dorm',
  },
]
