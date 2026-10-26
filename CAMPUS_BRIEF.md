# ClassLoop 3D Campus — Claude Code Brief (Brownfield)

_Hand this to Claude Code to add a 3D campus demo onto the existing ClassLoop MVP — without breaking what already works._

## Context & goal

This build adds a 3D campus demo to the existing ClassLoop MVP for a 6-minute talk at the Global ESG Leadership Forum (ESGIN / UN WFIF 2026), 4–5 November 2026.

The single hard constraint: **conference wifi is unreliable, so the demo will be shown as a pre-recorded video, not live.** Everything below optimises for "films well" over "every button works".

- Student side: a playful 3D campus the student walks through as a character.
- Teacher side: the same campus seen as a calm 2D top-down map / dashboard — teachers are the system's caretakers, not players (they skew low-tech, so keep it simple).
- Approach confirmed: **brownfield** — add the 3D campus onto a copy of the existing repo, never rebuild from scratch, never break the two months of work already in it.

## The existing codebase

Repo: this is a copy of **ClassLoop-MVP-LearnHack-submission**. Work here, never on the original.

| Tool | Version | Note |
|---|---|---|
| React | ^19.2.8 | R3F needs v9+ because of React 19 |
| Vite | ^8.2.0 | build tool |
| TypeScript | ~6.0.2 | |
| react-router-dom | ^7.18.2 | routing already set up |
| tailwindcss | ^3.4.19 | + tailwindcss-animate |
| recharts | ^3.10.1 | teacher charts already use this |
| lucide-react | ^1.31.0 | icon set |
| cva + clsx + tailwind-merge | — | shadcn/ui pattern |
| oxlint | ^1.75.0 | linter (not eslint) |

Already built in `src/` — **do not rebuild these**:

- `pages/Login.tsx` — role-selection login already exists.
- `pages/student/` — student pages.
- `pages/teacher/` — teacher dashboard ("Learning Studio").
- `context/` — global state is **React Context**, not zustand. Reuse this pattern; do not add zustand.
- `components/`, `hooks/`, `lib/`, `data/`, `assets/` — existing UI, hooks, utils, mock data.

The missing piece is only the **3D campus layer for students**.

## Approach: add 3D as a new route

- New page `pages/campus/Campus3D.tsx` at route `/campus`.
- Login: after role select, a student goes to `/create` → `/campus` (3D); a teacher goes to the existing teacher Studio (or a 2D top-down map later).
- Read role + user from the **existing React Context**; don't create a parallel store.

Why: ~8 days and two months of working code. A separate route keeps the upside (3D) while capping the downside (existing demo still works).

Install only what's missing for 3D (Phase 2):

```bash
npm i three @react-three/fiber@^9 @react-three/drei
npm i -D @types/three
npm i @react-three/postprocessing   # optional, for glow/bloom
```

Do **not** reinstall recharts, lucide, tailwind or a state library.

## Files to add vs off-limits

| Add (new) | Off-limits (don't edit unless asked) |
|---|---|
| `pages/campus/Campus3D.tsx` — 3D scene | `pages/Login.tsx` — reuse, only add a redirect |
| `pages/campus/components/` — Building, Avatar, Ground | `pages/student/*` |
| `pages/campus/CampusMap2D.tsx` — teacher top-down | `pages/teacher/*` |
| `data/buildings.ts` — the 6 buildings config | `context/*` — read from it, don't rewrite it |
| `pages/create/CharacterCreate.tsx` — avatar picker | `lib/*`, `hooks/*` — shared |

Rule of thumb: **new feature → new folder.** Wire into the existing app at exactly two seams: the router and the login redirect.

## The 6 campus buildings

Config lives in `src/data/buildings.ts`. Inside each building is plain 2D UI, not 3D.

| id | Building | SPU ref | Student sees | Teacher sees |
|---|---|---|---|---|
| entry | Gate 🚪 | MRT Exit 2 | login + pick role + character | — |
| faculty | Faculty hall 🏫 | bldg 1/5/9/11 | lessons, pre-class video, quiz, graded test | — |
| arena | Arena 🏆 | activity plaza | word/quiz games, leaderboard, points | — |
| dorm | Heart dorm 💬 | dormitory | talk to teacher, anonymous | read feedback, names hidden |
| data | Data & research hub 📊 | bldg 9 (to confirm) | — | student stats, charts, research store |
| plan | Lesson planning room 🗺️ | faculty/office | — | drop in syllabus → AI suggests activities → teacher picks |

Palette: sky `#3A3D7A`, grass `#7FB069`, path `#F2C879`, SPU pink `#E89BC4`, dorm teal `#4FB0A5`, data orange `#F2994A`, faculty blue `#7C9BE8`, entry red `#F25F5C`. Fonts: Fredoka (UI) + Sarabun (Thai).

## Build phases

Do these in order and check each before the next.

1. **Wire-up (day 1).** Routes for `/campus` and `/create`; role → destination redirect in login. Nothing 3D. ✅ done
   - Check: student lands on `/create` → `/campus`, teacher lands on Studio, existing pages still work.
2. **Character create (day 1–2).** Colour + hat + nickname, spinning 3D preview (OrbitControls + capsule+sphere character). Save to Context. ✅ done
3. **3D campus — the heart (day 2–4).** Ground + 6 low-poly buildings + warm lighting; click-to-walk avatar; hover → glow + label; click → open its 2D view. Check: 60fps on desktop. ✅ done
4. **Building interiors — 2D (day 4–5).** faculty + arena (student), data + plan (teacher, reuse existing charts), dorm (both, anonymous feedback). ✅ done (teacher rooms reachable at /campus/data, /campus/plan, /campus/dorm until the phase 5 map)
5. **Teacher 2D map + polish (day 5–6).** Top-down map; transitions; colour/light/label polish for filming.
6. **Optional.** Real working buttons, mobile responsive, QR-scan access.

Ready to film when: login → role → (student: create) → campus works with no errors; 3D campus at ≥60fps; all 6 buildings open with film-ready content; teacher map shows data + plan; dorm shows anonymous feedback clearly; no white screens on the filmed path.

## Scope guardrails

Don't build now: backend/database/real auth; mobile responsive; every lesson real (2–3 mock ones); multiplayer; NFT business card; test suite/CI; all 12 buildings; inside-building 3D.

Fallback: if Phase 3 isn't solid by day 4, film the existing app plus the 2D campus map mockup instead. 3D is the upside; a working 2D demo is the floor.
