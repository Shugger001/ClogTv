import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal-page-shell";
import { PolicyOnThisPage, PolicySection } from "@/components/policy-section";

export const metadata: Metadata = {
  title: "Corrections Policy | CLOG TV World",
  description: "How CLOG TV handles factual corrections, clarifications, and reader reports.",
};

export default function CorrectionsPage() {
  return (
    <LegalPageShell ariaLabel="Corrections policy content" eyebrow="Trust" title="Corrections Policy">
      <PolicyOnThisPage sectionTitles={["How to Report", "Review Process", "How Corrections Appear"]} />
      <div className="divide-y divide-white/10">
        <PolicySection title="How to Report">
          <p>
            If you spot a potential error, email support@clogtv.example with the article link, the specific line in
            question, and any supporting evidence.
          </p>
        </PolicySection>
        <PolicySection title="Review Process">
          <p>
            Editors review submitted evidence, compare source material, and coordinate with the reporting team. We
            prioritize corrections that affect public understanding or key factual claims.
          </p>
        </PolicySection>
        <PolicySection title="How Corrections Appear">
          <p>
            Confirmed corrections are added to the story with a timestamped note. Clarifications may be used when text
            is ambiguous but not factually wrong.
          </p>
          <p className="mt-3">
            For general editorial questions, see{" "}
            <Link href="/editorial-standards" className="text-red-300 underline-offset-4 hover:underline">
              Editorial Standards
            </Link>
            .
          </p>
        </PolicySection>
      </div>
    </LegalPageShell>
  );
}
