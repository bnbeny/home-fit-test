import { StatTile } from "./StatTile";
import { BudgetZoneBar } from "./BudgetZoneBar";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { CashFlowBreakdown, PurchasingPowerResult } from "../../types/finance";
import type { Translations } from "../../i18n/types";

/** Bounds/step for the BudgetZoneBar's draggable target-price marker —
 *  matches the range the (removed) Target Home Price slider used to use. */
const TARGET_PRICE_MIN = 500_000;
const TARGET_PRICE_MAX = 100_000_000;
const TARGET_PRICE_STEP = 10_000;

interface PurchasingPowerProps {
  purchasingPower: PurchasingPowerResult;
  targetHomePrice: number;
  onTargetHomePriceChange: (value: number) => void;
  /** buyVsRentByTarget.cashFlow.buy — the Buy option's monthly cash-flow
   *  breakdown rooted at the user's own Target Home Price (not the
   *  Recommended Home Budget). Powers the 3 target-summary cards below
   *  (Monthly Installment, Remaining Monthly Income) with the exact same
   *  calculation BuyVsRentComparison's own table already uses — nothing
   *  recomputed here. */
  targetCashFlow: CashFlowBreakdown;
  /** buyVsRentByTarget.wealthComparison.loanForTargetHome — the loan portion
   *  of the target home price (the rest is the down payment: targetHomePrice
   *  - loanForTargetHome). Powers the "Loan + Down payment" breakdown caption
   *  under the target home price card, so ฿7.04M doesn't read as one opaque
   *  number when it's actually two very different kinds of money (borrowed
   *  vs. the household's own cash). */
  loanForTargetHome: number;
}

/** Which of the three ceilings (bank DSR, household budget, personal
 *  comfort) is binding, in one sentence — so the recommended installment
 *  never reads as a black box. Now shown behind the Recommended Monthly
 *  Installment reference point's (i) tooltip on the budget scale, rather
 *  than as a permanent caption. */
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

export function PurchasingPower({
  purchasingPower,
  targetHomePrice,
  onTargetHomePriceChange,
  targetCashFlow,
  loanForTargetHome,
}: PurchasingPowerProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;
  const buyVsRentCopy = t.results.buyVsRent;
  const downPaymentForTargetHome = Math.max(0, targetHomePrice - loanForTargetHome);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-ink">{copy.title}</h3>
      {/* The 3 target-summary cards lead the section — the financial impact
          of whatever Target Home Price the user currently has selected —
          with the budget scale (Recommended Home Budget/Installment as its
          own labeled benchmark) below, so the user's own numbers are read
          first and the recommended benchmark follows as context. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          label={copy.targetSummary.homePriceLabel}
          value={formatTHB(targetHomePrice)}
          caption={copy.targetSummary.homePriceBreakdown(
            formatTHB(loanForTargetHome),
            formatTHB(downPaymentForTargetHome),
          )}
          tooltip={copy.targetSummary.tooltips.homePrice}
        />
        <StatTile
          label={copy.targetSummary.installmentLabel}
          value={copy.perMonth(formatTHB(targetCashFlow.housingPaymentMonthly))}
          tooltip={copy.targetSummary.tooltips.installment(String(purchasingPower.effectiveLoanTermYears))}
        />
        <StatTile
          label={copy.targetSummary.remainingLabel}
          value={formatTHB(targetCashFlow.remainingMonthly)}
          caption={buyVsRentCopy.metrics.remainingPctCaption(
            `${Math.round(Math.max(0, targetCashFlow.remainingPct))}%`,
          )}
          tooltip={copy.targetSummary.tooltips.remaining}
        />
      </div>

      <div className="mt-6">
        <BudgetZoneBar
          safeBudget={purchasingPower.safeBudget}
          riskZoneThreshold={purchasingPower.riskZoneThreshold}
          targetHomePrice={targetHomePrice}
          onTargetHomePriceChange={onTargetHomePriceChange}
          min={TARGET_PRICE_MIN}
          max={TARGET_PRICE_MAX}
          step={TARGET_PRICE_STEP}
          recommendedHomeBudget={purchasingPower.maxHomePrice}
          recommendedHomeBudgetNote={copy.homeBudgetCaption}
          recommendedMonthlyInstallment={purchasingPower.recommendedMonthlyInstallment}
          recommendedMonthlyInstallmentNote={`${getInstallmentRationale(purchasingPower, copy.installmentRationale)} ${copy.installmentTenureNote(
            purchasingPower.effectiveLoanTermYears,
          )}`}
        />
      </div>
    </div>
  );
}
