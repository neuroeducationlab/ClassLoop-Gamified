# SPU ClassLoop — Project Handoff & AI Review Brief

> **Prepared:** 28 October 2026
> **Author:** Pichaya Thanaudompokin (Mollilyn) + Claude Code
> **Filming date:** 4–5 November 2026, ESG Leadership Forum
> **Production URL:** https://classloop-gamified.vercel.app
> **Repository:** https://github.com/neuroeducationlab/ClassLoop-Gamified
> **Latest commit:** `6714828` on `main`

---

## 1. What is ClassLoop?

ClassLoop is a **gamified Learning Management System (LMS)** built for Sripatum University (SPU). It turns a conventional lecture-based classroom into an interactive, game-enhanced learning experience — designed specifically for **mixed-faculty classes** where students from different disciplines (accounting, communication, IT, business) learn the same course together.

### The Problem It Solves
Thai higher education faces three challenges ClassLoop addresses:
1. **Passive learning** — students sit, listen, forget. ClassLoop embeds real-time quizzes, flashcard sprints, and debate-style activities directly into the lesson flow.
2. **Mixed-faculty friction** — students from different faculties rarely collaborate. ClassLoop's pairing system, cross-faculty challenges, and community features turn diversity into a learning advantage.
3. **Teacher prep burden** — preparing varied, engaging activities for each lecture is time-consuming. ClassLoop generates AI-powered lesson plans, flashcards, pre-tests, and gap analysis automatically from the syllabus.

### Target Audience
- **Primary:** University lecturers teaching mixed-faculty courses at SPU
- **Secondary:** Students (undergraduate, years 1–4) across multiple faculties
- **Demo audience:** ESG Leadership Forum attendees — English-speaking academic and industry leaders

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Vite | 8.2 |
| UI | React | 19.2 |
| Routing | React Router | 7.18 |
| Language | TypeScript | 6.0 |
| Styling | Tailwind CSS | 3.4 |
| 3D Engine | Three.js | 0.186 |
| 3D React | React Three Fiber (R3F) | 9.8 |
| 3D Helpers | drei | 10.7 |
| Icons | Lucide React | 1.31 |
| Hosting | Vercel | Production |

### Key Architecture Decisions
- **No backend / no database** — all data is static TypeScript seed data. This is a demo, not a production SaaS. State lives in React context + localStorage.
- **Single-page app** — React Router handles all navigation. Vercel serves the built `dist/` as static files.
- **No emoji** — every icon in the UI uses Lucide React via a custom `GameIcon` vocabulary (90+ named icons). This ensures cross-platform consistency and a polished game aesthetic.
- **Bilingual** — Thai (default) + English. Two translation layers: `t()` for keyed strings, `AutoTranslate` DOM-walker with 1,200-entry dictionary for everything else.

---

## 3. Project Structure

```
src/
├── components/
│   ├── brand/          # BrandMark.tsx (infinity-loop logo + wordmark)
│   ├── icons/          # GameIcon.tsx (Lucide vocabulary), drawGameIcon.ts (canvas)
│   ├── layout/         # StudentShell, TeacherShell, DarkModeToggle, LanguageSwitcher
│   └── AutoTranslate.tsx  # DOM-walker translation + lookupEn() + initials()
├── context/
│   └── AppContext.tsx   # Central state (1,098 lines): role, lang, students, XP,
│                        # activeCourseId, coursePacks, missions, avatar, community
├── data/
│   ├── seed-data.ts     # Core types + IBM3301 demo data (961 lines)
│   ├── courses.ts       # 3 CoursePacks: IBM3301, MGT2201, MGT4401 (375 lines)
│   ├── dictionary-en.ts # Thai→English translations (1,220 lines)
│   ├── buildings.ts     # 3D campus building definitions
│   ├── interiors.ts     # Room interior definitions
│   └── teacherCommands.ts  # Teacher command deck actions
├── pages/
│   ├── teacher/         # 7 pages: Studio, Dashboard, Exams, Live, Roster, Community, Attendance
│   ├── student/         # 7 pages: Home, Review, Syllabus, Assignments, Join, Profile, Community
│   ├── campus/          # 3D campus: Campus3D, CampusMap2D, BuildingInterior
│   │   ├── components/  # 20+ 3D components: NPCs, buildings, avatars, UI widgets
│   │   ├── interior/    # Room dressing, holo-panels, interior scenes
│   │   └── interiors/   # 5 themed interiors: Arena, FacultyHall, GateRoom, HeartDorm, Section
│   ├── wardrobe/        # Chibi avatar customiser: mystery blocks, flashcard sprint, quests, medals
│   ├── landing/         # Public landing page
│   └── Login.tsx        # Role-based login
└── lib/                 # Utilities (cn, etc.)
```

**Total:** 94 TypeScript/TSX files, 73 TSX components, ~1.7 MB source, ~3.0 MB public assets

---

## 4. Feature Inventory

### 4A. Teacher Side (7 pages)

| Page | File | What It Does |
|------|------|-------------|
| **Studio** | `teacher/Studio.tsx` | AI-generated lesson plans: activities, flashcards, discussion prompts. Teacher picks a topic → system produces a complete class session plan with timing, materials, and pedagogical rationale. |
| **Dashboard** | `teacher/Dashboard.tsx` | Analytics overview: class engagement heatmap, XP leaderboard, gap analysis (which concepts students struggle with), pre-test vs post-test comparison. |
| **Exams** | `teacher/Exams.tsx` | Exam builder with AI-generated questions from the topic bank. Configurable difficulty, misconception-based distractors. |
| **Live** | `teacher/Live.tsx` | Real-time class session controller: start/stop quiz rounds, display questions on screen, show live response distribution, award XP. |
| **Class Roster** | `teacher/ClassRoster.tsx` | Student list with section filtering, faculty breakdown, individual XP/badge tracking, cross-faculty pairing suggestions. |
| **Community** | `teacher/Community.tsx` | Discussion board management: approve posts, pin announcements, view student engagement metrics. |
| **Attendance** | `teacher/Attendance.tsx` | Check-in system with section tabs, late/absent/leave tracking, summary statistics. |

### 4B. Student Side (7 pages)

| Page | File | What It Does |
|------|------|-------------|
| **Home** | `student/Home.tsx` | Dashboard with current course, this week's topic, quick-access cards for quiz, review, and assignments. Shows XP, streak, and course-specific content. |
| **Review** | `student/Review.tsx` | Flashcard review mode: spaced-repetition style cards from the active course's content pack. |
| **Syllabus** | `student/Syllabus.tsx` | Week-by-week course outline with topics, learning objectives, and completion status. |
| **Assignments** | `student/Assignments.tsx` | Assignment list with due dates, submission status, and XP rewards. |
| **Join** | `student/Join.tsx` | Live quiz participation: join teacher's active session, answer questions in real time, see live leaderboard. |
| **Profile** | `student/Profile.tsx` | Student profile card with XP total, faculty rank, streak counter, and earned badges. |
| **Community** | `student/StudentCommunity.tsx` | Discussion board: post questions, share insights, reply to classmates, earn community XP. |

### 4C. 3D Campus (Three.js + R3F)

A full **3D virtual campus** rendered in the browser:
- **Campus3D.tsx** — main scene with walking avatar, buildings, NPCs, day/night cycle
- **5 explorable buildings** with interior scenes (Arena, Faculty Hall, Gate Room, Heart Dorm, Section)
- **NPC dialogue system** — campus characters give tips, lore, and quiz challenges
- **Teacher Command Deck** — floating holographic control panel in 3D space
- **2D fallback map** — `CampusMap2D.tsx` for low-power devices
- **HUD overlay** — course name, XP, minimap, mission tracker

### 4D. Wardrobe / Avatar System

- **Chibi avatar customiser** — hat, outfit, aura (6+ options each)
- **Mystery Blocks** — gamified reward: earn blocks → unlock cosmetics
- **Flashcard Sprint** — timed flashcard challenge for bonus XP
- **Special Quests** — achievement-based unlocks
- **Medal system** — 10+ collectible badges for milestones

### 4E. Course Switcher (Multi-Course Support)

Both teacher and student can switch between **3 courses** via a chip/radio UI:

| Course | Code | Accent Colour | Week 2 Topic |
|--------|------|--------------|-------------|
| International Business Management | IBM3301 | Pink `#D12E80` | Hofstede's Cultural Dimensions |
| Organisational Behaviour | MGT2201 | Teal `#0F9D8F` | Motivation: Maslow vs Herzberg |
| Strategic Management | MGT4401 | Orange `#F2994A` | Porter's Five Forces |

Each course has a complete **content pack**: 6-week topic plan, 3 classroom activities, 8 flashcards, 5 pre-test questions with misconception-based distractors, and a mixed-class teaching tip.

State is shared via `activeCourseId` in AppContext (persisted to localStorage). Switching courses instantly updates all pages — Studio generates activities for that course, Dashboard shows that course's analytics, Review shows that course's flashcards.

---

## 5. Design System

### Brand Identity
- **Logo:** Infinity-loop mark (SVG, gradient violet→pink→gold) — represents continuous learning
- **Wordmark:** "SPU ClassLoop" in Fredoka font
- **Favicon:** Roblox-style SPU main building (teal glass, white crown, gold flag, green baseplate)
- **File:** `src/components/brand/BrandMark.tsx`, `public/favicon.svg`, `public/brand/classloop-mark.svg`

### Icon Vocabulary
- **No emoji anywhere in the UI** — all icons are Lucide React, mapped through `GameIcon.tsx`
- 90+ named icons in the vocabulary (trophy, door, school, gamepad, brain, flame, etc.)
- Canvas rendering via `drawGameIcon.ts` for 3D billboards and name tags

### Colour System
- **Course accents:** Pink (#D12E80), Teal (#0F9D8F), Orange (#F2994A)
- **UI palette:** Tailwind defaults + custom `paper`, `canvas`, `ink`, `grey-*` tokens
- **Dark mode:** Full support via DarkModeToggle (CSS custom properties)

### Typography
- Body: system font stack
- Brand: Fredoka (Google Fonts)
- Mono: for course codes and data

### Translation System (Thai ↔ English)
Two layers ensure complete bilingual coverage:

1. **`t()` function** — keyed translations in `AppContext` for UI chrome (nav labels, button text)
2. **`AutoTranslate` DOM-walker** — scans rendered text and replaces Thai strings with English equivalents from `dictionary-en.ts` (1,220 lines, 250+ entries + 15 regex pattern rules)
3. **`lookupEn()`** — programmatic lookup for canvas text, computed strings, 3D labels
4. **`initials()`** — returns Latin initials for Thai names in English mode

The English-mode policy: **no Thai text visible when `lang === 'en'`**. Wall signs, NPC labels, avatar initials — everything runs through the translation pipeline.

---

## 6. Demo Data & Content

All data is **static and deterministic** — no random generation at runtime.

### Students (seed-data.ts)
- 30 students across 3 sections (sec1, sec2, sec3)
- Mixed faculties: Accounting, Communication Arts, IT, Business Administration, Digital Media
- Each has: name, nickname, faculty, year, avatar seed, engagement metrics

### Course Content (courses.ts)
Each of the 3 courses includes:
- **6-week topic plan** with learning objectives
- **3 classroom activities** (debate, case-based, quick-game format) with step-by-step instructions, timing, materials, and pedagogical rationale
- **8 flashcards** with front/back/hint
- **5 pre-test questions** with 4 options, correct answer, difficulty level, and common misconception explanation
- **Mixed-class teaching tip** specific to the course

### AI-Generated Content (seed-data.ts)
Pre-computed outputs simulating what an AI teaching assistant would generate:
- Gap analysis (which topics need reinforcement)
- Remediation suggestions
- Pre-test response distributions
- Engagement predictions

---

## 7. Current State & Known Issues

### Production Status
- **URL:** https://classloop-gamified.vercel.app
- **Build:** Clean (`npx tsc -b` + `npm run build` pass)
- **Commit:** `6714828` on `main`
- **Vercel:** Auto-deploy from `main` branch

### What Works Well
- Full teacher workflow: Studio → Live → Dashboard loop
- Student quiz participation (Join) with live leaderboard
- Course switching on both teacher and student sides
- 3D campus exploration with building interiors
- English mode with no Thai leaks (verified by automated scanner)
- Dark mode across all pages
- Mobile-responsive layout (max-w-lg with bottom tab navigation)

### Known Limitations (Demo Scope)
- **No real backend** — all data is static; "AI generation" is pre-computed seed data
- **No authentication** — role switching is a UI toggle, not a login system
- **No real-time sync** — "Live" quiz is simulated, not WebSocket-based
- **No persistent storage** — refreshing the page resets state (except localStorage items: active course, avatar, dark mode)
- **Single-player** — the "community" is pre-seeded posts, not real multi-user interaction
- **3D performance** — complex campus scene may struggle on older devices (2D fallback available)

### Open Opportunities for Enhancement
1. **Backend integration** — Supabase or Firebase for real user auth, real-time quiz, persistent XP
2. **AI integration** — Connect to Claude API for real-time lesson plan generation instead of static seed data
3. **LTI integration** — Connect to university LMS (Moodle, Canvas) for grade sync
4. **Analytics dashboard** — Real learning analytics with spaced-repetition algorithms
5. **Mobile app** — PWA or React Native wrapper for native experience
6. **Multi-language** — extend beyond Thai/English (Chinese, Japanese for ASEAN expansion)

---

## 8. Pitching & Demo Video Recommendations

### Demo Structure (Recommended 5–7 minutes)

**Opening Hook (30 seconds)**
> "What if every university lecture felt like a game — not because it's dumbed down, but because it's designed to activate every student in the room?"

Show the 3D campus for visual impact. Walk the avatar through the gate into a building.

**Act 1: The Teacher's Problem (60 seconds)**
- Show a mixed-faculty roster: accounting, comms, IT students in one class
- Switch to Studio: "The AI generates activities that make their diversity an advantage"
- Click through a generated activity — show the step-by-step plan with timing

**Act 2: The Live Classroom (90 seconds)**
- Teacher starts a Live session
- Switch to student view: Join page shows the quiz
- Students answer → live response chart appears
- XP awarded → leaderboard updates
- Flash the course switcher: "This works for any course — watch"
- Switch from IBM3301 to MGT2201 → all content changes instantly

**Act 3: Beyond the Classroom (60 seconds)**
- Student opens 3D campus → walks to Faculty Hall
- NPC gives a culture tip
- Student opens Wardrobe → earns a mystery block
- Show badges on Profile page: "Gamification that connects to real learning outcomes"

**Act 4: The Data Story (60 seconds)**
- Teacher Dashboard: gap analysis shows which concepts need reinforcement
- Pre-test vs post-test comparison
- "The system tells you what to teach next, not just what to test"

**Closing (30 seconds)**
> "ClassLoop isn't replacing the teacher — it's giving them superpowers. Every lecture, every student, every faculty — connected through game mechanics that make learning stick."

Show production URL. Mention ESG connection: "Sustainable education starts with engaged classrooms."

### Key Metrics to Highlight
- **3 complete courses** with AI-generated content packs
- **30 students** across 3 sections and 5 faculties
- **7 teacher tools** + **7 student pages** + **3D campus**
- **Bilingual** (Thai/English) with 1,200+ translation entries
- **90+ custom game icons** replacing emoji for professional consistency
- **Built in 2 weeks** (emphasise rapid prototyping with AI assistance)

### ESG Leadership Forum Angle
Frame ClassLoop under **SDG 4: Quality Education**:
- "Inclusive" — mixed-faculty design ensures no student is left behind
- "Equitable" — gamification levels the playing field (introverts earn XP through flashcards, extroverts through debates)
- "Technology-enhanced" — AI assists the teacher, not replaces them
- "Measurable" — gap analysis provides evidence-based teaching improvement

---

## 9. How to Feed This Project to AI for Review

### Method 1: Claude Code with GitHub (Recommended)

**Best for:** Comprehensive code review, architecture feedback, bug detection

```
# In Claude Code (CLI or web):
# Just share the repo URL — Claude Code can clone and explore

"Review the codebase at https://github.com/neuroeducationlab/ClassLoop-Gamified.
Focus on:
1. Code quality and TypeScript best practices
2. React performance patterns (unnecessary re-renders, memo usage)
3. 3D scene optimisation (Three.js draw calls, geometry instancing)
4. Accessibility (ARIA labels, keyboard navigation, screen reader support)
5. Demo readiness: what would break during a live presentation?"
```

### Method 2: Claude.ai Web (claude.ai/code)

**Best for:** Quick focused reviews, pitching advice, content feedback

1. Go to https://claude.ai/code
2. Connect your GitHub account if not already done
3. Start a session and ask Claude to attach the repo
4. Ask specific questions (see prompts below)

### Method 3: Cursor / VS Code with Claude Extension

**Best for:** Line-by-line code improvements while editing

1. Open the project in Cursor or VS Code with Claude extension
2. Select specific files for review
3. Use inline suggestions for improvements

### Method 4: Upload Key Files Directly

**Best for:** When you want focused feedback on specific areas

Upload these files to any AI chat (Claude.ai, ChatGPT, etc.):
- `src/context/AppContext.tsx` — the entire state architecture
- `src/data/courses.ts` — content pack structure
- `src/pages/campus/Campus3D.tsx` — 3D scene performance
- `src/components/AutoTranslate.tsx` — translation system
- This file (`PROJECT_HANDOFF.md`) — for context

### Method 5: GitHub Copilot / ChatGPT with Repo URL

```
"I'm building a gamified LMS for a Thai university. The repo is at
https://github.com/neuroeducationlab/ClassLoop-Gamified.
I'm presenting it at the ESG Leadership Forum on 4-5 November.
Review the codebase and tell me:
1. What are the strongest features to highlight in a 5-minute demo?
2. What could go wrong during a live presentation?
3. What quick wins could I add in the next 5 days?"
```

---

## 10. Recommended AI Review Prompts

Copy-paste these prompts to get the most useful feedback:

### For Code Quality Review
```
Review this React + TypeScript project for a gamified university LMS.
Tech stack: Vite 8, React 19, Three.js 0.186, Tailwind 3, TypeScript 6.
The project is a demo — no backend, all data is static seed data.
Focus on:
- TypeScript type safety (any casts, missing types)
- React anti-patterns (prop drilling, missing keys, effect deps)
- Bundle size concerns (tree-shaking, code splitting)
- Memory leaks in 3D scenes (disposed geometries, textures)
```

### For Demo Readiness Review
```
This project demos at a leadership forum in one week. Review for:
- Pages that might crash or show errors during a live demo
- Loading states that might look broken on slow wifi
- UI glitches on specific screen sizes (1920x1080 projector, iPad, iPhone)
- Dark mode inconsistencies
- Translation gaps (any Thai text visible in English mode)
- 3D scene performance on a standard MacBook Pro
Give me a prioritised risk list with fix difficulty (quick/medium/hard).
```

### For Pitching Advice
```
I'm presenting a gamified LMS called ClassLoop at the ESG Leadership Forum.
The audience: academic leaders and industry professionals interested in
sustainable education innovation.
The product: a web app that turns university lectures into game-enhanced
learning experiences with 3D campus, AI-generated lesson plans, live quizzes,
and cross-faculty collaboration.
Help me:
1. Write a 30-second elevator pitch
2. Identify the 3 strongest differentiators vs Kahoot/Quizlet/Moodle
3. Anticipate the 5 hardest questions the audience might ask
4. Suggest the optimal demo flow for maximum impact
```

### For UX/Design Review
```
Review the UI/UX of this gamified LMS. The design uses:
- Mobile-first layout (max-w-lg, bottom tab nav)
- Course accent colours: pink, teal, orange
- Custom icon vocabulary (Lucide, no emoji)
- Dark mode support
- Bilingual Thai/English
Focus on:
- Visual hierarchy and information density
- Touch targets for mobile use
- Colour contrast and accessibility
- Animation/transition smoothness
- Consistency across teacher vs student views
```

---

## 11. File Reference for AI Review

### Critical Files (read these first)
| File | Lines | Purpose |
|------|-------|---------|
| `src/context/AppContext.tsx` | 1,098 | All application state — the brain |
| `src/data/courses.ts` | 375 | 3 course packs with full content |
| `src/data/seed-data.ts` | 961 | Core types + IBM3301 demo data |
| `src/data/dictionary-en.ts` | 1,220 | Thai→English translation table |
| `src/components/layout/TeacherShell.tsx` | ~530 | Teacher layout + course switcher |
| `src/components/layout/StudentShell.tsx` | ~110 | Student layout + course switcher |

### 3D Campus (performance-sensitive)
| File | Purpose |
|------|---------|
| `src/pages/campus/Campus3D.tsx` | Main 3D scene — most complex component |
| `src/pages/campus/components/Building.tsx` | Building geometry + click handling |
| `src/pages/campus/components/CampusNPCs.tsx` | NPC system with dialogue |
| `src/pages/campus/components/Avatar3D.tsx` | Player avatar with customisation |
| `src/pages/campus/interior/RoomDressing.tsx` | Interior decorations + wall signs |

### Design System
| File | Purpose |
|------|---------|
| `src/components/brand/BrandMark.tsx` | Infinity-loop logo + wordmark |
| `src/components/icons/GameIcon.tsx` | 90+ Lucide icon vocabulary |
| `src/components/icons/drawGameIcon.ts` | Canvas icon renderer for 3D |
| `src/components/AutoTranslate.tsx` | Translation walker + `lookupEn()` |
| `public/favicon.svg` | Roblox-style SPU building |

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **CoursePack** | A bundle of course metadata + topics + activities + flashcards + pretest for one course |
| **GameIcon** | A Lucide React icon mapped by name (e.g. `<GameIcon name="trophy" />`) — the emoji replacement system |
| **AutoTranslate** | A React component that walks the DOM and replaces Thai text with English translations |
| **lookupEn()** | Programmatic Thai→English lookup for canvas text and computed strings |
| **activeCourseId** | The currently selected course, shared between teacher and student views |
| **Seed data** | Pre-computed demo data that simulates AI-generated content |
| **Gap analysis** | System analysis of pre-test results showing which topics students struggle with |
| **Mixed-faculty** | A class containing students from different academic disciplines |
| **XP** | Experience points — the primary gamification currency |
| **Streak** | Consecutive days of engagement, displayed on student profile |

---

*This document was prepared for AI-assisted review and human presentation planning. For the latest code, always refer to the repository.*
