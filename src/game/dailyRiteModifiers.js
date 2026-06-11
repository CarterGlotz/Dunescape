function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function rewardBiasFor(stake = {}) {
  const text = `${stake.reward || ""} ${stake.goal || ""} ${stake.encounter || ""}`.toLowerCase();
  if (/shrine|offering|ritual|sunstone/.test(text)) return "sunstone";
  if (/rival|echo|challenge/.test(text)) return "rival";
  if (/coin|merchant|cache|tax/.test(text)) return "coins";
  if (/relic|boss|elite|trial/.test(text)) return "relic";
  return "xp";
}

function policyForModifier(modifier = {}) {
  const risk = clampNumber(modifier.risk, 1, 5, 1);
  const rewardBias = clean(modifier.reward_bias, "xp");
  const dropMultiplier = Number((1 + risk * 0.025 + (rewardBias === "coins" ? 0.075 : 0)).toFixed(3));
  const recoveryRoomChance = Number(Math.max(0.08, 0.28 - risk * 0.035 + (rewardBias === "sunstone" ? 0.04 : 0)).toFixed(3));
  const shrineBargain =
    rewardBias === "sunstone"
      ? "Sunstone offerings can convert this pressure into shrine progress."
      : rewardBias === "rival"
        ? "Rival pressure favors echoes over safe shrine bargaining."
        : risk >= 4
          ? "Shrines are costly; preserve supplies before bargaining."
          : "Shrine bargains remain open if you keep tempo clean.";
  return {
    id: modifier.id,
    label: modifier.label,
    risk,
    reward_bias: rewardBias,
    coin_multiplier: clampNumber(modifier.coin_multiplier, 1, 1.35, 1),
    xp_multiplier: clampNumber(modifier.xp_multiplier, 1, 1.35, 1),
    drop_multiplier: dropMultiplier,
    recovery_pressure: clean(modifier.recovery_pressure, "open"),
    recovery_room_chance: recoveryRoomChance,
    shrine_bargain: shrineBargain,
    rule: `${modifier.label || "Route"}: ${rewardBias} rewards x${dropMultiplier}; recovery ${Math.round(recoveryRoomChance * 100)}%.`,
  };
}

export function buildDailyRiteModifiers({ stakes = null } = {}) {
  const segments = Array.isArray(stakes?.segments) ? stakes.segments : [];
  const modifiers = segments.map((stake, index) => {
    const risk = clampNumber(stake?.risk, 1, 5, 1);
    const rewardBias = rewardBiasFor(stake);
    const enemyScale = Number((1 + (risk - 1) * 0.045).toFixed(3));
    const rewardMultiplier = Number((1 + risk * 0.035 + (rewardBias === "relic" ? 0.035 : 0)).toFixed(3));
    const recoveryPressure = risk >= 4 ? "scarce" : risk >= 3 ? "guarded" : "open";
    return {
      id: clean(stake?.id, `segment_${index + 1}`),
      label: clean(stake?.label, `Segment ${index + 1}`),
      risk,
      reward_bias: rewardBias,
      enemy_scale: enemyScale,
      xp_multiplier: rewardBias === "xp" || rewardBias === "relic" ? rewardMultiplier : Number((1 + risk * 0.02).toFixed(3)),
      coin_multiplier: rewardBias === "coins" ? rewardMultiplier : Number((1 + risk * 0.015).toFixed(3)),
      recovery_pressure: recoveryPressure,
      rule: `Risk ${risk}/5: enemies x${enemyScale}, ${rewardBias} payout pressure x${rewardMultiplier}.`,
    };
  });
  const highestRisk = modifiers.reduce((best, item) => item.risk > (best?.risk || 0) ? item : best, null);
  const policy = buildDailyRiteSegmentPolicy({ modifiers });

  return {
    version: 1,
    token_cost: 0,
    segment_count: modifiers.length,
    highest_risk_segment: highestRisk,
    segments: modifiers,
    policy,
    scale_posture: highestRisk
      ? `${highestRisk.label} carries the strongest mechanical pressure at risk ${highestRisk.risk}/5.`
      : "No Daily Rite route modifiers are active until today's route plan is built.",
  };
}

export function buildDailyRiteSegmentPolicy({ modifiers = null } = {}) {
  const segments = Array.isArray(modifiers?.segments) ? modifiers.segments : Array.isArray(modifiers) ? modifiers : [];
  const policies = segments.map(policyForModifier);
  const strongestReward = policies.reduce((best, item) => item.drop_multiplier > (best?.drop_multiplier || 0) ? item : best, null);
  const scarcestRecovery = policies.reduce((best, item) => item.recovery_room_chance < (best?.recovery_room_chance ?? 1) ? item : best, null);
  return {
    version: 1,
    token_cost: 0,
    segment_count: policies.length,
    strongest_reward_segment: strongestReward,
    scarcest_recovery_segment: scarcestRecovery,
    segments: policies,
    summary: strongestReward
      ? `${strongestReward.label} carries the richest ${strongestReward.reward_bias} pressure; ${scarcestRecovery?.label || strongestReward.label} has the tightest recovery window.`
      : "Daily Rite segment policy is waiting for today's route modifiers.",
  };
}

export function getDailyRiteModifierForWave({ modifiers = null, roomWeave = null, wave = 0 } = {}) {
  const index = Math.max(0, Math.min(29, Math.floor(Number(wave) || 0)));
  const segmentId = roomWeave?.segmentByWave?.[index]?.id;
  const list = Array.isArray(modifiers?.segments) ? modifiers.segments : [];
  return list.find((item) => item.id === segmentId) || list[Math.min(list.length - 1, Math.floor(index / 5))] || null;
}

export function getDailyRiteSegmentPolicyForWave({ modifiers = null, roomWeave = null, wave = 0 } = {}) {
  const modifier = getDailyRiteModifierForWave({ modifiers, roomWeave, wave });
  const list = Array.isArray(modifiers?.policy?.segments) ? modifiers.policy.segments : [];
  return list.find((item) => item.id === modifier?.id) || (modifier ? policyForModifier(modifier) : null);
}

function applyDropPolicy(drops = [], modifier = null) {
  if (!Array.isArray(drops) || !modifier) return drops;
  const policy = policyForModifier(modifier);
  const adjusted = drops.map((drop) => {
    const next = { ...drop };
    if (next.i === "coins") {
      next.c = Math.min(1, Number((Number(next.c || 0) * policy.drop_multiplier).toFixed(3)));
      if (Array.isArray(next.a)) {
        next.a = next.a.map((amount) => Math.max(1, Math.round(Number(amount || 1) * policy.coin_multiplier)));
      }
    } else if (modifier.reward_bias === "relic" && next.c < 0.2) {
      next.c = Math.min(1, Number((Number(next.c || 0) * policy.drop_multiplier).toFixed(3)));
    }
    return next;
  });
  if (modifier.reward_bias === "sunstone" && !adjusted.some((drop) => drop.i === "sunstone_shard")) {
    adjusted.push({ i: "sunstone_shard", c: Math.min(0.12, Number((0.025 + policy.risk * 0.01).toFixed(3))) });
  }
  return adjusted;
}

export function applyDailyRiteMonsterModifier(monster, modifier = null) {
  if (!monster || !modifier) return monster;
  const enemyScale = clampNumber(modifier.enemy_scale, 1, 1.35, 1);
  const xpMultiplier = clampNumber(modifier.xp_multiplier, 1, 1.35, 1);
  monster.dailyRiteModifier = {
    id: modifier.id,
    risk: modifier.risk,
    reward_bias: modifier.reward_bias,
    enemy_scale: enemyScale,
    xp_multiplier: xpMultiplier,
    coin_multiplier: clampNumber(modifier.coin_multiplier, 1, 1.35, 1),
    drop_multiplier: policyForModifier(modifier).drop_multiplier,
    recovery_pressure: modifier.recovery_pressure,
  };
  monster.hp = Math.max(1, Math.round(Number(monster.hp || 1) * enemyScale));
  monster.mhp = Math.max(1, Math.round(Number(monster.mhp || monster.hp || 1) * enemyScale));
  monster.atk = Math.max(1, Math.round(Number(monster.atk || 1) * Math.max(1, enemyScale * 0.94)));
  monster.str = Math.max(1, Math.round(Number(monster.str || 1) * Math.max(1, enemyScale * 0.94)));
  monster.xp = Math.max(1, Math.round(Number(monster.xp || 1) * xpMultiplier));
  monster.drops = applyDropPolicy(monster.drops, modifier);
  monster.worldStateTag = `${monster.worldStateTag || "daily_rite"}:${modifier.reward_bias}`;
  return monster;
}
