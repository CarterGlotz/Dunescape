# DEPLOYMENT & LAUNCH PLAN
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## DEPLOYMENT ARCHITECTURE

### Hosting Stack
```
GitHub Pages (game files)     → $0/month
Supabase free tier (data)     → $0/month  
Domain (optional CNAME)       → $10–15/year
Total at launch               → $0/month
```

### Deployment Trigger
Every push to `main` branch automatically triggers GitHub Actions:
1. `npm ci` — install dependencies
2. `npm run build` — Vite production build
3. Deploy to GitHub Pages via `peaceiris/actions-gh-pages`

**Deploy time:** ~3 minutes from push to live.

### Rollback Procedure
If a bad build ships:
```bash
git revert HEAD
git push origin main
# GitHub Actions redeploys automatically
```

---

## PRE-LAUNCH CHECKLIST

### Code Quality
- [ ] `npm run build` passes with zero warnings
- [ ] All OSRS-derived names replaced (grep for: Lumbridge, Varrock, Hans, Al Kharid)
- [ ] Save migration shim present and tested
- [ ] No `console.error` calls in production code path
- [ ] No hardcoded Supabase keys in source files
- [ ] `src/App.jsx` under 5,000 lines

### Supabase Setup
- [ ] Project created at supabase.co
- [ ] All tables created (`daily_scores`, `graves`, `sun_state`, `season_config`)
- [ ] Row-level security policies applied
- [ ] `increment_death_counter()` function deployed
- [ ] `sun_state` initialized with `{brightness: 100, total_deaths: 0, season: 1}`
- [ ] `season_config` initialized with Season 1 values
- [ ] GitHub Secrets set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### GitHub Configuration
- [ ] Repo renamed to `solara`
- [ ] GitHub Pages enabled (Settings → Pages → Source: gh-pages branch or GitHub Actions)
- [ ] GitHub Variables set: `VITE_SEASON_NUMBER=1`, `VITE_SEASON_NAME=The Wandering Comet`
- [ ] Deploy workflow updated (`.github/workflows/deploy-pages.yml`)

### Testing Matrix
- [ ] Game loads at `https://vaultsparkstudios.github.io/solara/`
- [ ] Old `dunescape_save` migrates to `solara_save` on first load
- [ ] Daily Rites dungeon generates (test: load page, click "Play Today's Rite")
- [ ] Score submits to Supabase leaderboard
- [ ] Leaderboard displays
- [ ] Share card generates and copies correctly
- [ ] Death creates grave in Supabase
- [ ] Grave appears on world map
- [ ] Sun brightness fetches from Supabase
- [ ] Canvas desaturation updates with brightness
- [ ] Oracle dialogue responds to sun state

### Performance Validation
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- [ ] Load time < 3 seconds on simulated 3G (Chrome DevTools throttling)
- [ ] Bundle size < 500KB gzipped (check: `vite build --report`)
- [ ] Canvas renders at stable 60fps (no jank on older devices)

---

## LAUNCH SEQUENCE (Day of Launch)

### T-24 hours
- Final build deployed and tested
- Supabase sun_state confirmed at 100% brightness
- Discord server created with channels set up
- itch.io listing published (with "in development" tag if needed)

### T-2 hours  
- Test share card on actual mobile device
- Test epitaph input on mobile keyboard
- Confirm Supabase Realtime connection works (test Oracle broadcast channel)

### T-0 (Launch)
1. Post in Discord: "Solara: Sunfall is live. [URL]. The sun burns at 100%. How long will it last?"
2. Post on Reddit (r/WebGames, r/incremental_games)
3. Share the link personally in 3–5 relevant Discord servers
4. Post your own Day 1 Daily Rites result immediately (sets the precedent)

### T+6 hours
- Check Supabase: are scores appearing in `daily_scores`?
- Check Supabase: are graves appearing in `graves`?
- Check death counter: is it incrementing?
- Any console errors in production? (Check Sentry if configured, or browser DevTools)

### T+24 hours
- Screenshot of the world map with first graves and post: "24 hours in. The world already has stories."
- Check sun brightness: what % has it dropped?
- Post the current state: "Day 1: The sun is at X%. Y players have fallen. Z graves mark the desert."

---

## SEASON TRANSITION PROCEDURE

When sun hits 0% and the Sunfall Event resolves, run this procedure:

### Step 1: Archive Season 1 data (Supabase)
```sql
-- Archive daily scores
INSERT INTO archived_scores SELECT *, 1 AS season FROM daily_scores;
TRUNCATE daily_scores;

-- Archive graves (keep them — they persist across seasons)
UPDATE graves SET season = 1 WHERE season IS NULL;
-- Graves are NOT deleted. They accumulate across all seasons.

-- Reset sun state
UPDATE sun_state SET 
  brightness = 100,
  total_deaths = 0,
  season = 2,
  season_name = 'The Void Plague',
  broadcast_60_sent = false,
  broadcast_40_sent = false,
  broadcast_20_sent = false;
```

### Step 2: Update season config (Supabase)
```sql
UPDATE season_config SET 
  value = '2' WHERE key = 'season_number';
UPDATE season_config SET 
  value = 'The Void Plague' WHERE key = 'season_name';
UPDATE season_config SET 
  value = 'void' WHERE key = 'enemy_theme';
UPDATE season_config SET 
  value = '0.0008' WHERE key = 'death_weight';
```

### Step 3: Update GitHub Variables and redeploy
1. GitHub → Settings → Variables → Update `VITE_SEASON_NUMBER` to `2`
2. GitHub → Settings → Variables → Update `VITE_SEASON_NAME` to `The Void Plague`
3. Trigger manual workflow dispatch OR push an empty commit to main

### Step 4: Post season transition announcement
"Season 1: The Wandering Comet has ended. The comet has passed. 247,841 players fell. The Last Sunkeeper was [name]. Season 2 begins now. Something is wrong with the dungeons."

**Total season transition time: 15–20 minutes.**

---

## MONITORING & ALERTS

### What to watch (check weekly)
| Metric | Warning threshold | Critical threshold |
|--------|-----------------|-------------------|
| Supabase DB size | > 300MB | > 450MB (upgrade before 500MB) |
| Supabase MAU | > 35,000 | > 48,000 |
| Daily Rites submissions | < 10/day | < 5/day |
| Graves created | < 5/day | < 1/day |
| GitHub Actions success rate | < 95% | < 80% |

### Error monitoring (free options)
- **Sentry** (free for small volume): catches JavaScript errors in production
- **Plausible.io** ($9/mo): privacy-first analytics, no cookies, no GDPR issues
- **UptimeRobot** (free): pings the game URL every 5 minutes, alerts if down

---

## DISASTER RECOVERY

### Scenario: Supabase is down
- Game remains fully playable (localStorage only)
- Leaderboard shows "unavailable" gracefully
- Graves don't load (show "The map is quiet today" placeholder)
- Players can still run dungeons, progress skills, die
- Score and grave submitted on next successful connection attempt

### Scenario: GitHub Pages is down
- Nothing we can do — static hosting outage
- Usually resolves in <1 hour
- Consider Cloudflare Pages as backup (same deploy, different host)

### Scenario: Bad deploy pushed
```bash
git revert HEAD --no-edit
git push origin main
# Auto-redeploy in ~3 minutes
```

### Scenario: Sun dims too fast (community dies too much)
```sql
-- Lower death weight immediately (takes effect within 5 minutes)
UPDATE season_config SET value = '0.0004' WHERE key = 'death_weight';
```

### Scenario: Sun dims too slow (community too good)
```sql
-- Raise death weight
UPDATE season_config SET value = '0.0012' WHERE key = 'death_weight';
```

---

*Deployment & Launch Plan · Solara: Sunfall · VaultSpark Studios · March 2026*
