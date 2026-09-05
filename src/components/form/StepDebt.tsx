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

      {/* Set off by a divider — same treatment as StepIncome's co-borrower
          section: a co-borrower's debt is a different person's obligation,
          not another "your own debt" field. */}
      <div className="border-t border-black/10 pt-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t.debt.coBorrowerSectionLabel}
        </p>
        <SliderField
          label={t.debt.coBorrowerDebt}
          value={answers.coBorrowerDebtMonthly}
          onChange={(v) => onUpdate({ coBorrowerDebtMonthly: v })}
          min={0}
          max={150_000}
          step={1_000}
          format={formatTHB}
          helperText={t.debt.coBorrowerDebtHelp}
        />
      </div>
    </div>
  );
}
