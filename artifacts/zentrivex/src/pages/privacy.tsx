import PublicPageLayout from "@/components/PublicPageLayout";

const sections = [
  {
    title: "1. Information we collect",
    text: "We collect details you provide, such as your name, email, phone number, account activity, transaction records, and verification documents. We also collect basic device, browser, and security logs.",
  },
  {
    title: "2. How we use information",
    text: "We use information to run your account, process transactions, verify identity, provide support, protect the service, improve features, and meet legal requirements.",
  },
  {
    title: "3. Sharing and storage",
    text: "We share information with providers that help operate the service, and when required by law or needed to protect users and the platform. We keep information as long as needed for the service and legal recordkeeping. We do not sell personal information.",
  },
  {
    title: "4. Security and browser storage",
    text: "We use safeguards to protect information. Browser storage helps keep you signed in and supports core features. Keep your sign-in details private and contact us if you notice unfamiliar account activity.",
  },
  {
    title: "5. Your choices",
    text: "Depending on where you live, you may be able to access, correct, or request deletion of your information. Contact Zentrivex using the official contact details published for the service. We may verify your identity before responding.",
  },
  {
    title: "6. Other details",
    text: "Information may be processed in countries where our service providers operate. We use safeguards for international transfers where required. The service is for people legally eligible to use it. We may update this policy and will take reasonable steps to notify users of significant changes.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 4, 2026</p>
        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          This page explains what information Zentrivex collects and how it is used.
        </p>

        <div className="mt-8 space-y-7">
          {sections.map(({ title, text }) => (
            <section key={title}>
              <h2 className="mb-2 text-lg font-bold">{title}</h2>
              <p className="leading-7 text-muted-foreground">{text}</p>
            </section>
          ))}
        </div>
      </article>
    </PublicPageLayout>
  );
}