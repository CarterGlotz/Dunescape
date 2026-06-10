<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-10 -->
<!-- source: docs/AUDIT_2026-06-10.json -->

# Implement Plan - Solara · 2026-06-10

Sequenced for Priority-per-hour and shared code surface.

| Seq | Slug | Audit # | Surface group | Why this slot |
|---|---|---|---|---|
| 1 | director-room-weaver | 1 | Daily Rite runtime | Foundation: turns existing Director route plans into actual dungeon room sequences |
| 2 | front-door-world-planning | 2 | Menu/UI extraction | Uses Almanac/Myth data already computed by App.jsx and moves display into a focused component |
| 3 | app-jsx-ritual-extraction | 4 | Maintainability | Lands naturally with the room weaver and menu component instead of a broad App.jsx split |
| 4 | local-feedback-ledger | 3 | Feedback loop / integrations | Records the start/end/share evidence created by the runtime work and exports aggregate counts |

Preflight: no item requires a new paid service or credential. `PG_CONNECTION_SOLARA` remains the hardening gate for production RPC deployment, but every item here is local, deterministic, public-safe, and free-tier cost neutral.
