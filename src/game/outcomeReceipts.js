export const OUTCOME_RECEIPT_VERSION = 1;

function compactText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

export function buildOutcomeReceipt({
  type = "world_signal",
  label = "World signal",
  detail = "The chronicle shifted.",
  sharedWorld = null,
  objectiveState = null,
  action = null,
  tokenCost = 0,
} = {}) {
  const phase = sharedWorld?.phase?.label || "Unknown";
  const pressure = sharedWorld?.director?.pressure || "Stable";
  const nextAction = objectiveState?.title || action?.label || sharedWorld?.crisis?.title || "Open Daily Rites";

  return {
    version: OUTCOME_RECEIPT_VERSION,
    type: compactText(type, "world_signal").slice(0, 40),
    label: compactText(label, "World signal").slice(0, 80),
    detail: compactText(detail, "The chronicle shifted.").slice(0, 180),
    world_state: {
      phase,
      pressure,
      ritual_progress: Math.round(Number(sharedWorld?.ritual?.progress || 0) * 100),
      next_action: compactText(nextAction, "Open Daily Rites").slice(0, 80),
    },
    action: action
      ? {
          type: compactText(action.type, "note").slice(0, 32),
          tab: action.tab || null,
          label: compactText(action.label, "Continue").slice(0, 60),
          target: action.target || null,
        }
      : null,
    token_cost: Math.max(0, Math.floor(Number(tokenCost) || 0)),
  };
}

export function buildOutcomeReceiptSet({
  sharedWorld,
  objectiveState = null,
  worldFeed = [],
  aiPolicy = null,
} = {}) {
  const browserTokenCost = Number(aiPolicy?.browser_token_cost || 0);
  const receipts = [
    buildOutcomeReceipt({
      type: "daily_directive",
      label: sharedWorld?.crisis?.title || "Build The Chronicle",
      detail: sharedWorld?.crisis?.detail || "Record a run so the world can react.",
      sharedWorld,
      objectiveState,
      tokenCost: browserTokenCost,
    }),
    buildOutcomeReceipt({
      type: "ritual_progress",
      label: sharedWorld?.ritual?.title || "Lantern Tithe",
      detail: sharedWorld?.ritual?.rewardLabel || "Offer Sunstone Shards to move the communal ritual.",
      sharedWorld,
      objectiveState,
      tokenCost: browserTokenCost,
    }),
  ];

  for (const item of worldFeed.slice(0, 3)) {
    receipts.push(buildOutcomeReceipt({
      type: `feed_${item.kind || "signal"}`,
      label: item.title,
      detail: item.detail,
      sharedWorld,
      objectiveState,
      action: item.action,
      tokenCost: browserTokenCost,
    }));
  }

  return {
    version: OUTCOME_RECEIPT_VERSION,
    count: receipts.length,
    receipts,
  };
}
