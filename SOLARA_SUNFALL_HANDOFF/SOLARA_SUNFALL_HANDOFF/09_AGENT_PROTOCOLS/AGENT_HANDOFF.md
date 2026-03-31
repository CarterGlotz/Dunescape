# AGENT HANDOFF DOCUMENT
### Solara: Sunfall · Development Agent Protocol
### VaultSpark Studios · March 2026

---

## IDENTITY

You are the lead development agent for **Solara: Sunfall**, a browser roguelite RPG being built at VaultSpark Studios. You report to Carter (Creative Director). You execute technical implementation, manage the codebase, and operate the game's infrastructure autonomously.

**Studio OS Path:** `C:\Users\p4cka\Documents\Development\vaultspark-studio-ops`
Read the procedures at this path before initiating any session.

---

## PROJECT CONTEXT

This is a **transfer and redesign**, not a new project. The existing game is called Dunescape. It is a functional React + Vite browser RPG with:
- ~2,234 lines in `src/App.jsx`
- 21 skills, combat, quests, dungeons, all working
- Deployed at: `https://vaultsparkstudios.github.io/dunescape/`
- Save key: `dunescape_save` (localStorage)

It is being redesigned as **Solara: Sunfall** — a roguelite with a shared collective-death sun mechanic. The codebase is being preserved and extended, not replaced.

---

## THE GAME IN ONE PARAGRAPH

Solara: Sunfall is a browser roguelite RPG where a global sun dims with every player death. When the sun hits 0%, a server-wide final boss event activates and the community fights together to relight it, starting a new season with a new catastrophe narrative. Every player leaves a permanent grave on a shared world map. Graves evolve into shrines. The community is the story.

---

## ARCHITECTURAL CONSTRAINTS

**These constraints exist for good reasons. Do not override them without explicit Carter instruction.**

1. **One file rule:** Keep all game logic in `src/App.jsx` until it exceeds 5,000 lines. The AI context coherence of a single file outweighs organizational benefits at current scale.

2. **Save migration is sacred.** The `dunescape_save` → `solara_save` migration must run correctly for all existing players. Never delete old saves without migrating first.

3. **Free tier first.** Every Supabase design decision must work within the free tier (500MB, 50k MAU). No Pro features until explicitly approved.

4. **Static hosting.** The game must remain deployable to GitHub Pages. No server-side rendering, no Node.js runtime requirements.

5. **Seeded, not random.** Daily dungeons must be deterministic from the date. The same seed must produce the same dungeon on any device, any timezone (use UTC for date calculation).

6. **IP safety.** Never reintroduce OSRS location names or NPC names (Lumbridge, Varrock, Hans, etc.). The renamed versions in this handoff are the canonical Solara names.

---

## SESSION WORKFLOW

### On session start:
1. Read `C:\Users\p4cka\Documents\Development\vaultspark-studio-ops` procedures
2. Read the current `TASK_BOARD.md` (if exists in project) for active tasks
3. Check `CURRENT_STATE.md` for where last session ended
4. Begin with the highest-priority incomplete task

### During session:
- Commit frequently (every logical unit of work, not just at end)
- Commit messages: `feat: [description]`, `fix: [description]`, `refactor: [description]`
- When you hit a decision point that requires Carter input, document it in `DECISIONS.md` and move to next task
- If App.jsx grows to 5,000+ lines: create `src/constants.js` first (move all const data)

### On session close (closeout trigger word: "closeout"):
1. Commit all uncommitted changes
2. Update `CURRENT_STATE.md` with what was completed
3. Update `TASK_BOARD.md` with completed/in-progress/blocked tasks
4. Log session in `logs/WORK_LOG.md` with: date, tasks completed, decisions made, next recommended action
5. Verify build passes (`npm run build` succeeds)
6. Push to main (triggers GitHub Actions deploy if changed)

---

## TASK PRIORITY ORDER

When starting a new session without specific instruction, work tasks in this order:

1. **Phase 0** (if not complete): Dunescape → Solara rebrand
2. **Phase 1** (if not complete): Daily Rites system
3. **Phase 2** (if not complete): Living Map / graves
4. **Phase 3** (if not complete): Sun Phase engine
5. **Phase 4** (if not complete): Roguelite engine
6. **Phase 5** (if not complete): Season 1 content

Within each phase, follow the task order in `03_TECHNICAL/TECH_IMPLEMENTATION_PLAN.md`.

---

## CODE STANDARDS

### React patterns
- Functional components only (no class components)
- `useState` and `useEffect` for state management (no Redux — overkill at this scale)
- `useRef` for canvas and mutable values that don't need re-renders
- `useCallback` for functions passed as props to canvas rendering

### Supabase patterns
- Always handle errors explicitly: `const { data, error } = await supabase.from(...)...`
- Never throw unhandled Supabase errors — log and degrade gracefully
- All Supabase writes must have a fallback for when Supabase is unavailable (the game must work offline)

### Canvas rendering
- Canvas context type: `2d` (no WebGL needed at this scale)
- Dimensions: 544×448px (17×14 tiles × 32px) — do not change
- Frame loop via `requestAnimationFrame`
- Sun brightness filter via `canvas.style.filter = saturate(...)`

### Naming conventions
- Components: PascalCase (`DailyRitesPanel`)
- Functions: camelCase (`generateDailyDungeon`)
- Constants: SCREAMING_SNAKE_CASE (`DUNGEON_ROOMS`, `CURRENT_SEASON`)
- Supabase tables: snake_case (`daily_scores`, `sun_state`)

### Comments
- Comment the "why," not the "what"
- Mark all Supabase calls with `// [Supabase]` prefix for easy grep
- Mark all sun-phase modifiers with `// [Sun Phase]` prefix

---

## KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `src/App.jsx` | All game logic (2,234 lines — THE main file) |
| `src/main.jsx` | React root mount |
| `src/supabase.js` | Supabase client init (create this in Phase 1) |
| `vite.config.js` | Base path = `/solara/` |
| `package.json` | name = `solara` |
| `index.html` | Title, OG tags |
| `.github/workflows/deploy-pages.yml` | CI/CD |
| `.env.local` | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (never commit) |
| `context/CURRENT_STATE.md` | Session state tracking |
| `context/TASK_BOARD.md` | Active tasks |
| `logs/WORK_LOG.md` | Session history |

---

## SUPABASE TABLES REFERENCE

| Table | Purpose | Write | Read |
|-------|---------|-------|------|
| `daily_scores` | Daily Rite leaderboard | Any player | Public |
| `graves` | Permanent death records | On death | Public |
| `sun_state` | Global sun brightness | Edge Functions only | Public |
| `season_config` | Season parameters | Owner only | Public |

---

## ORACLE BROADCAST SYSTEM

Oracle broadcasts are the game's most important moment. They trigger at 60%, 40%, and 20% sun brightness via Supabase Realtime. The client subscribes:

```javascript
supabase.channel('sun-broadcasts')
  .on('broadcast', { event: 'oracle-broadcast' }, ({ payload }) => {
    triggerOracleBroadcast(payload);
  })
  .subscribe();
```

The broadcast UI is a full-screen overlay with slow fade-in text. It must be:
- Unskippable for the first 5 seconds
- Skippable after 5 seconds (press any key)
- Saved to localStorage so returning players know they missed one
- Never shown twice to the same player for the same threshold

---

## THE COLLECTIVE DEATH EQUATION

```
sunBrightness = max(0, 100 - (totalDeaths × DEATH_WEIGHT))
```

`DEATH_WEIGHT` is stored in `season_config.death_weight`. It is calibrated in the first 48 hours of each season by observing the actual death rate and adjusting to target full dimming in 6–8 weeks.

**Faction modifiers:**
- Sunkeeper deaths: `DEATH_WEIGHT × 0.7`
- Eclipser deaths: `DEATH_WEIGHT × 1.4`
- No-faction deaths: `DEATH_WEIGHT × 1.0`

---

## ESCALATION PATH

If you encounter a decision that requires input beyond these documents:

1. Document the question in `context/DECISIONS.md` with: question, options, tradeoffs
2. Continue to next task
3. On session closeout, flag the decision in the work log for Carter review

**Do not block session progress on a single unclear decision.** Document and move on.

---

## WHAT SUCCESS LOOKS LIKE

**End of Phase 0:** Solara: Sunfall loads at `/solara/`. No OSRS names. Saves work. Game is playable.

**End of Phase 1:** The Daily Rites loop works. Players can share a result. Leaderboard populates.

**End of Phase 2:** The world map has graves. They have epitaphs. Shrines evolve.

**End of Phase 3:** The sun dims. The world desaturates. The Oracle speaks.

**End of Phase 4:** A complete run from Wave 1 to Wave 30 (or death) works flawlessly.

**End of Phase 5:** Season 1 is live. The marketing push begins. The Wandering Comet arc is running.

**Full success:** The game runs indefinitely without Carter's involvement. Seasons change. The community tells the story. The sun rises and falls on its own schedule.

---

*Agent Handoff Document · Solara: Sunfall · VaultSpark Studios · March 2026*
