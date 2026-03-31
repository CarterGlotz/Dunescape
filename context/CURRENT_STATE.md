# Current State

## Snapshot

- Date: 2026-03-31
- Overall status: Active development
- Current phase: Async shared-world completion pass shipped — objective guidance, ghost manifestations, save validation, and activation prep added on top of Phase 4

## What exists

- systems: Full browser RPG (21 skills, combat, crafting, quests, pets, prestige, farming, dungeon, arena, factions, bestiary, daily challenges, offline progression)
- branding: Solara: Sunfall (Phase 0 complete)
- Phase 1 — Daily Rites: Seeded PRNG, 30-wave daily dungeon, wave tracking, daily share card generator, Supabase leaderboard client (graceful offline fallback)
- Phase 2 — Living Map: Epitaph modal on death, graves submitted to Supabase, ✝ markers on world map, grave click popup, shrine evolution at 50/200 offerings, 5-minute auto-refresh
- Phase 3 — Sun Phase Engine: sunBrightness state, fetchSunState (mount + 5-minute interval), canvas desaturation filter, increment_death_counter() wired to every death, HUD sun indicator with pulse animation, milestone death announcements, graceful offline fallback
- Phase 4 — Roguelite Engine: Infinite wave roguelite mode, 17 room pool (4 difficulty tiers) + boss every 10 waves, monster stat scaling (+6% per wave), 5-relic system with persistent bonuses, roguelite stats (bestWave, totalRuns, relics) persisted in save
- runtime stability: Boot regression fixed and protected by smoke coverage; stale/malformed save data is now sanitized on load/import before it reaches boot-critical refs
- runtime usability: Gameplay canvas now resizes to the actual gameplay viewport instead of staying trapped in a fixed `17x14` view; camera follow is clamped and centered correctly; utility panel collapses with `Tab` / `☰`; quickstart overlay explains controls; a persistent objective tracker points the player toward the next meaningful step
- front door: Full-screen title/menu flow exists before runtime entry, with Play / How To Play / Knowledge Base / Features / Update Log / Settings framing the async shared-world premise
- identity: Persistent traveler name + sigil exist locally and are applied to the player profile; starter loadout auto-equips on fresh entry
- echoes: Async player echoes record major run/death events locally and attempt Supabase sync through `player_echoes`; runtime now surfaces recent echoes as visible ghost manifestations instead of menu-only memory
- daily nudges: Daily tab now pulses when the current day’s rite has not been played; roguelite runs now generate their own share card on death
- activation prep: README truth pass completed and `docs/SUPABASE_ACTIVATION_PACK.md` now centralizes the backend activation checklist for the shared-world stack
- SIL items: Oracle NPC, Sunstone Shard, daily streak, seeded boss name, deaths ticker, grave clustering, Oracle dialogue state machine, Sunstone offering mechanic, shrine glow on map, milestone death announcements, sun pulse animation, faction leaderboard split, objective tracker, daily tab pulse, roguelite share card, save-state validation
- Innovation Sprint (2026-03-27): 13 items shipped — landmark auto-naming, faction share card, prophetic epitaph suggestions, ambient audio system (Web Audio API), faction rivalry dashboard in Daily tab, Oracle email subscription UI, Sunfall Event boss HP tracker, Archive of the Fallen (`public/archive.html`), Sun Observatory widget (`public/sun-widget.html`), Discord Bot (`discord-bot/`), Twitch Extension (`twitch-extension/`), Weekly State of Sun template
- save: `solara_save` key, `SAVE_VERSION=5`, migration shim active, import/export path now sanitizes boot-critical fields
- build: Passing (`577.37 KB` JS, `167.47 KB` gzip) with build + smoke verified after the responsive camera/viewport pass

## Important paths

- Main game: `src/App.jsx` (~3370 lines — do NOT split until 5000 lines)
- Supabase client: `src/supabase.js`
- Supabase activation guide: `docs/SUPABASE_ACTIVATION_PACK.md`
- Archive of the Fallen: `public/archive.html`
- Sun Observatory widget: `public/sun-widget.html`
- Discord bot: `discord-bot/index.js` (run separately, needs discord.js + .env)
- Twitch extension: `twitch-extension/panel.html` + `manifest.json`
- Weekly digest template: `docs/templates/STATE_OF_SUN_WEEKLY.md`
- Env template: `.env.local`
- Build output: `dist/`

## In progress

- active work: External activation runway — shared-world backend go-live, richer public season surfaces, and deeper async echo interaction

## Blockers

- Supabase activation is still not complete — social systems, archive, widget, and bot remain local/offline-safe until Carter runs the live setup
- Itch.io listing — Carter must post manually
- Discord bot deployment — Carter must create Discord app + token + host separately
- Twitch extension submission — Carter must submit via Twitch Developer Console

## Next 3 moves

1. Carter: Complete the backend checklist in `docs/SUPABASE_ACTIVATION_PACK.md` and run all shared-world SQL blocks
2. Agent: Build a current-season chronicle page that combines top runs, graves, echoes, and sun milestones
3. Agent: Add an echo response loop (`commend` / `heed` / `mourn`) so stronger async stories rise naturally
