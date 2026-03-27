# Current State

## Snapshot

- Date: 2026-03-27
- Overall status: Active development
- Current phase: Phase 3 complete — Phase 4 next

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click → popup, 5-min auto-refresh
- Phase 3 — Sun Phase Engine: sunBrightness state, fetchSunState (mount + 5-min interval), canvas desaturation filter, increment_death_counter() wired to every death, HUD sun indicator, graceful offline fallback
- SIL items: Oracle NPC in The Sanctum, Sunstone Shard starter item with flavour text
- save: solara_save key, SAVE_VERSION=5, migration shim active
- SIL items (this session): Daily streak counter (localStorage + Daily tab display), seeded boss name for Wave 30, recent deaths ticker, grave clustering (💀 badge ≥5), Oracle dialogue state machine, Sunstone Shard offering mechanic
- build: Passing ✅ (330 KB JS, 101 KB gzipped)

## Important paths

- Main game: `src/App.jsx` (~2520 lines — do NOT split until 5000 lines)
- Supabase client: `src/supabase.js`
- Env template: `.env.local` (fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- Build output: `dist/`
- Handoff docs: `SOLARA_SUNFALL_HANDOFF/SOLARA_SUNFALL_HANDOFF/`

## In progress

- active work: Phase 4 — Roguelite engine (dungeon as primary mode) OR unblock Supabase setup

## Blockers

- Supabase not configured — all Phase 1+2+3 social features gracefully disabled until Carter sets up project
- GitHub repo rename (dunescape→solara) still pending (manual — Carter)

## Next 3 moves

1. Carter: Create Supabase project + run all 3 SQL blocks from LATEST_HANDOFF.md (daily_scores, graves, sun_state)
2. Carter: Add env vars to .env.local + GitHub Secrets + rename repo
3. Phase 4: Roguelite run mode (dungeon as primary game mode)
