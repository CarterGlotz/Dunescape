export const SHARED_WORLD_TABLES = [
  "daily_scores",
  "graves",
  "sun_state",
  "player_echoes",
];

export const SUPABASE_HARDENING_GATE = "PG_CONNECTION_SOLARA";

export const SHARED_WORLD_RPC_CONTRACTS = [
  {
    name: "submit_daily_score",
    kind: "daily_score",
    args: { payload: { player_name: "", wave_reached: -1, faction: "invalid", date_seed: "__verify__", season: 1 } },
    expectedExistingMessage: /invalid|wave|faction|permission|violates|row-level|date/i,
  },
  {
    name: "submit_grave",
    kind: "grave",
    args: { payload: { player_name: "", epitaph: "", x: -1, y: 999, wave_reached: -1, faction: "invalid", traveler_sigil: "VERIFY", season: 1, date_seed: "__verify__" } },
    expectedExistingMessage: /invalid|grave|permission|violates|row-level|coordinate|faction/i,
  },
  {
    name: "submit_player_echo",
    kind: "echo",
    args: { payload: { player_name: "", traveler_sigil: "VERIFY", kind: "invalid", headline: "", summary: "", wave_reached: -1, faction: "invalid", season: 1, date_seed: "__verify__" } },
    expectedExistingMessage: /invalid|echo|permission|violates|row-level|kind|faction/i,
  },
  {
    name: "react_to_echo",
    kind: "reaction",
    args: { p_echo_id: "__verify_no_row__", p_reaction: "__invalid__" },
    expectedExistingMessage: /Invalid echo reaction|invalid|reaction/i,
  },
  {
    name: "offer_sunstone",
    kind: "offering",
    args: { p_grave_id: "__verify_no_row__", p_traveler_sigil: "VERIFY" },
    expectedExistingMessage: /Grave not found|invalid input|invalid|grave/i,
  },
];

export function getBackendContractSummary() {
  return {
    version: 1,
    tables: SHARED_WORLD_TABLES,
    required_rpcs: SHARED_WORLD_RPC_CONTRACTS.map((contract) => ({
      name: contract.name,
      kind: contract.kind,
    })),
    queue_write_kinds: SHARED_WORLD_RPC_CONTRACTS.map((contract) => contract.kind),
    hardening_gate: SUPABASE_HARDENING_GATE,
    safe_to_scale_when: "all required_rpcs deployed and RLS/RPC validation active",
  };
}

export function getMissingQueueContracts(queueKinds = []) {
  const covered = new Set(SHARED_WORLD_RPC_CONTRACTS.map((contract) => contract.kind));
  return queueKinds.filter((kind) => !covered.has(kind));
}
