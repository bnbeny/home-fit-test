import { useId, useState } from "react";
import type { ReactNode } from "react";
import { calculateBuyGapNarrative, formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type {
  AlternativeSuggestion,
  CalculationAssumptions,
  GapPlanScenario,
  PurchasingPowerResult,
  RentGapPlanResult,
  RtoGapPlanResult,
} from "../../types/finance";
import type { Translations } from "../../i18n/types";

interface GapAndPlanProps {
  /** Which scenario to narrate — selected by clicking one of the three
   *  cards above this section (see BuyVsRentComparison, which renders this
   *  component directly below its Rent/RTO/Buy grid, and ResultsDashboard,
   *  which owns the selection state). */
  scenario: GapPlanScenario;
  purchasingPower: PurchasingPowerResult;
  /** Whichever home price the Buy vs Rent section's own "Compare based on"
   *  toggle currently shows (Recommended Home Price or the user's Target
   *  Home Price) — Buy's whole gap narrative is recomputed against this on
   *  the fly (see calculateBuyGapNarrative), so switching that toggle
   *  changes what's shown here too. */
  homePriceBasis: number;
  assumptions: CalculationAssumptions;
  /** Down payment cash already on hand — answers.availableDownPayment,
   *  passed straight through so Buy's down payment gap row
   *  (calculateBuyGapNarrative) can be computed against it at whichever
   *  basis price is selected. */
  availableDownPayment: number;
  /** RTO/Rent's gap lenses, pre-computed for the SAME basis as
   *  homePriceBasis — see BuyVsRentComparison, which picks the matching
   *  ByBudget/ByTarget pair for whichever basis its toggle currently shows. */
  rtoGapPlan: RtoGapPlanResult;
  rentGapPlan: RentGapPlanResult;
}

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

/** over-risk-budget and stretch-zone each render as 2 bullets (the gap
 *  itself, then the suggestion) instead of 1 combined sentence. */
function renderSuggestion(
  suggestion: AlternativeSuggestion,
  suggestions: Translations["results"]["gapAndPlan"]["suggestions"],
): string[] {
  switch (suggestion.key) {
    case "over-risk-budget":
      return suggestions.overRiskBudget(formatTHB(suggestion.amountTHB ?? 0));
    case "stretch-zone":
      return suggestions.stretchZone;
  }
}

/** Shared template pieces so Buy/RTO/Rent's THE GAP and THE PLAN cards are
 *  literally the same component, styled once — see BuyContent/RtoContent/
 *  RentContent below, which each just decide WHICH rows apply to their own
 *  calculations (never inventing a row a scenario's own numbers don't
 *  support) and pass them into these. */

/** One "**Label: ฿Amount** muted explanation" row — used by every gap and
 *  cost line across all three scenarios. */
function GapRow({ label, amount, detail }: { label: string; amount: string; detail: string }) {
  return (
    <li>
      <span className="font-semibold text-ink">
        {label}: {amount}
      </span>{" "}
      <span className="text-ink-muted">{detail}</span>
    </li>
  );
}

/** One "**Label:** muted action" row — used by every plan action across all
 *  three scenarios. detail carries its own amount/timeline inline (each
 *  scenario's copy interpolates that itself), so this stays a plain label +
 *  sentence pairing. */
function PlanRow({ label, detail }: { label: string; detail: ReactNode }) {
  return (
    <li>
      <span className="font-semibold text-ink">{label}: </span>
      <span className="text-ink-muted">{detail}</span>
    </li>
  );
}

function GapCard({ label, rows }: { label: string; rows: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <ul className="mt-2 space-y-2.5 text-sm text-ink">{rows}</ul>
    </div>
  );
}

/** additionalOption is optional — Rent has no downsize-style lever this app
 *  models, so it simply renders no secondary section (never an invented
 *  one) — see RentContent. */
function PlanCard({
  label,
  rows,
  additionalOptionLabel,
  additionalOption,
}: {
  label: string;
  rows: ReactNode;
  additionalOptionLabel: string;
  additionalOption?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-surface-sunken p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <ul className="mt-2 space-y-2.5 text-sm text-ink">{rows}</ul>
      {additionalOption && (
        <div className="mt-3 border-t border-black/10 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{additionalOptionLabel}</p>
          <p className="mt-1 text-xs text-ink-muted">{additionalOption}</p>
        </div>
      )}
    </div>
  );
}

function BuyContent({
  purchasingPower,
  homePriceBasis,
  assumptions,
  availableDownPayment,
  copy,
}: {
  purchasingPower: PurchasingPowerResult;
  homePriceBasis: number;
  assumptions: CalculationAssumptions;
  availableDownPayment: number;
  copy: Translations["results"]["gapAndPlan"];
}) {
  const {
    priceGap,
    isPriceGapClosed,
    additionalMonthlyInstallmentNeeded,
    requiredMonthlyInstallmentForTarget,
    downsizeSuggestion,
    remainingDownPayment,
    transactionCostEstimate,
  } = calculateBuyGapNarrative(homePriceBasis, purchasingPower, assumptions, availableDownPayment);

  const isDownPaymentGapClosed = remainingDownPayment === 0;

  return (
    <>
      {/* THE GAP — all three upfront gaps in one card, each its own row and
          deliberately never summed together: the home price gap and the
          down payment gap measure different constraints (loan eligibility
          vs. cash-on-hand against the minimum down payment) and can
          overlap, so adding them would double-count. */}
      <GapCard
        label={copy.gapLabel}
        rows={
          <>
            {priceGap > 0 && (
              <GapRow
                label={copy.gapItems.homePrice.label}
                amount={formatTHB(priceGap)}
                detail={copy.gapItems.homePrice.detail(formatTHB(homePriceBasis))}
              />
            )}
            {remainingDownPayment > 0 && (
              <GapRow
                label={copy.gapItems.downPayment.label}
                amount={formatTHB(remainingDownPayment)}
                detail={copy.gapItems.downPayment.detail}
              />
            )}
            <GapRow
              label={copy.gapItems.transactionFees.label}
              amount={formatTHB(transactionCostEstimate)}
              detail={copy.gapItems.transactionFees.detail}
            />
          </>
        }
      />

      {/* THE PLAN — one row per gap above, each independently switching
          between "ready" (nothing to do) and "action" (the lever + amount)
          since the home price gap and down payment gap can close on their
          own schedules. */}
      <PlanCard
        label={copy.planLabel}
        rows={
          <>
            <PlanRow
              label={copy.planItems.homePrice.label}
              detail={
                isPriceGapClosed
                  ? copy.planItems.homePrice.ready
                  : copy.planItems.homePrice.action(
                      formatTHB(additionalMonthlyInstallmentNeeded),
                      formatTHB(requiredMonthlyInstallmentForTarget),
                    )
              }
            />
            <PlanRow
              label={copy.planItems.downPayment.label}
              detail={
                isDownPaymentGapClosed
                  ? copy.planItems.downPayment.ready
                  : copy.planItems.downPayment.action(formatTHB(remainingDownPayment))
              }
            />
            <PlanRow
              label={copy.planItems.transactionFees.label}
              detail={copy.planItems.transactionFees.action(formatTHB(transactionCostEstimate))}
            />
          </>
        }
        additionalOptionLabel={copy.additionalOptionLabel}
        additionalOption={
          downsizeSuggestion && renderSuggestion(downsizeSuggestion, copy.suggestions).join(" ")
        }
      />
    </>
  );
}

function RtoContent({
  rtoGapPlan,
  purchasingPower,
  homePriceBasis,
  assumptions,
  availableDownPayment,
  copy,
}: {
  rtoGapPlan: RtoGapPlanResult;
  purchasingPower: PurchasingPowerResult;
  homePriceBasis: number;
  assumptions: CalculationAssumptions;
  availableDownPayment: number;
  copy: Translations["results"]["gapAndPlan"];
}) {
  const { rto } = copy;

  // Home price gap and the Additional Option reuse Buy's OWN
  // calculateBuyGapNarrative verbatim — Buy and RTO share one
  // financial-eligibility ceiling (purchasingPower.maxHomePrice, the
  // Recommended Home Price), so this stays the shared affordability
  // benchmark, and the Additional Option reads identically to Buy's (same
  // stretch/risk-zone tiers, same copy.suggestions). It is GAP-card-only,
  // informational context — there's no RTO-specific lever that closes it
  // (closing it means more loan capacity, Buy's own action, shown under the
  // Buy tab), so additionalMonthlyInstallmentNeeded/
  // requiredMonthlyInstallmentForTarget are deliberately never used here —
  // RTO's own PLAN below is entirely RTO-specific cash-flow math instead
  // (contract fee, Years 1-3 payment feasibility).
  const { priceGap, downsizeSuggestion } = calculateBuyGapNarrative(
    homePriceBasis,
    purchasingPower,
    assumptions,
    availableDownPayment,
  );

  let contractFeePlanDetail: ReactNode;
  if (rtoGapPlan.isContractFeeGapClosed) {
    contractFeePlanDetail = rto.planItems.contractFee.ready;
  } else if (rtoGapPlan.monthsToCloseContractFeeGap !== null) {
    contractFeePlanDetail = rto.planItems.contractFee.action(
      formatTHB(rtoGapPlan.rtoContractFeeGap),
      rtoGapPlan.monthsToCloseContractFeeGap,
    );
  } else {
    contractFeePlanDetail = rto.planItems.contractFee.notAchievable;
  }

  const showHomePriceGapRow = priceGap > 0;
  const showContractFeeGapRow = rtoGapPlan.rtoContractFeeGap > 0;

  return (
    <>
      {(showHomePriceGapRow || showContractFeeGapRow || rtoGapPlan.hasMonthlyShortfall) && (
        <GapCard
          label={copy.gapLabel}
          rows={
            <>
              {showHomePriceGapRow && (
                <GapRow
                  label={rto.gapItems.homePrice.label}
                  amount={formatTHB(priceGap)}
                  detail={rto.gapItems.homePrice.detail(formatTHB(homePriceBasis))}
                />
              )}
              {showContractFeeGapRow && (
                <GapRow
                  label={rto.gapItems.contractFee.label}
                  amount={formatTHB(rtoGapPlan.rtoContractFeeGap)}
                  detail={rto.gapItems.contractFee.detail}
                />
              )}
              {rtoGapPlan.hasMonthlyShortfall && (
                <GapRow
                  label={rto.gapItems.monthlyShortfall.label}
                  amount={formatTHB(rtoGapPlan.monthlyShortfallTHB)}
                  detail={rto.gapItems.monthlyShortfall.detail}
                />
              )}
            </>
          }
        />
      )}

      <PlanCard
        label={copy.planLabel}
        rows={
          <>
            <PlanRow label={rto.planItems.contractFee.label} detail={contractFeePlanDetail} />
            {rtoGapPlan.hasMonthlyShortfall && (
              <PlanRow
                label={rto.planItems.monthlyShortfall.label}
                detail={rto.planItems.monthlyShortfall.action(formatTHB(rtoGapPlan.monthlyShortfallTHB))}
              />
            )}
          </>
        }
        additionalOptionLabel={copy.additionalOptionLabel}
        additionalOption={downsizeSuggestion && renderSuggestion(downsizeSuggestion, copy.suggestions).join(" ")}
      />
    </>
  );
}

function RentContent({
  rentGapPlan,
  copy,
}: {
  rentGapPlan: RentGapPlanResult;
  copy: Translations["results"]["gapAndPlan"];
}) {
  const { rent } = copy;

  // Rental deposit row (the Rent parallel to Buy's down payment gap / RTO's
  // contract fee gap rows) is shown only when there's an actual gap to
  // close — ฿0 rows are omitted everywhere in THE GAP now. The monthly
  // shortfall row is likewise shown only when it's an actual shortfall —
  // Rent has no ongoing approval/equity requirement like Buy or RTO's
  // cushion check, so a comfortable month isn't a "gap" either.
  const showRentalDepositGapRow = rentGapPlan.rentalDepositGap > 0;

  let rentalDepositPlanDetail: ReactNode;
  if (rentGapPlan.isRentalDepositReady) {
    rentalDepositPlanDetail = rent.planItems.rentalDeposit.ready(formatTHB(rentGapPlan.requiredRentalDeposit));
  } else if (rentGapPlan.monthsToCloseRentalDepositGap !== null) {
    rentalDepositPlanDetail = rent.planItems.rentalDeposit.action(
      formatTHB(rentGapPlan.requiredRentalDeposit),
      formatTHB(rentGapPlan.rentalDepositGap),
      rentGapPlan.monthsToCloseRentalDepositGap,
    );
  } else {
    rentalDepositPlanDetail = rent.planItems.rentalDeposit.notAchievable(
      formatTHB(rentGapPlan.requiredRentalDeposit),
      formatTHB(rentGapPlan.rentalDepositGap),
    );
  }

  return (
    <>
      {(showRentalDepositGapRow || rentGapPlan.hasMonthlyShortfall) && (
        <GapCard
          label={copy.gapLabel}
          rows={
            <>
              {showRentalDepositGapRow && (
                <GapRow
                  label={rent.gapItems.rentalDeposit.label}
                  amount={formatTHB(rentGapPlan.rentalDepositGap)}
                  detail={rent.gapItems.rentalDeposit.detail}
                />
              )}
              {rentGapPlan.hasMonthlyShortfall && (
                <GapRow
                  label={rent.gapItems.monthlyShortfall.label}
                  amount={formatTHB(rentGapPlan.monthlyShortfallTHB)}
                  detail={rent.gapItems.monthlyShortfall.detail}
                />
              )}
            </>
          }
        />
      )}

      <PlanCard
        label={copy.planLabel}
        rows={
          <>
            <PlanRow label={rent.planItems.rentalDeposit.label} detail={rentalDepositPlanDetail} />
            {rentGapPlan.hasMonthlyShortfall && (
              <PlanRow
                label={rent.planItems.monthlyShortfall.label}
                detail={rent.planItems.monthlyShortfall.action(formatTHB(rentGapPlan.monthlyShortfallTHB))}
              />
            )}
          </>
        }
        additionalOptionLabel={copy.additionalOptionLabel}
      />
    </>
  );
}

/** Buy/RTO/Rent-selectable Gap & Plan narrative — see GapPlanScenario. Buy's
 *  content is recomputed live for whichever home price basis is selected
 *  (see calculateBuyGapNarrative); RTO and Rent read whichever ByBudget/
 *  ByTarget pair matches that same basis. */
export function GapAndPlan({
  scenario,
  purchasingPower,
  homePriceBasis,
  assumptions,
  availableDownPayment,
  rtoGapPlan,
  rentGapPlan,
}: GapAndPlanProps) {
  const { t } = useLanguage();
  const copy = t.results.gapAndPlan;
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();

  return (
    <div className="border-t border-black/10 pt-6">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-start justify-between gap-4 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <div>
          <h3 className="text-lg font-semibold text-ink">{copy.title}</h3>
          <p className="mt-0.5 text-sm font-medium text-brand-blue">{copy.showingLabel(copy.scenarioLabels[scenario])}</p>
        </div>
        <ChevronIcon
          className={`mt-1 h-5 w-5 flex-shrink-0 text-ink-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={contentId}
        role="region"
        aria-hidden={!isOpen}
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-4">
            {scenario === "buy" && (
              <BuyContent
                purchasingPower={purchasingPower}
                homePriceBasis={homePriceBasis}
                assumptions={assumptions}
                availableDownPayment={availableDownPayment}
                copy={copy}
              />
            )}
            {scenario === "rto" && (
              <RtoContent
                rtoGapPlan={rtoGapPlan}
                purchasingPower={purchasingPower}
                homePriceBasis={homePriceBasis}
                assumptions={assumptions}
                availableDownPayment={availableDownPayment}
                copy={copy}
              />
            )}
            {scenario === "rent" && <RentContent rentGapPlan={rentGapPlan} copy={copy} />}
          </div>
        </div>
      </div>
    </div>
  );
}
