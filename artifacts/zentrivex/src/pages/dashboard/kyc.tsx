import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useGetKyc, useSubmitKyc, getGetKycQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, Clock, XCircle, Upload, User, MapPin, FileText } from "lucide-react";

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize","Benin","Bolivia","Bosnia and Herzegovina","Botswana",
  "Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic",
  "Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia",
  "Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala",
  "Guinea","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kosovo","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia",
  "Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger",
  "Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka",
  "Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
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
          <span className="text-xs font-semibold text-green-400 relative z-10">Uploaded ✓</span>
        </>
      ) : (
        <>
          <Upload size={24} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center px-2">{label}</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </label>
  );
}

function SectionHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-card-border">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function KycContent() {
  const { data: kyc, isLoading } = useGetKyc();
  const [docType, setDocType] = useState("passport");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  // Personal info
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");

  // Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const { toast } = useToast();
  const qc = useQueryClient();

  const submitMutation = useSubmitKyc({
    mutation: {
      onSuccess: () => {
        toast({ title: "KYC submitted!", description: "Your application is under review. We'll notify you within 24–48 hours." });
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
  const kycRejected = kyc?.status === "rejected";

  const canSubmit = frontImage && fullName && dateOfBirth && country && !submitMutation.isPending;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">KYC Verification</h1>
        <p className="text-muted-foreground text-sm">Complete identity verification to unlock deposits, withdrawals, and investments. Your data is encrypted and stored securely.</p>
      </div>

      {/* Status banner */}
      {kyc && (
        <div className={`rounded-xl border p-5 flex items-start gap-4 ${kycApproved ? "border-green-500/30 bg-green-500/5" : kycPending ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          {kycApproved ? <CheckCircle size={22} className="text-green-400 flex-shrink-0 mt-0.5" /> : kycPending ? <Clock size={22} className="text-yellow-400 flex-shrink-0 mt-0.5" /> : <XCircle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />}
          <div className="flex-1">
            <p className="font-bold capitalize">
              {kycApproved ? "Verification Approved — You are fully verified" : kycPending ? "Application Under Review" : "Verification Rejected — Please resubmit"}
            </p>
            {kycPending && <p className="text-sm text-muted-foreground mt-0.5">Your documents are being reviewed by our compliance team. This typically takes 24–48 business hours. Your account access remains limited until approval.</p>}
            {kyc.rejectionReason && <p className="text-sm text-muted-foreground mt-0.5">Reason: {kyc.rejectionReason}</p>}
          </div>
          {kycApproved && <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/30 flex-shrink-0">VERIFIED</Badge>}
        </div>
      )}

      {/* Form — shown if not approved */}
      {!kycApproved && (
        <div className="space-y-6">

          {/* Personal Information */}
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
            <SectionHeader icon={User} title="Personal Information" desc="Enter your legal name exactly as it appears on your ID document." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Legal Name <span className="text-red-400">*</span></Label>
                <Input placeholder="As shown on ID" value={fullName} onChange={e => setFullName(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth <span className="text-red-400">*</span></Label>
                <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Nationality</Label>
                <select value={nationality} onChange={e => setNationality(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="">Select nationality</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input placeholder="+1 555 000 0000" value={phone} onChange={e => setPhone(e.target.value)} className="h-10" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
            <SectionHeader icon={MapPin} title="Residential Address" desc="Provide your current home address for AML compliance." />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Street Address</Label>
                <Input placeholder="123 Main Street, Apt 4B" value={address} onChange={e => setAddress(e.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label>State / Province</Label>
                  <Input placeholder="State or province" value={state} onChange={e => setState(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label>Country <span className="text-red-400">*</span></Label>
                  <select value={country} onChange={e => setCountry(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Postal / ZIP Code</Label>
                  <Input placeholder="Postal code" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="h-10" />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-card border border-card-border rounded-xl p-6 space-y-5">
            <SectionHeader icon={FileText} title="Identity Document" desc="Upload clear photos of your government-issued ID. All images must be in color and fully legible." />
            <div className="space-y-2">
              <Label>Document Type <span className="text-red-400">*</span></Label>
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
                <Label className="text-xs">Front of {DOC_TYPES.find(d => d.value === docType)?.label} <span className="text-red-400">*</span></Label>
                <ImageUpload label="Click to upload front side" value={frontImage} onChange={setFrontImage} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Back of {DOC_TYPES.find(d => d.value === docType)?.label}</Label>
                <ImageUpload label="Click to upload back side" value={backImage} onChange={setBackImage} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Selfie Holding Document</Label>
                <ImageUpload label="Click to upload selfie" value={selfieImage} onChange={setSelfieImage} />
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p>• Documents must be in colour and all text must be clearly visible.</p>
              <p>• Ensure no information is covered or obscured.</p>
              <p>• Your data is encrypted with 256-bit AES encryption.</p>
              <p>• KYC review typically takes 24–48 business hours after submission.</p>
            </div>
            {!canSubmit && (fullName || country) && (
              <p className="text-xs text-yellow-400">Required fields: Full Name, Date of Birth, Country, and front photo of ID.</p>
            )}
            <Button className="w-full h-11 font-semibold gap-2" disabled={!canSubmit}
              onClick={() => submitMutation.mutate({
                data: {
                  documentType: docType as any,
                  fullName: fullName || undefined,
                  dateOfBirth: dateOfBirth || undefined,
                  nationality: nationality || undefined,
                  phone: phone || undefined,
                  address: address || undefined,
                  city: city || undefined,
                  state: state || undefined,
                  country: country || undefined,
                  postalCode: postalCode || undefined,
                  frontImage: frontImage || undefined,
                  backImage: backImage || undefined,
                  selfieImage: selfieImage || undefined,
                }
              })}>
              <Shield size={16} />
              {submitMutation.isPending ? "Submitting..." : kycRejected ? "Resubmit for Verification" : "Submit KYC Application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KycPage() {
  return <ProtectedRoute><DashboardLayout><KycContent /></DashboardLayout></ProtectedRoute>;
}
