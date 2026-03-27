# Brain

## Mental model

- how this project wins: The viral share loop (Daily Rites emoji card) brings players in; the collective sun mechanic keeps them invested; graves and the Oracle make them return
- what matters most: Shipping a working, emotionally resonant experience — not feature count
- what tradeoffs we gladly make: Scope reduction over quality reduction; free tier infra over richer backend

## Working heuristics

- heuristic: Keep App.jsx as one file until 5,000 lines — splitting now breaks Claude Code context coherence
- when it applies: Any refactor decision
- heuristic: Ship small, learn fast — get each phase live before building the next
- when it applies: All feature work
- heuristic: Zero backend cost until 50k MAU — everything on Supabase free tier
- when it applies: Any new backend feature decision

## Current strategic beliefs

- belief: The collective death mechanic is the most differentiating feature — no competitor has it
- evidence: Extensive strategic analysis in SOLARA_SUNFALL_HANDOFF
- confidence: High

- belief: Daily Rites (date-seeded dungeon + emoji share card) is the primary acquisition loop
- evidence: Wordle/NYT model validated at scale
- confidence: High

## Architecture decisions

| Decision | Rationale |
|----------|-----------|
| Single App.jsx | Claude Code context coherence at current scale |
| Supabase free tier | Zero DevOps, sufficient for Phase 1–3 |
| Date-seeded dungeon (no server) | Zero cost, still gives shared experience |
| Save migration shim | Preserve all Dunescape player progress |
| SAVE_VERSION 5 | Incremented from 4 on Phase 0 rebrand |
