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
| `/campus/:id` | 2D interior: `entry` `faculty` `arena` `dorm` `data` `plan` |
| `/map` | teacher 2D top-down map |
| `/student/*`, `/teacher/*` | original app, untouched |

## File map

- `src/data/buildings.ts`: the 6 buildings (positions traced from the SPU map), palette, MRT line, car parks, pond.
- `src/pages/campus/Campus3D.tsx`: scene, camera follow, intro swoop, door transition, HUD, projected labels.
- `src/pages/campus/components/`: `Building.tsx` (shapes + hover glow), `Ground.tsx` (paths, viaduct + train, car parks, pond), `Avatar3D.tsx`.
- `src/pages/campus/geometry.ts`: `doorPoint`, `facingPlaza`, `labelHeight`.
- `src/pages/campus/BuildingInterior.tsx` + `interiors/*`: 2D rooms; data/plan reuse the existing Dashboard/Studio.
- `src/pages/campus/CampusMap2D.tsx`: teacher map (SVG).
- `src/pages/create/CharacterCreate.tsx`.

## Decisions already made (don't undo)

- **No drei `<Html>`** for labels: it dropped a label at random under React 19, in production too. Labels are plain
  DOM, positioned each frame by projecting 3D points (`place()` in `Campus3D.tsx`).
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
- [ ] 2. Grand opening page at `/`: cinematic orbit, title "ClassLoop Campus", Start → `/login`;
      buildings rise in sequence, windows light up, train passes.
- [ ] 3. Arrival after `/create`: fog-to-clear descent following the train into Exit 2,
      caption "กำลังลงสู่แคมปัส…", **Skip arrival** pill.
- [ ] 4. Minimap bottom-right (extract the SVG from `CampusMap2D.tsx` into a shared component; live avatar dot; tap to walk).
- [ ] 5. WASD/arrows + touch joystick; "เข้าอาคาร" prompt (E / tap) near doors.
- [ ] 6. Modern-uni interiors (back pill, accent hero band, dark glass lesson cards) + 390px mobile audit.
- [ ] 7. Extra wow if time: holographic SPU logo, light-trail cars, confetti on level-up.

## Verify before each push

`npm run build && npm run lint`, then click through: student login → create → campus → enter faculty/arena/dorm →
back; teacher login → map → dorm/data/plan. Also check `/student` and `/teacher/dashboard` still work.
A headless browser renders without a GPU (~11 fps), so check **60 fps on the real filming laptop**.

## Deploy

Not set up yet. In Vercel: Add New → Project → `ClassLoop-Gamified` → Deploy (`vercel.json` already handles SPA routes).
Production builds `main` (the untouched copy); the campus is the **preview** deployment of `feat/3d-campus`.
