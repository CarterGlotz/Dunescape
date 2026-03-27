# Current State

## Snapshot

- Date: 2026-03-27
- Overall status: Active development
- Current phase: Phase 3 complete — Phase 4 next — 13 Innovation items shipped

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click → popup, 5-min auto-refresh
- Phase 3 — Sun Phase Engine: sunBrightness state, fetchSunState (mount + 5-min interval), canvas desaturation filter, increment_death_counter() wired to every death, HUD sun indicator, graceful offline fallback
- SIL items: Oracle NPC, Sunstone Shard, daily streak, seeded boss name, deaths ticker, grave clustering, Oracle dialogue state machine, Sunstone offering mechanic
- Innovation Sprint (2026-03-27): 13 items shipped — landmark auto-naming, faction share card, prophetic epitaph suggestions, ambient audio system (Web Audio API), faction rivalry dashboard in Daily tab, Oracle email subscription UI, Sunfall Event boss HP tracker, Archive of the Fallen (public/archive.html), Sun Observatory widget (public/sun-widget.html), Discord Bot (discord-bot/), Twitch Extension (twitch-extension/), Weekly State of Sun template
- save: solara_save key, SAVE_VERSION=5, migration shim active
- build: Passing ✅ (338 KB JS, 103 KB gzipped)

## Important paths

- Main game: `src/App.jsx` (~2650 lines — do NOT split until 5000 lines)
- Supabase client: `src/supabase.js`
- Archive of the Fallen: `public/archive.html`
- Sun Observatory widget: `public/sun-widget.html`
- Discord bot: `discord-bot/index.js` (run separately, needs discord.js + .env)
- Twitch extension: `twitch-extension/panel.html` + `manifest.json`
- Weekly digest template: `docs/templates/STATE_OF_SUN_WEEKLY.md`
- Env template: `.env.local` (fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- Build output: `dist/`

## In progress

- active work: Phase 4 — Roguelite engine (dungeon as primary mode) — next priority once Supabase is live

## Blockers

- Supabase not configured — all Phase 1+2+3 social features gracefully disabled until Carter sets up project
- GitHub repo rename (dunescape→solara) still pending (manual — Carter)
- Itch.io listing — Carter must post manually to itch.io (Innovation #18)
- Discord bot deployment — Carter must create Discord app + bot token + run separately
- Twitch extension submission — Carter must submit via Twitch Developer Console

## Next 3 moves

1. Carter: Create Supabase project + run all 3 SQL blocks from LATEST_HANDOFF.md (daily_scores, graves, sun_state)
2. Carter: Add env vars to .env.local + GitHub Secrets + rename repo + post itch.io listing
3. Phase 4: Roguelite run mode (dungeon as primary game mode)
