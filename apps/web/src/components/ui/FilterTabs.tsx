interface FilterTabsProps<T extends string> {
  tabs: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
}: FilterTabsProps<T>) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all ${
            active === tab.value
              ? "bg-brand/15 text-brand-light"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
