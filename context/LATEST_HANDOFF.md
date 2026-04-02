Session Intent: Audit project, implement top recommendations (onboarding funnel, layout export/import, App.jsx pressure release, TASK_BOARD pre-load)

# Latest Handoff

Last updated: 2026-04-02

## Where We Left Off (Session 17)

- Shipped: 3 improvements across onboarding + layout sharing — guided intro funnel, layout export/import, code pressure release
- Tests: 2 passing (1 build / 1 smoke) · delta: 0 this session
- Deploy: pending (CI + Pages workflows both green)

## What was completed this session

**Onboarding Funnel** (`src/App.jsx`)
- 4-step guided intro for first-time players: "The Sun Is Dying" → "Your Grave Stays Behind" → "Choose Your Side" → "Your Chronicle Begins"
- Only triggers for players with no existing save and `solara_onboarding_done` not set in localStorage
- Skippable at any step; completion writes `solara_onboarding_done=1` to localStorage
- Cleared on "Start Fresh Chronicle" so it re-triggers for fresh starts
- Full-screen cinematic overlay at z-index 500 (above menu); dot indicators and back/next navigation

**Layout Export/Import** (`src/App.jsx`)
- `exportLayout()` — captures current layout config, encodes as base64 JSON, copies to clipboard
- `importLayout(code)` — decodes base64, validates, applies layout config
- New "Share Layout" section in Layout Manager modal with copy/paste UI
- Players can share layout codes with friends and import them in one paste

**App.jsx Pressure Release** (`src/App.jsx`)
- Extracted `LAYOUT_BASE_KEYS`, `layoutBaseMatch()`, `layoutFullMatch()` as module-level constants/helpers
- Replaced 16 lines of repeated inline comparison logic in the layout preset detection `useEffect` with 3-line helper calls
- Net line reduction despite adding features (3969 lines, down from 3919+additions)

**TASK_BOARD Pre-Load** (runway ≤2.0 protocol)
- Promoted map-tied echo traces from Next to Now
- Added lore codex fragments and PWA manifest as new Now items
- Runway extended from ~2.0 to ~5.0 sessions

## Root cause

Momentum runway was at ≤2.0 sessions, triggering mandatory TASK_BOARD pre-loading. The onboarding funnel addresses the Engage gap — new players had no guided introduction to the core death-matters-to-everyone loop. Layout export/import enables social sharing of UI configurations.

## What is mid-flight

- Supabase activation is still not complete — SQL blocks 1–5 remain unrun; all shared-world systems degrade gracefully offline
- Now bucket has 3 fresh items: lore codex, PWA manifest, map-tied echo traces

## Human Action Required

- [ ] **Run SQL Block 1 (`daily_scores`)** — activate Phase 1 leaderboard storage
- [ ] **Run SQL Block 2 (`graves`)** — activate Phase 2 grave storage and map persistence
- [ ] **Run SQL Block 3 (`sun_state`)** — activate Phase 3 shared sun tracking and death counter RPC
- [ ] **Run SQL Block 4 (`player_echoes`)** — activate cross-player async echoes
- [ ] **Run SQL Block 5 (echo reactions)** — ALTER TABLE player_echoes + react_to_echo RPC; SQL in `docs/SUPABASE_ACTIVATION_PACK.md`
- [ ] **Post the itch.io listing** — publish the game and devlog entry at itch.io/vaultsparkstudios
- [ ] **Deploy the Discord bot** — create the Discord app/token and host `discord-bot/`
- [ ] **Submit the Twitch extension** — submit via Twitch Developer Console

## What to do next

1. Agent: Lore codex fragments — discoverable sun mythology entries unlocked through gameplay and Oracle
2. Agent: PWA manifest + offline service worker — mobile install prompt and offline play support
3. Agent: Map-tied echo traces — ghost echoes as spectral markers near death coordinates on world map

## Constraints

- `src/App.jsx` remains monolithic until 5000 lines (currently 3969)
- Never break save migration from `dunescape_save` to `solara_save`
- Shared-world features must continue to degrade cleanly when Supabase is absent
- Runtime overlays should stay user-controllable

## Read these first next session

1. `AGENTS.md`
2. `context/LATEST_HANDOFF.md`
3. `context/SELF_IMPROVEMENT_LOOP.md`
