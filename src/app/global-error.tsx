"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">Something went wrong</p>
          <h1 className="mt-3 text-3xl font-semibold">We hit an unexpected error.</h1>
          <p className="mt-3 text-sm text-white/75">The incident has been logged. Please try again.</p>
          <button onClick={() => reset()} className="btn-primary mt-6">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
