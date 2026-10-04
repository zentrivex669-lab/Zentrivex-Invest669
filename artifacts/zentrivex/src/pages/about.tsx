import { Link } from "wouter";
import { ArrowRight, Building2, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicPageLayout from "@/components/PublicPageLayout";

const services = [
  {
    icon: Building2,
    title: "Real estate plans",
    description: "View plans connected to property markets.",
  },
  {
    icon: LineChart,
    title: "Market portfolios",
    description: "Explore plans linked to financial markets.",
  },
  {
    icon: ShieldCheck,
    title: "Account tools",
    description: "Manage your profile, activity, and transactions.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageLayout>
      <article className="space-y-10">
        <header>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">About Zentrivex</p>
          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">A platform for managing investment plans</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            Zentrivex brings plan details, account activity, and transaction tools together in one place.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Zentrivex services">
          {services.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-card-border bg-card p-6">
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={19} />
              </span>
              <h2 className="mb-2 text-lg font-bold">{title}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <h2 className="mb-2 text-2xl font-bold">Get started</h2>
          <p className="mb-5 leading-7 text-muted-foreground">Create an account to view plans and manage your activity.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="gap-2">Create an account <ArrowRight size={16} /></Button>
            </Link>
            <Link href="/how-to-use">
              <Button variant="outline">How to use</Button>
            </Link>
          </div>
        </section>
      </article>
    </PublicPageLayout>
  );
}