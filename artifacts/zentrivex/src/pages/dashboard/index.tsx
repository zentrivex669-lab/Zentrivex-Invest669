import { Link } from "wouter";
import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetDashboard, useListTransactions, useListInvestments } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Briefcase, Shield, AlertTriangle, ArrowRight, Building2, BarChart2, Maximize2, Minimize2, X } from "lucide-react";

const MARKET_PREVIEW = [
  { label: "S&P 500", value: "5,431", change: "+1.2%", positive: true },
  { label: "Portfolio RE", value: "$1.4B", change: "+18.4%", positive: true },
  { label: "Stock Port.", value: "$342M", change: "+28.4%", positive: true },
];

function StatCard({ label, value, sub, icon: Icon, color = "text-foreground" }: { label: string; value: string; sub?: string; icon: any; color?: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Icon size={15} className="text-muted-foreground" />
        </div>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function TradingViewChart() {
  const [fullscreen, setFullscreen] = useState(false);
  const [symbol, setSymbol] = useState("NASDAQ:AAPL");
  const [interval, setInterval] = useState("D");

  const symbols = [
    { label: "Apple", value: "NASDAQ:AAPL" },
    { label: "S&P 500", value: "SP:SPX" },
    { label: "Microsoft", value: "NASDAQ:MSFT" },
    { label: "JPMorgan", value: "NYSE:JPM" },
    { label: "Gold", value: "TVC:GOLD" },
    { label: "US Real Est.", value: "AMEX:VNQ" },
  ];

  const intervals = [
    { label: "1D", value: "D" },
    { label: "1W", value: "W" },
    { label: "1M", value: "M" },
    { label: "1H", value: "60" },
  ];

  const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tv_dash&symbol=${encodeURIComponent(symbol)}&interval=${interval}&hidesidetoolbar=0&symboledit=0&saveimage=0&toolbarbg=1a1f2e&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideas=1&locale=en&hide_top_toolbar=0&hide_legend=0&hide_volume=0`;

  const chartContent = (
    <div className={`flex flex-col ${fullscreen ? "h-full" : "h-full"}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-card-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-primary" />
          <span className="text-sm font-bold">Live Market Chart</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Interval selector */}
          <div className="flex gap-1">
            {intervals.map(iv => (
              <button key={iv.value} onClick={() => setInterval(iv.value)}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${interval === iv.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {iv.label}
              </button>
            ))}
          </div>
          {/* Symbol selector */}
          <select value={symbol} onChange={e => setSymbol(e.target.value)}
            className="h-7 rounded border border-card-border bg-secondary text-xs text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-primary">
            {symbols.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => setFullscreen(f => !f)}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title={fullscreen ? "Exit fullscreen" : "View fullscreen"}>
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          {fullscreen && (
            <button onClick={() => setFullscreen(false)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <iframe
        key={`${symbol}-${interval}`}
        src={chartUrl}
        className="flex-1 w-full"
        style={{ border: 0, minHeight: fullscreen ? "calc(100vh - 120px)" : "380px" }}
        allowTransparency={true}
        scrolling="no"
        title="TradingView Chart"
      />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {chartContent}
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden">
      {chartContent}
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: txs } = useListTransactions();
  const { data: investments } = useListInvestments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Welcome back, {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm">Your investment portfolio overview</p>
      </div>

      {user?.kycStatus !== "approved" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">
              {user?.kycStatus === "pending" ? "KYC Under Review — Awaiting Admin Approval" : "Identity Verification Required"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.kycStatus === "pending"
                ? "Your KYC documents have been submitted and are being reviewed by our compliance team."
                : "Complete KYC to unlock deposits, withdrawals, and investments."}
            </p>
          </div>
          {user?.kycStatus !== "pending" && (
            <Link href="/dashboard/kyc"><Button size="sm" variant="outline" className="text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10">Verify Now</Button></Link>
          )}
        </div>
      )}

      {/* Market strip */}
      <div className="grid grid-cols-3 gap-3">
        {MARKET_PREVIEW.map(m => (
          <div key={m.label} className="bg-card border border-card-border rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{m.label}</span>
            <div className="text-right">
              <p className="text-xs font-bold text-foreground">{m.value}</p>
              <p className={`text-xs font-semibold ${m.positive ? "text-green-400" : "text-red-400"}`}>{m.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : (<>
          <StatCard label="Portfolio Balance" value={`$${Number(dashboard?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="text-primary" />
          <StatCard label="Total Invested" value={`$${Number(dashboard?.totalInvested || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={Briefcase} />
          <StatCard label="Total Returns" value={`$${Number(dashboard?.totalProfit || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={ArrowUpCircle} color="text-green-400" />
          <StatCard label="Active Plans" value={String(dashboard?.activeInvestments || 0)} sub={`${dashboard?.pendingDeposits || 0} pending deposits`} icon={Building2} />
        </>)}
      </div>

      {/* TradingView Chart */}
      <TradingViewChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-primary" />Return Sources</h3>
            {[
              { label: "Real Estate Income", pct: 45, color: "bg-primary" },
              { label: "Stock Market Gains", pct: 35, color: "bg-blue-500" },
              { label: "Property Appreciation", pct: 20, color: "bg-green-500" },
            ].map(item => (
              <div key={item.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct * 2}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/dashboard/deposit"><Button variant="outline" className="w-full gap-2 text-xs h-9"><ArrowDownCircle size={13} />Deposit</Button></Link>
            <Link href="/dashboard/withdraw"><Button variant="outline" className="w-full gap-2 text-xs h-9"><ArrowUpCircle size={13} />Withdraw</Button></Link>
            <Link href="/dashboard/plans"><Button variant="outline" className="w-full gap-2 text-xs h-9"><TrendingUp size={13} />Invest</Button></Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Recent Transactions</h3>
              <Link href="/dashboard/transactions" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
            </div>
            {txs && txs.length > 0 ? (
              <div className="space-y-3">
                {txs.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-green-500/10" : tx.type === "withdrawal" ? "bg-red-500/10" : "bg-primary/10"}`}>
                        {tx.type === "deposit" ? <ArrowDownCircle size={14} className="text-green-400" /> : tx.type === "withdrawal" ? <ArrowUpCircle size={14} className="text-red-400" /> : <TrendingUp size={14} className="text-primary" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold capitalize">{tx.type === "investment" ? "Investment" : tx.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type === "withdrawal" || tx.type === "investment" ? "text-red-400" : "text-green-400"}`}>
                        {tx.type === "withdrawal" || tx.type === "investment" ? "-" : "+"}${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="outline" className={`text-xs ${tx.status === "completed" ? "border-green-500/30 text-green-400" : tx.status === "pending" ? "border-yellow-500/30 text-yellow-400" : "border-red-500/30 text-red-400"}`}>{tx.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet. Fund your account to get started.</div>
            )}
          </div>

          {investments && investments.filter(i => i.status === "active").length > 0 && (
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Building2 size={14} className="text-primary" />Active Investments</h3>
              <div className="space-y-3">
                {investments.filter(i => i.status === "active").slice(0, 3).map(inv => {
                  const start = new Date(inv.startDate).getTime();
                  const end = new Date(inv.endDate).getTime();
                  const now = Date.now();
                  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
                  return (
                    <div key={inv.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{inv.plan?.name}</span>
                        <span className="text-xs text-primary font-bold">${Number(inv.amount).toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete · ends {new Date(inv.endDate).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardLayout><DashboardContent /></DashboardLayout></ProtectedRoute>;
}
