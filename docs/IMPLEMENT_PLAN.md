# Implement Plan — 2026-06-12 S69

Source: `docs/AUDIT_2026-06-12-S69.json`

## Wave Order

1. `daily-rite-outcome-runtime-contract` — Extract outcome application into `src/game/dailyRiteRoomRuntime.js` and wire `src/App.jsx`.
2. `daily-rite-receipt-ui` — Surface latest room receipt/reward/next-action data through the Daily Rite status contract and component.
3. `daily-rite-decision-window-digest` — Add deterministic decision windows to the public Daily Rite outcome digest and generated status surfaces.
4. `daily-rite-outcome-validation` — Extend unit and smoke checks to prove bounded application, UI contract, and zero-token public digest behavior.

## Gates

- `npm test`
- `npm run build`
- `npm run smoke`
