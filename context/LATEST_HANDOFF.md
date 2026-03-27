# Latest Handoff

Last updated: 2026-03-27

## What was completed this session

**Phase 2 — Living Map (complete)**

- `src/App.jsx` — All Phase 2 additions:
  - `gravesRef` (ref, array of grave objects from Supabase)
  - `showEpitaphModal` state + `epitaphDraft` state — controls epitaph input modal
  - `pendingGrave` state — holds {x, y, wave, faction, playerName} from the death event
  - `gravePopup` state — holds the grave clicked on the world map
  - `gravesTick` state — triggers WorldMapCanvas re-render when graves load
  - `fetchGraves()` — fetches up to 200 graves for current season from Supabase; graceful offline no-op
  - `submitGrave(epitaph)` — inserts grave row to Supabase then re-fetches; graceful offline no-op
  - `useEffect` — calls `fetchGraves()` on mount + every 5 minutes (interval)
  - Death handler (game loop): now sets `pendingGrave` and `showEpitaphModal=true` in addition to existing Phase 1 daily run hook
  - `WorldMapCanvas` — updated: accepts `graves`, `gravesTick`, `onGraveClick` props; renders ✝ markers in lavender for each grave; canvas click → hit-test graves → calls `onGraveClick(grave)`
  - World Map Modal: passes `graves`/`gravesTick`/`onGraveClick` to WorldMapCanvas; shows grave count in legend; shows grave popup card when a ✝ is clicked
  - Epitaph Modal: fullscreen overlay shown on death; 80-char text input; "Leave Epitaph" + "Skip" buttons; Enter submits, Escape skips
- Build: ✅ 326 KB JS, 99 KB gzipped

## What is mid-flight

- Supabase not wired up — Carter needs to:
  1. Create Supabase project at supabase.com (free tier)
  2. Run **both** SQL blocks in Supabase SQL editor:

  **Block 1 — daily_scores (Phase 1):**
  ```sql
  CREATE TABLE daily_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    wave_reached INTEGER NOT NULL,
    faction TEXT DEFAULT 'neutral',
    date_seed TEXT NOT NULL,
    season INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_daily_scores_date ON daily_scores(date_seed);
  CREATE INDEX idx_daily_scores_wave ON daily_scores(date_seed, wave_reached DESC);
  ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can read scores" ON daily_scores FOR SELECT USING (true);
  CREATE POLICY "Anyone can insert scores" ON daily_scores FOR INSERT WITH CHECK (true);
  ```

  **Block 2 — graves (Phase 2):**
  ```sql
  CREATE TABLE graves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_name TEXT NOT NULL,
    epitaph TEXT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    faction TEXT,
    wave_reached INTEGER,
    season INTEGER DEFAULT 1,
    date_seed TEXT,
    sunstone_offerings INTEGER DEFAULT 0,
    is_shrine BOOLEAN DEFAULT false,
    is_major_shrine BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_graves_position ON graves(x, y);
  CREATE INDEX idx_graves_season ON graves(season);
  ALTER TABLE graves ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Anyone can read graves" ON graves FOR SELECT USING (true);
  CREATE POLICY "Anyone can insert graves" ON graves FOR INSERT WITH CHECK (true);
  CREATE POLICY "Anyone can update offerings" ON graves FOR UPDATE USING (true) WITH CHECK (true);
  ```

  3. Copy Project URL + anon key → paste into `.env.local` (local dev) and GitHub Secrets (CI deploy)

## What to do next

1. **Carter action** — GitHub repo rename + Supabase setup (run both SQL blocks above)
2. **Phase 3** — Sun Phase Engine: `sun_state` table, `increment_death_counter()` Supabase function, sun brightness fetch on load, canvas desaturation filter

## Phase 3 first steps (next agent session)

Read `SOLARA_SUNFALL_HANDOFF/SOLARA_SUNFALL_HANDOFF/03_TECHNICAL/TECH_IMPLEMENTATION_PLAN.md` §3 (PHASE 3: SUN PHASE ENGINE).

Key SQL to run in Supabase (after Phases 1+2 SQL above):
- Create `sun_state` table (see TECH_IMPLEMENTATION_PLAN.md §3.1)
- Create `increment_death_counter()` function
- Also call `increment_death_counter()` from the death hook (wire into submitGrave)

Phase 3 game changes:
- `fetchSunState()` — fetch `brightness` + `total_deaths` from Supabase on load + every 5 min
- `sunBrightness` state (0–100, defaults to 100)
- Canvas filter: `saturate(X) sepia(Y)` driven by `sunBrightness`
- Call `supabase.rpc('increment_death_counter')` inside `submitGrave` (after grave insert)

## Constraints

- App.jsx is ~2479 lines — do NOT split until 5000 lines
- Supabase free tier: 500MB, 50k MAU — monitor usage dashboard
- Never destroy `dunescape_save` data — migration shim handles it

## Read these first next session

1. `AGENTS.md`
2. `context/LATEST_HANDOFF.md` (this file)
3. `context/SELF_IMPROVEMENT_LOOP.md` — check prior SIL commitments
4. `SOLARA_SUNFALL_HANDOFF/SOLARA_SUNFALL_HANDOFF/03_TECHNICAL/TECH_IMPLEMENTATION_PLAN.md` §3
