function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

export function buildLastLightResultCard({
  playerName = "Adventurer",
  wave = 0,
  phase = "Unknown",
  vowResult = null,
  challengeResult = null,
  mythLine = "",
  dateSeed = "",
} = {}) {
  const safeWave = Math.max(0, Math.min(30, Math.floor(Number(wave) || 0)));
  const vowLine = vowResult
    ? vowResult.kept
      ? `Vow kept: ${clean(vowResult.title || vowResult.vowId, "legacy")}`
      : `Vow broken: ${clean(vowResult.title || vowResult.vowId, "legacy")}`
    : "Vow: unsworn";
  const challengeLine = challengeResult
    ? clean(challengeResult.line, "Challenge resolved.")
    : "Challenge: open route";
  const myth = clean(mythLine, "The sun writes another line in the chronicle.").slice(0, 120);
  const seed = clean(dateSeed, "today").slice(0, 32);
  const result = safeWave >= 30 ? "CLEAR" : `WAVE ${safeWave}`;
  return [
    "SOLARA: LAST LIGHT",
    `${clean(playerName, "Adventurer").slice(0, 16)} - ${result}`,
    `Phase: ${clean(phase, "Unknown").slice(0, 40)}`,
    vowLine,
    challengeLine,
    myth,
    `Route seed: ${seed}`,
  ].join("\n");
}
