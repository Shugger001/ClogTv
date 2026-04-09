import { ReactNode } from "react";
import { Header } from "@/components/header";

interface LegalPageShellProps {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  maxWidthClassName?: string;
  children: ReactNode;
}

export function LegalPageShell({
  ariaLabel,
  eyebrow,
  title,
  maxWidthClassName = "max-w-4xl",
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label={ariaLabel} className={`mx-auto w-full ${maxWidthClassName} px-6 py-8`}>
        <section className="ui-card density-card space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">{eyebrow}</p>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="ui-muted text-[11px] uppercase tracking-[0.14em]">Last updated: April 8, 2026</p>
          {children}
        </section>
      </main>
    </div>
  );
}
