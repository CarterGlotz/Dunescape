# ARCHITECTURE & INFRASTRUCTURE
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYER'S BROWSER                          │
│                                                              │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │   React + Vite SPA  │  │      localStorage           │   │
│  │   (src/App.jsx)     │  │   (solara_save — full      │   │
│  │                     │  │    player state)            │   │
│  │  - Game engine      │  └─────────────────────────────┘   │
│  │  - Canvas renderer  │                                     │
│  │  - UI components    │  ┌─────────────────────────────┐   │
│  │  - State management │  │   Date-seeded RNG           │   │
│  └────────┬───────────┘  │   (no server required       │   │
│           │               │    for daily dungeon)        │   │
│           │               └─────────────────────────────┘   │
└───────────┼─────────────────────────────────────────────────┘
            │  HTTPS (Supabase JS client)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (FREE TIER)                      │
│                                                              │
│  Tables:                    Functions:                       │
│  - daily_scores             - increment_death_counter()     │
│  - graves                   - check_shrine_evolution()      │
│  - sun_state                                                 │
│  - season_config            Realtime:                        │
│  - sunstone_offerings       - sun-broadcasts channel        │
│                             (Oracle global broadcasts)       │
└─────────────────────────────────────────────────────────────┘
            │  GitHub Actions CI/CD
            ▼
┌─────────────────────────────────────────────────────────────┐
│              GITHUB PAGES (STATIC HOSTING)                   │
│         vaultsparkstudios.github.io/solara/                  │
│                         $0                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## HOSTING: GITHUB PAGES

**Why:** Free, already in use, zero config changes needed.
**URL:** `https://vaultsparkstudios.github.io/solara/`
**Custom domain (optional):** `solara.vaultsparkstudios.com` (CNAME in `public/CNAME`)

### Deployment Pipeline
```yaml
# .github/workflows/deploy-pages.yml
name: Deploy Solara to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_SEASON_NUMBER: ${{ vars.VITE_SEASON_NUMBER }}
          VITE_SEASON_NAME: ${{ vars.VITE_SEASON_NAME }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**GitHub Secrets to set:**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (safe to expose)

**GitHub Variables to set (changeable per season without code deploy):**
- `VITE_SEASON_NUMBER` — current season number
- `VITE_SEASON_NAME` — current season name

---

## DATABASE: SUPABASE FREE TIER

**Why:** 500MB storage, 50,000 MAU, Realtime included, pg_cron for scheduled jobs, all free. No credit card required at launch.

### Free Tier Limits & Storage Estimates

| Table | Rows at 10k MAU | Row size | Total storage |
|-------|----------------|----------|---------------|
| daily_scores | ~500k/season | 200 bytes | 100MB/season |
| graves | ~300k/season | 2KB (with replay) | 600MB/season |
| sun_state | 1 row | 500 bytes | negligible |
| season_config | ~20 rows | 200 bytes | negligible |

**Critical:** Graves are the only table that could overflow. Solutions:
1. Compress replay_data JSONB before storing (gzip reduces to ~400 bytes)
2. Purge replay_data from graves older than 60 days (epitaph and offerings preserved)
3. Cap replay at 15 seconds instead of 30 (halves storage)

At 10k MAU, Season 1 will use approximately 350–500MB. We are right at the free tier limit.
**Action:** Monitor closely, upgrade to Supabase Pro ($25/mo) if needed before end of Season 1.

### Row-Level Security Policy Summary
```sql
-- daily_scores: anyone reads, anyone inserts
-- graves: anyone reads, anyone inserts, anyone updates offerings
-- sun_state: anyone reads, only edge functions write
-- season_config: anyone reads, only owner can write
```

---

## SEASON CHANGE PROCEDURE (Zero-downtime)

Changing seasons requires NO code deploy. It is purely a Supabase config change:

1. Update `season_config` table: new season number, name, death_weight, enemy_theme
2. Update GitHub Variables: `VITE_SEASON_NUMBER` and `VITE_SEASON_NAME`
3. Trigger GitHub Actions deploy (automatic after variable update, or manual dispatch)
4. The Oracle dialogue, enemy themes, and lore codex are all data-driven from `season_config`

**Total time for a season transition: ~5 minutes.**

---

## ORACLE GLOBAL BROADCAST (Supabase Realtime)

When sun brightness crosses a threshold, the Supabase Edge Function fires a Realtime broadcast:

```javascript
// Edge Function: check-sun-threshold.js (runs every 5 minutes via pg_cron)
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);

const THRESHOLDS = [60, 40, 20];

module.exports = async () => {
  const { data: sunState } = await supabase.from('sun_state').select('brightness, last_broadcast_at').single();
  
  for (const threshold of THRESHOLDS) {
    if (sunState.brightness <= threshold && !sunState[`broadcast_${threshold}_sent`]) {
      // Send global broadcast
      await supabase.channel('sun-broadcasts').send({
        type: 'broadcast',
        event: 'oracle-broadcast',
        payload: {
          message: ORACLE_BROADCASTS[threshold],
          phase: Math.floor((100 - threshold) / 20) + 1,
          brightness: sunState.brightness
        }
      });
      
      // Mark as sent
      await supabase.from('sun_state')
        .update({ [`broadcast_${threshold}_sent`]: true })
        .eq('id', 1);
    }
  }
};
```

---

## PUBLIC API

A lightweight read-only API is exposed via Supabase's auto-generated REST API:

```
GET https://[project].supabase.co/rest/v1/sun_state?select=brightness,total_deaths,season,season_name

Response:
{
  "brightness": 74.3,
  "total_deaths": 257143,
  "season": 1,
  "season_name": "The Wandering Comet"
}
```

This enables:
- Fan-built Discord bots (auto-post sun state updates)
- Phone wallpaper widgets
- Streamer overlays
- Third-party trackers

The public API is rate-limited by Supabase's anon key (100 req/hour per IP).

---

## PERFORMANCE TARGETS

| Metric | Target | Notes |
|--------|--------|-------|
| Initial load | < 3s on 3G | Vite bundle optimization, no heavy assets |
| Canvas render | 60fps | Canvas 2D, 544×448px, well within budget |
| Supabase query | < 200ms | Simple indexed queries |
| Sun state refresh | Every 5 min | Cached in React state between refreshes |
| Grave render | < 500ms | Fetch graves in viewport only (spatial index) |
| Share card generation | < 1s | Canvas draw, no external requests |

---

## SCALING PLAN

### 0 → 10k MAU: Current stack, $0/month
Everything fits in Supabase free tier. No changes needed.

### 10k → 50k MAU: Supabase Pro ($25/month)
- Increase DB to 8GB
- Enable daily backups
- Add more edge function invocations
- Consider Cloudflare Pages over GitHub Pages (better global CDN)

### 50k → 200k MAU: Supabase Team ($599/month)
- Dedicated compute
- Read replicas for global leaderboard
- Consider CDN-caching graves API responses
- Possibly split Daily Rites leaderboard to Redis for sub-100ms reads

### 200k+ MAU: Custom infrastructure
- Evaluate AWS/GCP for Sun State service (high-write endpoint)
- Separate read replicas for Living Map (high-read, low-write)
- Cloudflare Workers for edge-cached sun state

**The game is designed so that 99% of its functionality works even if Supabase is down.** The core run, combat, skills, and save system are all localStorage-only. The only degradation when Supabase is unavailable: no leaderboard, no graves, no sun state sync. The game remains fully playable.

---

## AUTOMATED OPERATIONS (Claude/AI ownership)

All of the following can be executed by Claude Code without human involvement:

| Task | Automation method | Frequency |
|------|------------------|-----------|
| Season transition | Update Supabase config + GitHub Variables + trigger deploy | Every 4–12 weeks |
| Death weight calibration | Adjust `death_weight` in Supabase based on observed death rate | First 48h of each season |
| Oracle dialogue updates | Update `oracle_lines` in Supabase | Per season |
| Grave purge (old replay data) | Supabase pg_cron | Weekly |
| Leaderboard archive | Copy `daily_scores` to `archived_scores` at season end | Season transition |
| Sun state broadcast | Supabase Edge Function | Every 5 minutes |

**This game can run indefinitely without the owner touching it, provided Claude Code has Supabase and GitHub access.**

---

*Architecture & Infrastructure · Solara: Sunfall · VaultSpark Studios · March 2026*
