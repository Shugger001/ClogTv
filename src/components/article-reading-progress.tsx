"use client";

import { useEffect, useState } from "react";

export function ArticleReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("article-body");
      if (!el) return;
      const start = el.offsetTop;
      const end = start + el.offsetHeight - window.innerHeight;
      const range = end - start;
      if (range <= 0) {
        setP(100);
        return;
      }
      const raw = (window.scrollY - start) / range;
      setP(Math.min(100, Math.max(0, raw * 100)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-14 z-[45] h-0.5 bg-transparent md:top-[7.25rem]"
      aria-hidden
    >
      <div
        className="h-full bg-red-500/90 transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
