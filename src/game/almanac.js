import { getDailyRitePlan } from "./directorMechanics.js";
import { getSunPhase } from "./sharedWorld.js";

const PHASE_BANDS = [
  { id: "full_dawn", label: "Full Dawn", floor: 80 },
  { id: "amber_warning", label: "Amber Warning", floor: 60 },
  { id: "twilight", label: "The Twilight", floor: 40 },
  { id: "dimming", label: "The Dimming", floor: 20 },
  { id: "eclipse", label: "The Eclipse", floor: 0 },
];

function dayLabel(offset) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return `In ${offset} days`;
}

function bestForLabel(segment, boss) {
  if (!segment) {
    return "steady routing";
  }
  if (segment.shrineChance >= 0.3) {
    return "shrine offerings";
  }
  if (segment.rivalChance >= 0.3) {
    return "rival hunting";
  }
  if (boss?.rivalIntrusion) {
    return "boss preparation";
  }
  return `${segment.rewardTell} farming`;
}

export function getPhaseDriftWatch(sunBrightness) {
  const brightness = Math.max(0, Math.min(100, Number(sunBrightness) || 0));
  const phase = getSunPhase(brightness);
  const bandIndex = PHASE_BANDS.findIndex((band) => band.id === phase.id);
  const darkerBand = PHASE_BANDS[bandIndex + 1] || null;
  const brighterBand = bandIndex > 0 ? PHASE_BANDS[bandIndex - 1] : null;
  const currentBand = PHASE_BANDS[bandIndex];
  const lightToDarker = darkerBand ? Number((brightness - currentBand.floor).toFixed(1)) : null;
  const lightToBrighter = brighterBand ? Number((brighterBand.floor - brightness).toFixed(1)) : null;
  return {
    phase: { id: phase.id, label: phase.label },
    darker: darkerBand
      ? { id: darkerBand.id, label: darkerBand.label, lightAway: lightToDarker }
      : null,
    brighter: brighterBand
      ? { id: brighterBand.id, label: brighterBand.label, lightAway: lightToBrighter }
      : null,
    watchLine: darkerBand && lightToDarker !== null && lightToDarker <= 5
      ? `Only ${lightToDarker} light stands between the world and ${darkerBand.label}. Deaths today carry weight.`
      : brighterBand && lightToBrighter !== null && lightToBrighter <= 5
        ? `${lightToBrighter} light of communal effort would lift the world into ${brighterBand.label}.`
        : `The world holds in ${phase.label}; the modifier will not flip without a real swing in the sun.`,
  };
}

export function getSunAlmanac({ sharedWorld, dayNumber = 1, days = 7, sunBrightness = null } = {}) {
  const startDay = Math.max(1, Math.floor(Number(dayNumber) || 1));
  const span = Math.max(1, Math.min(14, Math.floor(Number(days) || 7)));
  const forecast = Array.from({ length: span }, (_, offset) => {
    const day = startDay + offset;
    const plan = getDailyRitePlan({ sharedWorld, dayNumber: day });
    const opening = plan.route[0] || null;
    return {
      offset,
      dayNumber: day,
      label: dayLabel(offset),
      modifier: { id: plan.id.split(":")[0], label: plan.label },
      opening: opening
        ? {
            encounter: opening.encounterLabel,
            reward: opening.rewardTell,
            danger: opening.danger,
            shrineChance: opening.shrineChance,
            rivalChance: opening.rivalChance,
          }
        : null,
      bossReward: plan.boss?.reward || null,
      bestFor: bestForLabel(opening, plan.boss),
    };
  });

  const brightness = sunBrightness !== null ? sunBrightness : null;
  const driftWatch = brightness !== null ? getPhaseDriftWatch(brightness) : null;
  const bestOffering = forecast.reduce(
    (best, entry) => ((entry.opening?.shrineChance || 0) > (best?.opening?.shrineChance || 0) ? entry : best),
    forecast[0],
  );

  return {
    version: 1,
    startDay,
    days: span,
    forecast,
    driftWatch,
    planningLine: bestOffering
      ? `${bestOffering.label} favors ${bestOffering.bestFor} — plan offerings and deep routes around it.`
      : "The week ahead holds steady; run when you are strongest.",
    determinism: "All forecast entries derive from the date seed and current world phase. No generation cost.",
  };
}
