import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";

export default function AdminPortal() {
  const { login, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Check your credentials.");
        return;
      }
      if (data.user?.role !== "admin") {
        setError("Access denied. This portal is restricted to administrators only.");
        return;
      }
      login(data.token);
      toast({ title: "Welcome to the Admin Panel" });
      navigate("/admin");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(234,179,8,0.08) 0%, transparent 60%), #040f0e" }}>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Zentrivex Management System</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Lock size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Restricted Access — Authorized Personnel Only</span>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-2 h-11"
                placeholder="admin@zentrivex.com"
                autoComplete="username"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Password</Label>
              <div className="relative mt-2">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-semibold text-base gap-2 mt-2" disabled={loading}>
              <ShieldCheck size={16} />
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-card-border text-center">
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Return to Zentrivex
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          All access attempts are logged and monitored for security.
        </p>
      </div>
    </div>
  );
}
