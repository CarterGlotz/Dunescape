const MODIFIER_MECHANICS = {
  clear_routes: {
    encounterBias: ["recovery_room", "scout_pack", "low_ambush"],
    rewardBias: ["food", "coins", "starter_relic"],
    shrineBias: "stable",
    rivalWeight: 0.75,
    enemyScaleDelta: -0.03,
    merchantScaleDelta: -0.05,
    objective: "Use the safer route to bank a clean Daily Rite result.",
    tactic: "Scout, bank food, and avoid taking early unnecessary trades.",
  },
  amber_tax: {
    encounterBias: ["merchant_tax", "coin_cache", "late_wave_bonus"],
    rewardBias: ["coins", "crafting_materials"],
    shrineBias: "neutral",
    rivalWeight: 1,
    enemyScaleDelta: 0.02,
    merchantScaleDelta: 0.04,
    objective: "Push past the taxed early waves; late rooms pay better.",
    tactic: "Conserve coins early, then cash in the late reward rooms.",
  },
  mirror_graves: {
    encounterBias: ["grave_warning", "echo_rival", "shrine_route"],
    rewardBias: ["sunstone_shard", "defence_boon", "memory_card"],
    shrineBias: "high",
    rivalWeight: 1.2,
    enemyScaleDelta: 0.04,
    merchantScaleDelta: 0.02,
    objective: "Route through grave pressure and convert it into shrine progress.",
    tactic: "Favor grave-warning rooms and spend shards where a shrine can flip.",
  },
  ash_pressure: {
    encounterBias: ["hard_pack", "ritual_choice", "gravewind_ambush"],
    rewardBias: ["sunstone_shard", "crisis_xp", "rare_relic"],
    shrineBias: "urgent",
    rivalWeight: 1.35,
    enemyScaleDelta: 0.08,
    merchantScaleDelta: 0.05,
    objective: "Trade risk for ritual relief; every offering matters more now.",
    tactic: "Accept harder packs when the reward points toward Sunstone relief.",
  },
  sunless_edict: {
    encounterBias: ["rival_intrusion", "elite_pack", "eclipse_trial"],
    rewardBias: ["crisis_relic", "faction_spoils", "major_shrine_boon"],
    shrineBias: "emergency",
    rivalWeight: 1.6,
    enemyScaleDelta: 0.14,
    merchantScaleDelta: 0.08,
    objective: "Survive the emergency route or fund shrines before the sun collapses.",
    tactic: "Treat rivals and elite packs as crisis objectives, not distractions.",
  },
};

const ENCOUNTER_COPY = {
  recovery_room: "Recovery room",
  scout_pack: "Scout pack",
  low_ambush: "Low ambush",
  merchant_tax: "Merchant tax",
  coin_cache: "Coin cache",
  late_wave_bonus: "Late-wave bonus",
  grave_warning: "Grave warning",
  echo_rival: "Echo rival",
  shrine_route: "Shrine route",
  hard_pack: "Hard pack",
  ritual_choice: "Ritual choice",
  gravewind_ambush: "Gravewind ambush",
  rival_intrusion: "Rival intrusion",
  elite_pack: "Elite pack",
  eclipse_trial: "Eclipse trial",
};

const REWARD_COPY = {
  food: "food",
  coins: "coins",
  starter_relic: "starter relic",
  crafting_materials: "crafting materials",
  sunstone_shard: "Sunstone Shard",
  defence_boon: "defence boon",
  memory_card: "memory card",
  crisis_xp: "crisis XP",
  rare_relic: "rare relic",
  crisis_relic: "crisis relic",
  faction_spoils: "faction spoils",
  major_shrine_boon: "major shrine boon",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getDirectorGameplayPlan({ sharedWorld, director = sharedWorld?.director, event = sharedWorld?.event } = {}) {
  const modifierId = director?.dailyModifier?.id || event?.dailyModifier?.id || "clear_routes";
  const base = MODIFIER_MECHANICS[modifierId] || MODIFIER_MECHANICS.clear_routes;
  const severity = Number(sharedWorld?.phase?.severity || 0);
  const ritualProgress = Number(sharedWorld?.ritual?.progress || 0);
  const hasRival = !!sharedWorld?.rival;
  const hasConstellation = !!sharedWorld?.constellations?.[0];
  const factionLeader = sharedWorld?.faction?.contested ? "contested" : sharedWorld?.faction?.leader || "neutral";

  const rewardMultiplier = Number((1 + severity * 0.04 + (hasRival ? 0.04 : 0) + (ritualProgress >= 1 ? 0.03 : 0)).toFixed(2));
  const enemyScale = Number(clamp((event?.enemyScale || 1) + base.enemyScaleDelta - (ritualProgress >= 1 ? 0.04 : 0), 0.85, 1.45).toFixed(3));
  const merchantScale = Number(clamp((event?.merchantScale || 1) + base.merchantScaleDelta - (ritualProgress >= 1 ? 0.06 : 0), 0.75, 1.35).toFixed(3));
  const rivalWeight = Number((base.rivalWeight + (hasRival ? 0.2 : 0) + severity * 0.05).toFixed(2));

  return {
    id: modifierId,
    label: director?.dailyModifier?.label || "Clear Routes",
    objective: base.objective,
    tactic: base.tactic,
    encounterBias: base.encounterBias,
    rewardBias: base.rewardBias,
    shrineBias: hasConstellation ? base.shrineBias : "seed",
    rivalWeight,
    rewardMultiplier,
    enemyScale,
    merchantScale,
    factionPressure: factionLeader,
    telemetryTags: [
      `modifier:${modifierId}`,
      `pressure:${director?.pressure || "Stable"}`,
      `faction:${factionLeader}`,
      hasRival ? "rival:active" : "rival:none",
      hasConstellation ? "graves:clustered" : "graves:sparse",
    ],
  };
}

function dangerLabel(pressure) {
  if (pressure >= 1.22) return "severe";
  if (pressure >= 1.08) return "high";
  if (pressure >= 0.98) return "moderate";
  return "low";
}

function routeGoal({ encounter, reward, shrineChance, rivalChance }) {
  const encounterLabel = ENCOUNTER_COPY[encounter] || encounter.replaceAll("_", " ");
  const rewardLabel = REWARD_COPY[reward] || reward.replaceAll("_", " ");
  if (rivalChance >= 0.45) {
    return `Prepare for ${encounterLabel}; rival pressure is likely and ${rewardLabel} is the payoff.`;
  }
  if (shrineChance >= 0.3) {
    return `Route toward ${encounterLabel}; shrine odds are strong and ${rewardLabel} can compound.`;
  }
  return `Use ${encounterLabel} pacing to secure ${rewardLabel}.`;
}

export function getDailyRitePlan({ sharedWorld, dayNumber = 1 } = {}) {
  const plan = getDirectorGameplayPlan({ sharedWorld });
  const seed = Math.max(1, Math.floor(Number(dayNumber) || 1));
  const encounterBias = plan.encounterBias.length ? plan.encounterBias : ["scout_pack"];
  const rewardBias = plan.rewardBias.length ? plan.rewardBias : ["coins"];
  const route = Array.from({ length: 6 }, (_, index) => {
    const waveStart = index * 5 + 1;
    const waveEnd = waveStart + 4;
    const encounter = encounterBias[(seed + index) % encounterBias.length];
    const reward = rewardBias[(seed + index * 2) % rewardBias.length];
    const pressure = Number((plan.enemyScale + index * 0.015 + plan.rivalWeight * 0.01).toFixed(3));
    return {
      id: `segment_${index + 1}`,
      label: `Waves ${waveStart}-${waveEnd}`,
      waveStart,
      waveEnd,
      encounter,
      reward,
      pressure,
      shrineChance: plan.shrineBias === "emergency" ? 0.45 : plan.shrineBias === "urgent" ? 0.34 : plan.shrineBias === "high" ? 0.28 : plan.shrineBias === "seed" ? 0.12 : 0.18,
      rivalChance: Number(Math.min(0.75, plan.rivalWeight * (index + 1) * 0.06).toFixed(2)),
    };
  });
  const briefedRoute = route.map((segment) => ({
    ...segment,
    danger: dangerLabel(segment.pressure),
    encounterLabel: ENCOUNTER_COPY[segment.encounter] || segment.encounter.replaceAll("_", " "),
    rewardTell: REWARD_COPY[segment.reward] || segment.reward.replaceAll("_", " "),
    goal: routeGoal(segment),
  }));

  return {
    id: `${plan.id}:day:${seed}`,
    label: plan.label,
    objective: plan.objective,
    tactic: plan.tactic,
    rewardMultiplier: plan.rewardMultiplier,
    enemyScale: plan.enemyScale,
    route: briefedRoute,
    boss: {
      wave: 30,
      pressure: Number((plan.enemyScale + plan.rivalWeight * 0.04).toFixed(3)),
      reward: rewardBias[(seed + 30) % rewardBias.length],
      rivalIntrusion: plan.rivalWeight >= 1.35,
      brief: plan.rivalWeight >= 1.35
        ? "The boss wave can pull in rival pressure; save burst resources for the final room."
        : "The boss wave is the cleanest place to bank the route's main reward.",
    },
    shareLine: `${plan.label}: ${plan.objective}`,
    routeSummary: `${plan.label}: ${plan.tactic} ${briefedRoute[0]?.goal || plan.objective}`,
  };
}
