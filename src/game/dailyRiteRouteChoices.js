function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function clampInt(value, min, max, fallback = min) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function choice(id, label, detail, payoff, cost = "No extra cost.") {
  return {
    id: cleanText(id, "choice").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48),
    label: cleanText(label, "Choose route").slice(0, 64),
    detail: cleanText(detail, "Route choice pending.").slice(0, 140),
    payoff: cleanText(payoff, "Keeps the route stable.").slice(0, 120),
    cost: cleanText(cost, "No extra cost.").slice(0, 100),
    token_cost: 0,
  };
}

function kindForOutcome(outcome = {}, window = null) {
  if (window?.kind) return cleanText(window.kind, "tempo_window");
  const items = Array.isArray(outcome?.rewards?.items) ? outcome.rewards.items : [];
  if (items.some((item) => item?.id === "sunstone_shard")) return "shrine_bargain";
  if (Number(outcome?.rewards?.heal || 0) > 0 || Number(outcome?.rewards?.prayer || 0) > 0) return "recovery_window";
  if (Number(outcome?.rewards?.coins || 0) >= 40) return "cache_window";
  return "tempo_window";
}

function findWindowForOutcome(outcome = {}, digest = {}) {
  const windows = Array.isArray(digest?.decision_windows) ? digest.decision_windows : [];
  return windows.find((item) => item.segment_id === outcome.segment_id)
    || windows.find((item) => item.wave === outcome.wave)
    || null;
}

function choicesForKind(kind, outcome = {}, window = null) {
  const segment = cleanText(window?.segment_label || outcome.segment_label, "this segment");
  if (kind === "shrine_bargain") {
    return [
      choice("bank_shard", "Bank the shard", `Secure the Sunstone from ${segment} before the route turns hostile.`, "Protects shrine progress for later offerings.", "Slower tempo on the next room."),
      choice("spend_shard", "Spend it now", "Convert the bargain into immediate route pressure relief.", "Turns a dangerous window into a safer push.", "Consumes the visible shrine leverage."),
      choice("press_oath", "Press the oath", "Carry the shard forward and raise the stakes for the next clear.", "Best if the player is healthy and chasing a deeper Last Light card.", "Recovery remains scarce."),
    ];
  }
  if (kind === "recovery_window") {
    return [
      choice("stabilize", "Stabilize", `Use the recovery from ${segment} before the next spike.`, "Best survival line; preserves food and Prayer.", "Lower immediate tempo."),
      choice("overheal_tempo", "Push while restored", "Treat the recovery receipt as permission to take the next fight faster.", "Best score line when HP and Prayer are capped.", "Punishes missed attacks harder."),
    ];
  }
  if (kind === "cache_window") {
    return [
      choice("claim_cache", "Claim the cache", `Route around ${segment}'s coin pressure and bank the payout.`, "Best economy line; stabilizes future merchant choices.", "May lose a cleaner shrine setup."),
      choice("trade_for_tempo", "Trade for tempo", "Use the cache as fuel for a faster next room.", "Best clear-speed line for challenge-link attempts.", "Leaves less room for recovery mistakes."),
    ];
  }
  return [
    choice("hold_tempo", "Hold tempo", `Keep ${segment} clean and preserve supplies.`, "Best default line when the route offers no special bargain.", "No burst payout."),
    choice("fish_for_window", "Fish for the next window", "Play conservatively until a recovery, cache, or shrine prompt appears.", "Best long-run line for uncertain builds.", "Slower wave progression."),
  ];
}

export function buildDailyRiteRouteChoicePrompt({ outcome = null, outcomeDigest = null } = {}) {
  if (!outcome) {
    return {
      version: 1,
      token_cost: 0,
      kind: "pending",
      headline: "Route choice pending",
      segment_id: null,
      wave: 0,
      recommended_choice_id: null,
      choices: [],
    };
  }
  const window = findWindowForOutcome(outcome, outcomeDigest);
  const kind = kindForOutcome(outcome, window);
  const choices = choicesForKind(kind, outcome, window).slice(0, 3);
  return {
    version: 1,
    token_cost: 0,
    kind,
    wave: clampInt(outcome.wave, 0, 30, 0),
    segment_id: cleanText(outcome.segment_id || window?.segment_id, "unknown").slice(0, 48),
    segment_label: cleanText(window?.segment_label || outcome.segment_label, "Daily Rite segment").slice(0, 80),
    headline: cleanText(
      kind === "shrine_bargain"
        ? "Shrine bargain opened"
        : kind === "recovery_window"
          ? "Recovery window opened"
          : kind === "cache_window"
            ? "Cache window opened"
            : "Tempo choice opened",
      "Route choice opened",
    ),
    recommended_choice_id: choices[0]?.id || null,
    reason: cleanText(window?.next_action || outcome.next_action, "Choose the route posture before the next room.").slice(0, 140),
    choices,
  };
}

export function buildDailyRiteRouteChoiceDigest({ outcomeDigest = null } = {}) {
  const windows = Array.isArray(outcomeDigest?.decision_windows) ? outcomeDigest.decision_windows : [];
  const prompts = windows.slice(0, 6).map((window) => buildDailyRiteRouteChoicePrompt({
    outcome: {
      wave: window.wave,
      segment_id: window.segment_id,
      segment_label: window.segment_label,
      reward_bias: window.reward_bias,
      next_action: window.next_action,
      rewards: {
        coins: window.kind === "cache_window" ? 40 : 0,
        heal: window.kind === "recovery_window" ? 4 : 0,
        prayer: 0,
        items: window.kind === "shrine_bargain" ? [{ id: "sunstone_shard", count: 1, label: "Sunstone Shard" }] : [],
      },
    },
    outcomeDigest,
  }));
  return {
    version: 1,
    token_cost: 0,
    prompt_count: prompts.length,
    recommended: prompts[0] || null,
    prompts,
  };
}
