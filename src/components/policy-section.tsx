import { ReactNode } from "react";

/** Stable id for anchor links and fragment navigation (matches PolicyOnThisPage). */
export function policySectionSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface PolicySectionProps {
  title: string;
  /** Override auto id from title (use if titles change but links must stay stable). */
  id?: string;
  children: ReactNode;
}

export function PolicySection({ title, id: idProp, children }: PolicySectionProps) {
  const id = idProp ?? policySectionSlug(title);

  return (
    <section id={id} className="scroll-mt-28 space-y-2 py-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="ui-muted space-y-2 text-sm leading-7">{children}</div>
    </section>
  );
}

interface PolicyOnThisPageProps {
  sectionTitles: string[];
}

export function PolicyOnThisPage({ sectionTitles }: PolicyOnThisPageProps) {
  return (
    <nav className="border-b border-white/10 pb-4" aria-label="On this page">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">On this page</p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
        {sectionTitles.map((title) => {
          const id = policySectionSlug(title);
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-white/70 underline-offset-4 transition hover:text-white hover:underline"
              >
                {title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
