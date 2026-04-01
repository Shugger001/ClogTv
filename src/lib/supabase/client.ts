"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

export const createSupabaseBrowserClient = () => {
  if (!supabaseEnv.isConfigured) {
    return null;
  }

  return createBrowserClient(supabaseEnv.url, supabaseEnv.anonKey);
};
