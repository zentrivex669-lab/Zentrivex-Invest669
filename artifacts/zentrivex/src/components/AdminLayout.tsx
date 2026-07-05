import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Shield,
  TrendingUp, Users, LogOut, Menu, X, ChevronRight, Building2,
  CreditCard, Home, Gift
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownCircle },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
  { href: "/admin/kyc", label: "KYC Reviews", icon: Shield },
  { href: "/admin/plans", label: "Investment Packages", icon: TrendingUp },
  { href: "/admin/users", label: "Investors", icon: Users },
  { href: "/admin/settings/payment", label: "Payment Methods", icon: CreditCard },
  { href: "/admin/settings/homepage", label: "Edit Homepage", icon: Home },
  { href: "/admin/settings/referral", label: "Referral Program", icon: Gift },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-card-border flex flex-col transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 size={16} className="text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground block leading-tight">Zentrivex</span>
              <p className="text-xs text-primary font-semibold">ADMIN PANEL</p>
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
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary block mb-3 px-3">Switch to Investor View</Link>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={logout}>
            <LogOut size={14} /> Sign out
          </Button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-card-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground"><Menu size={20} /></button>
          <h1 className="text-sm font-medium text-muted-foreground">Admin Panel — Zentrivex Investment Management</h1>
          <div className="text-sm text-muted-foreground">{user?.firstName} {user?.lastName}</div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
