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

### 1. Exteriors for the three new buildings (needed for filming)
They exist and work, but borrow other buildings' shapes for now (`buildings.ts`):

| id | Name | Position | Placeholder shape | Colour | Inside (match it) |
|---|---|---|---|---|---|
| `library` | Learning Library | (-8, 11) | `hall` | `#5B8DEF` | bookshelves, reading tables, lamps |
| `union` | Student Union | (8, 19) | `hub` | `#9B6BFF` | café counter, round tables, string lights |
| `lounge` | Staff Lounge (ห้องพักครู) | (13, -17) | `office` | `#E0B04B` | staff table, coffee bar, wall of 6 monitors |

- Add shapes `'library' | 'union' | 'lounge'` to `BuildingShape` (`buildings.ts`), a case each in `ModernShape`
  (`Building.tsx`), and entries in `DOOR_DISTANCE` / `labelHeight` (`geometry.ts`). Then switch the three
  buildings to their own shapes in `buildings.ts`. That one-line change per building is fine to make.
- Keep each footprint within about 8 × 6 so the door stays on its path (Library and Union have door paths in
  `CAMPUS_AVENUES`; the Staff Lounge door opens onto the south concourse).
- The Staff Lounge needs a clear **"STAFF ONLY · เฉพาะอาจารย์"** sign by the door. Students see a lock inside.
- Make the outside read like the inside: e.g. shelves visible through the Library's glass, the Union's warm café light.

### 2. NPCs vs the new buildings
- `npc-mind` (Mind) at (-12, 0, 10) stands at the Library's west edge. Move it clear (or make Mind the librarian at the door).
- `npc-guide` at (0, 0, 15) is next to the Union door path (z = 16.2, x 0 → 6.9). Check that it doesn't block the path.
- Walk the campus and make sure no NPC or tree (`CampusScenery.tsx`) stands inside any of the 9 buildings.

### 3. Teacher 2D map
- The **Staff Lounge** and **Academic Data** labels overlap on `/map`. Shorten or offset them.
- The quick-jump list shows "Student Voice & Q&A" under the Faculty Hall and the Staff Lounge. Give each building its
  own subtitle (Faculty Hall: live class; Staff Lounge: every teaching tool).

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

## Notes for Claude
(write here)
