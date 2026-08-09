import { SliderField } from "../ui/SliderField";
import { SelectField } from "../ui/SelectField";
import { useLanguage } from "../../i18n/LanguageContext";
import type { EmploymentType, QuestionnaireAnswers } from "../../types/finance";

interface StepProps {
  answers: QuestionnaireAnswers;
  onUpdate: (patch: Partial<QuestionnaireAnswers>) => void;
}

export function StepAboutYou({ answers, onUpdate }: StepProps) {
  const { t } = useLanguage();
  const employmentOptions: { value: EmploymentType; label: string }[] = [
    { value: "salaried", label: t.aboutYou.employmentTypeOptions.salaried },
    { value: "business-owner", label: t.aboutYou.employmentTypeOptions["business-owner"] },
  ];

  return (
    <div className="space-y-6">
      <SliderField
        label={t.aboutYou.age}
        value={answers.applicantAge}
        onChange={(v) => onUpdate({ applicantAge: v })}
        min={20}
        max={70}
        step={1}
        format={(v) => `${v}`}
        helperText={t.aboutYou.ageHelp}
      />

      <SelectField
        label={t.aboutYou.employmentType}
        value={answers.employmentType}
        options={employmentOptions}
        onChange={(v) => onUpdate({ employmentType: v })}
        helperText={t.aboutYou.employmentTypeHelp}
      />
    </div>
  );
}
