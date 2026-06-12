// Public-safe no-op shim.
// The Gmail closeout digest is a private Studio OS surface; this public repo only
// needs the command to exist so the closeout autopilot's optional digest step
// does not error. Real delivery happens in the private ops repository.
const silent = process.argv.includes("--silent");

const result = {
  status: "noop",
  command: "gmail-closeout-digest",
  sent: 0,
  reason: "Gmail closeout digest is handled by the private Studio OS surface for this public repo.",
};

if (!silent) {
  console.log(JSON.stringify(result, null, 2));
}
