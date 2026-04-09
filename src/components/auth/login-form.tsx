"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

interface LoginFormProps {
  redirectedFrom?: string;
  /** Pale card on light background (editorial sign-in page). */
  variant?: "default" | "light";
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

export function LoginForm({ redirectedFrom, variant = "default" }: LoginFormProps) {
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

  const labelClass =
    variant === "light"
      ? "text-xs uppercase tracking-[0.18em] text-stone-600"
      : "ui-muted text-xs uppercase tracking-[0.18em]";
  const inputClass =
    variant === "light"
      ? "w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 autofill:bg-sky-50 autofill:shadow-[inset_0_0_0px_1000px_rgb(240_249_255)]"
      : "w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-red-400 focus:bg-black/30";
  const errorClass = variant === "light" ? "text-sm text-red-700" : "text-sm text-red-300";
  const submitClass =
    variant === "light"
      ? "w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
      : "w-full rounded-xl bg-gradient-to-r from-red-700 to-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,38,38,0.35)] transition hover:from-red-600 hover:to-red-500 disabled:opacity-60";
  const toggleClass =
    variant === "light"
      ? "w-full text-sm text-stone-600 transition hover:text-stone-900"
      : "ui-muted w-full text-sm transition hover:text-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>
      {error ? <p className={errorClass}>{error}</p> : null}
      <button type="submit" disabled={loading} className={submitClass}>
        {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className={toggleClass}>
        {mode === "signin"
          ? "Need an account? Switch to sign up."
          : "Already have an account? Switch to sign in."}
      </button>
    </form>
  );
}
