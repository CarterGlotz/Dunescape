function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function clampInt(value, min, max, fallback = min) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function safeItemGrant(item = {}) {
  const id = cleanText(item.id || item.i).toLowerCase();
  if (!/^[a-z0-9_]{2,48}$/.test(id)) return null;
  return {
    id,
    count: clampInt(item.count ?? item.c, 1, 99, 1),
    label: cleanText(item.label || id.replaceAll("_", " "), "reward").slice(0, 48),
  };
}

export function summarizeDailyRiteOutcomeRewards(outcome = null) {
  const rewards = outcome?.rewards || {};
  const items = Array.isArray(rewards.items) ? rewards.items.map(safeItemGrant).filter(Boolean) : [];
  return {
    version: 1,
    token_cost: 0,
    coins: clampInt(rewards.coins, 0, 9999, 0),
    heal: clampInt(rewards.heal, 0, 999, 0),
    prayer: clampInt(rewards.prayer, 0, 999, 0),
    items,
    label: [
      rewards.coins ? `${clampInt(rewards.coins, 0, 9999, 0)} coins` : null,
      rewards.heal ? `${clampInt(rewards.heal, 0, 999, 0)} HP` : null,
      rewards.prayer ? `${clampInt(rewards.prayer, 0, 999, 0)} Prayer` : null,
      items.length ? items.map((item) => `${item.count} ${item.label}`).join(", ") : null,
    ].filter(Boolean).join(" · "),
  };
}

export function applyDailyRiteRoomOutcome({ player = null, outcome = null } = {}) {
  const summary = summarizeDailyRiteOutcomeRewards(outcome);
  const currentHp = clampInt(player?.hp, 0, clampInt(player?.mhp, 1, 9999, 1), 0);
  const maxHp = clampInt(player?.mhp, 1, 9999, 1);
  const currentPrayer = clampInt(player?.prayer, 0, clampInt(player?.maxPrayer, 0, 9999, 0), 0);
  const maxPrayer = clampInt(player?.maxPrayer, 0, 9999, 0);
  const nextHp = Math.min(maxHp, currentHp + summary.heal);
  const nextPrayer = Math.min(maxPrayer, currentPrayer + summary.prayer);

  if (player) {
    player.hp = nextHp;
    player.prayer = nextPrayer;
  }

  const receipt = cleanText(outcome?.receipt, "Daily Rite clear recorded.");
  const nextAction = cleanText(outcome?.next_action, "");
  return {
    version: 1,
    token_cost: 0,
    applied: !!player && !!outcome,
    wave: clampInt(outcome?.wave, 0, 30, 0),
    segment_id: cleanText(outcome?.segment_id, "unknown").slice(0, 48),
    reward_bias: cleanText(outcome?.reward_bias, "unknown").slice(0, 48),
    heal_applied: Math.max(0, nextHp - currentHp),
    prayer_applied: Math.max(0, nextPrayer - currentPrayer),
    coin_grant: summary.coins,
    item_grants: summary.items,
    reward_summary: summary,
    log_lines: [
      receipt ? `☀️ ${receipt}` : null,
      nextAction ? `🧭 ${nextAction}` : null,
    ].filter(Boolean),
    feedback_event: {
      type: "daily_rite_room_clear",
      wave: clampInt(outcome?.wave, 0, 30, 0),
      outcome: summary.label || cleanText(outcome?.reward_bias, "clear"),
      action_id: `daily_rite_room_${cleanText(outcome?.segment_id, "unknown")}`,
      source: "daily_rite_runtime",
      token_cost: 0,
    },
  };
}
