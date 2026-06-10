import { buildDailyRiteRoomSequence } from "./dailyRiteRooms.js";
import { getDailyRiteConsequence } from "./dailyRiteConsequences.js";
import { getRitePacingCoach } from "./riteCoach.js";
import { buildLastLightResultCard } from "./resultCard.js";

export function createDailyRiteRun({
  dailyRitePlan,
  mechanics,
  vow = null,
  challenge = null,
  daySeed = "solara-day",
  now = Date.now(),
} = {}) {
  const roomWeave = buildDailyRiteRoomSequence({ dailyRitePlan, daySeed });
  const pacingCoach = getRitePacingCoach({ dailyRitePlan, wave: 0, vow, challenge });
  const consequence = getDailyRiteConsequence({ dailyRitePlan, roomWeave, wave: 0, outcome: "entry" });

  return {
    wave: 0,
    startTime: now,
    rooms: roomWeave.rooms,
    roomWeave,
    done: false,
    deathWave: null,
    shareCard: null,
    mechanics,
    vow,
    vowResult: null,
    challengeResult: null,
    dailyPlan: dailyRitePlan,
    pacingCoach,
    consequence,
  };
}

export function completeDailyRiteRun({
  run,
  wave,
  completed = false,
  playerName = "Adventurer",
  phase = "Unknown",
  challenge = null,
  dateSeed = "today",
} = {}) {
  if (!run) return null;
  const safeWave = Math.max(0, Math.min(30, Math.floor(Number(wave) || 0)));
  run.done = true;
  run.deathWave = safeWave;
  run.pacingCoach = getRitePacingCoach({
    dailyRitePlan: run.dailyPlan,
    wave: safeWave,
    vow: run.vow,
    challenge,
    completed: true,
  });
  run.consequence = getDailyRiteConsequence({
    dailyRitePlan: run.dailyPlan,
    roomWeave: run.roomWeave,
    wave: safeWave >= 30 ? 29 : safeWave,
    outcome: completed ? "complete" : "failure",
  });
  run.shareCard = buildLastLightResultCard({
    playerName,
    wave: safeWave,
    phase,
    vowResult: run.vowResult,
    challengeResult: run.challengeResult,
    mythLine: run.consequence?.share_line || run.pacingCoach?.headline,
    dateSeed,
  });
  return run;
}
