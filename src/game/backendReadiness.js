export const BACKEND_READINESS_VERSION = 1;
export const SUPABASE_HARDENING_GATE = "PG_CONNECTION_SOLARA";

export function buildBackendReadiness({
  backendConnected = false,
  hardenedRpcDeployed = false,
  requiredSecretsPresent = false,
  missingSecrets = [],
} = {}) {
  const missing = Array.isArray(missingSecrets) ? missingSecrets.filter(Boolean) : [];
  const live = !!backendConnected;
  const hardened = live && !!hardenedRpcDeployed;
  const mode = hardened ? "hardened-live" : live ? "live-read-table-fallback" : "local-only";

  return {
    version: BACKEND_READINESS_VERSION,
    mode,
    public_writes: hardened ? "rpc-enforced" : live ? "client-sanitized-with-table-fallback" : "local-only",
    player_copy: hardened
      ? "Live world writes are enforced by RPC and RLS."
      : live
        ? "Live reads are available; public writes still rely on staged fallback until hardening is deployed."
        : "The game is fully playable locally; public world writes wait for backend activation.",
    safe_to_scale_public_traffic: hardened,
    required_next_action: hardened
      ? "Monitor public-write health."
      : requiredSecretsPresent
        ? "Run the Supabase Hardening workflow and verify RPC enforcement."
        : `Add ${SUPABASE_HARDENING_GATE}, then run the Supabase Hardening workflow.`,
    missing_secret_labels: missing,
  };
}
