const TOKEN_VERSION = 1;
const MAX_NAME_LENGTH = 16;

function hashLite(text) {
  let hash = 2166136261;
  const value = String(text || "");
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function toBase64Url(text) {
  const base64 = typeof btoa === "function"
    ? btoa(unescape(encodeURIComponent(text)))
    : Buffer.from(text, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token) {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
  return typeof atob === "function"
    ? decodeURIComponent(escape(atob(padded)))
    : Buffer.from(padded, "base64").toString("utf8");
}

export function encodeChallengeToken({ dateSeed = "", wave = 0, playerName = "Adventurer", vowId = null } = {}) {
  const safeSeed = String(dateSeed || "").slice(0, 32);
  if (!safeSeed) {
    return null;
  }
  const body = {
    v: TOKEN_VERSION,
    d: safeSeed,
    w: Math.max(0, Math.min(99, Math.floor(Number(wave) || 0))),
    n: String(playerName || "Adventurer").replace(/[<>`"']/g, "").slice(0, MAX_NAME_LENGTH) || "Adventurer",
    o: vowId ? String(vowId).slice(0, 24) : null,
  };
  const json = JSON.stringify(body);
  return toBase64Url(`${json}|${hashLite(json)}`);
}

export function decodeChallengeToken(token, { todaySeed = "" } = {}) {
  if (!token || typeof token !== "string" || token.length > 512) {
    return { valid: false, reason: "missing_token", challenge: null };
  }
  let raw;
  try {
    raw = fromBase64Url(token.trim());
  } catch {
    return { valid: false, reason: "malformed_token", challenge: null };
  }
  const splitAt = raw.lastIndexOf("|");
  if (splitAt < 1) {
    return { valid: false, reason: "malformed_token", challenge: null };
  }
  const json = raw.slice(0, splitAt);
  const checksum = raw.slice(splitAt + 1);
  if (hashLite(json) !== checksum) {
    return { valid: false, reason: "tampered_token", challenge: null };
  }
  let body;
  try {
    body = JSON.parse(json);
  } catch {
    return { valid: false, reason: "malformed_token", challenge: null };
  }
  if (body?.v !== TOKEN_VERSION || typeof body.d !== "string" || !body.d) {
    return { valid: false, reason: "unsupported_version", challenge: null };
  }
  const challenge = {
    dateSeed: String(body.d).slice(0, 32),
    wave: Math.max(0, Math.min(99, Math.floor(Number(body.w) || 0))),
    playerName: String(body.n || "Adventurer").replace(/[<>`"']/g, "").slice(0, MAX_NAME_LENGTH) || "Adventurer",
    vowId: body.o ? String(body.o).slice(0, 24) : null,
  };
  if (todaySeed && challenge.dateSeed !== todaySeed) {
    return { valid: false, reason: "expired", challenge };
  }
  return { valid: true, reason: null, challenge };
}

export function buildChallengeUrl({ baseUrl = "", token = "" } = {}) {
  if (!token) {
    return null;
  }
  const base = String(baseUrl || "").split("#")[0].split("?")[0];
  return `${base}?challenge=${token}`;
}

export function getChallengeBanner(challenge) {
  if (!challenge) {
    return null;
  }
  return {
    title: `${challenge.playerName}'s Last Light`,
    detail: `${challenge.playerName} reached Wave ${challenge.wave} on today's route. Beat their light.`,
    targetWave: challenge.wave,
  };
}

export function compareChallengeResult(challenge, { wave = 0 } = {}) {
  if (!challenge) {
    return null;
  }
  const myWave = Math.max(0, Math.floor(Number(wave) || 0));
  const beaten = myWave > challenge.wave;
  const tied = myWave === challenge.wave;
  return {
    beaten,
    tied,
    margin: myWave - challenge.wave,
    line: beaten
      ? `You outshone ${challenge.playerName}'s light — Wave ${myWave} against their ${challenge.wave}.`
      : tied
        ? `You matched ${challenge.playerName}'s light at Wave ${myWave}. The sun calls it even.`
        : `${challenge.playerName}'s light still stands — Wave ${challenge.wave} against your ${myWave}.`,
  };
}
