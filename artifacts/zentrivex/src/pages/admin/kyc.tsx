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
import { CheckCircle, XCircle, Clock, Search, Eye, User, MapPin, FileText } from "lucide-react";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5 border-b border-card-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  );
}

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
      onSuccess: () => { toast({ title: "KYC approved", description: "User has been verified." }); invalidate(); },
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
    return !q || k.user?.firstName?.toLowerCase().includes(q) || k.user?.email?.toLowerCase().includes(q) || k.user?.lastName?.toLowerCase().includes(q);
  });

  const pendingCount = kycs?.filter(k => k.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">KYC Reviews</h1>
          <p className="text-muted-foreground text-sm">
            Review identity verification submissions
            {pendingCount > 0 && <span className="ml-2 text-yellow-400 font-semibold">· {pendingCount} pending</span>}
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-64" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
          <div className="col-span-2">Investor</div>
          <div>Location</div>
          <div>Doc Type</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        {isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 border-b border-card-border animate-pulse bg-secondary/10" />)}
        {filtered?.length === 0 && !isLoading && <div className="text-center py-16 text-muted-foreground"><p>No KYC submissions found</p></div>}
        {filtered?.map(kyc => (
          <div key={kyc.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/10 transition-colors items-center">
            <div className="col-span-2">
              <p className="text-sm font-semibold">{kyc.user?.firstName} {kyc.user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{kyc.user?.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(kyc.createdAt).toLocaleDateString()}</p>
              {(kyc as any).fullName && kyc.user?.firstName !== (kyc as any).fullName && (
                <p className="text-xs text-primary mt-0.5">Legal: {(kyc as any).fullName}</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {(kyc as any).city && (kyc as any).country ? `${(kyc as any).city}, ${(kyc as any).country}` : (kyc as any).country || "—"}
            </div>
            <div className="text-sm text-muted-foreground capitalize">{kyc.documentType.replace(/_/g, " ")}</div>
            <div>
              {kyc.status === "pending" && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs"><Clock size={10} className="mr-1" />Pending</Badge>}
              {kyc.status === "approved" && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Approved</Badge>}
              {kyc.status === "rejected" && <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Rejected</Badge>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => setViewKyc(kyc)}>
                <Eye size={10} />View
              </Button>
              {kyc.status === "pending" && (
                <>
                  <Button size="sm" className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 gap-1"
                    onClick={() => approveMutation.mutate({ id: kyc.id })} disabled={approveMutation.isPending}>
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

      {/* View KYC Detail Dialog */}
      <Dialog open={!!viewKyc} onOpenChange={() => setViewKyc(null)}>
        <DialogContent className="bg-card border-card-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              KYC Application — {viewKyc?.user?.firstName} {viewKyc?.user?.lastName}
              {viewKyc?.status === "pending" && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">Pending Review</Badge>}
              {viewKyc?.status === "approved" && <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">Approved</Badge>}
              {viewKyc?.status === "rejected" && <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">Rejected</Badge>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Personal Info */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Personal Information</span>
              </div>
              <InfoRow label="Full Legal Name" value={(viewKyc as any)?.fullName} />
              <InfoRow label="Account Name" value={`${viewKyc?.user?.firstName} ${viewKyc?.user?.lastName}`} />
              <InfoRow label="Email" value={viewKyc?.user?.email} />
              <InfoRow label="Date of Birth" value={(viewKyc as any)?.dateOfBirth} />
              <InfoRow label="Nationality" value={(viewKyc as any)?.nationality} />
              <InfoRow label="Phone" value={(viewKyc as any)?.phone} />
              <InfoRow label="Document Type" value={viewKyc?.documentType?.replace(/_/g, " ")} />
            </div>

            {/* Address */}
            {((viewKyc as any)?.address || (viewKyc as any)?.city || (viewKyc as any)?.country) && (
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Residential Address</span>
                </div>
                <InfoRow label="Street Address" value={(viewKyc as any)?.address} />
                <InfoRow label="City" value={(viewKyc as any)?.city} />
                <InfoRow label="State / Province" value={(viewKyc as any)?.state} />
                <InfoRow label="Country" value={(viewKyc as any)?.country} />
                <InfoRow label="Postal Code" value={(viewKyc as any)?.postalCode} />
              </div>
            )}

            {/* Documents */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Uploaded Documents</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {viewKyc?.frontImage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Front of Document</p>
                    <img src={viewKyc.frontImage} alt="Front" className="w-full rounded-lg object-cover max-h-48 border border-card-border" />
                  </div>
                )}
                {viewKyc?.backImage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Back of Document</p>
                    <img src={viewKyc.backImage} alt="Back" className="w-full rounded-lg object-cover max-h-48 border border-card-border" />
                  </div>
                )}
                {viewKyc?.selfieImage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Selfie with Document</p>
                    <img src={viewKyc.selfieImage} alt="Selfie" className="w-full rounded-lg object-cover max-h-48 border border-card-border" />
                  </div>
                )}
                {!viewKyc?.frontImage && !viewKyc?.backImage && !viewKyc?.selfieImage && (
                  <p className="col-span-3 text-muted-foreground text-sm text-center py-6">No document images uploaded</p>
                )}
              </div>
            </div>

            {viewKyc?.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-xs font-bold text-red-400 mb-1">Rejection Reason</p>
                <p className="text-sm text-muted-foreground">{viewKyc.rejectionReason}</p>
              </div>
            )}
          </div>

          {viewKyc?.status === "pending" && (
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setViewKyc(null)}>Close</Button>
              <Button variant="destructive" className="gap-1" onClick={() => { setRejectId(viewKyc.id); setViewKyc(null); }}>
                <XCircle size={14} /> Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => { approveMutation.mutate({ id: viewKyc.id }); setViewKyc(null); }}>
                <CheckCircle size={14} /> Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectId !== null} onOpenChange={() => { setRejectId(null); setRejectReason(""); }}>
        <DialogContent className="bg-card border-card-border">
          <DialogHeader><DialogTitle>Reject KYC Application</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Provide a clear reason for rejection. This will be shown to the investor.</p>
            <Input placeholder="e.g. Document expired, image is unclear, name mismatch" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ id: rejectId!, data: { reason: rejectReason } })}>
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
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
