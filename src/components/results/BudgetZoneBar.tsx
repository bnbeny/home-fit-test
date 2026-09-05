import { useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";

interface BudgetZoneBarProps {
  safeBudget: number;
  riskZoneThreshold: number;
  targetHomePrice: number;
  onTargetHomePriceChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

function DragIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 7l-3 3 3 3" />
      <path d="M14 7l3 3-3 3" />
      <path d="M3 10h14" />
    </svg>
  );
}

/**
 * Three fixed-meaning zones (safe -> stretch -> risk) rendered as one bar,
 * status-colored (mint/mandarin/critical), with a directly draggable marker
 * for the user's target home price. Safe runs 0 to safeBudget; Stretch runs
 * safeBudget to riskZoneThreshold (so exactly-at-capacity, 1.0x maxHomePrice,
 * reads as Stretch, not Risk); Risk is everything at/above riskZoneThreshold.
 * The marker (not the track) is the whole control — there's no separate
 * slider — so dragging it, or focusing it and using the arrow keys, is how
 * the target price is set; its position and the "Your target" label both
 * update live as it moves. Legend is mandatory here: three colored segments
 * must never rely on the reader color-matching without labels.
 */
export function BudgetZoneBar({
  safeBudget,
  riskZoneThreshold,
  targetHomePrice,
  onTargetHomePriceChange,
  min,
  max,
  step,
}: BudgetZoneBarProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const scaleMax = Math.max(riskZoneThreshold * 1.15, targetHomePrice * 1.05, 1);
  const toPct = (value: number) => (value / scaleMax) * 100;

  const safeWidth = toPct(safeBudget);
  const stretchWidth = toPct(riskZoneThreshold - safeBudget);
  const riskWidth = toPct(scaleMax - riskZoneThreshold);
  const markerLeft = Math.min(100, toPct(targetHomePrice));
  // Keep the label's own centered box from clipping past the bar's edges,
  // independent of where the (unclamped) marker line itself sits.
  const labelLeft = Math.min(88, Math.max(12, markerLeft));

  const priceFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return targetHomePrice;
    const rect = track.getBoundingClientRect();
    const ratio = clamp(rect.width > 0 ? (clientX - rect.left) / rect.width : 0, 0, 1);
    return Math.round(clamp(ratio * scaleMax, min, max) / step) * step;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onTargetHomePriceChange(priceFromClientX(e.clientX));
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    onTargetHomePriceChange(priceFromClientX(e.clientX));
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onTargetHomePriceChange(clamp(targetHomePrice - step, min, max));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onTargetHomePriceChange(clamp(targetHomePrice + step, min, max));
    }
  };

  return (
    <div>
      <p className="mb-2 text-lg font-semibold text-ink">{copy.zoneBarLabel}</p>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-blue">
        <DragIcon className="h-3.5 w-3.5 flex-shrink-0" />
        {copy.targetPriceHelp}
      </p>
      <div className="relative pb-6">
        <div ref={trackRef} className="flex h-8 w-full gap-0.5 overflow-hidden rounded-full">
          <div className="h-full rounded-l-full bg-brand-mint" style={{ width: `${safeWidth}%` }} />
          <div className="h-full bg-brand-mandarin" style={{ width: `${stretchWidth}%` }} />
          <div className="h-full rounded-r-full bg-brand-critical/70" style={{ width: `${riskWidth}%` }} />
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={copy.targetPriceLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Math.round(targetHomePrice)}
          aria-valuetext={formatTHB(targetHomePrice)}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`absolute top-0 flex h-8 w-5 -translate-x-1/2 touch-none items-center justify-center focus-visible:outline-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ left: `${markerLeft}%` }}
        >
          <div
            className={`h-8 w-0.5 rounded-full bg-ink transition-[transform] ${isDragging ? "scale-x-150" : ""}`}
            aria-hidden="true"
          />
        </div>

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
          <span className="text-ink-muted">{copy.stretchUpTo(formatTHB(riskZoneThreshold))}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-critical/70" aria-hidden="true" />
          <span className="text-ink-muted">{copy.riskAbove(formatTHB(riskZoneThreshold))}</span>
        </li>
      </ul>
    </div>
  );
}
