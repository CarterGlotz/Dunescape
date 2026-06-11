function clean(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

function riskScore(segment = {}) {
  const danger = segment.danger === "severe" ? 4 : segment.danger === "high" ? 3 : segment.danger === "moderate" ? 2 : 1;
  const rival = Number(segment.rivalChance || 0) >= 0.5 ? 2 : Number(segment.rivalChance || 0) >= 0.25 ? 1 : 0;
  const shrine = Number(segment.shrineChance || 0) >= 0.34 ? -1 : 0;
  return Math.max(1, Math.min(5, danger + rival + shrine));
}

function stakeForSegment(segment = {}, index = 0) {
  const risk = riskScore(segment);
  const reward = clean(segment.rewardTell || segment.reward || "light", "light");
  const goal = clean(segment.goal, "Push the rite forward.");
  const label = clean(segment.label, `Segment ${index + 1}`);
  const encounter = clean(segment.encounterLabel || segment.encounter, "route pressure");
  const pledge = risk >= 4
    ? "Spend supplies before pride spends them for you."
    : risk >= 3
      ? "Take one clean reward, then reset tempo."
      : "Bank light efficiently and preserve options.";

  return {
    id: clean(segment.id, `segment_${index + 1}`),
    label,
    encounter,
    reward,
    risk,
    goal,
    pledge,
    consequence: `${label} can turn ${encounter} into ${reward}; ${pledge}`,
  };
}

export function buildDailyRiteStakes({ dailyRitePlan = null } = {}) {
  const route = Array.isArray(dailyRitePlan?.route) && dailyRitePlan.route.length ? dailyRitePlan.route : [];
  const segments = route.map(stakeForSegment);
  const highestRisk = segments.reduce((max, segment) => Math.max(max, segment.risk), 0);
  const primary = segments.find((segment) => segment.risk === highestRisk) || segments[0] || null;
  const totalRisk = segments.reduce((sum, segment) => sum + segment.risk, 0);

  return {
    version: 1,
    segment_count: segments.length,
    highest_risk: highestRisk,
    total_risk: totalRisk,
    primary_stake: primary,
    segments,
    summary: primary
      ? `${clean(dailyRitePlan?.label, "Daily Rite")} stakes: ${primary.label} is the pressure point; ${primary.pledge}`
      : "Daily Rite stakes are waiting for today's route plan.",
    token_cost: 0,
  };
}
