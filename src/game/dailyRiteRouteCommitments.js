function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function clampInt(value, min, max, fallback = min) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function cleanId(value, fallback = "choice") {
  return cleanText(value, fallback).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48);
}

function normalizeChoice(choice = null) {
  if (!choice) return null;
  return {
    id: cleanId(choice.id),
    label: cleanText(choice.label, "Choose route").slice(0, 64),
    detail: cleanText(choice.detail, "").slice(0, 140),
    payoff: cleanText(choice.payoff, "").slice(0, 120),
    cost: cleanText(choice.cost, "").slice(0, 100),
    token_cost: 0,
  };
}

function commitmentEffect(choice = {}, prompt = {}) {
  const id = choice.id || "choice";
  if (id.includes("stabilize") || id.includes("bank") || id.includes("hold")) {
    return {
      posture: "survival",
      next_room_bias: "safer entry and supply preservation",
      risk_delta: -1,
      reward_delta: 0,
    };
  }
  if (id.includes("spend") || id.includes("trade") || id.includes("push") || id.includes("tempo")) {
    return {
      posture: "tempo",
      next_room_bias: "faster clear pressure with less recovery slack",
      risk_delta: 1,
      reward_delta: 1,
    };
  }
  if (id.includes("oath") || id.includes("fish")) {
    return {
      posture: "long_game",
      next_room_bias: "higher variance route setup",
      risk_delta: 1,
      reward_delta: 2,
    };
  }
  return {
    posture: cleanText(prompt.kind, "balanced").slice(0, 32),
    next_room_bias: "balanced route pressure",
    risk_delta: 0,
    reward_delta: 0,
  };
}

export function buildDailyRiteRouteCommitment({ prompt = null, choiceId = null, wave = null, now = Date.now() } = {}) {
  const choices = Array.isArray(prompt?.choices) ? prompt.choices.map(normalizeChoice).filter(Boolean) : [];
  const safeChoiceId = cleanId(choiceId || prompt?.recommended_choice_id, "");
  const recommendedId = cleanId(prompt?.recommended_choice_id, "");
  const selected = choices.find((choice) => choice.id === safeChoiceId)
    || choices.find((choice) => choice.id === recommendedId)
    || choices[0]
    || null;

  if (!prompt || !selected) {
    return {
      version: 1,
      token_cost: 0,
      committed: false,
      wave: clampInt(wave ?? prompt?.wave, 0, 30, 0),
      segment_id: null,
      choice: null,
      effect: commitmentEffect(),
      receipt: "Route choice waiting for a valid Daily Rite prompt.",
      feedback_event: null,
    };
  }

  const safeWave = clampInt(wave ?? prompt.wave, 0, 30, 0);
  const effect = commitmentEffect(selected, prompt);
  const segmentId = cleanId(prompt.segment_id, "unknown");
  const headline = cleanText(prompt.headline, "Route choice opened").slice(0, 80);
  return {
    version: 1,
    token_cost: 0,
    committed: true,
    committed_at: new Date(now).toISOString(),
    wave: safeWave,
    segment_id: segmentId,
    kind: cleanText(prompt.kind, "tempo_window").slice(0, 48),
    headline,
    choice: selected,
    effect,
    receipt: `${headline}: ${selected.label} committed for the next room.`,
    feedback_event: {
      type: "daily_rite_route_choice",
      wave: safeWave,
      outcome: selected.id,
      action_id: `daily_rite_choice_${segmentId}`,
      source: "daily_rite_status",
      route_choice_id: selected.id,
      posture: effect.posture,
      token_cost: 0,
    },
  };
}

export function applyDailyRiteRouteCommitment({ run = null, choiceId = null, now = Date.now() } = {}) {
  const commitment = buildDailyRiteRouteCommitment({
    prompt: run?.latestRouteChoice,
    choiceId,
    wave: run?.wave,
    now,
  });
  if (run && commitment.committed) {
    run.routeChoiceCommitment = commitment;
    run.routeChoiceHistory = Array.isArray(run.routeChoiceHistory) ? run.routeChoiceHistory : [];
    run.routeChoiceHistory.push(commitment);
  }
  return commitment;
}
