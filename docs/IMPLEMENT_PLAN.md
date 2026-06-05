<!-- generated-by: /implement skill v1.0 -->
<!-- generated-at: 2026-06-04 -->
<!-- source: docs/AUDIT_2026-06-04.json -->

# Implement Plan — Solara · 2026-06-04

Sequenced for Priority-per-hour, not raw Priority.

| Seq | Slug | Audit # | Surface group | Why this slot |
|---|---|---|---|---|
| 1 | director-memory | 4 | Director | 1h foundational; almanac shares the Director surface next |
| 2 | sun-almanac | 1 | Director | Top-priority item rides the warm Director context |
| 3 | legacy-vows | 3 | Run lifecycle | Foundational for challenge-links (vow rides the URL token) |
| 4 | sundial-queue | 2 | Shared-world service | Independent service surface; blocker-to-feature conversion |
| 5 | chronicle-scenes | 5 | Chronicle exports | Reads outputs of 1–4 (memory, almanac, vows, queue receipts) |
| 6 | challenge-links | 6 | Boot/URL + debrief | Depends on vows; stamps debrief comparison |
| 7 | save-fuzz-tests | 7 | Tests only | Validates save surface after all feature writes settle |
| 8 | hud-text-scale | 8 | UI/CSS | Pure presentation; no logic dependencies |
| 9 | menu-chunk-split | 9 | Build config | Perf/token-adjacent — measured last per heuristic |
| 10 | board-hygiene-worktree | 10 | Context docs | Folds into closeout write-back path |

Preflight: no item names a credentialed capability (sundial-queue is local-outbox only; flush path reuses existing service guards). `SUPABASE_DB_URL` blocker remains flagged for Carter — no item depends on it.
