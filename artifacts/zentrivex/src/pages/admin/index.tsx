import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetAdminDashboard } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, ArrowUpCircle, ArrowDownCircle, Shield, TrendingUp, Clock } from "lucide-react";

function StatCard({ label, value, icon: Icon, sub, accent = false }: { label: string; value: string | number; icon: any; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? "border-primary/30 bg-primary/5" : "border-card-border bg-card"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Icon size={15} className={accent ? "text-primary" : "text-muted-foreground"} />
        </div>
      </div>
      <p className={`text-2xl font-black ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function AdminDashboardContent() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform overview and pending actions</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : (
        <>
          {(Number(dashboard?.pendingDeposits) + Number(dashboard?.pendingWithdrawals) + Number(dashboard?.pendingKyc)) > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
              <Clock size={16} className="text-yellow-400" />
              <p className="text-sm font-semibold text-yellow-400">
                {dashboard?.pendingDeposits} deposit{dashboard?.pendingDeposits !== 1 ? "s" : ""},{" "}
                {dashboard?.pendingWithdrawals} withdrawal{dashboard?.pendingWithdrawals !== 1 ? "s" : ""},{" "}
                {dashboard?.pendingKyc} KYC verification{dashboard?.pendingKyc !== 1 ? "s" : ""} pending approval
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={dashboard?.totalUsers || 0} icon={Users} />
            <StatCard label="Platform Balance" value={`$${Number(dashboard?.platformBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={DollarSign} accent />
            <StatCard label="Total Deposits" value={`$${Number(dashboard?.totalDeposits || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={ArrowDownCircle} />
            <StatCard label="Total Withdrawals" value={`$${Number(dashboard?.totalWithdrawals || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={ArrowUpCircle} />
            <StatCard label="Pending Deposits" value={dashboard?.pendingDeposits || 0} icon={Clock} sub="Awaiting approval" />
            <StatCard label="Pending Withdrawals" value={dashboard?.pendingWithdrawals || 0} icon={Clock} sub="Awaiting approval" />
            <StatCard label="Pending KYC" value={dashboard?.pendingKyc || 0} icon={Shield} sub="Awaiting review" />
            <StatCard label="Total Invested" value={`$${Number(dashboard?.totalInvestments || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={TrendingUp} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowDownCircle size={16} className="text-green-400" />Recent Deposits</h3>
              <div className="space-y-3">
                {dashboard?.recentDeposits && dashboard.recentDeposits.length > 0 ? dashboard.recentDeposits.map((dep: any) => (
                  <div key={dep.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{dep.user?.firstName} {dep.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{dep.currency} · {new Date(dep.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${Number(dep.amount).toLocaleString()}</p>
                      <Badge variant="outline" className={`text-xs ${dep.status === "pending" ? "border-yellow-500/30 text-yellow-400" : dep.status === "approved" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>{dep.status}</Badge>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No deposits yet</p>}
              </div>
            </div>
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ArrowUpCircle size={16} className="text-red-400" />Recent Withdrawals</h3>
              <div className="space-y-3">
                {dashboard?.recentWithdrawals && dashboard.recentWithdrawals.length > 0 ? dashboard.recentWithdrawals.map((wd: any) => (
                  <div key={wd.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{wd.user?.firstName} {wd.user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{wd.walletAddress?.slice(0, 12)}... · {new Date(wd.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${Number(wd.amount).toLocaleString()}</p>
                      <Badge variant="outline" className={`text-xs ${wd.status === "pending" ? "border-yellow-500/30 text-yellow-400" : wd.status === "approved" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>{wd.status}</Badge>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No withdrawals yet</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminDashboardContent /></AdminLayout></ProtectedRoute>;
}
