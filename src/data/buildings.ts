/**
 * The 6 campus buildings shown in the 3D demo (see CAMPUS_BRIEF.md).
 *
 * Only 6 of SPU's 12 buildings — more than this is too many to read in a
 * 6-minute talk. Interiors are plain 2D UI; only the campus itself is 3D.
 * `position` is a placeholder grid on the ground plane (x, z) until Phase 3
 * lays the campus out against the real SPU map.
 */

export type BuildingId = 'entry' | 'faculty' | 'arena' | 'dorm' | 'data' | 'plan'

export type Building = {
  id: BuildingId
  name: { th: string; en: string }
  emoji: string
  /** Where it sits on the real SPU campus. */
  spuRef: string
  color: string
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

export const BUILDINGS: Building[] = [
  {
    id: 'entry',
    name: { th: 'ประตูทางเข้า', en: 'Gate' },
    emoji: '🚪',
    spuRef: 'MRT Exit 2',
    color: '#F25F5C',
    studentSees: 'login + pick role + character',
    teacherSees: null,
    position: [0, 8],
  },
  {
    id: 'faculty',
    name: { th: 'อาคารคณะ', en: 'Faculty hall' },
    emoji: '🏫',
    spuRef: 'bldg 1/5/9/11',
    color: '#7C9BE8',
    studentSees: 'lessons, pre-class video, quiz, graded test',
    teacherSees: null,
    position: [-6, 0],
  },
  {
    id: 'arena',
    name: { th: 'อารีน่า', en: 'Arena' },
    emoji: '🏆',
    spuRef: 'activity plaza',
    color: '#E89BC4',
    studentSees: 'word/quiz games, leaderboard, points',
    teacherSees: null,
    position: [6, 0],
  },
  {
    id: 'dorm',
    name: { th: 'หอใจ', en: 'Heart dorm' },
    emoji: '💬',
    spuRef: 'dormitory',
    color: '#4FB0A5',
    studentSees: 'talk to teacher, name hidden (anonymous)',
    teacherSees: 'read feedback, names hidden',
    position: [0, -6],
  },
  {
    id: 'data',
    name: { th: 'ศูนย์ข้อมูลและวิจัย', en: 'Data & research hub' },
    emoji: '📊',
    // TODO(team): confirm real building number — bldg 9 is a guess from the map arrow
    spuRef: 'bldg 9',
    color: '#F2994A',
    studentSees: null,
    teacherSees: 'student stats, charts, research store',
    position: [-6, -8],
  },
  {
    id: 'plan',
    name: { th: 'ห้องวางแผนการสอน', en: 'Lesson planning room' },
    emoji: '🗺️',
    spuRef: 'faculty/office',
    color: '#7C9BE8',
    studentSees: null,
    teacherSees: 'drop in syllabus → AI suggests activities → teacher picks',
    position: [6, -8],
  },
]
