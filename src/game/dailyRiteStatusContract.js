import { summarizeDailyRiteOutcomeRewards } from "./dailyRiteRoomRuntime.js";

function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function buildLatestOutcome(outcome = null) {
  if (!outcome) return null;
  const rewardSummary = summarizeDailyRiteOutcomeRewards(outcome);
  const adjustment = outcome.route_choice_adjustment?.applied
    ? {
      version: 1,
      token_cost: 0,
      choice_id: cleanText(outcome.route_choice_adjustment.choice_id, "choice").slice(0, 48),
      choice_label: cleanText(outcome.route_choice_adjustment.choice_label, "Route choice").slice(0, 64),
      posture: cleanText(outcome.route_choice_adjustment.posture, "balanced").slice(0, 32),
      risk_delta: Math.max(-2, Math.min(2, Math.floor(Number(outcome.route_choice_adjustment.risk_delta || 0)))),
      reward_delta: Math.max(-1, Math.min(3, Math.floor(Number(outcome.route_choice_adjustment.reward_delta || 0)))),
      next_room_bias: cleanText(outcome.route_choice_adjustment.next_room_bias, "balanced route pressure").slice(0, 100),
    }
    : null;
  return {
    version: 1,
    token_cost: 0,
    wave: Math.max(0, Math.min(30, Math.floor(Number(outcome.wave || 0)))),
    segment_label: cleanText(outcome.segment_label, `Wave ${Number(outcome.wave || 0) + 1}`).slice(0, 80),
    reward_bias: cleanText(outcome.reward_bias, "unknown").slice(0, 48),
    receipt: cleanText(outcome.receipt, "Daily Rite clear recorded.").slice(0, 180),
    next_action: cleanText(outcome.next_action, "").slice(0, 140),
    rewards: rewardSummary,
    route_choice_adjustment: adjustment,
  };
}

function buildRouteChoice(choice = null) {
  if (!choice) return null;
  const choices = Array.isArray(choice.choices)
    ? choice.choices.slice(0, 3).map((item) => ({
      id: cleanText(item.id, "choice").slice(0, 48),
      label: cleanText(item.label, "Choose route").slice(0, 64),
      detail: cleanText(item.detail, "").slice(0, 140),
      payoff: cleanText(item.payoff, "").slice(0, 120),
      cost: cleanText(item.cost, "").slice(0, 100),
      token_cost: 0,
    }))
    : [];
  return {
    version: 1,
    token_cost: 0,
    kind: cleanText(choice.kind, "tempo_window").slice(0, 48),
    headline: cleanText(choice.headline, "Route choice opened").slice(0, 80),
    reason: cleanText(choice.reason, "").slice(0, 140),
    recommended_choice_id: cleanText(choice.recommended_choice_id, "").slice(0, 48),
    choices,
  };
}

function buildRouteCommitment(commitment = null) {
  if (!commitment?.committed) return null;
  return {
    version: 1,
    token_cost: 0,
    wave: Math.max(0, Math.min(30, Math.floor(Number(commitment.wave || 0)))),
    segment_id: cleanText(commitment.segment_id, "unknown").slice(0, 48),
    headline: cleanText(commitment.headline, "Route choice committed").slice(0, 80),
    choice_id: cleanText(commitment.choice?.id, "choice").slice(0, 48),
    choice_label: cleanText(commitment.choice?.label, "Choose route").slice(0, 64),
    posture: cleanText(commitment.effect?.posture, "balanced").slice(0, 32),
    next_room_bias: cleanText(commitment.effect?.next_room_bias, "balanced route pressure").slice(0, 100),
    receipt: cleanText(commitment.receipt, "Route choice committed.").slice(0, 160),
  };
}

export function getDailyRiteStatusContract({ dailyRun = null, playedDailyToday = false } = {}) {
  if (!dailyRun) {
    return {
      version: 1,
      state: "idle",
      headline: playedDailyToday ? "Replay Today's Dungeon" : "Play Today's Dungeon",
      progress_label: "30 waves · seeded by today's date",
      primary_action: "start_daily_rite",
      actions: ["start"],
      token_cost: 0,
    };
  }

  if (!dailyRun.done) {
    const primaryStake = dailyRun.stakes?.primary_stake || null;
    return {
      version: 1,
      state: "active",
      headline: `Wave ${dailyRun.wave || 0}/30`,
      progress_label: "Go to the dungeon entrance south of The Mine.",
      primary_action: "continue_daily_rite",
      stake_label: primaryStake?.label || null,
      risk_label: primaryStake ? `risk ${primaryStake.risk}/5` : null,
      modifier_label: dailyRun.modifiers?.highest_risk_segment?.rule || null,
      latest_outcome: buildLatestOutcome(dailyRun.latestOutcome),
      route_choice: buildRouteChoice(dailyRun.latestRouteChoice),
      route_commitment: buildRouteCommitment(dailyRun.routeChoiceCommitment),
      actions: [],
      token_cost: 0,
    };
  }

  return {
    version: 1,
    state: "complete",
    headline: dailyRun.deathWave >= 30 ? "COMPLETED!" : `Wave ${dailyRun.deathWave}/30`,
    progress_label: dailyRun.stakes?.summary || "Daily Rite result recorded.",
    primary_action: dailyRun.shareCard ? "share_daily_rite" : "review_daily_rite",
    stake_label: dailyRun.stakes?.primary_stake?.label || null,
    risk_label: dailyRun.stakes?.primary_stake ? `risk ${dailyRun.stakes.primary_stake.risk}/5` : null,
    modifier_label: dailyRun.modifiers?.highest_risk_segment?.rule || null,
    latest_outcome: buildLatestOutcome(dailyRun.latestOutcome),
    route_choice: buildRouteChoice(dailyRun.latestRouteChoice),
    route_commitment: buildRouteCommitment(dailyRun.routeChoiceCommitment),
    actions: [
      dailyRun.shareCard ? "copy_share" : null,
      dailyRun.shareCard ? "download_scroll" : null,
      dailyRun.shareCard ? "copy_challenge" : null,
    ].filter(Boolean),
    token_cost: 0,
  };
}
