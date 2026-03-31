# Decisions

Append new entries. Do not erase historical reasoning unless it is wrong.

## Entry template

### YYYY-MM-DD - Decision title

- Status:
- Context:
- Decision:
- Alternatives considered:
- Why this was chosen:
- Follow-up:

---

### 2026-03-26 - Adopt VaultSpark Studio OS

- Status: Accepted
- Context: VaultSpark Studios requires all projects to run under Studio OS for agent continuity and Studio Hub integration
- Decision: Bootstrap all required Studio OS files in this repo
- Alternatives considered: No structured context system
- Why this was chosen: Enables agent handoffs, hub visibility, and consistent studio protocols
- Follow-up: Fill out project-specific content in all context files — DONE 2026-03-27

---

### 2026-03-27 - Phase 0 Location/NPC Name Mapping

- Status: Accepted
- Context: IP safety requires removing all OSRS/RuneScape-derived proper nouns before marketing
- Decision: Lumbridge→Solara's Rest, Varrock→The Sanctum, Al Kharid→The Amber District, Barbarian Village→The Outlander Camp, Draynor→Ashfen, Falador→The White Fort, Karamja→The Southern Isle, Wilderness→The Ashlands; NPCs Hans→Alder, Cook→Mara, Doric→Stone-Reader, etc.
- Alternatives considered: Generic fantasy names; keeping names as-is
- Why this was chosen: Names chosen to feel world-appropriate for Solara's desert-sun mythology; Sanctum/Amber District/Ashlands all evoke the sun theme
- Follow-up: Lore codex fragments (Phase 5) should explain why these places have these names

---

### 2026-03-27 - Keep internal curReg IDs stable for old saves

- Status: Accepted
- Context: Changing visitedRegions string IDs would silently break the explorer achievement for players who had already visited Falador/Karamja under Dunescape
- Decision: Internal-only region IDs ("Falador", "Karamja", "AlKharid") left unchanged; only user-visible display strings were updated
- Alternatives considered: Full ID rename with save migration patch
- Why this was chosen: Save migration was already complex; this is an invisible implementation detail
- Follow-up: When Phase 4 roguelite engine ships, consider unifying all region IDs

---

### 2026-03-27 - Ship all 13 implementable innovation items in one sprint

- Status: Accepted
- Context: Full project audit scored 72/100. 20 innovation items brainstormed. Carter directed agent to implement all "highest leverage" (low effort, real impact) and "highest ceiling" (high effort, transformative) items in the same session.
- Decision: Implement all 13 code-implementable items immediately; document remaining 7 Carter-manual/infrastructure items in LATEST_HANDOFF for deferred action
- Alternatives considered: Incremental 1–2 items per session; prioritised subset only
- Why this was chosen: Items are complementary — distribution infrastructure (archive, widget, Discord bot, Twitch ext) + virality mechanics (faction cards, prophecies, landmark naming) + engagement layer (ambient audio, faction dashboard, Oracle subscription) all reinforce each other at once; shipping together maximises launch readiness
- Follow-up: Carter must complete Supabase setup + itch.io listing to activate all social features; Phase 4 roguelite engine is the next agent build task

---

### 2026-03-30 - Declare runtime callbacks before dependent effects

- Status: Accepted
- Context: The app stopped booting even though `vite build` still passed. The cause was `useEffect` dependency arrays reading `fetchGraves` / `fetchSunState` before those `const` callbacks were initialized.
- Decision: Keep callback declarations above any effects or dependency arrays that reference them in `src/App.jsx`.
- Alternatives considered: Leave order as-is and rely on manual browser testing to catch regressions; refactor the whole file immediately.
- Why this was chosen: It fixes the actual bug with the smallest safe change and establishes a clear rule for future edits in the monolithic component.
- Follow-up: Add a lightweight boot smoke test for mount + daily/roguelite startup flows.

---

### 2026-03-30 - Use a repo-native Node smoke harness for boot regressions

- Status: Accepted
- Context: This repo has no browser-test stack, but the runtime bug showed that `vite build` alone is not sufficient protection.
- Decision: Add `npm run smoke`, a lightweight Node harness that mounts a Node-safe copy of `App.jsx`, flushes mount effects, and verifies Daily / Roguelite startup handlers initialize.
- Alternatives considered: Add a full browser runner immediately; rely on build-only CI; leave smoke checks manual.
- Why this was chosen: It catches the exact class of regressions that just broke boot, adds minimal maintenance cost, and fits the repo’s current tooling.
- Follow-up: Extend smoke coverage with save-state validation and additional boot-critical guardrails rather than jumping straight to a heavy test stack.
