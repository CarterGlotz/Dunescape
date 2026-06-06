<!-- truth-audit-version: 1.1 -->
# Truth Audit

Overall status: green
Last reviewed: 2026-04-17
Public-safe summary only. Sensitive verification notes are maintained privately.

## 2026-04-14 Public-Safe Check

- runtime/public/context scan found no remaining matches for the major borrowed-feel terms targeted in the canon pass
- local validation passed: 13 unit tests, production build, and smoke runtime
- remaining launch caveat: Supabase-side policies and moderation should mirror the client trust helpers before scaled public traffic

## 2026-04-17 Public-Safe Check

- public chronicle/status generation is deterministic and keeps browser token cost at zero by default
- Supabase public-write hardening is documented in a repo-local SQL starter, but live backend verification remains a human/backend-access task
- shared-world client writes now prefer RPCs with legacy table fallback for staged rollout
- Studio Hub / Social Dashboard / Sparkfunnel exports remain public-safe and derived from public shared-world state
- local validation passed: 30 unit tests, production build, and smoke runtime

## 2026-06-03 Public-Safe Check

- public chronicle/status generation now includes backend readiness, outcome receipt summaries, and explicit zero-token runtime cost guardrails
- Director route brief fields are deterministic and derived from public shared-world state; no paid generation or private Studio context is required
- blocker preflight now runs locally and reports the remaining Supabase DB URL blocker with evidence-oriented attempt order
- local validation passed: 31 unit tests, production build, smoke runtime, and `npm audit --json` with 0 vulnerabilities

## 2026-06-04 Public-Safe Check

- public chronicle gained `shared_world.almanac` and `shared_world.myth_scenes`; both are deterministic functions of public state and the date seed
- `generate-public-status.mjs` dayNumber now matches the runtime season-day (was days-since-epoch), so exported day references read correctly
- offline write queue (Sundial Queue) stores only trust-sanitized payloads already accepted by the client trust layer; flush reuses the RPC-first service path
- save sanitizer hardened against symbol/function coercion crashes found by the new fuzz harness
- local validation passed: 45 unit tests, production build, and smoke runtime
