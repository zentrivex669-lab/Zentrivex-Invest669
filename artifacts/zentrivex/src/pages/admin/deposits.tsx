import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListAdminDeposits, useApproveDeposit, useRejectDeposit, getListAdminDepositsQueryKey, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Search, ExternalLink } from "lucide-react";

function AdminDepositsContent() {
  const { data: deposits, isLoading } = useListAdminDeposits();
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [proofId, setProofId] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListAdminDepositsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
  };

  const approveMutation = useApproveDeposit({
    mutation: {
      onSuccess: () => { toast({ title: "Deposit approved", description: "User balance has been credited." }); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const rejectMutation = useRejectDeposit({
    mutation: {
      onSuccess: () => { toast({ title: "Deposit rejected" }); setRejectId(null); setRejectReason(""); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const filtered = deposits?.filter(d => {
    const q = search.toLowerCase();
    return !q || d.user?.firstName?.toLowerCase().includes(q) || d.user?.email?.toLowerCase().includes(q) || d.currency.toLowerCase().includes(q);
  });

  const proofDeposit = deposits?.find(d => d.id === proofId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Manage Deposits</h1>
          <p className="text-muted-foreground text-sm">Review and approve or reject deposit requests</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
          <div className="col-span-2">User</div><div>Amount</div><div>Currency</div><div>Status</div><div>Actions</div>
        </div>
        {isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 border-b border-card-border animate-pulse bg-secondary/10" />)}
        {filtered?.length === 0 && <div className="text-center py-16 text-muted-foreground"><p>No deposits found</p></div>}
        {filtered?.map(dep => (
          <div key={dep.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/10 transition-colors items-center">
            <div className="col-span-2">
              <p className="text-sm font-semibold">{dep.user?.firstName} {dep.user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{dep.user?.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(dep.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-sm font-bold">${Number(dep.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <div className="text-sm text-muted-foreground">{dep.currency}</div>
            <div>
              {dep.status === "pending" && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>}
              {dep.status === "approved" && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>}
              {dep.status === "rejected" && <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {dep.proofImage && <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => setProofId(dep.id)}><ExternalLink size={10} />Proof</Button>}
              {dep.status === "pending" && (
                <>
                  <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 gap-1" onClick={() => approveMutation.mutate({ id: dep.id })} disabled={approveMutation.isPending}>
                    <CheckCircle size={10} />Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 px-2 text-xs gap-1" onClick={() => setRejectId(dep.id)}>
                    <XCircle size={10} />Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={rejectId !== null} onOpenChange={() => { setRejectId(null); setRejectReason(""); }}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader><DialogTitle>Reject Deposit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Provide a reason for rejection. This will be visible to the user.</p>
            <Input placeholder="e.g. Transaction not found on blockchain" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason || rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: rejectId!, data: { reason: rejectReason } })}>
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={proofId !== null} onOpenChange={() => setProofId(null)}>
        <DialogContent className="bg-card border-card-border max-w-lg">
          <DialogHeader><DialogTitle>Deposit Proof</DialogTitle></DialogHeader>
          {proofDeposit?.proofImage && <img src={proofDeposit.proofImage} alt="Proof" className="w-full rounded-lg max-h-96 object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDeposits() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminDepositsContent /></AdminLayout></ProtectedRoute>;
}
