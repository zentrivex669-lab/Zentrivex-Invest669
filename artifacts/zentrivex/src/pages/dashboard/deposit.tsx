import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCreateDeposit, useListDeposits, getListDepositsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Upload, CheckCircle, Clock, XCircle } from "lucide-react";

const CURRENCIES = ["BTC", "ETH", "USDT", "BNB", "SOL"];
const WALLET_ADDRESSES: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x742d35Cc6634C0532925a3b8D4C9B4E9f5a2E7a1",
  USDT: "TGJHn3yCLXBvqxHpLHsJN3VuUFekiQPJsW",
  BNB: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2",
  SOL: "8yS3N3aVcD5YWyEmPkrTvnCnEBRBMsyuX5HH7wW2Zj3",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>;
}

function DepositContent() {
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: deposits } = useListDeposits();

  const depositMutation = useCreateDeposit({
    mutation: {
      onSuccess: () => {
        toast({ title: "Deposit submitted!", description: "Your deposit is pending admin approval." });
        setAmount(""); setTxHash(""); setProofImage(null);
        qc.invalidateQueries({ queryKey: getListDepositsQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Submission failed", description: e?.data?.error || "Could not submit deposit", variant: "destructive" });
      }
    }
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESSES[currency]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProofImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Deposit Funds</h1>
        <p className="text-muted-foreground text-sm">Send crypto to your dedicated wallet address below, then submit your deposit details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
          <h3 className="font-bold">Step 1 — Select Currency & Copy Address</h3>
          <div className="flex gap-2 flex-wrap">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${currency === c ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-card-border hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Send {currency} to this address:</Label>
            <div className="bg-secondary rounded-lg p-3 flex items-center gap-2">
              <code className="text-xs text-foreground flex-1 break-all">{WALLET_ADDRESSES[currency]}</code>
              <button onClick={copyAddress} className={`flex-shrink-0 transition-colors ${copied ? "text-green-400" : "text-muted-foreground hover:text-foreground"}`}>
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-yellow-400 mt-2">Send only {currency}. Sending another coin will result in permanent loss.</p>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
          <h3 className="font-bold">Step 2 — Submit Deposit Details</h3>
          <div className="space-y-2">
            <Label>Amount ({currency})</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Transaction Hash (optional)</Label>
            <Input placeholder="0x..." value={txHash} onChange={e => setTxHash(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Proof of Payment (optional)</Label>
            <label className={`flex items-center gap-3 h-11 px-3 rounded-lg border cursor-pointer transition-all ${proofImage ? "border-green-500/40 bg-green-500/5" : "border-card-border bg-secondary hover:bg-secondary/80"}`}>
              <Upload size={15} className={proofImage ? "text-green-400" : "text-muted-foreground"} />
              <span className="text-sm text-muted-foreground">{proofImage ? "Image uploaded" : "Upload screenshot"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <Button className="w-full h-11 font-semibold" disabled={!amount || depositMutation.isPending}
            onClick={() => depositMutation.mutate({ data: { amount: Number(amount), currency, walletAddress: WALLET_ADDRESSES[currency], txHash: txHash || undefined, proofImage: proofImage || undefined } })}>
            {depositMutation.isPending ? "Submitting..." : "Submit Deposit Request"}
          </Button>
        </div>
      </div>

      {deposits && deposits.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h3 className="font-bold mb-4">Deposit History</h3>
          <div className="space-y-3">
            {deposits.map(dep => (
              <div key={dep.id} className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
                <div>
                  <p className="text-sm font-semibold">{dep.currency} · ${Number(dep.amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={dep.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepositPage() {
  return <ProtectedRoute><DashboardLayout><DepositContent /></DashboardLayout></ProtectedRoute>;
}
