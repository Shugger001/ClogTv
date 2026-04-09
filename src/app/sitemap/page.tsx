import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Sitemap | CLOG TV World",
  description: "Browse all major sections of CLOG TV World.",
};

const sections = [
  {
    title: "News & video",
    links: [
      { href: "/", label: "Home" },
      { href: "/news", label: "News search & discovery" },
      { href: "/news/category/politics", label: "Politics (category)" },
      { href: "/watch-live", label: "Watch live" },
      { href: "/live", label: "Live control" },
    ],
  },
  {
    title: "Editorial",
    links: [
      { href: "/newsroom", label: "Newsroom" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/bookmarks", label: "Bookmarks" },
      { href: "/notifications", label: "Alerts" },
      { href: "/auth/login", label: "Sign in" },
    ],
  },
  {
    title: "Policies & contact",
    links: [
      { href: "/legal", label: "Legal & policies" },
      { href: "/contact", label: "Contact" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label="Sitemap" className="mx-auto max-w-3xl px-6 py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sitemap" }]} />
        <section className="ui-card density-card">
          <h1 className="text-3xl font-semibold">Sitemap</h1>
          <p className="ui-muted mt-2 text-sm leading-6">
            Quick links to every major destination on the platform.
          </p>
          <div className="mt-6 space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-foreground underline-offset-4 hover:text-red-300 hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
