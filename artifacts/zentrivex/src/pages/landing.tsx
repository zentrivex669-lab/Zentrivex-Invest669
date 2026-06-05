import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListPlans } from "@workspace/api-client-react";
import { ArrowRight, TrendingUp, Shield, Zap, Lock, Globe, BarChart2, CheckCircle } from "lucide-react";

const CRYPTO_PRICES = [
  { symbol: "BTC", name: "Bitcoin", price: "$62,913", change: "+2.4%", positive: true, color: "text-orange-400" },
  { symbol: "ETH", name: "Ethereum", price: "$3,421", change: "+1.8%", positive: true, color: "text-blue-400" },
  { symbol: "BNB", name: "BNB", price: "$589", change: "-0.6%", positive: false, color: "text-yellow-400" },
  { symbol: "SOL", name: "Solana", price: "$178", change: "+4.2%", positive: true, color: "text-purple-400" },
  { symbol: "ADA", name: "Cardano", price: "$0.58", change: "+1.1%", positive: true, color: "text-cyan-400" },
  { symbol: "USDT", name: "Tether", price: "$1.00", change: "0.0%", positive: true, color: "text-green-400" },
];

function CryptoTicker() {
  return (
    <div className="border-y border-card-border bg-card/40 overflow-hidden py-3">
      <div className="flex animate-[scroll_30s_linear_infinite] gap-12 whitespace-nowrap"
        style={{ animation: "scroll 30s linear infinite" }}>
        {[...CRYPTO_PRICES, ...CRYPTO_PRICES].map((c, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <span className={`font-bold text-sm ${c.color}`}>{c.symbol}</span>
            <span className="text-sm text-foreground font-semibold">{c.price}</span>
            <span className={`text-xs font-semibold ${c.positive ? "text-green-400" : "text-red-400"}`}>{c.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ positive }: { positive: boolean }) {
  const points = positive
    ? "0,50 10,45 20,48 30,35 40,30 50,25 60,20 70,15 80,10 90,8 100,5"
    : "0,10 10,15 20,12 30,25 40,30 50,28 60,35 70,40 80,42 90,45 100,50";
  return (
    <svg viewBox="0 0 100 55" className="w-16 h-8">
      <polyline points={points} fill="none" stroke={positive ? "#4ade80" : "#f87171"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PriceCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {CRYPTO_PRICES.map((c) => (
        <div key={c.symbol} className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black ${c.color}`}>{c.symbol}</span>
              <span className="text-xs text-muted-foreground">{c.name}</span>
            </div>
            <p className="text-lg font-black text-foreground">{c.price}</p>
            <p className={`text-xs font-semibold ${c.positive ? "text-green-400" : "text-red-400"}`}>{c.change} today</p>
          </div>
          <MiniChart positive={c.positive} />
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { data: plans } = useListPlans();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-sm">Z</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Zentrivex</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/register"><Button size="sm" className="gap-1">Get Started <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Ticker */}
      <CryptoTicker />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Institutional-Grade Crypto Investing</Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            Grow Your Wealth<br />
            <span className="text-primary">With Confidence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Zentrivex delivers professional-grade crypto investment plans with transparent returns, institutional security, and 24/7 real-time market data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="lg" className="gap-2 text-base px-8 h-12 font-semibold">Start Investing <ArrowRight size={16} /></Button></Link>
            <Link href="/login"><Button size="lg" variant="outline" className="text-base px-8 h-12">Sign In to Dashboard</Button></Link>
          </div>
        </div>

        {/* Live Price Cards */}
        <PriceCards />
      </section>

      {/* Stats */}
      <section className="border-y border-card-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Total Invested", value: "$48M+" },
            { label: "Active Investors", value: "12,400+" },
            { label: "Countries Served", value: "89" },
            { label: "Avg. Annual ROI", value: "34.7%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-primary mb-1">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Plans */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Investment Plans</Badge>
          <h2 className="text-4xl font-black tracking-tight mb-4">Choose Your Strategy</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Transparent returns, fixed duration, zero hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan, i) => (
            <div key={plan.id} className={`relative rounded-2xl border p-8 flex flex-col gap-4 transition-all hover:-translate-y-1 ${i === 1 ? "border-primary bg-primary/5" : "border-card-border bg-card"}`}>
              {i === 1 && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3">MOST POPULAR</Badge>}
              <div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary">{plan.roiPercent}%</span>
                <span className="text-muted-foreground text-sm">ROI / {plan.durationDays} days</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>Min deposit</span><span className="text-foreground font-semibold">${plan.minAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Max deposit</span><span className="text-foreground font-semibold">${plan.maxAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-semibold">{plan.durationDays} days</span></div>
              </div>
              <Link href="/register"><Button className="w-full mt-2" variant={i === 1 ? "default" : "outline"}>Get Started</Button></Link>
            </div>
          ))}
          {(!plans || plans.length === 0) && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">Plans loading...</div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/30 border-y border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Why Zentrivex</h2>
            <p className="text-muted-foreground">Built for serious investors who demand more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Military-Grade Security", desc: "256-bit encryption, 2FA, cold storage. Your assets are protected by the same standards used by institutional custodians." },
              { icon: BarChart2, title: "Real-Time Market Data", desc: "Live price feeds, portfolio analytics, and trend indicators updated every second." },
              { icon: Zap, title: "Fast Payouts", desc: "Withdrawal requests processed within 24 hours after admin approval." },
              { icon: Lock, title: "KYC Verified", desc: "Full identity verification ensures a safe, compliant environment for every investor." },
              { icon: Globe, title: "Global Access", desc: "Open to investors in 89+ countries with support for multiple cryptocurrencies." },
              { icon: TrendingUp, title: "Transparent Returns", desc: "Fixed, guaranteed ROI with no hidden fees or surprise charges. What you see is what you get." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight mb-4">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Create Account", desc: "Register in minutes with just your email." },
            { step: "02", title: "Verify Identity", desc: "Complete KYC with your government ID." },
            { step: "03", title: "Deposit Funds", desc: "Send crypto to your dedicated wallet." },
            { step: "04", title: "Earn Returns", desc: "Watch your portfolio grow with fixed ROI." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-5xl font-black text-primary/20 mb-4">{step}</div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-4">Ready to Grow Your Crypto?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of investors earning consistent returns with Zentrivex.</p>
          <Link href="/register"><Button size="lg" className="gap-2 text-base px-10 h-12 font-bold">Create Free Account <ArrowRight size={16} /></Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center"><span className="text-primary-foreground font-black text-xs">Z</span></div>
            <span className="font-bold tracking-tight">Zentrivex</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Zentrivex. All rights reserved. Investment involves risk.</p>
        </div>
      </footer>
    </div>
  );
}
