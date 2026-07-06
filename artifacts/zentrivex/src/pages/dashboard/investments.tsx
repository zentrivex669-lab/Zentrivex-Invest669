import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListInvestments } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, ChevronDown } from "lucide-react";
import ProfitHistoryChart from "@/components/ProfitHistoryChart";

function statusStyle(status: string) {
  if (status === "active") return "bg-blue-500/10 text-blue-400 border-blue-500/30";
  if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/30";
  return "bg-red-500/10 text-red-400 border-red-500/30";
}

function InvestmentsContent() {
  const { data: investments, isLoading } = useListInvestments();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">My Investments</h1>
          <p className="text-muted-foreground text-sm">Track all your active and completed investment plans.</p>
        </div>
        <Link href="/dashboard/plans"><Button size="sm" className="gap-2"><TrendingUp size={14} />New Investment</Button></Link>
      </div>

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-card border border-card-border animate-pulse" />)}</div>}

      {investments && investments.length === 0 && (
        <div className="bg-card border border-card-border rounded-xl p-12 text-center">
          <TrendingUp size={40} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">No investments yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Start your first investment by choosing a plan and depositing funds.</p>
          <Link href="/dashboard/plans"><Button>Browse Plans</Button></Link>
        </div>
      )}

      <div className="space-y-4">
        {investments?.map(inv => {
          const start = new Date(inv.startDate).getTime();
          const end = new Date(inv.endDate).getTime();
          const now = Date.now();
          const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
          const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
          return (
            <div key={inv.id} className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{inv.plan?.name || "Investment Plan"}</h3>
                    <p className="text-xs text-muted-foreground">Started {new Date(inv.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`text-xs ${statusStyle(inv.status)}`}>{inv.status.toUpperCase()}</Badge>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="font-bold">${Number(inv.amount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">ROI</p>
                  <p className="font-bold text-primary">{inv.plan?.roiPercent}%</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Profit</p>
                  <p className="font-bold text-green-400">${Number(inv.profit).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ends</p>
                  <p className="font-bold">{new Date(inv.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              {inv.status === "active" && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} /> {Math.round(progress)}% complete</span>
                    <span className="text-xs text-muted-foreground">{daysLeft} days remaining</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button
                onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-card-border"
              >
                Profit History
                <ChevronDown size={14} className={`transition-transform ${expandedId === inv.id ? "rotate-180" : ""}`} />
              </button>
              {expandedId === inv.id && (
                <div className="pt-3">
                  <ProfitHistoryChart investmentId={inv.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InvestmentsPage() {
  return <ProtectedRoute><DashboardLayout><InvestmentsContent /></DashboardLayout></ProtectedRoute>;
}
