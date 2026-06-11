# Implement Plan — Session 67

Source: `docs/AUDIT_2026-06-11-S67.json`

## Wave Plan

1. `daily-rite-segment-economy` — Extend Daily Rite modifiers into reward, recovery, and shrine bargain policy, then make monster drops carry that policy.
2. `daily-rite-spawn-contract` — Move Daily Rite spawn mutation into a pure helper consumed by `src/App.jsx`.
3. `daily-rite-policy-public-digest` — Export the new policy through public chronicle/status integration surfaces.
4. `active-daily-smoke-contract` — Assert active Daily Rite stakes, modifiers, segment policy, and wave mapping in the smoke harness.

## Quality Gates

- Browser runtime token cost remains zero.
- Public repo boundary remains public-safe; no private Studio OS procedures or secrets are added.
- Solara-owned naming/mythology is preserved.
- Validation target: `npm test`, `npm run build`, `npm run smoke`.
