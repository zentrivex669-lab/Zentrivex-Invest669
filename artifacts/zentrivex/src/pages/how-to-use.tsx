import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicPageLayout from "@/components/PublicPageLayout";

const steps = [
  {
    title: "Create an account",
    description: "Register with your own details and sign in to your account.",
  },
  {
    title: "Verify your identity",
    description: "Complete identity verification before making deposits, investments, or withdrawals.",
  },
  {
    title: "Add funds",
    description: "Choose a payment method, submit a deposit request, and wait for review.",
  },
  {
    title: "Choose a plan",
    description: "Review the plan terms and minimum, then confirm using your available balance.",
  },
  {
    title: "Track your investment",
    description: "Follow your investment status under My Investments.",
  },
  {
    title: "Request a withdrawal",
    description: "Request a withdrawal from your available balance and follow its status. Requests need approval.",
  },
];

export default function HowToUsePage() {
  return (
    <PublicPageLayout>
      <article>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Getting started</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">How to use Zentrivex</h1>
        <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">
          Follow these steps to set up your account and manage an investment.
        </p>

        <section className="mt-8 max-w-sm" aria-labelledby="how-to-video-title">
          <h2 id="how-to-video-title" className="mb-3 text-lg font-bold">
            Watch the quick guide
          </h2>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-card-border bg-background shadow-xl">
            <iframe
              className="h-full w-full border-0"
              src={`${import.meta.env.BASE_URL}zentrivex-how-to-video/`}
              title="Zentrivex 30-second account walkthrough"
              allow="autoplay; fullscreen"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            30-second walkthrough with on-screen captions.
          </p>
        </section>

        <ol className="mt-8 space-y-4">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="flex gap-4 rounded-xl border border-card-border bg-card p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="text-sm font-bold">{index + 1}</span>
              </span>
              <div>
                <h2 className="font-bold">{index + 1}. {title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button className="gap-2">Create an account <ArrowRight size={16} /></Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
      </article>
    </PublicPageLayout>
  );
}