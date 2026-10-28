import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { ContentKey } from '@/data/interiors'

/**
 * Which component each hologram panel shows. The campus rooms (`interiors/*`)
 * are built for the dark hologram glass; the original student/teacher pages are
 * built for the app's light canvas, so they sit on a light "screen" inside it.
 * Every page is rendered as-is, never edited here.
 */
type Entry = { Component: LazyExoticComponent<ComponentType>; surface: 'dark' | 'light' }

const dark = (load: () => Promise<{ default: ComponentType }>): Entry => ({ Component: lazy(load), surface: 'dark' })
const light = (load: () => Promise<{ default: ComponentType }>): Entry => ({ Component: lazy(load), surface: 'light' })

export const CONTENT: Record<ContentKey, Entry> = {
  'gate-room': dark(() => import('../interiors/GateRoom')),
  'faculty-room': dark(() => import('../interiors/FacultyHall')),
  'arena-room': dark(() => import('../interiors/Arena')),
  'dorm-room': dark(() => import('../interiors/HeartDorm')),
  'student-home': light(() => import('@/pages/student/Home')),
  'student-review': light(() => import('@/pages/student/Review')),
  'student-syllabus': light(() => import('@/pages/student/Syllabus')),
  'student-assignments': light(() => import('@/pages/student/Assignments')),
  'student-join': light(() => import('@/pages/student/Join')),
  'student-community': light(() => import('@/pages/student/StudentCommunity')),
  'student-profile': light(() => import('@/pages/student/Profile')),
  'teacher-studio': light(() => import('@/pages/teacher/Studio')),
  'teacher-dashboard': light(() => import('@/pages/teacher/Dashboard')),
  'teacher-exams': light(() => import('@/pages/teacher/Exams')),
  'teacher-live': light(() => import('@/pages/teacher/Live')),
  'teacher-roster': light(() => import('@/pages/teacher/ClassRoster')),
  'teacher-attendance': light(() => import('@/pages/teacher/Attendance')),
  'teacher-community': light(() => import('@/pages/teacher/Community')),
}
