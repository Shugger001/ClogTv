import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Contact | CLOG TV World",
  description: "Get in touch with CLOG TV World for editorial, account, or technical support.",
};

export default function ContactPage() {
  return (
    <LegalPageShell ariaLabel="Contact information content" eyebrow="Support" title="Contact">
      <PolicyOnThisPage
        sectionTitles={["Editorial Inquiries", "Send a Tip", "Account and Technical Support", "Response Time"]}
      />
      <div className="divide-y divide-white/10">
        <PolicySection title="Editorial Inquiries">
          <p>For editorial matters, contact the newsroom team at support@clogtv.example.</p>
        </PolicySection>
        <PolicySection title="Send a Tip">
          <p>
            For confidential or urgent leads, use tips@clogtv.example with subject line &quot;News tip&quot;. Include secure
            contact details if you want a follow-up from an editor.
          </p>
        </PolicySection>
        <PolicySection title="Account and Technical Support">
          <p>For account access or platform issues, use support@clogtv.example.</p>
        </PolicySection>
        <PolicySection title="Response Time">
          <p>We aim to respond within one business day.</p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
