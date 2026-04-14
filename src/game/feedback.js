export function getSharedWorldBriefing({
  sharedWorld,
  hasSunstoneShard = false,
  backendConnected = false,
  playedDailyToday = false,
  objectiveState = null,
}) {
  const cards = [
    {
      id: "pressure",
      accent: sharedWorld.phase.accent,
      title: `${sharedWorld.crisis.title} · ${sharedWorld.director.pressure}`,
      detail: sharedWorld.director.dailyModifier.effect,
    },
    {
      id: "ritual",
      accent: "#c8a84e",
      title: `${sharedWorld.ritual.title} · ${Math.round(sharedWorld.ritual.progress * 100)}%`,
      detail: hasSunstoneShard
        ? "You already carry a Sunstone Shard. One offering will move the communal ritual immediately."
        : `${sharedWorld.ritual.totalOfferings}/${sharedWorld.ritual.target} offerings recorded. ${sharedWorld.ritual.rewardLabel}`,
    },
  ];

  if (sharedWorld.rival) {
    cards.push({
      id: "rival",
      accent: "#f0a060",
      title: `${sharedWorld.rival.icon} Rival: ${sharedWorld.rival.playerName}`,
      detail: sharedWorld.rival.rewardText,
    });
  } else if (sharedWorld.prophecy?.active) {
    cards.push({
      id: "prophecy",
      accent: sharedWorld.prophecy.active.accent || "#c8a0ff",
      title: `Prophecy: ${sharedWorld.prophecy.active.title}`,
      detail: sharedWorld.prophecy.active.text,
    });
  }

  cards.push({
    id: "best-move",
    accent: backendConnected ? "#7fd37f" : "#c68856",
    title: backendConnected ? "Live World Link Active" : "Local Chronicle Fallback",
    detail: objectiveState
      ? `${playedDailyToday ? "Next best move" : "Best opening move"}: ${objectiveState.title}.`
      : backendConnected
        ? "Live async world hooks are available."
        : "Shared-world systems fall back to local-only echoes until Supabase is configured.",
  });

  return {
    headline: sharedWorld.summary,
    detail: sharedWorld.event.description,
    blessing: sharedWorld.blessing?.label || null,
    cards,
  };
}

export function getRunDebrief({
  mode,
  run,
  sharedWorld,
  objectiveState = null,
  hasSunstoneShard = false,
}) {
  if (!run?.done) {
    return null;
  }

  const isDaily = mode === "daily";
  const cleared = Number(run.deathWave || 0) >= 30;
  const accent = isDaily ? (cleared ? "#da0" : "#f44") : cleared ? "#c8a0ff" : "#f090c8";
  const modeLabel = isDaily ? "Daily Rite" : "Roguelite";
  const result = cleared ? `${modeLabel} Cleared` : `${modeLabel} Ended at Wave ${run.deathWave || 0}`;
  let impact = isDaily
    ? "Your result feeds today's communal leaderboard and faction balance."
    : "Your run strengthens your private legacy while still feeding Solara's larger chronicle.";

  if (!cleared && hasSunstoneShard) {
    impact += " The strongest recovery move is to convert your next shard into ritual progress.";
  } else if (sharedWorld.rival && !cleared) {
    impact += ` ${sharedWorld.rival.playerName}'s rival pressure is still active.`;
  } else if (sharedWorld.blessing) {
    impact += ` Next run boon: ${sharedWorld.blessing.label}.`;
  }

  const nextStep = objectiveState
    ? `${objectiveState.title}: ${objectiveState.detail}`
    : isDaily
      ? "Open the Daily Rite again when you're ready to push the season forward."
      : "Start another Roguelite push once you want another relic attempt.";

  return {
    accent,
    result,
    impact,
    nextStep,
    followup:
      sharedWorld.constellations[0]?.name && !cleared
        ? `The nearest high-pressure grave cluster is ${sharedWorld.constellations[0].name}.`
        : sharedWorld.director.factionObjective,
  };
}
