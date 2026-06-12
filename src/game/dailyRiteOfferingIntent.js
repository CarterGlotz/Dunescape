function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function cleanId(value, fallback = "offering") {
  return cleanText(value, fallback).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48);
}

function clampInt(value, min, max, fallback = min) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

export function buildDailyRiteOfferingIntent({ shrineBargain = null } = {}) {
  if (!shrineBargain?.applied || shrineBargain.posture !== "banked") return null;
  const economy = shrineBargain.economy || {};
  if (clampInt(economy.item_delta, 0, 1, 0) < 1 || clampInt(economy.offering_credit, 0, 1, 0) < 1) {
    return null;
  }

  const segmentLabel = cleanText(shrineBargain.segment_label, "the banked shrine route").slice(0, 80);
  const wave = clampInt(shrineBargain.wave, 0, 30, 0);
  return {
    version: 1,
    token_cost: 0,
    active: true,
    source: "daily_rite_shrine_bargain",
    source_choice_id: cleanId(shrineBargain.choice_id, "bank_shard"),
    item_id: cleanId(economy.item_id, "sunstone_shard"),
    item_count: 1,
    offering_credit: 1,
    wave,
    segment_id: cleanId(shrineBargain.segment_id, "unknown"),
    segment_label: segmentLabel,
    target: {
      version: 1,
      type: "grave_shrine",
      tab: "map",
      label: "Nearest grave shrine",
      action: "offer_sunstone_shard",
      token_cost: 0,
    },
    summary: `Carry the banked Sunstone Shard from ${segmentLabel} to a grave shrine.`,
    next_action: "Open the Living Map, route to a grave cluster, and offer the shard before the route cools.",
  };
}

export function normalizeDailyRiteOfferingIntent(intent = null) {
  if (!intent?.active) return null;
  return {
    version: 1,
    token_cost: 0,
    active: true,
    source: cleanId(intent.source, "daily_rite_shrine_bargain"),
    source_choice_id: cleanId(intent.source_choice_id, "bank_shard"),
    item_id: cleanId(intent.item_id, "sunstone_shard"),
    item_count: clampInt(intent.item_count, 1, 1, 1),
    offering_credit: clampInt(intent.offering_credit, 1, 1, 1),
    wave: clampInt(intent.wave, 0, 30, 0),
    segment_id: cleanId(intent.segment_id, "unknown"),
    segment_label: cleanText(intent.segment_label, "Banked shrine route").slice(0, 80),
    target: {
      version: 1,
      type: cleanId(intent.target?.type, "grave_shrine"),
      tab: cleanId(intent.target?.tab, "map"),
      label: cleanText(intent.target?.label, "Nearest grave shrine").slice(0, 64),
      action: cleanId(intent.target?.action, "offer_sunstone_shard"),
      token_cost: 0,
    },
    summary: cleanText(intent.summary, "Carry the banked Sunstone Shard to a grave shrine.").slice(0, 140),
    next_action: cleanText(intent.next_action, "Open the Living Map and offer the shard.").slice(0, 140),
  };
}
