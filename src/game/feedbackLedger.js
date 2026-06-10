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

export function summarizeFeedbackLedger(events = readStorage()) {
  const counts = {};
  let lastEvent = null;
  for (const event of Array.isArray(events) ? events : []) {
    const type = cleanText(event?.type, "event");
    counts[type] = (counts[type] || 0) + 1;
    lastEvent = {
      type,
      at: cleanText(event?.at, ""),
      phase: cleanText(event?.phase, "unknown"),
      pressure: cleanText(event?.pressure, "unknown"),
      modifier: cleanText(event?.modifier, "unknown"),
      wave: Math.max(0, Math.min(30, Math.floor(Number(event?.wave || 0)))),
      outcome: cleanText(event?.outcome, ""),
    };
  }
  return {
    version: 1,
    privacy: "local public-safe aggregate events only; no raw save payloads, personal data, private notes, credentials, or cookies",
    count: Object.values(counts).reduce((sum, count) => sum + count, 0),
    counts,
    lastEvent,
    cap: MAX_EVENTS,
    token_cost: 0,
  };
}
