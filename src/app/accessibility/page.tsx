import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Accessibility Statement | CLOG TV World",
  description: "Review accessibility features and support options for CLOG TV World.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageShell ariaLabel="Accessibility statement content" eyebrow="Accessibility" title="Accessibility Statement">
      <PolicyOnThisPage
        sectionTitles={["Current Accessibility Features", "Ongoing Improvements", "Report an Issue"]}
      />
      <div className="divide-y divide-white/10">
        <PolicySection title="Current Accessibility Features">
          <p>We provide skip links, landmark labels, keyboard navigation patterns, and visible focus states.</p>
        </PolicySection>
        <PolicySection title="Ongoing Improvements">
          <p>Accessibility is continuously reviewed as the platform evolves.</p>
        </PolicySection>
        <PolicySection title="Report an Issue">
          <p>If you encounter barriers, contact support so we can investigate and improve.</p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
