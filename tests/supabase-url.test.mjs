import test from "node:test";
import assert from "node:assert/strict";

const { normalizeSupabaseUrl } = await import("../src/supabase.js");

test("Supabase URL normalization accepts full URLs and project refs", () => {
  assert.equal(
    normalizeSupabaseUrl("https://fjnpzjjyhnpmunfoycrp.supabase.co"),
    "https://fjnpzjjyhnpmunfoycrp.supabase.co",
  );
  assert.equal(
    normalizeSupabaseUrl("fjnpzjjyhnpmunfoycrp"),
    "https://fjnpzjjyhnpmunfoycrp.supabase.co",
  );
  assert.equal(normalizeSupabaseUrl(""), "");
});
