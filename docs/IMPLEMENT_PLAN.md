# Implement Plan — AUDIT_2026-06-12-S68

Source: `docs/AUDIT_2026-06-12-S68.json`

## Wave Plan

1. `daily-rite-room-outcome-policy` — create the pure deterministic room-clear outcome contract first because the runtime and public surfaces depend on it.
2. `daily-rite-policy-runtime-wiring` — apply the contract inside active Daily Rite wave-clear handling with bounded player rewards and receipt copy.
3. `daily-rite-outcome-public-digest` — expose the same contract in public chronicle/status JSON for Studio surfaces.
4. `daily-rite-outcome-smoke-contract` — prove the contract through unit tests and smoke validation.

## Verification Plan

- `npm test`
- `npm run build`
- `npm run smoke`
