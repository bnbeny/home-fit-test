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
    {
      value: "government-state-enterprise",
      label: t.aboutYou.employmentTypeOptions["government-state-enterprise"],
    },
    { value: "permanent", label: t.aboutYou.employmentTypeOptions.permanent },
    {
      value: "contract-temporary",
      label: t.aboutYou.employmentTypeOptions["contract-temporary"],
    },
    { value: "business-owner", label: t.aboutYou.employmentTypeOptions["business-owner"] },
    {
      value: "self-employed-freelancer",
      label: t.aboutYou.employmentTypeOptions["self-employed-freelancer"],
    },
    { value: "gig-commission", label: t.aboutYou.employmentTypeOptions["gig-commission"] },
    { value: "unemployed", label: t.aboutYou.employmentTypeOptions.unemployed },
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
