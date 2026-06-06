import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus, Trash2, Save, Bitcoin, Building2, ToggleLeft, ToggleRight, Edit2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  label: string;
  type: "bank" | "crypto";
  details?: string;
  address?: string;
  note?: string;
  enabled: boolean;
}

function getToken() {
  return localStorage.getItem("zentrivex_token");
}

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await fetch("/api/settings/payment");
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

async function savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
  const res = await fetch("/api/admin/settings/payment", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(methods),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to save");
  }
}

const EMPTY_CRYPTO: PaymentMethod = { id: "", label: "", type: "crypto", address: "", note: "", enabled: true };
const EMPTY_BANK: PaymentMethod = { id: "", label: "", type: "bank", details: "", note: "", enabled: true };

function MethodCard({ method, onEdit, onToggle, onDelete }: {
  method: PaymentMethod;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`bg-card border rounded-xl p-5 transition-all ${method.enabled ? "border-card-border" : "border-card-border/40 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${method.type === "bank" ? "bg-blue-500/15" : "bg-primary/15"}`}>
            {method.type === "bank" ? <Building2 size={16} className="text-blue-400" /> : <Bitcoin size={16} className="text-primary" />}
          </div>
          <div>
            <p className="font-semibold text-sm">{method.label || "Unnamed"}</p>
            <Badge variant="outline" className="text-xs mt-0.5">{method.type === "bank" ? "Bank Transfer" : "Cryptocurrency"}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
            {method.enabled ? <ToggleRight size={22} className="text-green-400" /> : <ToggleLeft size={22} />}
          </button>
          <button onClick={onEdit} className="text-muted-foreground hover:text-primary transition-colors"><Edit2 size={15} /></button>
          <button onClick={onDelete} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
        </div>
      </div>
      {method.type === "crypto" && method.address && (
        <p className="text-xs font-mono bg-secondary/50 px-3 py-2 rounded-lg text-muted-foreground break-all">{method.address}</p>
      )}
      {method.type === "bank" && method.details && (
        <p className="text-xs bg-secondary/50 px-3 py-2 rounded-lg text-muted-foreground">{method.details}</p>
      )}
      {method.note && <p className="text-xs text-muted-foreground mt-2 italic">{method.note}</p>}
    </div>
  );
}

function EditModal({ method, onSave, onClose }: {
  method: PaymentMethod;
  onSave: (m: PaymentMethod) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(method);
  const set = (k: keyof PaymentMethod, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="font-bold text-lg mb-4">{method.id ? "Edit Payment Method" : "Add Payment Method"}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full mt-1.5 h-9 bg-secondary border border-card-border rounded-md text-sm px-3 text-foreground">
                <option value="crypto">Cryptocurrency</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Display Label</Label>
              <Input value={form.label} onChange={e => set("label", e.target.value)} className="mt-1.5 h-9" placeholder="e.g. Bitcoin (BTC)" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Internal ID (lowercase, no spaces)</Label>
            <Input value={form.id} onChange={e => set("id", e.target.value.toLowerCase().replace(/\s+/g, "_"))} className="mt-1.5 h-9" placeholder="e.g. btc, wire_transfer" />
          </div>
          {form.type === "crypto" ? (
            <div>
              <Label className="text-xs">Wallet Address</Label>
              <Input value={form.address ?? ""} onChange={e => set("address", e.target.value)} className="mt-1.5 h-9 font-mono text-xs" placeholder="Wallet address" />
            </div>
          ) : (
            <div>
              <Label className="text-xs">Bank Details</Label>
              <textarea value={form.details ?? ""} onChange={e => set("details", e.target.value)}
                className="w-full mt-1.5 bg-secondary border border-card-border rounded-md text-sm px-3 py-2 text-foreground min-h-[80px] resize-none"
                placeholder="Account number, routing, bank name..." />
            </div>
          )}
          <div>
            <Label className="text-xs">User Note / Instructions</Label>
            <textarea value={form.note ?? ""} onChange={e => set("note", e.target.value)}
              className="w-full mt-1.5 bg-secondary border border-card-border rounded-md text-sm px-3 py-2 text-foreground min-h-[60px] resize-none"
              placeholder="Instructions shown to depositors..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 gap-2" onClick={() => onSave(form)}><Save size={14} />Save Method</Button>
        </div>
      </div>
    </div>
  );
}

function PaymentSettingsContent() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addType, setAddType] = useState<"bank" | "crypto" | null>(null);

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["admin-payment-settings"],
    queryFn: fetchPaymentMethods,
  });

  const [localMethods, setLocalMethods] = useState<PaymentMethod[] | null>(null);
  const displayed = localMethods ?? methods;

  const saveMutation = useMutation({
    mutationFn: savePaymentMethods,
    onSuccess: () => {
      toast({ title: "Payment methods saved!" });
      setLocalMethods(null);
      qc.invalidateQueries({ queryKey: ["admin-payment-settings"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMethod = (idx: number, updated: PaymentMethod) => {
    setLocalMethods(displayed.map((m, i) => i === idx ? updated : m));
  };

  const toggleMethod = (idx: number) => {
    setLocalMethods(displayed.map((m, i) => i === idx ? { ...m, enabled: !m.enabled } : m));
  };

  const deleteMethod = (idx: number) => {
    setLocalMethods(displayed.filter((_, i) => i !== idx));
  };

  const addMethod = (m: PaymentMethod) => {
    if (!m.id || !m.label) { toast({ title: "ID and label are required", variant: "destructive" }); return; }
    if (displayed.find(x => x.id === m.id)) { toast({ title: "ID already exists", variant: "destructive" }); return; }
    setLocalMethods([...displayed, m]);
    setAddType(null);
  };

  const hasPendingChanges = localMethods !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Payment Methods</h1>
          <p className="text-muted-foreground text-sm">Configure bank transfers and crypto wallets shown to investors</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddType("bank")}><Plus size={14} />Add Bank</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddType("crypto")}><Plus size={14} />Add Crypto</Button>
          {hasPendingChanges && (
            <Button size="sm" className="gap-2" onClick={() => saveMutation.mutate(displayed)} disabled={saveMutation.isPending}>
              <Save size={14} />{saveMutation.isPending ? "Saving..." : "Save All Changes"}
            </Button>
          )}
        </div>
      </div>

      {hasPendingChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Unsaved changes — click "Save All Changes" to apply
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-card border border-card-border rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((m, i) => (
            <MethodCard key={m.id || i} method={m}
              onEdit={() => setEditingIndex(i)}
              onToggle={() => toggleMethod(i)}
              onDelete={() => deleteMethod(i)} />
          ))}
        </div>
      )}

      {editingIndex !== null && (
        <EditModal method={displayed[editingIndex]}
          onSave={updated => { updateMethod(editingIndex, updated); setEditingIndex(null); }}
          onClose={() => setEditingIndex(null)} />
      )}

      {addType !== null && (
        <EditModal method={addType === "bank" ? EMPTY_BANK : EMPTY_CRYPTO}
          onSave={addMethod}
          onClose={() => setAddType(null)} />
      )}
    </div>
  );
}

export default function AdminSettingsPayment() {
  return <ProtectedRoute adminOnly><AdminLayout><PaymentSettingsContent /></AdminLayout></ProtectedRoute>;
}
