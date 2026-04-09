"use client";

import { useEffect, useState } from "react";
import { NewsletterSignup } from "@/components/newsletter-signup";

const EXIT_MODAL_KEY = "clogtv_newsletter_exit_modal_seen";

export function ArticleNewsletterExitIntent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(EXIT_MODAL_KEY) === "1";
    if (seen) return;

    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY > 18) return;
      window.sessionStorage.setItem(EXIT_MODAL_KEY, "1");
      setOpen(true);
    };

    window.addEventListener("mouseout", handleMouseOut);
    return () => window.removeEventListener("mouseout", handleMouseOut);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-4 md:items-center">
      <button
        type="button"
        aria-label="Close newsletter prompt"
        className="absolute inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 w-full max-w-xl">
        <NewsletterSignup
          source="article_exit_intent"
          compact
          title="Before you go: get the top stories first"
          description="Join the ClogTv briefing and get major updates in your inbox."
          className="shadow-2xl"
        />
        <button
          type="button"
          className="mt-2 w-full text-center text-xs uppercase tracking-[0.16em] text-white/85 hover:text-white"
          onClick={() => setOpen(false)}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
