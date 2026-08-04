import {
  LegalPageShell,
  LegalSection,
} from "~/components/legal/LegalPageShell";
import { GITHUB_REPO_URL } from "~/lib/constants";

const tableOfContents = [
  { id: "provider", label: "Service provider" },
  { id: "contact", label: "Contact" },
  { id: "register", label: "Commercial register" },
  { id: "editorial", label: "Editorial responsibility" },
] as const;

export default function LegalPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Legal Notice"
      description="Provider identification and contact information for Awesome Intune."
      updated="August 4, 2026"
      tableOfContents={tableOfContents}
    >
      <LegalSection id="provider" title="1. Service provider">
        <p>
          Information in accordance with Section 5 of the German Digital
          Services Act (Digitale-Dienste-Gesetz, DDG):
        </p>
        <address className="not-italic">
          <strong>Ugurlabs UG (haftungsbeschränkt)</strong>
          <br />
          Fährstraße 217
          <br />
          40221 Düsseldorf
          <br />
          Germany
        </address>
        <p>
          Represented by the Managing Director:
          <br />
          Ugur Koc
        </p>
      </LegalSection>

      <LegalSection id="contact" title="2. Contact">
        <p>
          Email: <a href="mailto:support@ugurlabs.com">support@ugurlabs.com</a>
        </p>
        <p>
          For technical questions and reports, you may also use the public{" "}
          <a
            href={GITHUB_REPO_URL + "/issues"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Awesome Intune issue tracker
          </a>
          . Please do not post personal, confidential, or security-sensitive
          information in a public issue.
        </p>
      </LegalSection>

      <LegalSection id="register" title="3. Commercial register">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[11rem_1fr]">
          <dt className="font-semibold text-[var(--text-primary)]">
            Register court
          </dt>
          <dd>Local Court Düsseldorf (Amtsgericht Düsseldorf)</dd>
          <dt className="font-semibold text-[var(--text-primary)]">
            Register division
          </dt>
          <dd>Commercial Register B</dd>
          <dt className="font-semibold text-[var(--text-primary)]">
            Register number
          </dt>
          <dd>HRB 113979</dd>
          <dt className="font-semibold text-[var(--text-primary)]">
            Legal form
          </dt>
          <dd>UG (haftungsbeschränkt)</dd>
        </dl>
      </LegalSection>

      <LegalSection id="editorial" title="4. Editorial responsibility" isLast>
        <p>
          Responsible for journalistic-editorial content under Section 18(2) of
          the German State Media Treaty (Medienstaatsvertrag, MStV):
        </p>
        <address className="not-italic">
          <strong>Ugur Koc</strong>
          <br />
          Ugurlabs UG (haftungsbeschränkt)
          <br />
          Fährstraße 217
          <br />
          40221 Düsseldorf
          <br />
          Germany
        </address>
      </LegalSection>
    </LegalPageShell>
  );
}
