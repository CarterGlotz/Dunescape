// Public-safe no-op shim.
// Archiving the session handoff to Google Drive is a private Studio OS surface;
// this public repo only needs the command to exist so the closeout autopilot's
// optional archive step does not error. Real archival happens in the private ops
// repository.
const silent = process.argv.includes("--silent");

const result = {
  status: "noop",
  command: "drive-handoff-archive",
  archived: 0,
  reason: "Handoff archival is handled by the private Studio OS surface for this public repo.",
};

if (!silent) {
  console.log(JSON.stringify(result, null, 2));
}
