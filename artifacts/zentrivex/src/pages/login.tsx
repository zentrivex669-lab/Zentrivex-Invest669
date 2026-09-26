import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PublicRoute } from "@/components/ProtectedRoute";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setLocation(data.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (e: any) => {
        toast({ title: "Login failed", description: e?.data?.error || "Invalid credentials", variant: "destructive" });
      }
    }
  });

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
          <h1 className="text-3xl font-black tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your investment account</p>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button className="w-full h-11 font-semibold" disabled={loginMutation.isPending} onClick={() => loginMutation.mutate({ data: { email, password } })}>
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          No account yet?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">Create one</Link>
        </p>
        <p className="text-center text-xs text-muted-foreground mt-2">
          <Link href="/" className="hover:text-foreground">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <PublicRoute><LoginForm /></PublicRoute>;
}
