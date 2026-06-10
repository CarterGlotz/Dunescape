import test from "node:test";
import assert from "node:assert/strict";

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

const { getBackendContractSummary, getMissingQueueContracts, SHARED_WORLD_RPC_CONTRACTS } = await import("../src/game/backendContract.js");
const { buildOutcomeReceiptSet } = await import("../src/game/outcomeReceipts.js");
const { getRitePacingCoach } = await import("../src/game/riteCoach.js");
const { buildLastLightResultCard } = await import("../src/game/resultCard.js");
const { getSharedWorldSnapshot } = await import("../src/game/sharedWorld.js");
const { buildWorldFeed } = await import("../src/game/worldFeed.js");
const {
  QUEUE_KINDS,
  clearSundialQueue,
  enqueueSundialWrite,
  getSundialQueueBriefing,
} = await import("../src/game/sundialQueue.js");

test("backend contract manifest covers every queued write kind", () => {
  const summary = getBackendContractSummary();
  assert.equal(summary.hardening_gate, "PG_CONNECTION_SOLARA");
  assert.equal(getMissingQueueContracts(QUEUE_KINDS).length, 0);
  assert.deepEqual(
    new Set(summary.required_rpcs.map((rpc) => rpc.kind)),
    new Set(QUEUE_KINDS),
  );
  assert.ok(SHARED_WORLD_RPC_CONTRACTS.every((contract) => contract.expectedExistingMessage instanceof RegExp));
});

test("sundial queue briefing groups pending records without unsafe text", () => {
  clearSundialQueue();
  enqueueSundialWrite({
    kind: "grave",
    payload: { player_name: "<bad>", epitaph: "<script>", x: 1, y: 2, wave_reached: 8 },
    dateSeed: "solara-2026-6-7",
    season: 1,
    queuedAt: "2026-06-07T17:00:00.000Z",
  });
  enqueueSundialWrite({
    kind: "daily_score",
    payload: { player_name: "Sol", wave_reached: 12, faction: "sunkeeper" },
    dateSeed: "solara-2026-6-7",
    season: 1,
    queuedAt: "2026-06-07T17:30:00.000Z",
  });

  const briefing = getSundialQueueBriefing(null, { now: Date.parse("2026-06-07T18:00:00.000Z") });
  assert.equal(briefing.size, 2);
  assert.equal(briefing.groups.length, 2);
  assert.equal(briefing.oldest_minutes, 60);
  assert.match(briefing.line, /graves/);
  assert.doesNotMatch(JSON.stringify(briefing), /<script>|PG_CONNECTION_SOLARA=/);
  clearSundialQueue();
});

test("rite pacing coach reacts to route danger, vow, and challenge pressure", () => {
  const coach = getRitePacingCoach({
    dailyRitePlan: {
      route: [
        { id: "s1", label: "Waves 1-5", waveStart: 1, waveEnd: 5, danger: "low", goal: "Scout the shrine route." },
        { id: "s2", label: "Waves 6-10", waveStart: 6, waveEnd: 10, danger: "high", goal: "Prepare for an elite pack." },
      ],
      boss: { brief: "Hold one burst for the boss wave." },
    },
    wave: 7,
    vow: { title: "Dawnbreaker" },
    challenge: { playerName: "Mara", wave: 9 },
  });

  assert.equal(coach.segment_id, "s2");
  assert.equal(coach.stance, "push");
  assert.match(coach.detail, /Dawnbreaker/);
  assert.match(coach.detail, /Mara/);
});

test("last light result card is stable, compact, and sanitized", () => {
  const card = buildLastLightResultCard({
    playerName: "Mara<script>",
    wave: 31,
    phase: "The Eclipse",
    vowResult: { kept: true, title: "Dawnbreaker" },
    challengeResult: { line: "You outshone Sol." },
    mythLine: "<b>The ash road brightened.</b>",
    dateSeed: "solara-2026-6-7",
  });

  assert.match(card, /SOLARA: LAST LIGHT/);
  assert.match(card, /CLEAR/);
  assert.match(card, /Dawnbreaker/);
  assert.doesNotMatch(card, /<script>|<b>|`/);
});

test("outcome receipts include pending queue state with zero token cost", () => {
  const sharedWorld = getSharedWorldSnapshot({
    sunBrightness: 20,
    totalDeaths: 100,
    leaderboard: [],
    echoes: [],
    graves: [],
  });
  const worldFeed = buildWorldFeed({ sharedWorld });
  const receipts = buildOutcomeReceiptSet({
    sharedWorld,
    objectiveState: { title: "Open Daily Rites" },
    worldFeed,
    aiPolicy: { browser_token_cost: 0 },
    queueBriefing: { size: 2, line: "2 sealed records await sync." },
  });

  const queueReceipt = receipts.receipts.find((receipt) => receipt.type === "queue_pending");
  assert.ok(queueReceipt);
  assert.equal(queueReceipt.token_cost, 0);
  assert.equal(receipts.receipts.every((receipt) => receipt.token_cost === 0), true);
});
