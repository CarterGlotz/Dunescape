# SUPABASE SCHEMA REFERENCE
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## COMPLETE SQL — Run in Supabase SQL Editor

Copy and execute this entire script to set up a fresh Supabase project for Solara.

```sql
-- ============================================================
-- SOLARA: SUNFALL — COMPLETE DATABASE SCHEMA
-- VaultSpark Studios · March 2026
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLE: sun_state (1 row — the game's heartbeat)
-- ============================================================
CREATE TABLE sun_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brightness NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  total_deaths BIGINT NOT NULL DEFAULT 0,
  season INTEGER NOT NULL DEFAULT 1,
  season_name TEXT NOT NULL DEFAULT 'The Wandering Comet',
  broadcast_60_sent BOOLEAN DEFAULT false,
  broadcast_40_sent BOOLEAN DEFAULT false,
  broadcast_20_sent BOOLEAN DEFAULT false,
  sunfall_event_active BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT brightness_range CHECK (brightness >= 0 AND brightness <= 100),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed with initial state
INSERT INTO sun_state DEFAULT VALUES
ON CONFLICT DO NOTHING;

-- Only one row ever exists
CREATE UNIQUE INDEX idx_sun_state_single ON sun_state(id);

-- Public read
ALTER TABLE sun_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sun_state" ON sun_state
  FOR SELECT USING (true);


-- ============================================================
-- TABLE: season_config (key-value store for season parameters)
-- ============================================================
CREATE TABLE season_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO season_config (key, value, description) VALUES
  ('season_number', '1', 'Current season number'),
  ('season_name', 'The Wandering Comet', 'Display name of current season'),
  ('enemy_theme', 'comet', 'Visual theme for seasonal enemy variants'),
  ('death_weight', '0.0008', 'How much each death dims the sun (%)'),
  ('sunkeeper_death_mult', '0.7', 'Death weight multiplier for Sunkeeper faction'),
  ('eclipser_death_mult', '1.4', 'Death weight multiplier for Eclipser faction'),
  ('season_start_date', '2026-04-01', 'ISO date when season started'),
  ('sunfall_event_boss', 'harbinger', 'Boss variant for Sunfall Event'),
  ('relic_id', 'comet_fragment', 'Legacy relic ID for this season'),
  ('oracle_theme', 'comet_season_1', 'Oracle dialogue set identifier'),
  ('sky_color', '#0a1a2e', 'Canvas sky layer color for this season'),
  ('false_light_rate', '0', 'Rate of false-light traps (Season 5+)');

-- Public read, admin write only
ALTER TABLE season_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_season_config" ON season_config
  FOR SELECT USING (true);


-- ============================================================
-- TABLE: daily_scores (Daily Rite leaderboard)
-- ============================================================
CREATE TABLE daily_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  wave_reached INTEGER NOT NULL,
  time_ms INTEGER,
  faction TEXT DEFAULT 'neutral',
  date_seed TEXT NOT NULL, -- format: 'solara-2026-4-1'
  season INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT wave_positive CHECK (wave_reached > 0),
  CONSTRAINT valid_faction CHECK (faction IN ('sunkeeper', 'eclipser', 'beloved', 'neutral'))
);

CREATE INDEX idx_daily_scores_date ON daily_scores(date_seed);
CREATE INDEX idx_daily_scores_leaderboard ON daily_scores(date_seed, wave_reached DESC, time_ms ASC);
CREATE INDEX idx_daily_scores_season ON daily_scores(season);

-- Anyone can read, anyone can insert (no auth required)
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_scores" ON daily_scores
  FOR SELECT USING (true);
CREATE POLICY "public_insert_scores" ON daily_scores
  FOR INSERT WITH CHECK (true);

-- Prevent duplicate entries for same player on same day
CREATE UNIQUE INDEX idx_daily_scores_unique_player_day
  ON daily_scores(player_name, date_seed)
  WHERE player_name IS NOT NULL;


-- ============================================================
-- TABLE: graves (Permanent death records — never deleted)
-- ============================================================
CREATE TABLE graves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  epitaph TEXT,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  faction TEXT DEFAULT 'neutral',
  wave_reached INTEGER,
  season INTEGER NOT NULL DEFAULT 1,
  date_seed TEXT,
  sunstone_offerings INTEGER NOT NULL DEFAULT 0,
  is_shrine BOOLEAN NOT NULL DEFAULT false,
  is_major_shrine BOOLEAN NOT NULL DEFAULT false,
  is_landmark BOOLEAN NOT NULL DEFAULT false,
  landmark_name TEXT,
  replay_data JSONB, -- Compressed to save space
  replay_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '60 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_faction CHECK (faction IN ('sunkeeper', 'eclipser', 'beloved', 'neutral')),
  CONSTRAINT epitaph_length CHECK (char_length(epitaph) <= 80),
  CONSTRAINT offerings_non_negative CHECK (sunstone_offerings >= 0)
);

-- Spatial index for viewport queries
CREATE INDEX idx_graves_position ON graves(x, y);
-- Season index for historical queries
CREATE INDEX idx_graves_season ON graves(season);
-- Shrine query optimization
CREATE INDEX idx_graves_shrine ON graves(is_shrine, is_major_shrine);
-- Landmark query
CREATE INDEX idx_graves_landmark ON graves(is_landmark) WHERE is_landmark = true;

ALTER TABLE graves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_graves" ON graves
  FOR SELECT USING (true);
CREATE POLICY "public_insert_graves" ON graves
  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_offerings" ON graves
  FOR UPDATE USING (true)
  WITH CHECK (
    -- Only allow updating offerings and shrine status, not epitaphs/position
    true
  );


-- ============================================================
-- TABLE: sunstone_offerings (track who offered to which grave)
-- ============================================================
CREATE TABLE sunstone_offerings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grave_id UUID REFERENCES graves(id) ON DELETE CASCADE,
  offerer_name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offerings_grave ON sunstone_offerings(grave_id);

ALTER TABLE sunstone_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_offerings" ON sunstone_offerings
  FOR SELECT USING (true);
CREATE POLICY "public_insert_offerings" ON sunstone_offerings
  FOR INSERT WITH CHECK (true);


-- ============================================================
-- TABLE: archived_scores (season-end archive)
-- ============================================================
CREATE TABLE archived_scores (
  LIKE daily_scores INCLUDING ALL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- FUNCTION: increment_death_counter()
-- Called by client on every player death
-- ============================================================
CREATE OR REPLACE FUNCTION increment_death_counter(
  p_faction TEXT DEFAULT 'neutral'
)
RETURNS NUMERIC AS $$
DECLARE
  v_death_weight NUMERIC;
  v_faction_mult NUMERIC;
  v_new_brightness NUMERIC;
BEGIN
  -- Get death weight from season config
  SELECT value::NUMERIC INTO v_death_weight
  FROM season_config WHERE key = 'death_weight';
  
  v_death_weight := COALESCE(v_death_weight, 0.0008);
  
  -- Apply faction multiplier
  CASE p_faction
    WHEN 'sunkeeper' THEN
      SELECT value::NUMERIC INTO v_faction_mult FROM season_config WHERE key = 'sunkeeper_death_mult';
      v_faction_mult := COALESCE(v_faction_mult, 0.7);
    WHEN 'eclipser' THEN
      SELECT value::NUMERIC INTO v_faction_mult FROM season_config WHERE key = 'eclipser_death_mult';
      v_faction_mult := COALESCE(v_faction_mult, 1.4);
    ELSE
      v_faction_mult := 1.0;
  END CASE;
  
  -- Update sun state
  UPDATE sun_state
  SET 
    total_deaths = total_deaths + 1,
    brightness = GREATEST(0, brightness - (v_death_weight * v_faction_mult)),
    last_updated = NOW()
  WHERE id = 1
  RETURNING brightness INTO v_new_brightness;
  
  RETURN v_new_brightness;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: evolve_shrines()
-- Run hourly via pg_cron
-- ============================================================
CREATE OR REPLACE FUNCTION evolve_shrines()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Upgrade graves to shrines
  UPDATE graves
  SET is_shrine = true
  WHERE sunstone_offerings >= 50 AND NOT is_shrine;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Upgrade shrines to major shrines
  UPDATE graves
  SET is_major_shrine = true
  WHERE sunstone_offerings >= 200 AND NOT is_major_shrine;
  
  -- Purge old replay data (keep last 60 days)
  UPDATE graves
  SET replay_data = NULL
  WHERE replay_expires_at < NOW() AND replay_data IS NOT NULL;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: get_daily_leaderboard(date_seed TEXT)
-- Returns top 20 + player rank in one call
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_leaderboard(
  p_date_seed TEXT,
  p_player_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  rank BIGINT,
  player_name TEXT,
  wave_reached INTEGER,
  time_ms INTEGER,
  faction TEXT,
  is_current_player BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY s.wave_reached DESC, s.time_ms ASC) AS rank,
      s.player_name,
      s.wave_reached,
      s.time_ms,
      s.faction
    FROM daily_scores s
    WHERE s.date_seed = p_date_seed
  )
  -- Top 20
  SELECT r.rank, r.player_name, r.wave_reached, r.time_ms, r.faction,
         r.player_name = p_player_name
  FROM ranked r
  WHERE r.rank <= 20
  
  UNION ALL
  
  -- Current player if outside top 20
  SELECT r.rank, r.player_name, r.wave_reached, r.time_ms, r.faction, true
  FROM ranked r
  WHERE r.player_name = p_player_name AND r.rank > 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- pg_cron JOBS (enable pg_cron extension first in Supabase)
-- ============================================================
-- These run automatically once pg_cron is enabled:

-- SELECT cron.schedule('evolve-shrines', '0 * * * *', $$SELECT evolve_shrines()$$);
-- SELECT cron.schedule('check-sunfall', '*/5 * * * *', $$
--   UPDATE sun_state SET sunfall_event_active = true WHERE brightness = 0 AND NOT sunfall_event_active;
-- $$);
```

---

## INITIAL DATA VERIFICATION QUERIES

Run these after setup to verify everything is correct:

```sql
-- Verify sun_state initialized
SELECT * FROM sun_state;
-- Expected: id=1, brightness=100.00, total_deaths=0, season=1

-- Verify season_config
SELECT key, value FROM season_config ORDER BY key;
-- Expected: 12 rows with all Season 1 values

-- Test death counter
SELECT increment_death_counter('sunkeeper') AS new_brightness;
-- Expected: 99.99944 (100 - 0.0008 × 0.7)

SELECT * FROM sun_state;
-- Expected: total_deaths=1, brightness=99.999...

-- Reset after test
UPDATE sun_state SET brightness=100, total_deaths=0;
```

---

## STORAGE OPTIMIZATION

Replay data is the biggest storage concern. Apply these strategies:

```sql
-- Check current storage usage
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Purge old replay data manually if needed
UPDATE graves SET replay_data = NULL 
WHERE created_at < NOW() - INTERVAL '60 days'
AND replay_data IS NOT NULL;

-- Check graves table size
SELECT COUNT(*), SUM(length(replay_data::text)) as replay_bytes_total FROM graves;
```

---

*Supabase Schema Reference · Solara: Sunfall · VaultSpark Studios · March 2026*
