# SOLARA: SUNFALL — Game Design Document
### Version 1.0 · VaultSpark Studios · March 2026

---

## TABLE OF CONTENTS

1. Game Overview
2. Core Philosophy
3. Player Experience Goals
4. Core Loop
5. The Sun Phase System
6. The Collective Death Equation
7. Faction System: Sunkeepers vs Eclipsers
8. Daily Rites System
9. The Living Map
10. The Oracle System
11. Run Structure (Roguelite Engine)
12. Skills and Progression
13. Combat System
14. Seasonal Catastrophe System
15. Monetization Design
16. UI/UX Principles
17. Audio Direction
18. Accessibility

---

## 1. GAME OVERVIEW

**Title:** Solara: Sunfall
**Genre:** Browser Roguelite RPG with Shared World Mechanics
**Platform:** Browser (HTML5/WebGL, React + Vite)
**Player Mode:** Single-player with asynchronous social layer
**Session Length:** 10–30 minutes (daily run) / unlimited (world exploration)
**Target Audience:** Lapsed OSRS/browser RPG players (25–40), Wordle/daily puzzle players (18–45), roguelite enthusiasts (20–35)

---

## 2. CORE PHILOSOPHY

**"Every death matters. Every player shapes the world."**

Solara: Sunfall is built on three convictions:

1. **Collective consequence over individual leaderboards.** The game's world state is not determined by who plays best but by how the entire community behaves together. A world-class player and a first-timer both dim the sun when they die. Neither can save it alone.

2. **Permanent legacy over temporary progress.** When you die, something stays. Your grave. Your epitaph. Your story. The world accumulates history, and that history belongs to no one — and everyone.

3. **Urgency without cruelty.** The sun dying is terrifying, but the Sunfall Event is a celebration, not a punishment. The community built this ending together. The new sun is their reward.

---

## 3. PLAYER EXPERIENCE GOALS

### The new player experience (Day 1)
The player lands on the homepage. They see: "The sun burns at 71.4% — 284,122 players have fallen this season." Without logging in, they already feel the stakes. They click Play. The Oracle greets them: "I have watched this desert for longer than your name exists. You will fall. Your grave will remain. Now go."

### The daily player experience (Days 2–30)
The player returns each day for their Daily Rite — the same dungeon the whole world is running today. They compare scores with their Discord server. They visit the grave of someone who died yesterday and leave a Sunstone offering. They watch the sun brightness tick down another 0.3% from last week.

### The invested player experience (Days 31–60)
The player has joined a faction (Sunkeepers). Their Solar Rites have restored 0.003% of the sun's brightness. Their grave from Season 1 is now a shrine that buffs everyone who passes it. They've assembled 7 of the 12 lore codex fragments. They're watching the Sunfall Event timer.

### The veteran experience (Season 2+)
The player recognizes enemy types from the new catastrophe and knows the optimal run strategy for comet-affected dungeons. Their Legacy Relic from Season 1 glows gold in their inventory. They've seen the Oracle broadcast twice. This world is theirs.

---

## 4. CORE LOOP

```
DAILY RITE (Primary loop, ~15 min)
  → Enter today's date-seeded dungeon
  → Survive as many waves as possible
  → Death: write epitaph, grave placed on Living Map
  → Share emoji result card
  → Check global leaderboard rank
  → See sun brightness change

WORLD LAYER (Secondary loop, ~10 min)
  → Visit Living Map
  → Explore other players' graves
  → Leave Sunstone offerings (upgrades graves to shrines)
  → Perform Solar Rites if Sunkeeper-qualified
  → Read Oracle dialogue
  → Collect lore codex fragments

META LAYER (Seasonal, ongoing)
  → Watch sun phase transitions
  → Track faction balance (Sunkeepers vs Eclipsers)
  → Participate in Oracle broadcasts at each threshold
  → Assemble community lore codex
  → Final push: Grand Sunfall Event
  → New season: new catastrophe narrative, clean sun
```

---

## 5. THE SUN PHASE SYSTEM

The sun's brightness is a live global value, calculated server-side and cached every 5 minutes.

### The Equation
```
sunBrightness = max(0, 100 - (totalSeasonDeaths * DEATH_WEIGHT))
```

`DEATH_WEIGHT` is set per season based on expected playerbase size. For a 10,000-player season: `DEATH_WEIGHT = 0.0008` (targeting full dimming over 8 weeks at average play rates).

### Phase Definitions

#### Phase 1 — Full Dawn (100% → 80%)
- **World:** Full color saturation. Vivid amber and gold desert.
- **Combat:** Normal enemy stats. Full healing effectiveness.
- **Social:** Oracle is hopeful. New player messaging active.
- **Special:** Bonus loot rate at 95%+. "The Bright Age" community achievement.
- **Oracle tone:** Welcoming, curious, watching.

#### Phase 2 — Amber Warning (80% → 60%)
- **World:** 10% saturation reduction. Shadows lengthen. Sky shifts amber.
- **Combat:** "Shade" enemy variants begin spawning (+20% HP). Healing –10%.
- **Social:** Oracle shifts to cautionary. Sunkeeper recruitment messages activate.
- **Special:** First lore codex chapter revealed. Death rate graph becomes public.
- **Oracle tone:** Concerned, measuring, beginning to warn.

#### Phase 3 — The Twilight (60% → 40%)
- **World:** 30% desaturation. Permanent orange-tinted darkness. Stars visible.
- **Combat:** "Umbra" elites spawn. Healing –25%. Magic +20% rune cost.
- **Social:** First Oracle global broadcast fires at exactly 60%. Discord/social peak.
- **Special:** Shrine buff radius doubles. Solar relics glow brighter.
- **Oracle tone:** Broadcasting. No longer speaking to one player — speaking to all.

#### Phase 4 — The Dimming (40% → 20%)
- **World:** 60% desaturation. Near-grayscale. Only fire and relics emit color.
- **Combat:** "Eclipse" boss variants active. Healing –50%. Void rift enemies spawn.
- **Social:** Second Oracle broadcast. Sunfall timer visible on homepage.
- **Special:** Eclipsers gain full faction bonus. Last Sunkeeper contention period begins.
- **Oracle tone:** Resigned. Poetic. Preparing.

#### Phase 5 — The Eclipse (20% → 0%)
- **World:** 80%+ desaturation. Monochrome ash world. Fire = only color.
- **Combat:** All enemies +50% stats. Healing barely functional. Torch mechanic active.
- **Social:** Final Oracle broadcast. Grand Sunfall countdown begins. All-time player peaks.
- **Special:** Last Sunkeeper title awarded. Grand Sunfall Event activates at 0%.
- **Oracle tone:** Final message. Speaking to history, not players.

### Visual Implementation
Sun brightness is stored in Supabase and fetched on page load. A CSS custom property `--sun-brightness` is set globally, and a canvas filter applies desaturation:

```javascript
// App.jsx — apply sun brightness to canvas
const applyBrightnessFilter = (brightness) => {
  const saturation = 0.2 + (brightness / 100) * 0.8; // 0.2 to 1.0
  canvas.style.filter = `saturate(${saturation})`;
  document.documentElement.style.setProperty('--sun-brightness', brightness);
};
```

---

## 6. THE COLLECTIVE DEATH EQUATION

### Design Principle
No single player causes the sun to dim meaningfully. No single player can save it alone. The community owns the outcome together.

### Death Weight Calibration
| Playerbase | Death Weight | Deaths to full dim | Season length (at avg 5 deaths/session, 1 session/day) |
|-----------|-------------|-------------------|-------------------------------------------------|
| 1,000 | 0.008 | 12,500 | ~12 days (too fast — use 0.004) |
| 5,000 | 0.002 | 50,000 | ~10 days (too fast) |
| 10,000 | 0.0008 | 125,000 | ~25 days (good for 4-week season) |
| 50,000 | 0.0002 | 500,000 | ~50 days (good for 8-week season) |

Death weight is configurable in Supabase `seasons` table. Adjust each season based on observed death rates in the first 48 hours.

### The Death Spiral (Intentional Design)
Dimmer sun → harder game → more deaths → faster dimming. This is a feature, not a bug. It creates natural urgency without a countdown clock. The curve accelerates toward the end of each season, creating a natural narrative arc.

**Anti-griefing note:** There is no way to intentionally speed the death rate enough to matter. Even if one player died 1,000 times in one day (impossible given session mechanics), they would cause 0.08–0.8% dimming. The death spiral is driven by the community, not exploitable by individuals.

### Faction Modifiers
- **Sunkeeper deaths:** 0.7× death weight (their sacrifice hurts less)
- **Eclipser deaths:** 1.4× death weight (their sacrifice fuels darkness)

---

## 7. FACTION SYSTEM: SUNKEEPERS VS ECLIPSERS

Players choose a faction on first login. The choice is permanent per season (resets each season).

### Sunkeepers
**Ideology:** The sun must be preserved at all cost. Every Rite performed buys more time.
**Mechanical benefits:**
- Deaths count for 0.7× sun dimming
- Can perform Solar Rites (spend 100 Sunstones to restore 0.001% brightness)
- Graves glow gold — visible from further distance
- At 50%+ brightness: +10% healing effectiveness
**Visual identity:** Gold and amber. Warm light trails. Solar iconography.
**Narrative role:** Protagonists. The last line of defense.

### Eclipsers
**Ideology:** The sun dying is transformation, not tragedy. Darkness is power.
**Mechanical benefits:**
- Deaths count for 1.4× sun dimming (accelerate the end)
- +20% loot from all enemies
- At sub-40% brightness: +15% all combat stats
- Eclipser relics carry double XP bonus
**Visual identity:** Deep purple and void-black. Cold light. Eclipse iconography.
**Narrative role:** Antagonists by ideology, not malice. They believe in the rebirth.

### Faction Balance Display
A public faction balance bar (0%–100% Sunkeeper vs Eclipser) is shown on the homepage. Oracle commentary shifts based on which faction is winning. At 60%+ Eclipsers: Oracle broadcasts faster. At 60%+ Sunkeepers: Oracle expresses cautious hope.

---

## 8. DAILY RITES SYSTEM

### Daily Dungeon Generation
The daily dungeon is deterministically generated from a date seed:

```javascript
const getDailySeed = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
};

const generateDailyDungeon = () => {
  const seed = getDailySeed();
  const rng = seededRandom(seed); // simple LCG or mulberry32
  // Generate room sequence, enemy types, loot tables, boss from seed
  return buildDungeon(rng, currentSeasonConfig);
};
```

**The same dungeon for all players globally.** No server required. The seed is the date. Any player on any device on the same date runs the same dungeon.

### Share Card Generation
On run completion or death, generate a canvas-drawn share card:

```
Day 47 · Solara: Sunfall ☀️☀️🌑🌑
Wave 12 · Time 8:42 · Rank #843 globally
[Sunkeeper · Season 1: The Wandering Comet]
"I reached the Comet's shadow. It was beautiful."
```

The card is drawn to a canvas element and exported as a PNG via `canvas.toBlob()` with a Web Share API call. Fallback: clipboard copy of the text version.

### Leaderboard
- Supabase table: `daily_scores`
- Columns: `player_name, wave_reached, time_ms, faction, date_seed, created_at`
- Row-level security: players can only insert their own scores
- Read is public: anyone can see today's leaderboard
- Leaderboard resets daily (query filters by `date_seed = today`)

---

## 9. THE LIVING MAP

### Grave System
On death in the Daily Rite, the player is prompted to write a 1-sentence epitaph (max 80 chars). The grave is written to Supabase:

```sql
CREATE TABLE graves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  epitaph TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  faction TEXT,
  wave_reached INTEGER,
  season INTEGER,
  date_seed TEXT,
  sunstone_offerings INTEGER DEFAULT 0,
  is_shrine BOOLEAN DEFAULT false,
  is_landmark BOOLEAN DEFAULT false,
  landmark_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Death coordinates are the player's last known position on the run map. Graves cluster naturally at hard dungeon zones — those clusters become named landmarks over time.

### Shrine Evolution
| State | Sunstone threshold | Visual | Effect |
|-------|--------------------|--------|--------|
| Grave | 0 offerings | Simple stone marker | No buff |
| Cairn | 10 offerings | Stacked stones with glow | No buff |
| Shrine | 50 offerings | Full shrine with particles | +5% healing within 10 tiles |
| Major Shrine | 200 offerings | Large monument with orbiting relics | +10% healing, +5% XP within 20 tiles |

Shrine evolution is automatic — checked server-side every hour.

### Ghost Replay System
On death, save a compressed action log (last 30 seconds):
```javascript
const deathReplay = {
  player: playerName,
  wave: currentWave,
  positions: positionLog.slice(-300), // 30s at 10fps
  actions: actionLog.slice(-50),
  timestamp: Date.now()
};
// Store compressed in Supabase as JSONB
```

Players visiting a grave see a "Watch replay" button. The ghost renders as a translucent sprite running the player's final 30 seconds on a dimmed overlay.

---

## 10. THE ORACLE SYSTEM

The Oracle is an NPC whose dialogue responds dynamically to game state. They speak at five moments:
1. New player first visit
2. Each sun phase threshold crossed
3. Grand Sunfall Event approach (48h warning)
4. Season-end / new season start
5. Specific community milestones

### Oracle State Machine
```javascript
const getOracleDialogue = (state) => {
  const { sunBrightness, faction, playerWave, isNewPlayer, daysIntoSeason } = state;
  
  if (isNewPlayer) return ORACLE_LINES.welcome[faction || 'neutral'];
  if (sunBrightness <= 20) return ORACLE_LINES.phase5[seasonName];
  if (sunBrightness <= 40) return ORACLE_LINES.phase4[faction];
  if (sunBrightness <= 60) return ORACLE_LINES.phase3_broadcast;
  if (sunBrightness <= 80) return ORACLE_LINES.phase2[daysIntoSeason > 14 ? 'late' : 'early'];
  return ORACLE_LINES.phase1[isNewPlayer ? 'greeting' : 'ambient'];
};
```

### Global Broadcast Mechanic
At exactly 60%, 40%, and 20% brightness, all active sessions receive a WebSocket push (Supabase Realtime) triggering a full-screen Oracle broadcast animation. This is the game's most cinematic moment.

Implementation:
```javascript
// Supabase Realtime subscription
supabase
  .channel('sun-broadcasts')
  .on('broadcast', { event: 'oracle-broadcast' }, ({ payload }) => {
    triggerOracleBroadcast(payload.message, payload.phase);
  })
  .subscribe();
```

---

## 11. RUN STRUCTURE (ROGUELITE ENGINE)

### Run Architecture
Each Daily Rite is a self-contained run:
- **Duration:** Until death or Wave 30 (completion)
- **Structure:** Wave-based dungeon rooms (reuses existing DUNGEON_ROOMS)
- **Progression:** Skills and stats persist from run to run via save system
- **Death:** Permanent within the run. Start next run from Wave 1.
- **Legacy:** Solar Relics carry over. Graves persist. Epitaphs are permanent.

### Wave Design
| Wave Range | Difficulty | Enemy Types | Special |
|-----------|-----------|-------------|---------|
| 1–5 | Tutorial | Basic desert enemies | Loot-heavy |
| 6–10 | Normal | Combat variants | First boss at Wave 10 |
| 11–15 | Hard | Shade variants (Phase 2+) | Branching room paths |
| 16–20 | Very Hard | Elite enemies | Second boss at Wave 20 |
| 21–25 | Brutal | Umbra/Eclipse variants | Void rifts |
| 26–30 | Endgame | Season boss variants | Grand completion reward |

### Procedural Map Generation (Date-Seeded)
```javascript
const generateRunMap = (seed, seasonConfig) => {
  const rng = mulberry32(hashSeed(seed));
  const rooms = [];
  for (let wave = 1; wave <= 30; wave++) {
    rooms.push({
      layout: ROOM_LAYOUTS[Math.floor(rng() * ROOM_LAYOUTS.length)],
      enemies: generateEnemyGroup(wave, seasonConfig.enemyTheme, rng),
      loot: generateLootTable(wave, rng),
      special: wave % 10 === 0 ? 'boss' : rng() < 0.15 ? 'shrine' : 'normal'
    });
  }
  return rooms;
};
```

---

## 12. SKILLS AND PROGRESSION

All 21 existing Dunescape skills are preserved. In the roguelite structure they function as follows:

**Persistent skills (carry across runs):**
- Attack, Strength, Defence, Hitpoints, Ranged, Prayer, Magic
- These increase slowly over many runs — long-term progression

**Run-specific resource skills:**
- Cooking, Herblore, Crafting, Smithing (active during run)
- These provide tactical options within a run but don't gate progression

**World exploration skills (Living Map layer):**
- Mining, Woodcutting, Fishing, Farming — used in the world exploration mode
- These feed into Solar Rite materials

**Faction-specific unlocks at skill milestones:**
- Mining 50 → Solar Ore unlocked (Sunkeeper material)
- Crafting 40 → Eclipse Relic crafting (Eclipser item)

---

## 13. COMBAT SYSTEM

The existing combat triangle (melee/ranged/magic) is preserved in full. Sunfall adds:

### Sun-Phase Combat Modifiers
All modifiers are applied as multipliers to existing damage/healing formulas:

```javascript
const getSunModifiers = (brightness) => ({
  healingMult: brightness >= 80 ? 1.0 : brightness >= 60 ? 0.9 : brightness >= 40 ? 0.75 : brightness >= 20 ? 0.5 : 0.25,
  enemyHPMult: brightness >= 80 ? 1.0 : brightness >= 60 ? 1.2 : brightness >= 40 ? 1.5 : brightness >= 20 ? 2.0 : 2.5,
  magicCostMult: brightness >= 60 ? 1.0 : brightness >= 40 ? 1.2 : 1.5,
});
```

### Seasonal Enemy Variants
Each season adds a theme layer to the existing enemy system without replacing it:

- **Wandering Comet:** "Comet-touched" variants glow with cyan light, have knockback resistance
- **Void Plague:** "Corrupted" variants have a damage-over-time aura
- **Ancient Machine:** "Mechanical" variants are immune to magic
- **Star-Eater:** "Beloved" variants (worshippers) have regeneration
- **Twin Suns:** "False-light" variants mimic benign objects before attacking

---

## 14. SEASONAL CATASTROPHE SYSTEM

See `02_GDD/GDD_SEASONAL_CATASTROPHES.md` for the complete 7-season arc.

### Season Anatomy
Every season consists of:
1. A catastrophe narrative (why the sun is dying this season)
2. A visual theme (enemy reskins, sky layer, map tinting)
3. A lore codex (12 fragments, discovered through play)
4. An Oracle dialogue set (20 lines per phase)
5. A seasonal boss (variant of existing boss system)
6. A legacy relic (unique cosmetic awarded to season participants)

### Season Length Mechanics
Seasons do not have fixed lengths. They end when the sun reaches 0%. A fast-dying community ends the season in 3 weeks. A skilled community might sustain a season for 12 weeks. The Sunfall Event then triggers and the new season begins after the event resolves.

---

## 15. MONETIZATION DESIGN

**Core principle:** The 95% of players who never pay must love the game completely. Monetization exists for the 5% who want to leave a more visible mark on the world.

### Cosmetic Graves ($1–$5)
- Stone type: sandstone / obsidian / solar crystal / void glass
- Glow color: gold / amber / crimson / void purple / custom
- Epitaph font: standard / carved / burning / frozen
- Orbiting offerings: sunstone ring / relic halo / comet fragments
- These are the only paid cosmetics. They are permanent across all seasons.

### Sunkeeper Pact ($5/season)
- Full Solar Codex unlocked immediately (vs community assembly)
- Unique seasonal legacy relic
- Custom grave faction flag
- Ability to leave solar messages (not just epitaphs) at any location
- Priority display in the Archive of the Fallen

### Memorial Stone ($15, limited supply)
- A permanently named stone placed anywhere on the world map
- Not a death grave — intentionally placed
- "The Kira Stone — placed Day 1, Season 1"
- Supply capped at 100 per season
- Cannot be purchased by same player twice per season

### Rewarded Video Ads
- One optional ad per day per player
- Reward: 10 Sunstones (shrine offering currency)
- Never intrusive. Never auto-play. Never required.
- Estimated: $0.01–0.03 per view

---

## 16. UI/UX PRINCIPLES

1. **The sun is always visible.** Every screen shows the current brightness in the corner. It is the heartbeat of the game.

2. **Death is handled with dignity.** The death screen is the most cinematic moment in the player's session. Never dismissive. The Oracle speaks. Time is given for the epitaph.

3. **The world is legible at a glance.** Graves are visible from 20 tiles away. Shrines are obvious. The Living Map reads like a community document.

4. **Share is always one tap away.** The share card generates automatically on death and completion. No friction.

5. **Phase transitions are felt.** When the sun crosses a threshold, the world visually shifts over 3 seconds. Not a popup — a physical change.

---

## 17. AUDIO DIRECTION

The audio system has five states corresponding to the five sun phases:

- **Phase 1 — Full Dawn:** Warm, expansive ambient. Oud and brass. The desert is alive.
- **Phase 2 — Amber Warning:** Subtly dissonant undertones appear. Minor chords introduced.
- **Phase 3 — The Twilight:** Tempo slows. Strings become sparse. Silence grows.
- **Phase 4 — The Dimming:** Near-silence. Distant wind. Occasional deep bass note.
- **Phase 5 — The Eclipse:** A single sustained tone. The world holds its breath.

Oracle broadcast has unique audio: a deep resonant chord that fades in over 5 seconds before text appears.

All audio is procedurally triggered via the Web Audio API based on `--sun-brightness`. No audio files are needed at launch — synthesize from tone generators with appropriate ADSR envelopes.

---

## 18. ACCESSIBILITY

- Full keyboard navigation (existing system preserved)
- Color-blind safe sun phase indicators (brightness shown as number and icon, not color alone)
- Screen reader support for Oracle broadcasts
- Reduced motion option disables phase transition animations
- Font size scaling supported
- Desaturation filter has a bypass toggle for players who need full color for accessibility

---

*Solara: Sunfall GDD v1.0 · VaultSpark Studios · March 2026*
*See companion GDD files for: Sun Phases (extended), Seasonal Catastrophes, Social Systems, Viral Engine, Narrative & Lore, Monetization (detailed)*
