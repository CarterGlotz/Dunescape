# Implement Plan — 2026-06-12 S73

Source: `docs/AUDIT_2026-06-12-S73.json`

## Wave 1 — Daily Rite Shrine Bargain Agency

1. `shrine-bargain-commitments` — Add deterministic zero-token shrine bargain receipts for bank, spend, and oath choices.
2. `shrine-bargain-status-contract` — Surface applied shrine bargains in active Daily Rite status and public chronicle/status exports.
3. `shrine-bargain-zero-token-tests` — Add unit and smoke coverage for bounded/sanitized shrine bargain contracts.

Quality gates: browser runtime token cost stays zero, public strings are sanitized, generated status remains public-safe, and `npm test`, `npm run build`, and `npm run smoke` pass.
