<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-10 -->
<!-- source: docs/AUDIT_2026-06-10-S64.json -->

# Implement Plan - Solara · 2026-06-10 · Session 64

Sequenced for Priority-per-hour and shared code surface.

| Seq | Slug | Audit # | Surface group | Why this slot |
|---|---|---|---|---|
| 1 | pg-connection-truth-gate | 1 | Security / backend contract | Foundation: removes stale Supabase secret naming before public exports and workflow preflights drift further |
| 2 | rite-consequence-engine | 2 | Daily Rite runtime | Builds directly on the Session 63 room weaver and turns Director segments into player-facing consequences |
| 3 | daily-run-session-extraction | 4 | Maintainability | Lands with the consequence engine by moving run object assembly out of `src/App.jsx` |
| 4 | feedback-next-action-digest | 3 | Feedback loop / integrations | Converts the existing aggregate ledger into a menu/status/chronicle recommendation loop |

Preflight: no item requires a new paid service or credential. `PG_CONNECTION_SOLARA` remains the hardening gate for production RPC deployment, but every item here is local, deterministic, public-safe, and free-tier cost neutral.

## Execution Log

- **pg-connection-truth-gate** — shipped. `src/game/backendContract.js`, `src/game/backendReadiness.js`, `.github/workflows/supabase-hardening.yml`, tests, docs, and generated `public/status.json` / `public/chronicle.json` now consistently use `PG_CONNECTION_SOLARA`; active source/output no longer contains `SUPABASE_DB_URL`.
- **rite-consequence-engine** — shipped. `src/game/dailyRiteConsequences.js` derives entry, clear, failure, share, reward, urgency, and next-action copy from Director route segments; `src/App.jsx` uses it during Daily Rite start, room entry, room clear, death, and completion.
- **daily-run-session-extraction** — shipped. `src/game/dailyRunSession.js` now owns Daily Rite run object assembly and completion/share-card creation, reducing inline `App.jsx` responsibility without moving combat state.
- **feedback-next-action-digest** — shipped. `src/game/feedbackLedger.js` now emits a zero-token `next_action` digest; the front door renders it and public chronicle/status exports include it for Studio integrations.

Validation: `npm test` passed 56/56; `npm run smoke` passed; `npm run build` passed.
