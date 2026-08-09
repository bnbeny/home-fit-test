import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";

interface BudgetZoneBarProps {
  safeBudget: number;
  stretchBudget: number;
  riskZoneThreshold: number;
  targetHomePrice: number;
}

/**
 * Three fixed-meaning zones (safe -> stretch -> risk) rendered as one bar,
 * status-colored (mint/mandarin/critical) with a marker for where the user's
 * target home price actually falls. Legend is mandatory here: three colored
 * segments must never rely on the reader color-matching without labels.
 *
 * The over-budget/stretch-zone explanation used to live here as a hover/focus
 * popup on "Your target" — it now lives in Alternative Options (Gap & Plan)
 * instead, as a normal always-visible list item, so it's discoverable
 * without hovering.
 */
export function BudgetZoneBar({
  safeBudget,
  stretchBudget,
  riskZoneThreshold,
  targetHomePrice,
}: BudgetZoneBarProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;

  const scaleMax = Math.max(riskZoneThreshold * 1.15, targetHomePrice * 1.05, 1);
  const toPct = (value: number) => (value / scaleMax) * 100;

  const safeWidth = toPct(safeBudget);
  const stretchWidth = toPct(stretchBudget - safeBudget);
  const riskWidth = toPct(scaleMax - stretchBudget);
  const markerLeft = Math.min(100, toPct(targetHomePrice));
  // Keep the label's own centered box from clipping past the bar's edges,
  // independent of where the (unclamped) marker line itself sits.
  const labelLeft = Math.min(88, Math.max(12, markerLeft));

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink-muted">{copy.zoneBarLabel}</p>
      <div className="relative pb-6">
        <div className="flex h-8 w-full gap-0.5 overflow-hidden rounded-full">
          <div className="h-full rounded-l-full bg-brand-mint" style={{ width: `${safeWidth}%` }} />
          <div className="h-full bg-brand-mandarin" style={{ width: `${stretchWidth}%` }} />
          <div className="h-full rounded-r-full bg-brand-critical/70" style={{ width: `${riskWidth}%` }} />
        </div>
        <div
          className="absolute top-0 h-8 w-0.5 -translate-x-1/2 bg-ink"
          style={{ left: `${markerLeft}%` }}
        />

        <p
          className="tabular-figure absolute top-9 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-ink"
          style={{ left: `${labelLeft}%` }}
        >
          {copy.yourTarget(formatTHB(targetHomePrice))}
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-mint" aria-hidden="true" />
          <span className="text-ink-muted">{copy.safeUpTo(formatTHB(safeBudget))}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-mandarin" aria-hidden="true" />
          <span className="text-ink-muted">{copy.stretchUpTo(formatTHB(stretchBudget))}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-critical/70" aria-hidden="true" />
          <span className="text-ink-muted">{copy.riskAbove(formatTHB(riskZoneThreshold))}</span>
        </li>
      </ul>
    </div>
  );
}
