import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Card } from "../ui/Card";
import { StatTile } from "./StatTile";
import { BudgetZoneBar } from "./BudgetZoneBar";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { ActionPlanResult, AlternativeSuggestion, PurchasingPowerResult } from "../../types/finance";
import type { Translations } from "../../i18n/types";

interface PurchasingPowerProps {
  purchasingPower: PurchasingPowerResult;
  targetHomePrice: number;
  actionPlan: ActionPlanResult;
  applicantAge: number;
  maxAgeAtLoanMaturity: number;
  transactionCostRate: number;
  targetTimelineMonths: number;
}

/** Which of the three ceilings (bank DSR, household budget, personal
 *  comfort) is binding, in one sentence — so the recommended installment
 *  never reads as a black box. */
function getInstallmentRationale(
  purchasingPower: PurchasingPowerResult,
  copy: Translations["results"]["purchasingPower"]["installmentRationale"],
): string {
  if (purchasingPower.bindingInstallmentCeiling === "dsr") {
    return copy.dsrBinding(formatTHB(purchasingPower.affordableByDSR));
  }
  if (purchasingPower.bindingInstallmentCeiling === "budget") {
    return copy.budgetBinding(formatTHB(purchasingPower.affordableByBudget));
  }
  const nextCeiling = Math.min(purchasingPower.affordableByDSR, purchasingPower.affordableByBudget);
  return copy.comfortBinding(
    formatTHB(purchasingPower.recommendedMonthlyInstallment),
    formatTHB(nextCeiling),
  );
}

/** over-risk-budget and stretch-zone each render as 2 bullets (the gap
 *  itself, then the suggestion) instead of 1 combined sentence — everything
 *  else is a single bullet. */
function renderSuggestion(
  suggestion: AlternativeSuggestion,
  suggestions: Translations["results"]["gapAndPlan"]["suggestions"],
): string[] {
  switch (suggestion.key) {
    case "over-risk-budget":
      return suggestions.overRiskBudget(formatTHB(suggestion.amountTHB ?? 0));
    case "stretch-zone":
      return suggestions.stretchZone;
    case "no-saving-plan":
      return [suggestions.noSavingPlan];
    case "comfort-limited":
      return [suggestions.comfortLimited];
    case "low-emergency-cushion":
      return [suggestions.lowEmergencyCushion(formatTHB(suggestion.amountTHB ?? 0))];
  }
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

export function PurchasingPower({
  purchasingPower,
  targetHomePrice,
  actionPlan,
  applicantAge,
  maxAgeAtLoanMaturity,
  transactionCostRate,
  targetTimelineMonths,
}: PurchasingPowerProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;
  const gapCopy = t.results.gapAndPlan;
  const [isGapOpen, setIsGapOpen] = useState(true);
  const gapContentId = useId();

  const {
    priceGap,
    isPriceGapClosed,
    additionalDownPaymentNeeded,
    additionalMonthlyInstallmentNeeded,
    requiredMonthlyInstallmentForTarget,
  } = purchasingPower;

  // Always shown (not conditional, unlike the suggestions below) — the fee
  // actually owed depends on which price the buyer lands at, so both are
  // shown rather than picking one.
  const feeAtAffordablePrice = purchasingPower.maxHomePrice * transactionCostRate;
  const feeAtTargetPrice = targetHomePrice * transactionCostRate;

  let planContent: ReactNode;
  if (isPriceGapClosed) {
    planContent = gapCopy.planReady;
  } else {
    planContent = (
      <>
        <p>{gapCopy.planOptionDownPayment(formatTHB(additionalDownPaymentNeeded))}</p>
        <p className="mt-2">
          {gapCopy.planOptionInstallment(
            formatTHB(additionalMonthlyInstallmentNeeded),
            formatTHB(requiredMonthlyInstallmentForTarget),
          )}
        </p>
      </>
    );
  }

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label={copy.homeBudget}
          value={formatTHB(purchasingPower.maxHomePrice)}
          caption={copy.homeBudgetCaption}
        />
        <StatTile
          label={copy.installment}
          value={copy.perMonth(formatTHB(purchasingPower.recommendedMonthlyInstallment))}
          caption={getInstallmentRationale(purchasingPower, copy.installmentRationale)}
        />
        <StatTile
          label={copy.loanTenure}
          value={copy.loanTenureValue(purchasingPower.effectiveLoanTermYears)}
          caption={copy.loanTenureCaption(applicantAge, maxAgeAtLoanMaturity, Math.ceil(targetTimelineMonths / 12))}
        />
      </div>

      <div className="mt-6">
        <BudgetZoneBar
          safeBudget={purchasingPower.safeBudget}
          stretchBudget={purchasingPower.stretchBudget}
          riskZoneThreshold={purchasingPower.riskZoneThreshold}
          targetHomePrice={targetHomePrice}
        />
      </div>

      {/* The Gap & The Plan — folded into the same card since it's the
          direct follow-through on the budget above: here's what you can
          afford, and here's the gap/plan to actually get there. */}
      <div className="mt-6 border-t border-black/10 pt-6">
        <button
          type="button"
          onClick={() => setIsGapOpen((open) => !open)}
          aria-expanded={isGapOpen}
          aria-controls={gapContentId}
          className="flex w-full items-start justify-between gap-4 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">{gapCopy.eyebrow}</p>
            <h3 className="text-lg font-semibold text-ink">{gapCopy.title}</h3>
          </div>
          <ChevronIcon
            className={`mt-1 h-5 w-5 flex-shrink-0 text-ink-muted transition-transform duration-300 ${
              isGapOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          id={gapContentId}
          role="region"
          aria-hidden={!isGapOpen}
          className="grid transition-[grid-template-rows] duration-300 ease-in-out"
          style={{ gridTemplateRows: isGapOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="space-y-4 pt-4">
              <div className="rounded-lg bg-surface-sunken p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{gapCopy.gapLabel}</p>
                <p className="mt-1 text-sm text-ink">
                  {isPriceGapClosed
                    ? gapCopy.gapReady
                    : gapCopy.gapShort(formatTHB(priceGap), formatTHB(targetHomePrice))}
                </p>
              </div>

              <div className="rounded-lg bg-surface-sunken p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{gapCopy.planLabel}</p>
                <div className="mt-1 text-sm text-ink">{planContent}</div>
              </div>

              <div className="rounded-lg bg-surface-sunken p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {gapCopy.transactionFeeNoteLabel}
                </p>
                <p className="mt-1 text-sm text-ink">
                  {gapCopy.transactionFeeNote(
                    formatTHB(feeAtAffordablePrice),
                    formatTHB(purchasingPower.maxHomePrice),
                    formatTHB(feeAtTargetPrice),
                    formatTHB(targetHomePrice),
                  )}
                </p>
              </div>

              {actionPlan.alternativeSuggestions.length > 0 && (
                <div className="rounded-lg bg-surface-sunken p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {gapCopy.alternativesLabel}
                  </p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-ink">
                    {actionPlan.alternativeSuggestions.map((suggestion) => (
                      <li key={suggestion.key}>
                        {renderSuggestion(suggestion, gapCopy.suggestions).join(" ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-dashed border-black/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {gapCopy.keepInMindLabel}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{gapCopy.keepInMindText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
