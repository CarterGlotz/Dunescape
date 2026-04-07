import test from "node:test";
import assert from "node:assert/strict";
import {
  applyRunBlessing,
  getEchoBlessing,
  getSharedWorldSnapshot,
  getSunPhase,
} from "../src/game/sharedWorld.js";
import { createSaveSanitizer } from "../src/game/save.js";
import {
  applyMonsterWorldState,
  getCombatBonuses,
  getDynamicWorldEvent,
  getMerchantPriceScale,
  resetRunScopedBonuses,
} from "../src/game/worldRuntime.js";

test("getSunPhase classifies eclipse thresholds", () => {
  assert.equal(getSunPhase(10).id, "eclipse");
  assert.equal(getSunPhase(75).id, "amber_warning");
});

test("getSharedWorldSnapshot responds to leader control and low sun", () => {
  const eclipse = getSharedWorldSnapshot({
    sunBrightness: 8,
    totalDeaths: 5000,
    leaderboard: [{ faction: "eclipser" }, { faction: "eclipser" }, { faction: "sunkeeper" }],
    echoes: [],
  });
  assert.equal(eclipse.event.id, "umbra_surge");

  const convoy = getSharedWorldSnapshot({
    sunBrightness: 88,
    totalDeaths: 120,
    leaderboard: [{ faction: "sunkeeper" }, { faction: "sunkeeper" }],
    echoes: [],
  });
  assert.equal(convoy.event.id, "sunkeeper_convoy");
});

test("echo blessing prefers the dominant recent signal", () => {
  const blessing = getEchoBlessing([
    { kind: "roguelite", commend_count: 2, mourn_count: 0 },
    { kind: "roguelite", commend_count: 1, mourn_count: 0 },
  ]);
  assert.equal(blessing.id, "emberspur");
});

test("applyRunBlessing mutates player with bounded bonuses", () => {
  const player = { hp: 10, mhp: 10, prayer: 1, maxPrayer: 1 };
  applyRunBlessing(player, { bonus: { hp: 4, pray: 3, atk: 1, str: 1 } });
  assert.equal(player.mhp, 10);
  assert.equal(player.hp, 10);
  assert.equal(player.maxPrayer, 1);
  assert.equal(player.prayer, 1);
  assert.equal(player.echoAtkBonus, 1);
});

test("save sanitizer removes invalid item entries and clamps values", () => {
  const sanitizeSaveData = createSaveSanitizer({
    items: { bread: { n: "Bread" }, bronze_sword: { n: "Sword" } },
    saveVersion: 5,
  });
  const result = sanitizeSaveData(
    {
      hp: 999,
      mhp: 10,
      prayer: 99,
      maxPrayer: 5,
      inv: [{ i: "bread", c: 2 }, { i: "missing", c: 1 }],
      eq: { weapon: "bronze_sword" },
      playerName: "  Test   User  ",
      travelerSigil: " sigil ",
    },
    "Fallback",
    "SIGIL-1",
  );
  assert.equal(result.data.hp, 10);
  assert.equal(result.data.prayer, 5);
  assert.deepEqual(result.data.inv, [{ i: "bread", c: 2 }]);
  assert.equal(result.data.playerName, "Test User");
  assert.ok(result.issues.length >= 2);
});

test("world runtime scales monsters and merchant prices from snapshot", () => {
  const snapshot = getSharedWorldSnapshot({
    sunBrightness: 8,
    totalDeaths: 5000,
    leaderboard: [{ faction: "eclipser" }, { faction: "eclipser" }, { faction: "sunkeeper" }],
    echoes: [],
  });
  const mon = applyMonsterWorldState({ hp: 100, mhp: 100, atk: 10, def: 8, str: 10, xp: 40 }, snapshot, "dungeon");
  assert.ok(mon.hp > 100);
  assert.ok(getMerchantPriceScale(snapshot, 0) > 1);
  assert.ok(getMerchantPriceScale(snapshot, 25) < getMerchantPriceScale(snapshot, 0));
});

test("world runtime exposes combat bonuses and reset", () => {
  const player = { echoAtkBonus: 1, echoStrBonus: 2, echoDefBonus: 3, echoLuckBonus: 4 };
  assert.deepEqual(getCombatBonuses(player), { attack: 1, strength: 2, defence: 3, luck: 4 });
  resetRunScopedBonuses(player);
  assert.deepEqual(getCombatBonuses(player), { attack: 0, strength: 0, defence: 0, luck: 0 });
});

test("dynamic world event responds to snapshot pressure", () => {
  const eclipse = getDynamicWorldEvent(
    getSharedWorldSnapshot({ sunBrightness: 5, totalDeaths: 2000, leaderboard: [], echoes: [] }),
  );
  assert.equal(eclipse.type, "umbra_surge");
});
