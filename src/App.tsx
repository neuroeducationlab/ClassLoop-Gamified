import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppNavigationBridge, AppProvider } from '@/context/AppContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import AutoTranslate from '@/components/AutoTranslate'
import TeacherShell from '@/components/layout/TeacherShell'
import StudentShell from '@/components/layout/StudentShell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/teacher/Dashboard'
import Studio from '@/pages/teacher/Studio'
import Exams from '@/pages/teacher/Exams'
import Live from '@/pages/teacher/Live'
import ClassRoster from '@/pages/teacher/ClassRoster'
import Community from '@/pages/teacher/Community'
import Home from '@/pages/student/Home'
import Join from '@/pages/student/Join'
import StudentCommunity from '@/pages/student/StudentCommunity'
import Profile from '@/pages/student/Profile'
import Review from '@/pages/student/Review'
import Assignments from '@/pages/student/Assignments'

// The campus pulls in three.js (~700 kB) — load it only when a student goes there.
const CharacterCreate = lazy(() => import('@/pages/create/CharacterCreate'))
const Campus3D = lazy(() => import('@/pages/campus/Campus3D'))
const BuildingInterior = lazy(() => import('@/pages/campus/BuildingInterior'))
const CampusMap2D = lazy(() => import('@/pages/campus/CampusMap2D'))
const Landing = lazy(() => import('@/pages/landing/Landing'))

const campusFallback = <div className="min-h-screen bg-[#3A3D7A]" />
/** The landing dive fades to cloud-white and Campus3D fades back out of it: no indigo flash in between. */
const landingFallback = <div className="min-h-screen bg-[#F3EEE6]" />

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppNavigationBridge />
          <AutoTranslate />
          <Routes>
            <Route path="/" element={<Suspense fallback={<div className="min-h-screen bg-[#E9C9A8]" />}><Landing /></Suspense>} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={<Suspense fallback={campusFallback}><CharacterCreate /></Suspense>} />
            <Route path="/campus" element={<Suspense fallback={landingFallback}><Campus3D /></Suspense>} />
            <Route path="/map" element={<Suspense fallback={campusFallback}><CampusMap2D /></Suspense>} />
            <Route
              path="/campus/:buildingId"
              element={<Suspense fallback={campusFallback}><BuildingInterior /></Suspense>}
            />

            <Route path="/teacher" element={<TeacherShell />}>
              <Route index element={<Studio />} />
              <Route path="studio" element={<Studio />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="exams" element={<Exams />} />
              <Route path="live" element={<Live />} />
              <Route path="class" element={<ClassRoster />} />
              <Route path="community" element={<Community />} />
            </Route>

            <Route path="/student" element={<StudentShell />}>
              <Route index element={<Home />} />
              <Route path="review" element={<Review />} />
              <Route path="syllabus" element={<Review />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="join" element={<Join />} />
              <Route path="community" element={<StudentCommunity />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
