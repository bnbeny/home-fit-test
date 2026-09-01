import { SliderField } from "../ui/SliderField";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepDebt({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SliderField
        label={t.debt.homeLoan}
        value={answers.homeLoanMonthly}
        onChange={(v) => onUpdate({ homeLoanMonthly: v })}
        min={0}
        max={150_000}
        step={1_000}
        format={formatTHB}
        helperText={t.debt.homeLoanHelp}
      />
      <SliderField
        label={t.debt.otherDebt}
        value={answers.otherDebtMonthly}
        onChange={(v) => onUpdate({ otherDebtMonthly: v })}
        min={0}
        max={100_000}
        step={1_000}
        format={formatTHB}
        helperText={t.debt.otherDebtHelp}
      />
    </div>
  );
}
