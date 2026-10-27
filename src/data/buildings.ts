/**
 * The 9 campus buildings shown in the 3D demo (see CAMPUS_BRIEF.md), one home
 * per ClassLoop feature, in three districts: arrival + study (west), the
 * Academic Row with the staff-only zone (south), student life (north/east).
 * What each building's rooms hold is in `interiors.ts`.
 * `position` is (x, z) on the ground plane, traced from the official SPU
 * campus map (viewed from the map's bottom edge: -z is the far side with
 * bldgs 9/11, the MRT viaduct runs along the left/front edge). Stylised —
 * spacing is widened so labels and clicks never overlap on video.
 */

export type BuildingId = 'entry' | 'faculty' | 'arena' | 'dorm' | 'data' | 'plan' | 'library' | 'union' | 'lounge'

/** Low-poly silhouette used by the 3D campus — one per building so each reads at a glance. */
export type BuildingShape = 'gate' | 'hall' | 'arena' | 'house' | 'hub' | 'office'

export type Building = {
  id: BuildingId
  name: { th: string; en: string }
  /** One-line description shown on hover / in the door prompt. */
  description: { th: string; en: string }
  emoji: string
  /** Where it sits on the real SPU campus. */
  spuRef: string
  color: string
  shape: BuildingShape
  /** What each role finds inside; null means the role doesn't use it. */
  studentSees: string | null
  teacherSees: string | null
  position: [x: number, z: number]
}

export const CAMPUS_PALETTE = {
  sky: '#2563EB',
  grass: '#4EA342',
  path: '#EFE7D8',
  spuPink: '#E89BC4',
} as const

/** The central courtyard quad plaza. */
export const PLAZA_CENTER: [x: number, z: number] = [0, -1.0]

/** MRT viaduct along the campus edge, extended continuously across the visible landscape. */
export const MRT_LINE: { from: [x: number, z: number]; to: [x: number, z: number] } = {
  from: [-44, -20],
  to: [14, 48],
}

/** Car parks and pond from the map — scenery shared by the 3D campus and the teacher map. */
export const CAR_PARKS: { at: [x: number, z: number]; size: [w: number, d: number] }[] = [
  { at: [-9.5, -6.5], size: [5.2, 3.4] },
  { at: [9.5, -6.5], size: [5.2, 3.4] },
]
export const POND: { at: [x: number, z: number]; r: number } = { at: [7.5, 11.5], r: 3.8 }

export interface CampusAvenue {
  id: string
  from: [x: number, z: number]
  to: [x: number, z: number]
  width: number
}

/** Authentic RPG Game Campus Avenue & Street Network — connecting districts, avenues, and crosswalks (No roundabout spokes) */
export const CAMPUS_AVENUES: CampusAvenue[] = [
  // ── 1. The Sripatum Grand Promenade (East-West Arterial Avenue) ──
  { id: 'ave-west', from: [-20.0, -1.0], to: [-5.0, -1.0], width: 3.6 },
  { id: 'ave-central', from: [-5.0, -1.0], to: [5.0, -1.0], width: 4.4 },
  { id: 'ave-east', from: [5.0, -1.0], to: [21.5, -1.0], width: 3.6 },
  { id: 'ave-dorm-link', from: [21.5, -1.0], to: [21.5, 3.5], width: 3.2 },

  // ── 2. North Arena Boulevard (Avenue of Champions) ──
  { id: 'ave-north-arena', from: [0.0, -1.0], to: [0.0, 18.0], width: 4.0 },

  // ── 3. South Academic Concourse (Avenue of Knowledge) ──
  { id: 'ave-south-main', from: [-14.0, -14.0], to: [20.0, -14.0], width: 3.4 },
  { id: 'ave-faculty-door', from: [-14.0, -14.0], to: [-14.0, -16.0], width: 3.2 },
  { id: 'ave-plan-door', from: [4.0, -14.0], to: [4.0, -15.5], width: 3.2 },
  { id: 'ave-data-door', from: [20.0, -14.0], to: [20.0, -15.5], width: 3.2 },

  // ── 4. North-South Urban Crossways (Connecting Promenades to Academic Concourse) ──
  { id: 'ave-cross-west', from: [-14.0, -1.0], to: [-14.0, -14.0], width: 3.2 },
  { id: 'ave-cross-center', from: [4.0, -1.0], to: [4.0, -14.0], width: 3.2 },
  { id: 'ave-cross-east', from: [18.0, -1.0], to: [20.0, -14.0], width: 3.2 },

  // ── Door paths for the Library and Student Union (the Staff Lounge door sits on the concourse) ──
  { id: 'ave-library-door', from: [-6.2, 8.3], to: [-6.2, -1.0], width: 2.8 },
  { id: 'ave-union-door', from: [6.9, 16.2], to: [0.0, 16.2], width: 2.8 },

  // ── 5. Park Promenade (By Pond towards Sports Court) ──
  { id: 'ave-park-loop', from: [0.0, 8.0], to: [14.0, 14.0], width: 2.8 },
  { id: 'ave-sports-link', from: [14.0, 14.0], to: [18.0, 20.0], width: 2.8 },
]

export const BUILDINGS: Building[] = [
  {
    id: 'entry',
    name: { th: 'ประตูทางเข้า', en: 'MRT Gateway Pavilion' },
    description: {
      th: 'ประตูทางเข้าหลัก เชื่อมต่อจากสถานีรถไฟฟ้าสายสีเขียวสู่ลานกลางแคมปัส SPU',
      en: 'Main pedestrian entrance connecting MRT Sai Ma Exit 2 directly to the campus plaza.',
    },
    emoji: '🚪',
    spuRef: 'MRT Exit 2',
    color: '#F25F5C',
    shape: 'gate',
    studentSees: 'login + pick role + character',
    teacherSees: null,
    position: [-22.0, -1.0],
  },
  {
    id: 'faculty',
    name: { th: 'อาคารคณะ', en: 'Rangsit-Nives Academic Hall' },
    description: {
      th: 'อาคารเรียนหลักสำหรับบรรยาย วิดีโอก่อนเรียน ควิซ และแบบทดสอบเก็บคะแนน',
      en: 'Primary lecture building — pre-class videos, interactive quizzes, and graded assessments.',
    },
    emoji: '🏫',
    spuRef: 'bldg 1/11',
    color: '#7C9BE8',
    shape: 'hall',
    studentSees: 'lessons, pre-class video, quiz, graded test',
    teacherSees: 'run a live class',
    position: [-16.0, -17.0],
  },
  {
    id: 'arena',
    name: { th: 'อารีน่า', en: 'Outdoor Activity Arena' },
    description: {
      th: 'ลานประลองและกิจกรรมกลางแจ้ง แข่งขันตอบคำถาม ชิงอันดับลีดเดอร์บอร์ด',
      en: 'Open-air competition plaza — word games, team challenges, and a live class leaderboard.',
    },
    emoji: '🏆',
    spuRef: 'lawn by the pond',
    color: '#E89BC4',
    shape: 'arena',
    studentSees: 'word/quiz games, leaderboard, points',
    teacherSees: null,
    position: [0, 21.0],
  },
  {
    id: 'dorm',
    name: { th: 'หอใจ', en: 'Student Wellness Lounge' },
    description: {
      th: 'หอพักใจ ส่งความคิดเห็นและแชทกับอาจารย์แบบไม่เปิดเผยตัวตน สไตล์ RPG',
      en: 'Anonymous feedback channel — share thoughts with your instructor confidentially.',
    },
    emoji: '💬',
    spuRef: 'bldg 6',
    color: '#4FB0A5',
    shape: 'house',
    studentSees: 'talk to teacher, name hidden (anonymous)',
    teacherSees: 'read feedback, names hidden',
    position: [24.0, 3.5],
  },
  {
    id: 'data',
    name: { th: 'ศูนย์ข้อมูลและวิจัย', en: 'Academic Data & Research Center' },
    description: {
      th: 'ศูนย์วิเคราะห์ข้อมูลสถิติผู้เรียน วิเคราะห์ Gap ความรู้ และคลังข้อสอบสำหรับอาจารย์',
      en: 'Faculty-only analytics hub — student performance charts, gap analysis, and research data.',
    },
    emoji: '📊',
    spuRef: 'bldg 9',
    color: '#F2994A',
    shape: 'hub',
    studentSees: null,
    teacherSees: 'student stats, charts, research store',
    position: [22.0, -17.0],
  },
  {
    id: 'plan',
    name: { th: 'ห้องวางแผนการสอน', en: 'Lesson Planning Studio' },
    description: {
      th: 'สตูดิโอออกแบบแผนการสอนด้วย AI สรุปกิจกรรมและสื่อการสอน 1-คลิก',
      en: 'AI-assisted curriculum design room — upload a syllabus and get instant activity suggestions.',
    },
    emoji: '🗺️',
    spuRef: 'bldg 5',
    color: '#7C9BE8',
    shape: 'office',
    studentSees: null,
    teacherSees: 'drop in syllabus → AI suggests activities → teacher picks',
    position: [4.0, -17.0],
  },
  {
    id: 'library',
    name: { th: 'หอสมุด', en: 'Learning Library' },
    description: {
      th: 'ศูนย์ทบทวนบทเรียนและหลักสูตรรายวิชา ทบทวนก่อนสอบ ดูเป้าหมายแต่ละสัปดาห์',
      en: 'Review centre and course syllabus — revise before the test and see each week’s goals.',
    },
    emoji: '📚',
    spuRef: 'library',
    color: '#5B8DEF',
    shape: 'hall',
    studentSees: 'review centre, course syllabus',
    teacherSees: null,
    position: [-8.0, 11.0],
  },
  {
    id: 'union',
    name: { th: 'สโมสรนักศึกษา', en: 'Student Union' },
    description: {
      th: 'ชุมชนแลกเปลี่ยนเรียนรู้และโปรไฟล์ของคุณ ถาม-ตอบ แชร์โน้ต ดูความสำเร็จ',
      en: 'Community board and your profile — ask, share notes and see your achievements.',
    },
    emoji: '🎪',
    spuRef: 'student union',
    color: '#9B6BFF',
    shape: 'hub',
    studentSees: 'community board, profile',
    teacherSees: null,
    position: [8.0, 19.0],
  },
  {
    id: 'lounge',
    name: { th: 'ห้องพักครู', en: 'Staff Lounge' },
    description: {
      th: 'เฉพาะอาจารย์ ศูนย์รวมเครื่องมือครู ออกแบบบทเรียน สถิติ ข้อสอบ สอนสด รายชื่อ และเสียงนักศึกษา',
      en: 'Staff only — every teaching tool in one room: lesson design, stats, exams, live class, roster and student voice.',
    },
    emoji: '☕',
    spuRef: 'staff room',
    color: '#E0B04B',
    shape: 'office',
    studentSees: null,
    teacherSees: 'all teaching tools in one room',
    position: [13.0, -17.0],
  },
]
