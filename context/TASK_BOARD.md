# Task Board

## Now — Agent can do immediately

- [SIL] Add daily run streak counter in localStorage + display in Daily tab
- [SIL] Give Wave 30 boss a seeded daily name based on getDailySeed()
- [SIL] Add "recent deaths" ticker — show new graves in chat on 5-min refresh
- [SIL] Add grave clustering marker on world map when >5 graves within 3 tiles
- [SIL] Oracle dialogue state machine — different lines based on sunBrightness thresholds
- [SIL] Sunstone Shard offering mechanic on graves (increments sunstone_offerings)

## Now — Waiting on Carter (manual actions, flagged for delay)

- [Manual] Create Supabase project at supabase.com (free tier)
- [Manual] Run SQL Block 1 — `daily_scores` table (Phase 1) — full SQL in LATEST_HANDOFF.md
- [Manual] Run SQL Block 2 — `graves` table (Phase 2) — full SQL in LATEST_HANDOFF.md
- [Manual] Run SQL Block 3 — `sun_state` table + `increment_death_counter()` (Phase 3) — full SQL in LATEST_HANDOFF.md
- [Manual] Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to `.env.local` (local) and GitHub Secrets (CI)
- [Manual] Rename GitHub repo: dunescape → solara (GitHub Settings → Repository name)

## Next — Agent (after current Now items clear)

- [Phase 4] Roguelite run mode (dungeon as primary game mode) — see TECH_IMPLEMENTATION_PLAN.md §4
- [Phase 2] Shrine evolution (50 offerings → shrine, 200 → major shrine)
- [Phase 3] Oracle NPC dialogue state machine (responds to sunBrightness thresholds)
- [Phase 5] Season 1: The Wandering Comet config + launch prep

## Later

- [Phase 3] Faction system: Sunkeepers vs Eclipsers
- [Phase 5] Prophecy Scroll canvas image generator
- [Phase 5] Season leaderboard + season reset flow

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
- ✅ [Phase 2] Epitaph prompt modal on player death (input, 80-char limit, skip option)
- ✅ [Phase 2] submitGrave to Supabase on death (player_name, epitaph, x, y, faction, wave_reached, season, date_seed)
- ✅ [Phase 2] fetchGraves from Supabase — on mount + every 5 minutes, graceful offline
- ✅ [Phase 2] Render graves as ✝ markers on world map canvas
- ✅ [Phase 2] Grave click → epitaph popup card on world map
- ✅ [Phase 3] fetchSunState + sunBrightness state (0–100, default 100)
- ✅ [Phase 3] Canvas desaturation filter tied to sunBrightness (saturate + sepia)
- ✅ [Phase 3] Sun brightness fetch on mount + every 5 minutes, graceful offline
- ✅ [Phase 3] increment_death_counter() wired to every player death (submitGrave)
- ✅ [Phase 3] HUD sun indicator: ☀N% with colour shift (gold→orange→red)
- ✅ [SIL] Oracle NPC in The Sanctum (x:26,y:13) with sun-mythology dialogue
- ✅ [SIL] Sunstone Shard starter item — in new player inventory, examine text, HUD welcome message
- ✅ Build passing ✅ (327 KB JS, 99 KB gzipped)
