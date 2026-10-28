import type { Role } from '@/context/AppContext'
import type { BuildingId } from './buildings'
import { TEACHER_COMMANDS } from './teacherCommands'

/**
 * What is inside each building: a small 3D room dressed in the building's own
 * colours and materials, with stations (a screen, a kiosk, a desk…) that each
 * open one ClassLoop feature on a hologram panel. Rooms are centred on the
 * origin; the door is the +z wall, so the camera starts there and looks in.
 */

/** A feature that can open on a hologram panel (see interior/contentRegistry.tsx). */
export type ContentKey =
  | 'gate-room'
  | 'faculty-room'
  | 'arena-room'
  | 'dorm-room'
  | 'student-home'
  | 'student-review'
  | 'student-syllabus'
  | 'student-assignments'
  | 'student-join'
  | 'student-community'
  | 'student-profile'
  | 'teacher-studio'
  | 'teacher-dashboard'
  | 'teacher-exams'
  | 'teacher-live'
  | 'teacher-roster'
  | 'teacher-community'

export type StationKind = 'screen' | 'kiosk' | 'desk' | 'board' | 'shelf'

export type Station = {
  id: string
  icon: string
  label: { th: string; en: string }
  /** What you do there, in plain words (shown under the label). */
  does: { th: string; en: string }
  kind: StationKind
  /** Floor position in the room. */
  at: [x: number, z: number]
  roles: Role[]
  content: ContentKey
  /** Size of the prop (1 = full size), e.g. a wall of smaller monitors. */
  scale?: number
}

/** Set dressing that makes the room read as this particular building. */
export type Dressing = 'concourse' | 'lecture' | 'library' | 'arena' | 'union' | 'lounge' | 'studio' | 'data' | 'staff'

export type InteriorConfig = {
  dressing: Dressing
  /** Floor size, width (x) × depth (z). */
  size: [w: number, d: number]
  height: number
  stations: Station[]
}

const both: Role[] = ['student', 'teacher']
const student: Role[] = ['student']
const teacher: Role[] = ['teacher']

export const INTERIORS: Record<BuildingId, InteriorConfig> = {
  entry: {
    dressing: 'concourse',
    size: [14, 10],
    height: 5,
    stations: [
      {
        id: 'today',
        icon: '🗓️',
        label: { th: 'แผนวันนี้', en: 'Today’s plan' },
        does: { th: 'บทเรียนต่อไป เป้าหมาย และสตรีคของคุณ', en: 'Your next lesson, goals and streak' },
        kind: 'board',
        at: [-3.2, -4.2],
        roles: both,
        content: 'student-home',
      },
      {
        id: 'wardrobe',
        icon: '👕',
        label: { th: 'ตู้เสื้อผ้า & ตั้งค่า', en: 'Wardrobe & settings' },
        does: { th: 'แต่งตัวละคร สลับบทบาทเดโม', en: 'Dress your character, switch demo role' },
        kind: 'kiosk',
        at: [3.2, -4.2],
        roles: both,
        content: 'gate-room',
      },
    ],
  },
  faculty: {
    dressing: 'lecture',
    size: [16, 12],
    height: 6,
    stations: [
      {
        id: 'lecture',
        icon: '🎬',
        label: { th: 'จอบรรยาย', en: 'Lecture screen' },
        does: { th: 'วิดีโอก่อนเรียน โน้ตสรุป และควิซ', en: 'Pre-class video, notes and a quick quiz' },
        kind: 'screen',
        at: [0, -5.4],
        roles: student,
        content: 'faculty-room',
      },
      {
        id: 'quests',
        icon: '📌',
        label: { th: 'บอร์ดภารกิจ', en: 'Quest board' },
        does: { th: 'งานที่ต้องส่ง และส่งงานได้ที่นี่', en: 'Assignments due — hand them in here' },
        kind: 'board',
        at: [-7.2, -1.5],
        roles: student,
        content: 'student-assignments',
      },
      {
        id: 'live',
        icon: '📡',
        label: { th: 'แท่นสอนสด', en: 'Live class console' },
        does: { th: 'เปิดคลาสสด ถามตอบและควิซแบบเรียลไทม์', en: 'Run a live class with real-time Q&A' },
        kind: 'desk',
        at: [0, -3.4],
        roles: teacher,
        content: 'teacher-live',
      },
    ],
  },
  library: {
    dressing: 'library',
    size: [14, 12],
    height: 5.5,
    stations: [
      {
        id: 'review',
        icon: '🧠',
        label: { th: 'โต๊ะทบทวน', en: 'Review desk' },
        does: { th: 'ทบทวนเนื้อหาที่ใกล้ลืม ก่อนสอบ', en: 'Revise what you’re about to forget, before the test' },
        kind: 'desk',
        at: [-3, -3],
        roles: both,
        content: 'student-review',
      },
      {
        id: 'syllabus',
        icon: '📖',
        label: { th: 'ชั้นหลักสูตร', en: 'Syllabus shelf' },
        does: { th: 'เป้าหมายรายสัปดาห์และสิ่งที่ต้องรู้', en: 'Weekly goals and what you’re expected to know' },
        kind: 'shelf',
        at: [3.2, -5],
        roles: both,
        content: 'student-syllabus',
      },
    ],
  },
  arena: {
    dressing: 'arena',
    size: [16, 14],
    height: 7,
    stations: [
      {
        id: 'battle',
        icon: '⚔️',
        label: { th: 'จอประลอง', en: 'Battle screen' },
        does: { th: 'Brain Gym, Boss Rush และอันดับห้อง', en: 'Brain Gym, Boss Rush and the class leaderboard' },
        kind: 'screen',
        at: [0, -6.2],
        roles: both,
        content: 'arena-room',
      },
      {
        id: 'challenges',
        icon: '🎯',
        label: { th: 'ตู้ชาเลนจ์', en: 'Challenge kiosk' },
        does: { th: 'เลือกชาเลนจ์ที่อยากลุย', en: 'Pick the next challenge to take on' },
        kind: 'kiosk',
        at: [6, -3],
        roles: both,
        content: 'student-join',
      },
    ],
  },
  union: {
    dressing: 'union',
    size: [14, 11],
    height: 5,
    stations: [
      {
        id: 'community',
        icon: '🗣️',
        label: { th: 'บอร์ดชุมชน', en: 'Community board' },
        does: { th: 'ถาม-ตอบ แชร์โน้ตกับเพื่อน', en: 'Ask, answer and share notes with classmates' },
        kind: 'board',
        at: [-3, -4.7],
        roles: both,
        content: 'student-community',
      },
      {
        id: 'profile',
        icon: '🏅',
        label: { th: 'ตู้โปรไฟล์', en: 'Profile kiosk' },
        does: { th: 'เลเวล เหรียญ และความสำเร็จของคุณ', en: 'Your level, badges and achievements' },
        kind: 'kiosk',
        at: [3.5, -4.2],
        roles: both,
        content: 'student-profile',
      },
    ],
  },
  dorm: {
    dressing: 'lounge',
    size: [12, 10],
    height: 4.6,
    stations: [
      {
        id: 'anonymous',
        icon: '💬',
        label: { th: 'มุมคุยนิรนาม', en: 'Anonymous corner' },
        does: { th: 'คุยกับอาจารย์ได้โดยไม่เปิดเผยชื่อ', en: 'Talk to your teacher without giving your name' },
        kind: 'desk',
        at: [-2.5, -3.6],
        roles: both,
        content: 'dorm-room',
      },
      {
        id: 'voice',
        icon: '📣',
        label: { th: 'เสียงนักศึกษา', en: 'Student voice' },
        does: { th: 'อ่านคำถามและฟีดแบคทั้งหมด แล้วตอบกลับ', en: 'Read all questions and feedback, and reply' },
        kind: 'screen',
        at: [3, -4.2],
        roles: teacher,
        content: 'teacher-community',
      },
    ],
  },
  plan: {
    dressing: 'studio',
    size: [12, 10],
    height: 4.8,
    stations: [
      {
        id: 'studio',
        icon: '🪄',
        label: { th: 'โต๊ะออกแบบบทเรียน', en: 'Lesson design desk' },
        does: { th: 'วางซิลลาบัส → AI เสนอกิจกรรม → เลือกใช้', en: 'Drop in a syllabus → AI suggests activities → pick' },
        kind: 'desk',
        at: [-2.6, -3],
        roles: teacher,
        content: 'teacher-studio',
      },
      {
        id: 'exams',
        icon: '📝',
        label: { th: 'จอข้อสอบ', en: 'Exam builder' },
        does: { th: 'สร้างและจัดการข้อสอบ ตรวจผลอัตโนมัติ', en: 'Build and manage exams, auto-graded' },
        kind: 'screen',
        at: [3, -4.2],
        roles: teacher,
        content: 'teacher-exams',
      },
    ],
  },
  data: {
    dressing: 'data',
    size: [12, 10],
    height: 4.8,
    stations: [
      {
        id: 'dashboard',
        icon: '📊',
        label: { th: 'ผนังสถิติ', en: 'Analytics wall' },
        does: { th: 'ดูว่าใครตามไม่ทัน และหัวข้อไหนต้องสอนซ้ำ', en: 'See who is falling behind and what to re-teach' },
        kind: 'screen',
        at: [-2, -4.2],
        roles: teacher,
        content: 'teacher-dashboard',
      },
      {
        id: 'roster',
        icon: '👥',
        label: { th: 'แฟ้มรายชื่อ', en: 'Roster files' },
        does: { th: 'ความคืบหน้าและการเข้าเรียนของแต่ละคน', en: 'Every student’s progress and attendance' },
        kind: 'shelf',
        at: [4, -3],
        roles: teacher,
        content: 'teacher-roster',
      },
    ],
  },
  // the staff room: every teacher command, a wall of six monitors along the back
  lounge: {
    dressing: 'staff',
    size: [15, 11],
    height: 5,
    stations: TEACHER_COMMANDS.map((c, i) => ({
      id: c.id,
      icon: c.icon,
      label: c.label,
      does: c.does,
      kind: 'screen' as const,
      at: [-5.9 + i * 2.36, -4.9] as [number, number],
      roles: teacher,
      content: c.content,
      scale: 0.58,
    })),
  },
}

/** The stations a role can use in a building, in menu order. */
export function stationsFor(id: BuildingId, role: Role) {
  return INTERIORS[id].stations.filter((s) => s.roles.includes(role))
}
