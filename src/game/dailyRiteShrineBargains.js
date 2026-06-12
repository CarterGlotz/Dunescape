function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function clampInt(value, min, max, fallback = min) {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function cleanId(value, fallback = "bargain") {
  return cleanText(value, fallback).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48);
}

function bargainForChoice(choiceId) {
  if (choiceId.includes("spend")) {
    return {
      posture: "spent",
      label: "Spend it now",
      effect_line: "The shard is burned into immediate route relief.",
      shard_delta: -1,
      item_delta: 0,
      relief_delta: 2,
      oath_delta: 0,
      reward_delta: 0,
    };
  }
  if (choiceId.includes("oath") || choiceId.includes("press")) {
    return {
      posture: "oath",
      label: "Press the oath",
      effect_line: "The shard is carried forward as a sharper vow.",
      shard_delta: 0,
      item_delta: 0,
      relief_delta: -1,
      oath_delta: 2,
      reward_delta: 2,
    };
  }
  return {
    posture: "banked",
    label: "Bank the shard",
    effect_line: "The shard is protected for later shrine offerings.",
    shard_delta: 1,
    item_delta: 1,
    relief_delta: 0,
    oath_delta: 0,
    reward_delta: 0,
  };
}

export function buildDailyRiteShrineBargain({ commitment = null, outcome = null } = {}) {
  const kind = cleanText(commitment?.kind, "");
  const choiceId = cleanId(commitment?.choice?.id, "bank_shard");
  const shrineLike = kind === "shrine_bargain"
    || /shrine|sunstone/i.test(cleanText(commitment?.headline, ""))
    || /bank_shard|spend_shard|press_oath/.test(choiceId);
  if (!commitment || !shrineLike) {
    return null;
  }

  const profile = bargainForChoice(choiceId);
  const wave = clampInt(outcome?.wave ?? commitment.wave, 0, 30, 0);
  const segmentId = cleanId(outcome?.segment_id || commitment.segment_id, "unknown");
  const choiceLabel = cleanText(commitment.choice?.label || profile.label, profile.label).slice(0, 64);
  const segmentLabel = cleanText(outcome?.segment_label, `Wave ${wave + 1}`).slice(0, 80);

  return {
    version: 1,
    token_cost: 0,
    applied: true,
    wave,
    segment_id: segmentId,
    segment_label: segmentLabel,
    choice_id: choiceId,
    choice_label: choiceLabel,
    posture: profile.posture,
    shard_delta: profile.shard_delta,
    economy: {
      version: 1,
      token_cost: 0,
      item_id: "sunstone_shard",
      item_delta: profile.item_delta,
      offering_credit: profile.posture === "banked" ? 1 : 0,
      relief_credit: Math.max(0, profile.relief_delta),
      oath_charge: Math.max(0, profile.oath_delta),
      reward_credit: Math.max(0, profile.reward_delta),
      summary:
        profile.posture === "spent"
          ? "Sunstone Shard burned for immediate relief."
          : profile.posture === "oath"
            ? "Sunstone Shard pledged into an oath charge instead of inventory."
            : "Sunstone Shard banked for a later grave or shrine offering.",
    },
    relief_delta: profile.relief_delta,
    oath_delta: profile.oath_delta,
    reward_delta: profile.reward_delta,
    effect_line: profile.effect_line,
    receipt: `${choiceLabel}: ${profile.effect_line}`,
    next_action:
      profile.posture === "spent"
        ? "Use the relief before the next pressure spike."
        : profile.posture === "oath"
          ? "Survive the oath route to turn danger into a stronger Last Light card."
          : "Carry the protected shard toward the next shrine offering.",
  };
}

export function applyShrineBargainToOutcome(outcome = {}, bargain = null) {
  if (outcome?.shrine_bargain?.applied) return outcome;
  let inferredBargain = bargain?.applied ? bargain : null;
  const choiceId = cleanId(outcome.route_choice_adjustment?.choice_id, "");
  const isShrineOutcome = /sunstone|shrine/i.test(`${outcome.reward_bias || ""} ${outcome.shrine_bargain_hint || ""}`);
  const isShrineChoice = /bank_shard|spend_shard|press_oath/.test(choiceId);
  if (!inferredBargain && isShrineOutcome && isShrineChoice) {
    inferredBargain = buildDailyRiteShrineBargain({
      commitment: {
        committed: true,
        wave: outcome.wave,
        segment_id: outcome.segment_id,
        kind: "shrine_bargain",
        headline: "Shrine bargain opened",
        choice: {
          id: outcome.route_choice_adjustment.choice_id,
          label: outcome.route_choice_adjustment.choice_label,
        },
      },
      outcome,
    });
  }
  if (!inferredBargain?.applied) return outcome;
  const rewards = outcome.rewards || {};
  const items = Array.isArray(rewards.items) ? rewards.items : [];
  const nonShardItems = items.filter((item) => cleanId(item?.id, "") !== "sunstone_shard");
  const nextItems = inferredBargain.economy?.item_delta > 0
    ? [...nonShardItems, { id: "sunstone_shard", count: inferredBargain.economy.item_delta, label: "Sunstone Shard" }]
    : nonShardItems;
  const reliefHeal = Math.max(0, Number(inferredBargain.relief_delta || 0)) * 2;
  const reliefPrayer = Math.max(0, Number(inferredBargain.relief_delta || 0));
  const oathReward = Math.max(0, Number(inferredBargain.reward_delta || 0));

  return {
    ...outcome,
    rewards: {
      ...rewards,
      coins: Math.max(0, Math.min(9999, Math.floor(Number(rewards.coins || 0) + oathReward * 8))),
      heal: Math.max(0, Math.min(999, Math.floor(Number(rewards.heal || 0) + reliefHeal))),
      prayer: Math.max(0, Math.min(999, Math.floor(Number(rewards.prayer || 0) + reliefPrayer))),
      items: nextItems,
    },
    shrine_bargain: inferredBargain,
    receipt: `${cleanText(outcome.receipt, "Daily Rite clear recorded.")} ${inferredBargain.receipt}`,
    next_action: `${inferredBargain.next_action} ${cleanText(outcome.next_action, "Preserve the route result.")}`,
  };
}

export function buildDailyRiteShrineBargainDigest({ routeChoiceDigest = null } = {}) {
  const prompts = Array.isArray(routeChoiceDigest?.prompts) ? routeChoiceDigest.prompts : [];
  const bargains = prompts
    .filter((prompt) => prompt?.kind === "shrine_bargain")
    .slice(0, 6)
    .map((prompt, index) => ({
      version: 1,
      token_cost: 0,
      id: `shrine_bargain_${index + 1}`,
      wave: clampInt(prompt.wave, 0, 30, 0),
      segment_id: cleanId(prompt.segment_id, "unknown"),
      segment_label: cleanText(prompt.segment_label, `Segment ${index + 1}`).slice(0, 80),
      recommended_choice_id: cleanId(prompt.recommended_choice_id, "bank_shard"),
      economy_preview: {
        version: 1,
        token_cost: 0,
        bank_shard: bargainForChoice("bank_shard").effect_line,
        spend_shard: bargainForChoice("spend_shard").effect_line,
        press_oath: bargainForChoice("press_oath").effect_line,
      },
      choices: Array.isArray(prompt.choices)
        ? prompt.choices.slice(0, 3).map((choice) => ({
          id: cleanId(choice.id, "choice"),
          label: cleanText(choice.label, "Choose bargain").slice(0, 64),
          payoff: cleanText(choice.payoff, "").slice(0, 120),
          cost: cleanText(choice.cost, "").slice(0, 100),
          token_cost: 0,
        }))
        : [],
    }));

  return {
    version: 1,
    token_cost: 0,
    bargain_count: bargains.length,
    recommended: bargains[0] || null,
    bargains,
  };
}
