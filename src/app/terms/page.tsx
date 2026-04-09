import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Terms of Use | CLOG TV World",
  description: "Read the terms and responsibilities for using CLOG TV World services.",
};

export default function TermsPage() {
  return (
    <LegalPageShell ariaLabel="Terms of use content" eyebrow="Legal" title="Terms of Use">
      <PolicyOnThisPage
        sectionTitles={["Acceptable Use", "Content Disclaimer", "Account Responsibility"]}
      />
      <div className="divide-y divide-white/10">
        <PolicySection title="Acceptable Use">
          <p>Use CLOG TV lawfully and do not misuse accounts, systems, or published content.</p>
        </PolicySection>
        <PolicySection title="Content Disclaimer">
          <p>Content is provided for information and entertainment and may be updated without notice.</p>
        </PolicySection>
        <PolicySection title="Account Responsibility">
          <p>You are responsible for activity conducted through your account credentials.</p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
