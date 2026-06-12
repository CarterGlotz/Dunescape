import { getDailyRiteSegmentPolicyForWave } from "./dailyRiteModifiers.js";

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function hashText(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function seededChance(seed) {
  return (hashText(seed) % 1000) / 1000;
}

function outcomeForPolicy(policy = {}, { wave = 0, daySeed = "solara-day", roomIndex = 0 } = {}) {
  const safeWave = Math.max(0, Math.min(29, Math.floor(Number(wave) || 0)));
  const risk = clampNumber(policy.risk, 1, 5, 1);
  const rewardBias = clean(policy.reward_bias, "xp");
  const dropMultiplier = clampNumber(policy.drop_multiplier, 1, 1.6, 1);
  const recoveryChance = clampNumber(policy.recovery_room_chance, 0, 1, 0);
  const seed = `${daySeed}:${policy.id || "segment"}:${safeWave}:${roomIndex}:${rewardBias}`;
  const cacheRoll = seededChance(`${seed}:cache`);
  const recoveryRoll = seededChance(`${seed}:recovery`);
  const shrineRoll = seededChance(`${seed}:shrine`);
  const recoveryHit = recoveryRoll <= recoveryChance || roomIndex === 0;
  const cacheBase = rewardBias === "coins" ? 26 : rewardBias === "relic" ? 18 : 12;
  const coins = Math.round((cacheBase + risk * 6 + (safeWave + 1)) * dropMultiplier * (cacheRoll > 0.72 ? 1.35 : 1));
  const heal = recoveryHit ? Math.max(2, Math.round(3 + risk + recoveryChance * 12)) : 0;
  const prayer = recoveryHit && risk >= 3 ? Math.max(1, Math.round(1 + risk / 2)) : 0;
  const sunstone =
    rewardBias === "sunstone" || (risk >= 4 && shrineRoll < 0.18)
      ? 1
      : 0;
  const cacheLabel =
    rewardBias === "coins"
      ? "coin cache"
      : rewardBias === "sunstone"
        ? "sunstone bargain"
        : rewardBias === "rival"
          ? "rival spoil"
          : rewardBias === "relic"
            ? "relic ash"
            : "light cache";

  return {
    version: 1,
    token_cost: 0,
    wave: safeWave,
    segment_id: policy.id || null,
    segment_label: clean(policy.label, `Wave ${safeWave + 1}`),
    reward_bias: rewardBias,
    recovery_pressure: clean(policy.recovery_pressure, "open"),
    recovery_room_chance: recoveryChance,
    shrine_bargain: clean(policy.shrine_bargain, "Shrine bargains remain open if you keep tempo clean."),
    rewards: {
      coins,
      heal,
      prayer,
      items: sunstone ? [{ id: "sunstone_shard", count: sunstone, label: "Sunstone Shard" }] : [],
    },
    receipt: `${clean(policy.label, "Daily Rite")} clear: ${cacheLabel} paid ${coins} coins${heal ? `, restored ${heal} HP` : ""}${prayer ? ` and ${prayer} Prayer` : ""}${sunstone ? ", and exposed a Sunstone Shard" : ""}.`,
    next_action: recoveryHit
      ? "Use the recovery window before the next pressure spike."
      : risk >= 4
        ? "Preserve food; this segment is starving recovery."
        : "Keep tempo clean and bank the route pressure.",
  };
}

export function getDailyRiteRoomOutcome({ run = null, wave = null, roomIndex = null, daySeed = "solara-day" } = {}) {
  const safeWave = Math.max(0, Math.min(29, Math.floor(Number(wave ?? run?.wave ?? 0) || 0)));
  const policy = getDailyRiteSegmentPolicyForWave({
    modifiers: run?.modifiers,
    roomWeave: run?.roomWeave,
    wave: safeWave,
  });
  if (!policy) {
    return {
      version: 1,
      token_cost: 0,
      wave: safeWave,
      segment_id: null,
      segment_label: `Wave ${safeWave + 1}`,
      reward_bias: "unknown",
      recovery_pressure: "unknown",
      recovery_room_chance: 0,
      shrine_bargain: "Daily Rite policy is waiting for today's route.",
      rewards: { coins: 0, heal: 0, prayer: 0, items: [] },
      receipt: "Daily Rite clear recorded without an active segment policy.",
      next_action: "Build today's route policy before applying room outcomes.",
    };
  }
  return outcomeForPolicy(policy, {
    wave: safeWave,
    daySeed,
    roomIndex: roomIndex ?? run?.rooms?.[safeWave] ?? 0,
  });
}

export function buildDailyRiteOutcomeDigest({ modifiers = null, daySeed = "solara-day" } = {}) {
  const policies = Array.isArray(modifiers?.policy?.segments) ? modifiers.policy.segments : [];
  const samples = policies.map((policy, index) => outcomeForPolicy(policy, {
    wave: index * 5,
    daySeed,
    roomIndex: index % 4,
  }));
  const strongestRecovery = samples.reduce((best, item) => item.rewards.heal > (best?.rewards?.heal || 0) ? item : best, null);
  const richestCache = samples.reduce((best, item) => item.rewards.coins > (best?.rewards?.coins || 0) ? item : best, null);
  const shrineBargain = samples.find((item) => item.rewards.items.some((reward) => reward.id === "sunstone_shard")) || null;
  return {
    version: 1,
    token_cost: 0,
    segment_count: samples.length,
    strongest_recovery: strongestRecovery,
    richest_cache: richestCache,
    shrine_bargain: shrineBargain,
    samples,
    summary: richestCache
      ? `${richestCache.segment_label} carries the richest room cache; ${strongestRecovery?.segment_label || richestCache.segment_label} is the safest recovery window.`
      : "Daily Rite room outcomes are waiting for today's segment policy.",
  };
}
