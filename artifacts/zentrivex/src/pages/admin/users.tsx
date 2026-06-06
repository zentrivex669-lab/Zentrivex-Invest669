import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Shield, Edit2, X, Save, DollarSign } from "lucide-react";

function getToken() {
  return localStorage.getItem("zentrivex_token");
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  balance: number;
  kycStatus: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    balance: user.balance.toString(),
    kycStatus: user.kycStatus as "none" | "pending" | "approved" | "rejected",
    role: user.role as "user" | "admin",
    isActive: user.isActive,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/users/${user.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || undefined,
          balance: parseFloat(form.balance),
          kycStatus: form.kycStatus,
          role: form.role,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User updated successfully!" });
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-lg">Edit User</h3>
            <p className="text-muted-foreground text-sm">ID: #{user.id}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input value={form.firstName} onChange={e => set("firstName", e.target.value)} className="mt-1.5 h-9" />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input value={form.lastName} onChange={e => set("lastName", e.target.value)} className="mt-1.5 h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Email Address</Label>
            <Input value={form.email} onChange={e => set("email", e.target.value)} className="mt-1.5 h-9" type="email" />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={e => set("phone", e.target.value)} className="mt-1.5 h-9" placeholder="Optional" />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1.5"><DollarSign size={12} />Account Balance (USD)</Label>
            <Input value={form.balance} onChange={e => set("balance", e.target.value)} className="mt-1.5 h-9 font-mono" type="number" min="0" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">KYC Status</Label>
              <select value={form.kycStatus} onChange={e => set("kycStatus", e.target.value)}
                className="w-full mt-1.5 h-9 bg-secondary border border-card-border rounded-md text-sm px-3 text-foreground">
                <option value="none">None</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full mt-1.5 h-9 bg-secondary border border-card-border rounded-md text-sm px-3 text-foreground">
                <option value="user">Investor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between bg-secondary/40 rounded-lg px-4 py-3">
            <span className="text-sm font-medium">Account Active</span>
            <button onClick={() => set("isActive", !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-secondary"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5.5 translate-x-0" : "left-0.5"}`} style={{ left: form.isActive ? "22px" : "2px" }} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save size={14} />{saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminUsersContent() {
  const { data: users, isLoading } = useListUsers();
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const updateMutation = useUpdateUser({
    mutation: {
      onSuccess: () => { toast({ title: "User updated" }); qc.invalidateQueries({ queryKey: getListUsersQueryKey() }); },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed", variant: "destructive" })
    }
  });

  const filtered = users?.filter(u => {
    const q = search.toLowerCase();
    return !q || u.firstName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Investors</h1>
          <p className="text-muted-foreground text-sm">Manage all registered investors — edit details, balances, KYC and access</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search investors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-8 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
          <div className="col-span-2">User</div><div>Balance</div><div>KYC</div><div>Role</div><div>Status</div><div className="col-span-2">Actions</div>
        </div>
        {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 border-b border-card-border animate-pulse bg-secondary/10" />)}
        {filtered?.length === 0 && <div className="text-center py-16 text-muted-foreground"><p>No users found</p></div>}
        {filtered?.filter(u => u.role !== "admin").map(user => (
          <div key={user.id} className="grid grid-cols-2 lg:grid-cols-8 gap-2 lg:gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/10 transition-colors items-center">
            <div className="col-span-2">
              <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-sm font-bold text-primary">${Number(user.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            <div>
              <Badge variant="outline" className={`text-xs ${user.kycStatus === "approved" ? "border-green-500/30 text-green-400" : user.kycStatus === "pending" ? "border-yellow-500/30 text-yellow-400" : "border-card-border text-muted-foreground"}`}>
                {user.kycStatus}
              </Badge>
            </div>
            <div>
              <Badge variant="outline" className={`text-xs ${user.role === "admin" ? "border-primary/30 text-primary" : "border-card-border text-muted-foreground"}`}>{user.role}</Badge>
            </div>
            <div>
              {user.isActive ? <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"><CheckCircle size={10} className="mr-1" />Active</Badge>
                : <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"><XCircle size={10} className="mr-1" />Disabled</Badge>}
            </div>
            <div className="flex gap-2 flex-wrap col-span-2">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
                onClick={() => setEditUser(user as User)}>
                <Edit2 size={10} />Edit
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })}>
                {user.isActive ? "Disable" : "Enable"}
              </Button>
              {user.role !== "admin" && (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
                  onClick={() => updateMutation.mutate({ id: user.id, data: { role: "admin" } })}>
                  <Shield size={10} />Admin
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: getListUsersQueryKey() })}
        />
      )}
    </div>
  );
}

export default function AdminUsers() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminUsersContent /></AdminLayout></ProtectedRoute>;
}
