import { SliderField } from "../ui/SliderField";
import { ToggleField } from "../ui/ToggleField";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepExpenses({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <ToggleField
        label={t.expenses.isRentingQuestion}
        value={answers.isRenting}
        onChange={(v) => onUpdate({ isRenting: v })}
        trueLabel={t.common.yes}
        falseLabel={t.common.no}
      />

      <SliderField
        label={t.expenses.livingExpenses}
        value={answers.monthlyLivingExpenses}
        onChange={(v) => onUpdate({ monthlyLivingExpenses: v })}
        min={0}
        max={100_000}
        step={1_000}
        format={formatTHB}
        helperText={t.expenses.livingExpensesHelp}
      />

      {answers.isRenting && (
        <SliderField
          label={t.expenses.rent}
          value={answers.monthlyRent}
          onChange={(v) => onUpdate({ monthlyRent: v })}
          min={0}
          max={60_000}
          step={500}
          format={formatTHB}
          helperText={t.expenses.rentHelp}
        />
      )}

      <SliderField
        label={t.expenses.annualLumpSum}
        value={answers.annualLumpSumExpenses}
        onChange={(v) => onUpdate({ annualLumpSumExpenses: v })}
        min={0}
        max={200_000}
        step={5_000}
        format={formatTHB}
        helperText={t.expenses.annualLumpSumHelp}
      />
    </div>
  );
}
