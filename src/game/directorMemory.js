import { readJson, writeJson } from "./clientStore.js";

const MEMORY_KEY = "solara_director_memory";
const MEMORY_WINDOW = 5;

function sanitizeRunEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const mode = entry.mode === "roguelite" ? "roguelite" : "daily";
  const wave = Math.max(0, Math.min(99, Math.floor(Number(entry.wave) || 0)));
  return {
    mode,
    wave,
    completed: !!entry.completed,
    dateSeed: String(entry.dateSeed || "").slice(0, 32),
  };
}

export function loadDirectorMemoryRuns() {
  const raw = readJson(MEMORY_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(sanitizeRunEntry).filter(Boolean).slice(0, MEMORY_WINDOW);
}

export function recordDirectorRunMemory(entry) {
  const safe = sanitizeRunEntry(entry);
  if (!safe) {
    return loadDirectorMemoryRuns();
  }
  const next = [safe, ...loadDirectorMemoryRuns()].slice(0, MEMORY_WINDOW);
  writeJson(MEMORY_KEY, next);
  return next;
}

export function getDirectorMemoryBias(runs = []) {
  const recent = (Array.isArray(runs) ? runs : []).map(sanitizeRunEntry).filter(Boolean).slice(0, 3);
  if (!recent.length) {
    return {
      mood: "unwritten",
      enemyScaleDelta: 0,
      rewardMultiplierDelta: 0,
      remembrance: "The Sun does not know you yet. Walk today's route and be remembered.",
      sample: 0,
    };
  }
  const earlyFalls = recent.filter((run) => !run.completed && run.wave < 10).length;
  const clears = recent.filter((run) => run.completed || run.wave >= 30).length;
  const avgWave = recent.reduce((sum, run) => sum + run.wave, 0) / recent.length;

  if (earlyFalls >= 2) {
    return {
      mood: "merciful",
      enemyScaleDelta: -0.05,
      rewardMultiplierDelta: 0.02,
      remembrance: `The Sun remembers your last falls and eases the early waves.`,
      sample: recent.length,
    };
  }
  if (clears >= 2) {
    return {
      mood: "testing",
      enemyScaleDelta: 0.06,
      rewardMultiplierDelta: 0.04,
      remembrance: "The Sun remembers your victories and sharpens today's route in answer.",
      sample: recent.length,
    };
  }
  if (avgWave >= 20) {
    return {
      mood: "watchful",
      enemyScaleDelta: 0.02,
      rewardMultiplierDelta: 0.01,
      remembrance: "The Sun watches your deep routes and leans a little harder on the late waves.",
      sample: recent.length,
    };
  }
  if (avgWave < 12) {
    return {
      mood: "patient",
      enemyScaleDelta: -0.02,
      rewardMultiplierDelta: 0,
      remembrance: "The Sun remembers your struggles and keeps the first rooms honest.",
      sample: recent.length,
    };
  }
  return {
    mood: "steady",
    enemyScaleDelta: 0,
    rewardMultiplierDelta: 0,
    remembrance: "The Sun holds its judgment; today's route is the measure it gave everyone.",
    sample: recent.length,
  };
}

export function applyDirectorMemoryToMechanics(mechanics, bias) {
  if (!mechanics || !bias) {
    return mechanics;
  }
  const enemyScale = Number(Math.max(0.8, Math.min(1.5, (mechanics.enemyScale || 1) + bias.enemyScaleDelta)).toFixed(3));
  const rewardMultiplier = Number(Math.max(0.9, Math.min(1.6, (mechanics.rewardMultiplier || 1) + bias.rewardMultiplierDelta)).toFixed(2));
  return {
    ...mechanics,
    enemyScale,
    rewardMultiplier,
    memoryMood: bias.mood,
    remembrance: bias.remembrance,
  };
}
