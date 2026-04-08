import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PreferencesControls } from "@/components/ui/preferences-controls";
import { UserRole } from "@/lib/auth/roles";

interface RouteShellProps {
  title: string;
  role: UserRole;
  fullName: string | null;
  children: ReactNode;
}

const nav = [
  { href: "/newsroom", label: "Newsroom" },
  { href: "/live", label: "Live Control" },
  { href: "/admin", label: "Admin" },
];

export function RouteShell({ title, role, fullName, children }: RouteShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="ui-surface-strong border-b backdrop-blur-xl" aria-label="Editorial header">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Image
                src="/clog-logo.png"
                alt="CLOG TV logo"
                width={22}
                height={22}
                className="h-5 w-5 rounded-full"
              />
              <p className="text-xs uppercase tracking-[0.3em] text-red-400/90">CLOG Editorial</p>
            </div>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <div className="flex w-full flex-wrap items-center justify-start gap-2 lg:w-auto lg:justify-end lg:gap-3">
            <div className="ui-surface rounded-xl px-3 py-2 text-right">
              <p className="text-sm">{fullName ?? "Editorial User"}</p>
              <p className="ui-muted text-xs uppercase tracking-widest">{role}</p>
            </div>
            <PreferencesControls />
            <SignOutButton />
          </div>
        </div>
        <nav
          className="ui-muted mx-auto flex w-full max-w-7xl gap-2 px-6 pb-4 text-xs uppercase tracking-widest"
          aria-label="Editorial section navigation"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main-content" aria-label="Editorial page content" className="mx-auto w-full max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
