import { useState } from "react";
import { MasterAssumptionsPanel } from "./MasterAssumptionsPanel";
import { MasterAnswersPanel } from "./MasterAnswersPanel";
import { ResultsDashboard } from "../results/ResultsDashboard";
import { Button } from "../ui/Button";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
import type { CalculationAssumptions, QuestionnaireAnswers } from "../../types/finance";

interface MasterViewProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
  onEditAnswers: () => void;
  onClose: () => void;
}

/** Debug/review sandbox: the 6 questionnaire steps AND the 6 core
 *  assumptions both live-editable on the left, with the full results
 *  dashboard on the right recomputing on every change (plain React state +
 *  useMemo inside ResultsDashboard — no debounce needed, the calculations
 *  are cheap pure functions). The assumptions edits only affect this view;
 *  answers edits write back to the same shared state the normal
 *  questionnaire flow uses, since they're the same underlying data. */
export function MasterView({ answers, onUpdate, onEditAnswers, onClose }: MasterViewProps) {
  const { t } = useLanguage();
  const [assumptions, setAssumptions] = useState<CalculationAssumptions>(DEFAULT_ASSUMPTIONS);

  const handleChange = (patch: Partial<CalculationAssumptions>) => {
    setAssumptions((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">{t.master.title}</h2>
          <p className="text-sm text-ink-muted">{t.master.subtitle}</p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          {t.master.closeButton}
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6 lg:sticky lg:top-6">
          <MasterAnswersPanel answers={answers} onUpdate={onUpdate} />
          <MasterAssumptionsPanel
            assumptions={assumptions}
            onChange={handleChange}
            onReset={() => setAssumptions(DEFAULT_ASSUMPTIONS)}
          />
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {t.master.resultsTitle}
          </p>
          <ResultsDashboard
            answers={answers}
            onEditAnswers={onEditAnswers}
            assumptions={assumptions}
          />
        </div>
      </div>
    </div>
  );
}
