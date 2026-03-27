# Task Board

## Now — Agent can do immediately

- [SIL] Shrine glow on world map — graves with ≥50 offerings render as ✦ gold instead of ✝ lavender
- [SIL] Milestone death announcements — HUD flash when totalDeaths crosses 100/500/1000
- [Phase 4] Roguelite run mode (dungeon as primary game mode) — see TECH_IMPLEMENTATION_PLAN.md §4
- [Phase 2] Shrine evolution (50 offerings → shrine, 200 → major shrine; is_shrine / is_major_shrine fields ready in schema)

## Now — Waiting on Carter (manual actions, flagged for delay)

- [Manual] Create Supabase project at supabase.com (free tier) — BLOCKS all social features
- [Manual] Run SQL Block 1 — `daily_scores` table (Phase 1) — full SQL in LATEST_HANDOFF.md
- [Manual] Run SQL Block 2 — `graves` table (Phase 2) — full SQL in LATEST_HANDOFF.md
- [Manual] Run SQL Block 3 — `sun_state` table + `increment_death_counter()` (Phase 3) — full SQL in LATEST_HANDOFF.md
- [Manual] Add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to `.env.local` (local) and GitHub Secrets (CI)
- [Manual] Rename GitHub repo: dunescape → solara (GitHub Settings → Repository name)
- [Manual] Post to itch.io — list game at itch.io/vaultsparkstudios with devlog entry (Innovation #18)

## Next — Agent (after Phase 4 ships)

- [Phase 5] Season 1: The Wandering Comet config + launch prep
- [Phase 5b] Prophecy Scroll canvas image generator (image version of share card)
- [Phase 5b] Season leaderboard + season reset flow
- [Phase 3] Faction system: Sunkeepers vs Eclipsers (full selection UI + death weight modifier)
- [Innovation #9] Player milestone push notifications (grave became Cairn/Shrine)
- [Innovation #10] Daily Rites historical archive (replay any past day's seed)
- [Innovation #16] Run of the Week community seed challenge
- [Innovation #17] Death heatmap weekly visual asset
- [Innovation #19] QR code on death screen linking to player's Archive grave
- [Innovation #20] Season End Legacy Certificate (generated PNG for season participants)

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
- ✅ [Phase 2] submitGrave to Supabase on death
- ✅ [Phase 2] fetchGraves from Supabase — on mount + every 5 minutes, graceful offline
- ✅ [Phase 2] Render graves as ✝ markers on world map canvas
- ✅ [Phase 2] Grave click → epitaph popup card on world map
- ✅ [Phase 3] fetchSunState + sunBrightness state (0–100, default 100)
- ✅ [Phase 3] Canvas desaturation filter tied to sunBrightness (saturate + sepia)
- ✅ [Phase 3] Sun brightness fetch on mount + every 5 minutes, graceful offline
- ✅ [Phase 3] increment_death_counter() wired to every player death (submitGrave)
- ✅ [Phase 3] HUD sun indicator: ☀N% with colour shift (gold→orange→red)
- ✅ [SIL] Oracle NPC in The Sanctum with sun-mythology dialogue
- ✅ [SIL] Sunstone Shard starter item + HUD welcome message
- ✅ [SIL] Daily run streak counter in localStorage + display in Daily tab
- ✅ [SIL] Wave 30 boss seeded daily name (getDailyBossName)
- ✅ [SIL] Recent deaths ticker — new graves announced in chat on 5-min refresh
- ✅ [SIL] Grave clustering — 💀 badge with count when ≥5 graves within 3 tiles
- ✅ [SIL] Oracle dialogue state machine — 4 threshold branches based on sunBrightness
- ✅ [SIL] Sunstone Shard offering mechanic — spend shard on grave
- ✅ [Innovation #1] Archive of the Fallen — public/archive.html (SEO-indexed grave browser)
- ✅ [Innovation #2] Oracle subscription UI — email subscribe in Daily tab, Supabase SQL in handoff
- ✅ [Innovation #3] Sun Observatory widget — public/sun-widget.html (embeddable iframe)
- ✅ [Innovation #4] Discord Bot — discord-bot/index.js (Solara Sun Bot)
- ✅ [Innovation #5] Faction Rivalry Dashboard — in Daily tab, live balance display
- ✅ [Innovation #6] Weekly State of Sun template — docs/templates/STATE_OF_SUN_WEEKLY.md
- ✅ [Innovation #7] Grave Clustering Auto-Landmark — 15+ graves → procedural landmark name on map
- ✅ [Innovation #8] Twitch Extension — twitch-extension/panel.html + manifest
- ✅ [Innovation #11] Prophetic Epitaph Generator — Suggest Prophecy button in epitaph modal
- ✅ [Innovation #12] Faction Recruitment Share Card — generateFactionShareCard() + share button
- ✅ [Innovation #13] Ambient audio system — phase-adaptive Web Audio API, tied to sunBrightness
- ✅ [Innovation #14] Sunfall Event Boss HP Tracker — section in Daily tab when sun < 10%
- ✅ [Innovation #15] Public Sun API — archive.html + widget both expose /sun state via Supabase public query
- ✅ Build passing ✅ (330 KB JS, 101 KB gzipped)
