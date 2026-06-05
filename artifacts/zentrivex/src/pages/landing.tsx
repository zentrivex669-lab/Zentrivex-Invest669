import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListPlans } from "@workspace/api-client-react";
import { ArrowRight, TrendingUp, Shield, Zap, Lock, Globe, BarChart2, CheckCircle } from "lucide-react";

function TradingViewWidget() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-card-border" style={{ height: 420 }}>
      <iframe
        src="https://s.tradingview.com/widgetembed/?frameElementId=tv_widget&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=1a1f2e&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en"
        width="100%"
        height="420"
        frameBorder="0"
        scrolling="no"
        allowTransparency={true}
        title="TradingView Chart"
      />
    </div>
  );
}

function CryptoPriceWidget({ symbol, label }: { symbol: string; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-card-border bg-card" style={{ height: 120 }}>
      <iframe
        src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${symbol}%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22dark%22%2C%22trendLineColor%22%3A%22rgba(243%2C186%2C47%2C1)%22%2C%22underLineColor%22%3A%22rgba(243%2C186%2C47%2C0.1)%22%2C%22underLineBottomColor%22%3A%22rgba(41%2C98%2C255%2C0)%22%2C%22isTransparent%22%3Atrue%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%7D`}
        width="100%"
        height="120"
        frameBorder="0"
        scrolling="no"
        title={label}
      />
    </div>
  );
}

export default function LandingPage() {
  const { data: plans } = useListPlans();

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
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

        {/* Price tickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <CryptoPriceWidget symbol="BINANCE%3ABTCUSDT" label="Bitcoin" />
          <CryptoPriceWidget symbol="BINANCE%3AETHUSDT" label="Ethereum" />
          <CryptoPriceWidget symbol="BINANCE%3ABNBUSDT" label="BNB" />
        </div>

        {/* TradingView */}
        <TradingViewWidget />
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
              { icon: BarChart2, title: "Real-Time Market Data", desc: "Live TradingView charts, price alerts, and portfolio analytics updated every second." },
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
