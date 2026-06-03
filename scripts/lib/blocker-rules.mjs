const RULES = [
  {
    category: "billing-or-provider-signup",
    pattern: /\b(billing|payment confirmation|provider signup|account creation|dashboard signup|hardware key|yubikey|fido)\b/i,
    attemptable: false,
    signupUiOnly: true,
    elevatedProbe: "Owner-only provider step; verify no existing capability is already ready before keeping blocked.",
    capabilities: [],
    probeCommands: [],
  },
  {
    category: "supabase-database-credential",
    pattern: /\b(supabase_db_url|database_url|postgres|db url|rls|rpc|supabase hardening|psql)\b/i,
    attemptable: true,
    signupUiOnly: false,
    elevatedProbe: "Check secrets inventory for a deploy-capable database URL, then run verification before labeling human-blocked.",
    capabilities: ["supabase.db"],
    probeCommands: [
      "node scripts/check-secrets.mjs --for supabase.db",
      "npm run verify:supabase",
    ],
  },
  {
    category: "deployment",
    pattern: /\b(deploy|workflow|github action|pages|vercel|cloudflare|wrangler)\b/i,
    attemptable: true,
    signupUiOnly: false,
    elevatedProbe: "Run the scripted workflow/deploy path when credentials are ready.",
    capabilities: ["github.actions"],
    probeCommands: ["node scripts/check-secrets.mjs --for github.actions"],
  },
  {
    category: "secret-or-capability",
    pattern: /\b(secret|credential|api key|access token|auth token|pat|key missing|missing .*key)\b/i,
    attemptable: true,
    signupUiOnly: false,
    elevatedProbe: "Resolve the named capability through the secrets gateway before asking the founder.",
    capabilities: [],
    probeCommands: ["node scripts/check-secrets.mjs --audit"],
  },
  {
    category: "scripted-migration",
    pattern: /\b(migration|migrate|apply sql|sql apply|schema)\b/i,
    attemptable: true,
    signupUiOnly: false,
    elevatedProbe: "Run dry checks first, then apply with the canonical script if credentials are ready.",
    capabilities: [],
    probeCommands: [],
  },
];

export function classifyBlocker(text = "") {
  const value = String(text || "");
  const match = RULES.find((rule) => rule.pattern.test(value));
  if (match) {
    return {
      category: match.category,
      attemptable: match.attemptable,
      signupUiOnly: match.signupUiOnly,
      elevatedProbe: match.elevatedProbe,
      capabilities: match.capabilities,
      probeCommands: match.probeCommands,
    };
  }

  return {
    category: "general",
    attemptable: true,
    signupUiOnly: false,
    elevatedProbe: "Try the smallest safe scripted probe, then record evidence before escalating.",
    capabilities: [],
    probeCommands: [],
  };
}

export function summarizeAttemptOrder(text = "") {
  const info = classifyBlocker(text);
  const steps = ["Run secrets discovery for the mapped capability or audit surface."];
  if (info.probeCommands.length > 0) {
    steps.push(`Run probe: ${info.probeCommands[0]}`);
  } else {
    steps.push("Run the safest read-only/admin probe available for this surface.");
  }
  steps.push(info.attemptable ? "If credentials are ready, execute the scripted agent path." : "If no agent path exists, keep the item as owner-only with evidence.");
  steps.push("Only label Human Action Required after the evidence above is recorded.");
  return steps;
}
