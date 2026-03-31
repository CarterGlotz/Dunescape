# ONBOARDING INITIATION TICKET
## VaultSpark Studios — Studio OS Protocol

---

**TICKET ID:** VSS-2026-SOLARA-001
**TYPE:** Project Transfer + New Build Initiation
**PRIORITY:** P0 — Active Development
**STATUS:** Open — Awaiting Agent Assignment
**DATE CREATED:** 2026-03-27
**STUDIO:** VaultSparkStudios
**OWNER:** Carter (Creative Director)

---

## STUDIO OS PROTOCOL REFERENCE

**Local Studio Ops Path:**
```
C:\Users\p4cka\Documents\Development\vaultspark-studio-ops
```

All agents working on this project must:
1. Read the studio-ops procedures at the path above before initiating any session
2. Follow file naming, commit message, and branch naming conventions defined there
3. Log all session work to the studio ops WORK_LOG format
4. Submit session closeout docs per the studio ops closeout protocol

---

## WHAT THIS TICKET IS

This is a **transfer ticket**, not a new project ticket. The game currently exists as **Dunescape** — a functional React + Vite browser RPG at:

```
GitHub Org:   VaultSparkStudios
Current Repo: VaultSparkStudios/dunescape (or VaultSparkStudios.github.io/dunescape/)
Live URL:     https://vaultsparkstudios.github.io/dunescape/
Save Key:     dunescape_save (localStorage)
```

It is being **rebranded and redesigned** as **Solara: Sunfall**. This is NOT a new game — the existing codebase, all systems, and all player data must transfer cleanly. The Dunescape repo becomes the Solara repo. No data is thrown away.

---

## TRANSFER SUMMARY

| Item | From | To |
|------|------|----|
| Repo name | `dunescape` | `solara` |
| Deploy path | `/dunescape/` | `/solara/` |
| Game title | `Dunescape` | `Solara: Sunfall` |
| localStorage key | `dunescape_save` | `solara_save` |
| vite base path | `/dunescape/` | `/solara/` |
| package.json name | `dunescape` | `solara` |
| HTML title | `Dunescape` | `Solara: Sunfall` |
| GitHub Pages URL | `.../dunescape/` | `.../solara/` |
| Save version | `SAVE_VERSION=4` | `SAVE_VERSION=5` |

**Save migration is required.** On first load of the new build, the client must check for `dunescape_save`, copy it to `solara_save`, increment save version, then delete the old key. No player loses progress.

---

## SCOPE OF WORK

### Phase 0 — Rebrand (Session 1, ~2 hours)
- Rename all Dunescape strings in App.jsx
- Update localStorage key with migration shim
- Update package.json, vite.config.js, index.html
- Rename GitHub repo, update deploy workflows
- Test: existing saves load correctly under new key

### Phase 1 — Daily Rites viral layer (Sessions 2–4)
- Date-deterministic dungeon seed system
- Emoji share card generator
- Global leaderboard via Supabase
- Homepage sun brightness counter

### Phase 2 — Living Map social layer (Sessions 5–6)
- Death → grave written to Supabase
- Graves rendered on world map
- Epitaph system (player writes 1 sentence on death)
- Shrine evolution (grave → cairn → shrine at offering thresholds)

### Phase 3 — Sun Phase engine (Sessions 7–10)
- Global death counter → sun brightness math
- 5-phase system with gameplay modifiers per phase
- Visual desaturation layer tied to brightness
- Oracle dialogue state machine
- Faction system: Sunkeepers vs Eclipsers

### Phase 4 — Sunfall roguelite engine (Sessions 11–18)
- Procedural run map generator (date-seeded)
- Replace static world with run-based structure
- Sun-dimming countdown mechanic
- Wave survival mode replacing open-world exploration
- Keep all 21 skills, combat, items, crafting — reframed as run systems

### Phase 5 — Season 1: The Wandering Comet (Sessions 19–24)
- Comet-themed enemy reskins
- Comet arc visual on sky layer
- Lore codex fragments (12 entries)
- Oracle seasonal dialogue
- Prophecy Scroll share card generator

---

## DOCUMENTS IN THIS HANDOFF PACKAGE

All documents are located relative to this ticket file:

```
00_ONBOARDING/          ← You are here
01_BRIEF/               ← Executive brief, concept summary
02_GDD/                 ← Full Game Design Document (8 files)
03_TECHNICAL/           ← Tech plan, architecture, schemas, API spec
04_TRANSFER/            ← Dunescape→Solara migration guide + rebrand execution
05_LAUNCH/              ← Deployment plan, launch sequence, rollout phases
06_ROADMAP/             ← Master roadmap, season arc (7 seasons / ~2 years)
07_MARKETING/           ← Marketing plan, viral growth strategy, community playbook
08_INNOVATION/          ← Innovation catalog, seasonal catastrophes, Oracle system
09_AGENT_PROTOCOLS/     ← Agent handoff doc, session start prompt, context docs
```

---

## AGENT FIRST STEPS

1. Read `09_AGENT_PROTOCOLS/AGENT_HANDOFF.md` first
2. Read `04_TRANSFER/REBRAND_EXECUTION.md` — this is Phase 0, your first task
3. Reference `03_TECHNICAL/ARCHITECTURE.md` for all technical decisions
4. Log sessions to the studio ops WORK_LOG at the path above
5. On session close: run the studio ops closeout protocol

---

## CRITICAL CONSTRAINTS

- **One file rule:** App.jsx is currently ~2,234 lines. Do NOT split it until it exceeds 5,000 lines. Premature modularization breaks Claude Code's context coherence.
- **Save migration is sacred.** Never destroy `dunescape_save` data. Always migrate first, then delete.
- **IP safety:** Never re-introduce any OSRS/RuneScape terminology (prayer points as "prayer points" is fine, NPC names like "Hans" or location names like "Lumbridge"/"Varrock" must be renamed as part of the Solara rebrand).
- **Zero backend cost constraint:** No Supabase Pro tier features until 50k MAU. All leaderboard/graves data must fit free tier (500MB, 50k MAU).
- **Owner autonomy:** This game must be 100% operable by Claude/AI without human intervention post-launch. All systems must be fully automatable.

---

## CONTACTS / ESCALATION

**Creative Director:** Carter (VaultSparkStudios)
**IP/Legal:** File USPTO intent-to-use for "Solara" before marketing spend. "Solara: Sunfall" as combined mark is clean.
**Studio Ops Path:** `C:\Users\p4cka\Documents\Development\vaultspark-studio-ops`

---

*This ticket was generated by the Solara Strategic Planning session, March 2026.*
*All documents in this package were produced in the same session and are internally consistent.*
