# Agent Instructions — dunescape

## Project identity

- Repo name: `dunescape` (lowercase with hyphens — GitHub recommended convention)
- Public slug: `dunescape` (identical to repo name)
- Public URL: `https://vaultsparkstudios.com/dunescape/`
- Gameplay origin: `https://play-dunescape.vaultsparkstudios.com`
- API origin: `https://api-dunescape.vaultsparkstudios.com`
- Studio site repo: `VaultSparkStudios/VaultSparkStudios.github.io`

## Deployment standards

Before making deployment, domain, GitHub Pages, or studio-site integration
changes, read these files first:

- `docs/STUDIO_DEPLOYMENT_STANDARD.md`
- `docs/STUDIO_BACKEND_PLAN.md`
- `docs/DEPLOY_PAGES.md`
- `docs/templates/deploy-pages.template.yml`
- `docs/templates/deploy-backend.docker-compose.template.yml`
- `docs/templates/Caddyfile.studio-backend.template`
- `docs/templates/GAME_LAUNCH_CHECKLIST.template.md`

## Required behavior

- Treat `docs/STUDIO_DEPLOYMENT_STANDARD.md` as the default studio-wide policy.
- Keep this repo self-sufficient: deployment/domain/workflow context must remain
  understandable from repo files, not just prior chat context.
- **Repo name is `dunescape` — lowercase with hyphens, following GitHub's recommended convention.**
- **This repo deploys its own GitHub Pages directly.** Because the repo name is lowercase
  (`dunescape`) and the org has a custom domain, Pages is automatically served at
  `https://vaultsparkstudios.com/dunescape/`. No cross-repo sync required.
- GitHub Pages source must be set to **GitHub Actions** in repo Settings → Pages.
- Keep frontend Pages deployment separate from backend/runtime deployment.
- Update `CODEX_HANDOFF_YYYY-MM-DD.md` after deployment-related changes.
- If you create a temporary clone of another repo inside this repo, add it to
  `.git/info/exclude` so it cannot be accidentally staged here.

## Required GitHub setup

**Settings → Pages:** Set Source to **GitHub Actions** (one-time, enables the deploy).

No secrets or variables are required for Pages deployment. Dunescape has no backend yet.

## Workflow files

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Typecheck, lint, build on push/PR |
| `.github/workflows/deploy-pages.yml` | Build + sync bundle to studio site |

## Key source files

| File | Purpose |
|---|---|
| `src/App.jsx` | Main game component (`DS()`) — all gameplay logic |
| `src/main.jsx` | React entry point |
| `vite.config.js` | Vite config; base uses `VITE_APP_BASE_PATH` env var |
| `scripts/postbuild-pages.mjs` | Copies `dist/index.html` → `dist/404.html` for SPA fallback |

---

## Studio System Template

This section defines the VaultSpark Studios standard for maintaining AI session
memory across hundreds of sessions. Every project and every AI agent operating
in this studio follows this system. Treat it as canon.

### Core principle

Never rely on chat history as the source of truth. Treat each AI session like
a stateless contractor that reads a compact project package, does work, and
writes back updates.

### 1. One canonical project folder

Every project gets a root structure:

```
/{ProjectName}
  /context
  /docs
  /plans
  /specs
  /logs
  /handoffs
  /prompts
  /src
```

The AI never "remembers the project." It reads the project's memory files.

### 2. Five core memory files

Every project maintains five always-updated files.

#### `context/PROJECT_BRIEF.md`

What the project is.

```
# Project Brief

Name: <ProjectName>
Type: <type>
Core fantasy: <one sentence>
Non-goals: <what this is not>

Design pillars:
- <pillar 1>
- <pillar 2>
- <pillar 3>
```

#### `context/CURRENT_STATE.md`

What is true right now.

```
# Current State

Build status:
- <status 1>
- <status 2>

Current priorities:
1. <priority 1>
2. <priority 2>

Known issues:
- <issue 1>
- <issue 2>
```

#### `context/DECISIONS.md`

Why key choices were made.

```
# Decisions

- <decision and rationale>
- <decision and rationale>
```

#### `context/TASK_BOARD.md`

The active queue.

```
# Task Board

## Now
- <active task>

## Next
- <queued task>

## Later
- <backlog item>
```

#### `handoffs/LATEST_HANDOFF.md`

What the next AI session needs in under 60 seconds.

```
# Latest Handoff

Last updated: YYYY-MM-DD

What was completed:
- <item>

What is mid-flight:
- <item>

What to do next:
1. <step>
2. <step>

Important constraints:
- <constraint>
```

### 3. Required session bootstrap prompt

Before any AI starts working, paste this standard bootstrap:

```
You are joining an existing project. Treat the repository files as source
of truth, not prior chat history.

Read in this order:
1. context/PROJECT_BRIEF.md
2. context/CURRENT_STATE.md
3. context/DECISIONS.md
4. context/TASK_BOARD.md
5. handoffs/LATEST_HANDOFF.md

Rules:
- preserve existing functionality unless explicitly told to remove it
- update memory files after making meaningful changes
- explain changes in terms of current architecture
- note assumptions clearly
```

### 4. Every work session ends with a write-back

At the end of each session, the AI must update:

- `context/CURRENT_STATE.md`
- `context/TASK_BOARD.md`
- `handoffs/LATEST_HANDOFF.md`

Without write-back, the system collapses and the next session starts drifting.

Standard closeout format:

```
## Session Closeout

Completed:
- ...

Changed files:
- ...

Open problems:
- ...

Recommended next action:
- ...
```

### 5. Use layered context, not giant dumps

Give the AI only what it needs for the current task.

- Layer 1: project identity
- Layer 2: current state
- Layer 3: active task
- Layer 4: relevant code or spec excerpts only

This keeps the model focused and avoids wasted tokens.

### Operating rhythm

| Session type | Read order | End action |
|---|---|---|
| Planning | brief → decisions → roadmap | update task board |
| Coding | handoff → relevant files → implement | write back state + handoff |
| Debugging | current state → reproduce → root cause | write back findings |
| Creative | brand/style guide → generate | save prompt + output notes |

### File pattern for multi-AI teams

When using multiple AI tools (Claude, ChatGPT, Codex, local) in parallel,
separate stable truth from temporary notes:

```
/context
  PROJECT_BRIEF.md       ← long-lived truth
  CURRENT_STATE.md
  DECISIONS.md

/specs
  <system>.md            ← deep system detail

/handoffs
  HANDOFF_YYYY-MM-DD_CLAUDE.md
  HANDOFF_YYYY-MM-DD_GPT.md
  LATEST_HANDOFF.md      ← session transitions

/logs
  SESSION_LOG.md         ← chronological memory

/prompts
  bootstrap_prompt.md    ← reusable instructions
  coding_prompt.md
```
