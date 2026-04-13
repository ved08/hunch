import { categories } from "@/data/mock";

interface CategoryPillsProps {
  active: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-5">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
          active === null
            ? "bg-brand/15 text-brand-light"
            : "bg-bg-card text-text-muted"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
            active === cat.id
              ? "bg-brand/15 text-brand-light"
              : "bg-bg-card text-text-muted"
          }`}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}
