interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
}

/** Stat tile contract: label (sentence case, no colon) + value (compact,
 *  proportional numerals) + an optional one-line caption in muted text. */
export function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <div className="rounded-xl bg-surface-sunken p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="hero-figure mt-1 text-2xl font-bold text-ink">{value}</p>
      {caption && <p className="mt-1 text-xs text-ink-muted">{caption}</p>}
    </div>
  );
}
