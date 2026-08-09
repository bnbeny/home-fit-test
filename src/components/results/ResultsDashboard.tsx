import { useMemo } from "react";
import { Button } from "../ui/Button";
import { ReadinessScore } from "./ReadinessScore";
import { PurchasingPower } from "./PurchasingPower";
import { AdvisoryNotices } from "./AdvisoryNotices";
import { BuyVsRentComparison } from "./BuyVsRentComparison";
import { computeCalculatorResult } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
import type { QuestionnaireAnswers } from "../../types/finance";

interface ResultsDashboardProps {
  answers: QuestionnaireAnswers;
  onEditAnswers: () => void;
}

export function ResultsDashboard({ answers, onEditAnswers }: ResultsDashboardProps) {
  const { t } = useLanguage();

  const result = useMemo(
    () => computeCalculatorResult(answers, DEFAULT_ASSUMPTIONS),
    [answers],
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
        />
        <AdvisoryNotices notices={result.advisoryNotices} />
        <BuyVsRentComparison
          cashFlow={result.buyVsRentCashFlow}
          wealthComparison={result.wealthComparison}
          purchasingPower={result.purchasingPower}
          rentToOwn={result.rentToOwn}
          rentalYieldPct={DEFAULT_ASSUMPTIONS.rentalYieldPct}
          rtoPriceMarkupPct={DEFAULT_ASSUMPTIONS.rtoPriceMarkupRate}
          appreciationPct={answers.expectedAppreciationPct}
        />
      </div>

      <p className="text-center text-xs text-ink-muted">{t.results.disclaimer}</p>
    </div>
  );
}
