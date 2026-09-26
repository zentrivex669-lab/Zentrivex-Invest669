import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PublicRoute } from "@/components/ProtectedRoute";
import { Eye, EyeOff, Gift } from "lucide-react";

function getReferralCodeFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("ref")?.trim() ?? "";
}

function RegisterForm() {
  const referralCode = getReferralCodeFromUrl();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setLocation("/dashboard");
      },
      onError: (e: any) => {
        toast({ title: "Registration failed", description: e?.data?.error || "Could not create account", variant: "destructive" });
      }
    }
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black">Z</span>
            </div>
            <span className="font-bold text-2xl tracking-tight">Zentrivex</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Create your account</h1>
          <p className="text-muted-foreground">Join thousands of crypto investors</p>
        </div>
        {referralCode && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-5 text-sm text-primary">
            <Gift size={15} />
            You were invited with referral code <span className="font-mono font-bold">{referralCode}</span>
          </div>
        )}
        <div className="bg-card border border-card-border rounded-2xl p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={update("firstName")} placeholder="John" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={update("lastName")} placeholder="Doe" className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Phone (optional)</Label>
            <Input type="tel" value={form.phone} onChange={update("phone")} placeholder="+1 555 000 0000" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Min. 8 characters" className="h-11 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button className="w-full h-11 font-semibold" disabled={registerMutation.isPending}
            onClick={() => registerMutation.mutate({ data: { firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || undefined, referralCode: referralCode || undefined } })}>
            {registerMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <PublicRoute><RegisterForm /></PublicRoute>;
}
