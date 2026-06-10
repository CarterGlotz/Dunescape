const ENCOUNTER_ROOM_WEIGHTS = {
  recovery_room: [0, 0, 3, 1],
  scout_pack: [0, 1, 0, 2],
  low_ambush: [0, 2, 1, 0],
  merchant_tax: [1, 0, 2, 1],
  coin_cache: [1, 1, 0, 2],
  late_wave_bonus: [2, 1, 3, 0],
  grave_warning: [3, 2, 0, 3],
  echo_rival: [2, 3, 1, 2],
  shrine_route: [3, 0, 3, 1],
  hard_pack: [2, 2, 3, 1],
  ritual_choice: [3, 2, 3, 0],
  gravewind_ambush: [2, 3, 2, 1],
  rival_intrusion: [3, 2, 3, 1],
  elite_pack: [3, 3, 2, 1],
  eclipse_trial: [3, 2, 3, 3],
};

function hashText(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function pickWeightedRoom(segment, daySeed, segmentIndex, waveInSegment) {
  const weights = ENCOUNTER_ROOM_WEIGHTS[segment?.encounter] || ENCOUNTER_ROOM_WEIGHTS.scout_pack;
  const dangerBias = segment?.danger === "severe" || segment?.danger === "high" ? 2 : 0;
  const shrineBias = Number(segment?.shrineChance || 0) >= 0.3 ? 3 : 0;
  const rivalBias = Number(segment?.rivalChance || 0) >= 0.45 ? 2 : 0;
  const pool = [...weights, dangerBias, shrineBias, rivalBias].filter((room) => room >= 0 && room <= 3);
  const seed = hashText(`${daySeed}:${segment?.id}:${segment?.encounter}:${segmentIndex}:${waveInSegment}`);
  return pool[seed % pool.length] ?? 0;
}

export function buildDailyRiteRoomSequence({ dailyRitePlan, daySeed = "solara-day" } = {}) {
  const route = Array.isArray(dailyRitePlan?.route) && dailyRitePlan.route.length
    ? dailyRitePlan.route
    : [{ id: "fallback", encounter: "scout_pack", label: "Waves 1-30", waveStart: 1, waveEnd: 30 }];
  const rooms = [];
  const segmentByWave = [];

  route.forEach((segment, segmentIndex) => {
    const start = Math.max(1, Math.floor(Number(segment.waveStart || segmentIndex * 5 + 1)));
    const end = Math.min(30, Math.max(start, Math.floor(Number(segment.waveEnd || start + 4))));
    for (let wave = start; wave <= end && wave <= 30; wave += 1) {
      if (wave === 30) {
        rooms[wave - 1] = 4;
      } else {
        rooms[wave - 1] = pickWeightedRoom(segment, daySeed, segmentIndex, wave - start);
      }
      segmentByWave[wave - 1] = {
        id: segment.id || `segment_${segmentIndex + 1}`,
        label: segment.label || `Waves ${start}-${end}`,
        goal: segment.goal || dailyRitePlan?.tactic || dailyRitePlan?.objective || "Push the rite forward.",
        danger: segment.danger || "unknown",
        rewardTell: segment.rewardTell || "reward",
        encounterLabel: segment.encounterLabel || String(segment.encounter || "encounter").replaceAll("_", " "),
      };
    }
  });

  for (let index = 0; index < 30; index += 1) {
    if (rooms[index] === undefined) {
      const segment = route[Math.min(route.length - 1, Math.floor(index / 5))];
      rooms[index] = index === 29 ? 4 : pickWeightedRoom(segment, daySeed, Math.floor(index / 5), index % 5);
      segmentByWave[index] = {
        id: segment?.id || `segment_${Math.floor(index / 5) + 1}`,
        label: segment?.label || `Waves ${Math.floor(index / 5) * 5 + 1}-${Math.floor(index / 5) * 5 + 5}`,
        goal: segment?.goal || dailyRitePlan?.tactic || dailyRitePlan?.objective || "Push the rite forward.",
        danger: segment?.danger || "unknown",
        rewardTell: segment?.rewardTell || "reward",
        encounterLabel: segment?.encounterLabel || String(segment?.encounter || "encounter").replaceAll("_", " "),
      };
    }
  }

  return {
    version: 1,
    rooms,
    segmentByWave,
    summary: `${dailyRitePlan?.label || "Daily Rite"} room weave: ${route.map((segment) => segment.encounterLabel || segment.encounter).join(" -> ")}`,
  };
}
