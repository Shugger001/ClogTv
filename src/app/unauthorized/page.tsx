import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Access restricted | CLOG TV World",
  description: "You do not have permission to view this area.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-14 text-white">
      <main
        id="main-content"
        aria-label="Access restricted"
        className="w-full max-w-lg rounded-2xl border border-red-900/50 bg-zinc-950/90 p-7 shadow-[0_0_0_1px_rgba(127,29,29,0.35)]"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-red-400/95">Access restricted</p>
        <h1 className="mt-3 text-2xl font-semibold leading-snug tracking-tight sm:text-[1.65rem]">
          You do not have permission for this route
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Contact an administrator to update your newsroom role in your profile.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-red-500/45 bg-black/40 px-4 py-2.5 text-sm font-medium text-white transition hover:border-red-400/70 hover:bg-red-950/40"
          >
            Return to home
          </Link>
          <Link
            href="/newsroom"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Newsroom
          </Link>
        </div>
      </main>
    </div>
  );
}
