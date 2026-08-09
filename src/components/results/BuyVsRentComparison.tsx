import { useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, SVGProps } from "react";
import { Card } from "../ui/Card";
import { CASH_FLOW_RISK_STYLES } from "./cashFlowRiskStyles";
import { formatPercent, formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type {
  BuyVsRentCashFlowResult,
  CashFlowBreakdown,
  PurchasingPowerResult,
  RentToOwnResult,
  WealthComparisonResult,
} from "../../types/finance";
import type { Translations } from "../../i18n/types";

interface BuyVsRentComparisonProps {
  cashFlow: BuyVsRentCashFlowResult;
  wealthComparison: WealthComparisonResult;
  purchasingPower: PurchasingPowerResult;
  rentToOwn: RentToOwnResult;
  rentalYieldPct: number;
  /** Markup the RTO contract price carries over the target home price — a
   *  fixed policy constant (CalculationAssumptions.rtoPriceMarkupRate,
   *  sourced from RTO-Payment.xlsx), not user-derived, so it's passed
   *  through directly the same way rentalYieldPct already is. */
  rtoPriceMarkupPct: number;
  appreciationPct: number;
}

type ScenarioKey = "rent" | "rentToOwn" | "buy";

const SECTION_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-ink-muted";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function ChevronIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={direction === "left" ? "M12.5 5l-5 5 5 5" : "M7.5 5l5 5-5 5"} />
    </svg>
  );
}

const SCENARIO_ACCENT_CLASS: Record<ScenarioKey, string> = {
  rent: "border-t-brand-mint",
  rentToOwn: "border-t-brand-mandarin",
  buy: "border-t-brand-blue",
};

function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 15.2c.5.6 1.4 1 2.5 1 1.8 0 3-.9 3-2s-1.2-1.6-3-2-3-.9-3-2 1.2-2 3-2c1.1 0 2 .4 2.5 1" />
      <path d="M12 6.5v1M12 16.5v1" />
    </svg>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3.5v-5.5h3V20H17a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3.5 4.5h2l2 11.5h10l1.6-7.5H6.2" />
      <circle cx="9.5" cy="19" r="1.3" />
      <circle cx="16" cy="19" r="1.3" />
    </svg>
  );
}

function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M6.5 14.2h3" />
    </svg>
  );
}

function IconBadge({ tone, children }: { tone: "accent" | "neutral"; children: ReactNode }) {
  const toneClass = tone === "accent" ? "bg-brand-blue/10 text-brand-blue" : "bg-black/5 text-ink-muted";
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${toneClass}`} aria-hidden="true">
      {children}
    </span>
  );
}

function OutflowTile({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 text-center ring-1 ring-black/5">
      <IconBadge tone="neutral">
        <Icon className="h-5 w-5" />
      </IconBadge>
      <p className="mt-2 text-xs font-medium text-ink-muted">{label}</p>
      <p className="hero-figure mt-0.5 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 9.2v4" />
      <circle cx="10" cy="6.6" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}

type RemainingFactorKey = "housing" | "livingExpenses" | "debt";

/**
 * Ranks this scenario's three outflow categories by actual monthly amount
 * (largest first), each paired with its share of gross income. Purely a
 * presentation-layer derivation over the already-computed CashFlowBreakdown
 * — reuses its numbers as-is, no new business logic. `housingLabel` is
 * scenario-specific (e.g. "Monthly rent" vs. "Mortgage payment") so the
 * explanation names the actual payment type, not a generic one.
 */
function rankRemainingFactors(
  data: CashFlowBreakdown,
  housingLabel: string,
  copy: Translations["results"]["buyVsRent"],
): { key: RemainingFactorKey; label: string; amountTHB: number; pctOfIncome: number }[] {
  const pctOfIncome = (part: number) =>
    data.incomeMonthly > 0 ? Math.round((part / data.incomeMonthly) * 100) : 0;

  return [
    {
      key: "housing" as const,
      label: housingLabel,
      amountTHB: data.housingPaymentMonthly,
      pctOfIncome: pctOfIncome(data.housingPaymentMonthly),
    },
    {
      key: "livingExpenses" as const,
      label: copy.allocation.livingExpenses,
      amountTHB: data.livingExpensesMonthly,
      pctOfIncome: pctOfIncome(data.livingExpensesMonthly),
    },
    {
      key: "debt" as const,
      label: copy.allocation.debt,
      amountTHB: data.debtMonthly,
      pctOfIncome: pctOfIncome(data.debtMonthly),
    },
  ]
    .filter((factor) => factor.amountTHB > 0)
    .sort((a, b) => b.amountTHB - a.amountTHB);
}

/**
 * Dynamically explains WHY this scenario's "money left over" figure landed
 * where it did, naming the actual biggest driver(s) from the user's own
 * numbers — never a generic message. A second factor is only named
 * alongside the first when it's genuinely comparable in size (within 60% of
 * the top one), so the explanation doesn't overstate a minor contributor.
 */
function explainRemainingCashFlow(
  data: CashFlowBreakdown,
  housingLabel: string,
  copy: Translations["results"]["buyVsRent"],
): string {
  const explanation = copy.metrics.remainingExplanation;
  const [top, second] = rankRemainingFactors(data, housingLabel, copy);

  if (!top) {
    return explanation.noExpenses;
  }

  const includeSecond = second !== undefined && second.amountTHB >= top.amountTHB * 0.6;
  const topPct = `${top.pctOfIncome}%`;

  if (data.remainingMonthly < 0) {
    const formattedShortfall = formatTHB(Math.abs(data.remainingMonthly));
    return includeSecond
      ? explanation.shortfallWithSecond(formattedShortfall, top.label, topPct, second.label, `${second.pctOfIncome}%`)
      : explanation.shortfall(formattedShortfall, top.label, topPct);
  }

  if (data.cushionStatus === "comfortable") {
    return explanation.comfortable(top.label, `${Math.round(data.remainingPct)}%`);
  }

  return includeSecond
    ? explanation.tightWithSecond(top.label, topPct, second.label, `${second.pctOfIncome}%`)
    : explanation.tight(top.label, topPct);
}

function RemainingCashFlowStat({
  label,
  infoLabel,
  value,
  caption,
  explanation,
}: {
  label: string;
  infoLabel: string;
  value: string;
  caption: string;
  explanation: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <button
      type="button"
      className="relative mt-4 block w-full cursor-help rounded-xl bg-surface p-4 text-left ring-1 ring-black/5"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      aria-describedby={tooltipId}
    >
      <div className="flex items-center gap-1">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <InfoIcon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <span className="sr-only">{infoLabel}</span>
      </div>
      <p className="hero-figure mt-1 text-3xl font-bold text-ink sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{caption}</p>

      {/* Opens upward, not downward: this stat sits at the bottom of the
          scenario card, which itself sits inside the swipeable carousel's
          overflow-hidden track (required to clip the off-screen sibling
          slides during a swipe). A downward popup would render past the
          card's last element and get clipped by that ancestor; opening
          upward stays within the space the card's own content already
          occupies. */}
      <div
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-0 right-0 z-10 mb-2 rounded-lg bg-surface p-3 text-left text-xs font-normal text-ink shadow-lg ring-1 ring-black/10 transition-opacity duration-150 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {explanation}
      </div>
    </button>
  );
}

/** Drag/swipe threshold, in fraction of the track's width, past which a
 *  release commits to the next/previous slide. */
const DRAG_COMMIT_RATIO = 0.18;
/** Fast, short flicks below the distance threshold still commit if they
 *  clear this speed (px/ms), so a quick flick feels as responsive as a
 *  full drag. */
const FLICK_VELOCITY_PX_MS = 0.5;

export function BuyVsRentComparison({
  cashFlow,
  wealthComparison,
  purchasingPower,
  rentToOwn,
  rentalYieldPct,
  rtoPriceMarkupPct,
  appreciationPct,
}: BuyVsRentComparisonProps) {
  const { t } = useLanguage();
  const copy = t.results.buyVsRent;

  // Rooted at the SUGGESTED affordable home budget (maxHomePrice), not the
  // user's stated target home price — see WealthComparisonResult's
  // affordableHomeValueYear10 docstring.
  const homeValueYearTen = wealthComparison.affordableHomeValueYear10;

  // Order matters here: Rent -> Rent-to-Own -> Buy is the deliberate
  // "path toward ownership" story the section tells, from the most
  // flexible/lowest-commitment option to full ownership.
  const scenarios: {
    key: ScenarioKey;
    label: string;
    note: string;
    housingLabel: string;
    data: CashFlowBreakdown;
  }[] = [
    {
      key: "rent",
      label: copy.scenarioRent,
      note: copy.scenarioNotes.rent,
      housingLabel: copy.housingPaymentLabels.rent,
      data: cashFlow.rent,
    },
    {
      key: "rentToOwn",
      label: copy.scenarioRentToOwn,
      note: copy.scenarioNotes.rentToOwn,
      housingLabel: copy.housingPaymentLabels.rentToOwn,
      data: cashFlow.rentToOwn,
    },
    {
      key: "buy",
      label: copy.scenarioBuy,
      note: copy.scenarioNotes.buy,
      housingLabel: copy.housingPaymentLabels.buy,
      data: cashFlow.buy,
    },
  ];
  const lastIndex = scenarios.length - 1;

  // --- Swipeable carousel: one scenario visible at a time, switched by
  // dragging/swiping the track or via the prev/next controls. Pointer
  // events unify mouse, touch, and pen, so the same handlers drive both
  // desktop drag and mobile swipe. ---
  const [index, setIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  // Live gesture values live in refs, not state: state updates are batched
  // and only visible to closures after a re-render, but a pointerup can
  // fire in the same synchronous dispatch as the preceding pointermove
  // (no render in between) — reading state in endGesture would then see a
  // stale value. Refs are always current regardless of render timing.
  const dragPxRef = useRef(0);
  const trackWidthRef = useRef(0);
  const gestureRef = useRef<{ x: number; y: number; startTime: number } | null>(null);
  const axisRef = useRef<"x" | "y" | null>(null);

  const goTo = (next: number) => setIndex(Math.max(0, Math.min(lastIndex, next)));
  const showPrevious = () => goTo(indexRef.current - 1);
  const showNext = () => goTo(indexRef.current + 1);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    trackWidthRef.current = e.currentTarget.offsetWidth || 1;
    gestureRef.current = { x: e.clientX, y: e.clientY, startTime: performance.now() };
    axisRef.current = null;
    dragPxRef.current = 0;
    setIsDragging(true);
    setDragPx(0);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const dx = e.clientX - gesture.x;
    const dy = e.clientY - gesture.y;
    if (axisRef.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (axisRef.current !== "x") return;
    // Resistance past the first/last slide so the drag doesn't run away.
    const atStart = indexRef.current === 0 && dx > 0;
    const atEnd = indexRef.current === lastIndex && dx < 0;
    const next = atStart || atEnd ? dx / 3 : dx;
    dragPxRef.current = next;
    setDragPx(next);
  };

  const endGesture = (e: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (axisRef.current === "x" && gesture) {
      const finalDragPx = dragPxRef.current;
      const elapsed = Math.max(1, performance.now() - gesture.startTime);
      const velocity = finalDragPx / elapsed;
      const distanceThreshold = trackWidthRef.current * DRAG_COMMIT_RATIO;
      if (finalDragPx <= -distanceThreshold || velocity <= -FLICK_VELOCITY_PX_MS) {
        showNext();
      } else if (finalDragPx >= distanceThreshold || velocity >= FLICK_VELOCITY_PX_MS) {
        showPrevious();
      }
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    gestureRef.current = null;
    axisRef.current = null;
    dragPxRef.current = 0;
    setIsDragging(false);
    setDragPx(0);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") showPrevious();
    if (e.key === "ArrowRight") showNext();
  };

  const activeKey = scenarios[index].key;

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title}>
      <div className="space-y-8">
        {/* 10-year home value — the primary visual focus while Buy is
            active. Renting builds no equivalent asset, and Rent-to-Own
            builds toward ownership on its own terms, so each of those
            slides swaps in a short explanatory note instead of a home-value
            figure, rather than showing a number that would misleadingly
            imply otherwise. */}
        <div
          className={`rounded-2xl border-l-4 bg-surface-sunken p-5 sm:p-6 ${
            activeKey === "buy" ? "border-brand-mint" : "border-black/10"
          }`}
        >
          <p className={SECTION_LABEL_CLASS}>{copy.valueHighlight.eyebrow}</p>
          {activeKey === "buy" ? (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-5">
                <div>
                  <p className="text-xs font-medium text-ink-muted">{copy.valueHighlight.todayLabel}</p>
                  <p className="hero-figure mt-0.5 text-2xl font-bold text-ink-muted sm:text-3xl">
                    {formatTHB(purchasingPower.maxHomePrice)}
                  </p>
                </div>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink-muted sm:h-6 sm:w-6" />
                <div>
                  <p className="text-xs font-medium text-ink-muted">{copy.valueHighlight.futureLabel}</p>
                  <p className="hero-figure mt-0.5 text-3xl font-bold text-ink sm:text-4xl">
                    {formatTHB(homeValueYearTen)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                {copy.valueHighlight.growthNote(
                  formatTHB(purchasingPower.maxHomePrice),
                  formatPercent(appreciationPct, 1),
                )}
              </p>
            </>
          ) : activeKey === "rentToOwn" ? (
            <p className="mt-3 text-sm text-ink-muted">
              {copy.valueHighlight.rentToOwnNote(formatTHB(rentToOwn.paidTowardPriceAfter3YearsTHB))}
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">{copy.valueHighlight.rentNote}</p>
          )}
        </div>

        {/* Swipeable rent/rent-to-own/buy comparison — one scenario on
            screen at a time. */}
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className={SECTION_LABEL_CLASS}>{copy.comparisonTitle}</p>
            <p className="hidden text-xs text-ink-muted sm:block">{copy.swipeHint}</p>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={showPrevious}
              disabled={index === 0}
              aria-label={copy.previousCard}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted ring-1 ring-black/10 transition-colors hover:text-ink disabled:opacity-30"
            >
              <ChevronIcon direction="left" className="h-4 w-4" />
            </button>

            <div
              className="min-w-0 flex-1 select-none overflow-hidden"
              style={{ touchAction: "pan-y" }}
              role="region"
              aria-roledescription="carousel"
              aria-label={copy.comparisonTitle}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endGesture}
              onPointerCancel={endGesture}
            >
              <div
                className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
                style={{
                  transform: `translateX(calc(${-index * 100}% + ${dragPx}px))`,
                  cursor: isDragging ? "grabbing" : "grab",
                }}
              >
                {scenarios.map((scenario, i) => {
                  const cushionStyle = CASH_FLOW_RISK_STYLES[scenario.data.cushionStatus];

                  return (
                    <div
                      key={scenario.key}
                      className="w-full shrink-0 px-1"
                      aria-hidden={i !== index}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={scenario.label}
                    >
                      <div
                        className={`rounded-2xl border-t-4 bg-surface-sunken p-5 sm:p-6 ${SCENARIO_ACCENT_CLASS[scenario.key]}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-semibold text-ink">{scenario.label}</h4>
                            <p className="mt-1 text-sm text-ink-muted">{scenario.note}</p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cushionStyle.text} ${cushionStyle.border}`}
                          >
                            <span aria-hidden="true">{cushionStyle.icon}</span>
                            {copy.metrics.cushionStatusLabels[scenario.data.cushionStatus]}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className={SECTION_LABEL_CLASS}>{copy.allocation.title}</p>
                          <div className="mt-3 flex flex-col items-center">
                            <div className="w-full max-w-xs rounded-2xl bg-brand-blue/8 p-4 text-center ring-1 ring-brand-blue/15">
                              <IconBadge tone="accent">
                                <CoinIcon className="h-5 w-5" />
                              </IconBadge>
                              <p className="mt-2 text-xs font-medium text-ink-muted">{copy.metrics.income}</p>
                              <p className="hero-figure mt-0.5 text-2xl font-bold text-ink">
                                {formatTHB(scenario.data.incomeMonthly)}
                              </p>
                            </div>

                            <span className="my-3 h-6 w-px bg-black/10" aria-hidden="true" />

                            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                              <OutflowTile
                                icon={CartIcon}
                                label={copy.allocation.livingExpenses}
                                value={formatTHB(scenario.data.livingExpensesMonthly)}
                              />
                              <OutflowTile
                                icon={HomeIcon}
                                label={scenario.housingLabel}
                                value={formatTHB(scenario.data.housingPaymentMonthly)}
                              />
                              <OutflowTile
                                icon={CardIcon}
                                label={copy.allocation.debt}
                                value={formatTHB(scenario.data.debtMonthly)}
                              />
                            </div>
                          </div>
                        </div>

                        <RemainingCashFlowStat
                          label={copy.metrics.remainingLabel}
                          infoLabel={copy.metrics.remainingExplanation.infoLabel}
                          value={formatTHB(scenario.data.remainingMonthly)}
                          caption={copy.metrics.remainingPctCaption(`${Math.round(scenario.data.remainingPct)}%`)}
                          explanation={explainRemainingCashFlow(scenario.data, scenario.housingLabel, copy)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={showNext}
              disabled={index === lastIndex}
              aria-label={copy.nextCard}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted ring-1 ring-black/10 transition-colors hover:text-ink disabled:opacity-30"
            >
              <ChevronIcon direction="right" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            {scenarios.map((scenario, i) => (
              <button
                key={scenario.key}
                type="button"
                onClick={() => goTo(i)}
                aria-label={scenario.label}
                aria-current={index === i}
                className={`h-1.5 w-4 rounded-full transition-colors ${
                  index === i ? "bg-brand-blue" : "bg-black/15"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-ink-muted sm:hidden">{copy.swipeHint}</p>
        </div>

        {/* Neutral 3-way recommendation summary — each option states its
            own trade-off, grounded in its own real monthly payment; none is
            framed as the "winner". */}
        <div className="rounded-xl bg-surface-sunken p-5">
          <p className={SECTION_LABEL_CLASS}>{copy.recommendation.eyebrow}</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-ink">
            <li>{copy.recommendation.rentSummary(formatTHB(cashFlow.rent.housingPaymentMonthly))}</li>
            <li>{copy.recommendation.rentToOwnSummary(formatTHB(cashFlow.rentToOwn.housingPaymentMonthly))}</li>
            <li>{copy.recommendation.buySummary(formatTHB(cashFlow.buy.housingPaymentMonthly))}</li>
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        {copy.rentEstimateNote(formatPercent(rentalYieldPct, 1), formatTHB(wealthComparison.estimatedMonthlyRent))}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {copy.rentToOwnEstimateNote(formatTHB(rentToOwn.contractFeeTHB), formatPercent(rtoPriceMarkupPct, 0))}
      </p>
    </Card>
  );
}
