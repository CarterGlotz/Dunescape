Session Intent: Analyze why the game is not working and fix the problem

# Latest Handoff

Last updated: 2026-03-30

## Where We Left Off (Session 10)

- Shipped: 2 improvements across 2 groups — runtime stability, CI/smoke coverage
- Tests: 2 passing (1 build / 1 smoke / 0 server / 0 client) · delta: +1 this session
- Deploy: pending

## What was completed this session

**Runtime stabilization + smoke coverage**

- Fixed the startup-order boot crash in [`src/App.jsx`](C:\Users\p4cka\documents\development\solara\src\App.jsx) by moving the Supabase polling effects below `fetchGraves` / `fetchSunState`
- Added a repo-native smoke harness:
  - [`scripts/smoke-runtime.mjs`](C:\Users\p4cka\documents\development\solara\scripts\smoke-runtime.mjs)
  - [`scripts/smoke/react-stub.mjs`](C:\Users\p4cka\documents\development\solara\scripts\smoke/react-stub.mjs)
  - [`scripts/smoke/supabase-stub.mjs`](C:\Users\p4cka\documents\development\solara\scripts\smoke/supabase-stub.mjs)
- Added `npm run smoke` in [`package.json`](C:\Users\p4cka\documents\development\solara\package.json) and wired CI to run it in [ci.yml](C:\Users\p4cka\documents\development\solara\.github\workflows\ci.yml)
- Verified both `npm run smoke` and `npm run build` pass locally

## Root cause

- The original failure was a runtime initialization-order bug, not a syntax or bundling problem
- React executed the component body top-to-bottom; the dependency arrays `[fetchGraves]` and `[fetchSunState]` tried to read `const` callbacks that had not been initialized yet
- Result: app boot failed before gameplay could start, even though production build output still compiled

## What is mid-flight

- Supabase is still optional and still not the cause of the boot failure; offline fallback remains intact
- Open agent-side priorities:
  - [SIL] "First run today" tab pulse
  - [SIL] Roguelite share card
  - [SIL] Save-state validation for boot-critical refs during load

## Human Action Required

- [ ] **Create Supabase project** — create the Supabase project at supabase.com so Solara’s social systems can connect to a live backend
- [ ] **Run SQL Block 1 (`daily_scores`)** — execute the SQL in this handoff to activate Phase 1 leaderboard storage
- [ ] **Run SQL Block 2 (`graves`)** — execute the SQL in this handoff to activate Phase 2 grave storage and map persistence
- [ ] **Run SQL Block 3 (`sun_state`)** — execute the SQL in this handoff to activate Phase 3 shared sun tracking and death counter RPC
- [ ] **Add Supabase env vars** — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and GitHub Secrets so local and CI builds can talk to Supabase
- [ ] **Post the itch.io listing** — publish the game and devlog entry at itch.io/vaultsparkstudios to open the first real distribution channel
- [ ] **Deploy the Discord bot** — create the Discord app/token and host `discord-bot/` so the social distribution layer can run
- [ ] **Submit the Twitch extension** — submit `twitch-extension/` through the Twitch Developer Console to activate the stream-side surface

## What to do next

1. Implement the remaining `[SIL]` UI/gameplay items: Daily tab pulse and roguelite share card
2. Add save-state validation for boot-critical refs during load
3. Resume Phase 5 work once those guardrails are in place

## Constraints

- `src/App.jsx` remains monolithic until 5000 lines
- Never break save migration from `dunescape_save` to `solara_save`
- Social/backend features must continue to degrade cleanly when Supabase is absent

## Read these first next session

1. `AGENTS.md`
2. `context/LATEST_HANDOFF.md`
3. `context/SELF_IMPROVEMENT_LOOP.md`
