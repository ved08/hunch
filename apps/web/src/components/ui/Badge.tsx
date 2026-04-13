import type { ReactNode } from "react";

type BadgeVariant = "default" | "yes" | "no" | "brand" | "muted";

const styles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated/60 text-text-secondary",
  yes: "bg-yes/12 text-yes",
  no: "bg-no/12 text-no",
  brand: "bg-brand/12 text-brand-light",
  muted: "bg-bg-card text-text-muted",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
