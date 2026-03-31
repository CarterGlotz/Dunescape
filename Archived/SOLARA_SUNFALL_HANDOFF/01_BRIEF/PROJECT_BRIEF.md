# SOLARA: SUNFALL — Executive Project Brief
### VaultSpark Studios · March 2026

---

## The One-Sentence Pitch

A browser roguelite where a shared sun dims with every player death — and when it finally goes dark, the entire community fights the final boss together to light it again.

---

## What This Game Is

**Solara: Sunfall** is a free-to-play browser RPG roguelite with a living shared world. Players run procedurally-generated dungeons in a dying desert civilization. Every death contributes to a global sun-dimming counter visible to all players. When the sun reaches 0%, a server-wide Sunfall Event activates — a final boss that all players fight together to reset the sun and begin a new season with a new catastrophe narrative.

The game is a **transfer and redesign** of the existing Dunescape codebase, not a new build from scratch. All existing systems (21 skills, combat, items, crafting, dungeon rooms, prestige) are preserved and reframed within the new roguelite architecture.

---

## The Three Hooks

### Hook 1: The Viral Engine — Daily Rites
One dungeon per day. Same dungeon for every player globally (date-seeded, no server required). Players share an emoji result card to Discord/WhatsApp/Twitter after each run. "Day 47 · Solara ☀️☀️🌑🌑 · Wave 12 · Rank #843." This is the Wordle mechanic applied to an RPG dungeon. Free daily marketing.

### Hook 2: The Emotional Engine — Living Map
When you die, you leave a permanent grave on the shared world map with a one-sentence epitaph you write. Other players can visit your grave, watch a replay of your final 30 seconds, leave offerings, and upgrade your grave to a shrine that buffs nearby players. Your death lives forever. The world becomes a memorial.

### Hook 3: The Narrative Engine — Seasonal Catastrophes
Each season (4–8 weeks) has a unique catastrophe narrative: The Wandering Comet, The Void Plague, The Ancient Machine, The Star-Eater. New enemy themes, new lore codex, new Oracle dialogue — but the same mechanical skeleton. The catastrophe is why the sun is dying this season. The community's behavior determines how fast the season ends.

---

## The Collective Death Equation

```
Global Sun Brightness = 100 - (totalDeaths × 0.0001)%
```

At a healthy playerbase with 100k runs/season and avg 3 deaths/run:
- 300,000 deaths × 0.0001 = 30% dimming
- Sun arrives at 70% at natural season pace

If players die faster (bad week, viral influx of new players), sun dims faster. If the community gets skilled, the sun barely dims. The calendar is set by the community, not the developer.

---

## Why This Wins the Market

| Competitor | What They Are | Our Advantage |
|-----------|---------------|---------------|
| Old School RuneScape | The original browser RPG | We're not a clone — we have the Sunfall mechanic they can't replicate without breaking their game |
| Vampire Survivors | Top browser roguelite | No shared world, no daily mode, no social legacy layer |
| Wordle clones | Daily format games | No depth — one mechanic, no progression, no emotional investment |
| Hades | Best roguelite narrative | Not browser-native, no shared world, no live community events |
| Cookie Clicker / Idle games | $2.5B market | No narrative, no social, no viral sharing artifact |

**Our niche:** The only browser roguelite with a daily shared-world format, real-time collective consequence mechanics, and a permanent legacy layer. This combination has zero direct competitors as of March 2026.

---

## Platform & Technology

| Layer | Technology | Cost |
|-------|-----------|------|
| Game engine | React + Vite (existing) | $0 |
| Hosting | GitHub Pages / Cloudflare Pages | $0 |
| Player saves | localStorage (`solara_save`) | $0 |
| Daily seed | Date-deterministic (no server) | $0 |
| Leaderboard + graves | Supabase free tier | $0 |
| Total at 10k MAU | — | $0 |
| Total at 100k MAU | — | ~$25/mo |

The game is fully static at its core. The only backend is Supabase for leaderboard scores, grave data, and shrine states — all within the free tier at launch.

---

## Revenue Model

| Stream | Trigger | Projection (10k MAU) |
|--------|---------|---------------------|
| Cosmetic graves | Always available | $300–800/mo |
| Sunkeeper Pact ($5/season) | After Season 1 launch | $500–2,000/mo |
| Memorial Stones ($15 one-time, limited) | After Living Map ships | $200–600/season |
| Rewarded video ads | Optional, 1 per day per player | $100–400/mo |
| **Total** | | **$1,100–3,800/mo at 10k MAU** |

At 50k MAU: $5,500–19,000/month. No paid acquisition needed if viral loop functions correctly.

---

## Success Metrics

### Season 1 targets (8 weeks post-launch)
- 1,000 registered players (week 2)
- 5,000 registered players (week 6)
- 500 graves on the Living Map
- 1 viral moment (sun threshold Oracle broadcast shared publicly)
- Supabase stays on free tier

### Year 1 targets
- 25,000 MAU by end of Season 3
- First Sunfall Event (community event, not scripted)
- Self-sustaining viral loop (new players arriving from share cards without paid spend)
- $3,000+/month revenue

---

## IP Status

**"Solara"** — confirmed clear. USPTO Class 9 and Class 41 show no active gaming conflicts. File intent-to-use application before major marketing spend. Cost: $250–350 filing fee.

**"Solara: Sunfall"** as combined mark — highly trademarkable, no conflicts found.

**Dunescape trademark risks resolved:** The rebrand eliminates both the `-scape` suffix (Jagex) and `Dune` (Herbert estate) conflicts entirely.

---

## Timeline Summary

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Phase 0: Rebrand | 1 session | Dunescape → Solara, live |
| Phase 1: Daily Rites | 3 sessions | Viral share card + leaderboard live |
| Phase 2: Living Map | 2 sessions | Graves + shrines live |
| Phase 3: Sun Phase engine | 4 sessions | Collective dimming + Oracle live |
| Phase 4: Roguelite engine | 8 sessions | Full Sunfall run structure |
| Phase 5: Season 1 launch | 6 sessions | The Wandering Comet |
| **Total to full launch** | **~24 sessions** | **Full Solara: Sunfall live** |

---

*VaultSpark Studios · Solara: Sunfall · Executive Brief · March 2026*
