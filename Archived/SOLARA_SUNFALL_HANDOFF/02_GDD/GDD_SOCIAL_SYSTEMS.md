# GDD: SOCIAL SYSTEMS
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## DESIGN PRINCIPLE: ASYNC SOCIAL

Solara's social layer is **entirely asynchronous**. There is no real-time multiplayer. No websocket game state sync. No latency concerns. Players affect each other through data they leave behind, not through shared presence.

This is by design. Async social is:
- Free to operate (no multiplayer servers)
- Accessible to casual players (no "I missed the event" penalty)
- Emotionally richer (you visit a grave, not a player)
- Permanence-first (the world accumulates, not resets)

---

## THE LIVING MAP

### Architecture
The Living Map is a read-only overlay on the game world. Players see:
- Grave markers (small stone icon) at every death location
- Shrine indicators (glowing stone icon) at evolved graves
- Landmark names (floating text) at named areas
- A cluster density indicator at high-death zones

### Viewport Optimization
To avoid loading 300,000 graves simultaneously:
```javascript
const fetchGravesInViewport = async (viewX, viewY, viewRadius) => {
  const { data } = await supabase
    .from('graves')
    .select('id, player_name, epitaph, x, y, faction, wave_reached, is_shrine, is_major_shrine, is_landmark, landmark_name')
    .gte('x', viewX - viewRadius)
    .lte('x', viewX + viewRadius)
    .gte('y', viewY - viewRadius)
    .lte('y', viewY + viewRadius)
    .limit(200); // Max 200 graves rendered at once
  return data || [];
};
```

### Grave Interaction
When a player clicks a grave:
1. Show grave card: player name, epitaph, faction symbol, wave reached, date
2. "Watch replay" button (if replay_data exists and within 60 days)
3. "Leave offering" button (costs 10 Sunstones, increments `sunstone_offerings`)
4. If is_shrine: show "Active shrine — +5% healing within 10 tiles"
5. If is_landmark: show landmark name with golden border

### Ghost Replay Technical Implementation
```javascript
const watchGhostReplay = async (grave) => {
  if (!grave.replay_data) {
    showToast('This ghost has faded from memory.');
    return;
  }
  
  const { positions, actions, finalWave } = grave.replay_data;
  
  // Render ghost as semi-transparent sprite
  setGhostState({
    active: true,
    positions: positions,
    faction: grave.faction,
    currentFrame: 0,
  });
  
  // Animate through position log
  const interval = setInterval(() => {
    setGhostState(prev => {
      if (prev.currentFrame >= positions.length - 1) {
        clearInterval(interval);
        return { ...prev, active: false };
      }
      return { ...prev, currentFrame: prev.currentFrame + 1 };
    });
  }, 100); // 10fps playback
};
```

---

## THE SUNSTONE ECONOMY

Sunstones are the social currency of the Living Map.

### How to earn Sunstones
- Complete a wave (1 Sunstone per 5 waves)
- Daily login bonus (5 Sunstones)
- Watch a rewarded video ad (10 Sunstones, once/day)
- Sunkeeper Pact subscription (weekly allocation)

### How to spend Sunstones
- Leave a grave offering (10 Sunstones)
- Solar Rites (100 Sunstones — restores 0.001% global sun brightness)
- Unlock Codex fragments early (50 Sunstones)

### Why Sunstones work as social currency
The cost to offer is low (10 Sunstones), but the supply is finite. This creates genuine decision-making: "Do I offer to this grave, or save for a Solar Rite?" The tension is the social mechanic.

---

## SOLAR RITES (Sunkeeper Exclusive)

Solar Rites are the highest form of social action in the game.

### Mechanics
- Requires: Sunkeeper faction, Wave 30 completion (once per season)
- Cost: 100 Sunstones
- Effect: Restore 0.001% of global sun brightness
- Announcement: A brief Oracle acknowledgment visible to all players: "A Solar Rite was performed. [PlayerName] has held back the dark for a moment."

### Why Solar Rites matter
- They're rare (requires Wave 30, only achievable by skilled players)
- They're public (announced to all players)
- They're collectively meaningful (100 rites = 0.1% of the sun — visible on the brightness counter)
- They give skilled Sunkeeper players a specific reason to reach Wave 30 beyond personal achievement

### The Last Sunkeeper
The player who performs a Solar Rite within the final 1% before the sun hits 0% is awarded the "Last Sunkeeper" title. Their name appears permanently on the world map — not as a grave, but as a golden inscription near the world's center. One name per season, visible forever.

---

## THE ARCHIVE OF THE FALLEN

A public web page (not in-game — separate HTML page at `/archive`) showing:
- Total players per season
- Total deaths per season
- Notable epitaphs (community-voted)
- Famous graves (highest offerings)
- The Last Sunkeeper for each season
- Sun brightness graph over the season's duration

This page is static (generated from Supabase data nightly) and serves as:
- SEO content (indexed by Google, brings in new players)
- Community memory (players return to see their legacy)
- Press/media asset ("here's the record of what the community built")

---

## FACTION SOCIAL DYNAMICS

The faction war creates organic social tension:

### Sunkeeper community identity
- "We protect the light"
- Discord channel: #faction-sunkeepers
- Sub-community: tracking Solar Rites performed, who's done them
- Pride in collective brightness preservation

### Eclipser community identity
- "We embrace the inevitable"
- Discord channel: #faction-eclipsers
- Sub-community: competing to reach end-of-season first
- Dark aesthetic pride — screenshots of 20% brightness world, Phase 5 desaturation

### Faction balance discourse
The publicly visible faction balance (% Sunkeeper vs Eclipser) generates ongoing community discourse: "We're at 55% Sunkeepers and the sun is still falling. They're all dying too." Strategy discussions naturally arise.

### The Hidden Faction
In Season 4, The Beloved can only be found by players who explore specific dungeon rooms with unusually cryptic Oracle hints. The moment the community discovers The Beloved exists is a viral event in itself — and then the discourse about whether to join them begins.

---

## DISCORD INTEGRATION

### Auto-posts via Discord bot
The Supabase public API enables a Discord bot to post:

- Hourly: "The sun burns at X.X% — Y deaths this season"
- On phase transition: full Oracle broadcast text posted in #announcements
- Daily: Today's top 3 Daily Rites scores
- On shrine creation: "A new shrine has formed at [location]. Grave of [name]. They reached Wave [X] in Season [Y]."
- On landmark creation: "A new landmark: [name]. Located where [X] players have fallen."

### Discord bot implementation
Simple bot using the public Supabase REST API:
```javascript
// Bot polls Supabase every hour
const sunState = await fetch(`${SUPABASE_URL}/rest/v1/sun_state?select=*`,
  { headers: { apikey: SUPABASE_ANON_KEY } });
// Post to Discord webhook
await fetch(DISCORD_WEBHOOK, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: `The sun burns at ${sunState.brightness.toFixed(1)}% — ${sunState.total_deaths.toLocaleString()} players have fallen this season.`
  })
});
```

This bot can be hosted for free on any Node.js hosting platform (Render free tier, Deno Deploy, Cloudflare Workers).

---

*Social Systems GDD · Solara: Sunfall · VaultSpark Studios · March 2026*
