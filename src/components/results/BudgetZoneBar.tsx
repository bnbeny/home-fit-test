import { useEffect, useRef, useState } from "react";
import type { ChangeEvent as ReactChangeEvent, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import { InfoTooltip } from "../ui/InfoTooltip";
import { ActionStep } from "../ui/ActionStep";

const MILLION = 1_000_000;
/** ${targetHomePrice} in millions, to 2 decimal places — e.g. 3030000 -> "3.03". */
const toMillionsInput = (value: number) => (value / MILLION).toFixed(2);

interface BudgetZoneBarProps {
  safeBudget: number;
  riskZoneThreshold: number;
  targetHomePrice: number;
  onTargetHomePriceChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  /** PurchasingPowerResult.maxHomePrice — the "Recommended Home Budget"
   *  reference point, shown as a fixed dashed marker on the bar plus a
   *  labeled chip above it (see the two "recommended..." props below).
   *  Deliberately just a display of a value already computed elsewhere —
   *  this component doesn't recalculate it. */
  recommendedHomeBudget: number;
  /** Explanation shown behind the (i) icon on the Recommended Home Budget
   *  chip — the same text that used to sit permanently under the old
   *  summary card (see PurchasingPower.tsx). */
  recommendedHomeBudgetNote: string;
  /** PurchasingPowerResult.recommendedMonthlyInstallment — has no natural
   *  position on this home-price axis, so it's shown as a labeled chip
   *  alongside the Recommended Home Budget one rather than a second marker
   *  line. */
  recommendedMonthlyInstallment: number;
  /** Explanation shown behind the (i) icon on the Recommended Monthly
   *  Installment chip — the same rationale text that used to sit
   *  permanently under the old summary card. */
  recommendedMonthlyInstallmentNote: string;
}

const clamp = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));

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
  recommendedHomeBudget,
  recommendedHomeBudgetNote,
  recommendedMonthlyInstallment,
  recommendedMonthlyInstallmentNote,
}: BudgetZoneBarProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // The millions-input's own displayed text, decoupled from targetHomePrice
  // while focused — otherwise re-deriving it from targetHomePrice on every
  // keystroke (e.g. via toMillionsInput) would eat a trailing "." the
  // instant it's typed, making a decimal point impossible to enter. Synced
  // FROM targetHomePrice whenever it changes for any other reason (dragging
  // the marker, arrow keys) while this input isn't focused.
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetDraft, setTargetDraft] = useState(() => toMillionsInput(targetHomePrice));
  useEffect(() => {
    if (!isEditingTarget) setTargetDraft(toMillionsInput(targetHomePrice));
  }, [targetHomePrice, isEditingTarget]);

  const onTargetInputChange = (e: ReactChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTargetDraft(raw);
    const millions = Number(raw);
    if (Number.isFinite(millions)) {
      onTargetHomePriceChange(clamp(Math.round(millions * MILLION), min, max));
    }
  };

  const scaleMax = Math.max(riskZoneThreshold * 1.15, targetHomePrice * 1.05, 1);
  const toPct = (value: number) => (value / scaleMax) * 100;

  const safeWidth = toPct(safeBudget);
  const stretchWidth = toPct(riskZoneThreshold - safeBudget);
  const riskWidth = toPct(scaleMax - riskZoneThreshold);
  const markerLeft = Math.min(100, toPct(targetHomePrice));
  // Keep the label's own centered box from clipping past the bar's edges,
  // independent of where the (unclamped) marker line itself sits.
  const labelLeft = Math.min(88, Math.max(12, markerLeft));
  // Where the Recommended Home Budget reference line sits on the same axis
  // as the target marker above — a fixed point (doesn't move as the user
  // drags their target), always within the scale by construction since
  // scaleMax is derived from riskZoneThreshold, which is itself a multiple
  // of recommendedHomeBudget.
  const recommendedLeft = Math.min(100, toPct(recommendedHomeBudget));

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
      <ActionStep step={1} title={copy.targetPriceHelpAction} description={copy.targetPriceHelpDetail} />

      {/* Extra top margin makes room for the Recommended label anchored
          directly above the dashed reference line below — the label and
          the line it names are kept as one visual unit (a single dashed
          stroke running from the label straight down into the bar at
          exactly the recommended price's position) instead of separate
          text above the bar, so the relationship is obvious at a glance. */}
      <div className="relative mt-16 pb-6">
        <div ref={trackRef} className="flex h-8 w-full gap-0.5 overflow-hidden rounded-full">
          <div className="h-full rounded-l-full bg-brand-mint" style={{ width: `${safeWidth}%` }} />
          <div className="h-full bg-brand-mandarin" style={{ width: `${stretchWidth}%` }} />
          <div className="h-full rounded-r-full bg-brand-critical/70" style={{ width: `${riskWidth}%` }} />
        </div>

        {/* Recommended Home Budget/Installment — one label, one continuous
            dashed line running from the label down into the bar at the
            recommended price's own position, so both figures read as
            "this is what the dashed line means" rather than a caption
            floating elsewhere on the page. Each figure's rationale (why
            this installment, why this home price) stays available behind
            the (i) tooltip rather than as permanent text. */}
        <div
          className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${recommendedLeft}%`, top: "-4rem" }}
        >
          <div className="pointer-events-auto flex items-center gap-1 whitespace-nowrap rounded-md bg-surface px-1.5 py-1 text-center leading-tight shadow-sm ring-1 ring-black/10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {copy.zoneBarRecommendedLabel}
              </p>
              <p className="tabular-figure text-xs font-bold text-ink">{formatTHB(recommendedHomeBudget)}</p>
              <p className="tabular-figure text-xs font-bold text-ink">
                {copy.perMonth(formatTHB(recommendedMonthlyInstallment))}
              </p>
            </div>
            <InfoTooltip
              text={`${recommendedHomeBudgetNote} ${recommendedMonthlyInstallmentNote}`}
              placement="start"
            />
          </div>
          <div className="w-0 flex-1 border-l-2 border-dashed border-ink/60" aria-hidden="true" />
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

        <div
          className="absolute top-9 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-xs font-semibold text-ink"
          style={{ left: `${labelLeft}%` }}
        >
          <span>{copy.targetPricePrefix}</span>
          <span aria-hidden="true">฿</span>
          <input
            type="text"
            inputMode="decimal"
            value={targetDraft}
            onChange={onTargetInputChange}
            onFocus={(e) => {
              setIsEditingTarget(true);
              e.target.select();
            }}
            onBlur={() => {
              setIsEditingTarget(false);
              setTargetDraft(toMillionsInput(targetHomePrice));
            }}
            aria-label={copy.targetPriceLabel}
            className="tabular-figure w-16 rounded border border-black/15 bg-surface px-1.5 py-0.5 text-right text-xs font-semibold text-ink focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <span aria-hidden="true">M</span>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-mint" aria-hidden="true" />
          <span className="text-ink-muted">{copy.safeUpTo(formatTHB(safeBudget))}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-mandarin" aria-hidden="true" />
          <span className="text-ink-muted">{copy.stretchUpTo(formatTHB(safeBudget), formatTHB(riskZoneThreshold))}</span>
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-critical/70" aria-hidden="true" />
          <span className="text-ink-muted">{copy.riskAbove(formatTHB(riskZoneThreshold))}</span>
        </li>
      </ul>
    </div>
  );
}
