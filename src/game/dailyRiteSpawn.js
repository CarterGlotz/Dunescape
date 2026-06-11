import { getDailyRiteModifierForWave, getDailyRiteSegmentPolicyForWave, applyDailyRiteMonsterModifier } from "./dailyRiteModifiers.js";
import { applyMonsterWorldState } from "./worldRuntime.js";

export function applyDailyRiteSpawnState(monster, { snapshot = null, run = null, wave = null } = {}) {
  if (!monster) return monster;
  const activeWave = wave ?? run?.wave ?? 0;
  const modifier = getDailyRiteModifierForWave({
    modifiers: run?.modifiers,
    roomWeave: run?.roomWeave,
    wave: activeWave,
  });
  const policy = getDailyRiteSegmentPolicyForWave({
    modifiers: run?.modifiers,
    roomWeave: run?.roomWeave,
    wave: activeWave,
  });
  const worldMonster = snapshot ? applyMonsterWorldState(monster, snapshot, "dungeon") : monster;
  const dailyMonster = applyDailyRiteMonsterModifier(worldMonster, modifier);
  if (policy) {
    dailyMonster.dailyRitePolicy = {
      id: policy.id,
      reward_bias: policy.reward_bias,
      recovery_pressure: policy.recovery_pressure,
      recovery_room_chance: policy.recovery_room_chance,
      shrine_bargain: policy.shrine_bargain,
    };
  }
  return dailyMonster;
}
