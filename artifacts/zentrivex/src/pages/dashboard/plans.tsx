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
import { TrendingUp, Clock, DollarSign, Building2, Landmark, BarChart2 } from "lucide-react";

const PLAN_META = [
  { icon: Building2, type: "Real Estate Fund", desc: "Returns generated primarily from residential and commercial property rental income.", color: "text-orange-400" },
  { icon: BarChart2, type: "Blended Portfolio", desc: "50/50 split between premium real estate and actively managed stock market positions.", color: "text-primary" },
  { icon: Landmark, type: "Premium Fund", desc: "Institutional-grade exposure to global REITs, blue-chip equities, and prime commercial real estate.", color: "text-purple-400" },
  { icon: TrendingUp, type: "Elite Premium Fund", desc: "Exclusive institutional-grade access: top-tier commercial acquisitions plus a fully managed global stock portfolio. For high-net-worth investors.", color: "text-yellow-400" },
];

function PlansContent() {
  const { data: plans, isLoading } = useListPlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const investMutation = useCreateInvestment({
    mutation: {
      onSuccess: () => {
        toast({ title: "Investment activated!", description: "Your capital is now being deployed in our portfolio." });
        setSelectedPlan(null);
        setAmount("");
        qc.invalidateQueries({ queryKey: getListInvestmentsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Investment failed", description: e?.data?.error || "Could not activate investment", variant: "destructive" });
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Investment Packages</h1>
        <p className="text-muted-foreground text-sm">Choose a package to deploy your capital into our real estate and stock market portfolio.</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div><p className="text-muted-foreground text-xs mb-0.5">Properties Active</p><p className="font-black text-primary">142</p></div>
        <div><p className="text-muted-foreground text-xs mb-0.5">YTD Stock Return</p><p className="font-black text-green-400">+28.4%</p></div>
        <div><p className="text-muted-foreground text-xs mb-0.5">Portfolio Value</p><p className="font-black">$1.4B</p></div>
      </div>

      {isLoading && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-80 rounded-xl bg-card border border-card-border animate-pulse" />)}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans?.map((plan, i) => {
          const meta = PLAN_META[i] || PLAN_META[0];
          return (
            <div key={plan.id} className={`relative rounded-2xl border p-8 flex flex-col gap-4 hover:-translate-y-1 transition-all ${i === 1 ? "border-primary bg-primary/5" : "border-card-border bg-card"}`}>
              {i === 1 && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3">MOST POPULAR</Badge>}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <meta.icon size={18} className={meta.color} />
                </div>
                <div>
                  <h3 className="font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{meta.type}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-primary">{plan.roiPercent}%</span>
                <span className="text-muted-foreground text-sm">return</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{meta.desc}</p>
              <div className="space-y-2 text-sm border-t border-card-border pt-4">
                <div className="flex items-center gap-2 text-muted-foreground"><Clock size={13} /><span>Duration: <span className="text-foreground font-semibold">{plan.durationDays} days</span></span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><DollarSign size={13} /><span>Min: <span className="text-foreground font-semibold">${plan.minAmount.toLocaleString()}</span></span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><DollarSign size={13} /><span>Max: <span className="text-foreground font-semibold">${plan.maxAmount.toLocaleString()}</span></span></div>
              </div>
              <Button className="w-full mt-2" variant={i === 1 ? "default" : "outline"} onClick={() => { setSelectedPlan({ ...plan, meta }); setAmount(""); }}>
                <TrendingUp size={14} className="mr-2" /> Invest Now
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="bg-card border-card-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Invest — {selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-5">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Package type</span><span className="font-bold">{selectedPlan.meta.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Return rate</span><span className="font-bold text-primary">{selectedPlan.roiPercent}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{selectedPlan.durationDays} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Min investment</span><span className="font-semibold">${selectedPlan.minAmount.toLocaleString()}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Investment Amount (USD)</Label>
                <Input type="number" placeholder={`Min $${selectedPlan.minAmount}`} value={amount} onChange={e => setAmount(e.target.value)} className="h-11" />
                {amount && (
                  <p className="text-xs text-green-400">Estimated return: <strong>${(Number(amount) * selectedPlan.roiPercent / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> after {selectedPlan.durationDays} days</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Your capital will be deployed into {selectedPlan.meta.type.toLowerCase()} assets managed by our portfolio team.</p>
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
