import dynamic from "next/dynamic";
import { InlineAdBanner, SidebarAds } from "@/components/ads-section";
import { Header } from "@/components/header";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const revalidate = 120;

const BreakingTicker = dynamic(
  () => import("@/components/breaking-ticker").then((mod) => mod.BreakingTicker),
  { loading: () => <div className="h-10 w-full animate-pulse bg-red-900/40" /> },
);
const HomepageSections = dynamic(
  () => import("@/components/homepage-sections").then((mod) => mod.HomepageSections),
  { loading: () => <div className="ui-card density-card h-64 animate-pulse" /> },
);
const EditorialBoard = dynamic(
  () => import("@/components/editorial-board").then((mod) => mod.EditorialBoard),
  { loading: () => <div className="glass-panel h-64 rounded-2xl animate-pulse" /> },
);
const LiveTvPanel = dynamic(
  () => import("@/components/live-tv-panel").then((mod) => mod.LiveTvPanel),
  { loading: () => <div className="glass-panel h-56 rounded-2xl animate-pulse" /> },
);
const HomeMostReadRail = dynamic(
  () => import("@/components/home-most-read-rail").then((mod) => mod.HomeMostReadRail),
  { loading: () => <div className="ui-card density-card h-72 animate-pulse" /> },
);

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <BreakingTicker />
      <main
        id="main-content"
        aria-label="Homepage main content"
        className="density-grid mx-auto grid w-full max-w-7xl px-6 py-8 lg:grid-cols-[1.45fr_0.9fr]"
      >
        <section className="space-y-5" aria-label="Top stories and editorial feed">
          <article className="glass-panel rounded-2xl p-7 md:p-8">
            <p className="kicker">Global Lead</p>
            <h1 className="headline-display mt-3 text-4xl leading-tight font-semibold text-foreground md:text-5xl">
              Premium real-time newsroom for global audiences
            </h1>
            <p className="ui-muted mt-4 max-w-3xl text-base leading-7">
              Built for high-volume editorial operations with fast publishing pipelines,
              multi-author collaboration, and live streaming experiences tailored for modern
              broadcast and digital audiences.
            </p>
            <div className="ui-muted mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.17em]">
              <span>By ClogTv World Desk</span>
              <span className="text-[10px]">|</span>
              <span>Updated 12 minutes ago</span>
              <span className="text-[10px]">|</span>
              <span>4 min read</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="hero-chip rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-widest text-white/75">
                Realtime Ticker
              </span>
              <span className="hero-chip rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-widest text-white/75">
                Live Broadcast
              </span>
              <span className="hero-chip rounded-full border border-white/20 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-widest text-white/75">
                Editorial Workflow
              </span>
            </div>
          </article>
          <InlineAdBanner />
          <NewsletterSignup />
          <HomepageSections />
          <EditorialBoard />
        </section>
        <aside className="space-y-5" aria-label="Live and most-read sidebar">
          <LiveTvPanel />
          <HomeMostReadRail />
          <SidebarAds />
        </aside>
      </main>
    </div>
  );
}
