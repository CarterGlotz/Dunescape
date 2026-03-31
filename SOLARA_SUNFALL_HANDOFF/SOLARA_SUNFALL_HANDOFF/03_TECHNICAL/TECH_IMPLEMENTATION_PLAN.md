# TECHNICAL IMPLEMENTATION PLAN
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## OVERVIEW

This document is the authoritative technical roadmap for the Dunescape → Solara: Sunfall conversion. It is written for an AI development agent (Claude Code) operating in the vaultspark-studio-ops workflow.

**Stack:** React 18 + Vite · GitHub Pages · Supabase (free tier) · localStorage
**Entry point:** `src/App.jsx` (currently 2,234 lines, single file)
**File split policy:** Do NOT split until App.jsx exceeds 5,000 lines

---

## PHASE 0: REBRAND EXECUTION (Session 1)

This phase makes zero gameplay changes. It is purely string replacement and infrastructure renaming.

### Step 1: App.jsx string replacements
Search and replace the following in `src/App.jsx`:

```
"Dunescape" → "Solara: Sunfall"
"dunescape" → "solara" (only in string values, not in comments/logic)
"dunescape_save" → "solara_save" (EXCEPT in the migration shim — see below)
"SAVE_VERSION=4" → "SAVE_VERSION=5"
```

### Step 2: Save migration shim
Insert at the top of the save load function (before the existing `loadGame()` call):

```javascript
// Solara migration shim — runs once per client
const migrateSave = () => {
  const oldSave = localStorage.getItem('dunescape_save');
  const newSave = localStorage.getItem('solara_save');
  if (oldSave && !newSave) {
    try {
      const parsed = JSON.parse(oldSave);
      parsed.saveVersion = 5;
      parsed.gameName = 'solara';
      localStorage.setItem('solara_save', JSON.stringify(parsed));
      localStorage.removeItem('dunescape_save');
      console.log('[Solara] Save migrated from Dunescape successfully.');
    } catch (e) {
      console.error('[Solara] Migration failed, starting fresh:', e);
    }
  }
};
migrateSave(); // Call before loadGame()
```

### Step 3: package.json
```json
{
  "name": "solara",
  "description": "Solara: Sunfall — A browser roguelite RPG where a shared sun dims with every death",
  "version": "1.0.0"
}
```

### Step 4: vite.config.js
```javascript
export default {
  base: '/solara/',
  plugins: [react()],
}
```

### Step 5: index.html
```html
<title>Solara: Sunfall</title>
<meta name="description" content="A browser roguelite RPG. A shared sun dims with every death. Will your community save it?">
<meta property="og:title" content="Solara: Sunfall">
<meta property="og:description" content="Every death dims the sun. Run. Survive. Leave your mark forever.">
```

### Step 6: GitHub Actions workflow
In `.github/workflows/deploy-pages.yml`:
```yaml
env:
  GAME_SLUG: solara
  GAME_NAME: "Solara: Sunfall"
```

### Step 7: GitHub repo rename
This is a manual step performed by Carter:
1. GitHub → Settings → Repository name → rename `dunescape` to `solara`
2. GitHub Pages settings: verify source branch still correct
3. Update any external links pointing to the old URL

### Step 8: OSRS geography/IP cleanup
Replace all instances of OSRS-derived location names and NPC names in the NPCS array and map generation:

| Old Name | New Name |
|---------|---------|
| Lumbridge | Solara's Rest |
| Varrock | The Sanctum |
| Barbarian Village | The Outlander Camp |
| Al Kharid | The Amber District |
| Karamja | The Southern Isle |
| Hans (NPC) | Alder |
| Cook (NPC) | Mara |
| Doric (NPC) | Stone-Reader |
| Fishing Tutor (NPC) | The Tide-Watcher |

**Critical:** Do NOT rename gameplay skills. Attack, Strength, Prayer etc. are generic enough that they pose no IP risk. The location names and iconic NPC names are the actual risk vectors.

---

## PHASE 1: DAILY RITES SYSTEM (Sessions 2–4)

### 1.1 Seeded Random Number Generator
Add to App.jsx before game state:

```javascript
// Mulberry32 — fast, high-quality seeded PRNG
const mulberry32 = (seed) => {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const hashSeed = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const getDailySeed = () => {
  const d = new Date();
  return `solara-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
};
```

### 1.2 Daily Dungeon Generation
```javascript
const generateDailyDungeon = (seasonConfig) => {
  const seed = getDailySeed();
  const rng = mulberry32(hashSeed(seed));
  const rooms = [];
  for (let wave = 1; wave <= 30; wave++) {
    const layout = DUNGEON_ROOMS[Math.floor(rng() * DUNGEON_ROOMS.length)];
    const enemyCount = 3 + Math.floor(wave / 3);
    const enemies = generateEnemyGroup(wave, enemyCount, seasonConfig.enemyTheme, rng);
    rooms.push({ layout, enemies, wave, isBoss: wave % 10 === 0 });
  }
  return { seed, rooms, generatedAt: getDailySeed() };
};
```

### 1.3 Supabase Setup

Install Supabase client:
```bash
npm install @supabase/supabase-js
```

Create `src/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Create `.env.local` (never commit to git):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 1.4 Daily Leaderboard

Supabase SQL (run once in Supabase SQL editor):
```sql
CREATE TABLE daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  wave_reached INTEGER NOT NULL,
  time_ms INTEGER,
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

Submit score function:
```javascript
const submitDailyScore = async (playerName, waveReached, timeMs, faction) => {
  const { error } = await supabase.from('daily_scores').insert({
    player_name: playerName,
    wave_reached: waveReached,
    time_ms: timeMs,
    faction: faction,
    date_seed: getDailySeed(),
    season: CURRENT_SEASON
  });
  if (error) console.error('Score submit failed:', error);
};
```

### 1.5 Share Card Generator
```javascript
const generateShareCard = (playerName, waveReached, rank, faction, timeSec) => {
  const phaseEmojis = ['☀️','☀️','🌤️','🌑','🌑'];
  const sunPhase = Math.floor((100 - sunBrightness) / 20);
  const emojiRow = Array(5).fill('').map((_, i) => i < sunPhase ? '🌑' : '☀️').join('');
  
  return `Day ${getDayNumber()} · Solara: Sunfall ${emojiRow}
Wave ${waveReached} · ${formatTime(timeSec)} · Rank #${rank.toLocaleString()} globally
[${faction || 'No faction'} · Season ${CURRENT_SEASON}: ${CURRENT_SEASON_NAME}]

Play free: solara.vaultsparkstudios.com`;
};

const shareResult = async (text) => {
  if (navigator.share) {
    await navigator.share({ text });
  } else {
    await navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard!');
  }
};
```

---

## PHASE 2: LIVING MAP (Sessions 5–6)

### 2.1 Supabase Graves Table
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
  is_landmark BOOLEAN DEFAULT false,
  landmark_name TEXT,
  replay_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_graves_position ON graves(x, y);
CREATE INDEX idx_graves_season ON graves(season);

ALTER TABLE graves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read graves" ON graves FOR SELECT USING (true);
CREATE POLICY "Anyone can insert graves" ON graves FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update offerings" ON graves FOR UPDATE USING (true) WITH CHECK (true);
```

### 2.2 Death Handler
```javascript
const handlePlayerDeath = async (x, y, waveReached) => {
  setGameState(prev => ({ ...prev, screen: 'death' }));
  
  // Prompt for epitaph
  const epitaph = await promptEpitaph(); // modal with 80-char limit
  
  // Capture replay data (last 30s)
  const replayData = {
    positions: positionLog.slice(-300),
    actions: actionLog.slice(-50),
    finalWave: waveReached
  };
  
  // Submit grave to Supabase
  await supabase.from('graves').insert({
    player_name: playerSave.name,
    epitaph: epitaph || 'They fell without words.',
    x, y,
    faction: playerSave.faction,
    wave_reached: waveReached,
    season: CURRENT_SEASON,
    date_seed: getDailySeed(),
    replay_data: replayData
  });
  
  // Update global death counter (Supabase function)
  await supabase.rpc('increment_death_counter');
  
  // Generate share card
  const rank = await fetchDailyRank(playerSave.name);
  const shareText = generateShareCard(playerSave.name, waveReached, rank, playerSave.faction);
  showDeathScreen(shareText, epitaph);
};
```

### 2.3 Shrine Evolution (Edge Function — runs hourly)
```sql
-- Run hourly via Supabase pg_cron
UPDATE graves
SET is_shrine = true
WHERE sunstone_offerings >= 50 AND NOT is_shrine;

UPDATE graves
SET is_major_shrine = true
WHERE sunstone_offerings >= 200 AND NOT is_major_shrine;
```

---

## PHASE 3: SUN PHASE ENGINE (Sessions 7–10)

### 3.1 Global Sun Brightness Table
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
DECLARE
  death_weight NUMERIC;
  season_row sun_state%ROWTYPE;
BEGIN
  SELECT * INTO season_row FROM sun_state WHERE id = 1;
  
  -- Death weight: configurable per season
  SELECT value::NUMERIC INTO death_weight 
  FROM season_config WHERE key = 'death_weight';
  
  UPDATE sun_state 
  SET total_deaths = total_deaths + 1,
      brightness = GREATEST(0, brightness - death_weight),
      last_updated = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Sun State Fetch (Client)
```javascript
const fetchSunState = async () => {
  const { data, error } = await supabase
    .from('sun_state')
    .select('brightness, total_deaths, season, season_name')
    .single();
  if (error) return { brightness: 100, totalDeaths: 0 };
  return data;
};

// Fetch on load, then every 5 minutes
useEffect(() => {
  fetchSunState().then(state => setSunState(state));
  const interval = setInterval(() => {
    fetchSunState().then(state => setSunState(state));
  }, 300000); // 5 min
  return () => clearInterval(interval);
}, []);
```

### 3.3 Visual Desaturation
```javascript
// Apply sun brightness to canvas filter
useEffect(() => {
  if (!canvasRef.current) return;
  const saturation = 0.15 + (sunState.brightness / 100) * 0.85;
  const warmth = sunState.brightness > 60 ? 1 : 0.7 + (sunState.brightness / 60) * 0.3;
  canvasRef.current.style.filter = `saturate(${saturation.toFixed(2)}) sepia(${(1-warmth).toFixed(2)})`;
}, [sunState.brightness]);
```

---

## PHASE 4: ROGUELITE ENGINE (Sessions 11–18)

### 4.1 Architecture Decision
The current game has a persistent open world (100×100 tile map). The roguelite engine wraps the dungeon system into the primary game mode. The open world map becomes the Living Map — a social layer, not the primary play space.

### 4.2 Run State vs Persistent State
```javascript
// Persistent state (survives between runs)
const persistentState = {
  playerName: '',
  faction: null,
  skills: {}, // long-term skill XP
  solarRelics: [], // legacy items
  totalRunsCompleted: 0,
  seasonParticipated: [],
};

// Run state (reset on death)
const runState = {
  currentWave: 1,
  runHP: MAX_HP,
  runInventory: [],
  runBuffs: [],
  positionLog: [],
  actionLog: [],
  runStartTime: Date.now(),
};
```

### 4.3 Procedural Map Rooms
The existing `DUNGEON_ROOMS` array is repurposed as the run room pool. Key changes:
- Remove static world tile coordinates from room definitions
- Add `difficulty` field to each room
- Add `seasonTheme` field for enemy skin overrides

---

## PHASE 5: SEASON 1 LAUNCH (Sessions 19–24)

### 5.1 Season Config System
```javascript
const SEASON_CONFIG = {
  season: 1,
  name: 'The Wandering Comet',
  enemyTheme: 'comet',
  skyColor: '#1a3a5c', // deep night with comet
  deathWeight: 0.0008,
  loreCodexCount: 12,
  bossVariant: 'harbinger',
  relicId: 'comet_fragment',
  startDate: '2026-01-01', // Update to actual launch date
};
```

### 5.2 Prophecy Scroll Generator
The Prophecy Scroll is a canvas-generated image shared on death:

```javascript
const generateProphecyScroll = (canvas, playerData) => {
  const ctx = canvas.getContext('2d');
  const { name, wave, faction, season, epitaph } = playerData;
  
  // Background: dark amber with sun silhouette
  ctx.fillStyle = '#1a0f00';
  ctx.fillRect(0, 0, 400, 300);
  
  // Sun silhouette (dimness based on current brightness)
  const alpha = sunBrightness / 100;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#c87820';
  ctx.beginPath();
  ctx.arc(200, 120, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Player name and stats
  ctx.fillStyle = '#f0c060';
  ctx.font = 'bold 18px serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 200, 200);
  
  ctx.fillStyle = '#a08040';
  ctx.font = '14px serif';
  ctx.fillText(`Wave ${wave} · ${faction || 'No faction'} · Season ${season}`, 200, 225);
  
  // Prophecy text
  const prophecy = generateProphecyText(name, wave, faction);
  ctx.fillStyle = '#806030';
  ctx.font = 'italic 12px serif';
  wrapText(ctx, prophecy, 200, 260, 340, 18);
  
  return canvas.toDataURL('image/png');
};

const generateProphecyText = (name, wave, faction) => {
  const prophecies = [
    `${name} who reached Wave ${wave} — the Oracle says: your grave will be a shrine before the season ends.`,
    `The comet saw ${name} fall at Wave ${wave}. It will remember.`,
    `${faction === 'sunkeeper' ? 'A keeper of light' : 'A child of shadow'} fell at Wave ${wave}. The sun dims.`,
    `${name}: Wave ${wave}. The Oracle says: you will return. The desert keeps its promises.`,
  ];
  return prophecies[Math.abs(hashSeed(name + wave)) % prophecies.length];
};
```

---

## FILE SPLIT STRATEGY (When App.jsx > 5,000 lines)

When App.jsx exceeds 5,000 lines, split in this order:

1. `src/constants.js` — All ITEMS, SKILLS, MONSTERS, DUNGEON_ROOMS, etc.
2. `src/gameLogic.js` — Combat, skill XP, damage calculations
3. `src/mapGen.js` — genMap(), genObjs(), daily dungeon generation
4. `src/supabase.js` — All Supabase calls
5. `src/shareCard.js` — Share card and Prophecy Scroll generation
6. `src/App.jsx` — React component and state only

Do not split before this threshold. The context coherence of keeping everything in App.jsx outweighs the organizational benefits until the file becomes unmanageable.

---

## ENVIRONMENT VARIABLES

```bash
# .env.local — never commit
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SEASON_NUMBER=1
VITE_SEASON_NAME="The Wandering Comet"
VITE_DEATH_WEIGHT=0.0008

# .env.production — can commit (public keys are safe for Supabase anon)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

---

## TESTING CHECKLIST (Before each phase ship)

- [ ] Existing player saves load correctly (both old `dunescape_save` and new `solara_save`)
- [ ] Canvas renders at correct 544×448px (17×14 tiles × 32px)
- [ ] Daily dungeon generates identically for same date (test: generate twice, compare)
- [ ] Leaderboard scores submit without error
- [ ] Graves appear on world map within 30 seconds of death
- [ ] Sun brightness fetches on load, refreshes every 5 minutes
- [ ] Share card generates and copies/shares correctly
- [ ] Supabase stays on free tier (check usage dashboard)
- [ ] GitHub Pages deployment succeeds via CI workflow

---

*Technical Implementation Plan · Solara: Sunfall · VaultSpark Studios · March 2026*
