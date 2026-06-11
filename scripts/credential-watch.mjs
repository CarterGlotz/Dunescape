const silent = process.argv.includes("--silent");
const result = {
  status: "noop",
  reason: "No project-local credential transition watcher is configured for this public repo.",
  actions: [],
};

if (!silent) {
  console.log(JSON.stringify(result, null, 2));
}
