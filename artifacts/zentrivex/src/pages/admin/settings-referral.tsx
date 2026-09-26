import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGetReferralSettings, useUpdateReferralSettings, getGetReferralSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Gift, Save, ToggleLeft, ToggleRight } from "lucide-react";

function ReferralSettingsContent() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: settings, isLoading } = useGetReferralSettings();
  const [form, setForm] = useState({ enabled: true, bonusPercent: 5 });

  useEffect(() => {
    if (settings) setForm({ enabled: settings.enabled, bonusPercent: settings.bonusPercent });
  }, [settings]);

  const saveMutation = useUpdateReferralSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "Referral settings saved!" });
        qc.invalidateQueries({ queryKey: getGetReferralSettingsQueryKey() });
      },
      onError: (e: any) => toast({ title: "Error", description: e?.data?.error || "Failed to save", variant: "destructive" }),
    },
  });

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Referral Program</h1>
        <p className="text-muted-foreground text-sm">Configure the bonus investors earn when they refer new users</p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-card border border-card-border rounded-xl animate-pulse" />
      ) : (
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                <Gift size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Referral Program</p>
                <p className="text-xs text-muted-foreground">Enable or disable referral bonuses platform-wide</p>
              </div>
            </div>
            <button onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))} className="text-muted-foreground hover:text-foreground transition-colors">
              {form.enabled ? <ToggleRight size={26} className="text-green-400" /> : <ToggleLeft size={26} />}
            </button>
          </div>

          <div className="space-y-2">
            <Label>Referral Bonus (% of referred user's first deposit)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={form.bonusPercent}
              onChange={e => setForm(f => ({ ...f, bonusPercent: Number(e.target.value) }))}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              When a referred user's first deposit is approved, the referrer earns this percentage credited instantly to their balance.
            </p>
          </div>

          <Button className="gap-2" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate({ data: form })}>
            <Save size={14} />{saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsReferral() {
  return <ProtectedRoute adminOnly><AdminLayout><ReferralSettingsContent /></AdminLayout></ProtectedRoute>;
}
