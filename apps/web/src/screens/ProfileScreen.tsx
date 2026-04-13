import { Target, TrendingUp, DollarSign, Users, Share2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { BroadcastPost } from "@/components/feed/BroadcastPost";
import { mockCurrentUser, mockBroadcasts, categories } from "@/data/mock";

export function ProfileScreen() {
  const user = mockCurrentUser;
  const userBroadcasts = mockBroadcasts.filter((b) => b.user.pubkey === user.pubkey);

  const accuracyByCategory: Record<string, number> = {
    crypto: 0.85,
    sports: 0.6,
    politics: 0.75,
    tech: 0.9,
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl px-5 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
        <button className="p-1.5 rounded-lg hover:bg-bg-card transition-colors text-text-muted">
          <Share2 size={18} />
        </button>
      </header>

      <div className="animate-fade-in">
        {/* Profile info */}
        <div className="px-5 py-5 flex items-center gap-4">
          <Avatar username={user.username} size={56} />
          <div className="flex-1">
            <h2 className="text-base font-bold">{user.username}</h2>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">{user.pubkey}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[12px]">
                <span className="font-semibold text-text-primary">{user.followerCount}</span>
                <span className="text-text-muted"> followers</span>
              </span>
              <span className="text-[12px]">
                <span className="font-semibold text-text-primary">{user.followingCount}</span>
                <span className="text-text-muted"> following</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 grid grid-cols-2 gap-2 mb-5">
          <StatTile icon={<Target size={14} />} label="Accuracy" value={`${Math.round(user.accuracyRate * 100)}%`} />
          <StatTile icon={<TrendingUp size={14} />} label="Total P&L" value={`+$${user.pnl.toFixed(0)}`} color="text-yes" />
          <StatTile icon={<DollarSign size={14} />} label="Earned" value={`$${user.totalEarnedFromFollowers.toFixed(0)}`} color="text-brand-light" />
          <StatTile icon={<Users size={14} />} label="Predictions" value={`${user.totalPredictions}`} />
        </div>

        {/* Accuracy by category */}
        <div className="px-5 mb-6">
          <h3 className="text-[13px] font-semibold mb-3">Accuracy by category</h3>
          <div className="space-y-2.5">
            {Object.entries(accuracyByCategory).map(([catId, acc]) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <div key={catId} className="flex items-center gap-3">
                  <span className="text-[11px] text-text-secondary w-14 shrink-0">
                    {cat?.emoji} {cat?.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand/60 rounded-full"
                      style={{ width: `${acc * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-text-primary font-medium w-8 text-right">
                    {Math.round(acc * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictions */}
        <div className="border-t border-border">
          <p className="px-5 py-3 text-[11px] text-text-muted uppercase tracking-wider font-medium">
            Predictions
          </p>
          <div className="divide-y divide-border">
            {userBroadcasts.map((b) => (
              <BroadcastPost key={b.id} broadcast={b} />
            ))}
          </div>
          {userBroadcasts.length === 0 && (
            <p className="text-center text-text-muted text-sm py-16">No predictions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  color = "text-text-primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-bg-card rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 text-text-muted mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}
