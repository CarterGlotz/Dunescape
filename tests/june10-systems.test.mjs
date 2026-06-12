import test from "node:test";
import assert from "node:assert/strict";
import { buildDailyRiteRoomSequence } from "../src/game/dailyRiteRooms.js";
import { getDailyRiteConsequence } from "../src/game/dailyRiteConsequences.js";
import { completeDailyRiteRun, createDailyRiteRun } from "../src/game/dailyRunSession.js";
import {
  applyDailyRiteMonsterModifier,
  buildDailyRiteModifiers,
  getDailyRiteModifierForWave,
  getDailyRiteSegmentPolicyForWave,
} from "../src/game/dailyRiteModifiers.js";
import { applyDailyRiteSpawnState } from "../src/game/dailyRiteSpawn.js";
import { buildDailyRiteOutcomeDigest, getDailyRiteRoomOutcome } from "../src/game/dailyRiteRoomOutcome.js";
import { applyDailyRiteRoomOutcome, summarizeDailyRiteOutcomeRewards } from "../src/game/dailyRiteRoomRuntime.js";
import { buildDailyRiteRouteChoiceDigest, buildDailyRiteRouteChoicePrompt } from "../src/game/dailyRiteRouteChoices.js";
import { applyDailyRiteRouteCommitment, buildDailyRiteRouteCommitment } from "../src/game/dailyRiteRouteCommitments.js";
import { buildDailyRiteShrineBargain, buildDailyRiteShrineBargainDigest } from "../src/game/dailyRiteShrineBargains.js";
import { getDailyRiteStatusContract } from "../src/game/dailyRiteStatusContract.js";
import { getDailyRitePlan } from "../src/game/directorMechanics.js";
import { FEEDBACK_ACTION_ROUTES, clearFeedbackLedger, getFeedbackNextActionDigest, loadFeedbackLedger, recordFeedbackEvent, summarizeFeedbackLedger } from "../src/game/feedbackLedger.js";
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
  assert.equal(run.modifiers.token_cost, 0);
  assert.equal(run.stakes.segment_count, plan.route.length);
  assert.equal(run.modifiers.segment_count, run.stakes.segment_count);
  assert.equal(run.outcomePolicy.token_cost, 0);
  assert.equal(run.outcomePolicy.segment_count, run.stakes.segment_count);
  assert.equal(run.routeChoices.token_cost, 0);
  assert.equal(run.shrineBargains.token_cost, 0);
  assert.equal(run.routeChoices.prompt_count, run.outcomePolicy.decision_windows.length);
  assert.equal(run.latestOutcome.token_cost, 0);
  assert.equal(run.latestRouteChoice.token_cost, 0);
  assert.ok(run.latestRouteChoice.choices.length >= 2);
  assert.ok(run.stakes.primary_stake.risk >= 1);
  assert.ok(run.modifiers.highest_risk_segment.enemy_scale >= 1);
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

test("Daily Rite stakes produce mechanical modifiers and status contracts", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 8,
    totalDeaths: 5200,
    leaderboard: [{ faction: "eclipser", wave_reached: 20 }],
    echoes: [{ player_name: "Kael", kind: "daily", wave_reached: 18, commend_count: 4 }],
    graves: Array.from({ length: 8 }, (_, index) => ({ x: 12 + index, y: 18, sunstone_offerings: 30, epitaph: "warning" })),
    dayNumber: 91,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 91 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.2 }, daySeed: "mechanical-stakes" });
  const modifiers = buildDailyRiteModifiers({ stakes: run.stakes });
  const active = getDailyRiteModifierForWave({ modifiers, roomWeave: run.roomWeave, wave: 0 });
  const policy = getDailyRiteSegmentPolicyForWave({ modifiers, roomWeave: run.roomWeave, wave: 0 });
  const monster = applyDailyRiteMonsterModifier({ nm: "Goblin", hp: 20, mhp: 20, atk: 3, str: 3, xp: 10 }, active);

  assert.equal(modifiers.token_cost, 0);
  assert.equal(modifiers.policy.token_cost, 0);
  assert.equal(modifiers.policy.segment_count, modifiers.segment_count);
  assert.ok(active.enemy_scale >= 1);
  assert.ok(policy.drop_multiplier >= 1);
  assert.ok(policy.recovery_room_chance > 0);
  assert.match(policy.shrine_bargain, /Shrine|Sunstone|Rival|Preserve/i);
  assert.ok(monster.hp >= 20);
  assert.ok(monster.xp >= 10);
  assert.equal(monster.dailyRiteModifier.id, active.id);

  assert.equal(getDailyRiteStatusContract({ playedDailyToday: false }).state, "idle");
  const activeContract = getDailyRiteStatusContract({ dailyRun: run });
  assert.equal(activeContract.state, "active");
  assert.ok(activeContract.stake_label);
  assert.match(activeContract.modifier_label, /Risk/);
  assert.equal(activeContract.latest_outcome.token_cost, 0);
  assert.equal(activeContract.route_choice.token_cost, 0);
  assert.ok(activeContract.route_choice.choices.length >= 2);
  assert.ok(activeContract.latest_outcome.receipt);
  run.shareCard = "SOLARA: LAST LIGHT";
  completeDailyRiteRun({ run, wave: 30, completed: true, playerName: "Mara", phase: "Dawn", dateSeed: "mechanical-stakes" });
  const completeContract = getDailyRiteStatusContract({ dailyRun: run });
  assert.equal(completeContract.state, "complete");
  assert.ok(completeContract.actions.includes("copy_share"));
});

test("Daily Rite spawn contract applies world, modifier, and economy policy together", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 8,
    totalDeaths: 5200,
    leaderboard: [{ faction: "eclipser", wave_reached: 20 }],
    echoes: [],
    graves: Array.from({ length: 8 }, (_, index) => ({ x: 12 + index, y: 18, sunstone_offerings: 30, epitaph: "warning" })),
    dayNumber: 91,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 91 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.2 }, daySeed: "spawn-policy" });
  const monster = applyDailyRiteSpawnState(
    { nm: "Skeleton", hp: 30, mhp: 30, atk: 4, def: 2, str: 4, xp: 12, drops: [{ i: "coins", c: 0.5, a: [10, 20] }] },
    { snapshot: sharedWorld, run, wave: 0 },
  );

  assert.ok(monster.worldScale >= 1);
  assert.ok(monster.dailyRiteModifier.enemy_scale >= 1);
  assert.ok(monster.dailyRiteModifier.drop_multiplier >= 1);
  assert.ok(monster.dailyRitePolicy.recovery_room_chance > 0);
  assert.ok(monster.drops.find((drop) => drop.i === "coins").a[0] >= 10);
});

test("Daily Rite room outcome policy produces deterministic zero-token clear receipts", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 11,
    totalDeaths: 6100,
    leaderboard: [{ faction: "eclipser", wave_reached: 22 }],
    echoes: [{ player_name: "Rook", kind: "daily", wave_reached: 21, heed_count: 3 }],
    graves: Array.from({ length: 7 }, (_, index) => ({ x: 8 + index, y: 20, sunstone_offerings: 42, epitaph: "hold" })),
    dayNumber: 98,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 98 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.25 }, daySeed: "outcome-policy" });
  const first = getDailyRiteRoomOutcome({ run, wave: 0, roomIndex: run.rooms[0], daySeed: "outcome-policy" });
  const second = getDailyRiteRoomOutcome({ run, wave: 0, roomIndex: run.rooms[0], daySeed: "outcome-policy" });
  const digest = buildDailyRiteOutcomeDigest({ modifiers: run.modifiers, daySeed: "outcome-policy" });

  assert.deepEqual(first, second);
  assert.equal(first.token_cost, 0);
  assert.equal(digest.token_cost, 0);
  assert.equal(digest.segment_count, run.stakes.segment_count);
  assert.equal(digest.decision_windows.length, digest.segment_count);
  assert.ok(digest.decision_windows.every((window) => window.token_cost === 0));
  assert.ok(first.rewards.coins > 0);
  assert.ok(first.receipt.includes("clear"));
  assert.ok(digest.richest_cache.rewards.coins >= first.rewards.coins || digest.samples.length > 1);
  assert.doesNotMatch(JSON.stringify(digest), /<script>|`/);
});

test("Daily Rite route choices turn outcome windows into bounded zero-token prompts", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 9,
    totalDeaths: 7100,
    leaderboard: [{ faction: "sunkeeper", wave_reached: 24 }],
    echoes: [{ player_name: "Sol", kind: "daily", wave_reached: 20, commend_count: 5 }],
    graves: Array.from({ length: 9 }, (_, index) => ({ x: 9 + index, y: 20, sunstone_offerings: 55, epitaph: "hold" })),
    dayNumber: 103,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 103 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.25 }, daySeed: "route-choice" });
  const outcome = getDailyRiteRoomOutcome({ run, wave: 0, roomIndex: run.rooms[0], daySeed: "route-choice" });
  const prompt = buildDailyRiteRouteChoicePrompt({ outcome: { ...outcome, segment_label: "<script>" }, outcomeDigest: run.outcomePolicy });
  const digest = buildDailyRiteRouteChoiceDigest({ outcomeDigest: run.outcomePolicy });

  assert.equal(prompt.token_cost, 0);
  assert.ok(prompt.choices.length >= 2);
  assert.ok(prompt.choices.length <= 3);
  assert.ok(prompt.recommended_choice_id);
  assert.equal(digest.token_cost, 0);
  assert.equal(digest.prompt_count, run.outcomePolicy.decision_windows.length);
  assert.equal(digest.prompts.every((item) => item.token_cost === 0), true);
  assert.doesNotMatch(JSON.stringify({ prompt, digest }), /<script>|`/);
});

test("Daily Rite route choices can be committed as public-safe zero-token run decisions", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 9,
    totalDeaths: 7100,
    leaderboard: [{ faction: "sunkeeper", wave_reached: 24 }],
    echoes: [{ player_name: "Sol", kind: "daily", wave_reached: 20, commend_count: 5 }],
    graves: Array.from({ length: 9 }, (_, index) => ({ x: 9 + index, y: 20, sunstone_offerings: 55, epitaph: "hold" })),
    dayNumber: 103,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 103 });
  const run = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.25 }, daySeed: "route-choice-commitment" });
  const alternate = run.latestRouteChoice.choices[1]?.id || run.latestRouteChoice.recommended_choice_id;
  const commitment = applyDailyRiteRouteCommitment({ run, choiceId: alternate, now: Date.UTC(2026, 5, 12) });
  const fallback = buildDailyRiteRouteCommitment({ prompt: run.latestRouteChoice, choiceId: `${alternate}<script>`, now: Date.UTC(2026, 5, 12) });
  const activeContract = getDailyRiteStatusContract({ dailyRun: run });

  assert.equal(commitment.token_cost, 0);
  assert.equal(commitment.committed, true);
  assert.equal(run.routeChoiceHistory.length, 1);
  assert.equal(run.routeChoiceCommitment.choice.id, alternate);
  assert.equal(commitment.feedback_event.type, "daily_rite_route_choice");
  assert.equal(commitment.feedback_event.token_cost, 0);
  assert.equal(fallback.committed, true);
  assert.equal(fallback.choice.id, run.latestRouteChoice.recommended_choice_id);
  assert.equal(activeContract.route_commitment.token_cost, 0);
  assert.equal(activeContract.route_commitment.choice_id, alternate);
  assert.ok(["survival", "tempo", "long_game", "recovery_window", "cache_window", "shrine_bargain", "tempo_window"].includes(commitment.effect.posture));
  assert.doesNotMatch(JSON.stringify({ commitment, fallback, activeContract }), /<script>|`|\.\.\/bad/);
});

test("Daily Rite route commitments tune the next room outcome deterministically", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 7,
    totalDeaths: 8200,
    leaderboard: [{ faction: "eclipser", wave_reached: 25 }],
    echoes: [{ player_name: "Ash", kind: "daily", wave_reached: 22, heed_count: 4 }],
    graves: Array.from({ length: 9 }, (_, index) => ({ x: 14 + index, y: 22, sunstone_offerings: 65, epitaph: "route" })),
    dayNumber: 109,
  });
  const plan = getDailyRitePlan({ sharedWorld, dayNumber: 109 });
  const baseRun = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.25 }, daySeed: "route-tuning" });
  const tunedRun = createDailyRiteRun({ dailyRitePlan: plan, mechanics: { enemyScale: 1.25 }, daySeed: "route-tuning" });
  const tempoChoice = tunedRun.latestRouteChoice.choices.find((choice) => /tempo|spend|trade|push|fish|oath/.test(choice.id))
    || tunedRun.latestRouteChoice.choices[1]
    || tunedRun.latestRouteChoice.choices[0];

  const baseOutcome = getDailyRiteRoomOutcome({ run: baseRun, wave: 0, roomIndex: baseRun.rooms[0], daySeed: "route-tuning" });
  const commitment = applyDailyRiteRouteCommitment({ run: tunedRun, choiceId: tempoChoice.id, now: Date.UTC(2026, 5, 12) });
  const tunedOutcome = getDailyRiteRoomOutcome({ run: tunedRun, wave: commitment.wave, roomIndex: tunedRun.rooms[commitment.wave], daySeed: "route-tuning" });
  const activeContract = getDailyRiteStatusContract({ dailyRun: { ...tunedRun, latestOutcome: tunedOutcome } });

  assert.equal(commitment.token_cost, 0);
  assert.equal(tunedOutcome.token_cost, 0);
  assert.equal(tunedOutcome.route_choice_adjustment.token_cost, 0);
  assert.equal(tunedOutcome.route_choice_adjustment.choice_id, tempoChoice.id);
  assert.ok(tunedOutcome.rewards.coins !== baseOutcome.rewards.coins || tunedOutcome.recovery_room_chance !== baseOutcome.recovery_room_chance);
  assert.ok(tunedOutcome.rewards.coins >= 0);
  assert.equal(activeContract.latest_outcome.route_choice_adjustment.token_cost, 0);
  assert.equal(activeContract.latest_outcome.route_choice_adjustment.choice_id, tempoChoice.id);
  assert.doesNotMatch(JSON.stringify({ tunedOutcome, activeContract }), /<script>|`|\.\.\/bad/);
});

test("Daily Rite shrine bargains turn committed Sunstone choices into bounded receipts", () => {
  const prompt = buildDailyRiteRouteChoicePrompt({
    outcome: {
      wave: 6,
      segment_id: "shrine<script>",
      segment_label: "Cinder Shrine<script>",
      reward_bias: "sunstone",
      next_action: "Choose before the route cools.",
      rewards: {
        coins: 36,
        heal: 0,
        prayer: 0,
        items: [{ id: "sunstone_shard", count: 1, label: "Sunstone Shard" }],
      },
    },
    outcomeDigest: {
      decision_windows: [{
        wave: 6,
        segment_id: "shrine<script>",
        segment_label: "Cinder Shrine<script>",
        kind: "shrine_bargain",
        next_action: "Save, spend, or swear on the shard.",
      }],
    },
  });
  const run = {
    wave: 6,
    latestRouteChoice: prompt,
    rooms: [0],
    modifiers: {
      policy: {
        segments: [{
          id: "shrine_script",
          label: "Cinder Shrine",
          risk: 4,
          reward_bias: "sunstone",
          drop_multiplier: 1.2,
          recovery_room_chance: 0.05,
          recovery_pressure: "scarce",
          shrine_bargain: "Sunstone bargain opened.",
        }],
      },
    },
    roomWeave: { segmentByWave: Array.from({ length: 30 }, () => ({ id: "shrine_script" })) },
  };
  const banked = applyDailyRiteRouteCommitment({ run, choiceId: "bank_shard", now: Date.UTC(2026, 5, 12) });
  const outcome = getDailyRiteRoomOutcome({ run, wave: 6, roomIndex: 0, daySeed: "shrine-bargain" });
  const contract = getDailyRiteStatusContract({ dailyRun: { ...run, latestOutcome: outcome } });
  const manual = buildDailyRiteShrineBargain({ commitment: banked, outcome });

  assert.equal(banked.kind, "shrine_bargain");
  assert.equal(manual.token_cost, 0);
  assert.equal(outcome.shrine_bargain.token_cost, 0);
  assert.equal(outcome.shrine_bargain.posture, "banked");
  assert.equal(outcome.shrine_bargain.shard_delta, 1);
  assert.equal(outcome.shrine_bargain.economy.item_delta, 1);
  assert.equal(outcome.shrine_bargain.economy.offering_credit, 1);
  assert.equal(outcome.shrine_bargain.offering_intent.token_cost, 0);
  assert.equal(outcome.shrine_bargain.offering_intent.target.tab, "map");
  assert.equal(outcome.rewards.items.filter((item) => item.id === "sunstone_shard").length, 1);
  assert.equal(contract.latest_outcome.shrine_bargain.choice_id, "bank_shard");
  assert.equal(contract.latest_outcome.shrine_bargain.token_cost, 0);
  assert.equal(contract.latest_outcome.shrine_bargain.economy.token_cost, 0);
  assert.equal(contract.latest_outcome.shrine_bargain.offering_intent.token_cost, 0);
  assert.match(contract.latest_outcome.shrine_bargain.offering_intent.next_action, /Living Map/i);
  assert.match(contract.latest_outcome.shrine_bargain.economy.summary, /banked/i);
  assert.doesNotMatch(JSON.stringify({ outcome, contract }), /<script>|`|\.\.\/bad/);

  run.latestRouteChoice = prompt;
  const spent = applyDailyRiteRouteCommitment({ run, choiceId: "spend_shard", now: Date.UTC(2026, 5, 12) });
  const spentOutcome = getDailyRiteRoomOutcome({ run, wave: 6, roomIndex: 0, daySeed: "shrine-bargain" });
  assert.equal(spent.choice.id, "spend_shard");
  assert.equal(spentOutcome.shrine_bargain.posture, "spent");
  assert.equal(spentOutcome.shrine_bargain.economy.item_delta, 0);
  assert.equal(spentOutcome.shrine_bargain.offering_intent, undefined);
  assert.equal(spentOutcome.rewards.items.some((item) => item.id === "sunstone_shard"), false);
  assert.ok(spentOutcome.rewards.heal >= outcome.rewards.heal);

  run.latestRouteChoice = prompt;
  const oath = applyDailyRiteRouteCommitment({ run, choiceId: "press_oath", now: Date.UTC(2026, 5, 12) });
  const oathOutcome = getDailyRiteRoomOutcome({ run, wave: 6, roomIndex: 0, daySeed: "shrine-bargain" });
  assert.equal(oath.choice.id, "press_oath");
  assert.equal(oathOutcome.shrine_bargain.posture, "oath");
  assert.equal(oathOutcome.shrine_bargain.economy.oath_charge, 2);
  assert.equal(oathOutcome.shrine_bargain.offering_intent, undefined);
  assert.equal(oathOutcome.rewards.items.some((item) => item.id === "sunstone_shard"), false);
  assert.ok(oathOutcome.rewards.coins >= outcome.rewards.coins);
});

test("Daily Rite room runtime applies bounded public-safe rewards", () => {
  const player = {
    hp: 9,
    mhp: 12,
    prayer: 1,
    maxPrayer: 4,
  };
  const outcome = {
    wave: 3,
    segment_id: "route<script>",
    reward_bias: "sunstone",
    receipt: "Safe clear <script>",
    next_action: "Bank the shard `now`.",
    rewards: {
      coins: 12000,
      heal: 999,
      prayer: 999,
      items: [
        { id: "sunstone_shard", count: 2, label: "Sunstone Shard" },
        { id: "../bad", count: 99, label: "<bad>" },
      ],
    },
  };
  const summary = summarizeDailyRiteOutcomeRewards(outcome);
  const applied = applyDailyRiteRoomOutcome({ player, outcome });

  assert.equal(summary.token_cost, 0);
  assert.equal(summary.coins, 9999);
  assert.equal(player.hp, 12);
  assert.equal(player.prayer, 4);
  assert.equal(applied.heal_applied, 3);
  assert.equal(applied.prayer_applied, 3);
  assert.equal(applied.coin_grant, 9999);
  assert.deepEqual(applied.item_grants, [{ id: "sunstone_shard", count: 2, label: "Sunstone Shard" }]);
  assert.equal(applied.feedback_event.type, "daily_rite_room_clear");
  assert.equal(applied.token_cost, 0);
  assert.doesNotMatch(JSON.stringify(applied), /<script>|`|\.\.\/bad/);
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
  for (const id of Object.keys(FEEDBACK_ACTION_ROUTES)) {
    const digest = getFeedbackNextActionDigest({
      count: id === "ledger_cap_reached" ? 80 : 1,
      cap: id === "ledger_cap_reached" ? 80 : 80,
      counts: id === "finish_daily_rite"
        ? { daily_rite_start: 1 }
        : id === "share_result"
          ? { daily_rite_start: 1, daily_rite_end: 1 }
          : id === "review_import_repairs"
            ? { save_import_repaired: 1 }
            : id === "deepen_route"
              ? { daily_rite_start: 1, daily_rite_end: 1, share_copy: 1 }
              : {},
    });
    assert.ok(digest.route_target?.tab || digest.route_target?.type, id);
    assert.equal(digest.token_cost, 0);
  }
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
  assert.equal(chronicle.shared_world.daily_rite_modifiers.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_policy.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_outcomes.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_route_choices.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_shrine_bargains.token_cost, 0);
  assert.ok(chronicle.shared_world.daily_rite_outcomes.decision_windows.length >= 1);
  assert.equal(chronicle.shared_world.daily_rite_route_choices.prompt_count, chronicle.shared_world.daily_rite_outcomes.decision_windows.length);
  assert.equal(chronicle.shared_world.daily_rite_outcomes.decision_windows[0].token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_route_choices.token_cost, 0);
  assert.equal(chronicle.integrations.daily_rite_route_choices.token_cost, 0);
  assert.equal(chronicle.integrations.daily_rite_shrine_bargains.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_stakes.segment_count, chronicle.shared_world.daily_rite_plan.route.length);
  assert.equal(chronicle.shared_world.daily_rite_modifiers.segment_count, chronicle.shared_world.daily_rite_stakes.segment_count);
  assert.equal(chronicle.shared_world.daily_rite_policy.segment_count, chronicle.shared_world.daily_rite_stakes.segment_count);
  assert.ok(chronicle.integrations.daily_rite_modifiers.highest_risk_segment.enemy_scale >= 1);
  assert.ok(chronicle.integrations.daily_rite_policy.strongest_reward_segment.drop_multiplier >= 1);
  assert.ok(chronicle.integrations.daily_rite_outcomes.richest_cache.rewards.coins > 0);
  assert.equal(chronicle.integrations.daily_rite_route_choices.token_cost, 0);
  assert.deepEqual(
    chronicle.shared_world.daily_rite_shrine_bargains,
    buildDailyRiteShrineBargainDigest({ routeChoiceDigest: chronicle.shared_world.daily_rite_route_choices }),
  );
  assert.equal(chronicle.shared_world.daily_rite_shrine_bargains.bargains[0]?.economy_preview?.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_shrine_bargains.bargains[0]?.offering_intent_preview?.token_cost, 0);
  assert.equal(chronicle.shared_world.daily_rite_shrine_bargains.bargains[0]?.offering_intent_preview?.target?.tab, "map");
  assert.doesNotMatch(JSON.stringify(chronicle.integrations.daily_rite_policy), /<script>|`/);
  assert.ok(chronicle.shared_world.daily_rite_stakes.summary.includes("stakes"));
  assert.equal(chronicle.shared_world.feedback_summary.counts.daily_rite_end, 1);
  assert.equal(chronicle.shared_world.feedback_summary.attribution.token_cost, 0);
  assert.equal(chronicle.shared_world.feedback_summary.next_action.id, "share_result");
  assert.equal(chronicle.integrations.feedback_summary.token_cost, 0);
});
