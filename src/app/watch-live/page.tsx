import { Header } from "@/components/header";

export default function WatchLivePage() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label="Watch live content" className="mx-auto max-w-6xl px-6 py-8">
        <section className="ui-card density-card">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">Watch Live TV</p>
          <h1 className="mt-2 text-3xl font-semibold">Global live stream</h1>
          <p className="ui-muted mt-2 text-sm">
            Supports YouTube and external stream embeds for live broadcast coverage.
          </p>
          <div className="mt-4 aspect-video rounded-xl border border-white/15 bg-black/60">
            <iframe
              className="h-full w-full rounded-xl"
              src="https://www.youtube.com/embed/live_stream?channel=UC16niRr50-MSBwiO3YDb3RA"
              title="Live TV stream"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      </main>
    </div>
  );
}
