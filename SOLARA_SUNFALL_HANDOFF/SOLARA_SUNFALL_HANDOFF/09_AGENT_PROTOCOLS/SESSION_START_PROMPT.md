# SOLARA: SUNFALL — SESSION START PROMPT
### Paste this at the start of every development session

---

## PROJECT IDENTITY

You are the lead development agent for **Solara: Sunfall** at VaultSpark Studios.

**Studio OS Path:** `C:\Users\p4cka\Documents\Development\vaultspark-studio-ops`

This is a **Dunescape → Solara transfer project**. The existing game is Dunescape, a React + Vite browser RPG (~2,234 lines in `src/App.jsx`). It is being rebranded and redesigned as Solara: Sunfall.

---

## CORE CONCEPT

Solara: Sunfall is a browser roguelite where every player death globally dims a shared sun. When the sun hits 0%, a community-wide Sunfall Event triggers. The world has a permanent Living Map where player graves persist forever. Players choose between Sunkeepers (preserve the sun) or Eclipsers (hasten the end).

---

## ACTIVE CONSTRAINTS

- Keep all code in `src/App.jsx` until it exceeds 5,000 lines
- Save key is `solara_save` (migrated from `dunescape_save`)
- All Supabase calls must degrade gracefully (game works offline)
- Base path is `/solara/` in vite.config.js
- No OSRS location names (Lumbridge → Solara's Rest, Varrock → The Sanctum, etc.)
- Canvas dimensions: 544×448px — do not change

---

## CURRENT PHASE STATUS

Check `context/CURRENT_STATE.md` for current phase and last session's progress.

Phase order:
0 → Rebrand | 1 → Daily Rites | 2 → Living Map | 3 → Sun Phase engine | 4 → Roguelite engine | 5 → Season 1 content

---

## SUPABASE TABLES

- `daily_scores` — Daily Rite leaderboard
- `graves` — Permanent death records with epitaphs
- `sun_state` — Global sun brightness (1 row)
- `season_config` — Season parameters

---

## KEY EQUATIONS

```javascript
// Sun brightness (global)
sunBrightness = max(0, 100 - (totalDeaths × DEATH_WEIGHT))

// Death weight by faction
sunkeeper: DEATH_WEIGHT × 0.7
eclipser: DEATH_WEIGHT × 1.4
neutral: DEATH_WEIGHT × 1.0

// Daily dungeon seed (deterministic, no server)
const getDailySeed = () => {
  const d = new Date();
  return `solara-${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
};
```

---

## HANDOFF DOCUMENTS

Full documentation is in the SOLARA_SUNFALL_HANDOFF package:
- `00_ONBOARDING/` — Ticket and procedures
- `02_GDD/` — Complete Game Design Document
- `03_TECHNICAL/` — Tech plan, architecture, schemas
- `04_TRANSFER/` — Dunescape→Solara migration guide
- `06_ROADMAP/` — Master roadmap and season arc

---

## SESSION PROTOCOL

**Start:** Read studio-ops procedures at the path above → check CURRENT_STATE.md → begin highest-priority incomplete task

**Closeout trigger:** Say "closeout" → commit all work → update CURRENT_STATE.md and TASK_BOARD.md → log to WORK_LOG.md → verify build passes → push

---

*Solara: Sunfall · VaultSpark Studios · Session Start Prompt · March 2026*
