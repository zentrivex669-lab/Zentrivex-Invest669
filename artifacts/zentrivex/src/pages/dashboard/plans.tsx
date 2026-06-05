import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListPlans, useCreateInvestment, getListInvestmentsQueryKey, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Clock, DollarSign, Percent } from "lucide-react";

function PlansContent() {
  const { data: plans, isLoading } = useListPlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const investMutation = useCreateInvestment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Investment started!", description: "Your investment is now active." });
        setSelectedPlan(null);
        setAmount("");
        qc.invalidateQueries({ queryKey: getListInvestmentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Investment failed", description: e?.data?.error || "Could not start investment", variant: "destructive" });
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Investment Plans</h1>
        <p className="text-muted-foreground text-sm">Choose a plan and start earning fixed returns on your crypto holdings.</p>
      </div>

      {isLoading && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-64 rounded-xl bg-card border border-card-border animate-pulse" />)}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan, i) => (
          <div key={plan.id} className={`relative rounded-2xl border p-8 flex flex-col gap-4 hover:-translate-y-1 transition-all ${i === 1 ? "border-primary bg-primary/5" : "border-card-border bg-card"}`}>
            {i === 1 && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3">MOST POPULAR</Badge>}
            <div>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-primary">{plan.roiPercent}%</span>
              <span className="text-muted-foreground text-sm">ROI</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} /><span>Duration: <span className="text-foreground font-semibold">{plan.durationDays} days</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign size={14} /><span>Min: <span className="text-foreground font-semibold">${plan.minAmount.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign size={14} /><span>Max: <span className="text-foreground font-semibold">${plan.maxAmount.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Percent size={14} /><span>Total return: <span className="text-green-400 font-semibold">{plan.roiPercent}% on invested amount</span></span>
              </div>
            </div>
            <Button className="w-full mt-2" variant={i === 1 ? "default" : "outline"} onClick={() => { setSelectedPlan(plan); setAmount(""); }}>
              <TrendingUp size={14} className="mr-2" /> Invest Now
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="bg-card border-card-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Invest in {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-5">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">ROI</span><span className="font-bold text-primary">{selectedPlan.roiPercent}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{selectedPlan.durationDays} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Min amount</span><span className="font-semibold">${selectedPlan.minAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max amount</span><span className="font-semibold">${selectedPlan.maxAmount.toLocaleString()}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Investment Amount (USD)</Label>
                <Input type="number" placeholder={`Min $${selectedPlan.minAmount}`} value={amount} onChange={e => setAmount(e.target.value)} className="h-11" min={selectedPlan.minAmount} max={selectedPlan.maxAmount} />
                {amount && (
                  <p className="text-xs text-green-400">Estimated return: ${(Number(amount) * selectedPlan.roiPercent / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} after {selectedPlan.durationDays} days</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
            <Button disabled={!amount || investMutation.isPending} onClick={() => investMutation.mutate({ data: { planId: selectedPlan.id, amount: Number(amount) } })}>
              {investMutation.isPending ? "Processing..." : "Confirm Investment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlansPage() {
  return <ProtectedRoute><DashboardLayout><PlansContent /></DashboardLayout></ProtectedRoute>;
}
