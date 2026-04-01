const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Keep boot resilient in local setup while still signaling config issues.
  console.warn("Supabase environment variables are missing.");
}

export const supabaseEnv = {
  url: url ?? "",
  anonKey: anonKey ?? "",
  isConfigured: Boolean(url && anonKey),
};
