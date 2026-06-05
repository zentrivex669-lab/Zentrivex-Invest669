import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetKyc, useSubmitKyc, getGetKycQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, Clock, XCircle, Upload } from "lucide-react";

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
];

function ImageUpload({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <label className={`relative flex flex-col items-center justify-center gap-2 h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${value ? "border-green-500/40 bg-green-500/5" : "border-card-border hover:border-primary/40 bg-secondary/30"}`}>
      {value ? (
        <>
          <img src={value} alt="uploaded" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40" />
          <CheckCircle size={24} className="text-green-400 relative z-10" />
          <span className="text-xs font-semibold text-green-400 relative z-10">Uploaded</span>
        </>
      ) : (
        <>
          <Upload size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  );
}

function KycContent() {
  const { data: kyc, isLoading } = useGetKyc();
  const [docType, setDocType] = useState("passport");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const submitMutation = useSubmitKyc({
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC submitted!", description: "Your documents are under review. We'll notify you within 24-48 hours." });
        qc.invalidateQueries({ queryKey: getGetKycQueryKey() });
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (e: any) => {
        toast({ title: "Submission failed", description: e?.data?.error || "Could not submit KYC", variant: "destructive" });
      }
    }
  });

  const kycApproved = kyc?.status === "approved";
  const kycPending = kyc?.status === "pending";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">KYC Verification</h1>
        <p className="text-muted-foreground text-sm">Verify your identity to unlock deposits, withdrawals, and investments.</p>
      </div>

      {kyc && (
        <div className={`rounded-xl border p-5 flex items-center gap-4 ${kycApproved ? "border-green-500/30 bg-green-500/5" : kycPending ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          {kycApproved ? <CheckCircle size={24} className="text-green-400" /> : kycPending ? <Clock size={24} className="text-yellow-400" /> : <XCircle size={24} className="text-red-400" />}
          <div>
            <p className="font-bold capitalize">{kyc.status === "approved" ? "Verification Approved" : kyc.status === "pending" ? "Under Review" : "Verification Rejected"}</p>
            {kyc.rejectionReason && <p className="text-sm text-muted-foreground">Reason: {kyc.rejectionReason}</p>}
            {kycPending && <p className="text-sm text-muted-foreground">Your documents are being reviewed. This usually takes 24-48 hours.</p>}
          </div>
          {kycApproved && <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/30">VERIFIED</Badge>}
        </div>
      )}

      {!kycApproved && (
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-primary" />
            <h3 className="font-bold">Identity Verification</h3>
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <div className="flex gap-3 flex-wrap">
              {DOC_TYPES.map(dt => (
                <button key={dt.value} onClick={() => setDocType(dt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${docType === dt.value ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-card-border hover:text-foreground"}`}>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Front of {DOC_TYPES.find(d => d.value === docType)?.label}</Label>
              <ImageUpload label="Upload front side" value={frontImage} onChange={setFrontImage} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Back of {DOC_TYPES.find(d => d.value === docType)?.label}</Label>
              <ImageUpload label="Upload back side" value={backImage} onChange={setBackImage} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Selfie with Document</Label>
              <ImageUpload label="Upload selfie" value={selfieImage} onChange={setSelfieImage} />
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p>Ensure documents are clearly visible and not blurry.</p>
            <p>Your information is encrypted and stored securely.</p>
            <p>Review typically takes 24-48 business hours.</p>
          </div>

          <Button className="w-full h-11 font-semibold gap-2" disabled={!frontImage || submitMutation.isPending}
            onClick={() => submitMutation.mutate({ data: { documentType: docType as any, frontImage: frontImage || undefined, backImage: backImage || undefined, selfieImage: selfieImage || undefined } })}>
            <Shield size={16} /> {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function KycPage() {
  return <ProtectedRoute><DashboardLayout><KycContent /></DashboardLayout></ProtectedRoute>;
}
