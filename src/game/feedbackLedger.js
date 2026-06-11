const LEDGER_KEY = "solara_feedback_ledger";
const MAX_EVENTS = 80;

function readStorage() {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LEDGER_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cleanText(value, fallback = "") {
  return String(value || fallback).replace(/[<>`]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function recordFeedbackEvent(type, detail = {}) {
  if (typeof localStorage === "undefined") return null;
  const event = {
    type: cleanText(type, "event"),
    at: cleanText(detail.at || new Date().toISOString()),
    phase: cleanText(detail.phase, "unknown"),
    pressure: cleanText(detail.pressure, "unknown"),
    modifier: cleanText(detail.modifier, "unknown"),
    wave: Math.max(0, Math.min(30, Math.floor(Number(detail.wave || 0)))),
    outcome: cleanText(detail.outcome, ""),
    action_id: cleanText(detail.action_id || detail.actionId, ""),
    source: cleanText(detail.source, "unknown"),
    token_cost: 0,
  };
  const next = [...readStorage(), event].slice(-MAX_EVENTS);
  localStorage.setItem(LEDGER_KEY, JSON.stringify(next));
  return event;
}

export function loadFeedbackLedger() {
  return readStorage();
}

export function clearFeedbackLedger() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(LEDGER_KEY);
  }
}

export function getFeedbackNextActionDigest(summary = null) {
  const source = summary || { count: 0, counts: {} };
  const counts = source.counts || {};
  const starts = counts.daily_rite_start || 0;
  const ends = counts.daily_rite_end || 0;
  const shares = counts.share_copy || 0;
  const repairs = counts.save_import_repaired || 0;
  let id = "start_daily_rite";
  let label = "Start today's Daily Rite";
  let detail = "No local Daily Rite signal is recorded yet; the best next action is to enter the shared route.";
  let action = { type: "tab", tab: "daily", label: "Open Daily Rite" };

  if (starts > ends) {
    id = "finish_daily_rite";
    label = "Finish the active Daily Rite";
    detail = "A start is recorded without a matching end; complete or bank the run so the chronicle can learn from it.";
  } else if (ends > 0 && shares === 0) {
    id = "share_result";
    label = "Share a Last Light result";
    detail = "A run result exists locally, but no share signal has been recorded; copy a result card or challenge link.";
  } else if (repairs > 0) {
    id = "review_import_repairs";
    label = "Review repaired save imports";
    detail = "The import sanitizer repaired a save; check the recovered state before pushing deeper.";
    action = { type: "tab", tab: "settings", label: "Review Save Health" };
  } else if (source.count >= source.cap) {
    id = "ledger_cap_reached";
    label = "Sync or archive local signals";
    detail = "The capped local ledger is full; backend activation will turn these aggregate signals into better world tuning.";
    action = { type: "tab", tab: "settings", label: "Review Backend Link" };
  } else if (starts > 0 && ends > 0 && shares > 0) {
    id = "deepen_route";
    label = "Push a harder route segment";
    detail = "Start, finish, and share signals exist; the next useful signal is a deeper Director-pressure run.";
  }

  return {
    version: 1,
    id,
    label,
    detail: cleanText(detail),
    action,
    token_cost: 0,
  };
}

export function summarizeFeedbackLedger(events = readStorage()) {
  const counts = {};
  let lastEvent = null;
  for (const event of Array.isArray(events) ? events : []) {
    const type = cleanText(event?.type, "event");
    const actionId = cleanText(event?.action_id || event?.actionId, "");
    const source = cleanText(event?.source, "");
    counts[type] = (counts[type] || 0) + 1;
    const actionCounts = counts.by_action || {};
    const sourceCounts = counts.by_source || {};
    if (actionId) actionCounts[actionId] = (actionCounts[actionId] || 0) + 1;
    if (source) sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    counts.by_action = actionCounts;
    counts.by_source = sourceCounts;
    lastEvent = {
      type,
      at: cleanText(event?.at, ""),
      phase: cleanText(event?.phase, "unknown"),
      pressure: cleanText(event?.pressure, "unknown"),
      modifier: cleanText(event?.modifier, "unknown"),
      wave: Math.max(0, Math.min(30, Math.floor(Number(event?.wave || 0)))),
      outcome: cleanText(event?.outcome, ""),
      action_id: actionId,
      source,
    };
  }
  const actionCounts = counts.by_action || {};
  const sourceCounts = counts.by_source || {};
  const summary = {
    version: 1,
    privacy: "local public-safe aggregate events only; no raw save payloads, personal data, private notes, credentials, or cookies",
    count: Object.entries(counts).reduce((sum, [key, count]) => key.startsWith("by_") ? sum : sum + count, 0),
    counts,
    attribution: {
      top_action: Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      top_source: Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      action_counts: actionCounts,
      source_counts: sourceCounts,
      token_cost: 0,
    },
    lastEvent,
    cap: MAX_EVENTS,
    token_cost: 0,
  };
  summary.next_action = getFeedbackNextActionDigest(summary);
  return summary;
}
