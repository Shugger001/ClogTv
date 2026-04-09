import Link from "next/link";
import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";

const legalPages = [
  { href: "/terms", title: "Terms of Use", description: "Rules and responsibilities for using CLOG TV." },
  { href: "/privacy", title: "Privacy Policy", description: "How personal data is handled and protected." },
  { href: "/cookies", title: "Cookies", description: "How cookies are used for security and analytics." },
  { href: "/accessibility", title: "Accessibility", description: "Our accessibility commitments and support channels." },
  {
    href: "/editorial-standards",
    title: "Editorial Standards",
    description: "Our reporting standards for accuracy, fairness, and attribution.",
  },
  { href: "/corrections", title: "Corrections Policy", description: "How to report errors and how updates are issued." },
  { href: "/contact", title: "Contact", description: "How to reach editorial and technical support." },
];

export const metadata: Metadata = {
  title: "Legal & Policies | CLOG TV World",
  description: "Browse legal and policy documents including terms, privacy, cookies, and accessibility.",
};

export default function LegalPage() {
  return (
    <LegalPageShell
      ariaLabel="Legal and policy content"
      eyebrow="Information"
      title="Legal & Policies"
      maxWidthClassName="max-w-5xl"
    >
      <p className="ui-muted text-sm leading-7">
        Find terms, privacy, cookie details, accessibility information, and support contact references.
      </p>

      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {legalPages.map((page) => (
          <Link key={page.href} href={page.href} className="home-list-card rounded-lg border px-3 py-3">
            <p className="font-medium">{page.title}</p>
            <p className="ui-muted mt-1 text-xs">{page.description}</p>
          </Link>
        ))}
      </div>
    </LegalPageShell>
  );
}
