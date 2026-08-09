import { SliderField } from "../ui/SliderField";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepIncome({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SliderField
        label={t.income.salary}
        value={answers.monthlyIncome}
        onChange={(v) => onUpdate({ monthlyIncome: v })}
        min={0}
        max={300_000}
        step={1_000}
        format={formatTHB}
        helperText={t.income.salaryHelp}
      />
      <SliderField
        label={t.income.bonus}
        value={answers.bonusAnnual}
        onChange={(v) => onUpdate({ bonusAnnual: v })}
        min={0}
        max={1_000_000}
        step={5_000}
        format={formatTHB}
        helperText={t.income.bonusHelp}
      />
    </div>
  );
}
