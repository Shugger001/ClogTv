import { AdSlot } from "@/components/ad-slot";

export function InlineAdBanner() {
  return (
    <section className="ui-card density-card">
      <p className="ui-muted text-[11px] uppercase tracking-[0.22em]">Sponsored Content</p>
      <AdSlot
        slotKey="inline"
        label="Homepage Billboard"
        minHeight={250}
        className="mt-3 rounded-xl border border-red-400/30 bg-gradient-to-r from-red-900/30 via-red-700/20 to-red-900/30 px-4 py-4"
        placeholderCopy="Global Partner Feature Slot"
        responsiveMap={[
          { viewport: [1280, 0], sizes: [[970, 250], [728, 90]] },
          { viewport: [1024, 0], sizes: [[728, 90]] },
          { viewport: [0, 0], sizes: [[320, 100], [300, 250]] },
        ]}
      />
    </section>
  );
}

export function SidebarAds() {
  return (
    <section className="ui-card density-card">
      <h2 className="ui-muted text-sm uppercase tracking-[0.2em]">Advertising</h2>
      <div className="mt-3 space-y-3">
        <AdSlot
          slotKey="sidebar1"
          label="Sponsored"
          minHeight={250}
          className="home-list-card rounded-xl border px-4 py-4"
          placeholderCopy="Global fintech campaign placement"
          responsiveMap={[
            { viewport: [1024, 0], sizes: [[300, 250]] },
            { viewport: [0, 0], sizes: [[300, 250], [320, 100]] },
          ]}
        />
        <AdSlot
          slotKey="sidebar2"
          label="Programmatic"
          minHeight={600}
          className="home-list-card rounded-xl border px-4 py-4"
          placeholderCopy="Premium brand takeover slot"
          responsiveMap={[
            { viewport: [1280, 0], sizes: [[300, 600], [300, 250]] },
            { viewport: [0, 0], sizes: [[300, 250], [320, 100]] },
          ]}
        />
      </div>
    </section>
  );
}
