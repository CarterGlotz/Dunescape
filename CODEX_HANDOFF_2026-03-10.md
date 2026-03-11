# Codex Handoff — Dunescape — 2026-03-10

## Repo

- Name: `dunescape` (lowercase with hyphens — GitHub recommended convention)
- Remote: `https://github.com/VaultSparkStudios/dunescape.git`
- Branch: `main`

## Public frontend

- Slug: `dunescape` (always lowercase)
- URL: `https://vaultsparkstudios.com/dunescape/`
- Hosted via: `VaultSparkStudios/VaultSparkStudios.github.io` at `/dunescape/`

## Backend origins

- Gameplay/socket: `https://play-dunescape.vaultsparkstudios.com`
- API: `https://api-dunescape.vaultsparkstudios.com`

## Deployment model

- This repo deploys its own GitHub Pages directly via `deploy-pages.yml`.
- Because the repo name is lowercase (`dunescape`) and the org has a custom domain,
  Pages is automatically served at `https://vaultsparkstudios.com/dunescape/`.
- No cross-repo sync or `STUDIO_SITE_TOKEN` required.
- **One-time setup required:** repo Settings → Pages → Source → GitHub Actions.

## Workflow files

- `.github/workflows/ci.yml` — build on push/PR
- `.github/workflows/deploy-pages.yml` — studio-site-sync deploy

## Required GitHub setup

- Settings → Pages → Source: **GitHub Actions** (one-time)
- No secrets or variables required for Pages deployment

## What was completed this session

- Renamed all `RuneScape` / `RS` references to `Dunescape` / `DS`
- Full desert red terrain color overhaul (`TC` palette)
- Added smithing modal (player-choice recipe UI) with `smithQueueR` ref pattern
- Added `localStorage` auto-save (60s) + manual save button
- Tool enforcement: axe required for woodcutting, pickaxe for mining
- Desert Vow quest: kill 3 Scorpions for Ali
- 15 decorative cacti objects (click-passthrough)
- Ground item labels (emoji + item name)
- Rocky ground detail (pebbles + crack lines)
- Updated `vite.config.js` base to `process.env.VITE_APP_BASE_PATH || "/dunescape/"`
- Added `build:pages` script and `scripts/postbuild-pages.mjs`
- Added `.github/workflows/deploy-pages.yml` (studio-site-sync)
- Added `.github/workflows/ci.yml`
- Added `AGENTS.md` with Studio System Template
- Added `docs/` with local copies of all studio standard docs

## Known issues / next steps

- **Set Pages source to GitHub Actions** in repo Settings → Pages (one-time manual step).
- Rename repo from `Dunescape` → `dunescape` on GitHub (Settings → General).
- Studio site `index.html`: add Dunescape card to `Vault-Forged` section
  at `/dunescape/` after the first successful bundle sync.
- `deploy.yml` (old GitHub Pages workflow) should be removed or disabled
  once `deploy-pages.yml` is confirmed working.
- No backend runtime configured yet for `play-dunescape` or `api-dunescape`.

## Last validation

- Local dev: `npm run dev` — confirmed working
- Local build: `npm run build` — confirmed working
