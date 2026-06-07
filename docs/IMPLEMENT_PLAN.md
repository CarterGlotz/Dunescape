<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-07 -->
<!-- source: docs/AUDIT_2026-06-07.json -->

# Implement Plan - Solara · 2026-06-07

Sequenced for Priority-per-hour and shared code surface.

| Seq | Slug | Audit # | Surface group | Why this slot |
|---|---|---|---|---|
| 1 | rpc-contract-manifest | 1 | Backend trust contract | Foundation for verifier, queue contracts, and public status truth |
| 2 | sundial-queue-briefing | 2 | Offline shared-world queue | Uses the manifest context and upgrades the active Supabase blocker path |
| 3 | outcome-receipt-queue-link | 5 | Deterministic intelligence | Reads the queue briefing and preserves zero-token receipt policy |
| 4 | rite-pacing-coach | 3 | Daily Rite runtime | Small deterministic module, then thin App.jsx wiring |
| 5 | last-light-result-card | 4 | Debrief/share loop | Depends on run/vow/challenge results and coach copy |
| 6 | app-surface-smoke-contract | 6 | Validation | Verifies the newly wired Daily Rite surface after implementation |

Preflight: no item requires a new paid service or credential. `SUPABASE_DB_URL` remains the hardening gate for production RPC deployment, but every item here is local, deterministic, and free-tier cost neutral.
