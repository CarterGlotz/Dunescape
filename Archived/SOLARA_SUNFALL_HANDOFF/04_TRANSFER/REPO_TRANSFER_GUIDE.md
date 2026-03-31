# DUNESCAPE → SOLARA: TRANSFER GUIDE
### Complete Repository Migration & Rebrand Protocol
### VaultSpark Studios · March 2026

---

## OVERVIEW

This is not a new project. This is a **rename and redesign** of the existing Dunescape codebase.

**Before transfer:** `VaultSparkStudios/dunescape`
**After transfer:** `VaultSparkStudios/solara`

All git history, all commit logs, all issues, all existing CI workflows transfer with the repo. Nothing is lost.

---

## PRE-TRANSFER CHECKLIST

Before renaming the GitHub repo, verify:

- [ ] Current build is passing (`npm run build` succeeds)
- [ ] All player saves are backed up (they live in user browsers, not the server — no backup needed)
- [ ] Note the current live URL: `https://vaultsparkstudios.github.io/dunescape/`
- [ ] Note the current GitHub Pages settings (Settings → Pages → Source branch)
- [ ] Confirm no external links exist that must be redirected (check README, any published links)

---

## STEP 1: RENAME GITHUB REPOSITORY (Manual — Carter)

1. Go to `https://github.com/VaultSparkStudios/dunescape`
2. Click **Settings** → scroll to **Repository name**
3. Change `dunescape` to `solara`
4. Click **Rename**

GitHub automatically:
- Redirects all old URLs to the new repo name
- Preserves all git history, issues, PRs, actions
- Updates GitHub Pages to serve from the new path `/solara/`

**After rename:** The game will be temporarily offline until the Vite config is updated and redeployed.

---

## STEP 2: CLONE AND UPDATE LOCAL (Development Agent)

```bash
# Clone the renamed repo
git clone https://github.com/VaultSparkStudios/solara.git
cd solara

# Install dependencies
npm install

# Verify build works before making changes
npm run build
```

---

## STEP 3: APP.JSX REBRAND PASS (Development Agent)

### String replacements (safe to do in one pass)

Open `src/App.jsx` and perform the following replacements:

```bash
# These replacements are safe to run with sed or find-replace
# String literals only — not variable names or logic

"Dunescape" → "Solara: Sunfall"
"dunescape" (in strings) → "solara"
'dunescape_save' → 'solara_save'  # EXCEPT in migration shim
SAVE_VERSION=4 → SAVE_VERSION=5
```

### IP cleanup replacements (location names)

In the `genNPCs()` function and any hardcoded location strings:

```javascript
// Find and replace these strings
"Lumbridge" → "Solara's Rest"
"Varrock" → "The Sanctum"
"Barbarian Village" → "The Outlander Camp"
"Al Kharid" → "The Amber District"
"Karamja" → "The Southern Isle"
"Draynor Village" → "Ashfen"
"Falador" → "The White Fort"
"Karamja" → "The Southern Isle"
"Wilderness" → "The Ashlands"

// NPC names in genNPCs() array
"Hans" → "Alder"
"Cook" → "Mara"
"Doric" → "Stone-Reader"
"Fishing Tutor" → "The Tide-Watcher"
"Banker" → "The Archivist"
"Shopkeeper" → "Sun Merchant"
"Barbarian" → "Outlander Elder"
"Ali" → "Farris"
"Agility Trainer" → "The Course-Keeper"
```

### Save migration shim (insert BEFORE existing load function)

```javascript
// === SOLARA SAVE MIGRATION SHIM ===
// Migrates from Dunescape (legacy) to Solara save format
const migrateLegacySave = () => {
  const legacyKey = 'dunescape_save';
  const newKey = 'solara_save';
  const oldData = localStorage.getItem(legacyKey);
  const newData = localStorage.getItem(newKey);
  
  if (oldData && !newData) {
    try {
      const save = JSON.parse(oldData);
      save.saveVersion = 5;
      save.migratedFrom = 'dunescape';
      save.migratedAt = Date.now();
      localStorage.setItem(newKey, JSON.stringify(save));
      localStorage.removeItem(legacyKey);
      console.log('[Solara] Legacy Dunescape save migrated successfully.');
    } catch (err) {
      console.warn('[Solara] Legacy save migration failed. Starting fresh.', err);
    }
  }
};
migrateLegacySave();
// === END MIGRATION SHIM ===
```

---

## STEP 4: CONFIG FILE UPDATES

### package.json
```json
{
  "name": "solara",
  "version": "1.0.0",
  "description": "Solara: Sunfall — A browser roguelite where a shared sun dims with every player death",
  "homepage": "https://vaultsparkstudios.github.io/solara/",
  "private": true
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/solara/',
  plugins: [react()],
})
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solara: Sunfall</title>
  <meta name="description" content="A browser roguelite RPG. A shared sun dims with every death. Will your community save it?">
  <meta property="og:title" content="Solara: Sunfall">
  <meta property="og:description" content="Every death dims the sun. Run. Survive. Leave your mark forever.">
  <meta property="og:type" content="website">
  <meta name="theme-color" content="#c87820">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### public/CNAME (if using custom domain)
```
solara.vaultsparkstudios.com
```

---

## STEP 5: GITHUB ACTIONS WORKFLOW UPDATE

Update `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy Solara

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_SEASON_NUMBER: ${{ vars.VITE_SEASON_NUMBER || '1' }}
          VITE_SEASON_NAME: ${{ vars.VITE_SEASON_NAME || 'The Wandering Comet' }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### GitHub Secrets to configure (Settings → Secrets → Actions)
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key

### GitHub Variables to configure (Settings → Variables → Actions)
- `VITE_SEASON_NUMBER` = `1`
- `VITE_SEASON_NAME` = `The Wandering Comet`

---

## STEP 6: COMMIT AND DEPLOY

```bash
git add -A
git commit -m "feat: Dunescape → Solara rebrand — Phase 0 complete

- Renamed all Dunescape strings to Solara: Sunfall
- Updated localStorage key with migration shim (dunescape_save → solara_save)
- Updated save version to 5
- Replaced OSRS-derived location and NPC names
- Updated package.json, vite.config.js, index.html
- Updated GitHub Actions workflow for new repo structure"

git push origin main
```

The GitHub Actions workflow will automatically build and deploy to GitHub Pages.

---

## STEP 7: VERIFY DEPLOYMENT

After GitHub Actions completes (~3 minutes):

1. Visit `https://vaultsparkstudios.github.io/solara/`
2. Confirm game loads with new "Solara: Sunfall" title
3. Test save migration: open browser DevTools → Application → Local Storage
   - Should see `solara_save` key (if `dunescape_save` existed, it should be gone)
4. Confirm canvas renders at correct dimensions
5. Confirm no OSRS location names appear in-game

---

## STEP 8: OLD REPO REDIRECT

GitHub automatically redirects `github.com/VaultSparkStudios/dunescape` to `github.com/VaultSparkStudios/solara`. No action needed.

For the old GitHub Pages URL (`vaultsparkstudios.github.io/dunescape/`): GitHub does NOT auto-redirect Pages URLs. Options:
1. Leave it — old URLs show a 404, which is acceptable
2. Create a minimal redirect page at the old path (requires keeping a `dunescape` branch or repo)
3. Recommended: leave as 404. The old URL was never heavily marketed.

---

## POST-TRANSFER VERIFICATION MATRIX

| Check | Expected | Pass/Fail |
|-------|---------|-----------|
| New URL loads | Game shows "Solara: Sunfall" | |
| Old URL behavior | 404 or redirect | |
| Save migration | `dunescape_save` → `solara_save` | |
| Build size | < 500KB gzipped | |
| No OSRS names in UI | Lumbridge etc. absent | |
| Canvas dimensions | 544×448px | |
| GitHub Actions | Green check | |
| localStorage key | `solara_save` | |

---

*Dunescape → Solara Transfer Guide · VaultSpark Studios · March 2026*
