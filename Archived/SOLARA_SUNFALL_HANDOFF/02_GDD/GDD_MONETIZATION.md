# GDD: MONETIZATION DESIGN
### Solara: Sunfall · VaultSpark Studios · March 2026

---

## CORE PRINCIPLE

**The 95% who never pay must love this game completely.**

Monetization exists for the 5% who want to leave a more permanent, more visible mark on a world they already love. Nothing is paywalled. No progression is locked. No mechanic requires payment. The free experience is the full experience.

Every paid item answers the question: "How do I make my legacy more beautiful?" Not "How do I win faster?"

---

## PRODUCT CATALOG

### 1. Cosmetic Grave Upgrades ($1–$5 one-time)

**What it is:** Visual customization for the permanent grave every player leaves on the world map.

**Why players buy it:** Your grave is permanent. It will be seen by every player who visits your death location for as long as the game runs. Players who care about their legacy (most engaged players do) will pay to make it beautiful.

**Product tiers:**

| Tier | Price | Items |
|------|-------|-------|
| Stone type | $1 | Obsidian stone, Solar crystal, Void glass |
| Glow effect | $1 | Gold glow, Amber pulse, Crimson ember, Void shimmer |
| Epitaph style | $1 | Carved serif, Burning text, Frost-etched, Ancient script |
| Orbital decoration | $2 | Sunstone ring, Relic halo, Comet fragments, Eclipse orb |
| Full grave bundle | $5 | All of the above + custom grave flag |

**Implementation:** Grave cosmetics are stored in `solara_save` and submitted with the grave record to Supabase. The client renders them on the grave marker based on the cosmetic data.

---

### 2. Sunkeeper Pact — Season Pass ($5/season)

**What it is:** A seasonal subscription (not auto-renewing — one purchase per season) that unlocks a premium social layer.

**What it includes:**
- Full Solar Codex immediately (normally unlocked as community assembles fragments over weeks)
- Unique seasonal legacy relic (different color/effect from free version)
- Custom grave flag (visible from 3× normal distance)
- Solar messages (place messages anywhere on the world map, not just epitaphs at death locations)
- Priority display in the Archive of the Fallen
- Patron badge in Discord

**What it does NOT include:**
- No combat advantages
- No extra lives or run restarts
- No faster skill progression
- No additional Solar Rites

**Why $5/season:** Low enough to feel like a tip, not a commitment. Players who love the game will pay to support it. The Solar Codex immediate unlock is the primary value for story-focused players.

**Revenue projection:**
- At 1,000 DAU: 5% conversion = 50 payers × $5 = $250/season ($500–1,000/month)
- At 10,000 DAU: 5% conversion = 500 payers × $5 = $2,500/season ($5,000–10,000/month)

---

### 3. Memorial Stone ($15, strictly limited)

**What it is:** A permanently named stone placed anywhere on the world map. Not a death grave — an intentional monument that the player places themselves.

**Why it's special:**
- Not triggered by death — chosen deliberately
- Can be placed anywhere (not just dungeon death coordinates)
- Capped at 100 per season — genuine scarcity
- Persists across all seasons forever
- "The Kira Stone — placed Day 1, Season 1" — temporal pride

**Why $15:** This is the game's prestige item. The price reflects permanence and scarcity, not feature value. Players who buy this understand they're writing their name into the world's history.

**Supply constraint:** 100 per season, purchased on a first-come basis. When sold out, a waitlist opens for Season 2. The sold-out state itself is a community signal: "100 people cared enough to pay."

**Revenue projection:**
- Season 1: 50 sold (assuming < 5k total players) = $750
- Season 3+: 100 sold per season = $1,500/season

---

### 4. Rewarded Video Ads (Optional, player-initiated)

**What it is:** A "Watch an ad for 10 Sunstones" button in the Sunstone wallet UI. Completely optional. Never auto-play. Never required.

**Implementation:** AdSense display, or Unity Ads / AdColony for rewarded video. The button is visible but quiet — below the fold, not prominent.

**Revenue:** $0.01–0.03 per view. At 500 DAU watching 1 ad/day: $5–$15/day = $150–$450/month. Not significant alone, but adds up alongside other streams.

**Why this is ethical:** Players choose to watch. They get something meaningful (Sunstones for shrine offerings or Solar Rites). The game never asks them to watch or mentions ads in any other context.

---

### 5. Tip Jar / Ko-fi Integration

A simple "Support the Oracle" button on the main menu and game over screen. Links to a Ko-fi or similar one-time donation page.

**Why it converts:** Players who've had an emotional experience (just died and wrote an epitaph they're proud of; just saw the Oracle broadcast) are primed to want to give back. Meeting them in that moment with a low-friction tip option converts.

**Revenue target:** $50–200/month initially. Not significant, but signals community love.

---

## REVENUE PROJECTIONS

### Conservative (5k MAU)
| Stream | Monthly |
|--------|---------|
| Grave cosmetics | $100–300 |
| Sunkeeper Pact (amortized/month) | $400–800 |
| Memorial Stones (amortized/month) | $100–200 |
| Rewarded ads | $50–100 |
| Ko-fi tips | $50–100 |
| **Total** | **$700–1,500/month** |

### Target (15k MAU)
| Stream | Monthly |
|--------|---------|
| Grave cosmetics | $300–700 |
| Sunkeeper Pact | $1,200–2,500 |
| Memorial Stones | $300–500 |
| Rewarded ads | $150–300 |
| Ko-fi tips | $100–200 |
| **Total** | **$2,050–4,200/month** |

### Strong (50k MAU)
| Stream | Monthly |
|--------|---------|
| Grave cosmetics | $1,000–2,500 |
| Sunkeeper Pact | $4,000–8,000 |
| Memorial Stones | $500 (hard cap) |
| Rewarded ads | $500–1,000 |
| Ko-fi tips | $200–500 |
| **Total** | **$6,200–12,500/month** |

**Profitability threshold:** The game is profitable (infrastructure costs $0–25/month) from day one of any revenue. The entire revenue above infrastructure cost is net positive.

---

## PAYMENT IMPLEMENTATION

### Recommended: Stripe + Lemon Squeezy
- Lemon Squeezy handles tax, VAT, and compliance globally
- No monthly fee (commission-based)
- Simple embeddable checkout
- Webhooks to Supabase to confirm purchase and update player account

### What gets unlocked in Supabase on purchase
```sql
CREATE TABLE player_entitlements (
  player_name TEXT PRIMARY KEY,
  grave_stone_type TEXT DEFAULT 'sandstone',
  grave_glow TEXT DEFAULT 'none',
  grave_epitaph_style TEXT DEFAULT 'standard',
  grave_orbital TEXT DEFAULT 'none',
  grave_flag TEXT DEFAULT 'none',
  sunkeeper_pact_season INTEGER, -- Season number when purchased
  memorial_stones_placed INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Anonymous purchases
Players don't need accounts. They authenticate by player name (set on first play). Purchases are linked to player name. Risk: name-squatting. Mitigation: purchases are cosmetic only; stealing a name provides no mechanical advantage.

---

## WHAT WE WILL NEVER MONETIZE

These are explicit commitments, not aspirations:

- **No pay-to-win.** Combat stats, skill XP, healing effectiveness, wave progression — none of these are purchasable.
- **No energy systems.** No waiting to play. No daily play limit.
- **No lootboxes or RNG purchases.** Every purchased item has a known outcome.
- **No dark patterns.** No countdown timers on purchases. No "limited time" cosmetics that return next month. No FOMO exploitation.
- **No Solar Rites for sale.** Solar Rites are earned by surviving to Wave 30. Not purchasable at any price.
- **No faction advantages.** No paid faction bonuses.

These commitments exist because violating any of them damages the community trust that makes the game work. Solara's social mechanics depend entirely on players believing the world is fair. Pay-to-win destroys that.

---

*Monetization GDD · Solara: Sunfall · VaultSpark Studios · March 2026*
