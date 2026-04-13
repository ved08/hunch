import { useState } from "react";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { CategoryPills } from "@/components/feed/CategoryPills";
import { BroadcastPost } from "@/components/feed/BroadcastPost";
import { mockBroadcasts } from "@/data/mock";

type FeedSort = "trending" | "new" | "closing" | "following";

const feedTabs: { value: FeedSort; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
  { value: "closing", label: "Closing" },
  { value: "following", label: "Following" },
];

export function FeedScreen() {
  const [sort, setSort] = useState<FeedSort>("trending");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = category
    ? mockBroadcasts.filter((b) => b.category === category)
    : mockBroadcasts;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-xl px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">hunch.fun</h1>
          <div className="w-7 h-7 rounded-full bg-bg-card flex items-center justify-center text-[13px]">
            🔔
          </div>
        </div>
        <FilterTabs tabs={feedTabs} active={sort} onChange={setSort} />
        <CategoryPills active={category} onChange={setCategory} />
      </header>

      {/* Feed — card list with spacing */}
      <div className="pt-3 pb-4">
        {filtered.map((broadcast) => (
          <BroadcastPost key={broadcast.id} broadcast={broadcast} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted text-sm">
          No predictions yet
        </div>
      )}
    </div>
  );
}
