import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Broadcast } from "@/data/mock";

interface BroadcastPostProps {
  broadcast: Broadcast;
}

export function BroadcastPost({ broadcast }: BroadcastPostProps) {
  const navigate = useNavigate();
  const { user, side, entryPrice, amount, potentialPayout, marketQuestion } =
    broadcast;

  const isYes = side === "YES";
  const probability = isYes ? entryPrice : 1 - entryPrice;

  return (
    <article className="mx-4 mb-4 bg-bg-card rounded-2xl border border-border overflow-hidden animate-fade-in">
      {/* User header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Avatar username={user.username} size={30} />
        <span className="text-[13px] font-semibold text-text-primary">
          {user.username}
        </span>
        <span className="text-[11px] text-text-muted">
          {broadcast.createdAt}
        </span>
        <span className="ml-auto text-[10px] text-text-muted">
          {Math.round(user.accuracyRate * 100)}% acc
        </span>
      </div>

      {/* Market question */}
      <div className="px-4 pb-3">
        <p className="text-[15px] font-semibold text-text-primary leading-snug">
          {marketQuestion}
        </p>
      </div>

      {/* Chart area — the visual hero */}
      <div className="mx-4 mb-3 rounded-xl bg-bg-secondary border border-border overflow-hidden">
        {/* Probability visualization */}
        <div className="relative h-40 flex items-end px-4 pb-3">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-3 px-4">
            {[100, 75, 50, 25, 0].map((tick) => (
              <div key={tick} className="flex items-center gap-2">
                <span className="text-[9px] text-text-muted/50 w-5 text-right">
                  {tick}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>
            ))}
          </div>

          {/* Fake chart bars showing probability movement */}
          <div className="relative z-10 flex items-end gap-[3px] w-full h-full pt-4 pl-7">
            {generateChartBars(probability).map((h, i, arr) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all ${
                  i === arr.length - 1
                    ? isYes
                      ? "bg-yes"
                      : "bg-no"
                    : isYes
                      ? "bg-yes/25"
                      : "bg-no/25"
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Current probability overlay */}
          <div className="absolute top-3 right-3 flex flex-col items-end">
            <span
              className={`text-2xl font-bold ${isYes ? "text-yes" : "text-no"}`}
            >
              {Math.round(probability * 100)}%
            </span>
            <span className="text-[10px] text-text-muted">
              {isYes ? "Yes" : "No"} chance
            </span>
          </div>
        </div>

        {/* Position info bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-bg-primary/30">
          <div className="flex items-center gap-3 text-[12px] text-text-secondary">
            <span className={`font-bold ${isYes ? "text-yes" : "text-no"}`}>
              {side}{broadcast.optionLabel ? ` · ${broadcast.optionLabel}` : ""}
            </span>
            <span>${amount} bet</span>
          </div>
          <span className="text-[12px] text-yes font-semibold">
            → ${potentialPayout.toFixed(0)} payout
          </span>
        </div>
      </div>

      {/* Action buttons — two big CTAs */}
      <div className="flex gap-2 px-4 pb-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand/12 hover:bg-brand/20 text-brand font-semibold text-[13px] rounded-xl transition-all active:scale-[0.97]">
          Copy Trade
        </button>
        <button
          onClick={() => navigate(`/market/${broadcast.marketId}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-bg-elevated/40 hover:bg-bg-elevated/60 text-text-primary font-semibold text-[13px] rounded-xl transition-all active:scale-[0.97]"
        >
          Open Market
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Social actions — small, bottom row */}
      <div className="flex items-center gap-5 px-4 pb-3 pt-0.5">
        <button className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors">
          <Heart size={14} strokeWidth={1.5} />
          <span className="text-[11px]">{broadcast.engagementCount}</span>
        </button>
        <button className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors">
          <MessageCircle size={14} strokeWidth={1.5} />
          <span className="text-[11px]">{broadcast.commentCount}</span>
        </button>
        <button className="flex items-center gap-1 text-text-muted hover:text-text-secondary transition-colors ml-auto">
          <Share2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
}

/**
 * Generate fake chart bar heights that trend toward the given probability.
 * Creates a realistic-looking mini chart.
 */
function generateChartBars(probability: number): number[] {
  const count = 20;
  const bars: number[] = [];
  const target = probability * 85 + 10; // scale to 10-95 range
  let current = 30 + Math.random() * 30;

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    // Drift toward target with some noise
    current = current + (target - current) * 0.15 + (Math.random() - 0.5) * 12;
    current = Math.max(5, Math.min(95, current));
    // Last bar should be very close to target
    if (i === count - 1) current = target;
    bars.push(Math.round(current));
  }
  return bars;
}
