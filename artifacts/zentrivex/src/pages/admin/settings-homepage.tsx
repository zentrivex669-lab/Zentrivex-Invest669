import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Eye, RefreshCw } from "lucide-react";

interface HomepageSettings {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  stat4Label: string;
  stat4Value: string;
  ctaButtonText: string;
  badgeText: string;
  footerDisclaimer: string;
}

function getToken() {
  return localStorage.getItem("zentrivex_token");
}

async function fetchHomepageSettings(): Promise<HomepageSettings> {
  const res = await fetch("/api/settings/homepage");
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

async function saveHomepageSettings(data: Partial<HomepageSettings>): Promise<HomepageSettings> {
  const res = await fetch("/api/admin/settings/homepage", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to save");
  }
  const body = await res.json();
  return body.settings;
}

function Field({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <div>
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <textarea value={value} onChange={e => onChange(e.target.value)}
          className="w-full mt-1.5 bg-secondary border border-card-border rounded-md text-sm px-3 py-2 text-foreground min-h-[80px] resize-none"
        />
      </div>
    );
  }
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 h-9" />
    </div>
  );
}

function HomepageEditorContent() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-homepage-settings"],
    queryFn: fetchHomepageSettings,
  });

  const [form, setForm] = useState<HomepageSettings | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data]);

  const set = (key: keyof HomepageSettings, value: string) => {
    setForm(f => f ? { ...f, [key]: value } : f);
    setIsDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: saveHomepageSettings,
    onSuccess: saved => {
      toast({ title: "Homepage settings saved!" });
      setForm(saved);
      setIsDirty(false);
      qc.invalidateQueries({ queryKey: ["admin-homepage-settings"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/settings/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      return body.settings;
    },
    onSuccess: saved => {
      toast({ title: "Reset to defaults" });
      setForm(saved);
      setIsDirty(false);
    },
  });

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-card border border-card-border rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight mb-1">Edit Homepage</h1>
          <p className="text-muted-foreground text-sm">Update text and stats displayed on the landing page</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open("/", "_blank")}><Eye size={14} />Preview</Button>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
            <RefreshCw size={14} />Reset
          </Button>
          <Button size="sm" className="gap-2" disabled={!isDirty || saveMutation.isPending} onClick={() => form && saveMutation.mutate(form)}>
            <Save size={14} />{saveMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Unsaved changes
        </div>
      )}

      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-base border-b border-card-border pb-3">Hero Section</h2>
        <Field label="Badge Text (above title)" value={form.badgeText} onChange={v => set("badgeText", v)} />
        <Field label="Hero Title" value={form.heroTitle} onChange={v => set("heroTitle", v)} />
        <Field label="Highlighted Words (must appear in title)" value={form.heroHighlight} onChange={v => set("heroHighlight", v)} />
        <Field label="Subtitle / Description" value={form.heroSubtitle} onChange={v => set("heroSubtitle", v)} multiline />
        <Field label="CTA Button Text" value={form.ctaButtonText} onChange={v => set("ctaButtonText", v)} />
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-base border-b border-card-border pb-3">Stats Row (4 figures below the hero)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stat 1 Value" value={form.stat1Value} onChange={v => set("stat1Value", v)} />
          <Field label="Stat 1 Label" value={form.stat1Label} onChange={v => set("stat1Label", v)} />
          <Field label="Stat 2 Value" value={form.stat2Value} onChange={v => set("stat2Value", v)} />
          <Field label="Stat 2 Label" value={form.stat2Label} onChange={v => set("stat2Label", v)} />
          <Field label="Stat 3 Value" value={form.stat3Value} onChange={v => set("stat3Value", v)} />
          <Field label="Stat 3 Label" value={form.stat3Label} onChange={v => set("stat3Label", v)} />
          <Field label="Stat 4 Value" value={form.stat4Value} onChange={v => set("stat4Value", v)} />
          <Field label="Stat 4 Label" value={form.stat4Label} onChange={v => set("stat4Label", v)} />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
        <h2 className="font-bold text-base border-b border-card-border pb-3">Footer</h2>
        <Field label="Footer Disclaimer Text" value={form.footerDisclaimer} onChange={v => set("footerDisclaimer", v)} multiline />
      </div>
    </div>
  );
}

export default function AdminSettingsHomepage() {
  return <ProtectedRoute adminOnly><AdminLayout><HomepageEditorContent /></AdminLayout></ProtectedRoute>;
}
