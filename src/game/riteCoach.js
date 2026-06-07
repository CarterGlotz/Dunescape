function compactText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function getSegmentForWave(plan, wave) {
  const safeWave = Math.max(0, Math.floor(Number(wave) || 0));
  const nextWave = Math.min(30, safeWave + 1);
  return plan?.route?.find((segment) => nextWave >= segment.waveStart && nextWave <= segment.waveEnd)
    || plan?.route?.[0]
    || null;
}

export function getRitePacingCoach({
  dailyRitePlan = null,
  wave = 0,
  vow = null,
  challenge = null,
  completed = false,
} = {}) {
  const segment = getSegmentForWave(dailyRitePlan, wave);
  const safeWave = Math.max(0, Math.floor(Number(wave) || 0));
  const challengeWave = Number(challenge?.wave || 0);
  const challengePressure = challenge && challengeWave >= safeWave
    ? `Beat ${compactText(challenge.playerName, "a rival")}'s Wave ${challengeWave}.`
    : challenge
      ? `You already passed ${compactText(challenge.playerName, "a rival")}'s mark.`
      : "";
  const vowPressure = vow?.title ? `${compactText(vow.title)} is active; do not waste the pledge.` : "No vow is pledged; play for clean light.";
  const segmentGoal = segment?.goal || dailyRitePlan?.tactic || dailyRitePlan?.objective || "Push the next safe room.";
  const danger = segment?.danger || "unknown";
  const stance = completed
    ? "banked"
    : challenge && challengeWave >= safeWave && challengeWave - safeWave <= 3
      ? "push"
      : danger === "severe"
        ? "bank"
        : danger === "high"
          ? "prepare"
          : "scout";

  return {
    version: 1,
    stance,
    wave: safeWave,
    segment_id: segment?.id || null,
    segment_label: segment?.label || "Next room",
    danger,
    headline: completed
      ? "The rite is banked; turn the result into a chronicle signal."
      : `${segment?.label || "Next room"}: ${segmentGoal}`,
    detail: [vowPressure, challengePressure, dailyRitePlan?.boss?.brief].filter(Boolean).join(" "),
    next_action: stance === "bank"
      ? "Spend resources before the pressure spikes."
      : stance === "push"
        ? "Push now; the rival mark is within reach."
        : stance === "prepare"
          ? "Prepare for the next segment before committing."
          : "Scout the next room and preserve supplies.",
  };
}
