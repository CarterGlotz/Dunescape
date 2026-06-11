import test from "node:test";
import assert from "node:assert/strict";
import { buildDailyRiteRoomSequence } from "../src/game/dailyRiteRooms.js";
import { getDailyRiteConsequence } from "../src/game/dailyRiteConsequences.js";
import { completeDailyRiteRun, createDailyRiteRun } from "../src/game/dailyRunSession.js";
import { getDailyRitePlan } from "../src/game/directorMechanics.js";
import { clearFeedbackLedger, getFeedbackNextActionDigest, loadFeedbackLedger, recordFeedbackEvent, summarizeFeedbackLedger } from "../src/game/feedbackLedger.js";
import { buildPublicChronicle } from "../src/game/chronicle.js";
import { getSharedWorldSnapshot } from "../src/game/sharedWorld.js";

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

test("Daily Rite room weave consumes Director route segments deterministically", () => {
  const dimmingWorld = getSharedWorldSnapshot({
    sunBrightness: 18,
    totalDeaths: 3200,
    leaderboard: [{ faction: "eclipser", wave_reached: 12 }],
    echoes: [{ player_name: "Mara", traveler_sigil: "MARA", kind: "roguelite", wave_reached: 16, commend_count: 3 }],
    graves: Array.from({ length: 6 }, (_, index) => ({ x: 10 + index, y: 16, sunstone_offerings: 18, epitaph: "ash" })),
    dayNumber: 75,
  });
  const plan = getDailyRitePlan({ sharedWorld: dimmingWorld, dayNumber: 75 });
  const first = buildDailyRiteRoomSequence({ dailyRitePlan: plan, daySeed: "solara-test-day" });
  const second = buildDailyRiteRoomSequence({ dailyRitePlan: plan, daySeed: "solara-test-day" });

  assert.deepEqual(first, second);
  assert.equal(first.rooms.length, 30);
  assert.equal(first.rooms.at(-1), 4);
  assert.equal(first.segmentByWave.length, 30);
  assert.match(first.segmentByWave[0].goal, /Route|Prepare|Use|Push|Trade|Survive/);
  assert.ok(new Set(first.rooms.slice(0, 29)).size >= 2);
  assert.match(first.summary, /room weave/);
});

test("Daily Rite consequence engine and run factory share deterministic segment copy", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 18,
    totalDeaths: 3200,
    leaderboard: [{ faction: "eclipser", wave_reached: 12 }],
    echoes: [],
    graves: Array.from({ length: 6 }, (_, index) => ({ x: 10 + index, y: 16, sunstone_offerings: 18, epitaph: "ash" })),
    dayNumber: 75,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 75 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.1 }, daySeed: "solara-test-day", now: 1000 });
  const consequence = getDailyRiteConsequence({ dailyRitePlan: plan, roomWeave: run.roomWeave, wave: 4, outcome: "clear" });

  assert.equal(run.rooms.length, 30);
  assert.equal(run.stakes.token_cost, 0);
  assert.equal(run.stakes.segment_count, plan.route.length);
  assert.ok(run.stakes.primary_stake.risk >= 1);
  assert.ok(run.pacingCoach.next_action);
  assert.match(run.consequence.entry_line, /Room entered|Waves|for/);
  assert.equal(consequence.wave, 4);
  assert.ok(["steady", "rising", "high", "emergency"].includes(consequence.urgency));
  assert.match(consequence.clear_line, /answered/);

  run.vowResult = { kept: true, title: "Dawnbreaker" };
  completeDailyRiteRun({
    run,
    wave: 12,
    completed: false,
    playerName: "Mara<script>",
    phase: "The Eclipse",
    dateSeed: "solara-test-day",
  });
  assert.equal(run.done, true);
  assert.equal(run.deathWave, 12);
  assert.match(run.shareCard, /SOLARA: LAST LIGHT/);
  assert.doesNotMatch(run.shareCard, /<script>|`/);
  assert.match(run.shareCard, /Rite broke/);
});

test("feedback ledger stores capped public-safe aggregate events", () => {
  clearFeedbackLedger();
  recordFeedbackEvent("daily_rite_start<script>", {
    phase: "eclipse<script>",
    pressure: "Emergency",
    modifier: "sunless_edict",
    wave: 999,
    outcome: "<bad>",
    action_id: "daily-start<script>",
    source: "daily-panel<script>",
  });
  for (let index = 0; index < 90; index += 1) {
    recordFeedbackEvent("share_copy", { wave: index, outcome: `copy-${index}` });
  }

  const events = loadFeedbackLedger();
  const summary = summarizeFeedbackLedger(events);
  assert.equal(events.length, 80);
  assert.equal(summary.cap, 80);
  assert.equal(summary.token_cost, 0);
  assert.equal(summary.counts.share_copy, 80);
  assert.equal(summary.attribution.top_source, "unknown");
  assert.equal(summary.attribution.token_cost, 0);
  assert.doesNotMatch(JSON.stringify(summary), /<script>|<bad>|`/);
  assert.equal(summary.next_action.token_cost, 0);
  clearFeedbackLedger();
});

test("feedback digest turns aggregate events into a next action without tokens", () => {
  assert.equal(getFeedbackNextActionDigest({ count: 0, counts: {}, cap: 80 }).id, "start_daily_rite");
  assert.equal(getFeedbackNextActionDigest({ count: 1, counts: { daily_rite_start: 1 }, cap: 80 }).id, "finish_daily_rite");
  assert.equal(getFeedbackNextActionDigest({ count: 2, counts: { daily_rite_start: 1, daily_rite_end: 1 }, cap: 80 }).id, "share_result");
  const deep = getFeedbackNextActionDigest({ count: 3, counts: { daily_rite_start: 1, daily_rite_end: 1, share_copy: 1 }, cap: 80 });
  assert.equal(deep.id, "deepen_route");
  assert.equal(deep.token_cost, 0);
  assert.doesNotMatch(JSON.stringify(deep), /<script>|`/);
});

test("public chronicle exports a zero-token feedback summary", () => {
  const chronicle = buildPublicChronicle({
    generatedAt: "2026-06-10T00:00:00.000Z",
    sunState: { brightness: 44, total_deaths: 120 },
    feedbackEvents: [
      { type: "daily_rite_start", phase: "twilight", pressure: "High", modifier: "mirror_graves", wave: 0 },
      { type: "daily_rite_end", phase: "twilight", pressure: "High", modifier: "mirror_graves", wave: 12, outcome: "failed" },
    ],
  });

  assert.equal(chronicle.shared_world.feedback_summary.count, 2);
  assert.equal(chronicle.shared_world.daily_rite_stakes.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_stakes.segment_count, chronicle.shared_world.daily_rite_plan.route.length);
  assert.ok(chronicle.shared_world.daily_rite_stakes.summary.includes("stakes"));
  assert.equal(chronicle.shared_world.feedback_summary.counts.daily_rite_end, 1);
  assert.equal(chronicle.shared_world.feedback_summary.attribution.token_cost, 0);
  assert.equal(chronicle.shared_world.feedback_summary.next_action.id, "share_result");
  assert.equal(chronicle.integrations.feedback_summary.token_cost, 0);
});
