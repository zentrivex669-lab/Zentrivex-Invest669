import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCreateDeposit, useListDeposits, getListDepositsQueryKey } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Upload, CheckCircle, Clock, XCircle, Building2, Info, Bitcoin, Loader2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  label: string;
  type: "bank" | "crypto";
  details?: string;
  address?: string;
  note?: string;
  enabled: boolean;
}

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await fetch("/api/settings/payment");
  if (!res.ok) throw new Error("Failed to load payment methods");
  return res.json();
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>;
  if (status === "rejected") return <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>;
}

function DepositContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: deposits } = useListDeposits();

  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
    select: (d) => d.filter(m => m.enabled),
  });

  const enabledMethods = paymentMethods ?? [];
  const selectedMethod = enabledMethods.find(m => m.id === selectedId) ?? enabledMethods[0] ?? null;

  const depositMutation = useCreateDeposit({
    mutation: {
      onSuccess: () => {
        toast({ title: "Deposit submitted!", description: "Your deposit is under review. Funds will be credited within 24 hours." });
        setAmount(""); setTxHash(""); setProofImage(null);
        qc.invalidateQueries({ queryKey: getListDepositsQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Submission failed", description: e?.data?.error || "Could not submit deposit", variant: "destructive" });
      }
    }
  });

  const addressOrDetails = selectedMethod
    ? (selectedMethod.type === "crypto" ? selectedMethod.address : selectedMethod.details) ?? ""
    : "";

  const copyAddress = () => {
    if (!addressOrDetails) return;
    navigator.clipboard.writeText(addressOrDetails);
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
        <p className="text-muted-foreground text-sm">Add capital to your investment account. All deposits are reviewed and credited within 24 hours.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Building2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-primary mb-1">Your capital is immediately deployed</p>
          <p className="text-muted-foreground text-xs">Once approved, funds are allocated across our real estate portfolio and managed stock positions to begin generating returns for you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
          <h3 className="font-bold">Step 1 — Choose Payment Method</h3>
          {methodsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading methods...
            </div>
          ) : (
            <div className="space-y-2">
              {enabledMethods.map(m => (
                <button key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2.5 ${selectedMethod?.id === m.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-card-border hover:text-foreground"}`}>
                  {m.type === "crypto" ? <Bitcoin size={15} /> : <Building2 size={15} />}
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {selectedMethod && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                {selectedMethod.type === "crypto" ? "Wallet Address:" : "Bank Details:"}
              </Label>
              <div className="bg-secondary rounded-lg p-3 flex items-start gap-2">
                <code className="text-xs text-foreground flex-1 break-all leading-relaxed">{addressOrDetails}</code>
                <button onClick={copyAddress} className={`flex-shrink-0 transition-colors mt-0.5 ${copied ? "text-green-400" : "text-muted-foreground hover:text-foreground"}`}>
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              {selectedMethod.note && (
                <div className="flex items-start gap-2 mt-2">
                  <Info size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400">{selectedMethod.note}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
          <h3 className="font-bold">Step 2 — Submit Deposit Details</h3>
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="e.g. 5000" value={amount} onChange={e => setAmount(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Transaction Reference / Hash (optional)</Label>
            <Input placeholder="Wire ref. or blockchain tx hash" value={txHash} onChange={e => setTxHash(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Proof of Payment (optional)</Label>
            <label className={`flex items-center gap-3 h-11 px-3 rounded-lg border cursor-pointer transition-all ${proofImage ? "border-green-500/40 bg-green-500/5" : "border-card-border bg-secondary hover:bg-secondary/80"}`}>
              <Upload size={15} className={proofImage ? "text-green-400" : "text-muted-foreground"} />
              <span className="text-sm text-muted-foreground">{proofImage ? "Receipt uploaded ✓" : "Upload receipt / screenshot"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <Button className="w-full h-11 font-semibold"
            disabled={!amount || !selectedMethod || depositMutation.isPending}
            onClick={() => {
              if (!selectedMethod) return;
              depositMutation.mutate({
                data: {
                  amount: Number(amount),
                  currency: selectedMethod.label,
                  walletAddress: addressOrDetails,
                  txHash: txHash || undefined,
                  proofImage: proofImage || undefined,
                }
              });
            }}>
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
                  {dep.rejectionReason && <p className="text-xs text-red-400 mt-0.5">Reason: {dep.rejectionReason}</p>}
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
