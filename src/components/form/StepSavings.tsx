import { SliderField } from "../ui/SliderField";
import { formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import type { QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepSavings({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <SliderField
        label={t.savings.totalSavings}
        value={answers.totalSavings}
        onChange={(v) => {
          // You can't earmark more for a down payment than you actually have
          // saved — if total savings drops below the current down-payment
          // pledge, pull the pledge down with it rather than letting the two
          // fields silently contradict each other.
          const patch: Partial<QuestionnaireAnswers> = { totalSavings: v };
          if (answers.availableDownPayment > v) {
            patch.availableDownPayment = v;
          }
          onUpdate(patch);
        }}
        min={0}
        max={20_000_000}
        step={1_000}
        format={formatTHB}
        helperText={t.savings.totalSavingsHelp}
      />
      <SliderField
        label={t.savings.downPayment}
        value={answers.availableDownPayment}
        onChange={(v) => onUpdate({ availableDownPayment: v })}
        min={0}
        max={answers.totalSavings}
        step={1_000}
        format={formatTHB}
        helperText={t.savings.downPaymentHelp}
      />
    </div>
  );
}
