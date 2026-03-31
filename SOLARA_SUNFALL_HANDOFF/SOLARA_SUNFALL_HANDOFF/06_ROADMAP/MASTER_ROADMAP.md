# MASTER ROADMAP
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## OVERVIEW

This roadmap covers two horizons:
- **Near-term (0–6 months):** Build phases 0–5, Season 1 launch
- **Long-term (6–24 months):** 7-season arc, growth milestones, feature expansion

All phase estimates are in sessions (1 session ≈ 2–4 hours of Claude Code work).

---

## PHASE ROADMAP (Near-Term)

### Phase 0 — Rebrand (1 session)
**Goal:** Dunescape → Solara, live and clean, no gameplay changes
**Deliverable:** `https://vaultsparkstudios.github.io/solara/` live
**Key tasks:**
- All string replacements in App.jsx
- Save migration shim
- Config file updates (package.json, vite.config, index.html)
- GitHub repo rename + workflow update
- IP cleanup (location names, NPC names)
**Success metric:** Game loads with Solara title. No OSRS names. Old saves work.

---

### Phase 1 — Daily Rites (Sessions 2–4)
**Goal:** Viral sharing loop live
**Deliverable:** Daily dungeon + emoji share card + global leaderboard
**Key tasks:**
- Seeded PRNG implementation (mulberry32)
- Daily dungeon generator from date seed
- Supabase project setup + daily_scores table
- Leaderboard UI (today's top 20, player's rank)
- Emoji share card generator (text version first)
- "Play today's dungeon" as primary CTA on homepage
**Success metric:** 10 players share their score in first week. Leaderboard populates.

---

### Phase 2 — Living Map (Sessions 5–6)
**Goal:** Permanent graves layer on world map
**Deliverable:** Deaths create graves with epitaphs, visible to all players
**Key tasks:**
- Supabase graves table + RLS policies
- Death handler: epitaph prompt → grave submission
- Graves render on world map (spatial query by viewport)
- Shrine evolution system (offering counter → visual upgrade)
- Ghost replay capture (compress + store 15s action log)
- "Visit grave" interaction (see epitaph, leave sunstone)
**Success metric:** 50 graves on map after first week of Phase 2 live.

---

### Phase 3 — Sun Phase Engine (Sessions 7–10)
**Goal:** Collective death equation live, world visually responds to global sun
**Deliverable:** Global sun state, 5 phases with visual desaturation, Oracle dialogue
**Key tasks:**
- Supabase sun_state table + increment_death_counter() function
- Sun brightness fetch on load + 5-min refresh
- Canvas desaturation filter tied to brightness
- 5-phase game modifier system (healing %, enemy stats)
- Oracle NPC dialogue state machine
- Oracle global broadcast via Supabase Realtime
- Faction selection: Sunkeepers vs Eclipsers
- Homepage sun counter ("The sun burns at X%")
**Success metric:** First player experiences a phase transition. Oracle broadcasts at 60%.

---

### Phase 4 — Roguelite Engine (Sessions 11–18)
**Goal:** Replace open-world exploration with wave-survival run structure
**Deliverable:** Full roguelite run mode as primary game mode
**Key tasks:**
- Run state vs persistent state separation
- Wave-based dungeon structure (reuse DUNGEON_ROOMS)
- Procedural room sequencing from daily seed
- Solar Relic system (cross-run legacy items)
- Sunkeeper Solar Rites (Wave 30+ reward)
- Prophecy Scroll share card (canvas-drawn image)
- URL seed sharing (solara.game/?seed=COMET-A4X7-312)
**Success metric:** A full run from Wave 1 to death or Wave 30 works flawlessly.

---

### Phase 5 — Season 1: The Wandering Comet (Sessions 19–24)
**Goal:** Full Season 1 experience live, marketing-ready
**Deliverable:** Seasonal enemy themes, lore codex, Oracle seasonal dialogue, comet sky layer
**Key tasks:**
- Season config system (data-driven, no code deploy for season changes)
- Comet-themed enemy reskins
- Sky layer: comet arc visual, grows as sun dims
- 12 lore codex fragments distributed through play
- Oracle seasonal dialogue (all 5 phases × season-specific lines)
- Legacy relic: Comet Fragment
- Sunfall Event logic (triggers at 0% sun)
- New season reset procedure
**Success metric:** Season 1 complete, Sunfall Event triggerable.

---

### Phase 5b — Polish & Pre-Launch (Sessions 25–28)
**Goal:** Production-ready, marketable, accessible
**Deliverable:** Performance-optimized, accessibility-compliant, analytics-instrumented build
**Key tasks:**
- Prophecy Scroll as shareable image (canvas to PNG)
- Discord invite integration (auto-post on milestone deaths)
- Basic analytics (Plausible.io — privacy-first, no cookies)
- Accessibility: keyboard nav, reduced motion, color-blind modes
- Performance audit: <3s load on 3G
- SEO metadata, Open Graph images
- `robots.txt` and sitemap
**Success metric:** Lighthouse score >90. Load time <3s on simulated 3G.

---

## SEASON ARC (Long-Term, 24 Months)

| Season | Name | Duration Target | Key Innovation |
|--------|------|----------------|----------------|
| 1 | The Wandering Comet | 6–8 weeks | Comet arc in sky; false-trust arc established |
| 2 | The Void Plague | 5–7 weeks | Void rifts; purification mechanic |
| 3 | The Ancient Machine | 6–8 weeks | Sabotage network; mystery antagonist |
| 4 | The Star-Eater | 7–9 weeks | Hidden third faction; sanity mechanic |
| 5 | The Twin Suns | 4–6 weeks | False light traps; eclipse cycles |
| 6 | The Last Solar Wind | 6–8 weeks | Ghost NPCs; memory fragments |
| 7 | The Unraveling | 3–5 weeks | Meta-horror; arc convergence finale |

**Total arc duration:** ~43–51 weeks (approximately 1 year)

**After Season 7:** Begin Arc 2. The community has ended one full story cycle. Arc 2 reveals what the Oracle has been hiding. The game's mythology deepens.

---

## GROWTH MILESTONES

| Milestone | Target Date | Target | Action |
|-----------|------------|--------|--------|
| Phase 0 live | Week 1 | — | Rebrand ship |
| First viral share | Week 2–3 | 1 share card posted publicly | — |
| 1,000 registered players | Week 4–6 | 1k accounts | — |
| First Oracle broadcast | Month 2 | Sun hits 60% | Major social moment |
| 5,000 players | Month 3 | 5k MAU | Begin paid promotion if needed |
| First Sunfall Event | Month 3–4 | Community event | Maximum virality moment |
| 25,000 players | Month 6 | 25k MAU | Season 3 launches |
| Supabase Pro upgrade | Month 3–6 | ~50k MAU | $25/month |
| First revenue | Month 2 | Any cosmetic purchase | Validate monetization |
| $1,000/month revenue | Month 4 | — | Validate product-market fit |
| $5,000/month revenue | Month 9 | — | Profitable, self-sustaining |

---

## AUTOMATION MILESTONES

The game should require zero owner involvement post-Season 1 launch. Target dates for full automation:

| Task | Target phase | Method |
|------|-------------|--------|
| Season transition | Phase 5 | Supabase config update via Claude Code |
| Death weight calibration | Phase 3 | Claude Code reads death rate, adjusts weight |
| Oracle dialogue updates | Phase 5 | Supabase `oracle_lines` table, no code deploy |
| Grave replay purge | Phase 2 | Supabase pg_cron |
| Leaderboard archival | Phase 1 | Supabase pg_cron |
| Sun threshold broadcasts | Phase 3 | Supabase Edge Function |
| New player welcome email | Phase 5b | Supabase Auth + email trigger |

---

## RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Supabase free tier overflow | Medium | High | Monitor weekly; upgrade to Pro at $25/mo when needed |
| Sun dims too fast (death spiral) | Medium | Medium | Adjustable death_weight in Supabase config |
| No viral traction | Medium | High | Focus Phase 1 on share card quality; test in Discord first |
| App.jsx becomes unmaintainable | Low | High | Split at 5k lines per file split strategy doc |
| Community griefing (death-farming) | Low | Low | Death weight per-player capped at 10×normal |
| IP dispute (Jagex/Herbert) | Low | Low | Rebrand resolves this; file USPTO trademark |
| No players for Sunfall Event | Low | High | Minimum player threshold — if < 500 players, trigger manually |

---

## DECISION LOG (Major architectural decisions made)

| Decision | Rationale | Date |
|---------|-----------|------|
| Roguelite over open-world | Infinite replayability, daily format compatibility | March 2026 |
| Date-seeded dungeon (no server) | Zero cost, zero infrastructure, still gives shared experience | March 2026 |
| Collective death equation | Most innovative mechanic; no competitors | March 2026 |
| Supabase over custom backend | Free tier sufficient; zero DevOps overhead | March 2026 |
| Keep single App.jsx file | Claude Code context coherence at current scale | March 2026 |
| Sunkeepers vs Eclipsers | Creates ideological tension and social sharing ("what faction are you?") | March 2026 |
| Graves as permanent legacy | Emotional investment; word of mouth driver; costs nothing | March 2026 |

---

*Master Roadmap · Solara: Sunfall · VaultSpark Studios · March 2026*
