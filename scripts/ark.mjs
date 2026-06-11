const command = process.argv[2] || "status";
const silent = process.argv.includes("--silent");

const result = {
  status: "noop",
  command,
  cargo: 0,
  reason: "Studio Ark cargo is handled by the private Studio OS surface for this public repo.",
};

if (!silent) {
  console.log(JSON.stringify(result, null, 2));
}
