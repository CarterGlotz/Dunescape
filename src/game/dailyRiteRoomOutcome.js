import { getDailyRiteSegmentPolicyForWave } from "./dailyRiteModifiers.js";
import { applyShrineBargainToOutcome, buildDailyRiteShrineBargain } from "./dailyRiteShrineBargains.js";

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

function buildRouteChoiceAdjustment(commitment = null, { wave = 0, segmentId = null } = {}) {
  if (!commitment?.committed) return null;
  const safeWave = Math.max(0, Math.min(29, Math.floor(Number(wave) || 0)));
  const commitmentWave = Math.max(0, Math.min(30, Math.floor(Number(commitment.wave || 0))));
  const committedSegment = clean(commitment.segment_id, "").slice(0, 48);
  const activeSegment = clean(segmentId, "").slice(0, 48);
  const appliesToWave = Math.abs(commitmentWave - safeWave) <= 1;
  const appliesToSegment = !!committedSegment && !!activeSegment && committedSegment === activeSegment && Math.abs(commitmentWave - safeWave) <= 2;
  if (!appliesToWave && !appliesToSegment) return null;

  const posture = clean(commitment.effect?.posture, "balanced").slice(0, 32);
  const riskDelta = Math.max(-2, Math.min(2, Math.floor(Number(commitment.effect?.risk_delta || 0))));
  const rewardDelta = Math.max(-1, Math.min(3, Math.floor(Number(commitment.effect?.reward_delta || 0))));
  const recoveryDelta = posture === "survival" ? 0.14 : posture === "tempo" ? -0.06 : posture === "long_game" ? -0.03 : 0;
  return {
    version: 1,
    token_cost: 0,
    applied: true,
    wave: safeWave,
    segment_id: activeSegment || committedSegment || null,
    choice_id: clean(commitment.choice?.id, "choice").slice(0, 48),
    choice_label: clean(commitment.choice?.label, "Route choice").slice(0, 64),
    posture,
    risk_delta: riskDelta,
    reward_delta: rewardDelta,
    recovery_delta: recoveryDelta,
    next_room_bias: clean(commitment.effect?.next_room_bias, "balanced route pressure").slice(0, 100),
  };
}

function outcomeForPolicy(policy = {}, { wave = 0, daySeed = "solara-day", roomIndex = 0, commitment = null } = {}) {
  const safeWave = Math.max(0, Math.min(29, Math.floor(Number(wave) || 0)));
  const adjustment = buildRouteChoiceAdjustment(commitment, { wave: safeWave, segmentId: policy.id });
  const risk = clampNumber(Number(policy.risk || 1) + Number(adjustment?.risk_delta || 0), 1, 5, 1);
  const rewardBias = clean(policy.reward_bias, "xp");
  const dropMultiplier = clampNumber(Number(policy.drop_multiplier || 1) + Number(adjustment?.reward_delta || 0) * 0.12, 1, 1.9, 1);
  const recoveryChance = clampNumber(Number(policy.recovery_room_chance || 0) + Number(adjustment?.recovery_delta || 0), 0, 1, 0);
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
    rewardBias === "sunstone" || (risk >= 4 && shrineRoll < 0.18 + Math.max(0, Number(adjustment?.reward_delta || 0)) * 0.03)
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
    shrine_bargain: null,
    shrine_bargain_hint: clean(policy.shrine_bargain, "Shrine bargains remain open if you keep tempo clean."),
    rewards: {
      coins,
      heal,
      prayer,
      items: sunstone ? [{ id: "sunstone_shard", count: sunstone, label: "Sunstone Shard" }] : [],
    },
    route_choice_adjustment: adjustment,
    receipt: `${clean(policy.label, "Daily Rite")} clear: ${cacheLabel} paid ${coins} coins${heal ? `, restored ${heal} HP` : ""}${prayer ? ` and ${prayer} Prayer` : ""}${sunstone ? ", and exposed a Sunstone Shard" : ""}${adjustment ? ` after ${adjustment.choice_label}` : ""}.`,
    next_action: recoveryHit
      ? adjustment
        ? `${adjustment.next_room_bias}; use the recovery window before the next pressure spike.`
        : "Use the recovery window before the next pressure spike."
      : adjustment
        ? `${adjustment.next_room_bias}; preserve the route result.`
        : risk >= 4
        ? "Preserve food; this segment is starving recovery."
        : "Keep tempo clean and bank the route pressure.",
  };
  const shrineCommitment = rewardBias === "sunstone" && adjustment?.choice_id
    ? {
      committed: true,
      wave: safeWave,
      segment_id: policy.id,
      kind: "shrine_bargain",
      headline: "Shrine bargain opened",
      choice: {
        id: adjustment.choice_id,
        label: adjustment.choice_label,
      },
    }
    : commitment;
  const shrineBargain = buildDailyRiteShrineBargain({ commitment: shrineCommitment, outcome: baseOutcome });
  return applyShrineBargainToOutcome(baseOutcome, shrineBargain);
}

function buildDecisionWindows(samples = []) {
  return samples.map((item, index) => {
    const rewardItems = Array.isArray(item.rewards?.items) ? item.rewards.items : [];
    const kind = rewardItems.some((reward) => reward.id === "sunstone_shard")
      ? "shrine_bargain"
      : item.rewards?.heal > 0 || item.rewards?.prayer > 0
        ? "recovery_window"
        : item.rewards?.coins >= 40
          ? "cache_window"
          : "tempo_window";
    const action =
      kind === "shrine_bargain"
        ? "Save a Sunstone Shard or route this segment toward shrine progress."
        : kind === "recovery_window"
          ? "Spend food before this clear, then use the receipt to reset tempo."
          : kind === "cache_window"
            ? "Push this segment if you need coin to stabilize the run."
            : "Preserve supplies and keep the route clock clean.";
    return {
      version: 1,
      token_cost: 0,
      id: `${kind}_${index + 1}`,
      kind,
      wave: item.wave,
      segment_id: item.segment_id,
      segment_label: clean(item.segment_label, `Segment ${index + 1}`),
      reward_bias: item.reward_bias,
      reward_line: clean(item.receipt, "Daily Rite clear recorded."),
      next_action: action,
    };
  });
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
      shrine_bargain: null,
      shrine_bargain_hint: "Daily Rite policy is waiting for today's route.",
      rewards: { coins: 0, heal: 0, prayer: 0, items: [] },
      receipt: "Daily Rite clear recorded without an active segment policy.",
      next_action: "Build today's route policy before applying room outcomes.",
    };
  }
  const outcome = outcomeForPolicy(policy, {
    wave: safeWave,
    daySeed,
    roomIndex: roomIndex ?? run?.rooms?.[safeWave] ?? 0,
    commitment: run?.routeChoiceCommitment,
  });
  const explicitBargain = buildDailyRiteShrineBargain({ commitment: run?.routeChoiceCommitment, outcome });
  return applyShrineBargainToOutcome(outcome, explicitBargain);
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
    decision_windows: buildDecisionWindows(samples),
    samples,
    summary: richestCache
      ? `${richestCache.segment_label} carries the richest room cache; ${strongestRecovery?.segment_label || richestCache.segment_label} is the safest recovery window.`
      : "Daily Rite room outcomes are waiting for today's segment policy.",
  };
}
