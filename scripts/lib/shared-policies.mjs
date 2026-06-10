/**
 * shared-policies.mjs — shared constants used by copied Studio OS protocol
 * scripts. Keep this file small in public repos; source-of-truth evolution
 * happens in studio-ops propagation.
 */

export const BLOCKED_STATUSES_CORE = [
  "human-blocked",
  "cross-repo-locked",
  "externally-blocked",
  "blocked-on-hub",
];
