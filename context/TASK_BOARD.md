# Task Board

## Now

- [Manual — Carter] Create Supabase project (free tier) + run daily_scores + graves table SQL
- [Manual — Carter] Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to GitHub Secrets
- [Manual — Carter] Rename GitHub repo dunescape→solara
- [SIL] Add Oracle placeholder NPC in The Sanctum with sun-mythology dialogue
- [SIL] Give new players a "Sunstone Shard" starter item with Solara flavour text
- [Phase 3] Global sun state table + increment_death_counter() Supabase function
- [Phase 3] Sun brightness fetch on load + 5-minute refresh
- [Phase 3] Canvas desaturation filter tied to sun brightness

## Next

- [Phase 2] Shrine evolution (50 offerings → shrine, 200 → major shrine)
- [Phase 3] Oracle NPC dialogue state machine
- [Phase 3] Faction system: Sunkeepers vs Eclipsers

## Blocked

- blocked item: Supabase leaderboard + graves
- blocker: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not configured — Carter must create Supabase project
- unblock path: supabase.com → new project → Settings → API → paste URL + anon key into .env.local + GitHub Secrets

## Later

- [Phase 3] Oracle NPC dialogue state machine
- [Phase 3] Faction system: Sunkeepers vs Eclipsers
- [Phase 4] Roguelite run mode (full wave-based primary game mode)
- [Phase 5] Season 1: The Wandering Comet

## Done

- ✅ [Phase 0] All Dunescape → Solara: Sunfall string replacements
- ✅ [Phase 0] Save migration shim (dunescape_save → solara_save, SAVE_VERSION 4→5)
- ✅ [Phase 0] OSRS IP cleanup (all location/NPC names replaced)
- ✅ [Phase 0] package.json, vite.config.js, index.html, deploy-pages.yml updated
- ✅ [Phase 1] mulberry32 PRNG + getDailySeed + getDayNumber
- ✅ [Phase 1] generateDailyRooms (30-wave seeded sequence, same for all players per day)
- ✅ [Phase 1] Daily dungeon integration (seeded rooms used when dailyRun active)
- ✅ [Phase 1] Wave-advance logic (clears dead dailyRun monsters, spawns next wave)
- ✅ [Phase 1] Death hook (records wave reached, generates share card, submits score)
- ✅ [Phase 1] generateShareCard (emoji share card with day, wave, faction, season)
- ✅ [Phase 1] src/supabase.js with graceful offline fallback
- ✅ [Phase 1] submitDailyScore + fetchDailyLeaderboard (Supabase, graceful no-op offline)
- ✅ [Phase 1] "☀️ Daily" tab — play button, wave progress bar, share card, leaderboard
- ✅ [Phase 1] Build passing ✅ (322 KB gzipped 98 KB)
- ✅ [Phase 2] Epitaph prompt modal on player death (input, 80-char limit, skip option)
- ✅ [Phase 2] submitGrave to Supabase on death (player_name, epitaph, x, y, faction, wave_reached, season, date_seed)
- ✅ [Phase 2] fetchGraves from Supabase — on mount + every 5 minutes, graceful offline
- ✅ [Phase 2] Render graves as ✝ markers on world map canvas
- ✅ [Phase 2] Grave click → epitaph popup card on world map
- ✅ [Phase 2] Build passing ✅ (326 KB, 99 KB gzipped)
