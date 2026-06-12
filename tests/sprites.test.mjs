import { test } from "node:test";
import assert from "node:assert/strict";
import { shadeHex, buildTileAtlas } from "../src/game/sprites.js";

test("shadeHex lightens, darkens, and clamps to the 0-255 range", () => {
  assert.equal(shadeHex("#000000", 16), "rgb(16,16,16)");
  assert.equal(shadeHex("#ffffff", 40), "rgb(255,255,255)"); // clamped high
  assert.equal(shadeHex("#101010", -40), "rgb(0,0,0)"); // clamped low
  assert.equal(shadeHex("#8a2005", 0), "rgb(138,32,5)");
});

test("shadeHex expands 3-digit hex", () => {
  assert.equal(shadeHex("#abc", 0), "rgb(170,187,204)");
});

test("buildTileAtlas returns null without a DOM (safe fallback)", () => {
  // In Node there is no `document`; the renderer must fall back to procedural fills.
  assert.equal(buildTileAtlas(32, { G: 0, W: 2 }, { 0: ["#8a2005"], 2: ["#1a2848"] }), null);
});
