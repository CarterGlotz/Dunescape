import { safeNum, sanitizeText } from "./save.js";

const TRUSTED_REACTIONS = new Set(["commend", "heed", "mourn"]);
const TRUSTED_FACTIONS = new Set(["sunkeeper", "eclipser", "neutral"]);
const TRUSTED_ECHO_KINDS = new Set(["death", "death_memory", "roguelite", "daily", "oracle", "milestone"]);
const BLOCKED_TEXT = [
  /\b(?:https?:\/\/|www\.)\S+/i,
  /<[^>]*>/,
  /\b(?:discord\.gg|\.ru\/|\.zip\b|\.exe\b)/i,
];

export function normalizeFaction(value) {
  return TRUSTED_FACTIONS.has(value) ? value : "neutral";
}

export function cleanPublicText(value, maxLen, fallback) {
  const normalized = sanitizeText(value, maxLen, fallback);
  if (BLOCKED_TEXT.some((pattern) => pattern.test(normalized))) {
    return fallback;
  }
  const clean = normalized.replace(/[<>`]/g, "");
  return clean;
}

export function sanitizeEchoPayload(payload = {}) {
  return {
    player_name: cleanPublicText(payload.player_name, 16, "Adventurer"),
    traveler_sigil: cleanPublicText(payload.traveler_sigil, 24, "NO-SIGIL").toUpperCase(),
    kind: TRUSTED_ECHO_KINDS.has(payload.kind) ? payload.kind : "oracle",
    headline: cleanPublicText(payload.headline, 96, "An echo stirred in Solara."),
    summary: cleanPublicText(payload.summary, 420, "The world remembers."),
    wave_reached: Math.floor(safeNum(payload.wave_reached, 0, 0, 999)),
    faction: normalizeFaction(payload.faction),
  };
}

export function sanitizeDailyScorePayload(payload = {}) {
  return {
    player_name: cleanPublicText(payload.player_name, 16, "Adventurer"),
    wave_reached: Math.floor(safeNum(payload.wave_reached, 0, 0, 30)),
    faction: normalizeFaction(payload.faction),
  };
}

export function sanitizeGravePayload(payload = {}) {
  return {
    player_name: cleanPublicText(payload.player_name, 16, "Adventurer"),
    epitaph: cleanPublicText(payload.epitaph, 80, "They fell without words."),
    x: Math.floor(safeNum(payload.x, 20, 0, 99)),
    y: Math.floor(safeNum(payload.y, 28, 0, 99)),
    faction: normalizeFaction(payload.faction),
    wave_reached: Math.floor(safeNum(payload.wave_reached, 0, 0, 999)),
  };
}

export function sanitizeReaction(value) {
  return TRUSTED_REACTIONS.has(value) ? value : null;
}

export function sanitizeOfferingCount(value) {
  return Math.floor(safeNum(value, 0, 0, 999999));
}
