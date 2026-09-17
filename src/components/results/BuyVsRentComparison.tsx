import { Fragment, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Card } from "../ui/Card";
import { SegmentedControl } from "../ui/SegmentedControl";
import { InfoTooltip } from "../ui/InfoTooltip";
import { ActionStep } from "../ui/ActionStep";
import { GapAndPlan } from "./GapAndPlan";
import { CushionTag } from "./CushionTag";
import { formatPercent, formatSignedTHB, formatTHB, calculateNetCashFlow10Years } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type {
  BuyVsRentOption,
  CalculationAssumptions,
  CapitalValueResult,
  CashFlowBreakdown,
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

/** Same per-scenario accent colors as SCENARIO_ACCENT_CLASS above, keyed by
 *  GapPlanScenario ("rto" instead of "rentToOwn") and as a left-border class
 *  — used by the 10-year home value card so its accent matches whichever
 *  option is selected. */
const GAP_PLAN_ACCENT_CLASS: Record<GapPlanScenario, string> = {
  rent: "border-l-brand-mint",
  rto: "border-l-brand-mandarin",
  buy: "border-l-brand-blue",
};

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** "bold" emphasizes a row's own figures (Total Paid, Capital Value) a
 *  notch above the other Financial Snapshot rows, without changing what's
 *  shown. "total" (Net Cash Flow) shares that same highlighted background
 *  (see highlightEdge/HIGHLIGHT_BG_CLASS) but is deliberately NOT bolder —
 *  it's set apart by its tinted background and its value's sign color
 *  (see valueColorClassName), not by extra font weight. */
type MetricRowEmphasis = "default" | "bold" | "total";

// Text size is deliberately identical across all 3 emphasis levels — "bold"/
// "total" rows (Total Paid, Capital Value, Net Cash Flow) stand out via the
// row's own background/border tint (see HIGHLIGHT_BG_CLASS), never by
// growing the text itself, so they read as emphasized rows within the same
// table rather than a different type size. "bold" also adds extra
// font-weight; "total" deliberately matches "default"'s weight — see this
// type's own doc comment.
const METRIC_ROW_VALUE_CLASS: Record<MetricRowEmphasis, string> = {
  default: "text-sm font-semibold text-ink",
  bold: "text-sm font-extrabold text-ink",
  total: "text-sm font-semibold text-ink",
};

/** Same emphasis levels as METRIC_ROW_VALUE_CLASS, but for the desktop
 *  shared-label table, which (unlike the mobile MetricRow) has always shown
 *  every row's value at font-bold — kept as this map's own "default" so
 *  adding "bold" emphasis for Total Paid/Capital Value doesn't quietly
 *  lighten every other row's existing weight; "total" (Net Cash Flow)
 *  matches this same "default" weight rather than "bold"'s. */
const DESKTOP_METRIC_VALUE_CLASS: Record<MetricRowEmphasis, string> = {
  default: "text-sm font-bold text-ink",
  bold: "text-sm font-extrabold text-ink",
  total: "text-sm font-bold text-ink",
};

/** Highlighted-background treatment for the 3 consecutive highlighted
 *  metric rows (Total Paid/Capital Value/Net Cash Flow), used by MetricRow
 *  (mobile): one continuous tinted panel rather than 3 separate boxes —
 *  "top" carries the heavier divider from the un-highlighted rows above and
 *  rounds its top corners, "bottom" rounds its bottom corners, "middle"
 *  gets neither so the background reads as unbroken. Each mobile row is
 *  already one full-width block, so rounding its own top/bottom corners
 *  merges cleanly with its neighbors. */
const HIGHLIGHT_BG_CLASS: Record<"top" | "middle" | "bottom", string> = {
  top: "rounded-t-lg border-t-2 border-black/10 bg-surface-sunken",
  middle: "bg-surface-sunken",
  bottom: "rounded-b-lg bg-surface-sunken",
};

/** Same 3 highlighted rows, for the desktop table instead — deliberately
 *  NOT rounded: each row there is split across 4 separate side-by-side grid
 *  cells with no gap between them, and rounding each cell's own corner
 *  independently would show as a visible notch at every cell boundary
 *  rather than one smooth panel edge. A flat tinted rectangle (with only
 *  the "top" row's heavier divider) reads as one continuous panel without
 *  that artifact. */
const DESKTOP_HIGHLIGHT_BG_CLASS: Record<"top" | "middle" | "bottom", string> = {
  top: "border-t-2 border-black/10 bg-surface-sunken",
  middle: "bg-surface-sunken",
  bottom: "bg-surface-sunken",
};

const METRIC_ROW_CAPTION_CLASS: Record<MetricRowEmphasis, string> = {
  default: "text-ink-muted",
  bold: "font-semibold text-ink",
  total: "font-medium text-ink",
};

function MetricRow({
  label,
  tooltip,
  value,
  caption,
  statusBadge,
  emphasis = "default",
  highlightEdge,
  valueColorClassName = "",
  className = "",
}: {
  label: string;
  tooltip?: string;
  value: string;
  caption?: string;
  statusBadge?: ReactNode;
  emphasis?: MetricRowEmphasis;
  /** Required whenever emphasis !== "default" — see HIGHLIGHT_BG_CLASS. */
  highlightEdge?: "top" | "middle" | "bottom";
  /** Overrides the value's color for "total" (sign-colored Net Cash Flow) —
   *  ignored for "default"/"bold", which always use text-ink. */
  valueColorClassName?: string;
  className?: string;
}) {
  const isHighlighted = emphasis !== "default";
  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        isHighlighted
          ? `px-3 py-2 ${HIGHLIGHT_BG_CLASS[highlightEdge ?? "middle"]}`
          : "border-b border-black/5 py-2 last:border-b-0"
      } ${className}`}
    >
      <span className={`flex items-center gap-1 text-xs ${isHighlighted ? "font-semibold text-ink" : "text-ink-muted"}`}>
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <span className="text-right">
        <span className="flex items-center justify-end gap-1.5">
          <span
            className={`tabular-figure ${METRIC_ROW_VALUE_CLASS[emphasis]} ${
              emphasis === "total" ? valueColorClassName : ""
            }`}
          >
            {value}
          </span>
          {statusBadge}
        </span>
        {caption && <span className={`block text-xs ${METRIC_ROW_CAPTION_CLASS[emphasis]}`}>{caption}</span>}
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

/** Resolves the OptionCardStack's 4-line decision summary (Best for/
 *  Upside/Trade-off/What to know) for one scenario — each line reuses a
 *  figure already computed elsewhere (CashFlowBreakdown.initialPaymentTHB/
 *  housingPaymentMonthly, CapitalValueResult.amountTHB) rather than
 *  introducing any new calculation; see selectedSummary.content in
 *  i18n/types.ts for which figure backs which line. */
function decisionContentFor(
  scenario: { key: ScenarioKey; data: CashFlowBreakdown; capitalValue: CapitalValueResult },
  copy: Translations["results"]["buyVsRent"]["selectedSummary"],
  /** Buy's CashFlowBreakdown.housingPaymentMonthly — only used for RTO's
   *  trade-off, which compares its own flat RTO payment against what a
   *  standard mortgage on the same home would cost per month. */
  buyHousingPaymentMonthly: number,
): { bestFor: string; upside: string; tradeOff: string; whatToKnow: string } {
  switch (scenario.key) {
    case "rent":
      return {
        bestFor: copy.content.rent.bestFor,
        upside: copy.content.rent.upside(formatTHB(scenario.data.initialPaymentTHB)),
        tradeOff: copy.content.rent.tradeOff,
        whatToKnow: copy.content.rent.whatToKnow,
      };
    case "rentToOwn":
      return {
        bestFor: copy.content.rentToOwn.bestFor,
        upside: copy.content.rentToOwn.upside(formatTHB(scenario.capitalValue.amountTHB ?? 0)),
        tradeOff: copy.content.rentToOwn.tradeOff(
          formatTHB(scenario.data.housingPaymentMonthly),
          formatTHB(buyHousingPaymentMonthly),
        ),
        whatToKnow: copy.content.rentToOwn.whatToKnow,
      };
    case "buy":
      return {
        bestFor: copy.content.buy.bestFor,
        upside: copy.content.buy.upside(formatTHB(scenario.capitalValue.amountTHB ?? 0)),
        tradeOff: copy.content.buy.tradeOff(formatTHB(scenario.data.initialPaymentTHB)),
        whatToKnow: copy.content.buy.whatToKnow,
      };
  }
}

function CheckIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

/** Chevron used on the "View full comparison"/"Hide comparison" toggle —
 *  points down when collapsed (there's more to reveal), up when expanded. */
function ChevronIcon({ className, direction }: { className?: string; direction: "down" | "up" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${className} ${direction === "up" ? "rotate-180" : ""}`}
    >
      <path d="M5 7.5l5 5 5-5" />
    </svg>
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
  // Purely a display toggle for the detailed comparison table below the
  // OptionCardStack — expanded by default so nothing that used to be
  // always-visible disappears by default. Collapsing/expanding never
  // touches selectedScenario, basis, or any calculated value.
  const [isComparisonExpanded, setIsComparisonExpanded] = useState(true);
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
    /** "bold" for Total Paid/Capital Value; "total" for Net Cash Flow
     *  itself, the section's bottom-line 10-year outcome. Both get the same
     *  highlighted background treatment (see highlightEdge) — "total" no
     *  longer means "extra bold," just "this row's own value is
     *  sign-colored" (see valueColorClassName). */
    emphasis?: MetricRowEmphasis;
    /** Only set on the 3 highlighted rows (Total Paid/Capital Value/Net
     *  Cash Flow), which sit consecutively at the end of this list and
     *  share one continuous highlighted background rather than 3 separate
     *  boxes: "top" gets the heavier top border and top corners rounded,
     *  "bottom" gets the bottom corners rounded, "middle" gets neither. */
    highlightEdge?: "top" | "middle" | "bottom";
    /** Only set for "netCashFlow" — colors the figure by sign so a negative
     *  outcome (e.g. Rent, which never accumulates capital value) reads
     *  immediately, not just via its leading minus sign. */
    valueColorClassName?: (s: Scenario) => string;
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
      emphasis: "bold",
      highlightEdge: "top",
    },
    {
      key: "capitalValue",
      label: copy.metrics.capitalValueLabel,
      tooltip: copy.metrics.tooltips.capitalValue,
      value: (s) => (s.capitalValue.accumulates ? "✓" : "✕"),
      caption: (s) => capitalValueDisplay(s.capitalValue, copy.metrics),
      emphasis: "bold",
      highlightEdge: "middle",
    },
    {
      key: "netCashFlow",
      label: copy.metrics.netCashFlowLabel,
      tooltip: copy.metrics.tooltips.netCashFlow,
      // Capital Value minus Total Paid — reuses those same two figures
      // (calculateNetCashFlow10Years), never a separate calculation.
      value: (s) => formatSignedTHB(calculateNetCashFlow10Years(s.data, s.capitalValue)),
      emphasis: "total",
      highlightEdge: "bottom",
      valueColorClassName: (s) =>
        calculateNetCashFlow10Years(s.data, s.capitalValue) < 0 ? "text-brand-critical" : "text-brand-mint",
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
            monthly cash flow, 10-year value) except Gap & Plan. Step 2 of
            the page's 3 numbered "what to do" prompts (see ActionStep). */}
        <div>
          <ActionStep step={2} title={copy.basisToggle.label} />
          <div className="mt-2">
            <SegmentedControl
              label={copy.basisToggle.label}
              hideLabel
              value={basis}
              onChange={setBasis}
              options={[
                { value: "budget", label: copy.basisToggle.budgetOption(formatTHB(byBudget.homePriceBasis)) },
                { value: "target", label: copy.basisToggle.targetOption(formatTHB(byTarget.homePriceBasis)) },
              ]}
            />
          </div>
        </div>

        {/* OptionCardStack — this now IS the selection control (the
            comparison table below no longer accepts clicks; see its own
            comment). 3 cards, always in the same Rent/RTO/Buy order;
            clicking any of them (including the already-selected one, a
            no-op) calls onSelectScenario, so this stays perfectly in sync
            with the 10-Year Home Value card, the highlighted table column,
            and Gap & Plan below — all driven by the same selectedScenario
            prop. The selected card expands into a concise decision summary
            (Best for/Upside/Trade-off/What to know — see
            decisionContentFor); the other two collapse to just their name
            and existing scenarioNotes line, so the stack reads as one
            prominent card flanked by two compact, clearly secondary ones. */}
        <div>
          <ActionStep step={3} title={copy.selectedSummary.eyebrow} />
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            {scenarios.map((scenario) => {
              const gapPlanKey = SCENARIO_TO_GAP_PLAN[scenario.key];
              const isSelected = selectedScenario === gapPlanKey;
              const content = decisionContentFor(scenario, copy.selectedSummary, cashFlow.buy.housingPaymentMonthly);
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
                  className={`relative cursor-pointer rounded-2xl border-t-4 p-4 text-left transition-all duration-300 focus-visible:outline-none sm:p-5 ${
                    SCENARIO_ACCENT_CLASS[scenario.key]
                  } ${
                    isSelected
                      ? "z-10 scale-[1.02] bg-surface shadow-lg ring-2 ring-brand-blue sm:flex-[1.3]"
                      : "scale-[0.98] bg-surface-sunken opacity-80 ring-1 ring-transparent hover:opacity-100 hover:ring-black/10 sm:flex-[0.85] sm:-mx-1"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      <CheckIcon className="h-3 w-3" />
                      {copy.selectedBadge}
                    </span>
                  )}

                  <h4 className={`font-bold text-ink ${isSelected ? "text-lg sm:text-xl" : "text-base"}`}>
                    {scenario.label}
                  </h4>

                  {isSelected ? (
                    <dl className="mt-3 space-y-2.5 text-sm">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                          {copy.selectedSummary.bestForLabel}
                        </dt>
                        <dd className="text-ink">{content.bestFor}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                          {copy.selectedSummary.upsideLabel}
                        </dt>
                        <dd className="text-ink">{content.upside}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                          {copy.selectedSummary.tradeOffLabel}
                        </dt>
                        <dd className="text-ink">{content.tradeOff}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                          {copy.selectedSummary.whatToKnowLabel}
                        </dt>
                        <dd className="text-ink">{content.whatToKnow}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-2 text-xs text-ink-muted">{scenario.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
          <div
            className={`rounded-2xl border-l-4 bg-surface-sunken p-5 sm:p-6 ${GAP_PLAN_ACCENT_CLASS[selectedScenario]}`}
          >
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

        {/* Side-by-side comparison — comparison-only now (see OptionCardStack
            above for selection): a shared-label table on wider screens
            (label column + one column per scenario, so every metric lines
            up in a single glance across all three options), stacked
            self-contained cards on mobile where a 4-column table would be
            too cramped to read. Neither layout accepts clicks any more —
            each just highlights whichever column/card matches
            selectedScenario. */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={SECTION_LABEL_CLASS}>{copy.comparisonTitle}</p>
              <p className="mt-1 text-xs text-ink-muted">{copy.selectHint}</p>
            </div>
            {/* Collapsing/expanding only hides the table below — it never
                touches selectedScenario, the basis toggle, or any
                calculation, and the OptionCardStack above stays visible
                either way. */}
            <button
              type="button"
              onClick={() => setIsComparisonExpanded((expanded) => !expanded)}
              aria-expanded={isComparisonExpanded}
              className="flex shrink-0 items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              {isComparisonExpanded ? copy.hideComparison : copy.viewFullComparison}
              <ChevronIcon className="h-3.5 w-3.5" direction={isComparisonExpanded ? "up" : "down"} />
            </button>
          </div>

          {isComparisonExpanded && (
            <>
            {/* Mobile: stacked cards, each self-contained with inline labels. */}
            <div className="mt-3 grid grid-cols-1 gap-4 sm:hidden">
              {scenarios.map((scenario) => {
                const gapPlanKey = SCENARIO_TO_GAP_PLAN[scenario.key];
                const isSelected = selectedScenario === gapPlanKey;
                return (
                  <div
                    key={scenario.key}
                    className={`relative rounded-2xl border-t-4 p-5 ring-2 transition-colors ${
                      SCENARIO_ACCENT_CLASS[scenario.key]
                    } ${isSelected ? "bg-brand-blue/5 ring-brand-blue" : "bg-surface-sunken opacity-90 ring-transparent"}`}
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
                        emphasis={row.emphasis}
                        highlightEdge={row.highlightEdge}
                        valueColorClassName={row.valueColorClassName?.(scenario)}
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
                highlighted region (header through the last row) — not
                clickable (selection happens on the OptionCardStack above): a
                decorative "column" div spans every row via `grid-row: 1 / -1`
                and carries only the border/tint highlighting, while the
                actual row content renders as ordinary (non-spanning) grid
                cells on top of it — keeping normal per-row height alignment
                — with `pointer-events-none` on both, since neither layer
                accepts input any more. */}
            <div className="mt-3 hidden sm:block">
              {/* Explicit 12-row template (header, 2 section dividers, 6
                  metrics — including Net Cash Flow, the section's bottom-line
                  row — 3 pillars) is required for `gridRow: "1 / -1"` below to
                  resolve correctly — a negative row line counts from the end
                  of the *explicit* grid, so without grid-template-rows
                  there's no explicit grid for "-1" to count from, and each
                  overlay would collapse to a single implicit row instead of
                  spanning the whole column. */}
              <div className="grid grid-cols-[minmax(140px,1fr)_repeat(3,1.5fr)] [grid-template-rows:repeat(12,auto)]">
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
                  return (
                    <div
                      key={scenario.key}
                      style={{ gridColumn: colIndex + 2, gridRow: "1 / -1" }}
                      className={`pointer-events-none relative rounded-2xl border border-t-4 transition-colors ${
                        SCENARIO_ACCENT_CLASS[scenario.key]
                      } ${isSelected ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue" : "border-black/10 opacity-90"}`}
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

                {/* Rows 3-8: the 6 metric rows. The last 3 (Total Paid,
                    Capital Value, Net Cash Flow) share one continuous
                    tinted panel (see DESKTOP_HIGHLIGHT_BG_CLASS) with Net
                    Cash Flow's own value additionally sign-colored (see
                    METRIC_ROW_VALUE_CLASS/METRIC_ROW_CAPTION_CLASS) so the
                    group reads as the section's bottom-line 10-year
                    outcome. */}
                {metricRows.map((row, rowIndex) => {
                  const gridRow = rowIndex + 3;
                  const emphasis = row.emphasis ?? "default";
                  const isHighlighted = emphasis !== "default";
                  const highlightClass = isHighlighted ? DESKTOP_HIGHLIGHT_BG_CLASS[row.highlightEdge ?? "middle"] : "";
                  return (
                    <Fragment key={row.key}>
                      <div
                        style={{ gridRow, gridColumn: 1 }}
                        className={`flex items-center gap-1 px-4 py-3 text-sm ${
                          isHighlighted ? `${highlightClass} font-semibold text-ink` : "border-b border-black/5 text-ink"
                        }`}
                      >
                        {row.label}
                        <InfoTooltip text={row.tooltip} />
                      </div>
                      {scenarios.map((scenario, colIndex) => (
                        <div
                          key={`${row.key}-${scenario.key}`}
                          style={{ gridRow, gridColumn: colIndex + 2 }}
                          className={`pointer-events-none px-4 py-3 ${isHighlighted ? highlightClass : "border-b border-black/5"}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <p
                              className={`tabular-figure ${DESKTOP_METRIC_VALUE_CLASS[emphasis]} ${
                                emphasis === "total" ? row.valueColorClassName?.(scenario) ?? "" : ""
                              }`}
                            >
                              {row.value(scenario)}
                            </p>
                            {row.statusBadge?.(scenario)}
                          </div>
                          {row.caption?.(scenario) && (
                            <p className={`mt-0.5 text-xs ${METRIC_ROW_CAPTION_CLASS[emphasis]}`}>{row.caption(scenario)}</p>
                          )}
                        </div>
                      ))}
                    </Fragment>
                  );
                })}

                {/* Row 9: "Non-Financial" section divider. No (i) icon here —
                    unlike the metric rows, this title has no single
                    explanation of its own; each of the 3 rows below carries
                    its own tooltip instead. */}
                <div
                  style={{ gridRow: 9, gridColumn: 1 }}
                  className="flex items-center gap-1 border-b border-black/5 px-4 py-2 text-sm font-bold text-ink"
                >
                  {copy.nonFinancial.title}
                </div>
                {scenarios.map((scenario, colIndex) => (
                  <div
                    key={`nonfinancial-${scenario.key}`}
                    style={{ gridRow: 9, gridColumn: colIndex + 2 }}
                    className="pointer-events-none border-b border-black/5"
                  />
                ))}

                {/* Rows 10-12: the 3 non-financial pillar rows. */}
                {pillarRows.map((row, rowIndex) => {
                  const gridRow = rowIndex + 10;
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
            </>
          )}
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
