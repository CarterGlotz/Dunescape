# Current State

## Snapshot

- Date: 2026-03-27
- Overall status: Active development
- Current phase: Phase 2 complete — Phase 3 next

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click → popup, 5-min auto-refresh
- save: solara_save key, SAVE_VERSION=5, migration shim active
- build: Passing ✅ (326 KB JS, 99 KB gzipped)

## Important paths

- Main game: `src/App.jsx` (~2479 lines — do NOT split until 5000 lines)
- Supabase client: `src/supabase.js`
- Env template: `.env.local` (fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- Build output: `dist/`
- Handoff docs: `SOLARA_SUNFALL_HANDOFF/SOLARA_SUNFALL_HANDOFF/`

## In progress

- active work: Phase 3 — Sun Phase Engine (global sun_state table, death counter, canvas desaturation)

## Blockers

- Supabase not configured yet — all Phase 1+2 social features gracefully disabled until Carter sets up project and adds env vars
- GitHub repo rename (dunescape→solara) still pending (manual — Carter)

## Next 3 moves

1. Carter: Rename GitHub repo + add env vars to GitHub Secrets (unblocks deployment)
2. Carter: Run graves table SQL from TECH_IMPLEMENTATION_PLAN.md §2.1 (unblocks Phase 2 live)
3. Phase 3: Sun state table, increment_death_counter() function, sun brightness fetch on load, canvas desaturation
