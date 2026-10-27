# HANDOFF — ClassLoop 3D Campus

Read this first in any new session (Claude Code in VS Code, Antigravity, claude.ai/code).
Resume prompt:

> Read HANDOFF.md and CAMPUS_BRIEF.md, then continue from the first unchecked item in "Next".
> Push only to `neuroeducationlab/ClassLoop-Gamified`, branch `feat/3d-campus`.

## Goal

A filmed (pre-recorded) 6-minute demo for the Global ESG Leadership Forum, **4–5 Nov 2026**.
Students walk a 3D SPU campus; teachers see a calm 2D map. Full brief: `CAMPUS_BRIEF.md`.

## Repo safety rules (read before any push)

- This repo is **ClassLoop-Gamified**, a copy. The original `ClassLoop-MVP-LearnHack-submission` must
  never be pushed to.
- Before every push run `git remote -v`. Cloud sessions have twice reset `origin` back to the
  original repo. Safest is to push by explicit URL:
  `git push https://github.com/neuroeducationlab/ClassLoop-Gamified.git feat/3d-campus`
- Don't edit `src/pages/student/*`, `src/pages/teacher/*`, `src/lib/*`, `src/hooks/*`.
  `src/context/AppContext.tsx` only ever gets additive fields (the `avatar` field is the only one so far).

## Run it

```bash
git clone https://github.com/neuroeducationlab/ClassLoop-Gamified.git
cd ClassLoop-Gamified && git checkout feat/3d-campus
npm install
npm run dev            # http://localhost:5173
npm run build          # tsc -b + vite build — must pass
npm run lint           # oxlint — only the 3 existing AppContext warnings are expected
```

Demo logins (also printed on the login screen): `student@spu.ac.th` / `spu1234`, `teacher@spu.ac.th` / `spu1234`.

| Route | What |
|---|---|
| `/login` | existing role select + login (student → `/create`, teacher → `/map`) |
| `/create` | character creator (colour, hat, nickname, 3D preview) |
| `/campus` | student 3D campus (click to walk, click building to enter) |
| `/` | landing: orbit → Enter Campus → cloud layer + role cards → dive through the clouds → `/campus` (first person) |
| `/campus/:id` | 3D room with stations (`?station=<id>` opens one): `entry` `faculty` `library` `arena` `union` `dorm` `plan` `data` `lounge` |
| `/map` | teacher 2D top-down map |
| `/student/*`, `/teacher/*` | original app, untouched |

## File map

- `src/data/buildings.ts`: the 9 buildings (positions traced from the SPU map), palette, avenues, MRT line, car parks, pond.
- `src/data/interiors.ts`: what is inside each building: room size + dressing, and its stations (kind, position, roles,
  which feature they open). `src/data/teacherCommands.ts`: the six teacher commands (Command Deck + Staff Lounge).
- `src/pages/campus/Campus3D.tsx`: scene, camera follow, intro swoop, door transition, HUD, projected labels.
- `src/pages/campus/components/`: `Building.tsx` (shapes + hover glow), `Ground.tsx` (paths, viaduct + train, car parks, pond), `Avatar3D.tsx`.
- `src/pages/campus/geometry.ts`: `doorPoint`, `facingPlaza`, `labelHeight`.
- `src/pages/campus/BuildingInterior.tsx`: hosts a building's 3D room, its station menu, the lock card, the hologram panel.
- `src/pages/campus/interior/`: `InteriorScene.tsx` (room shell, station props, camera glides, projected name tags),
  `RoomDressing.tsx` (per-room set pieces), `HoloPanel.tsx`, `contentRegistry.tsx` (feature key → lazy component).
- `src/pages/campus/interiors/*`: the campus room contents (GateRoom, FacultyHall, Arena, HeartDorm) shown on panels.
- `src/pages/campus/components/CommandMenu.tsx` (RPG command box), `HoloPreview.tsx` (live shrunken page preview),
  `TeacherCommandDeck.tsx` (the teacher's menu on the campus).
- `src/pages/campus/CampusMap2D.tsx`: teacher map (SVG).
- `src/pages/create/CharacterCreate.tsx`.

## Decisions already made (don't undo)

- **No drei `<Html>`** anywhere: it dropped a label at random under React 19, and (28 Oct) the NPC nametags' `<Html>`
  threw "Failed to execute 'removeChild'" every time you left the campus. Labels are plain DOM projected each frame
  (`place()` in `Campus3D.tsx`, `LabelProjector` in `InteriorScene.tsx`) or canvas textures on a drei `<Billboard>`.
- The campus starts in **first person** (the user's choice, 28 Oct). The landing dive ends exactly on that pose, so
  a third-person default brings back the "lands, then spins again" double move.
- Never edit `src/pages/student/*` or `src/pages/teacher/*`; rooms and previews render those pages as they are.
- No model, texture or HDR files. Everything is procedural so nothing can 404 on stage.
- three.js is lazy-loaded (campus routes only); the original app's bundle is unaffected.
- Leaderboard classmates' XP is deterministic and capped near the demo student's XP, so the rank climbs on camera.
- Still **TODO with the team**: dorm = bldg 6?, planning room = bldg 5?, arena = lawn by the pond? (marked in `buildings.ts`).

## Next (Phase 6: "real SPU, urban, wow"; user-approved)

The user picked a realistic, textured look in a **modern-university urban style, no trees**. It must read as the real SPU
(MRT, real layout), be grand, have "wow" effects, and **work on mobile**. Ship each item on its own: commit, push, tick it here.

- [x] 1. Urban realism: remove trees; procedural CanvasTextures (paving, asphalt, glass window grid); buildings
      become modern glass/concrete towers with PBR (`meshPhysicalMaterial`) plus accent-colour fins/signs; add context
      towers for SPU bldgs 2/3/4/7/8/10/12; lit MRT train + Exit 2 canopy; roads, lamps, parked cars,
      reflective pond; drei `Sky` (golden hour) + `Environment` from `Lightformer`s; `@react-three/postprocessing`
      (Bloom, AO, Vignette) disabled on mobile.
- [x] 2. Grand opening page at `/`: cinematic orbit, title "ClassLoop Campus", Start → `/login`;
      buildings rise in sequence, windows light up, train passes.
- [x] 3. Arrival after `/create`: fog-to-clear descent following the train into Exit 2,
      caption "กำลังลงสู่แคมปัส…", **Skip arrival** pill.
- [x] 4. Minimap bottom-right (extract the SVG from `CampusMap2D.tsx` into a shared component; live avatar dot; tap to walk).
- [x] 5. WASD/arrows + touch joystick; "เข้าอาคาร" prompt (E / tap) near doors.
- [x] 6. Modern-uni interiors (back pill, accent hero band, dark glass lesson cards) + 390px mobile audit.
- [x] Lite mode: `src/pages/campus/lowPower.ts` (phones, small screens, GPU-less → no postprocessing; `?hq` / `?lite`).
- Parallel split (27 Oct): **Antigravity** did steps 3–5 in `Campus3D.tsx`; **Claude** did lite mode, step 2
  (`src/pages/landing/Landing.tsx`, `/` route) and step 6 (`BuildingInterior.tsx`, `interiors/*`). On phones the
  campus HUD buttons are icon-only (labels from `sm:` up).
- [x] 7. Extra wow: holographic SPU logo, light-trail cars, 4-time-of-day sky (morning, midday, sunset, night stars) + thin drifting clouds.
- [x] 8. SPU Universe Login & Art: 3D bird's-eye login screen with 4DX swoop landing, academic crosshair-free camera, and high-res SPU Universe diorama backgrounds (`public/spu/{morning,midday,sunset,night}.jpg`).

## Phase 7: inside matches outside (28 Oct, user-approved)

Every feature has a home building. Walking in lands in a 3D room in that building's colours; stations open the
feature on a hologram panel. Teachers mostly don't walk: the **Command Deck** (top-left on the campus) lists every
tool as RPG text boxes; hovering one projects a live preview of the real page and lights up its building.

| Building | Student stations | Teacher stations |
|---|---|---|
| Gate · MRT Exit 2 | Today's plan, wardrobe | (locked) |
| Library (new) | Review desk, syllabus shelf | (locked) |
| Faculty Hall | Lecture screen, quest board | Live class console |
| Arena | Battle screen (Brain Gym, Boss Rush, leaderboard), challenge kiosk | (locked) |
| Student Union (new) | Community board, profile kiosk | (locked) |
| Wellness Lounge (dorm) | Anonymous corner | Anonymous corner, student voice |
| Planning Studio | (locked) | Lesson design desk, exam builder |
| Data Center | (locked) | Analytics wall, roster files |
| Staff Lounge (new) | (locked: "Staff only") | All six commands as a wall of monitors |

Work split: **Claude** owns `data/interiors.ts`, `data/teacherCommands.ts`, `interior/*`, `BuildingInterior.tsx`,
the Command Deck. **Antigravity** owns exteriors (`Building.tsx`: proper shapes for Library / Union / Staff Lounge,
which reuse `hall` / `hub` / `office` for now), NPCs, and the games inside room contents (`interiors/*`). To split a
room's content into more stations, export the section as its own component, add a `ContentKey` in
`contentRegistry.tsx` and a station in `interiors.ts`.

## Verify before each push

`npm run build && npm run lint`, then click through: landing → Student → campus → enter each building → open a
station → Esc → back; landing → Faculty → hover every Command Deck item → open one; `/campus/lounge` as a student shows
the lock. Watch the console: the target is **0 page errors**. Also check `/student` and `/teacher/dashboard` still work.
A headless browser renders without a GPU (~11 fps), so check **60 fps on the real filming laptop**.

## Deploy

Vercel project `classloop-gamified` builds **`main` → https://classloop-gamified.vercel.app** (add `?hq` on the
filming laptop). Several agents push here (Antigravity, Claude sessions): always fetch + merge first, never force.
