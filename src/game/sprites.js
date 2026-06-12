// Procedural sprite/asset layer.
// Pre-renders textured terrain tiles into a single offscreen atlas so the world
// can be drawn with one `drawImage` blit per tile (richer texture than a flat
// fill, and a draw-call win) while keeping a procedural fallback in the renderer.

// Shift a #rrggbb hex toward lighter (+) or darker (-) by `amt` (0..255).
export function shadeHex(hex, amt) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `rgb(${r},${g},${b})`;
}

// Deterministic 0..1 hash for a tile-local pixel — keeps texture stable per build.
function hash01(x, y, salt) {
  const s = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Build the terrain atlas.
 * @param {number} TILE tile size in px
 * @param {object} T terrain-type enum (name -> index)
 * @param {object} TC terrain colors (index -> [hex,...])
 * @returns {{canvas:HTMLCanvasElement, variants:number, rows:number}|null}
 */
export function buildTileAtlas(TILE, T, TC) {
  if (typeof document === "undefined") return null;
  const typeIdxs = Object.values(T);
  const rows = Math.max(...typeIdxs) + 1;
  const variants = Math.max(...typeIdxs.map(t => (TC[t] || ["#333"]).length));
  const cv = document.createElement("canvas");
  cv.width = variants * TILE;
  cv.height = rows * TILE;
  const c = cv.getContext("2d");

  const WATER = T.W, LAVA = T.LAVA, SAND = T.SA, DESERT = T.DESERT;

  for (const t of typeIdxs) {
    const cols = TC[t] || ["#333"];
    for (let v = 0; v < cols.length; v++) {
      const ox = v * TILE, oy = t * TILE, base = cols[v];
      // Base + soft vertical gradient for depth.
      const grad = c.createLinearGradient(0, oy, 0, oy + TILE);
      grad.addColorStop(0, shadeHex(base, 10));
      grad.addColorStop(1, shadeHex(base, -14));
      c.fillStyle = grad;
      c.fillRect(ox, oy, TILE, TILE);

      // Per-tile grain: deterministic light/dark specks.
      const density = t === WATER ? 0.04 : t === LAVA ? 0.10 : 0.16;
      for (let py = 0; py < TILE; py += 2) {
        for (let px = 0; px < TILE; px += 2) {
          const r = hash01(ox + px, oy + py, t * 3 + v);
          if (r < density) {
            const dark = r < density / 2;
            c.fillStyle = dark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.10)";
            c.fillRect(ox + px, oy + py, 2, 2);
          }
        }
      }

      // Type-specific accents baked into the texture.
      if (t === WATER) {
        c.strokeStyle = "rgba(150,200,255,0.12)";
        c.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const yy = oy + 6 + i * 9 + (v % 2) * 3;
          c.beginPath(); c.moveTo(ox + 2, yy); c.lineTo(ox + TILE - 2, yy + 2); c.stroke();
        }
      } else if (t === LAVA) {
        c.strokeStyle = "rgba(255,220,120,0.55)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(ox + 4, oy + 8 + (v % 3) * 4);
        c.lineTo(ox + 14, oy + 18);
        c.lineTo(ox + 26, oy + 12 + (v % 2) * 6);
        c.stroke();
      } else if (t === SAND || t === DESERT) {
        c.fillStyle = "rgba(120,90,40,0.18)";
        for (let i = 0; i < 4; i++) {
          const hx = ox + 4 + ((i * 11 + v * 5) % (TILE - 8));
          const hy = oy + 6 + ((i * 13 + v * 7) % (TILE - 10));
          c.fillRect(hx, hy, 3, 1);
        }
      }
    }
  }
  return { canvas: cv, variants, rows };
}
