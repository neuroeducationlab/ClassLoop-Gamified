/**
 * The 6 campus buildings shown in the 3D demo (see CAMPUS_BRIEF.md).
 *
 * Only 6 of SPU's 12 buildings — more than this is too many to read in a
 * 6-minute talk. Interiors are plain 2D UI; only the campus itself is 3D.
 * `position` is (x, z) on the ground plane, traced from the official SPU
 * campus map (viewed from the map's bottom edge: -z is the far side with
 * bldgs 9/11, the MRT viaduct runs along the left/front edge). Stylised —
 * spacing is widened so labels and clicks never overlap on video.
 */

export type BuildingId = 'entry' | 'faculty' | 'arena' | 'dorm' | 'data' | 'plan'

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
  sky: '#3A3D7A',
  grass: '#7FB069',
  path: '#F2C879',
  spuPink: '#E89BC4',
} as const

/** The central crossroads by the car parks, where every path meets. */
export const PLAZA_CENTER: [x: number, z: number] = [1, 0]

/** MRT viaduct along the campus edge, from its far end to its near end. */
export const MRT_LINE: { from: [x: number, z: number]; to: [x: number, z: number] } = {
  from: [-19, -6],
  to: [3, 18],
}

/** Car parks and pond from the map — scenery shared by the 3D campus and the teacher map. */
export const CAR_PARKS: { at: [x: number, z: number]; size: [w: number, d: number] }[] = [
  { at: [-3.6, -2.4], size: [4.4, 3] },
  { at: [6, 2], size: [4.4, 3] },
]
export const POND: { at: [x: number, z: number]; r: number } = { at: [6.5, 7.5], r: 2.8 }

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
    position: [-10, -1],
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
    teacherSees: null,
    position: [-6, -8.5],
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
    position: [0, 6.5],
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
    position: [11.5, -3],
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
    position: [10, -10],
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
    position: [2, -6.5],
  },
]
