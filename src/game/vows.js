const VOW_CATALOG = [
  {
    id: "dawnbreaker",
    title: "Vow of the Dawnbreaker",
    pledge: "I will carry the light past Wave 10.",
    check: { minWave: 10 },
    keptMultiplier: 1.2,
    brokenMultiplier: 0.95,
    keptLine: "kept the Dawnbreaker's word",
    brokenLine: "fell short of the dawn",
  },
  {
    id: "deep_route",
    title: "Vow of the Deep Route",
    pledge: "I will walk the route past Wave 20.",
    check: { minWave: 20 },
    keptMultiplier: 1.35,
    brokenMultiplier: 0.9,
    keptLine: "walked the deep route as sworn",
    brokenLine: "turned back before the depths",
  },
  {
    id: "final_light",
    title: "Vow of the Final Light",
    pledge: "I will clear all thirty waves or be remembered trying.",
    check: { completed: true },
    keptMultiplier: 1.5,
    brokenMultiplier: 1,
    keptLine: "carried the final light to the end",
    brokenLine: "was claimed before the final light",
  },
  {
    id: "swift_flame",
    title: "Vow of the Swift Flame",
    pledge: "I will reach Wave 10 before five minutes burn away.",
    check: { minWave: 10, maxDurationMs: 5 * 60 * 1000 },
    keptMultiplier: 1.25,
    brokenMultiplier: 0.95,
    keptLine: "outran the burning of the flame",
    brokenLine: "let the flame burn faster than their stride",
  },
];

function hashSeed(value) {
  const text = String(value || "solara");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function getVowOffers({ dateSeed = "", dayNumber = 1, count = 2 } = {}) {
  const seed = hashSeed(`${dateSeed}:${dayNumber}`);
  const take = Math.max(1, Math.min(3, Math.floor(Number(count) || 2)));
  const offers = [];
  for (let i = 0; offers.length < take && i < VOW_CATALOG.length; i += 1) {
    const vow = VOW_CATALOG[(seed + i * 3) % VOW_CATALOG.length];
    if (!offers.some((entry) => entry.id === vow.id)) {
      offers.push(vow);
    }
  }
  return offers;
}

export function getVowById(vowId) {
  return VOW_CATALOG.find((vow) => vow.id === vowId) || null;
}

export function evaluateVow(vow, { wave = 0, completed = false, durationMs = null } = {}) {
  const target = typeof vow === "string" ? getVowById(vow) : vow;
  if (!target?.check) {
    return null;
  }
  const safeWave = Math.max(0, Math.floor(Number(wave) || 0));
  let kept = true;
  if (target.check.completed && !completed && safeWave < 30) {
    kept = false;
  }
  if (target.check.minWave && safeWave < target.check.minWave) {
    kept = false;
  }
  if (kept && target.check.maxDurationMs && Number.isFinite(durationMs)) {
    if (durationMs > target.check.maxDurationMs) {
      kept = false;
    }
  }
  const legacyMultiplier = kept ? target.keptMultiplier : target.brokenMultiplier;
  return {
    vowId: target.id,
    title: target.title,
    kept,
    legacyMultiplier,
    epitaphLine: kept ? target.keptLine : target.brokenLine,
    debriefLine: kept
      ? `Vow kept — ${target.title}. Your grave's legacy burns ${legacyMultiplier}x brighter for it.`
      : `Vow broken — ${target.title}. The constellation will remember a dimmer mark (${legacyMultiplier}x).`,
  };
}

export function applyVowToEpitaph(epitaph, vowResult, maxLength = 80) {
  const base = String(epitaph || "They fell without words.").trim();
  if (!vowResult?.epitaphLine) {
    return base.slice(0, maxLength);
  }
  const suffix = ` — ${vowResult.epitaphLine}`;
  return (base.slice(0, Math.max(8, maxLength - suffix.length)) + suffix).slice(0, maxLength);
}

export function getVowLegacyValue(baseOfferings, vowResult) {
  const base = Math.max(0, Math.floor(Number(baseOfferings) || 0));
  if (!vowResult) {
    return base;
  }
  return Math.max(0, Math.round(base * (Number(vowResult.legacyMultiplier) || 1)));
}
