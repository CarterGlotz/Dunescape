<!-- truth-audit-version: 1.1 -->
# Truth Audit

Overall status: green
Last reviewed: 2026-06-10
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

## 2026-06-07 Public-Safe Check

- public chronicle/status exports now include `backend_contract`, `shared_world.sundial_queue`, and `shared_world.result_card_shape`; all are deterministic and contain no secrets
- Supabase hardening verification now reads required tables/RPCs from `src/game/backendContract.js`, keeping runtime queue kinds and backend deployment checks aligned
- Sundial Queue briefings and queue_pending receipts summarize only sanitized counts/kinds and preserve zero browser token cost
- Solara's runtime Supabase client now normalizes the stored project ref `fjnpzjjyhnpmunfoycrp` to a full cloud Supabase URL before client creation
- the remaining hardening credential is project-scoped `PG_CONNECTION_SOLARA`; using the Hetzner/Vorn shared database would be a cross-project migration and is not the current safe path
- local validation passed: 51 unit tests, production build, and smoke runtime

## 2026-06-10 Public-Safe Check

- Daily Rite room weaving is deterministic, date/Director-derived, and keeps browser token cost at zero
- front-door Sun Almanac and Myth So Far planning surfaces reuse deterministic public shared-world state already exported through chronicle/status contracts
- local feedback ledger stores only capped aggregate event metadata with explicit zero token cost; it does not store raw saves, private notes, credentials, cookies, or internal ops data
- public chronicle/status exports now include `feedback_summary`, which is deterministic/public-safe when generated from provided aggregate events and empty by default in static generation
- propagated protocol scripts remain public-safe; the copied shared-policy helper contains only blocked-status labels needed by startup brief rendering
- local validation passed: 54 unit tests, production build, smoke runtime, startup-brief render, brief-format validation, and closeout-board render

## 2026-06-10 Session 64 Public-Safe Check

- active backend hardening surfaces now consistently use the project-scoped `PG_CONNECTION_SOLARA` gate; public status/chronicle output no longer advertises stale `SUPABASE_DB_URL`
- Daily Rite consequence receipts are deterministic functions of Director route segments and do not require paid generation, private state, or credentials
- feedback next-action digest is derived only from capped local aggregate event counts and keeps `token_cost: 0`
- Daily Rite session extraction moved run object assembly/completion out of `src/App.jsx` without moving combat state or changing persistence boundaries
- local validation passed: 56 unit tests, production build, and smoke runtime

## 2026-06-11 Public-Safe Check

- Daily Rite stakes are deterministic functions of the Director route plan and expose only public route labels, risk scores, rewards, and guidance; `token_cost` remains 0
- feedback attribution stores only capped, sanitized `action_id` and `source` labels plus aggregate counts; it still stores no raw saves, private notes, credentials, cookies, or internal ops data
- backend readiness now exports a public-safe runbook for `PG_CONNECTION_SOLARA` without exposing connection material
- local Studio protocol shims are explicit no-ops for public-repo boundaries and do not read private cargo or credentials
- local validation passed: 56 unit tests, production build, smoke runtime, startup-brief render, and brief-format validation
- closeout continuation revalidated the same public-safe surfaces, added `docs/CLOSEOUT_BRIEF_2026-06-11.md` and `audits/2026-06-11.json`, and confirmed the closeout board format gate passes

## 2026-06-11 Session 66 Public-Safe Check

- Daily Rite mechanical modifiers are deterministic functions of public route stakes; they expose bounded enemy/reward multipliers and keep `token_cost: 0`
- public chronicle/status exports now include `daily_rite_modifiers` so Studio integrations can distinguish visible stakes from mechanical route pressure without credentials or paid generation
- Daily Rite status contracts expose only UI state, action availability, stake labels, risk labels, and modifier labels; no private player payloads or secrets are included
- feedback route targets are fixed public UI intents and remain aggregate-only alongside capped local feedback attribution
- local validation passed: 57 unit tests, production build, and smoke runtime
