import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, BarChart3, Droplets, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { mockMarkets, isBinaryMarket } from "@/data/mock";
import type { Market, MarketOption } from "@/data/mock";

const quickAmounts = [5, 10, 25, 50, 100];

export function MarketDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const market = mockMarkets.find((m) => m.id === id);

  const [selectedOption, setSelectedOption] = useState<MarketOption | null>(null);
  const [tradeSide, setTradeSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState(25);

  if (!market) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Market not found
      </div>
    );
  }

  const binary = isBinaryMarket(market);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(market.closesAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  function openTrade(option: MarketOption, side: "YES" | "NO") {
    setSelectedOption(option);
    setTradeSide(side);
  }

  const price = selectedOption
    ? tradeSide === "YES"
      ? selectedOption.yesPrice
      : selectedOption.noPrice
    : 0;
  const platformFee = amount * 0.02;
  const tradeAmount = amount - platformFee;
  const potentialPayout = price > 0 ? tradeAmount / price : 0;

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl px-4 py-3.5 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-lg hover:bg-bg-card transition-colors"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
          {market.category}
        </span>
      </header>

      <div className="px-5 py-5 space-y-5 animate-fade-in">
        {/* Title */}
        <h1 className="text-xl font-bold text-text-primary leading-snug">
          {market.question}
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-[12px] text-text-muted">
          <span className="flex items-center gap-1">
            <BarChart3 size={12} />
            ${formatVolume(market.volume)} vol
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={12} />
            ${formatVolume(market.liquidity)} liq
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {daysLeft}d left
          </span>
        </div>

        {/* Chart placeholder */}
        <div className="h-44 bg-bg-card rounded-xl border border-border flex items-center justify-center">
          <span className="text-[12px] text-text-muted">Chart</span>
        </div>

        {/* Options / Outcomes */}
        {binary ? (
          <BinaryPanel market={market} onTrade={openTrade} />
        ) : (
          <MultiOptionPanel market={market} onTrade={openTrade} />
        )}

        {/* Description */}
        <div className="pt-1">
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {market.description}
          </p>
        </div>

        {/* Recent activity */}
        <div>
          <h3 className="text-[13px] font-semibold text-text-primary mb-3">
            Recent activity
          </h3>
          <div className="space-y-1">
            {market.recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-2.5 py-2">
                <Avatar username={a.user.username} size={26} />
                <div className="flex-1 min-w-0 text-[12px]">
                  <span className="text-text-primary font-medium">{a.user.username}</span>
                  <span className="text-text-muted">
                    {" "}bought{" "}
                  </span>
                  <span className={a.side === "YES" ? "text-yes font-semibold" : "text-no font-semibold"}>
                    {a.side}
                  </span>
                  {a.optionLabel && (
                    <span className="text-text-secondary"> · {a.optionLabel}</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[12px] font-medium text-text-primary">${a.amount}</span>
                  <p className="text-[10px] text-text-muted">{a.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trade bottom sheet */}
      <BottomSheet
        open={selectedOption !== null}
        onClose={() => setSelectedOption(null)}
        title={
          selectedOption
            ? binary
              ? `Buy ${tradeSide}`
              : `Buy ${tradeSide} · ${selectedOption.label}`
            : undefined
        }
      >
        {selectedOption && (
          <TradePanel
            side={tradeSide}
            price={price}
            amount={amount}
            setAmount={setAmount}
            platformFee={platformFee}
            tradeAmount={tradeAmount}
            potentialPayout={potentialPayout}
          />
        )}
      </BottomSheet>
    </div>
  );
}

/** Binary YES/NO market — two big buttons */
function BinaryPanel({
  market,
  onTrade,
}: {
  market: Market;
  onTrade: (option: MarketOption, side: "YES" | "NO") => void;
}) {
  const opt = market.options[0]!;
  const yesPct = Math.round(opt.yesPrice * 100);
  const noPct = Math.round(opt.noPrice * 100);

  return (
    <div className="space-y-3">
      {/* Probability bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        <div className="bg-yes/60 rounded-l-full" style={{ width: `${yesPct}%` }} />
        <div className="bg-no/60 rounded-r-full" style={{ width: `${noPct}%` }} />
      </div>

      {/* YES / NO buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onTrade(opt, "YES")}
          className="flex-1 flex flex-col items-center gap-1 py-4 bg-yes/10 hover:bg-yes/18 border border-yes/20 rounded-xl transition-all active:scale-[0.97]"
        >
          <span className="text-yes text-lg font-bold">Yes {yesPct}¢</span>
          <span className="text-[11px] text-text-muted">Buy Yes</span>
        </button>
        <button
          onClick={() => onTrade(opt, "NO")}
          className="flex-1 flex flex-col items-center gap-1 py-4 bg-no/10 hover:bg-no/18 border border-no/20 rounded-xl transition-all active:scale-[0.97]"
        >
          <span className="text-no text-lg font-bold">No {noPct}¢</span>
          <span className="text-[11px] text-text-muted">Buy No</span>
        </button>
      </div>
    </div>
  );
}

/** Multi-option market — list of options with Yes/No buttons per row */
function MultiOptionPanel({
  market,
  onTrade,
}: {
  market: Market;
  onTrade: (option: MarketOption, side: "YES" | "NO") => void;
}) {
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
          Outcome
        </span>
        <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
          Chance
        </span>
      </div>

      {market.options.map((opt) => {
        const pct = Math.round(opt.yesPrice * 100);
        const yesCents = (opt.yesPrice * 100).toFixed(1);
        const noCents = (opt.noPrice * 100).toFixed(1);

        return (
          <div
            key={opt.id}
            className="relative flex items-center gap-3 p-3 bg-bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Probability fill bar (background) */}
            <div
              className="absolute inset-0 bg-brand/[0.04] rounded-xl"
              style={{ width: `${pct}%` }}
            />

            {/* Content */}
            <div className="relative flex-1 min-w-0 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">
                  {opt.label}
                </p>
              </div>

              {/* Percentage */}
              <span className="text-[14px] font-bold text-text-primary w-12 text-right shrink-0">
                {pct}%
              </span>

              {/* Yes / No buttons */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onTrade(opt, "YES")}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-yes bg-yes/12 hover:bg-yes/22 rounded-lg transition-colors active:scale-[0.95]"
                >
                  Yes {yesCents}¢
                </button>
                <button
                  onClick={() => onTrade(opt, "NO")}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-no bg-no/12 hover:bg-no/22 rounded-lg transition-colors active:scale-[0.95]"
                >
                  No {noCents}¢
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Trade entry panel inside bottom sheet */
function TradePanel({
  side,
  price,
  amount,
  setAmount,
  platformFee,
  tradeAmount,
  potentialPayout,
}: {
  side: "YES" | "NO";
  price: number;
  amount: number;
  setAmount: (n: number) => void;
  platformFee: number;
  tradeAmount: number;
  potentialPayout: number;
}) {
  const isYes = side === "YES";

  return (
    <div className="space-y-4">
      {/* Market / Limit tabs */}
      <div className="flex gap-1 bg-bg-primary rounded-lg p-0.5">
        <button className="flex-1 py-1.5 text-[12px] font-medium text-text-primary bg-bg-card rounded-md">
          Market
        </button>
        <button className="flex-1 py-1.5 text-[12px] font-medium text-text-muted rounded-md">
          Limit
        </button>
      </div>

      {/* Amount input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-text-muted">You're paying</span>
          <span className="text-[11px] text-text-muted">
            Balance: $1,247.80
          </span>
        </div>
        <div className="flex items-center bg-bg-card border border-border-light rounded-xl px-3 py-2.5 gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-elevated/50 rounded-lg shrink-0">
            <div className="w-4 h-4 rounded-full bg-brand/40" />
            <span className="text-[12px] font-medium text-text-primary">USDC</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 text-right text-lg font-bold text-text-primary bg-transparent outline-none"
            placeholder="0.00"
          />
        </div>
        {/* Quick amounts */}
        <div className="flex gap-1.5 mt-2">
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                amount === q
                  ? "bg-brand/15 text-brand-light"
                  : "bg-bg-card text-text-muted"
              }`}
            >
              ${q}
            </button>
          ))}
        </div>
      </div>

      {/* Odds display */}
      <div className="flex items-center justify-between py-2">
        <span className="text-[12px] text-text-muted">Odds</span>
        <span className={`text-[14px] font-bold ${isYes ? "text-yes" : "text-no"}`}>
          {Math.round(price * 100)}% chance
        </span>
      </div>

      {/* Fee breakdown */}
      <div className="space-y-1.5 text-[12px] py-2 border-t border-border">
        <div className="flex justify-between">
          <span className="text-text-muted">Trade amount</span>
          <span className="text-text-secondary">${tradeAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Platform fee (2%)</span>
          <span className="text-text-secondary">${platformFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-text-muted">Potential payout</span>
          <span className="text-yes font-semibold">${potentialPayout.toFixed(2)}</span>
        </div>
      </div>

      {/* Confirm */}
      <Button
        variant={isYes ? "yes" : "no"}
        size="lg"
        fullWidth
      >
        Buy {side} · ${amount}
      </Button>
    </div>
  );
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toString();
}
