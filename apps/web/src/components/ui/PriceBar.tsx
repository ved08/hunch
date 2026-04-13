interface PriceBarProps {
  yesPrice: number;
  noPrice: number;
  size?: "sm" | "md";
}

export function PriceBar({ yesPrice, noPrice, size = "md" }: PriceBarProps) {
  const yesPct = Math.round(yesPrice * 100);
  const noPct = Math.round(noPrice * 100);
  const h = size === "sm" ? "h-1" : "h-1.5";

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[11px] font-medium text-yes">Yes {yesPct}%</span>
        <span className="text-[11px] font-medium text-no">No {noPct}%</span>
      </div>
      <div className={`flex ${h} rounded-full overflow-hidden gap-px`}>
        <div
          className="bg-yes/70 rounded-l-full transition-all duration-500"
          style={{ width: `${yesPct}%` }}
        />
        <div
          className="bg-no/70 rounded-r-full transition-all duration-500"
          style={{ width: `${noPct}%` }}
        />
      </div>
    </div>
  );
}
