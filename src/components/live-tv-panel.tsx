"use client";

import { motion } from "framer-motion";

const channels = [
  { region: "Global", name: "CLOG World Service", status: "Live" },
  { region: "Africa", name: "CLOG Focus Africa", status: "Live" },
  { region: "Europe", name: "CLOG Europe Desk", status: "Standby" },
];

export function LiveTvPanel() {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="kicker">Live TV</h2>
        <span className="rounded-full border border-red-300/35 bg-red-500/15 px-2 py-1 text-xs text-red-200">
          Streaming
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="live-preview-card mb-4 aspect-video rounded-xl border border-white/15 bg-gradient-to-br from-zinc-700/80 via-zinc-900 to-black p-3"
      >
        <div className="live-preview-overlay flex h-full items-end rounded-lg bg-gradient-to-t from-black/65 via-black/35 to-transparent p-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-red-300">Now Live</p>
            <p className="headline-compact text-lg font-medium text-foreground">World Tonight: Special Coverage</p>
          </div>
        </div>
      </motion.div>
      <ul className="space-y-2">
        {channels.map((channel) => (
          <li
            key={channel.name}
            className="home-list-card flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
          >
            <div>
              <p className="text-foreground">{channel.name}</p>
              <p className="ui-muted text-xs">{channel.region}</p>
            </div>
            <span className="ui-muted text-xs">{channel.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
