# Current State

## Snapshot

- Date: 2026-03-31
- Overall status: Active development
- Current phase: Async shared-world front door shipped — main menu, identity, and echo layer added on top of Phase 4

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click → popup, shrine evolution at 50/200 offerings, 5-min auto-refresh
- Phase 3 — Sun Phase Engine: sunBrightness state, fetchSunState (mount + 5-min interval), canvas desaturation filter, increment_death_counter() wired to every death, HUD sun indicator with pulse animation, milestone death announcements, graceful offline fallback
- Phase 4 — Roguelite Engine: Infinite wave roguelite mode, 17 room pool (4 difficulty tiers) + boss every 10 waves, monster stat scaling (+6% per wave), 5-relic system with persistent bonuses, roguelite stats (bestWave, totalRuns, relics) persisted in save
- runtime stability: App boot regression fixed after Phase 4 — `fetchGraves` and `fetchSunState` mount effects now run after their callbacks are initialized, preventing startup TDZ crashes/blank-screen boot failure
- smoke coverage: `npm run smoke` now mounts a rewritten Node-safe copy of `App.jsx`, flushes mount effects, and verifies Daily + Roguelite startup handlers initialize without crashing
- runtime usability: Gameplay canvas now scales to fill the available viewport instead of staying locked to its native 544×448 size; utility panel can be collapsed with `Tab`/`☰`; quickstart overlay explains movement, interaction, and the first useful actions
- front door: Full-screen title/menu flow now exists before runtime entry, with Play / How To Play / Knowledge Base / Features / Update Log / Settings sections framing the async shared-world premise
- identity: Persistent traveler name + sigil now exist locally and are applied to the player profile; starter loadout auto-equips on fresh entry so the first combat loop is less confusing
- echoes: Async player echoes now record major run/death events locally and attempt Supabase sync through a new `player_echoes` table when configured; menu and settings surfaces both display recent echoes
- SIL items: Oracle NPC, Sunstone Shard, daily streak, seeded boss name, deaths ticker, grave clustering, Oracle dialogue state machine, Sunstone offering mechanic, shrine glow on map, milestone death announcements, sun pulse animation, faction leaderboard split
- Innovation Sprint (2026-03-27): 13 items shipped — landmark auto-naming, faction share card, prophetic epitaph suggestions, ambient audio system (Web Audio API), faction rivalry dashboard in Daily tab, Oracle email subscription UI, Sunfall Event boss HP tracker, Archive of the Fallen (public/archive.html), Sun Observatory widget (public/sun-widget.html), Discord Bot (discord-bot/), Twitch Extension (twitch-extension/), Weekly State of Sun template
- save: solara_save key, SAVE_VERSION=5, migration shim active
- build: Passing (369.83 KB JS, 111.72 KB gzipped) with front-door/identity/echo layer shipped and smoke harness verified

## Important paths

- Main game: `src/App.jsx` (~2851 lines — do NOT split until 5000 lines)
- Supabase client: `src/supabase.js`
- Archive of the Fallen: `public/archive.html`
- Sun Observatory widget: `public/sun-widget.html`
- Discord bot: `discord-bot/index.js` (run separately, needs discord.js + .env)
- Twitch extension: `twitch-extension/panel.html` + `manifest.json`
- Weekly digest template: `docs/templates/STATE_OF_SUN_WEEKLY.md`
- Env template: `.env.local` (fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- Build output: `dist/`

## In progress

- active work: Async shared-world completion pass — backend activation, objective guidance, and richer player echoes

## Blockers

- Supabase not configured — all Phase 1+2+3 social features gracefully disabled until Carter sets up project
- Itch.io listing — Carter must post manually to itch.io (Innovation #18)
- Discord bot deployment — Carter must create Discord app + bot token + run separately
- Twitch extension submission — Carter must submit via Twitch Developer Console

## Next 3 moves

1. Agent: Add an objective tracker / waypoint layer so the new front door leads into concrete in-world direction
2. Agent: Add save-state validation for the expanded identity/shared-world state shape
3. Carter: Create Supabase project + run the shared-world SQL blocks, including `player_echoes`
