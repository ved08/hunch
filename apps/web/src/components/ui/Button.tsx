import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "yes" | "no" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-brand hover:bg-brand-dark text-white",
  secondary: "bg-bg-card hover:bg-bg-card-hover text-text-primary border border-border-light",
  yes: "bg-yes hover:bg-yes-dark text-white",
  no: "bg-no hover:bg-no-dark text-white",
  ghost: "bg-transparent hover:bg-bg-card text-text-secondary",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-[15px] rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
