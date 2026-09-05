import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { ReadinessScore } from "./ReadinessScore";
import { PurchasingPower } from "./PurchasingPower";
import { AdvisoryNotices } from "./AdvisoryNotices";
import { BuyVsRentComparison } from "./BuyVsRentComparison";
import { NotesSection } from "./NotesSection";
import { computeCalculatorResult } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
import type { CalculationAssumptions, GapPlanScenario, QuestionnaireAnswers } from "../../types/finance";

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

  // Recommended Home Price (maxHomePrice) doesn't depend on targetHomePrice,
  // so it's safe to compute once with the answers as-is to seed the
  // adjustable Target Home Price control below. The lazy initializer runs
  // once on mount only, so this re-seeds whenever the user returns to the
  // results page (this component remounts) rather than tracking every
  // subsequent answers edit — the form no longer collects a target price to
  // preserve across visits.
  const [targetHomePrice, setTargetHomePrice] = useState(() =>
    Math.round(computeCalculatorResult(answers, assumptions).purchasingPower.maxHomePrice / 1_000) * 1_000,
  );
  const [gapPlanScenario, setGapPlanScenario] = useState<GapPlanScenario>("buy");

  const result = useMemo(
    () => computeCalculatorResult({ ...answers, targetHomePrice }, assumptions),
    [answers, targetHomePrice, assumptions],
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
          targetHomePrice={targetHomePrice}
          onTargetHomePriceChange={setTargetHomePrice}
        />
        <AdvisoryNotices notices={result.advisoryNotices} />
        <BuyVsRentComparison
          byBudget={result.buyVsRentByBudget}
          byTarget={result.buyVsRentByTarget}
          rtoGapPlanByBudget={result.rtoGapPlanByBudget}
          rtoGapPlanByTarget={result.rtoGapPlanByTarget}
          rentGapPlanByBudget={result.rentGapPlanByBudget}
          rentGapPlanByTarget={result.rentGapPlanByTarget}
          assumptions={assumptions}
          appreciationPct={answers.expectedAppreciationPct}
          selectedScenario={gapPlanScenario}
          onSelectScenario={setGapPlanScenario}
          purchasingPower={result.purchasingPower}
          availableDownPayment={answers.availableDownPayment}
        />
      </div>

      <NotesSection assumptions={assumptions} appreciationPct={answers.expectedAppreciationPct} />
    </div>
  );
}
