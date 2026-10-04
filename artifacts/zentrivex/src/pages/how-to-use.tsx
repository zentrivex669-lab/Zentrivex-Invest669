import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicPageLayout from "@/components/PublicPageLayout";

const steps = [
  {
    title: "Create an account",
    description: "Register and sign in. Complete identity verification to unlock account transactions.",
  },
  {
    title: "Add funds",
    description: "Choose a payment method, submit your deposit details, and wait for review and approval.",
  },
  {
    title: "Choose a plan",
    description: "Select a plan, enter an amount from your available balance, and confirm your investment.",
  },
  {
    title: "Track your investment",
    description: "View progress and credited profit under My Investments. Profit is credited after each full 24-hour period. Your principal returns to your available balance when the plan ends.",
  },
  {
    title: "Request a withdrawal",
    description: "Request a withdrawal from your available balance and follow its status in your account. Withdrawal requests need approval.",
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