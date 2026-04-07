export function safeNum(value, fallback, min = -Infinity, max = Infinity) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, n));
}

export function sanitizeText(value, maxLen, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }
  const clean = value.replace(/\s+/g, " ").trim().slice(0, maxLen);
  return clean || fallback;
}

export function createSaveSanitizer({ items, saveVersion }) {
  const sanitizeItemStack = (stack) => {
    if (!stack || typeof stack !== "object" || typeof stack.i !== "string" || !items[stack.i]) {
      return null;
    }
    return {
      i: stack.i,
      c: Math.max(1, Math.floor(safeNum(stack.c, 1, 1, 999999))),
    };
  };

  return function sanitizeSaveData(raw, fallbackName, fallbackSigil) {
    const issues = [];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {
        data: null,
        issues: ["Save was unreadable. Starting fresh."],
      };
    }

    const inv = (Array.isArray(raw.inv) ? raw.inv : []).map(sanitizeItemStack).filter(Boolean).slice(0, 64);
    const bank = (Array.isArray(raw.bank) ? raw.bank : []).map(sanitizeItemStack).filter(Boolean).slice(0, 512);
    const gear = raw.eq && typeof raw.eq === "object" && !Array.isArray(raw.eq) ? raw.eq : {};
    const rep = raw.rep && typeof raw.rep === "object" && !Array.isArray(raw.rep) ? raw.rep : {};
    const rogueliteStats =
      raw.rogueliteStats && typeof raw.rogueliteStats === "object" && !Array.isArray(raw.rogueliteStats)
        ? raw.rogueliteStats
        : {};
    const sanitized = {
      ver: safeNum(raw.ver, saveVersion, 1, saveVersion),
      sk: raw.sk && typeof raw.sk === "object" && !Array.isArray(raw.sk) ? raw.sk : {},
      inv,
      eq: {
        weapon: typeof gear.weapon === "string" && items[gear.weapon] ? gear.weapon : null,
        shield: typeof gear.shield === "string" && items[gear.shield] ? gear.shield : null,
        head: typeof gear.head === "string" && items[gear.head] ? gear.head : null,
        body: typeof gear.body === "string" && items[gear.body] ? gear.body : null,
        legs: typeof gear.legs === "string" && items[gear.legs] ? gear.legs : null,
        ring: typeof gear.ring === "string" && items[gear.ring] ? gear.ring : null,
        cape: typeof gear.cape === "string" && items[gear.cape] ? gear.cape : null,
      },
      bank,
      hp: safeNum(raw.hp, 10, 1, 9999),
      mhp: safeNum(raw.mhp, 10, 1, 9999),
      prayer: safeNum(raw.prayer, 1, 0, 9999),
      maxPrayer: safeNum(raw.maxPrayer, 1, 0, 9999),
      quests: raw.quests && typeof raw.quests === "object" && !Array.isArray(raw.quests) ? raw.quests : {},
      desertKills: safeNum(raw.desertKills, 0, 0, 999999),
      goblinKills: safeNum(raw.goblinKills, 0, 0, 999999),
      totalXp: safeNum(raw.totalXp, 0, 0, 999999999),
      x: safeNum(raw.x, 20, 0, 99),
      y: safeNum(raw.y, 28, 0, 99),
      runE: safeNum(raw.runE, 100, 0, 100),
      achievements: Array.isArray(raw.achievements) ? raw.achievements.filter((v) => typeof v === "string").slice(0, 256) : [],
      autoRetaliate: raw.autoRetaliate !== false,
      slayerTask: raw.slayerTask && typeof raw.slayerTask === "object" ? raw.slayerTask : null,
      haunted: safeNum(raw.haunted, 0, 0, 999999),
      jogreKills: safeNum(raw.jogreKills, 0, 0, 999999),
      demonKills: safeNum(raw.demonKills, 0, 0, 999999),
      jadKills: safeNum(raw.jadKills, 0, 0, 999999),
      relicParts: safeNum(raw.relicParts, 0, 0, 999999),
      buffs: raw.buffs && typeof raw.buffs === "object" && !Array.isArray(raw.buffs) ? raw.buffs : {},
      ironman: !!raw.ironman,
      visitedRegions: Array.isArray(raw.visitedRegions) ? raw.visitedRegions.filter((v) => typeof v === "string").slice(0, 256) : [],
      cookCount: safeNum(raw.cookCount, 0, 0, 999999),
      activePrayers: Array.isArray(raw.activePrayers) ? raw.activePrayers.filter((v) => typeof v === "string").slice(0, 32) : [],
      shipmentFish: safeNum(raw.shipmentFish, 0, 0, 999999),
      iceWarriorKills: safeNum(raw.iceWarriorKills, 0, 0, 999999),
      monsterKills: raw.monsterKills && typeof raw.monsterKills === "object" && !Array.isArray(raw.monsterKills) ? raw.monsterKills : {},
      pet: typeof raw.pet === "string" && items[raw.pet] ? raw.pet : null,
      questPoints: safeNum(raw.questPoints, 0, 0, 999999),
      unlocks: Array.isArray(raw.unlocks) ? raw.unlocks.filter((v) => typeof v === "string").slice(0, 64) : [],
      rep: {
        guard: safeNum(rep.guard, 0, -999999, 999999),
        merchant: safeNum(rep.merchant, 0, -999999, 999999),
        bandit: safeNum(rep.bandit, 0, -999999, 999999),
      },
      lastFireTile: raw.lastFireTile && typeof raw.lastFireTile === "object" ? raw.lastFireTile : null,
      prestige: raw.prestige && typeof raw.prestige === "object" && !Array.isArray(raw.prestige) ? raw.prestige : {},
      farmPatches: Array.isArray(raw.farmPatches) ? raw.farmPatches.filter((v) => v && typeof v === "object").slice(0, 64) : [],
      playerName: sanitizeText(raw.playerName, 16, fallbackName),
      travelerSigil: sanitizeText(raw.travelerSigil, 24, fallbackSigil),
      camp: raw.camp && typeof raw.camp === "object" ? raw.camp : null,
      campBank: (Array.isArray(raw.campBank) ? raw.campBank : []).map(sanitizeItemStack).filter(Boolean).slice(0, 128),
      appearance: raw.appearance && typeof raw.appearance === "object" && !Array.isArray(raw.appearance) ? raw.appearance : { skin: "#f0d8a0", hair: "#333", outfit: "#2266cc" },
      codex: Array.isArray(raw.codex) ? raw.codex.filter((v) => typeof v === "string").slice(0, 256) : [],
      sideQuests: Array.isArray(raw.sideQuests) ? raw.sideQuests.filter((v) => v && typeof v === "object").slice(0, 128) : [],
      dailyChallengeProgress: safeNum(raw.dailyChallengeProgress, 0, 0, 999999),
      rogueliteStats: {
        bestWave: safeNum(rogueliteStats.bestWave, 0, 0, 999999),
        totalRuns: safeNum(rogueliteStats.totalRuns, 0, 0, 999999),
        relics: Array.isArray(rogueliteStats.relics)
          ? rogueliteStats.relics.filter((v) => typeof v === "string").slice(0, 64)
          : [],
      },
    };

    if (sanitized.hp > sanitized.mhp) {
      sanitized.hp = sanitized.mhp;
      issues.push("Current HP was above max HP and was repaired.");
    }
    if (sanitized.prayer > sanitized.maxPrayer) {
      sanitized.prayer = sanitized.maxPrayer;
      issues.push("Prayer points were above max and were repaired.");
    }
    if (inv.length !== (Array.isArray(raw.inv) ? raw.inv.length : 0)) {
      issues.push("Some invalid inventory entries were discarded.");
    }
    if (bank.length !== (Array.isArray(raw.bank) ? raw.bank.length : 0)) {
      issues.push("Some invalid bank entries were discarded.");
    }

    return { data: sanitized, issues };
  };
}
