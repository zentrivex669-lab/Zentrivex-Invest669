import { Link } from "wouter";
import { ArrowRight, Building2, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicPageLayout from "@/components/PublicPageLayout";

const focusAreas = [
  {
    icon: Building2,
    title: "Real estate",
    description: "Explore investment plans associated with real estate markets and property-related opportunities.",
  },
  {
    icon: LineChart,
    title: "Market portfolios",
    description: "Review plans connected to market portfolios, with details and terms for each offering.",
  },
  {
    icon: ShieldCheck,
    title: "Account tools",
    description: "Manage account details, review activity, and complete verification steps through a single platform.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">About Zentrivex</p>
        <h1 className="mb-5 text-4xl font-black tracking-tight sm:text-5xl">A clearer way to review investment opportunities</h1>
        <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
          Zentrivex is an online platform for exploring and managing investment plans related to real estate and financial markets. We bring plan information and account tools together so customers can review the details available to them in one place.
        </p>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {focusAreas.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-card-border bg-card p-6">
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={19} />
              </span>
              <h2 className="mb-2 text-lg font-bold">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <h2 className="mb-3 text-2xl font-bold">Explore investment plans</h2>
          <p className="leading-7 text-muted-foreground">
            Review plan details and manage your account through the Zentrivex platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="gap-2">Create an account <ArrowRight size={16} /></Button>
            </Link>
            <Link href="/terms">
              <Button variant="outline">Read our Terms</Button>
            </Link>
          </div>
        </section>
      </article>
    </PublicPageLayout>
  );
}