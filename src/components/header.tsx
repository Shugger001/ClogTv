import Image from "next/image";
import Link from "next/link";
import { HeaderAccount } from "@/components/header-account";
import { PreferencesControls } from "@/components/ui/preferences-controls";

export function Header() {
  return (
    <header className="ui-surface-strong sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 md:gap-x-4 md:px-6 md:py-3">
        <Link
          href="/"
          className="flex min-h-10 min-w-0 items-center gap-2 sm:gap-3"
        >
          <Image
            src="/clog-logo.png"
            alt="CLOG TV logo"
            width={34}
            height={34}
            className="h-8 w-8 shrink-0 rounded-full"
            priority
          />
          <span className="min-w-0 truncate text-sm font-medium tracking-[0.2em] sm:tracking-[0.33em]">
            CLOG TV WORLD
          </span>
        </Link>
        <div className="flex shrink-0 items-center justify-self-end gap-2 md:gap-3">
          <div className="hidden items-center gap-2 md:flex md:gap-3">
            <nav className="ui-muted hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-widest xl:flex">
              <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                World
              </Link>
              <Link href="/news" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                News
              </Link>
              <Link
                href="/newsroom"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground"
              >
                Newsroom
              </Link>
              <Link
                href="/watch-live"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground"
              >
                Watch Live
              </Link>
              <Link href="/live" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                Live
              </Link>
              <Link href="/admin" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                Admin
              </Link>
              <Link
                href="/notifications"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground"
              >
                Alerts
              </Link>
              <Link
                href="/bookmarks"
                className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground"
              >
                Bookmarks
              </Link>
              <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                Business
              </Link>
              <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-foreground">
                Culture
              </Link>
            </nav>
            <PreferencesControls />
          </div>
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}
