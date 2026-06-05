function hashSeed(value) {
  const text = String(value || "solara");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pick(list, seed, offset = 0) {
  if (!Array.isArray(list) || !list.length) {
    return "";
  }
  return list[(seed + offset) % list.length];
}

function safeText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim();
}

const OPENERS = [
  "The chronicle remembers:",
  "So it is written in ash:",
  "The keepers of the light record:",
  "Under the watching sun:",
];

const PHASE_SCENES = {
  full_dawn: [
    "the sun stood full and generous, and the roads of Solara lay open.",
    "light pooled in the valleys, and even the graves seemed to rest easier.",
  ],
  amber_warning: [
    "an amber warning hung over the trade roads, and merchants counted their coin twice.",
    "the light thinned at the edges, and wise travelers banked their routes early.",
  ],
  twilight: [
    "the world walked in twilight, and grave clusters whispered to those who passed.",
    "half-light held the land, and every shrine flicker counted double in the telling.",
  ],
  dimming: [
    "the dimming pressed hard on the land, and offerings burned brighter for being needed.",
    "ash rode the wind, and the rituals of the faithful held the dark at bay.",
  ],
  eclipse: [
    "the eclipse swallowed the horizon, and only the stubborn carried light at all.",
    "the last light guttered, and every traveler who stood was counted a keeper of the flame.",
  ],
};

export function buildChronicleScenes({
  sharedWorld = {},
  dayNumber = 1,
  graveCount = 0,
  echoCount = 0,
  maxScenes = 5,
} = {}) {
  const day = Math.max(1, Math.floor(Number(dayNumber) || 1));
  const phaseId = sharedWorld?.phase?.id || "full_dawn";
  const seed = hashSeed(`scenes:${day}:${phaseId}`);
  const scenes = [];

  const ordinal = (n) => {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) return `${n}th`;
    const unit = n % 10;
    return `${n}${unit === 1 ? "st" : unit === 2 ? "nd" : unit === 3 ? "rd" : "th"}`;
  };
  const dayPhrase = day <= 366 ? `on the ${ordinal(day)} day of the season` : "deep into the long season";
  scenes.push(`${pick(OPENERS, seed)} ${dayPhrase}, ${pick(PHASE_SCENES[phaseId] || PHASE_SCENES.full_dawn, seed, 1)}`);

  if (sharedWorld?.crisis?.title) {
    scenes.push(`The Sun pressed its directive upon the land — ${safeText(sharedWorld.crisis.title)}. ${safeText(sharedWorld.crisis.detail).slice(0, 110)}`);
  }

  if (sharedWorld?.ritual?.label || sharedWorld?.ritual?.progress >= 0) {
    const progress = Number(sharedWorld?.ritual?.progress || 0);
    scenes.push(
      progress >= 1
        ? "A communal ritual reached completion, and the world softened in answer to the gathered offerings."
        : progress > 0.5
          ? "The communal ritual neared its crest; each offering now carried the weight of the whole."
          : "A new ritual gathered its first offerings, slow but unbroken, as rituals begin.",
    );
  }

  if (sharedWorld?.rival) {
    scenes.push(`A rival echo named ${safeText(sharedWorld.rival.playerName, "an unnamed traveler").slice(0, 16)} stalked the routes, waiting beyond the threshold of every rite.`);
  }

  if (sharedWorld?.constellations?.[0]?.name) {
    scenes.push(`The graves gathered into ${safeText(sharedWorld.constellations[0].name)}, and travelers routed their day around its pull.`);
  } else if (graveCount > 0) {
    scenes.push(`${graveCount} grave${graveCount === 1 ? "" : "s"} marked the season's cost, each one a name the sun must answer for.`);
  }

  if (echoCount > 0 && scenes.length < maxScenes) {
    scenes.push(`${echoCount} echo${echoCount === 1 ? "" : "es"} still rang in the air — warnings, boasts, and grief, all of it true somewhere.`);
  }

  return {
    version: 1,
    seed: `scenes:${day}:${phaseId}`,
    title: "The Myth So Far",
    scenes: scenes.slice(0, Math.max(3, Math.min(5, maxScenes))),
    determinism: "Composed from public chronicle state by seeded grammar. Zero token cost.",
  };
}
