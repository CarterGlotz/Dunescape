import { readJson, writeJson } from "./clientStore.js";
import {
  sanitizeDailyScorePayload,
  sanitizeEchoPayload,
  sanitizeGravePayload,
  sanitizeReaction,
} from "./trust.js";

const QUEUE_KEY = "solara_sundial_queue";
const QUEUE_CAP = 50;
const QUEUE_KINDS = ["grave", "daily_score", "echo", "reaction", "offering"];

function sanitizeQueueEntry(entry) {
  if (!entry || typeof entry !== "object" || !QUEUE_KINDS.includes(entry.kind)) {
    return null;
  }
  let payload = null;
  if (entry.kind === "grave") {
    payload = sanitizeGravePayload(entry.payload || {});
    payload.traveler_sigil = String(entry.payload?.traveler_sigil || "NO-SIGIL").slice(0, 12);
  } else if (entry.kind === "daily_score") {
    payload = sanitizeDailyScorePayload(entry.payload || {});
  } else if (entry.kind === "echo") {
    payload = sanitizeEchoPayload(entry.payload || {});
  } else if (entry.kind === "reaction") {
    const reaction = sanitizeReaction(entry.payload?.reaction);
    const echoId = String(entry.payload?.echoId || "").slice(0, 64);
    if (!reaction || !echoId || echoId.startsWith("echo-")) {
      return null;
    }
    payload = { echoId, reaction };
  } else if (entry.kind === "offering") {
    const graveId = String(entry.payload?.graveId || "").slice(0, 64);
    if (!graveId) {
      return null;
    }
    payload = {
      graveId,
      traveler_sigil: String(entry.payload?.traveler_sigil || "NO-SIGIL").slice(0, 12),
    };
  }
  if (!payload) {
    return null;
  }
  return {
    id: String(entry.id || "").slice(0, 64),
    kind: entry.kind,
    payload,
    dateSeed: String(entry.dateSeed || "").slice(0, 32),
    season: Math.max(1, Math.floor(Number(entry.season) || 1)),
    queuedAt: String(entry.queuedAt || "").slice(0, 32),
  };
}

function dedupeKey(entry) {
  if (entry.kind === "reaction") {
    return `reaction:${entry.payload.echoId}`;
  }
  if (entry.kind === "daily_score") {
    return `daily_score:${entry.dateSeed}:${entry.payload.player_name}`;
  }
  return `${entry.kind}:${entry.id}`;
}

export function loadSundialQueue() {
  const raw = readJson(QUEUE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(sanitizeQueueEntry).filter(Boolean).slice(0, QUEUE_CAP);
}

export function clearSundialQueue() {
  writeJson(QUEUE_KEY, []);
  return [];
}

export function enqueueSundialWrite({ kind, payload, dateSeed = "", season = 1, id = null, queuedAt = "" } = {}) {
  const entry = sanitizeQueueEntry({
    id: id || `${kind}-${dateSeed}-${hashLite(JSON.stringify(payload || {}))}`,
    kind,
    payload,
    dateSeed,
    season,
    queuedAt,
  });
  if (!entry) {
    return { queued: false, reason: "invalid_entry", size: loadSundialQueue().length };
  }
  const queue = loadSundialQueue();
  const key = dedupeKey(entry);
  if (queue.some((existing) => dedupeKey(existing) === key)) {
    return { queued: false, reason: "duplicate", size: queue.length };
  }
  if (queue.length >= QUEUE_CAP) {
    return { queued: false, reason: "queue_full", size: queue.length };
  }
  const next = [...queue, entry];
  writeJson(QUEUE_KEY, next);
  return {
    queued: true,
    reason: null,
    id: entry.id,
    position: next.length,
    size: next.length,
    receipt: `Sealed in the Sundial Queue — your ${entry.kind.replace("_", " ")} will join the chronicle when the link returns.`,
  };
}

function hashLite(text) {
  let hash = 2166136261;
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function getSundialQueueSummary(queue = null) {
  const entries = queue || loadSundialQueue();
  const counts = entries.reduce((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] || 0) + 1;
    return acc;
  }, {});
  return {
    size: entries.length,
    cap: QUEUE_CAP,
    counts,
    line: entries.length
      ? `${entries.length} sealed record${entries.length === 1 ? "" : "s"} await the sun's return.`
      : "The Sundial Queue is empty.",
  };
}

export async function flushSundialQueue({ supabase, services = {} } = {}) {
  if (!supabase) {
    return { flushed: 0, remaining: loadSundialQueue().length, receipts: [] };
  }
  const queue = loadSundialQueue();
  if (!queue.length) {
    return { flushed: 0, remaining: 0, receipts: [] };
  }
  const remaining = [];
  const receipts = [];
  for (const entry of queue) {
    let ok = false;
    try {
      if (entry.kind === "grave" && services.submitGraveRecord) {
        ok = await services.submitGraveRecord({ supabase, grave: entry.payload, season: entry.season, dateSeed: entry.dateSeed });
      } else if (entry.kind === "daily_score" && services.submitDailyScoreRecord) {
        ok = await services.submitDailyScoreRecord({
          supabase,
          playerName: entry.payload.player_name,
          waveReached: entry.payload.wave_reached,
          faction: entry.payload.faction,
          dateSeed: entry.dateSeed,
          season: entry.season,
        });
      } else if (entry.kind === "echo" && services.submitRemoteEcho) {
        ok = await services.submitRemoteEcho({ supabase, echo: entry.payload, season: entry.season, dateSeed: entry.dateSeed });
      } else if (entry.kind === "reaction" && services.reactToEchoRecord) {
        const result = await services.reactToEchoRecord({ supabase, echoId: entry.payload.echoId, reaction: entry.payload.reaction });
        ok = !!result;
      } else if (entry.kind === "offering" && services.offerSunstoneRecord) {
        const result = await services.offerSunstoneRecord({
          supabase,
          grave: { id: entry.payload.graveId, traveler_sigil: entry.payload.traveler_sigil },
        });
        ok = !!result;
      }
    } catch {
      ok = false;
    }
    if (ok) {
      receipts.push({ id: entry.id, kind: entry.kind, status: "synced" });
    } else {
      remaining.push(entry);
    }
  }
  writeJson(QUEUE_KEY, remaining);
  return {
    flushed: receipts.length,
    remaining: remaining.length,
    receipts,
    line: receipts.length
      ? `${receipts.length} sealed record${receipts.length === 1 ? "" : "s"} joined the living chronicle.`
      : null,
  };
}
