import { CASH_FLOW_RISK_STYLES } from "./cashFlowRiskStyles";
import type { CashFlowRiskLevel } from "../../types/finance";
import type { Translations } from "../../i18n/types";

/** Small colored dot-tag naming a cushion status (Comfortable/Tight/High
 *  Risk) next to a Remaining Monthly Income figure — shared by
 *  BuyVsRentComparison's comparison table/highlight card and
 *  PurchasingPower's target summary cards, so the same status always reads
 *  the same way wherever it's shown. */
export function CushionTag({
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
