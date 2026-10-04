import PublicPageLayout from "@/components/PublicPageLayout";

const sections = [
  {
    title: "1. Agreement and eligibility",
    paragraphs: [
      "These Terms of Service apply when you access or use the Zentrivex website, create an account, or use services made available through the platform. By using the service, you agree to these terms. If you do not agree, do not use the service.",
      "You must be legally able to enter into a binding agreement and meet any age, location, and eligibility requirements that apply to the services offered to you. We may restrict access where required by law or where a service is not available.",
    ],
  },
  {
    title: "2. Accounts and security",
    paragraphs: [
      "Provide accurate, current information when creating an account and keep it updated. You are responsible for protecting your login details and for activity under your account. Tell us promptly if you believe your account has been accessed without permission.",
      "We may request identity or other verification information before allowing access to certain features. We may suspend or limit an account when necessary to protect users, investigate suspected misuse, or meet legal obligations.",
    ],
  },
  {
    title: "3. Investment information and risk",
    paragraphs: [
      "Information on the platform is provided to describe services and investment plans. It is not individualized financial, legal, tax, or investment advice. You are responsible for deciding whether an investment is appropriate for your circumstances and for seeking independent advice when needed.",
      "All investments involve risk. You may lose some or all of your invested amount, values can fluctuate, and past or displayed performance does not guarantee future results. No return is guaranteed unless a binding written agreement expressly says otherwise.",
      "Plan availability, eligibility, fees, durations, withdrawal rules, and other terms may vary. The plan-specific terms presented to you form part of your agreement for that investment and prevail over general descriptions where they conflict.",
    ],
  },
  {
    title: "4. Deposits, withdrawals, and account activity",
    paragraphs: [
      "Transactions are subject to the instructions, verification checks, processing times, limits, and fees disclosed for the relevant service. Do not submit a transaction until you have checked its amount, destination, and details.",
      "We may delay, reject, reverse, or investigate a transaction where required for security, compliance, suspected fraud, or operational reasons. Blockchain transactions may be irreversible once confirmed on the network.",
    ],
  },
  {
    title: "5. Acceptable use",
    paragraphs: [
      "Do not use the service unlawfully, interfere with its operation or security, submit false information, attempt unauthorized access, or use another person's account without permission. Do not misuse the platform to transmit harmful code or to violate another person's rights.",
    ],
  },
  {
    title: "6. Platform content and third parties",
    paragraphs: [
      "The platform and its content are owned by or licensed to Zentrivex and are protected by applicable intellectual-property laws. You may use them only as permitted by the service.",
      "The platform may link to third-party websites or services. Those services are governed by their own terms and privacy notices; we are not responsible for their content or practices.",
    ],
  },
  {
    title: "7. Availability, suspension, and changes",
    paragraphs: [
      "We may update, suspend, or discontinue any part of the service, and may update these terms from time to time. Where changes are material, we will take reasonable steps to notify users. Continued use after updated terms take effect means you accept them.",
      "We may suspend or terminate access if you breach these terms, if we need to protect the service or its users, or if required by law. Provisions that by their nature should continue after termination will remain in effect.",
    ],
  },
  {
    title: "8. Disclaimers and liability",
    paragraphs: [
      "To the extent permitted by law, the service is provided on an “as available” basis. We do not guarantee uninterrupted access, error-free content, or any investment outcome. Nothing in these terms excludes a right or liability that cannot legally be excluded.",
      "To the extent permitted by applicable law, Zentrivex will not be liable for indirect or consequential loss arising from use of the service. These terms do not limit liability for fraud, willful misconduct, or other liability that cannot be limited by law.",
    ],
  },
  {
    title: "9. Governing law and contact",
    paragraphs: [
      "Mandatory consumer and financial-services laws in your place of residence may apply to your use of the service. These terms do not remove protections that cannot be waived under applicable law.",
      "For questions about these terms, use the official contact details published by Zentrivex for the service.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 4, 2026</p>
        <p className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
          These terms explain the general rules for using Zentrivex. Investment products may have additional plan-specific terms and risk disclosures.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-xl font-bold">{section.title}</h2>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-7 text-muted-foreground">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PublicPageLayout>
  );
}