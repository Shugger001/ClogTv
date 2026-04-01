"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

interface LoginFormProps {
  redirectedFrom?: string;
}

function resolveSafeRedirect(redirectedFrom?: string) {
  if (!redirectedFrom) return "/newsroom";

  const allowedPrefixes = ["/newsroom", "/live", "/admin"];
  if (
    redirectedFrom.startsWith("/") &&
    !redirectedFrom.startsWith("//") &&
    allowedPrefixes.some((prefix) => redirectedFrom.startsWith(prefix))
  ) {
    return redirectedFrom;
  }

  return "/newsroom";
}

export function LoginForm({ redirectedFrom }: LoginFormProps) {
  const router = useRouter();
  const redirectTarget = resolveSafeRedirect(redirectedFrom);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase || !supabaseEnv.isConfigured) {
        setError("Supabase environment is not configured.");
        return;
      }

      const action =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { error: authError } = await action;
      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(redirectTarget);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="ui-muted text-xs uppercase tracking-[0.18em]">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-red-400 focus:bg-black/30"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="ui-muted text-xs uppercase tracking-[0.18em]">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-red-400 focus:bg-black/30"
        />
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-red-700 to-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,38,38,0.35)] transition hover:from-red-600 hover:to-red-500 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="ui-muted w-full text-sm transition hover:text-foreground"
      >
        {mode === "signin"
          ? "Need an account? Switch to sign up."
          : "Already have an account? Switch to sign in."}
      </button>
    </form>
  );
}
