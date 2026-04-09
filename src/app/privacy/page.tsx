import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Privacy Policy | CLOG TV World",
  description: "Learn how CLOG TV World collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell ariaLabel="Privacy policy content" eyebrow="Legal" title="Privacy Policy">
      <PolicyOnThisPage sectionTitles={["Data We Collect", "How We Use Data", "Your Choices"]} />
      <div className="divide-y divide-white/10">
        <PolicySection title="Data We Collect">
          <p>We collect account details, authentication identifiers, and basic interaction data needed to operate CLOG TV.</p>
        </PolicySection>
        <PolicySection title="How We Use Data">
          <p>Information is used for account access, personalization, content delivery, and service reliability.</p>
        </PolicySection>
        <PolicySection title="Your Choices">
          <p>You can request correction or deletion of account data through support channels.</p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
