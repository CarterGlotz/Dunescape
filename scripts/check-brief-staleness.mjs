import { stat } from "node:fs/promises";

const briefPath = "docs/STARTUP_BRIEF.md";
const maxAgeMs = 24 * 60 * 60 * 1000;

try {
  const info = await stat(briefPath);
  const ageMs = Date.now() - info.mtimeMs;
  if (ageMs <= maxAgeMs) {
    console.log(`fresh: ${briefPath}`);
    process.exit(0);
  }
  console.log(`stale: ${briefPath}`);
  process.exit(1);
} catch {
  console.log(`missing: ${briefPath}`);
  process.exit(1);
}
