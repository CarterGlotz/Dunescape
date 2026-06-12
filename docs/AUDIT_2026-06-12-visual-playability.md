# Solara: Sunfall — Visual & Playability Audit (2026-06-12)

Focused pass on player-reported issues: off-screen text, camera not following,
broken "Set camp", small/low-contrast UI, and overall render quality. All changes
are in `src/App.jsx` unless noted. Build + 64 tests + runtime smoke all green.

## Fixed this pass

| # | Issue | Fix |
|---|-------|-----|
| 1 | Camera stayed near spawn, large dead-zone made it feel unanchored | `followCamera` now centers on the player with a smooth lerp and centers the map when the viewport exceeds map bounds |
| 2 | "Set camp" did nothing — set `p.camp` coords but never created a chest, so camp was unreachable | Set/Move camp now spawns a `camp_chest` object + persistent campfire, validates the tile, is recreated from save on load, and renders a tent+chest sprite |
| 3 | Blurry rendering on HiDPI/Windows-scaled displays | Canvas backing store now scales by `devicePixelRatio` (capped 3×); draw transform + click math made DPR-aware |
| 4 | Dialogue text overflowed its box / ran off-screen | Dialogue box centered, enlarged (16px body), word-wrapped, higher contrast |
| 5 | Tiny low-contrast HUD text (location, nameplate, chatter, combat log) | Enlarged + solid backgrounds + brighter colors; location label auto-sizes; chat log box taller with white→cream gradient |
| 6 | Panels rendered off-screen at UI-scale > 1 (root uses CSS `zoom`) | Objective/ghost panel defaults, drag clamps, and context menu now divide by `uiScale` so they stay on-screen |
| 7 | Right-click context menu could open off-screen and was offset from cursor at scale>1 | Menu clamps to viewport, corrects the zoom offset, and is larger/higher-contrast |
| 8 | Inventory item names unreadable (6px grey, truncated) | 8px cream with shadow + ellipsis |
| 9 | Bestiary / prayers / upgrades / settings description text low-contrast (6–7px #666) | Bumped to 8–9px, brighter tones |
| 10 | Default UI scale felt cramped | Default `DEFAULT_UI_SCALE` 1 → 1.15 (`src/game/clientStore.js`) |

## Feature integration check

No `TODO`/`FIXME`/placeholder markers in `src/`. All React components and
`content.js` exports are wired and used. Game systems (vows, almanac, director
memory, sundial queue, chronicle scenes, daily-rite chain) are integrated and
covered by tests. A handful of `src/game/*` exports are only used internally
(`getVowLegacyValue`, `feedbackLedger` load/clear helpers, several `sharedWorld`
internals) — benign over-exports, not missing features.

## Follow-up pass — recommended-next items shipped

- **Asset pipeline (terrain atlas)**: added `src/game/sprites.js` (`buildTileAtlas`,
  `shadeHex`). At setup the renderer pre-renders every terrain type/variant into a
  single offscreen atlas (gradient depth + deterministic grain + water/lava/sand
  accents) and blits each visible tile with `drawImage` instead of a flat fill —
  richer texture and a draw-call win, with a procedural fallback when no DOM/atlas.
  Covered by `tests/sprites.test.mjs`.
- **Map canvas DPR**: `WorldMapCanvas` now renders at `devicePixelRatio` (backing
  store ×dpr, CSS size unchanged) so the full-screen map is crisp.
- **Mobile**: grave popup is now `width:min(280px,86vw)` with `maxHeight:60vh`
  scroll so it never overflows narrow screens. (Touch already supported tap=move /
  long-press=context-menu via synthesized events.)

## Still open (not blocking)

- **Entity sprites**: player/monsters/objects are still procedural; extending the
  atlas pipeline to them is the next visual lever (kept out of this pass to avoid
  destabilizing the per-subtype color logic in the draw loop).
- **Pinch-to-zoom / on-screen joystick** for touch; floating combat text pooling
  during dense fights; a global ≥11px sweep for the deepest settings/quest labels.
