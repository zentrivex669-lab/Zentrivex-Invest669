import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListPlans } from "@workspace/api-client-react";
import { ArrowRight, TrendingUp, Shield, Building2, Globe, BarChart2, CheckCircle, Home, Landmark, LineChart, Users, DollarSign, Star, MapPin, Quote } from "lucide-react";

const MARKET_STATS = [
  { label: "S&P 500", value: "5,431.60", change: "+1.2%", positive: true },
  { label: "Dow Jones", value: "39,118", change: "+0.8%", positive: true },
  { label: "NASDAQ", value: "17,372", change: "+1.5%", positive: true },
  { label: "US10Y Bond", value: "4.28%", change: "-0.03%", positive: false },
  { label: "Gold", value: "$2,387", change: "+0.4%", positive: true },
  { label: "Oil (WTI)", value: "$78.42", change: "-0.9%", positive: false },
  { label: "EUR/USD", value: "1.0842", change: "+0.2%", positive: true },
  { label: "Bitcoin", value: "$67,210", change: "+3.1%", positive: true },
];

function MarketTicker() {
  return (
    <div className="border-y border-card-border bg-card/40 overflow-hidden py-3">
      <div style={{ animation: "scroll 40s linear infinite" }} className="flex gap-12 whitespace-nowrap">
        {[...MARKET_STATS, ...MARKET_STATS].map((s, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <span className="font-bold text-sm text-foreground">{s.label}</span>
            <span className="text-sm font-semibold text-muted-foreground">{s.value}</span>
            <span className={`text-xs font-bold ${s.positive ? "text-green-400" : "text-red-400"}`}>{s.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PROPERTIES = [
  {
    title: "One Vanderbilt, Midtown",
    location: "New York, USA",
    type: "Commercial",
    return: "18.4%",
    value: "$24.6M",
    status: "Fully Leased",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&fit=crop",
    tenant: "Class A — Office Tower",
  },
  {
    title: "Marina Gate Tower",
    location: "Dubai, UAE",
    type: "Residential",
    return: "22.1%",
    value: "$15.2M",
    status: "94% Occupied",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80&fit=crop",
    tenant: "Luxury Residences",
  },
  {
    title: "Canary Wharf Plaza",
    location: "London, UK",
    type: "Commercial",
    return: "16.8%",
    value: "$31.4M",
    status: "Fully Leased",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&fit=crop",
    tenant: "Grade A — Financial Hub",
  },
];

const TESTIMONIALS = [
  {
    name: "James Whitfield",
    title: "Retired CFO, New York",
    quote: "After 3 years with Zentrivex, my portfolio has returned consistently above what my previous fund manager was delivering. The real estate backing gives me genuine confidence.",
    return: "31.2%",
    period: "3-year return",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&q=80&fit=crop&crop=face",
    stars: 5,
  },
  {
    name: "Amara Okonkwo",
    title: "Entrepreneur, Lagos",
    quote: "I was skeptical at first but the transparency around their property portfolio won me over. The dashboard is clean, the returns are real, and customer service is excellent.",
    return: "28.7%",
    period: "2-year return",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80&fit=crop&crop=face",
    stars: 5,
  },
  {
    name: "Stefan Müller",
    title: "Software Director, Munich",
    quote: "Zentrivex gives me exposure to global real estate without the headache of direct property ownership. My dividend income has been reliable every single quarter.",
    return: "24.5%",
    period: "18-month return",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80&fit=crop&crop=face",
    stars: 5,
  },
];

function PropertyCard({ prop }: { prop: typeof PROPERTIES[0] }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={prop.img}
          alt={prop.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-sm leading-tight">{prop.title}</p>
            <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={10} />{prop.location}
            </p>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs backdrop-blur">{prop.status}</Badge>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-muted-foreground mb-4">{prop.tenant}</p>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-card-border text-center">
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-xs font-bold mt-0.5">{prop.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Annual ROI</p>
            <p className="text-xs font-black text-primary mt-0.5">{prop.return}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="text-xs font-bold mt-0.5">{prop.value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockPortfolioPreview() {
  const stocks = [
    { ticker: "AAPL", name: "Apple Inc.", allocation: 18, change: "+2.1%" },
    { ticker: "MSFT", name: "Microsoft Corp.", allocation: 15, change: "+1.8%" },
    { ticker: "BRK.B", name: "Berkshire Hathaway", allocation: 12, change: "+0.6%" },
    { ticker: "JPM", name: "JPMorgan Chase", allocation: 10, change: "+1.2%" },
    { ticker: "VNQ", name: "REIT ETF", allocation: 25, change: "+0.9%" },
    { ticker: "Others", name: "Diversified Portfolio", allocation: 20, change: "+1.4%" },
  ];
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold">Active Stock Portfolio</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Managed by our expert traders</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">YTD Return</p>
          <p className="text-xl font-black text-primary">+28.4%</p>
        </div>
      </div>
      <div className="space-y-3">
        {stocks.map((s) => (
          <div key={s.ticker} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-black text-primary">{s.ticker.slice(0, 3)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold">{s.name}</span>
                <span className="text-xs text-green-400 font-bold">{s.change}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${s.allocation}%` }} />
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right">{s.allocation}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: plans } = useListPlans();

  return (
    <div className="min-h-screen text-foreground" style={{
      background: "radial-gradient(ellipse 100% 55% at 50% 0%, rgba(13,148,136,0.32) 0%, transparent 65%), radial-gradient(ellipse 50% 35% at 90% 15%, rgba(234,179,8,0.13) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 5% 25%, rgba(13,148,136,0.10) 0%, transparent 50%), #040f0e"
    }}>
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
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">Zentrivex</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/register"><Button size="sm" className="gap-1">Get Started <ArrowRight size={14} /></Button></Link>
          </div>
        </div>
      </nav>

      {/* Market Ticker */}
      <MarketTicker />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Real Estate & Stock Market Investments</Badge>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6">
              Build Lasting<br />
              <span className="text-primary">Wealth Through</span><br />
              Premium Assets
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Zentrivex pools investor capital into premium real estate properties and professionally managed stock portfolios — delivering consistent, above-market returns since 2015.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register"><Button size="lg" className="gap-2 text-base px-8 h-12 font-semibold">Start Investing <ArrowRight size={16} /></Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="text-base px-8 h-12">Sign In</Button></Link>
            </div>
            <div className="flex gap-8 mt-10 pt-8 border-t border-card-border">
              <div><p className="text-2xl font-black text-primary">$1.4B+</p><p className="text-xs text-muted-foreground mt-0.5">Assets Under Management</p></div>
              <div><p className="text-2xl font-black text-primary">28.4%</p><p className="text-xs text-muted-foreground mt-0.5">Avg. Annual Return</p></div>
              <div><p className="text-2xl font-black text-primary">9 yrs</p><p className="text-xs text-muted-foreground mt-0.5">Track Record</p></div>
            </div>
          </div>
          <div className="space-y-4">
            <StockPortfolioPreview />
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Home, label: "Properties", value: "142" },
                { icon: LineChart, label: "Markets", value: "12" },
                { icon: Users, label: "Investors", value: "24K+" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card border border-card-border rounded-xl p-4 text-center">
                  <Icon size={18} className="text-primary mx-auto mb-2" />
                  <p className="text-lg font-black">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-card-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Assets Under Management", value: "$1.4B+" },
            { label: "Active Investors", value: "24,000+" },
            { label: "Countries Served", value: "52" },
            { label: "Avg. Annual Return", value: "28.4%" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-primary mb-1">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Properties — with real building photos */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Real Estate Portfolio</Badge>
          <h2 className="text-4xl font-black tracking-tight mb-4">Our Active Properties</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Your investment funds are deployed across premium commercial and residential properties in top global markets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PROPERTIES.map((prop) => <PropertyCard key={prop.title} prop={prop} />)}
        </div>
        <p className="text-center text-sm text-muted-foreground">+ 139 more properties across 52 countries</p>
      </section>

      {/* Real Investors Section */}
      <section className="border-y border-card-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Investor Stories</Badge>
            <h2 className="text-4xl font-black tracking-tight mb-4">Real People. Real Returns.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Thousands of investors across the globe trust Zentrivex to grow their wealth through premium real assets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-card-border rounded-2xl p-7 flex flex-col gap-5 hover:-translate-y-1 transition-all">
                <Quote size={28} className="text-primary/40" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={12} className="text-primary fill-primary" />
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-card-border">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{t.return}</p>
                    <p className="text-xs text-muted-foreground">{t.period}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="bg-card/30 border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Investment Packages</Badge>
            <h2 className="text-4xl font-black tracking-tight mb-4">Choose Your Package</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Transparent returns from real estate rental income and stock market gains — zero hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans?.map((plan, i) => (
              <div key={plan.id} className={`relative rounded-2xl border p-8 flex flex-col gap-4 transition-all hover:-translate-y-1 ${i === 1 ? "border-primary bg-primary/5" : "border-card-border bg-card"}`}>
                {i === 1 && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3">MOST POPULAR</Badge>}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {i === 0 ? <Home size={18} className="text-primary" /> : i === 1 ? <Building2 size={18} className="text-primary" /> : <Landmark size={18} className="text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{i === 0 ? "Real Estate Fund" : i === 1 ? "Mixed Portfolio" : "Premium Fund"}</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-primary">{plan.roiPercent}%</span>
                  <span className="text-muted-foreground text-sm">return / {plan.durationDays} days</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Min investment</span><span className="text-foreground font-semibold">${plan.minAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Max investment</span><span className="text-foreground font-semibold">${plan.maxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Investment period</span><span className="text-foreground font-semibold">{plan.durationDays} days</span></div>
                  <div className="flex justify-between"><span>Source</span><span className="text-foreground font-semibold">{i === 0 ? "Rental income" : i === 1 ? "RE + Stocks" : "Stocks + RE"}</span></div>
                </div>
                <Link href="/register"><Button className="w-full mt-2" variant={i === 1 ? "default" : "outline"}>Invest Now</Button></Link>
              </div>
            ))}
            {(!plans || plans.length === 0) && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">Loading packages...</div>
            )}
          </div>
        </div>
      </section>

      {/* How we invest */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-xs font-semibold tracking-widest uppercase">Our Strategy</Badge>
            <h2 className="text-4xl font-black tracking-tight mb-6">How We Generate Returns</h2>
            <div className="space-y-6">
              {[
                { icon: Building2, title: "Real Estate Acquisitions", desc: "We purchase commercial and residential properties in high-growth markets, generating income through rental yields and capital appreciation." },
                { icon: BarChart2, title: "Stock Market Trading", desc: "Our expert trading desk manages a diversified portfolio of blue-chip stocks, REITs, and ETFs, consistently outperforming the S&P 500." },
                { icon: DollarSign, title: "Returns Distributed to Investors", desc: "Profits from both income streams are pooled and paid out to investors according to their package — transparently and on schedule." },
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
          <div className="space-y-4">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h4 className="font-bold text-sm mb-4">Return Sources (Current Quarter)</h4>
              {[
                { label: "Residential Rental Income", pct: 35, color: "bg-primary" },
                { label: "Commercial Property Leases", pct: 28, color: "bg-blue-500" },
                { label: "Stock Portfolio Gains", pct: 22, color: "bg-green-500" },
                { label: "Property Appreciation", pct: 15, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-bold">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-card-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Properties Owned</p>
                <p className="text-2xl font-black text-primary">142</p>
                <p className="text-xs text-green-400 mt-1">+12 this year</p>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-2xl font-black text-primary">$1.4B</p>
                <p className="text-xs text-green-400 mt-1">+18.4% YoY</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/30 border-y border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-4">Why Invest With Us</h2>
            <p className="text-muted-foreground">Institutional expertise, accessible to every investor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Regulated & Secure", desc: "Fully licensed investment firm. Your capital is segregated in regulated custodian accounts, never co-mingled with operational funds." },
              { icon: Building2, title: "Tangible Asset Backing", desc: "Unlike pure financial products, your investment is backed by real physical properties and blue-chip equities." },
              { icon: BarChart2, title: "Dual Income Streams", desc: "Returns come from both property rental income and stock market gains — diversified and resilient across market cycles." },
              { icon: CheckCircle, title: "Verified KYC", desc: "Full AML/KYC compliance ensures a safe and legally compliant investment environment for all participants." },
              { icon: Globe, title: "Global Property Access", desc: "Invest in premium properties across New York, Dubai, London, Singapore and 48 other markets from anywhere in the world." },
              { icon: TrendingUp, title: "Consistent Track Record", desc: "9 consecutive years of above-market returns. Our blended strategy has never missed a quarterly distribution." },
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

      {/* Steps */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight mb-4">How To Get Started</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Create Account", desc: "Register in minutes with your email and personal details." },
            { step: "02", title: "Verify Identity", desc: "Complete KYC verification to comply with AML regulations." },
            { step: "03", title: "Fund Your Account", desc: "Deposit funds via our secure payment channels." },
            { step: "04", title: "Earn Returns", desc: "We put your capital to work in real estate and markets." },
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
        <div className="relative rounded-2xl border border-primary/30 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fit=crop"
            alt="Premium real estate skyline"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="relative p-12 text-center">
            <h2 className="text-4xl font-black tracking-tight mb-4">Start Building Real Wealth Today</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join 24,000+ investors earning consistent returns through our premium real estate and stock market funds.</p>
            <Link href="/register"><Button size="lg" className="gap-2 text-base px-10 h-12 font-bold">Open an Account <ArrowRight size={16} /></Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Building2 size={12} className="text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">Zentrivex</span>
            <span className="text-xs text-muted-foreground ml-2">Real Estate & Market Investments</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Zentrivex Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
