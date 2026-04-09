"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = { name: string | null; avatar_url: string | null };

function initialsFrom(name: string | null | undefined, email: string | null | undefined) {
  const n = (name ?? "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = (email ?? "").trim();
  if (e) return e.slice(0, 2).toUpperCase();
  return "?";
}

function metaAvatarUrl(meta: Record<string, unknown>): string | null {
  const a = meta.avatar_url;
  const p = meta.picture;
  if (typeof a === "string" && a.length > 0) return a;
  if (typeof p === "string" && p.length > 0) return p;
  return null;
}

const shellClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-foreground/85 transition hover:bg-[color:var(--surface-strong)] hover:text-foreground";

interface HeaderAccountProps {
  /** Override trigger styling (e.g. red site header). */
  triggerClassName?: string;
}

export function HeaderAccount({ triggerClassName }: HeaderAccountProps) {
  const triggerShell = triggerClassName ?? shellClass;
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [oauthAvatar, setOauthAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    const applyRow = (row: ProfileRow | null) => {
      if (!cancelled) setProfile(row);
    };

    const loadProfile = async (uid: string, meta: Record<string, unknown>) => {
      setOauthAvatar(metaAvatarUrl(meta));
      const { data } = await supabase.from("users").select("name, avatar_url").eq("id", uid).maybeSingle();
      if (cancelled) return;
      applyRow(data ? { name: data.name, avatar_url: data.avatar_url } : null);
    };

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        await loadProfile(session.user.id, session.user.user_metadata ?? {});
      } else {
        setUserId(null);
        setEmail(null);
        setProfile(null);
        setOauthAvatar(null);
      }
    };

    void syncSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
        void loadProfile(session.user.id, session.user.user_metadata ?? {});
      } else {
        setUserId(null);
        setEmail(null);
        setProfile(null);
        setOauthAvatar(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!supabase) {
    return (
      <Link
        href="/auth/login"
        className={triggerShell}
        aria-label="Sign in"
      >
        <UserRound className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    );
  }

  if (!userId) {
    return (
      <Link href="/auth/login" className={triggerShell} aria-label="Sign in">
        <UserRound className="h-4 w-4" strokeWidth={1.75} />
      </Link>
    );
  }

  const displayName = profile?.name?.trim() || email?.split("@")[0] || "Account";
  const avatarSrc = (profile?.avatar_url && profile.avatar_url.trim()) || oauthAvatar;

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerShell} overflow-hidden p-0 ring-2 ring-transparent hover:ring-white/40`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt=""
            width={36}
            height={36}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-[11px] font-semibold tracking-tight">{initialsFrom(profile?.name, email)}</span>
        )}
      </button>
      {open ? (
        <div
          className="ui-surface-strong absolute right-0 z-50 mt-2 w-56 rounded-xl border border-[color:var(--border)] py-2 shadow-lg backdrop-blur-xl"
          role="menu"
        >
          <p className="kicker px-3 text-[10px] text-[color:var(--text-muted)]">Signed in</p>
          <p className="px-3 pt-0.5 text-sm font-medium text-foreground">{displayName}</p>
          {email ? (
            <p className="ui-muted px-3 pb-2 text-[11px] leading-snug break-all">{email}</p>
          ) : null}
          <div className="mt-1 border-t border-[color:var(--border)] pt-2">
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-xs uppercase tracking-wider text-foreground/90 transition hover:bg-[color:var(--surface)]"
              onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
