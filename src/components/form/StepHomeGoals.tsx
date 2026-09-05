import { SliderField } from "../ui/SliderField";
import { SelectField } from "../ui/SelectField";
import { useLanguage } from "../../i18n/LanguageContext";
import type { HomePurchasePurpose, QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepHomeGoals({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  const years = (answers.targetTimelineMonths / 12).toFixed(1);
  const purchasePurposeOptions: { value: HomePurchasePurpose; label: string }[] = [
    { value: "live-in", label: t.homeGoals.purchasePurposeOptions["live-in"] },
    { value: "investment", label: t.homeGoals.purchasePurposeOptions.investment },
  ];

  return (
    <div className="space-y-6">
      <SliderField
        label={t.homeGoals.timeline}
        value={answers.targetTimelineMonths}
        onChange={(v) => onUpdate({ targetTimelineMonths: v })}
        min={1}
        max={60}
        step={1}
        format={t.homeGoals.monthsUnit}
        helperText={t.homeGoals.timelineHelp(years)}
      />
      <SelectField
        label={t.homeGoals.purchasePurpose}
        value={answers.homePurchasePurpose}
        options={purchasePurposeOptions}
        onChange={(v) => onUpdate({ homePurchasePurpose: v })}
        helperText={t.homeGoals.purchasePurposeHelp}
      />
    </div>
  );
}
