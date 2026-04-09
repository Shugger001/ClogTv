import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Cookies | CLOG TV World",
  description: "Understand how cookies are used on CLOG TV World for security and analytics.",
};

export default function CookiesPage() {
  return (
    <LegalPageShell ariaLabel="Cookie policy content" eyebrow="Policy" title="Cookies">
      <PolicyOnThisPage
        sectionTitles={["Essential Cookies", "Analytics Cookies", "Managing Cookies"]}
      />
      <div className="divide-y divide-white/10">
        <PolicySection title="Essential Cookies">
          <p>Essential cookies support authentication, session continuity, and core platform security.</p>
        </PolicySection>
        <PolicySection title="Analytics Cookies">
          <p>Optional analytics cookies help us understand usage and improve performance.</p>
        </PolicySection>
        <PolicySection title="Managing Cookies">
          <p>You can manage cookie behavior through browser settings and privacy controls.</p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
