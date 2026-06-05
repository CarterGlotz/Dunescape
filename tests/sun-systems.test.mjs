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

const { getSunAlmanac, getPhaseDriftWatch } = await import("../src/game/almanac.js");
const { buildChronicleScenes } = await import("../src/game/chronicleScenes.js");
const { getVowOffers, evaluateVow, applyVowToEpitaph, getVowLegacyValue } = await import("../src/game/vows.js");
const { getDirectorMemoryBias, applyDirectorMemoryToMechanics, recordDirectorRunMemory, loadDirectorMemoryRuns } = await import(
  "../src/game/directorMemory.js"
);
const { encodeChallengeToken, decodeChallengeToken, getChallengeBanner, compareChallengeResult, buildChallengeUrl } = await import(
  "../src/game/challengeLinks.js"
);
const { enqueueSundialWrite, loadSundialQueue, clearSundialQueue, flushSundialQueue, getSundialQueueSummary } = await import(
  "../src/game/sundialQueue.js"
);
const { getSharedWorldSnapshot } = await import("../src/game/sharedWorld.js");

function buildWorld(overrides = {}) {
  return getSharedWorldSnapshot({
    sunBrightness: overrides.sunBrightness ?? 62,
    totalDeaths: 420,
    leaderboard: [{ faction: "sunkeeper", wave_reached: 18 }],
    echoes: [],
    graves: [],
    playerName: "Tester",
    dayNumber: overrides.dayNumber ?? 12,
  });
}

test("sun almanac forecasts deterministically across seven days", () => {
  const sharedWorld = buildWorld();
  const first = getSunAlmanac({ sharedWorld, dayNumber: 12, sunBrightness: 62 });
  const second = getSunAlmanac({ sharedWorld, dayNumber: 12, sunBrightness: 62 });

  assert.equal(first.forecast.length, 7);
  assert.deepEqual(first, second);
  assert.equal(first.forecast[0].label, "Today");
  assert.equal(first.forecast[1].label, "Tomorrow");
  assert.ok(first.forecast.every((entry) => entry.modifier?.label));
  assert.ok(first.forecast.every((entry) => entry.bestFor));
  assert.match(first.determinism, /No generation cost/);
});

test("phase drift watch reports distance to neighboring sun phases", () => {
  const watch = getPhaseDriftWatch(62);
  assert.equal(watch.phase.id, "amber_warning");
  assert.equal(watch.darker.id, "twilight");
  assert.equal(watch.darker.lightAway, 2);
  assert.match(watch.watchLine, /2 light/);

  const safe = getPhaseDriftWatch(95);
  assert.equal(safe.phase.id, "full_dawn");
  assert.equal(safe.brighter, null);
});

test("chronicle scenes compose deterministic identity-safe vignettes", () => {
  const sharedWorld = buildWorld({ sunBrightness: 30 });
  const scenes = buildChronicleScenes({ sharedWorld, dayNumber: 12, graveCount: 9, echoCount: 4 });
  const repeat = buildChronicleScenes({ sharedWorld, dayNumber: 12, graveCount: 9, echoCount: 4 });

  assert.deepEqual(scenes, repeat);
  assert.equal(scenes.title, "The Myth So Far");
  assert.ok(scenes.scenes.length >= 3 && scenes.scenes.length <= 5);
  scenes.scenes.forEach((line) => {
    assert.ok(!/[<>`]/.test(line), `scene contains unsafe characters: ${line}`);
  });
});

test("vow offers are seeded and evaluation applies legacy math", () => {
  const offers = getVowOffers({ dateSeed: "solara-2026-6-4", dayNumber: 12 });
  const repeat = getVowOffers({ dateSeed: "solara-2026-6-4", dayNumber: 12 });
  assert.deepEqual(offers, repeat);
  assert.equal(offers.length, 2);
  assert.notEqual(offers[0].id, offers[1].id);

  const kept = evaluateVow("dawnbreaker", { wave: 14, completed: false });
  assert.equal(kept.kept, true);
  assert.equal(kept.legacyMultiplier, 1.2);
  assert.match(kept.debriefLine, /Vow kept/);

  const broken = evaluateVow("deep_route", { wave: 9, completed: false });
  assert.equal(broken.kept, false);
  assert.equal(broken.legacyMultiplier, 0.9);

  const timed = evaluateVow("swift_flame", { wave: 12, durationMs: 6 * 60 * 1000 });
  assert.equal(timed.kept, false);

  assert.equal(getVowLegacyValue(40, kept), 48);
  assert.equal(getVowLegacyValue(40, broken), 36);
  const epitaph = applyVowToEpitaph("They burned bright.", kept);
  assert.ok(epitaph.includes("Dawnbreaker") || epitaph.includes("dawn"));
  assert.ok(epitaph.length <= 80);
});

test("director memory bias stays bounded and adjusts mechanics", () => {
  const empty = getDirectorMemoryBias([]);
  assert.equal(empty.mood, "unwritten");
  assert.equal(empty.enemyScaleDelta, 0);

  const merciful = getDirectorMemoryBias([
    { mode: "daily", wave: 4, completed: false, dateSeed: "a" },
    { mode: "daily", wave: 7, completed: false, dateSeed: "b" },
    { mode: "daily", wave: 22, completed: false, dateSeed: "c" },
  ]);
  assert.equal(merciful.mood, "merciful");
  assert.equal(merciful.enemyScaleDelta, -0.05);

  const testing = getDirectorMemoryBias([
    { mode: "daily", wave: 30, completed: true, dateSeed: "a" },
    { mode: "daily", wave: 30, completed: true, dateSeed: "b" },
  ]);
  assert.equal(testing.mood, "testing");

  const mechanics = applyDirectorMemoryToMechanics({ enemyScale: 1.0, rewardMultiplier: 1.1 }, testing);
  assert.equal(mechanics.enemyScale, 1.06);
  assert.equal(mechanics.rewardMultiplier, 1.14);
  assert.equal(mechanics.memoryMood, "testing");
  assert.ok(mechanics.remembrance.length > 10);
});

test("director memory persists a capped sanitized window", () => {
  memoryStore.delete("solara_director_memory");
  for (let i = 0; i < 8; i += 1) {
    recordDirectorRunMemory({ mode: "daily", wave: i, completed: false, dateSeed: `day-${i}` });
  }
  const runs = loadDirectorMemoryRuns();
  assert.equal(runs.length, 5);
  assert.equal(runs[0].wave, 7);
  assert.equal(runs[0].mode, "daily");
});

test("challenge tokens round-trip, reject tampering, and expire", () => {
  const token = encodeChallengeToken({ dateSeed: "solara-2026-6-4", wave: 21, playerName: "Mara<script>", vowId: "deep_route" });
  assert.ok(token);
  assert.ok(!token.includes("="));

  const decoded = decodeChallengeToken(token, { todaySeed: "solara-2026-6-4" });
  assert.equal(decoded.valid, true);
  assert.equal(decoded.challenge.wave, 21);
  assert.equal(decoded.challenge.playerName, "Marascript");
  assert.equal(decoded.challenge.vowId, "deep_route");

  const tampered = decodeChallengeToken(token.slice(0, -2) + "zz", { todaySeed: "solara-2026-6-4" });
  assert.equal(tampered.valid, false);

  const expired = decodeChallengeToken(token, { todaySeed: "solara-2026-6-5" });
  assert.equal(expired.valid, false);
  assert.equal(expired.reason, "expired");

  const banner = getChallengeBanner(decoded.challenge);
  assert.match(banner.detail, /Wave 21/);
  const result = compareChallengeResult(decoded.challenge, { wave: 25 });
  assert.equal(result.beaten, true);
  assert.match(result.line, /outshone/);
  const url = buildChallengeUrl({ baseUrl: "https://example.com/solara/?old=1#frag", token });
  assert.equal(url, `https://example.com/solara/?challenge=${token}`);
});

test("sundial queue sanitizes, dedupes, caps, and flushes through services", async () => {
  clearSundialQueue();

  const graveResult = enqueueSundialWrite({
    kind: "grave",
    payload: { player_name: "Tester", epitaph: "fell<deep>", x: 12, y: 14, wave_reached: 9, faction: "sunkeeper", traveler_sigil: "SIG-1" },
    dateSeed: "solara-2026-6-4",
    season: 1,
    id: "grave-1",
  });
  assert.equal(graveResult.queued, true);
  assert.match(graveResult.receipt, /Sundial Queue/);

  const duplicate = enqueueSundialWrite({
    kind: "grave",
    payload: { player_name: "Tester", epitaph: "again", x: 1, y: 2, wave_reached: 3, faction: "sunkeeper" },
    dateSeed: "solara-2026-6-4",
    season: 1,
    id: "grave-1",
  });
  assert.equal(duplicate.queued, false);
  assert.equal(duplicate.reason, "duplicate");

  enqueueSundialWrite({
    kind: "daily_score",
    payload: { player_name: "Tester", wave_reached: 17, faction: "sunkeeper" },
    dateSeed: "solara-2026-6-4",
    season: 1,
  });
  const localReaction = enqueueSundialWrite({ kind: "reaction", payload: { echoId: "echo-local-1", reaction: "commend" } });
  assert.equal(localReaction.queued, false);

  const queue = loadSundialQueue();
  assert.equal(queue.length, 2);
  assert.ok(!queue[0].payload.epitaph.includes("<"));
  assert.match(getSundialQueueSummary(queue).line, /2 sealed records/);

  const synced = [];
  const flush = await flushSundialQueue({
    supabase: {},
    services: {
      submitGraveRecord: async ({ grave }) => {
        synced.push(`grave:${grave.player_name}`);
        return true;
      },
      submitDailyScoreRecord: async ({ playerName }) => {
        synced.push(`score:${playerName}`);
        return true;
      },
    },
  });
  assert.equal(flush.flushed, 2);
  assert.equal(flush.remaining, 0);
  assert.deepEqual(synced, ["grave:Tester", "score:Tester"]);
  assert.equal(loadSundialQueue().length, 0);
});

test("sundial queue keeps failed writes for the next flush", async () => {
  clearSundialQueue();
  enqueueSundialWrite({
    kind: "daily_score",
    payload: { player_name: "Tester", wave_reached: 11, faction: "neutral" },
    dateSeed: "solara-2026-6-4",
    season: 1,
  });
  const flush = await flushSundialQueue({
    supabase: {},
    services: {
      submitDailyScoreRecord: async () => false,
    },
  });
  assert.equal(flush.flushed, 0);
  assert.equal(flush.remaining, 1);
  assert.equal(loadSundialQueue().length, 1);
  clearSundialQueue();
});
