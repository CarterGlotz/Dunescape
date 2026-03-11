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

- Bundles are NOT deployed from this repo's own GitHub Pages.
- `deploy-pages.yml` builds the static client and syncs it into
  `VaultSparkStudios.github.io/dunescape/` using `STUDIO_SITE_TOKEN`.
- GitHub Pages casing rule: the studio site repo owns the canonical lowercase URL.

## Workflow files

- `.github/workflows/ci.yml` — build on push/PR
- `.github/workflows/deploy-pages.yml` — studio-site-sync deploy

## Required GitHub variables (set in repo Settings → Variables)

| Variable | Value |
|---|---|
| `GAME_SLUG` | `dunescape` |
| `STUDIO_SITE_BRANCH` | `main` |
| `GAME_SERVICE_ORIGIN` | `https://play-dunescape.vaultsparkstudios.com` |
| `API_DOMAIN` | `api-dunescape.vaultsparkstudios.com` |

## Required GitHub secret (set in repo Settings → Secrets)

| Secret | Purpose |
|---|---|
| `STUDIO_SITE_TOKEN` | PAT with write access to `VaultSparkStudios.github.io` |

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

- GitHub repo variables and `STUDIO_SITE_TOKEN` secret must be set manually
  in the GitHub repo settings before `deploy-pages.yml` will succeed.
- Studio site `index.html`: add Dunescape card to `Vault-Forged` section
  at `/dunescape/` after the first successful bundle sync.
- `deploy.yml` (old GitHub Pages workflow) should be removed or disabled
  once `deploy-pages.yml` is confirmed working.
- No backend runtime configured yet for `play-dunescape` or `api-dunescape`.

## Last validation

- Local dev: `npm run dev` — confirmed working
- Local build: `npm run build` — confirmed working
