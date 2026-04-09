"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { HeaderAccount } from "@/components/header-account";
import { PreferencesControls } from "@/components/ui/preferences-controls";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));
  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      menuButtonRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
        return;
      }

      if (event.key === "Tab" && first && last) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  const navClass = (href: string) =>
    `header-nav-link rounded-full px-3 py-1.5 text-white/90 transition hover:bg-white/15 hover:text-white ${
      isActive(href) ? "header-nav-link-active bg-white/15 text-white" : ""
    }`;

  return (
    <header
      className="site-header-brand sticky top-0 z-50 border-b border-red-900/35 bg-red-700 text-white shadow-sm"
      aria-label="Site header"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-2 md:px-6 md:py-3">
        <div className="flex min-h-10 items-center justify-between gap-3">
          <Link
            href="/"
            className="min-w-0 truncate text-sm font-medium tracking-[0.18em] text-white sm:tracking-[0.28em]"
          >
            CLOG TV WORLD
          </Link>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="header-icon-btn flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link
              href="/admin"
              className={`whitespace-nowrap text-[10px] uppercase tracking-[0.12em] sm:text-xs sm:tracking-[0.15em] ${navClass("/admin")}`}
              aria-current={isActive("/admin") ? "page" : undefined}
            >
              Admin
            </Link>
            <HeaderAccount
              triggerClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white transition hover:bg-white/20 hover:text-white"
            />
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                aria-label="Close mobile menu overlay"
                onClick={closeMobileMenu}
                className="fixed inset-0 z-40 bg-black/30 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                ref={menuRef}
                className="ui-card relative z-50 mt-2 space-y-3 p-3 md:hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                <nav className="grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.12em]" aria-label="Mobile site navigation">
                  <Link
                    href="/"
                    className={navClass("/")}
                    aria-current={isActive("/") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    World
                  </Link>
                  <Link
                    href="/news"
                    className={navClass("/news")}
                    aria-current={isActive("/news") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    News
                  </Link>
                  <Link
                    href="/newsroom"
                    className={navClass("/newsroom")}
                    aria-current={isActive("/newsroom") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    Newsroom
                  </Link>
                  <Link
                    href="/watch-live"
                    className={navClass("/watch-live")}
                    aria-current={isActive("/watch-live") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    Watch Live
                  </Link>
                  <Link
                    href="/live"
                    className={navClass("/live")}
                    aria-current={isActive("/live") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    Live
                  </Link>
                  <Link
                    href="/notifications"
                    className={navClass("/notifications")}
                    aria-current={isActive("/notifications") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    Alerts
                  </Link>
                  <Link
                    href="/bookmarks"
                    className={navClass("/bookmarks")}
                    aria-current={isActive("/bookmarks") ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    Bookmarks
                  </Link>
                </nav>
                <PreferencesControls />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
        <div className="mt-2 hidden items-center justify-between gap-3 md:flex">
          <nav
            className="header-nav-shell flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto rounded-full border border-white/25 bg-black/15 px-2 py-1.5 text-xs uppercase tracking-[0.15em] text-white/90 lg:gap-2 lg:px-3"
            aria-label="Primary site navigation"
          >
            <Link href="/" className={navClass("/")} aria-current={isActive("/") ? "page" : undefined}>
              World
            </Link>
            <Link href="/news" className={navClass("/news")} aria-current={isActive("/news") ? "page" : undefined}>
              News
            </Link>
            <Link
              href="/newsroom"
              className={navClass("/newsroom")}
              aria-current={isActive("/newsroom") ? "page" : undefined}
            >
              Newsroom
            </Link>
            <Link
              href="/watch-live"
              className={navClass("/watch-live")}
              aria-current={isActive("/watch-live") ? "page" : undefined}
            >
              Watch Live
            </Link>
            <Link href="/live" className={navClass("/live")} aria-current={isActive("/live") ? "page" : undefined}>
              Live
            </Link>
            <Link
              href="/notifications"
              className={navClass("/notifications")}
              aria-current={isActive("/notifications") ? "page" : undefined}
            >
              Alerts
            </Link>
            <Link
              href="/bookmarks"
              className={navClass("/bookmarks")}
              aria-current={isActive("/bookmarks") ? "page" : undefined}
            >
              Bookmarks
            </Link>
            <Link href="/" className={navClass("/")} aria-current={isActive("/") ? "page" : undefined}>
              Business
            </Link>
            <Link href="/" className={navClass("/")} aria-current={isActive("/") ? "page" : undefined}>
              Culture
            </Link>
          </nav>
          <div className="shrink-0">
            <PreferencesControls />
          </div>
        </div>
      </div>
    </header>
  );
}
