import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListAdminKyc, useApproveKyc, useRejectKyc, getListAdminKycQueryKey, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Search, Eye } from "lucide-react";

function AdminKycContent() {
  const { data: kycs, isLoading } = useListAdminKyc();
  const [search, setSearch] = useState("");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewKyc, setViewKyc] = useState<any>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListAdminKycQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
  };

  const approveMutation = useApproveKyc({
    mutation: {
      onSuccess: () => { toast({ title: "KYC approved" }); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const rejectMutation = useRejectKyc({
    mutation: {
      onSuccess: () => { toast({ title: "KYC rejected" }); setRejectId(null); setRejectReason(""); invalidate(); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const filtered = kycs?.filter(k => {
    const q = search.toLowerCase();
    return !q || k.user?.firstName?.toLowerCase().includes(q) || k.user?.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">KYC Reviews</h1>
          <p className="text-muted-foreground text-sm">Review identity verification submissions</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
          <div className="col-span-2">User</div><div>Doc Type</div><div>Status</div><div>Actions</div>
        </div>
        {isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 border-b border-card-border animate-pulse bg-secondary/10" />)}
        {filtered?.length === 0 && <div className="text-center py-16 text-muted-foreground"><p>No KYC submissions found</p></div>}
        {filtered?.map(kyc => (
          <div key={kyc.id} className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/10 transition-colors items-center">
            <div className="col-span-2">
              <p className="text-sm font-semibold">{kyc.user?.firstName} {kyc.user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{kyc.user?.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(kyc.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-sm text-muted-foreground capitalize">{kyc.documentType.replace(/_/g, " ")}</div>
            <div>
              {kyc.status === "pending" && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>}
              {kyc.status === "approved" && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>}
              {kyc.status === "rejected" && <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => setViewKyc(kyc)}><Eye size={10} />View Docs</Button>
              {kyc.status === "pending" && (
                <>
                  <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 gap-1" onClick={() => approveMutation.mutate({ id: kyc.id })} disabled={approveMutation.isPending}>
                    <CheckCircle size={10} />Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="h-7 px-2 text-xs gap-1" onClick={() => setRejectId(kyc.id)}>
                    <XCircle size={10} />Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!viewKyc} onOpenChange={() => setViewKyc(null)}>
        <DialogContent className="bg-card border-card-border max-w-2xl">
          <DialogHeader><DialogTitle>KYC Documents — {viewKyc?.user?.firstName} {viewKyc?.user?.lastName}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {viewKyc?.frontImage && <div><p className="text-xs text-muted-foreground mb-1">Front</p><img src={viewKyc.frontImage} alt="Front" className="w-full rounded-lg object-cover max-h-48" /></div>}
            {viewKyc?.backImage && <div><p className="text-xs text-muted-foreground mb-1">Back</p><img src={viewKyc.backImage} alt="Back" className="w-full rounded-lg object-cover max-h-48" /></div>}
            {viewKyc?.selfieImage && <div><p className="text-xs text-muted-foreground mb-1">Selfie</p><img src={viewKyc.selfieImage} alt="Selfie" className="w-full rounded-lg object-cover max-h-48" /></div>}
            {!viewKyc?.frontImage && !viewKyc?.backImage && !viewKyc?.selfieImage && <p className="col-span-3 text-muted-foreground text-sm text-center py-8">No images uploaded</p>}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectId !== null} onOpenChange={() => { setRejectId(null); setRejectReason(""); }}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader><DialogTitle>Reject KYC</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Provide a reason for rejection.</p>
            <Input placeholder="e.g. Document expired, image unclear" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason || rejectMutation.isPending} onClick={() => rejectMutation.mutate({ id: rejectId!, data: { reason: rejectReason } })}>
              {rejectMutation.isPending ? "Rejecting..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminKyc() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminKycContent /></AdminLayout></ProtectedRoute>;
}
