import Link from "next/link";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

export function SiteFooter() {
  const year = new Date().getFullYear();
  const footerColumns: { heading: string; links: FooterLink[] }[] = [
    {
      heading: "News",
      links: [
        { href: "/news", label: "Latest" },
        { href: "/newsroom", label: "Newsroom" },
        { href: "/live", label: "Live" },
      ],
    },
    {
      heading: "Account",
      links: [
        { href: "/bookmarks", label: "Bookmarks" },
        { href: "/notifications", label: "Alerts" },
        { href: "/admin", label: "Admin" },
      ],
    },
    {
      heading: "Watch",
      links: [
        { href: "/watch-live", label: "Watch Live" },
        { href: "/", label: "World" },
        { href: "/", label: "Culture" },
      ],
    },
    {
      heading: "Social & media",
      links: [
        { href: "https://x.com/", label: "X", external: true },
        { href: "https://www.facebook.com/", label: "Facebook", external: true },
        { href: "https://www.youtube.com/", label: "YouTube", external: true },
        { href: "/admin#media-library", label: "Media library" },
      ],
    },
  ];
  const utilityLinks = [
    { href: "/sitemap", label: "Sitemap" },
    { href: "/legal", label: "Legal" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/contact", label: "Contact" },
    { href: "/cookies", label: "Cookies" },
    { href: "/accessibility", label: "Accessibility" },
  ];

  return (
    <footer className="border-t border-white/20 bg-black" aria-label="Site footer">
      <div className="mx-auto w-full max-w-7xl px-6 py-5 text-[12px] leading-5 text-white/72">
        <div className="border-b border-white/15 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white">CLOG TV WORLD</p>
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Footer utility navigation">
              {utilityLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[10px] uppercase tracking-[0.16em] text-white/70 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <nav
          className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Footer navigation"
        >
          {footerColumns.map((column) => (
            <div key={column.heading} className="space-y-1.5">
              <p className="inline-block border-b border-red-500/70 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                {column.heading}
              </p>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/15 pt-3">
          <p className="text-[11px] leading-4 text-white/65">© {year} CLOG TV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
