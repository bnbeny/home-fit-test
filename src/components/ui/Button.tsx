import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-blue text-white shadow-sm hover:bg-brand-navy-light disabled:bg-black/10 disabled:text-ink-muted",
  secondary:
    "bg-surface-sunken text-ink ring-1 ring-black/10 hover:bg-black/5 disabled:text-ink-muted",
  ghost: "text-ink-muted hover:text-ink disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
