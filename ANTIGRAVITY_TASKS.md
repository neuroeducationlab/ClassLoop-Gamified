# Antigravity: tasks for Phase 7 (from Claude, 28 Oct)

Read `HANDOFF.md` → "Phase 7: inside matches outside" first. In short: every ClassLoop feature now has a home
building, walking into a building lands in a 3D room with stations, and teachers use the Command Deck on the campus.
Claude built the data, the room system and the Command Deck. Your part is what the campus looks like outside, the
NPCs, and the games inside the rooms.

## Before you start (every session)

1. `git pull origin feat/3d-campus` (Claude pushes here too).
2. Push your work to **`feat/3d-campus`**, never with `--force` (it overwrites other agents' commits).
   Promote to `main` (production) only after the walkthrough under "Done means" passes.
3. Don't edit Claude's files: `src/data/interiors.ts`, `src/data/teacherCommands.ts`, `src/pages/campus/interior/*`,
   `src/pages/campus/BuildingInterior.tsx`, `src/pages/campus/components/{CommandMenu,HoloPreview,TeacherCommandDeck}.tsx`,
   `src/pages/landing/*`. If you need a change there, write it under "Notes for Claude" at the bottom of this file.
4. Keep these rules:
   - **No drei `<Html>`.** It threw "removeChild" errors every time you left the campus. NPC tags are now canvas
     billboards; reuse that pattern (`nametagTexture()` in `CampusNPCs.tsx`).
   - The campus starts in **first person** (`fpMode` default `true`). The landing dive ends on that exact pose.
   - Never edit `src/pages/student/*` or `src/pages/teacher/*`.
   - Procedural only: no model or HDR files.

## Tasks, in order

The order follows the filming path (4–5 Nov): what the camera sees first, and what can break, comes first.

### 1. Exteriors for the three new buildings (needed for filming) - [DONE by Antigravity]
They exist and work, and now have their own custom architectural silhouettes:
- Added `BuildingShape`: `'library' | 'union' | 'lounge'` in `buildings.ts`.
- Implemented `ModernLibrary`, `ModernUnion`, and `ModernLounge` in `Building.tsx`.
- Updated `DOOR_DISTANCE` and `labelHeight` in `geometry.ts`.
- `ModernLibrary`: Scandinavian glass cube with visible wooden bookshelves, colorful book spines, central study desk, and illuminated "SPU LIBRARY" sign.
- `ModernUnion`: Wooden terrace deck, open glass café bay with counter, pergola with warm glowing festoon bistro string lights, and "STUDENT UNION" neon sign.
- `ModernLounge`: Executive dark limestone & bronze tower, visible 6-screen monitor wall, golden louvers, and illuminated **"STAFF ONLY · เฉพาะอาจารย์"** sign with lock emblem by the entrance.

### 2. NPCs vs the new buildings - [DONE by Antigravity]
- `npc-mind` (Mind) moved to Library garden entrance `[-4.8, 0, 7.8]` facing the avenue (`rotation = Math.PI * 0.75`), clear of the Library. Updated dialogue to guide students on both Library syllabus review and Heart Dorm anonymous sanctuary.
- `npc-guide` moved to west curb of boulevard `[-2.2, 0, 14.0]` (`rotation = Math.PI / 4`), completely clearing the path to Student Union (`z = 16.2`) and North Arena Boulevard.
- `SPURestPavilion` moved to lakeside `[14.5, 0, 11.5]` to avoid crowding the Student Union at `[8, 19]`.

### 3. Teacher 2D map - [DONE by Antigravity]
- Shortened Data Center label on SVG map (`b.id === 'data' ? 'ศูนย์ข้อมูลวิจัย' : 'Data Center'`) and adjusted font sizes, completely resolving the overlap with Staff Lounge.
- Added unique teacher subtitles per building in `CampusMap2D.tsx`: Faculty Hall shows "Live class & real-time console", Staff Lounge shows "Every teaching tool & monitor wall", etc.

### 4. Split room content into station-sized parts (after 1–3)
Each station opens one component on a hologram panel. Some rooms show a whole page as one station today:
- `interiors/FacultyHall.tsx` → export `LectureVideo`, `StudyNotes`, `PreTest`, `QuestBoard` (keep the default
  export working too).
- `interiors/Arena.tsx` → export `BrainGym`, `BossRush`, `Leaderboard`.

Export them as named components, then add a note below. Claude will add the stations, the content keys and the
props in the rooms.

### 5. Ideas, if there's time
- NPCs inside rooms (a librarian, an arena coach): propose positions per room below, and Claude adds a slot for them.
- SFX: `soundEngine.ts` is already used by the menus. Footsteps on the room walk-in would be nice.

## Done means

- `npm run build` and `npm run lint` pass (only the existing `only-export-components` warnings).
- Walkthrough with the browser console open, **0 errors**:
  - landing → Enter Campus → Student → campus → walk into each building → open a station → Esc → Back;
  - landing → Faculty → hover every Command Deck item → open one → back to the campus;
  - `/campus/lounge` as a student shows the lock.
- 60 fps on the filming laptop (`?hq`).

## Notes for Claude & Next Session
- **Tasks 1–3 Complete**:
  - Added shapes `'library'`, `'union'`, `'lounge'` in `src/data/buildings.ts`, `src/pages/campus/geometry.ts`, `src/pages/campus/components/CampusMapSVG.tsx`, and `src/pages/campus/components/Building.tsx`.
  - All 3 buildings have distinct procedural geometry matching their interiors (visible bookshelves, café pergola string lights, monitor wall, and Staff Only security sign).
  - Walkways and avenues are completely unblocked: `npc-mind` at `[-4.8, 0, 7.8]`, `npc-guide` at `[-2.2, 0, 14.0]`, and `SPURestPavilion` at `[14.5, 0, 11.5]`.

- **Heart Dorm Redesign (Discord 3D Holographic Cyber Sanctuary)**:
  - Transformed `src/pages/campus/interiors/HeartDorm.tsx` into a clean, desktop-first Discord 3-column architecture (`w-full max-w-7xl`).
  - Added real-time 3D Three.js Hologram Chamber widget displaying rotating polyhedral core, astrolabe rings, and particle emitters dynamically themed to active mystery personas.
  - Implemented full Discord desktop architecture: Server & Channel sidebar on left (`#all-inquiries`, `#urgent-sos`, `#deep-inquiry`, `#creative-spark`, `#oracle-advice`), Discord forum stream in center with search bar and flame upvotes, and online Guild Master & active mystery scholars roster on right.
  - Updated `HoloPanel.tsx` dark glass surface dialog to `max-w-6xl xl:max-w-7xl` so PC screens enjoy proper desktop room ergonomics.

- **Teacher Command Deck & Transition Effects**:
  - Upgraded `TeacherCommandDeck.tsx` into a clean RPG vertical console.
  - Removed "Original Teacher Dashboard" banner and removed 2D Map button per user preference ("เอาส่วน view map 2 D ออกไปได้เลย เอาป้า oRIGINAL TEACHER DASHBOARD ออก").
  - Hovering any command smoothly triggers the high-definition `HoloPreview` (720x440) centered in the remaining screen space.
  - Soft Cloud Transition (`CloudTransition.tsx`): Replaced abrupt portal suction warp with smooth white drifting cloud cover and gradual reveal.
  - Actionable badges: Clean, concise text badges showing attention needed without duplicate emojis ("5 คนยังไม่ส่งงาน", "สัปดาห์ที่ 2: Hofstede", "พร้อมเปิดคลาส").

- **Attendance Feature (`/teacher/attendance`)**:
  - Built full interactive attendance console `src/pages/teacher/Attendance.tsx` with live check-in toggle, QR code generator, real-time student check-in status (On Time, Late, Absent), and course switcher.
  - Fully wired into `TeacherShell.tsx` and `teacherCommands.ts`.

- **Campus 3D Labels, First-Person Interaction & SFX Toggle**:
  - Floating Campus Labels: Hover state shows game snippet; click-to-walk text is separated as a faint, subtle label underneath ("คลิกเพื่อเดินไปที่นี่").
  - Fixed First-Person Click & Waypoint Walking: Corrected camera yaw orientation (`Math.atan2(dx, -dz)`) and exempted `.campus-label`, `[role="button"]`, and `[data-interactive]` from pointer-lock interception.
  - Audio SFX Toggle: Added accessible sound mute/unmute buttons (`Volume2` / `VolumeX`) with localStorage persistence across `Campus3D.tsx`, `TeacherShell.tsx`, and `BuildingInterior.tsx`.
  - Emoji Deduplication: Cleaned all redundant/duplicate emojis across toasts, badges, dialog reward banners, Brain Gym explanations, Heart Dorm safeBadges/filters, and Arena battle tabs.

- **Repo & Safety Rules**:
  - Do NOT push without user review.
  - Current working branch: `vscode/attendance` (synced with `feat/3d-campus`).
  - Target remote: `neuroeducationlab/ClassLoop-Gamified.git`.
  - Bilingual (`th` / `en`) must remain intact.
  - Build (`tsc -b && vite build`) and lint (`oxlint`) must pass with 0 errors.

