# Self-Improvement Loop

This file is the living audit and improvement engine for the project.
Append a new entry every closeout. Never delete prior entries.

---

## Scoring rubric

Rate 0–10 per category at each closeout:

| Category | What it measures |
|---|---|
| **Dev Health** | Code quality, CI status, test coverage, technical debt level |
| **Creative Alignment** | Adherence to SOUL.md and CDR — are builds matching the vision? |
| **Momentum** | Commit frequency, feature velocity, milestone progress |
| **Engagement** | Community, player, or user feedback signals |
| **Process Quality** | Handoff freshness, Studio OS compliance, context file accuracy |

---

## Loop protocol

### At closeout (mandatory)

1. Score all 5 categories (0–10 each, 50 max)
2. Compare to prior session scores — note trajectory (↑ ↓ →) per category
3. Identify 1 top win and 1 top gap
4. Brainstorm 3–5 innovative solutions, features, or improvements
5. Commit 1–2 brainstorm items to `context/TASK_BOARD.md` — label them `[SIL]`
6. Append an entry to this file using the format below

### At start (mandatory read)

- Read this file after `context/LATEST_HANDOFF.md`
- Note open brainstorm items not yet actioned
- Check whether prior `[SIL]` TASK_BOARD commitments were completed
- If a committed item was skipped 2+ sessions in a row, escalate it to **Now** on TASK_BOARD

---

## Entries

### 2026-03-26 — Studio OS onboarding

**Scores**

| Category | Score | vs Last | Notes |
|---|---|---|---|
| Dev Health | — | — | Baseline — not yet assessed |
| Creative Alignment | — | — | Baseline — not yet assessed |
| Momentum | — | — | Baseline — not yet assessed |
| Engagement | — | — | Baseline — not yet assessed |
| Process Quality | 5 | — | Studio OS files bootstrapped |
| **Total** | **5 / 50** | | |

**Top win:** Studio OS context files bootstrapped — project now has agent continuity

**Top gap:** All context files need project-specific content filled in

**Innovative Solutions Brainstorm**

1. Fill out PROJECT_BRIEF.md with a compelling pitch — what makes this project worth playing/using?
2. Define 3 core SOUL non-negotiables that will guide every creative decision
3. Identify the single highest-leverage next feature that would most increase engagement
4. Set up CI/CD so Dev Health can be properly measured
5. Create a milestone tracker so Momentum score can be tracked over time

**Committed to TASK_BOARD this session**

- [SIL] Fill out all context files with project-specific content — ✅ DONE 2026-03-27
- [SIL] Define first concrete milestone for Momentum tracking — ✅ DONE 2026-03-27 (Phase 0 = rebrand live)

---

### 2026-03-27 — Phase 0 Rebrand

**Scores**

| Category | Score | vs Last | Notes |
|---|---|---|---|
| Dev Health | 8 | ↑ | Build passing, 315KB bundle, clean migration shim |
| Creative Alignment | 9 | ↑ | All OSRS IP removed, world names feel on-brand for Solara's sun mythology |
| Momentum | 8 | ↑ | Phase 0 complete in one session per plan |
| Engagement | 2 | → | Pre-launch, no players yet |
| Process Quality | 9 | ↑ | All context files filled, decisions logged, handoff clean |
| **Total** | **36 / 50** | ↑↑ | |

**Top win:** Phase 0 complete — full rebrand in one session, build passing, IP clean, saves migrate safely

**Top gap:** Engagement is 2 because we have zero players yet — Phase 1 (Daily Rites share loop) is the critical unlock

**Innovative Solutions Brainstorm**

1. **Pre-launch Discord drip** — start posting daily "The sun burns at X%" teaser posts in the Discord before Phase 1 even ships to build anticipation
2. **Named starting item** — give new players a "Sunstone Shard" with flavour text that references the Solara mythology on first login
3. **First-death epitaph prompt** — even before Phase 2 ships, ask players to write an epitaph text field on death, store it locally — ready to wire to Supabase in Phase 2
4. **Oracle "coming soon" NPC** — add a placeholder Oracle NPC in The Sanctum with mysterious dialogue ("The sun weakens. I will speak when the time comes.") to seed the Phase 3 mythology now
5. **Solara's Rest ambient lore** — add 2-3 ambient chat lines to Alder (the Hans replacement) that reference the sun mythology to immerse players in the new world

**Committed to TASK_BOARD this session**

- [SIL] Add Oracle placeholder NPC in The Sanctum with sun-mythology dialogue (Phase 3 seed)
- [SIL] Give new players a "Sunstone Shard" starter item with Solara flavour text

---

### 2026-03-27 — Phase 1 Daily Rites

**Scores**

| Category | Score | vs Last | Notes |
|---|---|---|---|
| Dev Health | 9 | ↑ | Build passing, graceful Supabase fallback, clean wave system |
| Creative Alignment | 9 | → | Daily Rite matches spec; share card feels on-brand |
| Momentum | 9 | ↑ | Phase 0 + Phase 1 both complete in single session |
| Engagement | 2 | → | Still pre-launch — no players yet |
| Process Quality | 9 | → | All context files current, SIL committed items actioned |
| **Total** | **38 / 50** | ↑ | |

**Top win:** Entire viral loop shipped — seeded PRNG, 30-wave daily dungeon, emoji share card, Supabase client, live leaderboard UI, all in one session

**Top gap:** Supabase not wired up — leaderboard shows "configure Supabase" message. Blocked on Carter creating the project.

**Innovative Solutions Brainstorm**

1. **Sun brightness display in HUD** — Show a tiny sun icon in the top bar that desaturates as the global sun dims (even before Phase 3, faked with a `sin(Date.now())` animation to demonstrate the visual)
2. **Daily run streak counter** — Track consecutive days played in localStorage, show a streak counter in the Daily tab to encourage daily return
3. **Seeded boss name** — The Wave 30 Shadow Drake gets a unique seeded name each day ("Day 1: Vexar the Ash-Born", "Day 2: Solveth of the Dim Flame") — adds daily novelty
4. **Share card preview improvement** — Show the emoji bar as an actual progress arc around a sun icon instead of a text row (Phase 5 canvas version)
5. **"First run today" notification** — When player opens the game for the first time each day, a subtle glow pulse on the ☀️ tab to draw attention to the daily dungeon

**Committed to TASK_BOARD this session**

- [SIL] Add daily run streak counter in localStorage + display in Daily tab
- [SIL] Give Wave 30 boss a seeded daily name based on getDailySeed()

---

### 2026-03-27 — Phase 2 Living Map

**Scores**

| Category | Score | vs Last | Notes |
|---|---|---|---|
| Dev Health | 9 | → | Build passing, graceful Supabase fallback preserved, 2479 lines (well under split threshold) |
| Creative Alignment | 9 | → | Epitaph modal fits the "leave your mark" Solara promise; ✝ map overlay is exactly the living graveyard vision |
| Momentum | 9 | → | Phase 2 complete in one session; all three phases (0+1+2) shipped |
| Engagement | 2 | → | Still pre-launch — no Supabase configured yet |
| Process Quality | 9 | → | All context files updated, SIL committed, SQL provided for Carter |
| **Total** | **38 / 50** | → | |

**Top win:** Full Living Map system shipped — epitaph modal on death, graves to Supabase, ✝ map overlay, grave click popup — all with graceful offline fallback

**Top gap:** Everything is blocked on Carter completing the Supabase setup. The code is ready; the infrastructure isn't.

**Innovative Solutions Brainstorm**

1. **Grave clustering** — When >5 graves are within 3 tiles of each other on the world map, render a single 💀 cluster marker with a count badge instead of overlapping ✝ symbols
2. **Sunstone offering mechanic** — Let players click a grave on the world map and "offer" a Sunstone Shard item to it (increments `sunstone_offerings` in Supabase), triggering shrine evolution at 50/200 offerings
3. **"Recent deaths" ticker** — In the chat box, show incoming graves from other players as `[☠️ PlayerName fell at Wave N]` — polled on the 5-min graves refresh
4. **Grave density heatmap** — Draw semi-transparent red circles on the world map around tile clusters with many graves — shows players "danger zones"
5. **Named daily boss** — Wave 30 Shadow Drake gets a unique seeded name each day (`getDailySeed()` → hash → pick from name list) to add daily novelty

**Committed to TASK_BOARD this session**

- [SIL] Add "recent deaths" ticker — show new graves in chat on 5-min refresh
- [SIL] Add grave clustering marker on world map when >5 graves within 3 tiles
