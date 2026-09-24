import { InfoTooltip } from "../ui/InfoTooltip";

interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  /** Optional (i) explanation shown next to the label — the same
   *  click-to-open tooltip used elsewhere (BuyVsRentComparison,
   *  BudgetZoneBar), so a tile's own logic can be explained in place
   *  instead of assumed obvious. */
  tooltip?: string;
}

/** Stat tile contract: label (sentence case, no colon) + value (compact,
 *  proportional numerals) + an optional one-line caption in muted text. */
export function StatTile({ label, value, caption, tooltip }: StatTileProps) {
  return (
    <div className="rounded-xl bg-surface-sunken p-4">
      <p className="flex items-center gap-1 text-xs font-medium text-ink-muted">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </p>
      <p className="hero-figure mt-1 text-2xl font-bold text-ink">{value}</p>
      {caption && <p className="mt-1 text-xs text-ink-muted">{caption}</p>}
    </div>
  );
}
