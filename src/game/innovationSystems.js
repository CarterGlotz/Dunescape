function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(value) {
  const text = String(value || "solara");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick(list, seed, offset = 0) {
  if (!Array.isArray(list) || !list.length) {
    return null;
  }
  return list[(seed + offset) % list.length];
}

export const LANDMARK_PREFIXES = [
  "The Valley of",
  "The Field of",
  "The Ridge of",
  "The Hollow of",
  "The Crossing of",
  "The Hill of",
  "The Sands of",
  "The Dark of",
  "The Ruins of",
  "The Gate of",
];

export const LANDMARK_SUFFIXES = [
  "First Blood",
  "the Fallen",
  "the Comet-Touched",
  "Eternal Rest",
  "the Sunless",
  "the Forsaken",
  "the Eclipse",
  "Last Steps",
  "the Brave",
  "Quiet Graves",
  "the Dimming",
  "Undying Names",
];

export function getLandmarkName(clusterKey) {
  const hash = hashSeed(clusterKey);
  return `${LANDMARK_PREFIXES[hash % LANDMARK_PREFIXES.length]} ${LANDMARK_SUFFIXES[Math.floor(hash / LANDMARK_PREFIXES.length) % LANDMARK_SUFFIXES.length]}`;
}

export function buildGraveConstellations(graves = []) {
  if (!Array.isArray(graves) || !graves.length) {
    return [];
  }
  const assigned = new Set();
  const clusters = [];
  graves.forEach((grave, index) => {
    if (assigned.has(index)) {
      return;
    }
    const members = [grave];
    assigned.add(index);
    graves.forEach((candidate, innerIndex) => {
      if (assigned.has(innerIndex)) {
        return;
      }
      if (Math.abs(Number(candidate.x || 0) - Number(grave.x || 0)) <= 3 && Math.abs(Number(candidate.y || 0) - Number(grave.y || 0)) <= 3) {
        members.push(candidate);
        assigned.add(innerIndex);
      }
    });
    const offerings = members.reduce((sum, entry) => sum + Number(entry?.sunstone_offerings || 0), 0);
    const avgX = Math.round(members.reduce((sum, entry) => sum + Number(entry?.x || 0), 0) / members.length);
    const avgY = Math.round(members.reduce((sum, entry) => sum + Number(entry?.y || 0), 0) / members.length);
    const key = `${Math.round(avgX / 5)}_${Math.round(avgY / 5)}`;
    const size = members.length;
    const tier = size >= 15 ? "legendary" : size >= 8 ? "major" : size >= 4 ? "minor" : "single";
    const blessing =
      tier === "legendary"
        ? { id: "constellation_legion", label: "Legion of the Fallen", bonus: { attack: 2, strength: 2 } }
        : tier === "major"
          ? { id: "constellation_watch", label: "Watch of the Fallen", bonus: { defence: 2, luck: 1 } }
          : tier === "minor"
            ? { id: "constellation_whisper", label: "Whispering Graves", bonus: { luck: 1 } }
            : null;
    clusters.push({
      key,
      name: tier === "single" ? null : getLandmarkName(key),
      size,
      offerings,
      x: avgX,
      y: avgY,
      tier,
      blessing,
      epitaph: pick(members.map((entry) => entry?.epitaph).filter(Boolean), hashSeed(key)),
    });
  });
  return clusters.sort((a, b) => b.size - a.size || b.offerings - a.offerings);
}

export function buildCommunityRitual(graves = [], phase = { severity: 0 }) {
  const totalOfferings = graves.reduce((sum, grave) => sum + Number(grave?.sunstone_offerings || 0), 0);
  const shrineCount = graves.filter((grave) => Number(grave?.sunstone_offerings || 0) >= 50 || grave?.is_shrine).length;
  const majorShrines = graves.filter((grave) => Number(grave?.sunstone_offerings || 0) >= 200 || grave?.is_major_shrine).length;
  const target = phase?.severity >= 4 ? 240 : phase?.severity >= 3 ? 160 : 100;
  const progress = clamp(totalOfferings / target, 0, 1);
  const completed = totalOfferings >= target;
  const title = completed ? "Solar Communion" : phase?.severity >= 3 ? "Ashwake Vigil" : "Lantern Tithe";
  return {
    title,
    description: completed
      ? "The community ritual is complete. Shared-world blessings burn brighter across the season."
      : "Offer Sunstone Shards at graves to push a communal ritual meter and unlock stronger world-wide boons.",
    target,
    totalOfferings,
    shrineCount,
    majorShrines,
    progress,
    completed,
    rewardLabel: completed ? "Run starts gain ritual favor and market pressure eases." : "Complete the rite for global relief and stronger blessings.",
  };
}

export function buildEchoRival(echoes = [], playerName = "") {
  if (!Array.isArray(echoes) || !echoes.length) {
    return null;
  }
  const rivals = echoes
    .filter((echo) => echo?.player_name && echo.player_name !== playerName)
    .map((echo) => {
      const reactionWeight = Number(echo?.commend_count || 0) + Number(echo?.heed_count || 0) + Number(echo?.mourn_count || 0);
      const waveWeight = Number(echo?.wave_reached || 0);
      const score = reactionWeight * 3 + waveWeight + (echo?.kind === "roguelite" ? 8 : 0);
      return { echo, score };
    })
    .sort((a, b) => b.score - a.score)[0];
  if (!rivals || rivals.score < 6) {
    return null;
  }
  const echo = rivals.echo;
  const archetype =
    echo.kind === "roguelite"
      ? { monsterName: "Bandit", title: "Ashen Rival", icon: "⚔️" }
      : echo.kind === "death"
        ? { monsterName: "Skeleton", title: "Grave Rival", icon: "✝" }
        : { monsterName: "Dark Wizard", title: "Oracle Rival", icon: "🕯️" };
  return {
    id: `${echo.id || "echo"}-rival`,
    playerName: echo.player_name,
    sigil: echo.traveler_sigil || "??",
    headline: echo.headline || "A rival echo stirs.",
    monsterName: archetype.monsterName,
    title: archetype.title,
    icon: archetype.icon,
    score: rivals.score,
    bonusScale: clamp(1 + rivals.score / 30, 1.08, 1.35),
    rewardText: "Defeat this rival for extra coins, XP, and a stronger chronicle.",
  };
}

const PROPHECY_CARD_LIBRARY = [
  {
    id: "shard_tithe",
    title: "Shard Tithe",
    text: "Offer a Sunstone Shard before your next fall. The world rewards those who feed the fire.",
    reward: "Start with extra recovery and ritual favor.",
    modifiers: { luck: 1, ritualFavor: 12 },
  },
  {
    id: "grave_omen",
    title: "Grave Omen",
    text: "Fight where the graves cluster. The dead will warn or test you.",
    reward: "Constellation clusters offer better boons.",
    modifiers: { defence: 1, constellationFavor: 1 },
  },
  {
    id: "rival_claim",
    title: "Rival Claim",
    text: "Answer the strongest echo. A rival waits in the dark room beyond the threshold.",
    reward: "Rival defeat grants extra spoils.",
    modifiers: { rivalFavor: 1, attack: 1 },
  },
  {
    id: "sun_oath",
    title: "Sun Oath",
    text: "While the sun dims, press deeper. Harsh phases pay out more when endured.",
    reward: "Bonus rewards during crisis severity 3+.",
    modifiers: { crisisFavor: 1, strength: 1 },
  },
  {
    id: "oracle_thread",
    title: "Oracle Thread",
    text: "Leave words worth remembering. Memory itself becomes your relic.",
    reward: "Death memory cards gain stronger chronicle text.",
    modifiers: { memoryFavor: 1, prayer: 1 },
  },
];

export function buildProphecyDeck({ dayNumber = 1, playerName = "Adventurer", faction = "neutral", phaseId = "full_dawn" } = {}) {
  const seed = hashSeed(`${dayNumber}:${playerName}:${faction}:${phaseId}`);
  const deck = [];
  for (let i = 0; i < 3; i += 1) {
    const card = PROPHECY_CARD_LIBRARY[(seed + i * 5) % PROPHECY_CARD_LIBRARY.length];
    deck.push({
      ...card,
      accent:
        i === 0 ? "#f0c060" : i === 1 ? "#c8a0ff" : "#d88a36",
    });
  }
  return {
    options: deck,
    active: deck[0],
  };
}

export function buildSunCrisisDirective(snapshot, ritual, constellations) {
  const phase = snapshot?.phase?.id || "full_dawn";
  const pressure = snapshot?.phase?.severity || 0;
  if (phase === "eclipse") {
    return {
      title: "Eclipse Protocol",
      detail: "Push the daily rite, empower shrines, and expect rival intrusions. The season is in emergency mode.",
      priority: 10,
      reward: "Best rewards in the season, but enemy pressure spikes hard.",
    };
  }
  if (ritual?.progress >= 0.75) {
    return {
      title: "Complete The Ritual",
      detail: "The community rite is nearly done. A few more shard offerings will flip the entire world state.",
      priority: 9,
      reward: ritual.rewardLabel,
    };
  }
  if (constellations?.length) {
    const top = constellations[0];
    return {
      title: `Answer ${top.name || "the grave cluster"}`,
      detail: `A ${top.tier} grave constellation is forming near (${top.x}, ${top.y}). It can become a run-defining landmark.`,
      priority: 8,
      reward: top.blessing ? `${top.blessing.label} boon on aligned runs.` : "Map memory and shrine growth.",
    };
  }
  if (pressure >= 2) {
    return {
      title: "Stabilize The Roads",
      detail: "Use Daily Rites and shard offerings to reduce crisis pressure before the season hardens further.",
      priority: 7,
      reward: "Softer enemy scaling and cheaper merchants.",
    };
  }
  return {
    title: "Build The Chronicle",
    detail: "Record runs, deaths, and offerings so the async world has something tangible to react to.",
    priority: 5,
    reward: "More echoes, better rival selection, stronger communal identity.",
  };
}

export function createDeathMemoryCard({
  playerName = "Adventurer",
  sigil = "NO-SIGIL",
  waveReached = 0,
  faction = "neutral",
  sunBrightness = 100,
  epitaph = "",
  eventLabel = "Steady Flame",
  constellationName = "",
} = {}) {
  const phase =
    sunBrightness > 80 ? "Full Dawn" : sunBrightness > 60 ? "Amber Warning" : sunBrightness > 40 ? "The Twilight" : sunBrightness > 20 ? "The Dimming" : "The Eclipse";
  const factionLabel =
    faction === "sunkeeper" ? "Sunkeeper" : faction === "eclipser" ? "Eclipser" : faction;
  const memoryLine = epitaph || `${playerName} fell without words.`;
  const landmarkLine = constellationName ? `Constellation: ${constellationName}` : "Constellation: Unmarked";
  return `✝ SOLARA: DEATH MEMORY\n${playerName} · ${sigil}\nWave ${waveReached} · ${factionLabel} · ${phase} ${Math.round(sunBrightness)}%\n${eventLabel}\n${landmarkLine}\n"${memoryLine}"\nPlay → vaultsparkstudios.github.io/solara/\n#SolaraSunfall #DeathMemory`;
}

export function buildSharedWorldSystems({ graves = [], echoes = [], playerName = "Adventurer", dayNumber = 1, snapshot }) {
  const constellations = buildGraveConstellations(graves);
  const ritual = buildCommunityRitual(graves, snapshot?.phase);
  const rival = buildEchoRival(echoes, playerName);
  const prophecy = buildProphecyDeck({
    dayNumber,
    playerName,
    faction: snapshot?.faction?.leader || "neutral",
    phaseId: snapshot?.phase?.id || "full_dawn",
  });
  const crisis = buildSunCrisisDirective(snapshot, ritual, constellations);
  return {
    constellations,
    ritual,
    rival,
    prophecy,
    crisis,
  };
}
