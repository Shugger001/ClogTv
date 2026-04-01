"use client";

import { motion } from "framer-motion";
import { useBreakingNews } from "@/hooks/use-breaking-news";

export function BreakingTicker() {
  const { data, isLoading } = useBreakingNews();
  const headlines = data?.slice(0, 8).map((item) => item.title) ?? [];

  return (
    <section className="ticker-shell overflow-hidden border-y border-red-400/40 bg-gradient-to-r from-red-700/95 via-red-600/95 to-red-700/95 py-2.5 shadow-[0_10px_35px_rgba(185,28,28,0.35)]">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6">
        <span className="ticker-badge shrink-0 rounded-full border border-white/35 bg-black/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white">
          Breaking
        </span>
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-12 whitespace-nowrap text-sm text-white/95"
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
          >
            {(isLoading ? ["Loading newsroom feed..."] : [...headlines, ...headlines]).map(
              (headline, index) => (
                <span key={`${headline}-${index}`}>{headline}</span>
              ),
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
