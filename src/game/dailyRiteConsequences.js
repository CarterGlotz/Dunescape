function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function clampWave(wave) {
  return Math.max(0, Math.min(30, Math.floor(Number(wave) || 0)));
}

function segmentForWave({ roomWeave = null, dailyRitePlan = null, wave = 0 } = {}) {
  const index = Math.max(0, Math.min(29, clampWave(wave)));
  return roomWeave?.segmentByWave?.[index]
    || dailyRitePlan?.route?.find((segment) => index + 1 >= segment.waveStart && index + 1 <= segment.waveEnd)
    || dailyRitePlan?.route?.[0]
    || null;
}

function urgencyFor(segment = {}) {
  const danger = segment.danger || "unknown";
  const rival = Number(segment.rivalChance || 0);
  const shrine = Number(segment.shrineChance || 0);
  if (danger === "severe" || rival >= 0.55) return "emergency";
  if (danger === "high" || shrine >= 0.34) return "high";
  if (danger === "moderate" || shrine >= 0.2) return "rising";
  return "steady";
}

export function getDailyRiteConsequence({
  dailyRitePlan = null,
  roomWeave = null,
  wave = 0,
  outcome = "entry",
} = {}) {
  const safeWave = clampWave(wave);
  const segment = segmentForWave({ roomWeave, dailyRitePlan, wave: safeWave });
  const label = clean(segment?.label, safeWave >= 30 ? "Boss wave" : `Wave ${safeWave + 1}`);
  const encounter = clean(segment?.encounterLabel || segment?.encounter, "route pressure");
  const reward = clean(segment?.rewardTell || segment?.reward, "light");
  const goal = clean(segment?.goal || dailyRitePlan?.tactic || dailyRitePlan?.objective, "Push the rite forward.");
  const urgency = urgencyFor(segment);
  const nextAction = urgency === "emergency"
    ? "Spend resources now; this segment can decide the run."
    : urgency === "high"
      ? "Prepare before pushing the next room."
      : urgency === "rising"
        ? "Take the reward if it appears, then keep moving."
        : "Scout cleanly and preserve supplies.";
  const prefix = outcome === "clear"
    ? "Room cleared"
    : outcome === "failure"
      ? "Rite broke"
      : outcome === "complete"
        ? "Rite sealed"
        : "Room entered";

  return {
    version: 1,
    wave: safeWave,
    outcome,
    segment_id: segment?.id || null,
    label,
    encounter,
    reward,
    urgency,
    goal,
    next_action: nextAction,
    entry_line: `🧭 ${label} · ${encounter} for ${reward}: ${goal}`,
    clear_line: `✅ ${label} answered: ${reward} pressure is now banked for the route.`,
    failure_line: `💀 ${label} consumed the light before ${reward} could be banked.`,
    share_line: `${prefix}: ${label} turned ${encounter} toward ${reward}. ${nextAction}`,
  };
}
