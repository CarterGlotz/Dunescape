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

  return {
    version: 1,
    token_cost: 0,
    segment_count: modifiers.length,
    highest_risk_segment: highestRisk,
    segments: modifiers,
    scale_posture: highestRisk
      ? `${highestRisk.label} carries the strongest mechanical pressure at risk ${highestRisk.risk}/5.`
      : "No Daily Rite route modifiers are active until today's route plan is built.",
  };
}

export function getDailyRiteModifierForWave({ modifiers = null, roomWeave = null, wave = 0 } = {}) {
  const index = Math.max(0, Math.min(29, Math.floor(Number(wave) || 0)));
  const segmentId = roomWeave?.segmentByWave?.[index]?.id;
  const list = Array.isArray(modifiers?.segments) ? modifiers.segments : [];
  return list.find((item) => item.id === segmentId) || list[Math.min(list.length - 1, Math.floor(index / 5))] || null;
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
  };
  monster.hp = Math.max(1, Math.round(Number(monster.hp || 1) * enemyScale));
  monster.mhp = Math.max(1, Math.round(Number(monster.mhp || monster.hp || 1) * enemyScale));
  monster.atk = Math.max(1, Math.round(Number(monster.atk || 1) * Math.max(1, enemyScale * 0.94)));
  monster.str = Math.max(1, Math.round(Number(monster.str || 1) * Math.max(1, enemyScale * 0.94)));
  monster.xp = Math.max(1, Math.round(Number(monster.xp || 1) * xpMultiplier));
  monster.worldStateTag = `${monster.worldStateTag || "daily_rite"}:${modifier.reward_bias}`;
  return monster;
}
