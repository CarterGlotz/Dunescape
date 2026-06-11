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
    actions: [
      dailyRun.shareCard ? "copy_share" : null,
      dailyRun.shareCard ? "download_scroll" : null,
      dailyRun.shareCard ? "copy_challenge" : null,
    ].filter(Boolean),
    token_cost: 0,
  };
}
