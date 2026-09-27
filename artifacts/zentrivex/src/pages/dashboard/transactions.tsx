import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListTransactions } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign } from "lucide-react";

function txIcon(type: string) {
  if (type === "deposit") return <ArrowDownCircle size={16} className="text-green-400" />;
  if (type === "withdrawal") return <ArrowUpCircle size={16} className="text-red-400" />;
  if (type === "investment") return <TrendingUp size={16} className="text-blue-400" />;
  return <DollarSign size={16} className="text-primary" />;
}

function txColor(type: string) {
  if (type === "deposit" || type === "profit" || type === "referral") return "text-green-400";
  return "text-red-400";
}

function statusBadge(status: string) {
  if (status === "completed") return "bg-green-500/10 text-green-400 border-green-500/30";
  if (status === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/10 text-red-400 border-red-500/30";
}

function TransactionsContent() {
  const { data: txs, isLoading } = useListTransactions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Transaction History</h1>
        <p className="text-muted-foreground text-sm">Complete record of all your account activity.</p>
      </div>
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        {isLoading && (
          <div className="space-y-0 divide-y divide-card-border">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 animate-pulse bg-secondary/20" />)}
          </div>
        )}
        {txs && txs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <DollarSign size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No transactions yet</p>
            <p className="text-sm mt-1">Your transaction history will appear here.</p>
          </div>
        )}
        {txs && txs.length > 0 && (
          <div className="divide-y divide-card-border">
            <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
              <div className="col-span-2">Transaction</div>
              <div>Type</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Status</div>
            </div>
            {txs.map(tx => (
              <div key={tx.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">{txIcon(tx.type)}</div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center sm:justify-start"><Badge variant="outline" className="text-xs capitalize">{tx.type}</Badge></div>
                <div className="flex items-center sm:justify-end">
                  <span className={`text-sm font-bold ${txColor(tx.type)}`}>
                    {tx.type === "withdrawal" || tx.type === "investment" ? "-" : "+"}${Number(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center sm:justify-end">
                  <Badge variant="outline" className={`text-xs ${statusBadge(tx.status)}`}>{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return <ProtectedRoute><DashboardLayout><TransactionsContent /></DashboardLayout></ProtectedRoute>;
}
