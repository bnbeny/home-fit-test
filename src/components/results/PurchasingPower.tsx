import { Card } from "../ui/Card";
import { StatTile } from "./StatTile";
import { BudgetZoneBar } from "./BudgetZoneBar";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { PurchasingPowerResult } from "../../types/finance";
import type { Translations } from "../../i18n/types";

/** Bounds/step for the BudgetZoneBar's draggable target-price marker —
 *  matches the range the (removed) Target Home Price slider used to use. */
const TARGET_PRICE_MIN = 500_000;
const TARGET_PRICE_MAX = 20_000_000;
const TARGET_PRICE_STEP = 10_000;

interface PurchasingPowerProps {
  purchasingPower: PurchasingPowerResult;
  targetHomePrice: number;
  onTargetHomePriceChange: (value: number) => void;
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

export function PurchasingPower({
  purchasingPower,
  targetHomePrice,
  onTargetHomePriceChange,
}: PurchasingPowerProps) {
  const { t } = useLanguage();
  const copy = t.results.purchasingPower;

  return (
    <Card title={copy.title}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile
          label={copy.homeBudget}
          value={formatTHB(purchasingPower.maxHomePrice)}
          caption={copy.homeBudgetCaption}
        />
        <StatTile
          label={copy.installment}
          value={copy.perMonth(formatTHB(purchasingPower.recommendedMonthlyInstallment))}
          caption={`${getInstallmentRationale(purchasingPower, copy.installmentRationale)} ${copy.installmentTenureNote(
            purchasingPower.effectiveLoanTermYears,
          )}`}
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
        />
      </div>
    </Card>
  );
}
