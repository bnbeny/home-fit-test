import type { PropsWithChildren, ReactNode } from "react";

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}

export function Card({ title, eyebrow, className = "", children }: CardProps) {
  return (
    <section
      className={`rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/5 sm:p-6 ${className}`}
    >
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {eyebrow}
        </p>
      )}
      {title && <h3 className="mb-4 text-lg font-semibold text-ink">{title}</h3>}
      {children}
    </section>
  );
}
