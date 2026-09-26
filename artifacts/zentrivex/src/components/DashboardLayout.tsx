import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Briefcase, Shield, List, LogOut, Menu, X, ChevronRight, Building2, Gift
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/plans", label: "Investment Packages", icon: TrendingUp },
  { href: "/dashboard/deposit", label: "Deposit Funds", icon: ArrowDownCircle },
  { href: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpCircle },
  { href: "/dashboard/investments", label: "My Investments", icon: Briefcase },
  { href: "/dashboard/kyc", label: "KYC Verification", icon: Shield },
  { href: "/dashboard/transactions", label: "Transactions", icon: List },
  { href: "/dashboard/referrals", label: "Refer & Earn", icon: Gift },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-card-border flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground block leading-tight">Zentrivex</span>
              <span className="text-xs text-muted-foreground">Investments</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-card-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={logout}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-card-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
          <div className="flex items-center gap-3 ml-auto">
            <Badge variant="outline" className="text-xs text-muted-foreground border-card-border">
              KYC: <span className={`ml-1 font-semibold ${user?.kycStatus === "approved" ? "text-green-400" : user?.kycStatus === "pending" ? "text-yellow-400" : "text-muted-foreground"}`}>{user?.kycStatus?.toUpperCase()}</span>
            </Badge>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Portfolio Balance</p>
              <p className="text-sm font-bold text-primary">${Number(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
