# Implement Plan — 2026-06-12 S76

Source: `docs/AUDIT_2026-06-12-S76.json`

## Wave 1 — Shared Shrine Offering Surface

1. `shrine-offering-intent`
   - Add a pure zero-token offering intent helper.
   - Attach banked shrine bargains to actionable grave/shrine offering guidance.
   - Keep spend/oath postures intentionally non-offering.

2. `shrine-offering-status`
   - Normalize offering intent in the Daily Rite status contract.
   - Render concise offering copy in `DailyRiteStatus`.
   - Export offering previews through public shrine bargain digests.

3. `shrine-offering-tests`
   - Extend Daily Rite system tests for bank/spend/oath intent behavior.
   - Verify public chronicle/export token cost and sanitization.
   - Run unit tests, smoke runtime, and production build.
<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-13 -->
<!-- source: docs/AUDIT_2026-06-13-S78.json -->

# Implementation Plan — Solara Session 78

## Wave 1

1. **touch-movement-contract** — Ship the L2 rung: persisted touch-controls preference, direct runtime movement bridge, coarse-pointer/opt-in D-pad overlay, and preference regression coverage.

## Verification

- `npm test`
- `npm run smoke`
- `npm run build`
