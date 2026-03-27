# Task Board

## Now

- [Manual — Carter] Create Supabase project (free tier) + run ALL 3 SQL blocks from LATEST_HANDOFF.md (daily_scores, graves, sun_state)
- [Manual — Carter] Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to GitHub Secrets + .env.local
- [Manual — Carter] Rename GitHub repo dunescape→solara
- [SIL] Add daily run streak counter in localStorage + display in Daily tab
- [SIL] Give Wave 30 boss a seeded daily name based on getDailySeed()
- [SIL] Add "recent deaths" ticker — show new graves in chat on 5-min refresh
- [SIL] Add grave clustering marker on world map when >5 graves within 3 tiles

## Next

- [Phase 4] Roguelite run mode (dungeon as primary game mode)
- [Phase 2] Shrine evolution (50 offerings → shrine, 200 → major shrine)
- [Phase 3] Oracle NPC dialogue state machine (responds to sun brightness level)

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
- ✅ [Phase 3] fetchSunState + sunBrightness state (0–100, default 100)
- ✅ [Phase 3] Canvas desaturation filter tied to sunBrightness (saturate + sepia)
- ✅ [Phase 3] Sun brightness fetch on mount + every 5 minutes, graceful offline
- ✅ [Phase 3] increment_death_counter() wired to every player death (submitGrave)
- ✅ [Phase 3] HUD sun indicator: ☀N% with colour shift (gold→orange→red)
- ✅ [SIL] Oracle NPC in The Sanctum (x:26,y:13) with sun-mythology dialogue
- ✅ [SIL] Sunstone Shard starter item — in new player inventory, examine text, HUD welcome message
- ✅ [Phase 3] Build passing ✅ (327 KB, 99 KB gzipped)
