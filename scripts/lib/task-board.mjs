const HUMAN_SECTION_RE = /^(human action required|blockers?|blocked)$/i;

function cleanLine(line) {
  return String(line || "").replace(/^\s*[-*]\s*/, "").trim();
}

export function parseHumanItems(markdown = "") {
  const lines = String(markdown || "").split(/\r?\n/);
  const items = [];
  let inHumanSection = false;
  let current = null;

  for (const raw of lines) {
    const heading = raw.match(/^##+\s+(.+?)\s*$/);
    if (heading) {
      inHumanSection = HUMAN_SECTION_RE.test(heading[1].trim());
      current = null;
      continue;
    }

    const trimmed = cleanLine(raw);
    if (!trimmed) {
      current = null;
      continue;
    }

    const looksHuman =
      inHumanSection ||
      /\b(human action|required secret|missing secret|missing github secret|missing .*secret|founder action|blocked|signup required|billing|hardware key)\b/i.test(trimmed);

    if (!looksHuman || !/^\s*[-*]\s+/.test(raw)) {
      if (current && /^\s{2,}\S/.test(raw)) {
        current.description = `${current.description} ${trimmed}`.trim();
      }
      continue;
    }

    const [titlePart, ...descriptionParts] = trimmed.split(/\s+[-–:]\s+/);
    current = {
      title: titlePart.trim(),
      description: descriptionParts.join(" - ").trim(),
    };
    items.push(current);
  }

  return items;
}
