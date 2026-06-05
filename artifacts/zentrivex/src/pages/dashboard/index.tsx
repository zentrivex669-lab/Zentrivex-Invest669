import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetDashboard, useListTransactions, useListInvestments } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Briefcase, Shield, AlertTriangle, ArrowRight } from "lucide-react";

function TradingMiniWidget() {
  return (
    <div className="rounded-xl overflow-hidden border border-card-border" style={{ height: 300 }}>
      <iframe
        src="https://s.tradingview.com/widgetembed/?frameElementId=tv_dash&symbol=BINANCE%3ABTCUSDT&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=1a1f2e&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=0&hideideas=1&locale=en"
        width="100%" height="300" frameBorder="0" scrolling="no" title="BTC Chart"
      />
    </div>
  );
}

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

function DashboardContent() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetDashboard();
  const { data: txs } = useListTransactions();
  const { data: investments } = useListInvestments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Welcome back, {user?.firstName}</h1>
        <p className="text-muted-foreground text-sm">Here's your portfolio overview</p>
      </div>

      {user?.kycStatus !== "approved" && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-400">KYC Verification Required</p>
            <p className="text-xs text-muted-foreground">Complete identity verification to unlock all features</p>
          </div>
          <Link href="/dashboard/kyc"><Button size="sm" variant="outline" className="text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/10">Verify Now</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : (<>
          <StatCard label="Total Balance" value={`$${Number(dashboard?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="text-primary" />
          <StatCard label="Total Invested" value={`$${Number(dashboard?.totalInvested || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={Briefcase} />
          <StatCard label="Total Profit" value={`$${Number(dashboard?.totalProfit || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={ArrowUpCircle} color="text-green-400" />
          <StatCard label="Active Plans" value={String(dashboard?.activeInvestments || 0)} sub={`${dashboard?.pendingDeposits || 0} pending deposits`} icon={ArrowDownCircle} />
        </>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TradingMiniWidget />
          <div className="grid grid-cols-3 gap-3">
            <Link href="/dashboard/deposit"><Button variant="outline" className="w-full gap-2 text-sm"><ArrowDownCircle size={14} />Deposit</Button></Link>
            <Link href="/dashboard/withdraw"><Button variant="outline" className="w-full gap-2 text-sm"><ArrowUpCircle size={14} />Withdraw</Button></Link>
            <Link href="/dashboard/plans"><Button variant="outline" className="w-full gap-2 text-sm"><TrendingUp size={14} />Invest</Button></Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Recent Activity</h3>
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
                        <p className="text-xs font-semibold capitalize">{tx.type}</p>
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
              <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet. Make your first deposit to get started.</div>
            )}
          </div>

          {investments && investments.filter(i => i.status === "active").length > 0 && (
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h3 className="font-bold text-sm mb-4">Active Investments</h3>
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
