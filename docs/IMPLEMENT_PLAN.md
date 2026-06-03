<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-03 -->

# Implement Plan

Source audit: `docs/AUDIT_2026-06-03.md`

## Sequence

1. **blocker-preflight-repair** — repair missing protocol helpers first so blocker discipline works during closeout.
2. **director-route-briefs** — deepen the Daily Rite plan where existing tests already cover Director mechanics.
3. **world-feed-action-results** — move inline feed action routing into a reusable resolver.
4. **outcome-receipts** — add reusable public-safe receipts once route/action outputs exist.
5. **backend-readiness-digest** — publish the safe backend mode alongside public status/chronicle contracts.
6. **token-cost-guardrail** — extend the deterministic AI policy and assertions after the contract shape settles.

## Verification

- `node scripts/blocker-preflight.mjs --json`
- `npm test`
- `npm run build`
- `npm run smoke`
