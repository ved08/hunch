import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Badge } from "@/components/ui/Badge";
import { mockPositions } from "@/data/mock";

type Tab = "active" | "resolved";

const tabs: { value: Tab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "resolved", label: "Resolved" },
];

export function PortfolioScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("active");

  const active = mockPositions.filter((p) => p.status === "active");
  const resolved = mockPositions.filter((p) => p.status !== "active");
  const positions = tab === "active" ? active : resolved;

  const totalValue = active.reduce((s, p) => s + p.amount + p.unrealizedPnl, 0);
  const totalPnl = mockPositions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const isUp = totalPnl >= 0;

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl px-5 pt-5 pb-3">
        <h1 className="text-lg font-bold tracking-tight">Portfolio</h1>
      </header>

      <div className="px-5 pb-8 space-y-5 animate-fade-in">
        {/* Summary */}
        <div className="pt-2">
          <p className="text-[11px] text-text-muted uppercase tracking-wider mb-1">
            Total Value
          </p>
          <p className="text-3xl font-bold tracking-tight">${totalValue.toFixed(2)}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {isUp ? (
              <TrendingUp size={14} className="text-yes" />
            ) : (
              <TrendingDown size={14} className="text-no" />
            )}
            <span className={`text-sm font-semibold ${isUp ? "text-yes" : "text-no"}`}>
              {isUp ? "+" : ""}${totalPnl.toFixed(2)}
            </span>
            <span className="text-[11px] text-text-muted">all time</span>
          </div>

          {/* Chart placeholder */}
          <div className="mt-4 h-20 bg-bg-card rounded-xl flex items-end justify-center overflow-hidden">
            {/* Fake sparkline bars */}
            <div className="flex items-end gap-[3px] p-3 h-full w-full">
              {[35, 42, 38, 55, 48, 62, 58, 70, 65, 78, 72, 85, 80, 88, 82, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand/30 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <FilterTabs tabs={tabs} active={tab} onChange={setTab} />

        {/* Positions */}
        <div className="space-y-2">
          {positions.map((pos) => {
            const pnlUp = pos.unrealizedPnl >= 0;
            return (
              <button
                key={pos.id}
                onClick={() => navigate(`/market/${pos.marketId}`)}
                className="w-full text-left p-4 bg-bg-card rounded-xl hover:bg-bg-card-hover transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text-primary leading-snug mb-2">
                      {pos.marketQuestion}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={pos.side === "YES" ? "yes" : "no"}>
                        {pos.side}{pos.optionLabel ? ` · ${pos.optionLabel}` : ""}
                      </Badge>
                      <span className="text-[11px] text-text-muted">
                        {(pos.entryPrice * 100).toFixed(0)}¢
                        {pos.status === "active" && (
                          <> → <span className="text-text-secondary">{(pos.currentPrice * 100).toFixed(0)}¢</span></>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${pnlUp ? "text-yes" : "text-no"}`}>
                      {pnlUp ? "+" : ""}${pos.unrealizedPnl.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-text-muted">${pos.amount} bet</p>
                  </div>
                </div>

                {pos.status === "won" && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
                    <div className="flex items-center gap-1.5 text-yes">
                      <Trophy size={12} />
                      <span className="text-[11px] font-medium">Won</span>
                    </div>
                    {pos.claimable && (
                      <span className="px-2.5 py-1 text-[11px] font-semibold text-yes bg-yes/12 rounded-lg">
                        Claim
                      </span>
                    )}
                  </div>
                )}
                {pos.status === "lost" && (
                  <div className="mt-3 pt-2.5 border-t border-border">
                    <span className="text-[11px] text-no font-medium">Resolved · Lost</span>
                  </div>
                )}
              </button>
            );
          })}

          {positions.length === 0 && (
            <p className="text-center text-text-muted text-sm py-16">
              No {tab} positions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
