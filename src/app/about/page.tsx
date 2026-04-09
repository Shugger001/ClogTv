import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "About | CLOG TV World",
  description: "CLOG TV World is a premium global news and broadcast platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label="About CLOG TV" className="mx-auto max-w-3xl px-6 py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
        <section className="ui-card density-card space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">About</p>
          <h1 className="text-3xl font-semibold">CLOG TV World</h1>
          <p className="ui-muted text-sm leading-7">
            We combine editorial depth with live and on-demand video so audiences can follow breaking stories,
            analysis, and culture in one place. Our newsroom tools support fast publishing, collaboration, and
            responsible coverage.
          </p>
          <p className="ui-muted text-sm leading-7">
            For partnerships, corrections, or press inquiries, use{" "}
            <Link href="/contact" className="text-red-300 underline-offset-4 hover:underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
