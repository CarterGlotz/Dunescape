# Implement Plan — 2026-06-12 S71

Source: `docs/AUDIT_2026-06-12-S71.json`

## Wave Order

1. `route-choice-commitments` — add a pure zero-token commitment builder, store selected commitments on active Daily Rite runs, and render commit controls in the status panel.
2. `route-choice-feedback-ledger` — emit public-safe `daily_rite_route_choice` feedback events on commitment.
3. `route-choice-contract-tests` — verify sanitization, invalid-choice fallback, status-contract export, and token-cost invariants.

## Gates

- `npm test`
- `npm run build`
- `npm run smoke`
