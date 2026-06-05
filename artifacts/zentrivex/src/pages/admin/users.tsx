import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useListUsers, useUpdateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Shield } from "lucide-react";

function AdminUsersContent() {
  const { data: users, isLoading } = useListUsers();
  const [search, setSearch] = useState("");
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
          <h1 className="text-2xl font-black tracking-tight mb-1">Users</h1>
          <p className="text-muted-foreground text-sm">Manage all registered users</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56" />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-3 text-xs text-muted-foreground font-semibold uppercase tracking-wide bg-secondary/30">
          <div className="col-span-2">User</div><div>Balance</div><div>KYC</div><div>Role</div><div>Status</div><div>Actions</div>
        </div>
        {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 border-b border-card-border animate-pulse bg-secondary/10" />)}
        {filtered?.length === 0 && <div className="text-center py-16 text-muted-foreground"><p>No users found</p></div>}
        {filtered?.filter(u => u.role !== "admin").map(user => (
          <div key={user.id} className="grid grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-4 px-6 py-4 border-b border-card-border last:border-0 hover:bg-secondary/10 transition-colors items-center">
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
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })}>
                {user.isActive ? "Disable" : "Enable"}
              </Button>
              {user.role !== "admin" && (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
                  onClick={() => updateMutation.mutate({ id: user.id, data: { role: "admin" } })}>
                  <Shield size={10} />Make Admin
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  return <ProtectedRoute adminOnly><AdminLayout><AdminUsersContent /></AdminLayout></ProtectedRoute>;
}
