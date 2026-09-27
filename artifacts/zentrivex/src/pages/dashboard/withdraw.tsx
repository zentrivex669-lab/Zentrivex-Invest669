import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCreateWithdrawal, useListWithdrawals, getListWithdrawalsQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const NETWORKS = ["BTC", "ETH (ERC-20)", "BSC (BEP-20)", "TRON (TRC-20)", "Solana"];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>;
}

function WithdrawContent() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("ETH (ERC-20)");
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: withdrawals } = useListWithdrawals();

  const withdrawMutation = useCreateWithdrawal({
    mutation: {
      onSuccess: () => {
        toast({ title: "Withdrawal submitted!", description: "Your withdrawal is pending admin approval." });
        setAmount(""); setWalletAddress("");
        qc.invalidateQueries({ queryKey: getListWithdrawalsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Withdrawal failed", description: e?.data?.error || "Could not submit withdrawal", variant: "destructive" });
      }
    }
  });

  const balance = Number(user?.balance || 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Withdraw Funds</h1>
        <p className="text-muted-foreground text-sm">Request a withdrawal from your balance. Admin approval required.</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Balance</span>
          <span className="text-2xl font-black text-primary">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>

        {balance === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-yellow-400" />
            <p className="text-xs text-yellow-400">Your balance is $0.00. Make a deposit and wait for admin approval to receive funds.</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Network</Label>
          <div className="flex gap-2 flex-wrap">
            {NETWORKS.map(n => (
              <button key={n} onClick={() => setNetwork(n)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${network === n ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-card-border hover:text-foreground"}`}>{n}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <Input placeholder="Your receiving wallet address" value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="h-11" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Amount (USD)</Label>
            <button className="text-xs text-primary hover:underline" onClick={() => setAmount(String(balance))}>Max: ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</button>
          </div>
          <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="h-11" max={balance} />
        </div>

        <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p>Withdrawals are processed within 24-48 hours after admin approval.</p>
          <p>Minimum withdrawal: $10.00</p>
        </div>

        <Button className="w-full h-11 font-semibold" disabled={!amount || !walletAddress || Number(amount) > balance || Number(amount) < 10 || withdrawMutation.isPending}
          onClick={() => withdrawMutation.mutate({ data: { amount: Number(amount), walletAddress, network } })}>
          {withdrawMutation.isPending ? "Submitting..." : "Request Withdrawal"}
        </Button>
      </div>

      {withdrawals && withdrawals.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h3 className="font-bold mb-4">Withdrawal History</h3>
          <div className="space-y-3">
            {withdrawals.map(wd => (
              <div key={wd.id} className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
                <div>
                  <p className="text-sm font-semibold">${Number(wd.amount).toLocaleString()} · {wd.network}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">{wd.walletAddress}</p>
                  <p className="text-xs text-muted-foreground">{new Date(wd.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={wd.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WithdrawPage() {
  return <ProtectedRoute><DashboardLayout><WithdrawContent /></DashboardLayout></ProtectedRoute>;
}
