"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-[5.5rem] right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg backdrop-blur-md transition hover:bg-red-900/90 md:bottom-8"
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
