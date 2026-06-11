# Implement Plan — 2026-06-11 Audit

Source: `docs/AUDIT_2026-06-11.json`

## Wave Order

1. `studio-protocol-drift-shims` — repair command-surface gaps observed during `/start`.
2. `backend-readiness-runbook` — strengthen public safety/status contract before expanding runtime surfaces.
3. `feedback-action-attribution` — deepen zero-token feedback intelligence.
4. `daily-rite-stakes-ledger` — add route-level Daily Rite stakes to run and public status contracts.
5. `daily-rite-status-component` — extract the Daily Rite sidebar display after data contracts settle.

## Verification

- `npm test`
- `npm run build`
- `npm run smoke`
- `node scripts/render-startup-brief.mjs`
- `node scripts/validate-brief-format.mjs docs/STARTUP_BRIEF.md`
