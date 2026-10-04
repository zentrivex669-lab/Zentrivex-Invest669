import PublicPageLayout from "@/components/PublicPageLayout";

const sections = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "We may collect information you provide when you create or manage an account, such as your name, email address, phone number, and account credentials.",
      "If you use investment, payment, or verification features, we may process transaction records, account activity, identity and address information, and documents you submit for verification. We may also collect technical information such as device, browser, log, and security-event data when you use the website.",
    ],
  },
  {
    title: "2. How we use information",
    paragraphs: [
      "We use information to create and maintain accounts, provide requested services, process and display transactions, verify identity, communicate about account activity, secure the platform, prevent fraud and misuse, provide support, and meet legal or regulatory obligations.",
      "We may use service activity to diagnose problems, improve features, and understand how the platform is used. We do not use account passwords for purposes other than authentication and account security.",
    ],
  },
  {
    title: "3. How we share information",
    paragraphs: [
      "We may share information with service providers that help operate the platform, such as hosting, email, identity-verification, security, and payment providers. They may process information only as needed to provide their services and subject to appropriate safeguards.",
      "We may disclose information when required by law, to respond to valid legal processes, to protect users or the service, or in connection with a business transfer. We do not sell personal information as that term is commonly understood.",
    ],
  },
  {
    title: "4. Retention and security",
    paragraphs: [
      "We retain information for as long as needed to provide the service, maintain required records, resolve disputes, enforce agreements, and meet legal obligations. Retention periods depend on the type of information and the reason it was collected.",
      "We use reasonable technical and organizational safeguards designed to protect information. No online service can guarantee complete security, so protect your account credentials and contact us promptly if you suspect unauthorized account activity.",
    ],
  },
  {
    title: "5. Cookies and local storage",
    paragraphs: [
      "The website may use browser storage and similar technologies to keep you signed in, remember preferences, maintain security, and support core features. You can manage browser storage through your device settings, but blocking it may prevent some parts of the service from working.",
    ],
  },
  {
    title: "6. International processing",
    paragraphs: [
      "Information may be processed in countries other than the country where you live, including where our service providers operate. Where required, we use appropriate safeguards for international transfers.",
    ],
  },
  {
    title: "7. Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, restrict, or receive a copy of your personal information, or to object to certain processing. You may also be able to withdraw consent where processing is based on consent.",
      "To make a privacy request, use the official contact details published by Zentrivex for the service. We may need to verify your identity before responding and may retain information when the law requires it.",
    ],
  },
  {
    title: "8. Children and policy updates",
    paragraphs: [
      "The service is not intended for children who are not legally eligible to use investment services. We do not knowingly collect personal information from children in violation of applicable law.",
      "We may update this policy as our practices or legal requirements change. We will update the date above and take reasonable steps to notify users of material changes.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 4, 2026</p>
        <p className="mt-6 max-w-3xl leading-7 text-muted-foreground">
          This policy describes how Zentrivex collects, uses, and shares information when you use our website and account services.
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