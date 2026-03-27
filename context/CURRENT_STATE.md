# Current State

## Snapshot

- Date: 2026-03-27
- Overall status: Active development
- Current phase: Phase 4 complete — Phase 5 next

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click → popup, shrine evolution at 50/200 offerings, 5-min auto-refresh
- Phase 3 — Sun Phase Engine: sunBrightness state, fetchSunState (mount + 5-min interval), canvas desaturation filter, increment_death_counter() wired to every death, HUD sun indicator with pulse animation, milestone death announcements, graceful offline fallback
- Phase 4 — Roguelite Engine: Infinite wave roguelite mode, 17 room pool (4 difficulty tiers) + boss every 10 waves, monster stat scaling (+6% per wave), 5-relic system with persistent bonuses, roguelite stats (bestWave, totalRuns, relics) persisted in save
- SIL items: Oracle NPC, Sunstone Shard, daily streak, seeded boss name, deaths ticker, grave clustering, Oracle dialogue state machine, Sunstone offering mechanic, shrine glow on map, milestone death announcements, sun pulse animation, faction leaderboard split
- Innovation Sprint (2026-03-27): 13 items shipped — landmark auto-naming, faction share card, prophetic epitaph suggestions, ambient audio system (Web Audio API), faction rivalry dashboard in Daily tab, Oracle email subscription UI, Sunfall Event boss HP tracker, Archive of the Fallen (public/archive.html), Sun Observatory widget (public/sun-widget.html), Discord Bot (discord-bot/), Twitch Extension (twitch-extension/), Weekly State of Sun template
- save: solara_save key, SAVE_VERSION=5, migration shim active
- build: Passing (348 KB JS, 106 KB gzipped)

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

- active work: Phase 5 next — Season 1 config + launch prep

## Blockers

- Supabase not configured — all Phase 1+2+3 social features gracefully disabled until Carter sets up project
- Itch.io listing — Carter must post manually to itch.io (Innovation #18)
- Discord bot deployment — Carter must create Discord app + bot token + run separately
- Twitch extension submission — Carter must submit via Twitch Developer Console

## Next 3 moves

1. Carter: Create Supabase project + run all 4 SQL blocks from LATEST_HANDOFF.md
2. Carter: Add env vars to .env.local + GitHub Secrets + post itch.io listing
3. Phase 5: Season 1 config + launch prep
