# Implement Plan — 2026-06-12 S72

Source: `docs/AUDIT_2026-06-12-S72.json`

## Wave 1 — Daily Rite Route Agency

1. `route-choice-room-tuning` — Add deterministic zero-token tuning from committed route choices into Daily Rite room outcomes.
2. `route-choice-outcome-contract` — Surface the applied route-choice adjustment in active status and public status/chronicle exports.
3. `route-choice-tuning-tests` — Add unit coverage for bounded/sanitized tuning and zero-token export contracts.

Quality gates: browser runtime token cost stays zero, public strings are sanitized, generated status remains public-safe, and `npm test`, `npm run build`, and `npm run smoke` pass.
