export function classifyTurn({ prompt = "" } = {}) {
  const text = String(prompt || "").toLowerCase();
  const length = text.length;

  if (
    length < 1200 &&
    /\b(format|summari[sz]e|extract|convert|validate|lint|count|list|show|status)\b/.test(text) &&
    !/\b(architecture|strategy|audit|threat model|deep|complex|multi-step)\b/.test(text)
  ) {
    return { model: "haiku", confidence: 0.78, reason: "short-transform-or-lookup" };
  }

  if (
    length > 8000 ||
    /\b(audit|strategy|architecture|threat model|complex|multi-step|genius|innovative)\b/.test(text)
  ) {
    return { model: "opus", confidence: 0.72, reason: "deep-reasoning-signal" };
  }

  return { model: "sonnet", confidence: 0.66, reason: "default-builder-work" };
}
