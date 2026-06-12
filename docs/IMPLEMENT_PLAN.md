# Implement Plan — 2026-06-12 S74

Source: `docs/AUDIT_2026-06-12-S74.json`

## Wave 1 — Daily Rite Shrine Economy

1. `shrine-offering-economy` — Make bank, spend, and oath choices own the Sunstone item economy and remove stale unreachable outcome code.
2. `shrine-economy-status-contract` — Surface the shrine economy delta in active/completed Daily Rite status and public shrine bargain digests.
3. `shrine-economy-tests` — Add unit coverage for bounded item deltas, sanitized status, and zero-token public exports.

Quality gates: browser runtime token cost stays zero, public strings are sanitized, generated status remains public-safe, and `npm test`, `npm run build`, and `npm run smoke` pass.
