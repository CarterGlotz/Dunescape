# Latest Handoff

Last updated: 2026-03-27

## What was completed this session

**Full Task Board Clearout — Phase 4 Roguelite Engine + 4 SIL items + Shrine Evolution**

### App.jsx changes (~2851 lines, build 348 KB / 106 KB gzip)

**Phase 4: Roguelite Engine (primary game mode)**
- `ROGUE_ROOMS` array — 17 rooms across 4 difficulty tiers (Goblin/Chicken/Scorpion/Cow → Spider/Zombie/Flesh Crawler/Hobgoblin/Wolf → Hill Giant/Necromancer/Moss Giant/Rock Crab → White Knight/Lesser Demon/Ice Warrior/Dark Conclave)
- `ROGUE_BOSS` — Shadow Drake boss fight every 10 waves
- `getRogueRoom(wave, rng)` — selects room from pool based on wave tier
- `scaleRogueMon(stats, wave)` — scales HP/atk/def/str/xp by +6% per wave
- `RELICS` array — 5 persistent relics: Solar Fragment (+5 HP), Ember Ring (+2 STR), Shade Cloak (+2 DEF), Comet Shard (+2 ATK), Oracle's Eye (+3 Prayer)
- `getRogueRelicReward(wave)` — awards relic at wave 10, 20, 30, 40, 50
- `rogueRunRef` state + `rogueTick` for UI reactivity
- `startRogueRun()` — creates run with seeded RNG, applies relic bonuses, teleports to dungeon
- `endRogueRun(wave)` — restores pre-run stats, awards relics, updates rogueliteStats, triggers epitaph
- Dungeon entrance handler extended to support roguelite runs (room selection + stat scaling)
- Wave-advance check added for roguelite (auto-spawns next wave after clearing)
- Death handler routes roguelite deaths through endRogueRun before epitaph modal
- Monster kill handler routes rogueRun monsters to permanent removal (no respawn)
- Roguelite stats persisted in save: `rogueliteStats: {bestWave, totalRuns, relics}`
- Roguelite UI in Daily tab: start button, wave/difficulty display, run stats, relic inventory

**Phase 2: Shrine Evolution (client-side)**
- `offerSunstone()` now checks offering thresholds (50 → is_shrine, 200 → is_major_shrine) and updates Supabase accordingly
- Chat announcements when a grave evolves ("This grave has become a Shrine/Major Shrine!")

**[SIL] Sun Pulse Animation**
- New `@keyframes sunPulse` CSS animation (opacity 1→0.55→1 with text-shadow glow)
- Applied to HUD ☀ indicator with speed based on sunBrightness (4s at >80%, 3s at >60%, 2s at >40%, 1.2s at >20%, 0.7s at ≤20%)
- Creates visceral urgency as sun dims — pulsing gets faster and more alarming

**[SIL] Faction Leaderboard Split**
- Daily leaderboard now grouped by faction: ☀ Sunkeepers, 🌑 Eclipsers, ⚖ Unaligned
- Each faction section shows its entries with faction-themed colors
- Empty factions hidden automatically

**Already implemented (marked ✅ — were on task board but code already existed):**
- Shrine glow on world map (✦ gold for ≥50 offerings, glow+shadow for ≥200)
- Milestone death announcements (HUD flash + chat at 100/500/1K/5K/10K/50K/100K)

---

## What is mid-flight

**Carter's Supabase manual tasks (still blocked, no change):**

1. Create Supabase project at supabase.com (free tier)
2. Run **all 4** SQL blocks in Supabase SQL editor (unchanged from prior handoff):

**Block 1 — daily_scores (Phase 1):**
```sql
CREATE TABLE daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  wave_reached INTEGER NOT NULL,
  faction TEXT DEFAULT 'neutral',
  date_seed TEXT NOT NULL,
  season INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_daily_scores_date ON daily_scores(date_seed);
CREATE INDEX idx_daily_scores_wave ON daily_scores(date_seed, wave_reached DESC);
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read scores" ON daily_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scores" ON daily_scores FOR INSERT WITH CHECK (true);
```

**Block 2 — graves (Phase 2):**
```sql
CREATE TABLE graves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  epitaph TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  faction TEXT,
  wave_reached INTEGER,
  season INTEGER DEFAULT 1,
  date_seed TEXT,
  sunstone_offerings INTEGER DEFAULT 0,
  is_shrine BOOLEAN DEFAULT false,
  is_major_shrine BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_graves_position ON graves(x, y);
CREATE INDEX idx_graves_season ON graves(season);
ALTER TABLE graves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read graves" ON graves FOR SELECT USING (true);
CREATE POLICY "Anyone can insert graves" ON graves FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update offerings" ON graves FOR UPDATE USING (true) WITH CHECK (true);
```

**Block 3 — sun_state (Phase 3):**
```sql
CREATE TABLE sun_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brightness NUMERIC(5,2) DEFAULT 100.00,
  total_deaths BIGINT DEFAULT 0,
  season INTEGER DEFAULT 1,
  season_name TEXT DEFAULT 'The Wandering Comet',
  last_updated TIMESTAMP DEFAULT NOW()
);
INSERT INTO sun_state DEFAULT VALUES;

CREATE OR REPLACE FUNCTION increment_death_counter()
RETURNS void AS $$
BEGIN
  UPDATE sun_state
  SET total_deaths = total_deaths + 1,
      brightness = GREATEST(0, brightness - 0.0008),
      last_updated = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_death_counter() TO anon;
```

**Block 4 — oracle_subscriptions (Innovation #2):**
```sql
CREATE TABLE oracle_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  player_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE oracle_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON oracle_subscriptions FOR INSERT WITH CHECK (true);
```

3. Add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env.local + GitHub Secrets

**Carter additional manual actions:**
- Post to itch.io — list game at itch.io with devlog
- Discord bot — create app at discord.com/developers; get token; run in discord-bot/
- Twitch extension — submit twitch-extension/ via Twitch Developer Console

## What to do next

1. **Carter action** — Supabase setup (all 4 SQL blocks above) + env vars
2. **Carter action** — itch.io listing + Discord bot launch + Twitch extension submission
3. **Phase 5** — Season 1: The Wandering Comet config + launch prep

## Constraints

- App.jsx is ~2851 lines — do NOT split until 5000 lines
- Supabase free tier: 500MB, 50k MAU — monitor usage dashboard
- Never destroy `dunescape_save` data — migration shim handles it
- Discord bot requires separate hosting — not part of GitHub Pages deploy

## Read these first next session

1. `AGENTS.md`
2. `context/LATEST_HANDOFF.md` (this file)
3. `context/SELF_IMPROVEMENT_LOOP.md` — check prior SIL commitments
