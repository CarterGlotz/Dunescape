const skill = process.argv[2] || "unknown";

const profile = {
  skill,
  medium: "game",
  overlays: [],
  extraSignals: [],
  successBar: [
    "keep browser runtime token cost at zero",
    "preserve public-safe repo boundary",
    "keep Solara-owned naming and mythology",
  ],
  preHooks: [],
  promptOverlay: "Solara is a browser roguelite RPG. Prefer deterministic shared-world systems, visible player consequence, public-safe status contracts, and zero browser token cost.",
  axisWeightDeltas: skill === "audit"
    ? {
        gamification: 3,
        "UI / UX / user-experience": 2,
        "AI / intelligence integration": 1.5,
        "feature depth & refinement": 1.5,
      }
    : {},
};

console.log(JSON.stringify(profile, null, 2));
