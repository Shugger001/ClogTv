import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Editorial Standards | CLOG TV World",
  description: "How CLOG TV reports, verifies, and updates stories with fairness and accountability.",
};

export default function EditorialStandardsPage() {
  return (
    <LegalPageShell ariaLabel="Editorial standards content" eyebrow="Trust" title="Editorial Standards">
      <PolicyOnThisPage
        sectionTitles={[
          "Accuracy and Verification",
          "Fairness and Independence",
          "Sources and Attribution",
          "Updates and Transparency",
        ]}
      />
      <div className="divide-y divide-white/10">
        <PolicySection title="Accuracy and Verification">
          <p>
            We verify key facts with primary documents, direct witnesses, and multiple independent sources whenever
            possible. If facts are still developing, we label stories clearly and update them as confirmation arrives.
          </p>
        </PolicySection>
        <PolicySection title="Fairness and Independence">
          <p>
            We seek relevant perspectives on contested issues and avoid conflicts that could compromise editorial
            judgment. Sponsored material is labeled and kept separate from newsroom decision-making.
          </p>
        </PolicySection>
        <PolicySection title="Sources and Attribution">
          <p>
            We attribute reporting to named sources whenever safe and practical. Anonymous sourcing is used sparingly,
            only when there is clear public-interest value and no reasonable alternative.
          </p>
        </PolicySection>
        <PolicySection title="Updates and Transparency">
          <p>
            Major updates and corrections are reflected in article timestamps and correction notes. When material
            changes are made, we document what changed and why.
          </p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
