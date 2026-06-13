import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_UI_SCALE, loadPreferences } from "../src/game/clientStore.js";

const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) : null),
  setItem: (key, value) => {
    memoryStore.set(key, String(value));
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

test("preferences persist explicit touch movement controls", () => {
  memoryStore.clear();
  localStorage.setItem("solara_preferences", JSON.stringify({ showTouchControls: true, uiScale: 1.3 }));

  const prefs = loadPreferences();

  assert.equal(prefs.showTouchControls, true);
  assert.equal(prefs.uiScale, 1.3);
});

test("preferences default touch controls off for pointer-precise browsers", () => {
  memoryStore.clear();

  const prefs = loadPreferences();

  assert.equal(prefs.showTouchControls, false);
  assert.equal(prefs.uiScale, DEFAULT_UI_SCALE);
});
