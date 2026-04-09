"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { prefix: string; label: string; href: string }[] = [
  { prefix: "/newsroom", label: "Newsroom", href: "/newsroom" },
  { prefix: "/watch-live", label: "Watch Live", href: "/watch-live" },
  { prefix: "/live", label: "Live control", href: "/live" },
  { prefix: "/admin", label: "Admin", href: "/admin" },
  { prefix: "/bookmarks", label: "Bookmarks", href: "/bookmarks" },
  { prefix: "/notifications", label: "Alerts", href: "/notifications" },
];

export function SectionContextBar() {
  const pathname = usePathname();

  let label: string | null = null;
  let href: string | null = null;

  if (pathname === "/news" || pathname.startsWith("/news/category")) {
    label = "News · Search & discovery";
    href = "/news";
  } else if (pathname.startsWith("/news/")) {
    label = "News · Article";
    href = "/news";
  } else {
    for (const s of SECTIONS) {
      if (pathname === s.prefix || pathname.startsWith(`${s.prefix}/`)) {
        label = s.label;
        href = s.href;
        break;
      }
    }
  }

  if (!label) return null;

  return (
    <div className="border-t border-white/10 bg-red-900/35 px-4 py-1.5 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/80">
        <span className="text-white/50">You are in</span>
        {href ? (
          <Link href={href} className="font-medium text-white transition hover:underline">
            {label}
          </Link>
        ) : (
          <span className="font-medium text-white">{label}</span>
        )}
      </div>
    </div>
  );
}
