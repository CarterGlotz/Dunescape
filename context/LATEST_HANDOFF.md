Session Intent: Complete the async shared-world build order in one pass: front door, identity, shared-world UX, and echoes

# Latest Handoff

Last updated: 2026-03-31

## Where We Left Off (Session 12)

- Shipped: 5 improvements across 4 groups — front door, identity, shared-world UX, echoes, runtime shell
- Tests: 2 passing (1 build / 1 smoke / 0 server / 0 client) · delta: 0 this session
- Deploy: pending

## What was completed this session

**Async shared-world front door pass**

- Added a full-screen front door in [`src/App.jsx`](C:\Users\p4cka\documents\development\solara\src\App.jsx): Play, How To Play, Knowledge Base, Features, Update Log, and Settings now exist before runtime entry
- Added persistent traveler identity in [`src/App.jsx`](C:\Users\p4cka\documents\development\solara\src\App.jsx): player name + traveler sigil persist locally and flow into runtime/shared-world records
- Added starter-loadout onboarding in [`src/App.jsx`](C:\Users\p4cka\documents\development\solara\src\App.jsx): fresh entries auto-equip the opening weapon/shield when entering from the menu
- Added player echoes in [`src/App.jsx`](C:\Users\p4cka\documents\development\solara\src\App.jsx): deaths and run outcomes now create async social records with local fallback and Supabase-ready sync through `player_echoes`
- Preserved the previous runtime shell fixes: full-size gameplay canvas, collapsible utility panel, and quickstart overlay
- Verified both `npm run smoke` and `npm run build` pass locally after the larger App.jsx pass

## Root cause

- The project had regained technical boot stability but still lacked the actual async-shared-world product wrapper: no title screen, no front door, weak identity, and no visible community memory beyond graves/leaderboard internals
- Result: the game’s intended “multiplayer” premise was largely hidden inside the code instead of being surfaced as the player-facing structure

## What is mid-flight

- Supabase is still optional and still not available in this local session; all new echo systems degrade to local-only storage when the backend is absent
- Open agent-side priorities:
  - [SIL] Objective tracker
  - [SIL] "First run today" tab pulse
  - [SIL] Roguelite share card
  - [SIL] Save-state validation for boot-critical refs during load

## Human Action Required

- [ ] **Create Supabase project** — create the Supabase project at supabase.com so Solara’s social systems can connect to a live backend
- [ ] **Run SQL Block 1 (`daily_scores`)** — execute the SQL in this handoff to activate Phase 1 leaderboard storage
- [ ] **Run SQL Block 2 (`graves`)** — execute the SQL in this handoff to activate Phase 2 grave storage and map persistence
- [ ] **Run SQL Block 3 (`sun_state`)** — execute the SQL in this handoff to activate Phase 3 shared sun tracking and death counter RPC
- [ ] **Run SQL Block 4 (`player_echoes`)** — execute the SQL below to activate cross-player async echoes
- [ ] **Add Supabase env vars** — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and GitHub Secrets so local and CI builds can talk to Supabase
- [ ] **Post the itch.io listing** — publish the game and devlog entry at itch.io/vaultsparkstudios to open the first real distribution channel
- [ ] **Deploy the Discord bot** — create the Discord app/token and host `discord-bot/` so the social distribution layer can run
- [ ] **Submit the Twitch extension** — submit `twitch-extension/` through the Twitch Developer Console to activate the stream-side surface

## What to do next

1. Add a persistent objective tracker / waypoint so the new front door leads into a concrete first objective
2. Add save-state validation for the expanded identity/shared-world shape
3. Activate Supabase and the new `player_echoes` table so the async social layer becomes real instead of local-only

## Constraints

- `src/App.jsx` remains monolithic until 5000 lines
- Never break save migration from `dunescape_save` to `solara_save`
- Social/backend features must continue to degrade cleanly when Supabase is absent

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
