Session Intent: Audit the full project, implement the top recommendations, and add the resulting idea set with minimal waste

# Latest Handoff

Last updated: 2026-03-31

## Where We Left Off (Session 13)

- Shipped: 7 improvements across 4 groups — onboarding, shared-world presence, save resilience, activation truth surfaces
- Tests: 2 passing (1 build / 1 smoke / 0 server / 0 client) · delta: 0 this session
- Deploy: pending

## What was completed this session

**Completion pass from audit recommendations**

- Added a persistent objective tracker / waypoint layer in `src/App.jsx` so the player always has a concrete next move
- Added daily-return pulse behavior in `src/App.jsx` so the Daily tab and play button visibly call for the first run of the day
- Added roguelite death share cards in `src/App.jsx` so non-daily runs now produce an explicit share surface
- Added save-shape sanitization for load/import in `src/App.jsx` so stale or malformed save payloads are repaired before they can poison boot-critical refs
- Added runtime ghost manifestations in `src/App.jsx` so recent echoes appear as visible shared-world cards instead of only menu/settings memory
- Replaced the stale `README.md` and added `docs/SUPABASE_ACTIVATION_PACK.md` so repo truth now matches the shipped Solara build and the external activation path is operationally clear
- Verified both `npm run build` and `npm run smoke` pass after the completion pass

## Root cause

- The project had strong systems and strong concept, but the highest-value recommendations were still trapped in gaps between "prepared" and "felt": players lacked explicit direction, async presence was too hidden, and save/import paths were still permissive enough to threaten boot stability
- Result: the build was promising, but not yet presenting its strongest qualities as reliably or clearly as it should

## What is mid-flight

- Supabase activation is still manual and still not complete inside this session; all shared-world systems continue to degrade gracefully when the backend is absent
- New open agent-side priorities:
  - [SIL] Season chronicle page
  - [SIL] Echo response loop

## Human Action Required

- [ ] **Complete the Supabase activation pack** — use `docs/SUPABASE_ACTIVATION_PACK.md`, add live env vars/secrets, and run the SQL blocks so the shared-world stack becomes real instead of local-only
- [ ] **Run SQL Block 1 (`daily_scores`)** — activate Phase 1 leaderboard storage
- [ ] **Run SQL Block 2 (`graves`)** — activate Phase 2 grave storage and map persistence
- [ ] **Run SQL Block 3 (`sun_state`)** — activate Phase 3 shared sun tracking and death counter RPC
- [ ] **Run SQL Block 4 (`player_echoes`)** — activate cross-player async echoes
- [ ] **Post the itch.io listing** — publish the game and devlog entry at itch.io/vaultsparkstudios
- [ ] **Deploy the Discord bot** — create the Discord app/token and host `discord-bot/`
- [ ] **Submit the Twitch extension** — submit `twitch-extension/` through the Twitch Developer Console

## What to do next

1. Carter: Complete the backend checklist in `docs/SUPABASE_ACTIVATION_PACK.md`
2. Agent: Build the season chronicle page combining top runs, graves, echoes, and sun milestones
3. Agent: Add an echo response loop so the strongest async stories surface naturally

## Constraints

- `src/App.jsx` remains monolithic until 5000 lines
- Never break save migration from `dunescape_save` to `solara_save`
- Shared-world features must continue to degrade cleanly when Supabase is absent

## SQL Block 4 — `player_echoes`

```sql
create table if not exists player_echoes (
  id bigint generated always as identity primary key,
  player_name text not null,
  traveler_sigil text,
  kind text not null,
  headline text not null,
  summary text not null,
  wave_reached int default 0,
  faction text default 'neutral',
  season int default 1,
  date_seed text,
  created_at timestamptz not null default now()
);

create index if not exists idx_player_echoes_created_at
  on player_echoes (created_at desc);
```

## Read these first next session

1. `AGENTS.md`
2. `context/LATEST_HANDOFF.md`
3. `context/SELF_IMPROVEMENT_LOOP.md`
