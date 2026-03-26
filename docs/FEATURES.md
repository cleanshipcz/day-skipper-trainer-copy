# Day Skipper Trainer — Feature Discovery & Prioritised Backlog

> Generated 2026-03-26 | Covers full RYA Day Skipper Theory syllabus (SBT DS 03)

---

## 1. Product Understanding

**What it is:** An interactive web application for RYA Day Skipper sailing certification theory training, built with React/TypeScript/Vite, shadcn-ui, Tailwind CSS, and Supabase.

**Who it serves:** Aspiring Day Skipper candidates studying for the RYA theory exam — both self-study learners and those supplementing a shore-based or online course.

**Core value proposition:** Gamified, interactive training (not just reading) — boat diagrams, calculators, drills, quizzes, points, and progress tracking replace static textbooks.

**Current label:** "Chapter 1: Seamanship & Preparation" — implying the app was designed to expand to additional chapters.

---

## 2. RYA Day Skipper Theory Syllabus — Coverage Map

The official RYA Day Skipper Shorebased syllabus (SBT DS 03) contains **13 subject areas**. The table below maps each against current app coverage.

> **Verification basis:** Status is derived from registered routes in `src/app/routes.tsx` and the page components they reference. A syllabus area is "Complete" when it has at least one theory page with interactive content AND a quiz route. "Partial" means some sub-topics are covered but documented gaps remain.

| # | Syllabus Area | Status | Current Implementation | Gap |
|---|--------------|--------|----------------------|-----|
| 1 | **Nautical Terms** | ✅ Complete | Interactive boat diagram (20+ parts), sail controls (11 lines), 20-question quiz | — |
| 2 | **Ropework** | ✅ Complete | 7 knots with steps, discovery mechanic, quiz | — |
| 3 | **Anchorwork** | ✅ Complete | 5 theory topics, anchor minigame (scope calc, positioning), quiz | — |
| 4 | **Safety** | ⚠️ Partial | MOB theory (5 tabs), MOB sorting game, MOB quiz | Fire safety, life rafts, flares/pyrotechnics, personal safety equipment, abandon ship, gas safety |
| 5 | **International Regulations (COLREGs)** | ✅ Complete | Part B steering rules, Part C lights/shapes, Part D sounds, 20+ COLREGs questions, 20 lights-signals questions | — |
| 6 | **Definition of Position, Charts** | ✅ Complete | Charts theory (3 tabs), chart symbol quiz, virtual chart plotter (4 challenges), tidal visualiser | — |
| 7 | **Compass** | ✅ Complete | Three Norths theory, CADET converter, deviation drill (8 headings) | — |
| 8 | **Tides** | ✅ Complete | Tidal theory, heights theory, heights calculator, streams theory, vector triangle tool | — |
| 9 | **Position Fixing** | ✅ Complete | Theory page, unified chart table with plotting tools | — |
| 10 | **Course to Steer** | ✅ Complete | Vector triangle theory, vector solution tool (solver + drill modes) | — |
| 11 | **Pilotage** | ❌ Missing | — | IALA buoyage system, transits, leading lines, clearing bearings, pilotage plans, harbour entry |
| 12 | **Meteorology** | ❌ Missing | — | Weather systems, pressure, fronts, Beaufort scale, sea state, fog, sea breezes, sources of forecasts |
| 13 | **Passage Planning** | ❌ Missing | — | PREPARE mnemonic, waypoint planning, fuel/water calcs, tidal gate planning, checklists, contingencies |

**Coverage: 10/13 complete, 1 partial, 2 entirely missing.**

---

## 3. Discovered Opportunities

### Theme A — Syllabus Completion (Critical Path)

#### A1. Pilotage Module
**Description:** Full pilotage training covering IALA buoyage (Region A), transits & leading lines, clearing bearings, pilotage planning, and harbour approach.

**Rationale:** Pilotage is a mandatory exam topic and a core Day Skipper practical skill. It is the single largest syllabus gap. Without it, the app cannot claim full syllabus coverage.

**Implementation notes:**
- New route `/pilotage` with menu page
- **Submodules:**
  - `/pilotage/buoyage` — IALA Region A buoy types (lateral, cardinal, isolated danger, safe water, special marks) with interactive buoy identifier quiz
  - `/pilotage/transits` — Theory + interactive harbour chart showing transit lines, with drag-to-align exercise
  - `/pilotage/clearing-bearings` — Theory + chart exercise where user plots clearing bearings to avoid hazards
  - `/pilotage/plan` — Step-by-step pilotage plan builder (waypoints, headings, distances, tidal offsets) — practice tool
  - `/quiz/pilotage` — 20-question pilotage quiz
- New data file: `src/data/ialabuoys.ts` (buoy definitions, characteristics, top marks, colours)
- New data file: `src/data/quizzes/pilotage.ts` (quiz questions; see B3 for `quizzes/` directory structure)
- New components: `BuoyIdentifier.tsx`, `TransitExercise.tsx`, `ClearingBearingTool.tsx`, `PilotagePlanBuilder.tsx`

**Dependencies:** None (self-contained). Reuse existing `ModuleMenuPage` template, `CompletionBadge`, quiz infrastructure, and progress persistence.

**Estimated impact:** 🔴 Critical — blocks "full syllabus" claim
**Estimated effort:** Large (5–8 days) — multiple interactive tools

---

#### A2. Meteorology Module
**Description:** Weather theory covering pressure systems, fronts (warm/cold/occluded), Beaufort scale, sea state, fog formation, land/sea breezes, and how to obtain and interpret shipping forecasts.

**Rationale:** Meteorology is a mandatory exam topic. Weather judgement is arguably the most safety-critical skill for a Day Skipper.

**Implementation notes:**
- New route `/weather` with menu page
- **Submodules:**
  - `/weather/systems` — High/low pressure, isobars, wind direction (Buys Ballot's law), frontal systems with interactive synoptic chart reader
  - `/weather/beaufort` — Beaufort scale interactive reference (wind speed ↔ sea state ↔ description), with "guess the force" drill
  - `/weather/forecasts` — How to obtain forecasts (Navtex, VHF Coastguard, online), interpreting shipping forecast areas with interactive map
  - `/weather/fog` — Advection/radiation fog theory, visibility estimation
  - `/quiz/weather` — 20-question meteorology quiz
- New data files: `src/data/beaufortScale.ts`, `src/data/forecastAreas.ts`, `src/data/quizzes/weather.ts`
- New components: `SynopticChartReader.tsx`, `BeaufortDrill.tsx`, `ForecastAreaMap.tsx`

**Dependencies:** None.

**Estimated impact:** 🔴 Critical — blocks "full syllabus" claim
**Estimated effort:** Large (5–8 days)

---

#### A3. Passage Planning Module
**Description:** End-to-end passage planning training covering the PREPARE mnemonic, waypoint selection, distance/time/fuel calculations, tidal gate identification, contingency planning, and pre-departure checklists.

**Rationale:** Passage planning is the capstone Day Skipper skill that integrates navigation, tides, weather, and pilotage. It is a mandatory exam topic and the culminating practical exercise.

**Implementation notes:**
- New route `/passage-planning` with menu page
- **Submodules:**
  - `/passage-planning/prepare` — PREPARE mnemonic theory (Passage appraisal, Regulations, Equipment, Passage plan, Alternatives, Revise, Execute)
  - `/passage-planning/calculator` — Distance/time/fuel calculator (inputs: distance, SOG, fuel rate; outputs: ETA, fuel required, reserve)
  - `/passage-planning/builder` — Interactive passage plan builder: enter waypoints, leg distances, tidal gates, ETAs, weather windows — generates printable passage plan
  - `/passage-planning/checklist` — Pre-departure checklist (crew brief, safety equipment, comms check, weather, engine, nav lights)
  - `/quiz/passage-planning` — 20-question passage planning quiz
- New data files: `src/data/prepareSteps.ts`, `src/data/quizzes/passagePlanning.ts`, `src/data/preDepartureChecklist.ts`
- New components: `PassagePlanBuilder.tsx`, `FuelCalculator.tsx`, `PreDepartureChecklist.tsx`

**Dependencies:** Benefits from A1 (Pilotage) and A2 (Meteorology) being available, since passage planning references both. Can be built independently but cross-links should be added once all three exist.

**Estimated impact:** 🔴 Critical — blocks "full syllabus" claim
**Estimated effort:** Large (5–8 days)

---

#### A4. Expand Safety Module
**Description:** Extend the existing Safety section beyond MOB to cover fire safety, life rafts, flares/pyrotechnics, personal safety equipment, gas safety, and abandon ship procedures.

**Rationale:** The RYA syllabus safety section covers far more than MOB. Fire is the #1 cause of incidents on pleasure craft. Flare identification is frequently examined.

**Implementation notes:**
- Extend existing `/safety` menu with new submodules:
  - `/safety/fire` — Fire triangle, types of extinguisher (dry powder, foam, CO2, fire blanket), fire prevention, engine room fires. Interactive: "match extinguisher to fire type" drill.
  - `/safety/life-raft` — Life raft deployment, SOLAS pack contents, abandon ship procedure. Interactive: step-ordering game (reuse `MOBSortingGame` pattern).
  - `/safety/flares` — Flare types (red parachute, red hand, orange smoke, white hand), when to use each, expiry dates. Interactive: "identify the flare" quiz.
  - `/safety/personal` — Life jackets (types, servicing, crotch straps), harnesses, tethers, jacklines, kill cords.
  - `/safety/gas` — LPG safety (heavier than air, isolation valves, bilge sniff), carbon monoxide awareness.
  - `/quiz/safety` — Comprehensive 20-question safety quiz (combining all sub-topics)
- New data files: `src/data/fireExtinguishers.ts`, `src/data/flareTypes.ts`, `src/data/quizzes/safety.ts`
- Update `Index.tsx` submoduleIds for safety topic

**Dependencies:** None. Extends existing module.

**Estimated impact:** 🟠 High — fills examined syllabus content
**Estimated effort:** Medium (3–5 days)

---

### Theme B — Learning Effectiveness

#### B1. Spaced Repetition Review System
**Description:** Implement a spaced repetition algorithm (SM-2 or Leitner) for quiz questions. Track per-question difficulty; resurface weak questions at increasing intervals.

**Rationale:** Learners currently take quizzes once and move on. Spaced repetition is proven to improve long-term retention — critical for exam preparation. Questions answered incorrectly should return more frequently.

**Implementation notes:**
- New Supabase table: `question_reviews` (user_id, question_id, ease_factor, interval_days, next_review_at, repetitions)
- New feature module: `src/features/spaced-repetition/`
- New page: `/review` — daily review session pulling due questions across all topics
- Dashboard widget showing "X questions due for review"
- Algorithm: SM-2 (SuperMemo 2) — well-documented, simple to implement

**Dependencies:** Requires extracting quiz questions from `Quiz.tsx` into separate data files (currently inline).

**Estimated impact:** 🟠 High — dramatically improves retention
**Estimated effort:** Medium (3–4 days)

---

#### B2. Exam Simulation Mode
**Description:** Timed mock exam combining questions from all syllabus areas, matching RYA exam format (typically 48 questions, 100 minutes, ~65% pass mark).

**Rationale:** Candidates need to practice under exam conditions. Currently there is no way to simulate the actual exam experience — quizzes are per-topic only.

**Implementation notes:**
- New route: `/exam`
- Draws questions proportionally from all quiz banks (weighted by syllabus importance)
- Timer countdown (100 minutes default, configurable)
- No explanations shown during exam (only at end)
- Results page: overall %, per-topic breakdown, pass/fail verdict
- Save exam results to new `exam_results` Supabase table
- History page: `/exam/history` showing past attempts with trend graph

**Dependencies:** Benefits from A1–A4 being complete (fuller question bank). Can launch with existing questions.

**Estimated impact:** 🟠 High — directly prepares for exam
**Estimated effort:** Medium (3–4 days)

---

#### B3. Extract Quiz Data to Separate Files
**Description:** Refactor quiz questions out of the 900+ line `Quiz.tsx` component into separate data files per topic (e.g., `src/data/quizzes/nauticalTerms.ts`).

**Rationale:** `Quiz.tsx` is the largest file in the codebase (~900 lines) mixing data and UI. This blocks contributors from adding questions easily and makes B1/B2 harder to implement. It also means all quiz data is loaded even when only one topic is accessed.

**Implementation notes:**
- Create `src/data/quizzes/` directory
- One file per topic: `nauticalTerms.ts`, `colregs.ts`, `lightsSignals.ts`, `safetyMob.ts`, etc.
- Export shared `Question` interface from `src/data/quizzes/types.ts`
- `Quiz.tsx` imports lazily or uses a registry pattern
- No user-facing change

**Dependencies:** None. Enables B1, B2, and easier question expansion.

**Estimated impact:** 🟡 Medium — developer experience, enables other features
**Estimated effort:** Small (1 day) — pure refactor

---

### Theme C — Engagement & Gamification

#### C1. Achievement Badges System
**Description:** Award visual badges for learning milestones (e.g., "First Quiz Passed", "Navigation Master", "Full Syllabus Complete", "Perfect Score", "7-Day Streak").

**Rationale:** The points system exists but has no tangible rewards. Badges provide visual motivation and a sense of accomplishment. Common in successful e-learning platforms.

**Implementation notes:**
- New Supabase table: `user_badges` (user_id, badge_id, earned_at)
- Badge definitions in `src/data/badges.ts` with unlock conditions
- Profile section showing earned badges
- Toast notification on badge unlock
- Badge types: per-topic completion, quiz milestones, points thresholds, streaks

**Dependencies:** None.

**Estimated impact:** 🟡 Medium — increases engagement
**Estimated effort:** Small (2 days)

---

#### C2. Learning Streak Tracker
**Description:** Track daily login/study streaks. Show current streak on dashboard. Bonus points for maintaining streaks.

**Rationale:** Consistency is key for exam preparation. A streak mechanic encourages daily study habits — proven effective in Duolingo, Anki, etc.

**Implementation notes:**
- New Supabase column or table tracking daily activity timestamps
- Dashboard widget: "🔥 X day streak"
- Streak bonus: +5 points per day maintained
- Streak freeze: optional "day off" mechanic

**Dependencies:** None.

**Estimated impact:** 🟡 Medium
**Estimated effort:** Small (1–2 days)

---

### Theme D — Quality of Life & UX

#### D1. Offline / PWA Support
**Description:** Make the app installable as a PWA with offline access to theory content and quizzes.

**Rationale:** Many Day Skipper students study on boats or in areas with poor connectivity. Offline access to theory and quizzes (with sync-on-reconnect for progress) would significantly increase usability.

**Implementation notes:**
- Vite PWA plugin (`vite-plugin-pwa`)
- Service worker for caching theory pages and quiz data
- IndexedDB for offline progress queue
- Sync progress to Supabase on reconnect
- Manifest.json for install prompt

**Dependencies:** B3 (quiz data extraction) makes caching cleaner.

**Estimated impact:** 🟠 High — unlocks mobile/offline study
**Estimated effort:** Medium (2–3 days)

---

#### D2. Mobile-First Responsive Audit
**Description:** Audit and fix all interactive tools (chart plotter, vector triangle, compass converter, tidal visualiser) for touch/mobile usability.

**Rationale:** Many components use SVG canvas interactions (click, drag) that may not work well on mobile/touch. Day Skipper students often study on phones/tablets.

**Implementation notes:**
- Audit each interactive component for touch events
- Add touch handlers where missing (onTouchStart/Move/End)
- Test viewport breakpoints for all tools
- Ensure chart plotter and vector triangle are usable at 375px width

**Dependencies:** None.

**Estimated impact:** 🟡 Medium
**Estimated effort:** Medium (2–3 days)

---

#### D3. Progress Export / Certificate
**Description:** Allow users to export their progress as a PDF summary showing topics completed, quiz scores, and total study time.

**Rationale:** Useful as a study log or to show an instructor. Provides a tangible output from study efforts.

**Implementation notes:**
- Client-side PDF generation (e.g., `jsPDF` or `@react-pdf/renderer`)
- Summary page: topic completion, quiz scores per topic, total points, study duration
- Branded with "RYA Day Skipper Training Log" header
- Button on dashboard: "Export Progress Report"

**Dependencies:** None.

**Estimated impact:** 🟢 Low–Medium
**Estimated effort:** Small (1–2 days)

---

#### D4. VHF/DSC Radio Procedure Trainer
**Description:** Interactive VHF radio procedure trainer covering Mayday, Pan Pan, and Sécurité calls with step-by-step guided practice.

**Rationale:** While VHF is technically a separate RYA course (SRC), Day Skipper candidates are expected to understand distress procedures. The MOB theory page already references Mayday calls — a dedicated trainer would reinforce this.

**Implementation notes:**
- New submodule under `/safety/vhf`
- Interactive "fill in the blanks" Mayday/Pan Pan call builder
- Audio playback of example calls (optional enhancement)
- Covers: Mayday format, Pan Pan format, DSC button procedure, Channel 16 protocol

**Dependencies:** A4 (Safety expansion).

**Estimated impact:** 🟡 Medium
**Estimated effort:** Small (2 days)

---

### Theme E — Technical Debt & Architecture

#### E1. Quiz Data Monolith in Quiz.tsx *(problem statement — see B3 for solution)*
**Description:** `Quiz.tsx` is ~900 lines combining question data, quiz logic, and rendering. This should be decomposed.

**Location:** `src/pages/Quiz.tsx:36-828` (quiz data), `src/pages/Quiz.tsx:870-end` (component)

**Impact:** Blocks easy question expansion, code splitting, and features B1/B2.

> **Note:** E1 is the problem observation; B3 (§3, Theme B) is the actionable solution. They are tracked as a single deliverable in `docs/FEATURE_TASKS.md` → story E0-S1.

---

#### E2. Missing Quizzes for Existing Topics
**Description:** Several topics that have theory pages lack dedicated quizzes:
- Victualling quiz: only 5 questions (should be 10–15)
- Engine quiz: only 5 questions
- Rig quiz: only 5 questions
- Anchorwork quiz: only 5 questions
- Ropework quiz: only 5 questions
- Safety MOB quiz: only 5 questions

Most quizzes have just 5 questions vs. 20 for nautical terms and lights-signals.

**Rationale:** 5 questions is too few to adequately assess knowledge. Minimum 10–15 per topic for meaningful assessment.

**Estimated effort:** Small (1–2 days) — content creation, no new infrastructure.

---

#### E3. Hardcoded Progress Keys
**Description:** Progress tracking uses string-based topic IDs scattered across pages. A single source of truth for all topic/submodule IDs would prevent mismatches and simplify dashboard completion logic.

**Location:** `src/pages/Index.tsx:40-135` (topic definitions with submoduleIds), individual theory pages (hardcoded strings passed to `useTheoryCompletionGate`)

**Recommended:** Create `src/constants/topicRegistry.ts` with all topic IDs, hierarchy, and metadata as a single source of truth.

---

## 4. Prioritised Backlog

### Tier 1 — Must-Have (Syllabus Completion)
*Without these, the app cannot cover the full RYA Day Skipper syllabus.*

| Priority | Feature | Theme | Impact | Effort | Quick Win? |
|----------|---------|-------|--------|--------|------------|
| **P1** | B3. Extract Quiz Data to Separate Files | Tech Debt | Medium | 1 day | ✅ |
| **P2** | E2. Expand Existing Quizzes to 10–15 Questions | Content | High | 1–2 days | ✅ |
| **P3** | A4. Expand Safety Module (fire, flares, life raft, gas) | Syllabus | High | 3–5 days | |
| **P4** | A1. Pilotage Module (IALA buoyage, transits, clearing bearings) | Syllabus | Critical | 5–8 days | |
| **P5** | A2. Meteorology Module (weather systems, Beaufort, forecasts) | Syllabus | Critical | 5–8 days | |
| **P6** | A3. Passage Planning Module (PREPARE, calculator, builder) | Syllabus | Critical | 5–8 days | |

### Tier 2 — Should-Have (Learning Effectiveness)
*High value for exam preparation once syllabus is complete.*

| Priority | Feature | Theme | Impact | Effort | Quick Win? |
|----------|---------|-------|--------|--------|------------|
| **P7** | B2. Exam Simulation Mode | Learning | High | 3–4 days | |
| **P8** | B1. Spaced Repetition Review System | Learning | High | 3–4 days | |
| **P9** | D1. Offline / PWA Support | UX | High | 2–3 days | |

### Tier 3 — Nice-to-Have (Engagement & Polish)
*Improves engagement and user experience.*

| Priority | Feature | Theme | Impact | Effort | Quick Win? |
|----------|---------|-------|--------|--------|------------|
| **P10** | C1. Achievement Badges System | Gamification | Medium | 2 days | |
| **P11** | C2. Learning Streak Tracker | Gamification | Medium | 1–2 days | ✅ |
| **P12** | D4. VHF Radio Procedure Trainer | Safety | Medium | 2 days | |
| **P13** | D2. Mobile-First Responsive Audit | UX | Medium | 2–3 days | |
| **P14** | D3. Progress Export / Certificate | UX | Low–Med | 1–2 days | ✅ |
| **P15** | E3. Topic Registry Refactor | Tech Debt | Low | 1 day | ✅ |

### Quick Wins Summary
These can each be completed in ≤2 days with immediate value:

1. **B3** — Extract quiz data to separate files (1 day, unblocks B1/B2)
2. **E2** — Expand all 5-question quizzes to 10–15 (1–2 days, immediate learning value)
3. **C2** — Learning streak tracker (1–2 days, engagement boost)
4. **D3** — Progress export PDF (1–2 days, tangible user output)
5. **E3** — Topic registry refactor (1 day, reduces bugs)

---

## 5. Top Recommendations

### Estimation Methodology

Effort estimates in this document use **T-shirt sizing** (Small / Medium / Large) with indicative day ranges for high-level planning. These are top-down product estimates.

For **engineering execution**, use the bottom-up story-level estimates in `docs/FEATURE_TASKS.md`, which break each feature into individually-estimable stories. One dev-day = ~6 productive hours. Where this document and FEATURE_TASKS.md diverge, FEATURE_TASKS.md is authoritative for scheduling.

### Build Next (in order):

1. **B3 + E2: Refactor quiz data & expand question banks** (2–3 days)
   *Why first:* Low risk, immediate quality improvement, unblocks exam simulation and spaced repetition. Every existing topic benefits from more questions.

2. **A4: Expand Safety Module** (3–5 days)
   *Why second:* Extends an existing module (lower effort than greenfield). Fire safety and flares are heavily examined topics. Reuses existing patterns (sorting game, checklists, quiz infrastructure).

3. **A1: Pilotage Module** (5–8 days)
   *Why third:* Largest syllabus gap. IALA buoyage is one of the most visual/interactive topics — plays to the app's strengths. Buoy identification quiz will be a high-engagement feature.

4. **A2: Meteorology Module** (5–8 days)
   *Why fourth:* Weather is the most safety-critical knowledge area. Synoptic chart reading and Beaufort scale are excellent candidates for interactive tools.

5. **A3 + B2: Passage Planning + Exam Simulation** (11–12 days)
   *Why last:* Passage planning is the capstone that ties everything together — it benefits from all other modules existing first. Exam simulation requires a full question bank to be meaningful.

### Estimated Total to Full Syllabus Coverage: **28–33 dev-days**

> Estimate basis: bottom-up story-level estimates in `docs/FEATURE_TASKS.md` (Phases 0–4). One dev-day = ~6 productive hours. Includes foundation refactors (E0), safety expansion, and three greenfield modules. See `docs/FEATURE_TASKS.md` § Effort Summary for the full breakdown.

### Outcome
After completing Tier 1 (P1–P6), the app will cover **all 13 RYA Day Skipper theory syllabus areas** with interactive training, quizzes, and progress tracking — a complete end-to-end exam preparation platform.

---

## Appendix: New Route Structure (Post-Implementation)

```
/ (Dashboard — all 13 topics)
├── /nautical-terms          ✅ exists
├── /ropework                ✅ exists
├── /anchorwork              ✅ exists
├── /victualling             ✅ exists
├── /engine                  ✅ exists
├── /rig                     ✅ exists
├── /rules-of-the-road       ✅ exists
├── /navigation              ✅ exists
├── /safety                  ✅ exists (expand submodules)
│   ├── /safety/mob          ✅ exists
│   ├── /safety/fire         🆕 NEW
│   ├── /safety/life-raft    🆕 NEW
│   ├── /safety/flares       🆕 NEW
│   ├── /safety/personal     🆕 NEW
│   └── /safety/gas          🆕 NEW
├── /pilotage                🆕 NEW
│   ├── /pilotage/buoyage    🆕 NEW
│   ├── /pilotage/transits   🆕 NEW
│   ├── /pilotage/clearing   🆕 NEW
│   └── /pilotage/plan       🆕 NEW
├── /weather                 🆕 NEW
│   ├── /weather/systems     🆕 NEW
│   ├── /weather/beaufort    🆕 NEW
│   ├── /weather/forecasts   🆕 NEW
│   └── /weather/fog         🆕 NEW
├── /passage-planning        🆕 NEW
│   ├── /passage-planning/prepare     🆕 NEW
│   ├── /passage-planning/calculator  🆕 NEW
│   ├── /passage-planning/builder     🆕 NEW
│   └── /passage-planning/checklist   🆕 NEW
├── /review                  🆕 NEW (spaced repetition)
├── /exam                    🆕 NEW (mock exam)
└── /quiz/:topicId           ✅ exists (+ new topic quizzes)
```

---

## Appendix: New Database Tables Required

```sql
-- Spaced repetition (B1)
CREATE TABLE question_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  question_id TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE question_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews"
  ON question_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mock exam results (B2)
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  score INTEGER NOT NULL,
  percentage REAL NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  passed BOOLEAN NOT NULL,
  topic_breakdown JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exam results"
  ON exam_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievement badges (C1)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Learning streaks (C2)
CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actions_count INTEGER DEFAULT 1,
  UNIQUE(user_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own activity"
  ON daily_activity FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

> **RLS requirement:** Every new table containing user data MUST enable Row Level Security and define policies restricting access to `auth.uid() = user_id`. The existing `user_progress`, `quiz_scores`, and `profiles` tables follow this pattern.

---

## Appendix: New Data Files Required

```
src/data/
├── quizzes/                     # B3: Extracted from Quiz.tsx
│   ├── types.ts                 # Shared Question interface
│   ├── nauticalTerms.ts
│   ├── ropework.ts
│   ├── anchorwork.ts
│   ├── victualling.ts
│   ├── engine.ts
│   ├── rig.ts
│   ├── colregs.ts
│   ├── lightsSignals.ts
│   ├── safetyMob.ts
│   ├── pilotage.ts              # A1
│   ├── weather.ts               # A2
│   ├── passagePlanning.ts       # A3
│   └── safety.ts                # A4 (comprehensive)
├── ialabuoys.ts                 # A1: IALA buoy definitions
├── beaufortScale.ts             # A2: Beaufort scale data
├── forecastAreas.ts             # A2: UK shipping forecast areas
├── prepareSteps.ts              # A3: PREPARE mnemonic
├── preDepartureChecklist.ts     # A3
├── fireExtinguishers.ts         # A4: Extinguisher types
├── flareTypes.ts                # A4: Flare identification data
├── badges.ts                    # C1: Badge definitions
└── (existing files unchanged)
```
