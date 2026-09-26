import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListPlans, useCreatePlan, useUpdatePlan, useDeletePlan, getListPlansQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";

const empty = { name: "", description: "", minAmount: "", maxAmount: "", roiPercent: "", durationDays: "", isActive: true };

function AdminPlansContent() {
  const { data: plans, isLoading } = useListPlans();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const { toast } = useToast();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListPlansQueryKey() });

  const createMutation = useCreatePlan({
    mutation: {
      onSuccess: () => { toast({ title: "Plan created" }); setOpen(false); setForm(empty); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const updateMutation = useUpdatePlan({
    mutation: {
      onSuccess: () => { toast({ title: "Plan updated" }); setEditing(null); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const deleteMutation = useDeletePlan({
    mutation: {
      onSuccess: () => { toast({ title: "Plan deactivated" }); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const openCreate = () => { setForm(empty); setOpen(true); };
  const openEdit = (plan: any) => {
    setEditing(plan);
    setForm({ name: plan.name, description: plan.description || "", minAmount: String(plan.minAmount), maxAmount: String(plan.maxAmount), roiPercent: String(plan.roiPercent), durationDays: String(plan.durationDays), isActive: plan.isActive });
  };

  const handleSubmit = () => {
    const data = { name: form.name, description: form.description, minAmount: Number(form.minAmount), maxAmount: Number(form.maxAmount), roiPercent: Number(form.roiPercent), durationDays: Number(form.durationDays), isActive: true };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate({ data });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Investment Plans</h1>
          <p className="text-muted-foreground text-sm">Create and manage investment plan offerings</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus size={14} />New Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && [1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-card border border-card-border animate-pulse" />)}
        {plans?.map(plan => (
          <div key={plan.id} className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp size={14} className="text-primary" /></div>
                <h3 className="font-bold">{plan.name}</h3>
              </div>
              <Badge variant="outline" className={plan.isActive ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
            </div>
            <div className="text-4xl font-black text-primary">{plan.roiPercent}% <span className="text-base text-muted-foreground font-normal">ROI</span></div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Duration</span><span className="text-foreground font-semibold">{plan.durationDays} days</span></div>
              <div className="flex justify-between"><span>Min</span><span className="text-foreground font-semibold">${plan.minAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Max</span><span className="text-foreground font-semibold">${plan.maxAmount.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(plan)}><Pencil size={12} />Edit</Button>
              <Button size="sm" variant="destructive" className="gap-1" onClick={() => deleteMutation.mutate({ id: plan.id })} disabled={deleteMutation.isPending}><Trash2 size={12} /></Button>
            </div>
          </div>
        ))}
        {plans?.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">No plans yet. Create your first investment plan.</div>}
      </div>

      <Dialog open={open || !!editing} onOpenChange={() => { setOpen(false); setEditing(null); }}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "Create New Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Plan Name</Label><Input placeholder="e.g. Gold Plan" value={form.name} onChange={upd("name")} /></div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Short description" value={form.description} onChange={upd("description")} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Amount ($)</Label><Input type="number" value={form.minAmount} onChange={upd("minAmount")} /></div>
              <div className="space-y-2"><Label>Max Amount ($)</Label><Input type="number" value={form.maxAmount} onChange={upd("maxAmount")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>ROI (%)</Label><Input type="number" step="0.1" value={form.roiPercent} onChange={upd("roiPercent")} /></div>
              <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" value={form.durationDays} onChange={upd("durationDays")} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button disabled={(createMutation.isPending || updateMutation.isPending) || !form.name} onClick={handleSubmit}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : editing ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPlans() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminPlansContent /></AdminLayout></ProtectedRoute>;
}
