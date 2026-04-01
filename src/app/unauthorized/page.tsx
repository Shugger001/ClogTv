import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-red-300">Access Restricted</p>
        <h1 className="mt-2 text-2xl font-semibold">You do not have permission for this route</h1>
        <p className="mt-3 text-sm text-white/70">
          Contact an administrator to update your newsroom role in your profile.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Return to home
        </Link>
      </section>
    </div>
  );
}
