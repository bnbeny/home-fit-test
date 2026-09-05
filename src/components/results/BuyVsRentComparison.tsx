import { Fragment, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Card } from "../ui/Card";
import { SegmentedControl } from "../ui/SegmentedControl";
import { GapAndPlan } from "./GapAndPlan";
import { CASH_FLOW_RISK_STYLES } from "./cashFlowRiskStyles";
import { formatPercent, formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type {
  BuyVsRentOption,
  CalculationAssumptions,
  CapitalValueResult,
  CashFlowBreakdown,
  CashFlowRiskLevel,
  GapPlanScenario,
  PurchasingPowerResult,
  RentGapPlanResult,
  RtoGapPlanResult,
} from "../../types/finance";
import type { Translations } from "../../i18n/types";

type HomePriceBasisKey = "budget" | "target";

interface BuyVsRentComparisonProps {
  /** Every number in this section, including Gap & Plan below, is
   *  recomputed for whichever basis the toggle selects — see
   *  BuyVsRentOption. RTO/Rent's Gap & Plan lenses need their own
   *  ByBudget/ByTarget pair (rtoGapPlanByBudget etc.) since they aren't
   *  derivable on the fly the way Buy's is (see calculateBuyGapNarrative). */
  byBudget: BuyVsRentOption;
  byTarget: BuyVsRentOption;
  rtoGapPlanByBudget: RtoGapPlanResult;
  rtoGapPlanByTarget: RtoGapPlanResult;
  rentGapPlanByBudget: RentGapPlanResult;
  rentGapPlanByTarget: RentGapPlanResult;
  assumptions: CalculationAssumptions;
  appreciationPct: number;
  /** Which card is selected — drives the Gap & Plan section rendered below
   *  the three cards, in this same component (see ResultsDashboard, which
   *  owns this state). */
  selectedScenario: GapPlanScenario;
  onSelectScenario: (scenario: GapPlanScenario) => void;
  /** Passed straight through to GapAndPlan. */
  purchasingPower: PurchasingPowerResult;
  /** Passed straight through to GapAndPlan's Buy down-payment-status card. */
  availableDownPayment: number;
}

type ScenarioKey = "rent" | "rentToOwn" | "buy";

/** This component's own key naming (matching CashFlowBreakdown/
 *  CapitalValueByScenario's "rentToOwn") vs. GapPlanScenario's "rto" —
 *  translates between the two rather than renaming either data shape. */
const SCENARIO_TO_GAP_PLAN: Record<ScenarioKey, GapPlanScenario> = {
  rent: "rent",
  rentToOwn: "rto",
  buy: "buy",
};

const SECTION_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-ink-muted";

const SCENARIO_ACCENT_CLASS: Record<ScenarioKey, string> = {
  rent: "border-t-brand-mint",
  rentToOwn: "border-t-brand-mandarin",
  buy: "border-t-brand-blue",
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function TapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" stroke="none" className={className} aria-hidden="true">
      <path d="M5 3.5a.5.5 0 0 1 .82-.38l9 7a.5.5 0 0 1-.22.88l-3.9.72 2.1 4.06a.5.5 0 0 1-.22.67l-1.3.66a.5.5 0 0 1-.67-.22l-2.06-4-2.75 2.9a.5.5 0 0 1-.86-.35V3.5z" />
    </svg>
  );
}

function MetricRow({
  label,
  tooltip,
  value,
  caption,
  statusBadge,
  className = "",
}: {
  label: string;
  tooltip?: string;
  value: string;
  caption?: string;
  statusBadge?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-3 border-b border-black/5 py-2 last:border-b-0 ${className}`}>
      <span className="flex items-center gap-1 text-xs text-ink-muted">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <span className="text-right">
        <span className="flex items-center justify-end gap-1.5">
          <span className="tabular-figure text-sm font-semibold text-ink">{value}</span>
          {statusBadge}
        </span>
        {caption && <span className="block text-xs text-ink-muted">{caption}</span>}
      </span>
    </div>
  );
}

function capitalValueDisplay(
  capitalValue: CapitalValueResult,
  copy: Translations["results"]["buyVsRent"]["metrics"],
): string {
  if (!capitalValue.accumulates) return copy.capitalValueNo;
  return copy.capitalValueYes(formatTHB(capitalValue.amountTHB ?? 0));
}

/** Small colored dot-tag on the Remaining monthly income row — the only
 *  place cushion status (Comfortable/Tight/High Risk) is shown; no
 *  duplicate badge next to each option's title, so there's exactly one
 *  reading to look at, directly attached to the number it describes. */
function CushionTag({
  status,
  copy,
}: {
  status: CashFlowRiskLevel;
  copy: Translations["results"]["buyVsRent"]["metrics"];
}) {
  const style = CASH_FLOW_RISK_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${style.text}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.bg}`} />
      {copy.cushionStatusLabels[status]}
    </span>
  );
}

function CheckIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

/** The (i) glyph itself — purely decorative where it's used bare (e.g. the
 *  section divider rows), or wrapped as the click target inside InfoTooltip
 *  below where a row has a real explanation to show. */
function InfoDot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 text-ink-muted/60 ${className}`}
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v4.5" strokeLinecap="round" />
      <circle cx="10" cy="6.75" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Click/tap-to-open explanation popover for a Financial Snapshot row's (i)
 *  icon — deliberately click-triggered rather than hover, since hover has
 *  no equivalent on touch devices and the row is inside a clickable
 *  scenario card/column (stopPropagation keeps opening the popover from
 *  also selecting that scenario). Closes on an outside pointerdown, Escape,
 *  or toggling the icon again. */
function InfoTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <InfoDot />
      </button>
      {isOpen && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1.5 w-60 max-w-[80vw] rounded-lg border border-black/10 bg-white p-3 text-left text-xs font-normal normal-case leading-snug tracking-normal text-ink shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** Non-Financial pillar copy (see i18n en.ts/th.ts "pillars") always leads
 *  with an intensity word followed by " — " and a plain-language reason
 *  ("Highest — easy to move..."). This buckets that leading word into the
 *  same 3-tier mint/mandarin/critical language used everywhere else in the
 *  app (see cashFlowRiskStyles.ts) — a pure intensity scale, not a
 *  good/bad judgment, since e.g. "Highest" is a good sign for Flexibility
 *  but a bad one for Debt Risk; color here just lets users scan magnitude
 *  across the three columns, and the row label + surrounding sentence
 *  still carry the actual meaning.
 *
 *  Ordered longest/most-specific prefix first so e.g. "Lowest"/"ต่ำที่สุด"
 *  and "Low-moderate"/"ต่ำถึงปานกลาง" are matched before the shorter
 *  "Low"/"ต่ำ" they both start with. */
const STATUS_WORD_RULES: { prefixes: string[]; className: string }[] = [
  { prefixes: ["low-moderate", "ต่ำถึงปานกลาง"], className: "text-brand-mandarin" },
  { prefixes: ["lowest", "ต่ำที่สุด"], className: "text-brand-mint" },
  { prefixes: ["highest", "สูงที่สุด"], className: "text-brand-critical" },
  { prefixes: ["low", "ต่ำ", "none", "ไม่มี"], className: "text-brand-mint" },
  { prefixes: ["high", "สูง"], className: "text-brand-critical" },
  { prefixes: ["moderate", "medium", "ปานกลาง"], className: "text-brand-mandarin" },
];

function statusWordClassName(statusWord: string): string {
  const normalized = statusWord.trim().toLowerCase();
  const rule = STATUS_WORD_RULES.find((r) => r.prefixes.some((prefix) => normalized.startsWith(prefix)));
  return rule?.className ?? "text-ink";
}

/** Splits "Highest — easy to move..." into a colored leading status word
 *  (see STATUS_WORD_RULES) plus the unstyled rest of the sentence. Falls
 *  back to plain text if the copy doesn't follow that pattern. */
function StatusPhrase({ text }: { text: string }) {
  const separatorIndex = text.indexOf(" — ");
  if (separatorIndex === -1) return <>{text}</>;
  const statusWord = text.slice(0, separatorIndex);
  const rest = text.slice(separatorIndex);
  return (
    <>
      <span className={`font-semibold ${statusWordClassName(statusWord)}`}>{statusWord}</span>
      {rest}
    </>
  );
}

export function BuyVsRentComparison({
  byBudget,
  byTarget,
  rtoGapPlanByBudget,
  rtoGapPlanByTarget,
  rentGapPlanByBudget,
  rentGapPlanByTarget,
  assumptions,
  appreciationPct,
  selectedScenario,
  onSelectScenario,
  purchasingPower,
  availableDownPayment,
}: BuyVsRentComparisonProps) {
  const { t } = useLanguage();
  const copy = t.results.buyVsRent;

  // Which home price basis this section is currently rooted at — every
  // number below (RTO, monthly cash flow, 10-year value, and now Gap &
  // Plan too) comes from `buyVsRent`, recomputed for that basis (see
  // BuyVsRentOption). Defaults to "budget" (Recommended Home Price) — the
  // more realistic/actionable ceiling — but either is a complete,
  // self-consistent view.
  const [basis, setBasis] = useState<HomePriceBasisKey>("budget");
  const buyVsRent = basis === "budget" ? byBudget : byTarget;
  const rtoGapPlan = basis === "budget" ? rtoGapPlanByBudget : rtoGapPlanByTarget;
  const rentGapPlan = basis === "budget" ? rentGapPlanByBudget : rentGapPlanByTarget;
  const { cashFlow, wealthComparison, capitalValue } = buyVsRent;
  const todayLabel = basis === "budget" ? copy.valueHighlight.todayLabelBudget : copy.valueHighlight.todayLabelTarget;
  const basisLabel = basis === "budget" ? copy.valueHighlight.basisLabelBudget : copy.valueHighlight.basisLabelTarget;

  const scenarios: {
    key: ScenarioKey;
    label: string;
    note: string;
    initialPaymentCaption: string;
    /** RTO-only: explains the Monthly Payment figure is the 3-year RTO rate,
     *  not one flat payment for all 10 years (see RentToOwnResult). Omitted
     *  for Buy/Rent — their monthly payment genuinely is one flat figure. */
    monthlyPaymentCaption?: string;
    data: CashFlowBreakdown;
    pillars: Translations["results"]["buyVsRent"]["nonFinancial"]["pillars"]["rent"];
    capitalValue: CapitalValueResult;
  }[] = [
    {
      key: "rent",
      label: copy.scenarioRent,
      note: copy.scenarioNotes.rent,
      initialPaymentCaption: copy.metrics.initialPaymentCaptions.rent,
      data: cashFlow.rent,
      pillars: copy.nonFinancial.pillars.rent,
      capitalValue: capitalValue.rent,
    },
    {
      key: "rentToOwn",
      label: copy.scenarioRentToOwn,
      note: copy.scenarioNotes.rentToOwn,
      initialPaymentCaption: copy.metrics.initialPaymentCaptions.rentToOwn,
      monthlyPaymentCaption: copy.metrics.rentToOwnMonthlyPaymentCaption(
        formatTHB(buyVsRent.rentToOwn.postTransitionMonthlyPaymentTHB),
      ),
      data: cashFlow.rentToOwn,
      pillars: copy.nonFinancial.pillars.rentToOwn,
      capitalValue: capitalValue.rentToOwn,
    },
    {
      key: "buy",
      label: copy.scenarioBuy,
      note: copy.scenarioNotes.buy,
      initialPaymentCaption: copy.metrics.initialPaymentCaptions.buy,
      data: cashFlow.buy,
      pillars: copy.nonFinancial.pillars.buy,
      capitalValue: capitalValue.buy,
    },
  ];

  type Scenario = (typeof scenarios)[number];

  // Shared row definitions — drive both the mobile stacked cards and the
  // desktop shared-label table below, so the two layouts can never drift
  // out of sync with each other.
  const metricRows: {
    key: string;
    label: string;
    tooltip: string;
    value: (s: Scenario) => string;
    /** Optional — omitted for rows where the value is self-explanatory
     *  (Monthly payment, Total paid over 10 years) so the tooltip is the
     *  one place that explains them, instead of repeating under every
     *  figure. */
    caption?: (s: Scenario) => string;
    /** Only set for "remaining" — the cushion status (Comfortable/Tight/
     *  High Risk) is derived directly from this row's own number, so it's
     *  tagged here rather than only in the option header (see CushionTag). */
    statusBadge?: (s: Scenario) => ReactNode;
  }[] = [
    {
      key: "initial",
      label: copy.metrics.initialPaymentLabel,
      tooltip: copy.metrics.tooltips.initialPayment,
      value: (s) => formatTHB(s.data.initialPaymentTHB),
      caption: (s) => s.initialPaymentCaption,
    },
    {
      key: "monthly",
      label: copy.metrics.monthlyPaymentLabel,
      tooltip: copy.metrics.tooltips.monthlyPayment,
      value: (s) => formatTHB(s.data.housingPaymentMonthly),
      caption: (s) => s.monthlyPaymentCaption ?? "",
    },
    {
      key: "remaining",
      label: copy.metrics.remainingLabel,
      tooltip: copy.metrics.tooltips.remaining,
      value: (s) => formatTHB(s.data.remainingMonthly),
      // Display-only floor: a negative remainingPct is a real shortfall
      // (still drives cushionStatus/CushionTag below), but shown as 0% here
      // rather than a confusing negative percentage.
      caption: (s) => copy.metrics.remainingPctCaption(`${Math.round(Math.max(0, s.data.remainingPct))}%`),
      statusBadge: (s) => <CushionTag status={s.data.cushionStatus} copy={copy.metrics} />,
    },
    {
      key: "totalPaid",
      label: copy.metrics.totalPaidLabel,
      tooltip: copy.metrics.tooltips.totalPaid,
      value: (s) => formatTHB(s.data.totalPaidOver10YearsTHB),
    },
    {
      key: "capitalValue",
      label: copy.metrics.capitalValueLabel,
      tooltip: copy.metrics.tooltips.capitalValue,
      value: (s) => (s.capitalValue.accumulates ? "✓" : "✕"),
      caption: (s) => capitalValueDisplay(s.capitalValue, copy.metrics),
    },
  ];

  const pillarRows: { key: string; label: string; tooltip: string; value: (s: Scenario) => ReactNode }[] = [
    {
      key: "flexibility",
      label: copy.nonFinancial.flexibilityLabel,
      tooltip: copy.nonFinancial.tooltips.flexibility,
      value: (s) => <StatusPhrase text={s.pillars.flexibility} />,
    },
    {
      key: "barrier",
      label: copy.nonFinancial.barrierToEntryLabel,
      tooltip: copy.nonFinancial.tooltips.barrierToEntry,
      value: (s) => <StatusPhrase text={s.pillars.barrierToEntry} />,
    },
    {
      key: "debtRisk",
      label: copy.nonFinancial.debtRiskLabel,
      tooltip: copy.nonFinancial.tooltips.debtRisk,
      value: (s) => <StatusPhrase text={s.pillars.debtRisk} />,
    },
  ];

  return (
    <Card title={copy.title}>
      <div className="space-y-8">
        {/* Home price basis toggle — governs every number below (RTO,
            monthly cash flow, 10-year value) except Gap & Plan. */}
        <SegmentedControl
          label={copy.basisToggle.label}
          value={basis}
          onChange={setBasis}
          options={[
            { value: "budget", label: copy.basisToggle.budgetOption(formatTHB(byBudget.homePriceBasis)) },
            { value: "target", label: copy.basisToggle.targetOption(formatTHB(byTarget.homePriceBasis)) },
          ]}
        />

        {/* 10-year home value — shown once up front rather than per-card;
            each card's own Capital Value row also carries this same number.
            Hidden while Rent is selected: renting builds no property value
            at all, so this headline has nothing true to say there. Identical
            for Buy and RTO — a home's market value depends on the home
            itself, not on how it's financed, so the RTO markup never
            inflates this figure (see RentToOwnResult.
            projectedHomeValueYear10THB). No RTO-specific branch needed: both
            scenarios show the exact same homePriceBasis -> year-10 value. */}
        {selectedScenario !== "rent" && (
          <div className="rounded-2xl border-l-4 border-brand-mint bg-surface-sunken p-5 sm:p-6">
            <p className={SECTION_LABEL_CLASS}>{copy.valueHighlight.eyebrow}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-5">
              <div>
                <p className="text-xs font-medium text-ink-muted">{todayLabel}</p>
                <p className="hero-figure mt-0.5 text-2xl font-bold text-ink-muted sm:text-3xl">
                  {formatTHB(buyVsRent.homePriceBasis)}
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 shrink-0 text-ink-muted sm:h-6 sm:w-6" />
              <div>
                <p className="text-xs font-medium text-ink-muted">{copy.valueHighlight.futureLabel}</p>
                <p className="hero-figure mt-0.5 text-3xl font-bold text-ink sm:text-4xl">
                  {formatTHB(wealthComparison.affordableHomeValueYear10)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {copy.valueHighlight.growthNote(formatTHB(buyVsRent.homePriceBasis), formatPercent(appreciationPct, 1), basisLabel)}
            </p>
          </div>
        )}

        {/* Side-by-side comparison — a shared-label table on wider screens
            (label column + one column per scenario, so every metric lines
            up in a single glance across all three options), stacked
            self-contained cards on mobile where a 4-column table would be
            too cramped to read. */}
        <div>
          <p className={SECTION_LABEL_CLASS}>{copy.comparisonTitle}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-brand-blue">
            <TapIcon className="h-3.5 w-3.5 flex-shrink-0" />
            {copy.selectHint}
          </p>

          {/* Mobile: stacked cards, each self-contained with inline labels. */}
          <div className="mt-3 grid grid-cols-1 gap-4 sm:hidden">
            {scenarios.map((scenario) => {
              const gapPlanKey = SCENARIO_TO_GAP_PLAN[scenario.key];
              const isSelected = selectedScenario === gapPlanKey;
              const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectScenario(gapPlanKey);
                }
              };
              return (
                <div
                  key={scenario.key}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onSelectScenario(gapPlanKey)}
                  onKeyDown={onKeyDown}
                  className={`relative cursor-pointer rounded-2xl border-t-4 bg-surface-sunken p-5 ring-2 transition-shadow focus-visible:outline-none ${
                    SCENARIO_ACCENT_CLASS[scenario.key]
                  } ${isSelected ? "ring-brand-blue" : "ring-transparent hover:ring-black/10"}`}
                >
                  {isSelected && (
                    <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      <CheckIcon className="h-3 w-3" />
                      {copy.selectedBadge}
                    </span>
                  )}

                  <h4 className="text-lg font-semibold text-ink">{scenario.label}</h4>

                  <p className="mt-1 text-xs text-ink-muted">{scenario.note}</p>

                  {metricRows.map((row, i) => (
                    <MetricRow
                      key={row.key}
                      className={i === 0 ? "mt-4" : ""}
                      label={row.label}
                      tooltip={row.tooltip}
                      value={row.value(scenario)}
                      caption={row.caption?.(scenario)}
                      statusBadge={row.statusBadge?.(scenario)}
                    />
                  ))}

                  <p className={`${SECTION_LABEL_CLASS} mt-4 border-t border-black/10 pt-3`}>{copy.nonFinancial.title}</p>

                  <dl className="contents text-xs">
                    {pillarRows.map((row) => (
                      <div key={row.key} className="mt-2">
                        <dt className="flex items-center gap-1 font-medium text-ink-muted">
                          {row.label}
                          <InfoTooltip text={row.tooltip} />
                        </dt>
                        <dd className="text-ink">{row.value(scenario)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>

          {/* Desktop: one shared table — a label column on the left plus one
              column per scenario, so every row (Initial payment, Monthly
              payment, ...) is directly comparable without eye travel between
              three separate cards. Each scenario's column is one continuous
              selectable region (header through the last row): a decorative
              "column" div spans every row via `grid-row: 1 / -1` and carries
              the border/tint/click-handling, while the actual row content
              renders as ordinary (non-spanning) grid cells on top of it —
              keeping normal per-row height alignment — with
              `pointer-events-none` so clicks fall through to the spanning
              column div beneath. */}
          <div className="mt-3 hidden sm:block">
            {/* Explicit 11-row template (header, 2 section dividers, 5
                metrics, 3 pillars) is required for `gridRow: "1 / -1"`
                below to resolve correctly — a negative row line counts from
                the end of the *explicit* grid, so without
                grid-template-rows there's no explicit grid for "-1" to
                count from, and each overlay would collapse to a single
                implicit row instead of spanning the whole column. */}
            <div className="grid grid-cols-[minmax(140px,1fr)_repeat(3,1.5fr)] [grid-template-rows:repeat(11,auto)]">
              {/* Every cell below is placed with an explicit gridRow/gridColumn
                  rather than relying on document-order auto-placement: the
                  overlay divs already occupy columns 2-4 across every row
                  (via `gridRow: "1 / -1"`), and CSS Grid's auto-placement
                  algorithm treats those as unavailable, which would shove
                  any auto-placed sibling into the wrong cell. Explicit
                  coordinates sidestep that entirely. */}
              {scenarios.map((scenario, colIndex) => {
                const gapPlanKey = SCENARIO_TO_GAP_PLAN[scenario.key];
                const isSelected = selectedScenario === gapPlanKey;
                const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectScenario(gapPlanKey);
                  }
                };
                return (
                  <div
                    key={scenario.key}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onClick={() => onSelectScenario(gapPlanKey)}
                    onKeyDown={onKeyDown}
                    style={{ gridColumn: colIndex + 2, gridRow: "1 / -1" }}
                    className={`relative cursor-pointer rounded-2xl border border-t-4 transition-colors focus-visible:outline-none ${
                      SCENARIO_ACCENT_CLASS[scenario.key]
                    } ${isSelected ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue" : "border-black/10 hover:bg-black/[0.02]"}`}
                  >
                    {isSelected && (
                      <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        <CheckIcon className="h-3 w-3" />
                        {copy.selectedBadge}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Row 1: label column header + each scenario's title/note. */}
              <div style={{ gridRow: 1, gridColumn: 1 }} className="border-b border-black/5 p-4 text-sm font-bold text-ink">
                {copy.optionColumnLabel}
              </div>
              {scenarios.map((scenario, colIndex) => (
                <div
                  key={scenario.key}
                  style={{ gridRow: 1, gridColumn: colIndex + 2 }}
                  className="pointer-events-none border-b border-black/5 p-4"
                >
                  <h4 className="text-base font-semibold text-ink">{scenario.label}</h4>
                  <p className="mt-1 text-xs text-ink-muted">{scenario.note}</p>
                </div>
              ))}

              {/* Row 2: "Financial Snapshot" section divider. No (i) icon
                  here — same reasoning as "Non-Financial" below: this title
                  has no single explanation of its own, each row underneath
                  carries its own tooltip instead. */}
              <div
                style={{ gridRow: 2, gridColumn: 1 }}
                className="flex items-center gap-1 border-b border-black/5 px-4 py-2 text-sm font-bold text-ink"
              >
                {copy.metrics.sectionTitle}
              </div>
              {scenarios.map((scenario, colIndex) => (
                <div
                  key={`snapshot-${scenario.key}`}
                  style={{ gridRow: 2, gridColumn: colIndex + 2 }}
                  className="pointer-events-none border-b border-black/5"
                />
              ))}

              {/* Rows 3-7: the 5 metric rows. */}
              {metricRows.map((row, rowIndex) => {
                const gridRow = rowIndex + 3;
                return (
                  <Fragment key={row.key}>
                    <div
                      style={{ gridRow, gridColumn: 1 }}
                      className="flex items-center gap-1 border-b border-black/5 px-4 py-3 text-sm text-ink"
                    >
                      {row.label}
                      <InfoTooltip text={row.tooltip} />
                    </div>
                    {scenarios.map((scenario, colIndex) => (
                      <div
                        key={`${row.key}-${scenario.key}`}
                        style={{ gridRow, gridColumn: colIndex + 2 }}
                        className="pointer-events-none border-b border-black/5 px-4 py-3"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="tabular-figure text-sm font-bold text-ink">{row.value(scenario)}</p>
                          {row.statusBadge?.(scenario)}
                        </div>
                        {row.caption?.(scenario) && (
                          <p className="mt-0.5 text-xs text-ink-muted">{row.caption(scenario)}</p>
                        )}
                      </div>
                    ))}
                  </Fragment>
                );
              })}

              {/* Row 8: "Non-Financial" section divider. No (i) icon here —
                  unlike the metric rows, this title has no single
                  explanation of its own; each of the 3 rows below carries
                  its own tooltip instead. */}
              <div
                style={{ gridRow: 8, gridColumn: 1 }}
                className="flex items-center gap-1 border-b border-black/5 px-4 py-2 text-sm font-bold text-ink"
              >
                {copy.nonFinancial.title}
              </div>
              {scenarios.map((scenario, colIndex) => (
                <div
                  key={`nonfinancial-${scenario.key}`}
                  style={{ gridRow: 8, gridColumn: colIndex + 2 }}
                  className="pointer-events-none border-b border-black/5"
                />
              ))}

              {/* Rows 9-11: the 3 non-financial pillar rows. */}
              {pillarRows.map((row, rowIndex) => {
                const gridRow = rowIndex + 9;
                const isLast = rowIndex === pillarRows.length - 1;
                const borderClass = isLast ? "" : "border-b border-black/5";
                return (
                  <Fragment key={row.key}>
                    <div
                      style={{ gridRow, gridColumn: 1 }}
                      className={`flex items-center gap-1 px-4 py-3 text-sm text-ink ${borderClass}`}
                    >
                      {row.label}
                      <InfoTooltip text={row.tooltip} />
                    </div>
                    {scenarios.map((scenario, colIndex) => (
                      <div
                        key={`${row.key}-${scenario.key}`}
                        style={{ gridRow, gridColumn: colIndex + 2 }}
                        className={`pointer-events-none px-4 py-3 text-sm text-ink ${borderClass}`}
                      >
                        {row.value(scenario)}
                      </div>
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <GapAndPlan
          scenario={selectedScenario}
          purchasingPower={purchasingPower}
          homePriceBasis={buyVsRent.homePriceBasis}
          assumptions={assumptions}
          availableDownPayment={availableDownPayment}
          rtoGapPlan={rtoGapPlan}
          rentGapPlan={rentGapPlan}
        />
      </div>
    </Card>
  );
}
