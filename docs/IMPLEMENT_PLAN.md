# Implement Plan — 2026-06-11 S66

Source audit: `docs/AUDIT_2026-06-11-S66.md`

## Execution Order

1. `daily-rite-stakes-mechanics` — foundation for the pass; mechanical modifier data must exist before status/public exports can prove it.
2. `stakes-public-intelligence-delta` — same data surface as item 1, exported through deterministic public chronicle/status JSON.
3. `daily-rite-status-contract` — pure render contract for the extracted component, backed by the new modifier data.
4. `feedback-action-routing-map` — independent feedback-loop contract, tested with the same zero-token summary surface.

## Verification Surface

- `node --test tests/june10-systems.test.mjs`
- `npm test`
- `npm run build`
- `npm run smoke`
