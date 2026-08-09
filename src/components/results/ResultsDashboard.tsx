import { useMemo } from "react";
import { Button } from "../ui/Button";
import { ReadinessScore } from "./ReadinessScore";
import { PurchasingPower } from "./PurchasingPower";
import { AdvisoryNotices } from "./AdvisoryNotices";
import { BuyVsRentComparison } from "./BuyVsRentComparison";
import { computeCalculatorResult } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
import type { CalculationAssumptions, QuestionnaireAnswers } from "../../types/finance";

interface ResultsDashboardProps {
  answers: QuestionnaireAnswers;
  onEditAnswers: () => void;
  /** Defaults to DEFAULT_ASSUMPTIONS. Only the Master view passes a
   *  different (live-edited) value — the normal questionnaire flow always
   *  runs on the real defaults. */
  assumptions?: CalculationAssumptions;
}

export function ResultsDashboard({
  answers,
  onEditAnswers,
  assumptions = DEFAULT_ASSUMPTIONS,
}: ResultsDashboardProps) {
  const { t } = useLanguage();

  const result = useMemo(
    () => computeCalculatorResult(answers, assumptions),
    [answers, assumptions],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">{t.results.heading}</h2>
        <Button variant="secondary" onClick={onEditAnswers}>
          {t.results.editAnswers}
        </Button>
      </div>

      <div className="space-y-6">
        <ReadinessScore readiness={result.readiness} />
        <PurchasingPower
          purchasingPower={result.purchasingPower}
          targetHomePrice={answers.targetHomePrice}
          actionPlan={result.actionPlan}
          applicantAge={answers.applicantAge}
          maxAgeAtLoanMaturity={assumptions.maxAgeAtLoanMaturity}
          transactionCostRate={assumptions.transactionCostRate}
          targetTimelineMonths={answers.targetTimelineMonths}
        />
        <AdvisoryNotices notices={result.advisoryNotices} />
        <BuyVsRentComparison
          byBudget={result.buyVsRentByBudget}
          byTarget={result.buyVsRentByTarget}
          rentalYieldPct={assumptions.rentalYieldPct}
          rtoPriceMarkupPct={assumptions.rtoPriceMarkupRate}
          appreciationPct={answers.expectedAppreciationPct}
        />
      </div>

      <p className="text-center text-xs text-ink-muted">{t.results.disclaimer}</p>
    </div>
  );
}
