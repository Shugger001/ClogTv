"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase?.auth.signOut();
        router.push("/auth/login");
        router.refresh();
      }}
      className="rounded-full border border-white/20 bg-white/[0.03] px-3.5 py-1.5 text-xs uppercase tracking-wider text-foreground/85 transition hover:border-white/30 hover:bg-white/10 hover:text-foreground"
    >
      Sign out
    </button>
  );
}
