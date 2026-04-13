import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { categories, mockMarkets, isBinaryMarket } from "@/data/mock";
import type { Market } from "@/data/mock";

export function ExploreScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = query
    ? mockMarkets.filter((m) =>
        m.question.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  const closingSoon = [...mockMarkets]
    .sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime())
    .slice(0, 3);

  const hot = [...mockMarkets].sort((a, b) => b.volume - a.volume).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl px-5 pt-5 pb-4 space-y-4">
        <h1 className="text-lg font-bold tracking-tight">Explore</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search markets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-text-primary placeholder-text-muted outline-none focus:border-brand/50 transition-colors"
          />
        </div>
      </header>

      <div className="px-5 pb-8 space-y-7 animate-fade-in">
        {results !== null ? (
          <div className="space-y-2">
            {results.map((m) => (
              <MarketRow key={m.id} market={m} onClick={() => navigate(`/market/${m.id}`)} />
            ))}
            {results.length === 0 && (
              <p className="text-center text-text-muted text-sm py-12">No markets found</p>
            )}
          </div>
        ) : (
          <>
            {/* Categories */}
            <Section title="Categories">
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="flex flex-col items-center gap-1.5 py-3.5 bg-bg-card rounded-xl hover:bg-bg-card-hover transition-colors"
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Closing Soon" icon={<Clock size={14} className="text-no" />}>
              <div className="space-y-2">
                {closingSoon.map((m) => (
                  <MarketRow key={m.id} market={m} onClick={() => navigate(`/market/${m.id}`)} />
                ))}
              </div>
            </Section>

            <Section title="Hot Right Now" icon={<TrendingUp size={14} className="text-yes" />}>
              <div className="space-y-2">
                {hot.map((m) => (
                  <MarketRow key={m.id} market={m} onClick={() => navigate(`/market/${m.id}`)} />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <h3 className="text-[13px] font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MarketRow({ market, onClick }: { market: Market; onClick: () => void }) {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const binary = isBinaryMarket(market);

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3.5 bg-bg-card rounded-xl hover:bg-bg-card-hover transition-all active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[13px] font-medium text-text-primary leading-snug flex-1">
          {market.question}
        </p>
        <ChevronRight size={14} className="text-text-muted shrink-0 mt-0.5" />
      </div>

      {binary ? (
        /* Binary: probability bar */
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] font-medium text-yes">
              Yes {Math.round(market.options[0]!.yesPrice * 100)}%
            </span>
            <span className="text-[11px] font-medium text-no">
              No {Math.round(market.options[0]!.noPrice * 100)}%
            </span>
          </div>
          <div className="flex h-1 rounded-full overflow-hidden gap-px">
            <div className="bg-yes/50 rounded-l-full" style={{ width: `${market.options[0]!.yesPrice * 100}%` }} />
            <div className="bg-no/50 rounded-r-full" style={{ width: `${market.options[0]!.noPrice * 100}%` }} />
          </div>
        </div>
      ) : (
        /* Multi-option: top 2-3 options preview */
        <div className="flex flex-wrap gap-1.5 mb-2">
          {market.options.slice(0, 3).map((opt) => (
            <span
              key={opt.id}
              className="px-2 py-0.5 text-[10px] font-medium text-text-secondary bg-bg-elevated/40 rounded-md"
            >
              {opt.label} {Math.round(opt.yesPrice * 100)}%
            </span>
          ))}
          {market.options.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] text-text-muted">
              +{market.options.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-text-muted">
        <span>${formatVolume(market.volume)} vol</span>
        <span>·</span>
        <span>{daysLeft}d left</span>
        <span>·</span>
        <span>{market.category}</span>
      </div>
    </button>
  );
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}
