export const MENU_SECTIONS = [
  { id: "play", label: "Play" },
  { id: "how", label: "How To Play" },
  { id: "knowledge", label: "Knowledge Base" },
  { id: "features", label: "Features" },
  { id: "updates", label: "Update Log" },
  { id: "settings", label: "Settings" },
];

export const KNOWLEDGE_BASE = [
  {
    title: "The Shared Sun",
    body: "Every recorded death dims the communal sun. The Sun Director turns that pressure into enemy behavior, merchant pressure, rituals, and daily modifiers.",
  },
  {
    title: "Daily Rites",
    body: "One seeded dungeon per day for everyone. The same date produces the same challenge, which is why the leaderboard and comparisons matter.",
  },
  {
    title: "Living Graves",
    body: "When a player falls, their grave is meant to persist on the world map. Offerings can turn those graves into shrines.",
  },
  {
    title: "Roguelite Legacy",
    body: "Roguelite runs are personal, but their best stories should still echo back into the shared world through records, relics, and eventually ghosts.",
  },
];

export const FEATURE_PILLARS = [
  {
    title: "Front Door",
    body: "A real title/menu flow with play, onboarding, settings, codex, and patch notes instead of throwing the player straight into the runtime.",
  },
  {
    title: "Identity",
    body: "A persistent traveler name and sigil so asynchronous world events feel like they came from real people rather than anonymous save files.",
  },
  {
    title: "Shared World",
    body: "Daily scores, graves, shrines, sun-state, and echoes create multiplayer feeling without requiring synchronous combat netcode.",
  },
  {
    title: "Ghost Echoes",
    body: "Runs and deaths can leave behind readable traces for the next players, building communal memory rather than isolated sessions.",
  },
  {
    title: "Sun Crisis Director",
    body: "The world now surfaces pressure state, daily modifiers, faction objectives, ritual status, grave constellations, rival echoes, and prophecy cards.",
  },
  {
    title: "First Route",
    body: "The opening path now points new travelers from gear to Mara's Hearth to the Daily Rite so the first session reaches a real shared-world payoff.",
  },
];

export const UPDATE_LOG_ITEMS = [
  {
    date: "2026-04-07",
    title: "Shared-World Innovation Pass",
    notes: [
      "Added ritual progress, grave constellation summaries, prophecy deck surfacing, and crisis directives.",
      "Added echo rival encounters and death-memory chronicle cards tied to grave outcomes.",
      "Extended shared-world logic into tested modules instead of leaving all feature glue inside the main app file.",
    ],
  },
  {
    date: "2026-03-31",
    title: "Studio Front Door + Shared World Pass",
    notes: [
      "Added a full title/menu layer with play, codex, features, update log, and settings views.",
      "Added persistent traveler identity and starter-loadout assist.",
      "Added async player echoes with offline fallback and Supabase-ready hooks.",
    ],
  },
  {
    date: "2026-03-31",
    title: "Runtime Playability Rehab",
    notes: [
      "Gameplay canvas now uses the full viewport.",
      "Utility panel can be collapsed with Tab / ☰.",
      "Quickstart overlay now explains controls and first actions.",
    ],
  },
  {
    date: "2026-03-30",
    title: "Boot Reliability",
    notes: [
      "Fixed startup-order crash.",
      "Added repo-native smoke coverage for mount/startup flow.",
    ],
  },
];

export const HOW_TO_PLAY_STEPS = [
  "Move with WASD / arrows or by left-clicking a destination.",
  "Left-click NPCs, monsters, trees, rocks, and doors to interact.",
  "Right-click for context actions and extra info.",
  "Use the Daily tab for the async communal challenge and the Quest tab for local progression.",
  "Deaths, graves, offerings, and the sun are meant to be shared-world systems once Supabase is live.",
];
