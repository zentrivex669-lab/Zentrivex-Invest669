import PublicPageLayout from "@/components/PublicPageLayout";

const sections = [
  {
    title: "1. Accounts",
    text: "Use Zentrivex only if you are legally eligible and agree to these terms. Keep your account information accurate, protect your sign-in details, and tell us if you notice access you did not authorize. Identity verification may be required for some features.",
  },
  {
    title: "2. Plans and transactions",
    text: "Plans may have different fees, durations, and withdrawal rules. The terms shown for a plan apply to that plan. Follow the payment instructions and check transaction details before submitting. Transactions may be reviewed or delayed for security, legal, or operational reasons. Confirmed blockchain transactions may not be reversible.",
  },
  {
    title: "3. Using the platform",
    text: "Do not use Zentrivex unlawfully, provide false information, access another person’s account, or interfere with the service. Third-party services linked from the platform have their own terms.",
  },
  {
    title: "4. Service changes",
    text: "We may update, suspend, or change the service. We may limit access to protect users, address misuse, or meet legal requirements. We will take reasonable steps to notify users of material changes to these terms.",
  },
  {
    title: "5. Liability and contact",
    text: "Where the law allows, Zentrivex is not liable for indirect or consequential loss. These terms do not limit rights or liability that cannot legally be limited. Applicable consumer protections remain in place. For questions, use the official contact details published by Zentrivex.",
  },
];

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Terms of Use</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: October 4, 2026</p>
        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          These short terms explain the main rules for using Zentrivex.
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