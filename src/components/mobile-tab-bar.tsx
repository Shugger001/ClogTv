"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, Newspaper, Radio } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/watch-live", label: "Watch", icon: Radio },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-area-pb fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 px-2 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-xl md:hidden"
      aria-label="Quick navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] uppercase tracking-wider transition ${
                  active ? "text-red-400" : "text-white/55 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
