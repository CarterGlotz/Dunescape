export function sparkline(values = [], { width = 5 } = {}) {
  const ticks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const nums = Array.isArray(values) ? values.map(Number).filter(Number.isFinite) : [];
  if (nums.length === 0) {
    return "▁".repeat(width);
  }
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = Math.max(1, max - min);
  return nums
    .slice(-width)
    .map((value) => ticks[Math.max(0, Math.min(ticks.length - 1, Math.round(((value - min) / span) * (ticks.length - 1))))])
    .join("")
    .padStart(Math.min(width, nums.length), "▁");
}
