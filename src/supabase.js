const env = import.meta.env || {};

export function normalizeSupabaseUrl(value) {
  if (!value) {
    return "";
  }
  const trimmed = String(value).trim();
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}.supabase.co`;
}

const SUPABASE_URL = normalizeSupabaseUrl(env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

let cachedSupabaseClient = null;
let supabaseClientPromise = null;

export async function loadSupabaseClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (cachedSupabaseClient) {
    return cachedSupabaseClient;
  }
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      cachedSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return cachedSupabaseClient;
    });
  }
  return supabaseClientPromise;
}

export function getCachedSupabaseClient() {
  return cachedSupabaseClient;
}
