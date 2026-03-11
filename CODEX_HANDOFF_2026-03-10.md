# Codex Handoff — Dunescape — 2026-03-10

## Repo

- Name: `dunescape` (lowercase with hyphens — GitHub recommended convention)
- Remote: `https://github.com/VaultSparkStudios/dunescape.git`
- Branch: `main`

## Public frontend

- Slug: `dunescape`
- URL: `https://vaultsparkstudios.com/dunescape/`
- Hosted via: own-repo GitHub Pages (`VaultSparkStudios/dunescape`)

## Backend origins

- Gameplay/socket: `https://play-dunescape.vaultsparkstudios.com` (not yet provisioned)
- API: `https://api-dunescape.vaultsparkstudios.com` (not yet provisioned)

## Deployment model

- This repo deploys its own GitHub Pages directly via `deploy-pages.yml`.
- Because the repo name is lowercase (`dunescape`) and the org has a custom domain,
  Pages is automatically served at `https://vaultsparkstudios.com/dunescape/`.
- No cross-repo sync or `STUDIO_SITE_TOKEN` required.

## Workflow files

- `.github/workflows/ci.yml` — build on push/PR
- `.github/workflows/deploy-pages.yml` — own-repo Pages deploy

## GitHub setup status

- ✅ Repo renamed to `dunescape` (lowercase) on GitHub
- ✅ Local remote updated to `https://github.com/VaultSparkStudios/dunescape.git`
- ✅ Pages source set to GitHub Actions
- ✅ Deploy confirmed live — run 22934660220, 18s, success

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
- Updated `vite.config.js` base to use `VITE_APP_BASE_PATH` env var
- Added `build:pages` script and `scripts/postbuild-pages.mjs` (SPA 404 fallback)
- Added `.github/workflows/deploy-pages.yml` (own-repo Pages, not studio-site-sync)
- Added `.github/workflows/ci.yml`
- Added `AGENTS.md` with Studio System Template
- Added `docs/` with local copies of all studio standard docs
- Updated all studio deployment docs: own-repo Pages model, lowercase repo names
- Switched deployment from studio-site-sync to own-repo Pages

## Known issues / next steps

- Studio site `index.html`: add Dunescape card to `Vault-Forged` section at `/dunescape/`
- No backend runtime configured yet for `play-dunescape` or `api-dunescape`
- Node.js 20 deprecation warnings in workflow — upgrade actions before June 2026

## Last validation

- CI: ✅ passing
- Deploy Pages: ✅ run 22934660220 — success, 18s
- Live URL: `https://vaultsparkstudios.com/dunescape/`
