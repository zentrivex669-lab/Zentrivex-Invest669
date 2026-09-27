import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetReferrals } from "@workspace/api-client-react";
import { Users, Gift, Copy, Check, TrendingUp, Share2 } from "lucide-react";

function StatCard({ label, value, icon: Icon, color = "text-foreground" }: { label: string; value: string; icon: any; color?: string }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Icon size={15} className="text-muted-foreground" />
        </div>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function ReferralsContent() {
  const { data, isLoading } = useGetReferrals();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight mb-1">Refer & Earn</h1>
        <p className="text-muted-foreground text-sm">Invite friends and earn a bonus every time they make their first deposit</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          {!data?.enabled && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-400">
              The referral program is currently disabled. Existing bonuses already earned remain valid.
            </div>
          )}

          <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={18} className="text-primary" />
              <h2 className="font-bold text-lg">Your Referral Link</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Share this link — when someone signs up and makes their first deposit, you earn{" "}
              <span className="text-primary font-bold">{data?.bonusPercent}%</span> of their deposit as a bonus, credited directly to your balance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-secondary/60 border border-card-border rounded-lg px-4 py-3 font-mono text-xs sm:text-sm text-foreground break-all">
                {data?.referralLink}
              </div>
              <Button className="gap-2 shrink-0" onClick={copyLink}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Share2 size={12} />
              Your referral code: <span className="font-mono font-bold text-foreground">{data?.referralCode}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Referrals" value={String(data?.totalReferred ?? 0)} icon={Users} color="text-primary" />
            <StatCard label="Total Earned" value={`$${Number(data?.totalEarned ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`} icon={TrendingUp} color="text-green-400" />
            <StatCard label="Bonus Rate" value={`${data?.bonusPercent ?? 0}%`} icon={Gift} />
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="font-bold text-sm mb-4">Your Referrals</h3>
            {data?.referredUsers && data.referredUsers.length > 0 ? (
              <div className="space-y-3">
                {data.referredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{u.firstName[0]}{u.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={u.hasDeposited ? "border-green-500/30 text-green-400" : "border-muted-foreground/30 text-muted-foreground"}>
                      {u.hasDeposited ? "Bonus earned" : "Awaiting deposit"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No referrals yet. Share your link to start earning bonuses.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReferralsPage() {
  return <ProtectedRoute><DashboardLayout><ReferralsContent /></DashboardLayout></ProtectedRoute>;
}
