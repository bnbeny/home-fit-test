import { SliderField } from "../ui/SliderField";
import { SelectField } from "../ui/SelectField";
import { calculateMaxLoanTermYears, formatPercent, formatTHB } from "../../lib/calculations";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_ASSUMPTIONS } from "../../types/finance";
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
  const loanTenureYears = calculateMaxLoanTermYears(
    answers.applicantAge,
    answers.targetTimelineMonths,
    DEFAULT_ASSUMPTIONS,
  );

  return (
    <div className="space-y-6">
      <SliderField
        label={t.homeGoals.targetPrice}
        value={answers.targetHomePrice}
        onChange={(v) => onUpdate({ targetHomePrice: v })}
        min={500_000}
        max={20_000_000}
        step={1_000}
        format={formatTHB}
      />
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

      <div className="space-y-3 rounded-lg bg-surface-sunken p-4 text-sm text-ink-muted">
        <p>
          {t.homeGoals.loanTenureNote(
            loanTenureYears,
            answers.applicantAge,
            DEFAULT_ASSUMPTIONS.maxAgeAtLoanMaturity,
            Math.ceil(answers.targetTimelineMonths / 12),
          )}
        </p>
        <p>{t.homeGoals.appreciationNote(formatPercent(answers.expectedAppreciationPct))}</p>
        <p>{t.homeGoals.assumptionsNote}</p>
      </div>
    </div>
  );
}
